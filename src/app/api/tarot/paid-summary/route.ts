import { NextResponse } from "next/server";
import { extractBearerToken, verifyEntitlementJwt } from "../../../../server/auth/entitlement";
import { runStructuredOutput } from "../../../../server/ai/responses-client";
import { sanitizeCardMeaning, sanitizeSummaryText, sanitizeTeaser } from "../../../../server/ai/safety";
import { paidSummarySchema } from "../../../../server/ai/schemas";
import { recordAiUsageCost } from "../../../../server/ai/usage-cost";
import { consumeQuestionBestEffort } from "../../../../server/payment/upstash";

export const runtime = "nodejs";

type PaidSummaryRequest = {
  question?: string;
  category?: string;
  userContext?: string;
};

function sessionDissolvedResponse(status: number) {
  return NextResponse.json({ errorCode: "SESSION_DISSOLVED", cta: "OPEN_PAID_SESSION" }, { status });
}

export async function POST(request: Request) {
  const token = extractBearerToken(request);
  if (!token) return sessionDissolvedResponse(401);

  const verified = verifyEntitlementJwt(token);
  if (!verified.ok) return sessionDissolvedResponse(403);

  const counter = await consumeQuestionBestEffort(verified.payload.sid);
  if (!counter.allowed) {
    return NextResponse.json({ errorCode: "QUESTION_EXHAUSTED", cta: "OPEN_PAID_SESSION" }, { status: 403 });
  }

  let body: PaidSummaryRequest = {};
  try {
    body = (await request.json()) as PaidSummaryRequest;
  } catch {
    body = {};
  }

  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ errorCode: "INVALID_QUESTION" }, { status: 400 });
  }

  const cardCount = counter.questionNumber <= 2 ? 5 : 1;
  const model = process.env.OPENAI_MODEL_LOW ?? "gpt-4o-mini";
  const dynamicPrompt = [
    `endpoint=paid_summary`,
    `card_count=${cardCount}`,
    `category=${body.category ?? "general"}`,
    `question=${question}`,
    `user_context=${body.userContext ?? ""}`,
  ].join("\n");

  const result = await runStructuredOutput<{
    spread: Array<{ card: string; meaning: string }>;
    summary: string;
    teaser: { risk_word_public: string; lockedText: string };
  }>({
    endpointLabel: "paid_summary",
    model,
    schemaName: "paid_summary_schema",
    schema: paidSummarySchema,
    maxOutputTokens: 500,
    dynamicPrompt,
  });

  await recordAiUsageCost(result.usage, "low");

  const spread = result.parsed.spread.slice(0, cardCount).map((item) => ({
    card: item.card,
    meaning: sanitizeCardMeaning(item.meaning),
  }));
  while (spread.length < cardCount) {
    spread.push({ card: `보조카드${spread.length + 1}`, meaning: "흐름을 차분히 살피는 구간입니다." });
  }

  return NextResponse.json({
    spread,
    summary: sanitizeSummaryText(result.parsed.summary),
    teaser: sanitizeTeaser(result.parsed.teaser),
    degradedMode: counter.degradedMode,
  });
}
