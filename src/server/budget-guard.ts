import { getCurrentKstMonth } from "./time-kst";

const MONTHLY_BUDGET_WON = 100_000;

function getRedisConfig() {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

async function redisGet(key: string) {
  const conf = getRedisConfig();
  if (!conf) throw new Error("Upstash Redis is not configured.");

  const res = await fetch(`${conf.baseUrl}/get/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash GET failed: ${res.status}`);

  const body = (await res.json()) as { result?: string | null };
  return body.result ?? null;
}

async function redisIncrBy(key: string, amount: number) {
  const conf = getRedisConfig();
  if (!conf) throw new Error("Upstash Redis is not configured.");

  const res = await fetch(`${conf.baseUrl}/incrby/${encodeURIComponent(key)}/${amount}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash INCRBY failed: ${res.status}`);
}

function getMonthlyBudgetKey() {
  return `budget:month:${getCurrentKstMonth()}`;
}

export async function getBudgetStatus() {
  try {
    const raw = await redisGet(getMonthlyBudgetKey());
    const spent = raw ? Number(raw) : 0;
    const totalSpent = Number.isFinite(spent) ? spent : 0;
    return {
      totalSpent,
      budgetExhausted: totalSpent >= MONTHLY_BUDGET_WON,
    };
  } catch (error) {
    console.error("[budget-guard] degradedMode=true budget lookup failed", {
      error: error instanceof Error ? error.message : "unknown",
      degradedMode: true,
    });
    return {
      totalSpent: 0,
      budgetExhausted: false,
    };
  }
}

export async function recordBudgetSpend(amountWon: number) {
  if (!Number.isFinite(amountWon) || amountWon <= 0) return;
  try {
    await redisIncrBy(getMonthlyBudgetKey(), Math.floor(amountWon));
  } catch (error) {
    console.error("[budget-guard] degradedMode=true budget increment failed", {
      amountWon,
      error: error instanceof Error ? error.message : "unknown",
      degradedMode: true,
    });
  }
}
