import { recordBudgetSpend } from "../budget-guard";

type Usage = {
  input_tokens?: number;
  output_tokens?: number;
};

const DEFAULT_LOW_INPUT_PER_1M = 0.15;
const DEFAULT_LOW_OUTPUT_PER_1M = 0.6;
const DEFAULT_HIGH_INPUT_PER_1M = 3.0;
const DEFAULT_HIGH_OUTPUT_PER_1M = 12.0;

function toWon(usd: number) {
  const usdToKrw = Number(process.env.USD_TO_KRW ?? "1320");
  return Math.max(0, usd * (Number.isFinite(usdToKrw) ? usdToKrw : 1320));
}

function estimateUsdCost(inputTokens: number, outputTokens: number, tier: "low" | "high") {
  const lowIn = Number(process.env.OPENAI_LOW_INPUT_PER_1M_USD ?? DEFAULT_LOW_INPUT_PER_1M);
  const lowOut = Number(process.env.OPENAI_LOW_OUTPUT_PER_1M_USD ?? DEFAULT_LOW_OUTPUT_PER_1M);
  const highIn = Number(process.env.OPENAI_HIGH_INPUT_PER_1M_USD ?? DEFAULT_HIGH_INPUT_PER_1M);
  const highOut = Number(process.env.OPENAI_HIGH_OUTPUT_PER_1M_USD ?? DEFAULT_HIGH_OUTPUT_PER_1M);

  const inputRate = tier === "low" ? lowIn : highIn;
  const outputRate = tier === "low" ? lowOut : highOut;

  return (inputTokens / 1_000_000) * inputRate + (outputTokens / 1_000_000) * outputRate;
}

export async function recordAiUsageCost(usage: Usage | undefined, tier: "low" | "high") {
  if (!usage) return;
  const inputTokens = Math.max(0, usage.input_tokens ?? 0);
  const outputTokens = Math.max(0, usage.output_tokens ?? 0);
  const usd = estimateUsdCost(inputTokens, outputTokens, tier);
  const won = Math.floor(toWon(usd));
  if (won <= 0) return;
  await recordBudgetSpend(won);
}
