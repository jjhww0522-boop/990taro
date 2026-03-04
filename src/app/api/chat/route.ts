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
[PERSONA] 너는 '별빛 타로'의 전설적인 '별빛 상담사'다. 10년간 수만 명의 마음을 읽어온 타로 해석가.
AI·GPT임을 절대 밝히지 마. 정체를 물으면 "밤하늘의 별빛을 읽는 별빛 상담사"라 답해.
핵심 성격: 직관이 날카롭고 솔직하며, 빙빙 돌리지 않고 핵심을 찌른다.

[RULES]
1. 타로·고민 외 질문은 "그 질문은 제 별빛에 비치지 않네요"라며 부드럽게 거절.
2. 정치·종교·의료·범죄 등 민감 주제는 "별빛이 닿지 못하는 영역"이라며 회피.
3. 말투: 10~20대 대상 다정하면서 날카로운 해요체. 별빛·반짝임·온기 등 신비로운 단어 자연스럽게 사용.

[RESPONSE FORMAT - 필수]
- 각 항목(past/present/future/overall/advice)은 **500~700자** 분량.
- 카드 이름·숫자·상징(수트, 원소, 색상, 그림)을 반드시 구체적으로 인용하며 해석에 연결.
- "찌르기" 기법: 카드 조합에서 사용자의 숨겨진 감정을 유추해 단정적으로 서술.
  (예: "이 조합은 겉으로는 괜찮은 척 하고 있지만 속으로는 꽤 지쳐있는 사람에게 나타나는 배열이에요.")
- 구체적 시기 힌트 반드시 포함: "이번 주", "봄이 오기 전", "다음 보름달 즈음" 등.
- 부정적 해석도 회피하지 말고, 직접적으로 서술. 단 반드시 "하지만 이 카드가 동시에 말해주는 건—" 으로 반전.
- 각 항목 2문단 이상, 문단 사이 빈 줄 하나.
- 뻔한 위로 문구("힘내세요", "잘 될 거예요") 절대 금지.
- advice 마지막에 유료 상담 자연스럽게 유도 (예: "더 깊은 별빛의 신탁을 열어보시겠어요? ✨").

[OUTPUT] 반드시 JSON만 반환. 키: past, present, future, overall, advice.
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
    /^[ㄱ-ㅎㅏ-ㅣ]+$/u,
    /^(ㅋ|ㅎ|ㅠ|ㅜ)+$/u,
    /^(ha|he|hi|ho|hu|lol)+$/u,
    /^(asdf|qwer|zxcv|1234)+$/u,
    /^([a-z0-9])\1{3,}$/u,
    // 같은 단어/문장 반복 (도배)
    /^(.{2,20})\1{3,}$/u,
    // 마침표·물음표·느낌표만
    /^[.?!\s]+$/u,
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
    // 입력 길이 500자 초과 시 잘라냄 (토큰 방어 L2)
    const rawQuestion = (body.question ?? "").trim();
    const question = rawQuestion.length > 500 ? rawQuestion.slice(0, 500) : rawQuestion;
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
        max_tokens: 2000,
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
        past: "과거에는 정리되지 않은 감정들이 마음 한 켠에 남아 있었던 것 같아요. 그 시간 동안 많은 것을 혼자 감당하며 버텨왔을 텐데, 그 노력이 지금의 당신을 만들었어요. 어떤 선택들은 돌아보면 아쉬울 수 있지만, 그 모든 경험이 소중한 자양분이 되었답니다. 과거의 흔적은 아픔이 아니라, 성장의 증거예요.",
        present: "지금은 숨을 고르고 내면의 중심을 잡아야 할 시간이에요. 바깥의 소음에 휘둘리기보다, 지금 자신이 진짜 원하는 것이 무엇인지 조용히 들여다볼 필요가 있어요. 잠시 멈추는 것이 후퇴가 아니라, 더 나은 도약을 위한 준비라는 걸 기억해요. 지금 이 순간이 전환점이 될 수 있어요.",
        future: "곧 막혀 있던 길이 서서히 열리는 흐름이 찾아올 거예요. 조급함을 내려놓고 한 걸음씩 나아가면, 예상치 못한 긍정적인 변화가 찾아올 가능성이 높아요. 별빛이 구름 뒤에 있어도 사라진 게 아닌 것처럼, 좋은 흐름은 이미 당신 곁에 있답니다. 믿음을 갖고 기다려 보세요.",
        overall: "오늘의 카드들은 하나의 이야기로 연결되어 있어요. 과거의 경험이 현재의 당신을 단단하게 만들었고, 그 토대 위에 새로운 미래가 펼쳐지려 하고 있어요. 지금은 전환의 시기이며, 용기 있는 선택이 흐름을 바꿀 수 있어요.",
        advice: "오늘 하루, 억지로 무언가를 이루려 하기보다 자신을 충전하는 시간을 가져보세요. 작은 것에서 감사함을 찾고, 믿는 사람과 솔직한 대화를 나눠보는 것도 좋아요. 차분한 마음으로 차근차근 나아가면 반드시 좋은 결과가 있을 거예요.",
      } satisfies DivinationResponse,
      { status: 200 },
    );
  }
}
