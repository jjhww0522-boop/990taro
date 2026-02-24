import { secondsUntilNextKstDay } from "./time-kst";

const FREE_DAILY_LIMIT = 5;
const localCounter = new Map<string, { count: number; resetAt: number }>();

function getRedisConfig() {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

async function upstashIncrKey(key: string) {
  const conf = getRedisConfig();
  if (!conf) throw new Error("Upstash Redis is not configured.");

  const res = await fetch(`${conf.baseUrl}/incr/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash INCR failed: ${res.status}`);
  const body = (await res.json()) as { result?: number };
  if (typeof body.result !== "number") throw new Error("Unexpected Upstash INCR response.");
  return body.result;
}

async function upstashExpireNx(key: string, seconds: number) {
  const conf = getRedisConfig();
  if (!conf) throw new Error("Upstash Redis is not configured.");

  const res = await fetch(`${conf.baseUrl}/expire/${encodeURIComponent(key)}/${seconds}/NX`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash EXPIRE failed: ${res.status}`);
}

async function hitUpstash(ip: string, todayKst: string) {
  const retryAfterSec = secondsUntilNextKstDay();
  const key = `rl:free:${todayKst}:${ip}`;
  const count = await upstashIncrKey(key);
  if (count === 1) {
    await upstashExpireNx(key, retryAfterSec);
  }
  return {
    allowed: count <= FREE_DAILY_LIMIT,
    retryAfterSec,
  };
}

function hitLocalFallback(ip: string, todayKst: string) {
  const retryAfterSec = secondsUntilNextKstDay();
  const key = `rl:free:${todayKst}:${ip}`;
  const now = Math.floor(Date.now() / 1000);

  const entry = localCounter.get(key);
  if (!entry || entry.resetAt <= now) {
    localCounter.set(key, { count: 1, resetAt: now + retryAfterSec });
    return { allowed: true, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: entry.count <= FREE_DAILY_LIMIT, retryAfterSec: Math.max(1, entry.resetAt - now) };
}

export async function enforceFreeRateLimitByIp(ip: string, todayKst: string) {
  const useUpstash = (process.env.RATE_LIMIT_PROVIDER ?? "upstash").toLowerCase() === "upstash";
  if (!useUpstash) return hitLocalFallback(ip, todayKst);

  try {
    return await hitUpstash(ip, todayKst);
  } catch (error) {
    console.error("[free-rate-limit] degradedMode=true using local fallback", {
      error: error instanceof Error ? error.message : "unknown",
      degradedMode: true,
    });
    return hitLocalFallback(ip, todayKst);
  }
}
