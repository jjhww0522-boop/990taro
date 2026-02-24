import { NextResponse } from "next/server";
import { getBudgetStatus } from "../../../server/budget-guard";
import { getTodayKst } from "../../../server/time-kst";

export const runtime = "nodejs";

export async function GET() {
  const budget = await getBudgetStatus();

  return NextResponse.json({
    todayKst: getTodayKst(),
    budgetExhausted: budget.budgetExhausted,
    maintenanceMode: false,
  });
}
