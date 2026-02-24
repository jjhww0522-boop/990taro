import { NextResponse } from "next/server";
import { getBudgetStatus } from "../../../../server/budget-guard";
import { runStructuredOutput } from "../../../../server/ai/responses-client";
import { freeSchema } from "../../../../server/ai/schemas";
import { sanitizeCardMeaning, sanitizeTeaser } from "../../../../server/ai/safety";
import { recordAiUsageCost } from "../../../../server/ai/usage-cost";
import { enforceFreeRateLimitByIp } from "../../../../server/rate-limit-free";
import { getClientIp } from "../../../../server/request-ip";
import { getTodayKst } from "../../../../server/time-kst";

export const runtime = "nodejs";

type FreeTarotRequest = {
  question?: string;
  category?: string;
  userContext?: string;
};

export async function POST(request: Request) {
  const budget = await getBudgetStatus();
  if (budget.budgetExhausted) {
    return NextResponse.json({ errorCode: "BUDGET_EXHAUSTED" }, { status: 403 });
  }

  const todayKst = getTodayKst();
  const ip = getClientIp(request);
  const rateResult = await enforceFreeRateLimitByIp(ip, todayKst);

  if (!rateResult.allowed) {
    return NextResponse.json(
      { errorCode: "FREE_RATE_LIMITED" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateResult.retryAfterSec),
        },
      },
    );
  }

  let body: FreeTarotRequest = {};
  try {
    body = (await request.json()) as FreeTarotRequest;
  } catch {
    body = {};
  }

  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ errorCode: "INVALID_QUESTION" }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL_LOW ?? "gpt-4o-mini";
  const dynamicPrompt = [
    "endpoint=free",
    "card_count=3",
    `category=${body.category ?? "general"}`,
    `question=${question}`,
    `user_context=${body.userContext ?? ""}`,
  ].join("\n");

  const result = await runStructuredOutput<{
    spread: Array<{ card: string; meaning: string }>;
    teaser: { risk_word_public: string; lockedText: string };
  }>({
    endpointLabel: "free",
    model,
    schemaName: "free_schema",
    schema: freeSchema,
    maxOutputTokens: 500,
    dynamicPrompt,
  });

  await recordAiUsageCost(result.usage, "low");

  const spread = result.parsed.spread.slice(0, 3).map((item) => ({
    card: item.card,
    meaning: sanitizeCardMeaning(item.meaning),
  }));
  while (spread.length < 3) {
    spread.push({ card: `보조카드${spread.length + 1}`, meaning: "기운의 결을 차분히 살펴보는 자리입니다." });
  }

  return NextResponse.json({
    spread,
    teaser: sanitizeTeaser(result.parsed.teaser),
  });
}
