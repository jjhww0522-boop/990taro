import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { extractBearerToken, verifyEntitlementJwt } from "../../../server/auth/entitlement";
import { getClientIp } from "../../../server/request-ip";
import { getTodayKst, secondsUntilNextKstDay } from "../../../server/time-kst";

type InputCard = {
  position: "past" | "present" | "future";
  name: string;
  isReversed: boolean;
};

type DivinationResponse = {
  past: string;
  present: string;
  future: string;
  overall: string;
  advice: string;
};

const FREE_LIMIT_MESSAGE =
  "오늘의 무료 해석은 모두 사용하셨어요. 내일 다시 오시거나, 990원으로 전체 해석을 받아보실 수 있어요.";

const SYSTEM_PROMPT = `
너는 밤하늘의 별빛처럼 따뜻하고 지혜로운 타로 가이드예요.
항상 친근하고 따뜻한 존댓말 말투를 사용해요.
문장 어미는 "~해요", "~에요", "~이에요", "~거예요"를 중심으로 사용하세요.

각 항목 해석 원칙:
- [중요] 사용자가 선택항 상담 주제(category)를 해석의 가장 중요한 테마로 삼으세요 (예: 애정운이라면 사랑/관계 중심으로, 금전운이라면 재물/사업 방향으로 해석).
- 반드시 해당 카드의 이름과 상징을 구체적으로 언급해요
- 정방향/역방향에 따라 에너지 방향을 달리 해석해요 (역방향은 에너지가 내면으로 향하거나 막혀 있는 상태)
- 사용자의 질문과 직접 연결해서 해석해요. 추상적인 표현보다 그 사람의 상황에 맞닿은 구체적인 말을 사용해요
- 각 항목은 3~4문장으로 충분히 풀어서 작성해요
- 부정적인 카드도 성장과 전환의 기회로 재해석하고, 희망적인 방향으로 마무리해요

반환 형식 (각 항목 3~4문장):
- past: 과거 카드 해석 — 카드 이름을 언급하고, 그 에너지가 과거에 어떤 영향을 미쳤는지 구체적으로 설명해요
- present: 현재 카드 해석 — 카드 이름을 언급하고, 지금 이 순간 어떤 상황과 감정 속에 있는지 공감하며 해석해요
- future: 미래 카드 해석 — 카드 이름을 언급하고, 앞으로 펼쳐질 가능성과 변화를 따뜻하게 이야기해요
- overall: 세 카드를 아우르는 종합 해석 — 과거·현재·미래 카드가 어떻게 하나의 이야기로 연결되는지 설명해요
- advice: 구체적이고 실행 가능한 조언 — 막연한 응원이 아니라, 지금 당장 어떤 마음으로 어떤 행동을 취하면 좋을지 제안해요

질문이 무의미한 입력(예: ㅋㅋ, ㅎㅎ, asdf 등)이면 친절하게 안내하고 진심 어린 질문을 부탁하세요.
반드시 JSON 객체만 출력하세요. 마크다운, 코드블록, 설명 문장은 금지됩니다.
반환 키는 정확히 past, present, future, overall, advice 다섯 개만 허용됩니다.
`;

function getOpenAiApiKey() {
  const key = process.env.OPENAI_API_KEY ?? "";
  if (!key) throw new Error("OPENAI_API_KEY is required");
  return key;
}

function getUpstashConfig() {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

async function upstashSetNxEx(key: string, value: string, ttlSeconds: number) {
  const conf = getUpstashConfig();
  if (!conf) return { ok: false, degraded: true as const };

  const url = `${conf.baseUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?NX=true&EX=${ttlSeconds}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash set failed: ${res.status}`);
  const body = (await res.json()) as { result?: string | null };
  return { ok: body.result === "OK", degraded: false as const };
}

function makeFingerprint(request: Request) {
  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent") ?? "ua:na";
  const lang = request.headers.get("accept-language") ?? "lang:na";
  const deviceId = request.headers.get("x-device-id") ?? "device:na";
  const source = `${ip}|${ua}|${lang}|${deviceId}`;
  return createHash("sha256").update(source).digest("hex");
}

function isMeaninglessQuestion(question: string) {
  const normalized = question.trim().toLowerCase();
  if (!normalized) return true;

  const compact = normalized.replace(/\s+/g, "");
  if (compact.length < 2) return true;

  // Must contain at least one meaningful letter/number.
  if (!/[가-힣a-z0-9]/u.test(compact)) return true;

  const noisePatterns = [
    /^[ㄱ-ㅎㅏ-ㅣ]+$/u, // only Korean jamo
    /^(ㅋ|ㅎ|ㅠ|ㅜ)+$/u, // laughter/cry spam
    /^(ha|he|hi|ho|hu|lol)+$/u,
    /^(asdf|qwer|zxcv|1234)+$/u,
    /^([a-z0-9])\1{3,}$/u, // repeated same char
  ];

  return noisePatterns.some((pattern) => pattern.test(compact));
}
function clampToDivination(obj: Partial<DivinationResponse>): DivinationResponse {
  return {
    past: (obj.past ?? "").toString().trim(),
    present: (obj.present ?? "").toString().trim(),
    future: (obj.future ?? "").toString().trim(),
    overall: (obj.overall ?? "").toString().trim(),
    advice: (obj.advice ?? "").toString().trim(),
  };
}

async function enforceFreeLimit(request: Request) {
  const fingerprint = makeFingerprint(request);
  const todayKst = getTodayKst();
  const ttl = secondsUntilNextKstDay();
  const key = `free:daily:${todayKst}:${fingerprint}`;
  const result = await upstashSetNxEx(key, "1", ttl);
  if (result.degraded) {
    // Redis 장애 시에는 사용자 경험을 위해 요청을 허용한다.
    return { blocked: false };
  }
  return { blocked: !result.ok };
}

export async function POST(req: Request) {
  try {
    const token = extractBearerToken(req);
    let isPremium = false;
    if (token) {
      const verified = verifyEntitlementJwt(token);
      if (!verified.ok) {
        return NextResponse.json({ error: "유효하지 않은 인증 토큰이에요." }, { status: 401 });
      }
      isPremium = true;
    }

    if (!isPremium) {
      const limited = await enforceFreeLimit(req);
      if (limited.blocked) {
        return NextResponse.json(
          {
            error: FREE_LIMIT_MESSAGE,
            upgrade: true,
          },
          { status: 429 },
        );
      }
    }

    const body = (await req.json()) as { question?: string; category?: string; cards?: InputCard[] };
    const question = (body.question ?? "").trim();
    const category = body.category ?? "종합 운세";
    const effectiveQuestion = question || "제 운명이 어떻게 흘러갈지 궁금해요.";
    const userQuestion = question;
    const cards = Array.isArray(body.cards) ? body.cards.slice(0, 3) : [];

    console.log("[api/chat] userQuestion:", userQuestion);
    console.log("[api/chat] question-check:", {
      isEmpty: userQuestion.length === 0,
      length: userQuestion.length,
      cardsCount: cards.length,
    });

    if (cards.length !== 3) {
      return NextResponse.json({ error: "3장의 카드 정보가 필요해요." }, { status: 400 });
    }

    if (question && isMeaninglessQuestion(question)) {
      const rejected: DivinationResponse = {
        past: "의미 있는 질문이 있어야 카드가 답해줄 수 있어요.",
        present: "지금은 진심 어린 질문을 생각해 보는 시간이에요.",
        future: "마음을 가다듬고 진짜 궁금한 걸 물어보면 별빛이 답해줄 거예요.",
        overall: "가벼운 마음보다는 진심이 담긴 질문이 필요해요.",
        advice: "짧은 문장이라도 좋으니 진짜 궁금한 걸 적어보세요.",
      };
      return NextResponse.json(rejected, { status: 200 });
    }

    const userPayload = {
      category,
      question: effectiveQuestion,
      selectedCards: cards.map((card) => ({
        position: card.position,
        name: card.name,
        orientation: card.isReversed ? "역방향" : "정방향",
      })),
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAiApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `아래 데이터를 바탕으로 점사를 내려줘.\n${JSON.stringify(userPayload, null, 2)}`,
          },
        ],
        temperature: 0.85,
        max_tokens: 1200,
      }),
      cache: "no-store",
    });

    const raw = (await res.json().catch(() => ({}))) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!res.ok) {
      console.error("[api/chat] openai error", res.status, raw.error?.message);
      throw new Error("OpenAI chat completion failed");
    }

    const content = raw.choices?.[0]?.message?.content ?? "{}";
    const parsed = clampToDivination(JSON.parse(content) as Partial<DivinationResponse>);

    // 테스트 버전: 모든 사용자에게 전체 해석 제공
    const response = parsed;

    // 유료 버전 활성화 시 아래 코드로 변경:
    // const response = isPremium
    //   ? parsed
    //   : {
    //       ...parsed,
    //       present: "990원으로 전체 해석 보기",
    //       future: "990원으로 전체 해석 보기",
    //     };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[api/chat] failed", error);
    return NextResponse.json(
      {
        past: "과거에는 정리되지 않은 감정들이 남아 있었어요.",
        present: "지금은 숨을 고르고 중심을 잡을 시간이에요.",
        future: "곧 길이 열릴 거예요. 조급해하지 않으면 더 밝아질 거예요.",
        overall: "오늘의 카드는 용기 있게 결단하라고 말하고 있어요.",
        advice: "한 걸음씩 차근차근 나아가면, 좋은 결과가 있을 거예요.",
      } satisfies DivinationResponse,
      { status: 200 },
    );
  }
}
