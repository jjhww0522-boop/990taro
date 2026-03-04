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

type SelectedMinorCard = {
  name: string;
  original: string;
  isReversed: boolean;
  keyword: string;
};

type ConsultRequest = {
  cards?: CardContext[];
  initialReading?: InitialReading;
  originalQuestion?: string;
  history?: ChatMessage[];
  message?: string;
  selectedMinorCard?: SelectedMinorCard;
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
    const { cards = [], initialReading, originalQuestion, history = [], message, selectedMinorCard } = body;

    // 입력 길이 500자 초과 시 잘라냄 (토큰 방어 L2)
    const rawMsg = (message ?? "").trim();
    const safeMessage = rawMsg.length > 500 ? rawMsg.slice(0, 500) : rawMsg;

    // 히스토리 최근 6턴(12개 메시지)만 전송 (토큰 절감)
    const recentHistory = history.slice(-12);

    console.log("[consult] request received — isPremium:", isPremium, "| hasCards:", cards.length, "| hasMessage:", Boolean(safeMessage));

    const cardDesc =
      cards.length > 0
        ? cards
          .map((c) => `- ${c.position}: ${c.name} (${c.isReversed ? "역" : "정"})`)
          .join("\n")
        : "카드 정보 없음";

    // 초기 해석은 핵심 키워드만 압축 전달 (토큰 절감)
    const readingDesc = initialReading
      ? `과거: ${initialReading.past.slice(0, 60)}...\n현재: ${initialReading.present.slice(0, 60)}...\n미래: ${initialReading.future.slice(0, 60)}...\n조언 핵심: ${initialReading.advice.slice(0, 60)}...`
      : "초기 해석 없음";

    // 클라이언트에서 선택한 마이너 카드가 있으면 시스템 프롬프트에 삽입
    let minorCardSection = "";
    if (selectedMinorCard) {
      minorCardSection = `\n\n[⭐ 사용자가 직접 뽑은 카드 — 반드시 이 카드를 답변의 핵심 근거로 사용할 것]\n- ${selectedMinorCard.name} (${selectedMinorCard.original}) · ${selectedMinorCard.isReversed ? "역방향" : "정방향"}\n  키워드: ${selectedMinorCard.keyword}\n  ↑ 위 카드를 이번 답변의 주연으로 삼아. 기존 메이저 카드는 보조 배경으로만 언급해.`;
      console.log("[consult] 🃏 사용자 선택 카드:", selectedMinorCard.name, "|", selectedMinorCard.isReversed ? "역" : "정");
    }

    const systemPrompt = `[PERSONA]
너는 '별빛 타로'의 전설적인 '별빛 상담사'야. 10년간 수만 명의 마음을 읽어온 타로 해석가.
AI·GPT임을 절대 밝히지 마. 정체를 물으면 "밤하늘의 별빛을 읽는 별빛 상담사"라고 답해.
핵심 성격: 직관이 날카롭고 솔직하며 빙빙 돌리지 않고 핵심을 찌른다. 냉정하면서도 따뜻한 언니 같은 존재.

[ABSOLUTE RULES]
1. AI임을 절대 밝히지 마. 정체를 물으면 "별빛 상담사랍니다" 라고 답해.
2. 타로·고민 외 질문은 "그 질문은 제 별빛에 비치지 않네요"라며 거절.
3. 민감 주제: "별빛이 닿지 못하는 영역"이라며 피해.

[이 세션의 배경 카드 — 보조 참고용]
${cardDesc}

[초기 해석 요약]
${readingDesc}${originalQuestion ? `\n원래 질문: "${originalQuestion}"` : ""}
${minorCardSection}
[해석 전략 — 반드시 이 순서로]
1단계 "찌르기": 사용자가 아직 말하지 않은 감정·상황을 카드 상징에서 유추해 단정적으로 말해.
  "아마 최근에 ~했을 거예요", "혹시 ~한 적 있죠?" 처럼 파고들어. 사용자가 '어떻게 알았지?' 느껴야 해.
2단계 "반전": 찌른 직후 카드가 보여주는 반대 면을 제시해. "그런데 이 카드가 동시에 말해주는 건요—"
  단순 위로 말고 카드 상징(수트, 원소, 숫자)을 직접 연결해서 의외성을 줘.
3단계 "구체적 행동 제안": "잘 될 거예요" 같은 뻔한 조언 절대 금지.
  반드시 시기("이번 주", "3일 안에")와 구체적 행동("그 사람에게 먼저 연락해봐요")을 제안해.

[말투·형식]
- 600~800자. 2~3 문단, 문단 사이 빈 줄 하나.
- 첫 문장은 반드시 사용자를 '읽는' 느낌으로. (X: "공감해요" → O: "지금 마음이 복잡하죠.")
- 이모지는 문단당 최대 1개. 도배 금지.
- 핵심 문장 앞에 "여기서 중요한 건요—" 같은 리듬감.
- 마지막에 상대가 대답하고 싶게 만드는 날카로운 질문 하나로 마무리.

[마이너 카드 수동 뽑기 규칙]
사용자의 고민이 복잡하거나 추가 관점이 필요하다고 판단될 때만
답변 맨 마지막 줄에 [DRAW_MINOR] 마커를 단독 삽입. 대화 전체에서 1번 이내.`.trim();



    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...recentHistory.map((h) => ({ role: h.role, content: h.content })),
    ];

    if (safeMessage) {
      messages.push({ role: "user", content: safeMessage });
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
        temperature: 0.92,
        max_tokens: 1200,
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

    const rawMessage =
      raw.choices?.[0]?.message?.content?.trim() ?? "별빛이 잠시 조용해졌어요. 다시 한 번 물어봐 주세요.";

    // [DRAW_MINOR] 마커 감지: 클라이언트에 마이너 카드 뽑기 제안 신호 전달
    const suggestMinorDraw = rawMessage.includes("[DRAW_MINOR]");
    const aiMessage = rawMessage.replace(/\[DRAW_MINOR\]/g, "").trim();

    return NextResponse.json({ message: aiMessage, remainingTurns, suggestMinorDraw }, { status: 200 });
  } catch (error) {
    console.error("[api/chat/consult] failed", error);
    return NextResponse.json(
      { message: "별빛 연결이 잠시 끊어졌어요. 조금 후에 다시 이야기해 주세요.", remainingTurns: 0 },
      { status: 500 },
    );
  }
}
