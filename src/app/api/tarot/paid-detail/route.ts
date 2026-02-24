import { NextResponse } from "next/server";
import { extractBearerToken, verifyEntitlementJwt } from "../../../../server/auth/entitlement";
import { runStructuredOutput } from "../../../../server/ai/responses-client";
import { sanitizeDetailText } from "../../../../server/ai/safety";
import { paidDetailSchema } from "../../../../server/ai/schemas";
import { recordAiUsageCost } from "../../../../server/ai/usage-cost";
import { consumeDetailBestEffort } from "../../../../server/payment/upstash";

export const runtime = "nodejs";

type PaidDetailRequest = {
  question?: string;
  summaryHint?: string;
};

function sessionDissolvedResponse(status: number) {
  return NextResponse.json({ errorCode: "SESSION_DISSOLVED", cta: "OPEN_PAID_SESSION" }, { status });
}

export async function POST(request: Request) {
  const token = extractBearerToken(request);
  if (!token) return sessionDissolvedResponse(401);

  const verified = verifyEntitlementJwt(token);
  if (!verified.ok) return sessionDissolvedResponse(403);

  const counter = await consumeDetailBestEffort(verified.payload.sid);
  if (!counter.allowed) {
    return NextResponse.json({ errorCode: "DETAIL_EXHAUSTED", cta: "OPEN_PAID_SESSION" }, { status: 403 });
  }

  let body: PaidDetailRequest = {};
  try {
    body = (await request.json()) as PaidDetailRequest;
  } catch {
    body = {};
  }

  const model = process.env.OPENAI_MODEL_HIGH ?? "gpt-4.1";
  const dynamicPrompt = [
    `endpoint=paid_detail`,
    "section_limit=3",
    `question=${(body.question ?? "").trim()}`,
    `summary_hint=${(body.summaryHint ?? "").trim()}`,
  ].join("\n");

  const result = await runStructuredOutput<{
    sections: Array<{ title: string; body: string }>;
    closing: string;
  }>({
    endpointLabel: "paid_detail",
    model,
    schemaName: "paid_detail_schema",
    schema: paidDetailSchema,
    maxOutputTokens: 900,
    dynamicPrompt,
  });

  await recordAiUsageCost(result.usage, "high");

  const sections = result.parsed.sections.slice(0, 3).map((section, idx) => ({
    title: section.title || `해석 ${idx + 1}`,
    body: sanitizeDetailText(section.body),
  }));

  while (sections.length < 3) {
    sections.push({
      title: `해석 ${sections.length + 1}`,
      body: "흐름이 겹치는 지점을 천천히 정리해 다음 선택을 준비하세요.",
    });
  }

  return NextResponse.json({
    sections,
    closing: sanitizeDetailText(result.parsed.closing).slice(0, 140),
    degradedMode: counter.degradedMode,
  });
}
