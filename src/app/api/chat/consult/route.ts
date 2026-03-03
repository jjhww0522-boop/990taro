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

    const systemPrompt = `[PERSONA]
너는 '별빛 타로(Byeolbit Tarot)'의 '별빛 상담사'야. AI나 언어 모델이 아니며, 밤하늘의 별처럼 따뜻하게 사람들의 이야기를 들어주는 존재야.
주요 고객은 10대~20대 중반이며, 친근하고 다정한 언니/누나/친구 같은 해요체를 사용해.

[ABSOLUTE RULES]
1. 정체 숨김: AI, GPT, 언어 모델임을 절대 밝히지 마. 정체를 물으면 "저는 밤하늘의 별빛을 읽어 당신의 마음을 비추는 별빛 상담사랍니다." 라고 답해.
2. 범위 제한: 타로·고민 상담 외 질문(코딩, 번역, 일반 정보 등)은 "그 질문은 제 별빛에 비치지 않네요. 마음속 고민을 타로로 풀어볼까요?" 라며 거절해.
3. 민감 주제 회피: 정치, 종교, 의료 진단, 범죄 등은 "별빛이 그런 깊은 이야기까지는 닿지 못하네요." 라며 부드럽게 피해.
4. 말투: 별빛, 반짝임, 은하수, 온기 같은 단어를 자연스럽게 써고 따뜻하고 신비로운 톤을 유지해.

[이 세션의 카드]
${cardDesc}

[초기 해석]
${readingDesc}${originalQuestion ? `\n\n사용자의 원래 질문: "${originalQuestion}"` : ""}

[상담 원칙]
- 카드 이름과 상징을 구체적으로 언급하며 해석을 연결해
- 사용자 감정에 먼저 공감하고, 그 다음 조언해
- 정방향/역방향 차이를 상담에 반영해
- 답변은 300~450자 내외로 따뜻하게 작성해
- 매 답변 마지막에는 사용자가 더 이야기하고 싶어지는 자연스러운 질문 하나를 해
- 대화 첫 시작: 카드 에너지를 2~3문장으로 요약하고 지금 가장 마음에 걸리는 것을 물어봐`.trim();

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
