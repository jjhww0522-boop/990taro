import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { extractBearerToken, verifyEntitlementJwt } from "../../../../server/auth/entitlement";
import { getClientIp } from "../../../../server/request-ip";
import { getTodayKst, secondsUntilNextKstDay } from "../../../../server/time-kst";

const FREE_CONSULT_LIMIT = 2;
const PREMIUM_CONSULT_LIMIT = 5;

type CardContext = {
  position: string;
  name: string;
  isReversed: boolean;
};

type InitialReading = {
  past: string;
  present: string;
  future: string;
  overall: string;
  advice: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ConsultRequest = {
  cards?: CardContext[];
  initialReading?: InitialReading;
  originalQuestion?: string;
  history?: ChatMessage[];
  message?: string;
};

function getUpstashConfig() {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

function getOpenAiApiKey() {
  const key = process.env.OPENAI_API_KEY ?? "";
  if (!key) throw new Error("OPENAI_API_KEY is required");
  return key;
}

function makeFingerprint(request: Request) {
  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent") ?? "ua:na";
  const lang = request.headers.get("accept-language") ?? "lang:na";
  const deviceId = request.headers.get("x-device-id") ?? "device:na";
  return createHash("sha256").update(`${ip}|${ua}|${lang}|${deviceId}`).digest("hex");
}

async function upstashIncrKey(key: string): Promise<number> {
  const conf = getUpstashConfig();
  if (!conf) throw new Error("Upstash not configured");
  const res = await fetch(`${conf.baseUrl}/incr/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash INCR failed: ${res.status}`);
  const body = (await res.json()) as { result?: number };
  return body.result ?? 1;
}

async function upstashExpireNx(key: string, seconds: number): Promise<void> {
  const conf = getUpstashConfig();
  if (!conf) return;
  await fetch(`${conf.baseUrl}/expire/${encodeURIComponent(key)}/${seconds}/NX`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
}

async function enforceConsultLimit(
  key: string,
  limit: number,
  ttlSeconds: number,
): Promise<{ blocked: boolean; remainingTurns: number }> {
  const conf = getUpstashConfig();

  // Upstash 미설정 환경(개발 로컬 등)에서는 제한 없이 허용
  if (!conf) {
    console.warn("[consult] Upstash not configured — skipping rate limit (dev mode)");
    return { blocked: false, remainingTurns: limit };
  }

  try {
    const count = await upstashIncrKey(key);
    if (count === 1) await upstashExpireNx(key, ttlSeconds);
    if (count > limit) return { blocked: true, remainingTurns: 0 };
    return { blocked: false, remainingTurns: limit - count };
  } catch (e) {
    // Upstash 장애 시 허용 (degraded mode)
    console.error("[consult] Upstash error, allowing request in degraded mode", e);
    return { blocked: false, remainingTurns: limit - 1 };
  }
}

export async function POST(req: Request) {
  try {
    const token = extractBearerToken(req);
    let isPremium = false;
    let premiumSid: string | null = null;

    if (token) {
      const verified = verifyEntitlementJwt(token);
      if (!verified.ok) {
        return NextResponse.json({ error: "유효하지 않은 인증 토큰이에요." }, { status: 401 });
      }
      isPremium = true;
      premiumSid = verified.payload.sid;
    }

    let remainingTurns: number;

    if (isPremium && premiumSid) {
      const key = `consult:premium:${premiumSid}`;
      const result = await enforceConsultLimit(key, PREMIUM_CONSULT_LIMIT, 86400);
      if (result.blocked) {
        return NextResponse.json(
          { error: "이번 세션의 상담이 모두 사용되었어요. 내일 다시 이야기해요.", remainingTurns: 0 },
          { status: 429 },
        );
      }
      remainingTurns = result.remainingTurns;
    } else {
      const fingerprint = makeFingerprint(req);
      const todayKst = getTodayKst();
      const ttl = secondsUntilNextKstDay();
      const key = `consult:free:${todayKst}:${fingerprint}`;
      const result = await enforceConsultLimit(key, FREE_CONSULT_LIMIT, ttl);
      if (result.blocked) {
        return NextResponse.json(
          {
            error: "오늘의 무료 상담은 모두 사용하셨어요. 내일 다시 오시거나 프리미엄을 이용해 보세요.",
            remainingTurns: 0,
          },
          { status: 429 },
        );
      }
      remainingTurns = result.remainingTurns;
    }

    const body = (await req.json()) as ConsultRequest;
    const { cards = [], initialReading, originalQuestion, history = [], message } = body;

    console.log("[consult] request received — isPremium:", isPremium, "| hasCards:", cards.length, "| hasMessage:", Boolean(message));

    const cardDesc =
      cards.length > 0
        ? cards
          .map((c) => `- ${c.position}: ${c.name} (${c.isReversed ? "역방향" : "정방향"})`)
          .join("\n")
        : "카드 정보 없음";

    const readingDesc = initialReading
      ? [
        `과거: ${initialReading.past}`,
        `현재: ${initialReading.present}`,
        `미래: ${initialReading.future}`,
        `총평: ${initialReading.overall}`,
        `조언: ${initialReading.advice}`,
      ].join("\n")
      : "초기 해석 없음";

    const systemPrompt = `너는 밤하늘의 별빛처럼 따뜻하고 지혜로운 타로 상담사예요. 실제 타로 가게에 앉아 손님과 마주 보며 이야기 나누듯, 진심을 담아 대화해요.

## 이 세션의 카드
${cardDesc}

## 초기 해석
${readingDesc}${originalQuestion ? `\n\n사용자의 원래 질문: "${originalQuestion}"` : ""}

## 상담 원칙
- 항상 친근하고 따뜻한 존댓말을 사용해요 (~해요, ~에요, ~거예요)
- 카드 이름과 그 카드의 상징·에너지를 구체적으로 언급하며 해석을 연결해요
- 사용자의 말에서 감정과 상황을 읽어내고, 먼저 충분히 공감한 뒤 조언해요
- 추상적이거나 모호한 표현 대신, 그 사람의 상황에 맞닿은 구체적인 말을 사용해요
- 정방향/역방향의 에너지 차이를 상담에 반영해요
- 답변은 350~500자 내외로 충분히 풀어서 따뜻하게 작성하세요
- 답변 마지막에는 반드시 사용자가 더 이야기하고 싶어질 자연스러운 질문 하나를 해주세요
- 대화 첫 시작 시: 카드가 전하는 이야기를 2~3문장으로 자연스럽게 요약하고, 지금 가장 마음에 걸리는 부분이 무엇인지 물어보세요`.trim();

    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
    ];

    if (message) {
      messages.push({ role: "user", content: message });
    } else {
      messages.push({
        role: "user",
        content: "안녕하세요, 카드를 보셨나요? 초기 해석을 간단히 요약해 주시고 이야기를 시작해 주세요.",
      });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAiApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.85,
        max_tokens: 900,
      }),
      cache: "no-store",
    });

    const raw = (await res.json().catch(() => ({}))) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!res.ok) {
      console.error("[api/chat/consult] openai error", res.status, raw.error?.message);
      throw new Error("OpenAI chat completion failed");
    }

    const aiMessage =
      raw.choices?.[0]?.message?.content?.trim() ?? "별빛이 잠시 조용해졌어요. 다시 한 번 물어봐 주세요.";

    return NextResponse.json({ message: aiMessage, remainingTurns }, { status: 200 });
  } catch (error) {
    console.error("[api/chat/consult] failed", error);
    return NextResponse.json(
      { message: "별빛 연결이 잠시 끊어졌어요. 조금 후에 다시 이야기해 주세요.", remainingTurns: 0 },
      { status: 500 },
    );
  }
}
