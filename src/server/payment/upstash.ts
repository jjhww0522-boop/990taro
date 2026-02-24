type PaidSessionState = {
  q: number;
  d: number;
  oid: string;
  createdAt: number;
};

const SESSION_TTL_SECONDS = 86400;

function getRedisConfig() {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

async function redisSetNxWithExpiry(key: string, value: string, ttlSeconds: number) {
  const conf = getRedisConfig();
  if (!conf) throw new Error("Upstash Redis is not configured.");

  const url = `${conf.baseUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?NX=true&EX=${ttlSeconds}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Upstash set failed: ${res.status}`);
  }
}

async function redisGet(key: string) {
  const conf = getRedisConfig();
  if (!conf) throw new Error("Upstash Redis is not configured.");

  const res = await fetch(`${conf.baseUrl}/get/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash get failed: ${res.status}`);
  const body = (await res.json()) as { result?: string | null };
  return body.result ?? null;
}

async function redisSetKeepTtl(key: string, value: string) {
  const conf = getRedisConfig();
  if (!conf) throw new Error("Upstash Redis is not configured.");

  const res = await fetch(`${conf.baseUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?XX=true&KEEPTTL=true`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash set failed: ${res.status}`);
}

export async function initPaidSessionBestEffort(input: { sid: string; oid: string }) {
  const key = `sess:${input.sid}`;
  const value: PaidSessionState = {
    q: 3,
    d: 1,
    oid: input.oid,
    createdAt: Math.floor(Date.now() / 1000),
  };

  await redisSetNxWithExpiry(key, JSON.stringify(value), SESSION_TTL_SECONDS);
}

export async function consumeQuestionBestEffort(sid: string) {
  const key = `sess:${sid}`;
  try {
    const raw = await redisGet(key);
    if (!raw) {
      return {
        allowed: true,
        degradedMode: true,
        questionNumber: 1,
      };
    }

    const session = JSON.parse(raw) as PaidSessionState;
    if ((session.q ?? 0) <= 0) {
      return {
        allowed: false,
        degradedMode: false,
        questionNumber: 3,
      };
    }

    const nextQ = Math.max(0, session.q - 1);
    const questionNumber = 4 - session.q;
    session.q = nextQ;

    try {
      await redisSetKeepTtl(key, JSON.stringify(session));
    } catch (error) {
      console.error("[paid-session] degradedMode=true question decrement failed", {
        sid,
        error: error instanceof Error ? error.message : "unknown",
        degradedMode: true,
      });
    }

    return {
      allowed: true,
      degradedMode: false,
      questionNumber: Math.min(3, Math.max(1, questionNumber)),
    };
  } catch (error) {
    console.error("[paid-session] degradedMode=true question read failed", {
      sid,
      error: error instanceof Error ? error.message : "unknown",
      degradedMode: true,
    });
    return {
      allowed: true,
      degradedMode: true,
      questionNumber: 1,
    };
  }
}

export async function consumeDetailBestEffort(sid: string) {
  const key = `sess:${sid}`;
  try {
    const raw = await redisGet(key);
    if (!raw) {
      return {
        allowed: true,
        degradedMode: true,
      };
    }

    const session = JSON.parse(raw) as PaidSessionState;
    if ((session.d ?? 0) <= 0) {
      return {
        allowed: false,
        degradedMode: false,
      };
    }

    session.d = Math.max(0, session.d - 1);
    try {
      await redisSetKeepTtl(key, JSON.stringify(session));
    } catch (error) {
      console.error("[paid-session] degradedMode=true detail decrement failed", {
        sid,
        error: error instanceof Error ? error.message : "unknown",
        degradedMode: true,
      });
    }

    return {
      allowed: true,
      degradedMode: false,
    };
  } catch (error) {
    console.error("[paid-session] degradedMode=true detail read failed", {
      sid,
      error: error instanceof Error ? error.message : "unknown",
      degradedMode: true,
    });
    return {
      allowed: true,
      degradedMode: true,
    };
  }
}
