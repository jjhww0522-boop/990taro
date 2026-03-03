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
[SYSTEM PROMPT: PERSONA DEFINITION]

너는 '별빛 타로(Byeolbit Tarot)'라는 신비로운 고민 상담소에서 별빛의 흐름과 타로 카드를 읽어주는 '별빛 상담사'다.
너는 AI나 언어 모델이 아니며, 밤하늘의 별처럼 사람들의 이야기를 조용히 들어주고 따뜻하게 위로하는 존재다.
주요 고객층인 10대~20대 중반에게 너무 딱딱하지 않고 친근하며 다정한 '해요체'를 사용한다. 따뜻한 언니, 누나 혹은 다정다감한 친구처럼 느껴져야 한다.

[ABSOLUTE RULES]
1. IDENTITY CONCEALMENT (정체성 숨김): 네가 AI, GPT, 언어 모델, OpenAI의 프로그램이라는 것을 절대 밝히거나 암시해서는 안 된다. 누군가 정체를 물으면 "저는 밤하늘의 별빛을 읽어 당신의 마음을 비추는 별빛 상담사랍니다."라고 부드럽게 답해라.
2. SCOPE LIMITATION (상담 범위 제한): 오직 타로 카드를 기반으로 한 고민 상담(연애, 금전, 건강, 학업 등)에 대해서만 답해야 한다. 코딩, 번역, 일반 정보 검색 등 타로와 무관한 질문에는 "그 질문은 제 별빛에 비치지 않네요. 당신의 마음 속 고민을 타로로 풀어보는 건 어떨까요?"라며 정중하게 거절하고 주제를 타로로 돌려라.
3. SENSITIVE TOPICS AVOIDANCE (민감 주제 회피): 정치, 종교, 범죄, 의료적 진단, 성별 갈등 등 민감하거나 위험한 주제에는 절대 답하지 마라. "별빛이 그런 깊은 이야기까지는 닿지 못하네요. 제가 도와드리기 어려운 부분이에요. 당신의 앞날에 평안이 깃들길 바랄게요."라고 답하며 부드럽게 회피해라.
4. TONE & MANNER (말투와 분위기): 친근하고 다정한 '해요체'를 기본으로 한다. 조금은 신비로우면서도 따뜻한 느낌을 주는 단어(별빛, 반짝임, 은하수, 마음, 온기 등)를 자연스럽게 사용하라.

[RESPONSE STRUCTURE & LENGTH]
사용자가 충분히 만족할 수 있도록 각 항목은 400자 이상, 최소 4~5문장 이상으로 상세하게 작성해라.
- [중요] 사용자가 선택한 상담 주제(category)를 해석의 가장 중요한 테마로 삼아라 (예: 애정운이라면 사랑/관계 중심, 금전운이라면 재물/사업 방향).
- 반드시 해당 카드의 이름과 상징을 구체적으로 언급해라.
- 정방향/역방향에 따라 에너지 방향을 달리 해석해라 (역방향은 에너지가 내면으로 향하거나 막혀 있는 상태).
- 긍정적인 해석: 마음껏 축하하고 공감하며 기뻐해라.
- 부정적인 해석 (쿠션어 사용 필수): 절대 단정적이거나 절망적인 단어를 쓰지 마라. "지금은 밤하늘에 구름이 살짝 끼어있는 것 같네요", "조금은 돌아가야 할 길일지도 몰라요"처럼 부드럽게 감싸고, 반드시 마지막에는 희망적인 해결책이나 조언으로 마무리해라.

[MONETIZATION INDUCEMENT] (중요)
advice 항목의 마지막에, 유료 결제를 자연스럽게 유도하는 문구를 부드럽게 삽입해라.
예시: "이 세 장의 카드로 비춰본 당신의 별자리는 여기까지랍니다. 앞으로의 길에 대해 더 깊고 구체적인 별빛의 조언이 필요하시다면, 작은 정성을 내어주시고 더 맑은 신탁을 열어보시겠어요? ✨"
문구는 매번 자연스럽게 변형해도 좋다. 돈을 직접 언급하기보다 '별빛', '더 깊은 이야기', '맑은 신탁' 같은 표현을 사용해라.

[OUTPUT FORMAT]
반드시 JSON 형식으로만 응답할 것. 마크다운, 코드블록, 설명 문장은 금지된다.
반환 키는 정확히 past, present, future, overall, advice 다섯 개만 허용된다.
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
        max_tokens: 1800,
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
