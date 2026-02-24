type PgVerifyResult = {
  paid: boolean;
  rawStatus?: string;
};

function normalizePaidStatus(status: string) {
  return status.trim().toUpperCase() === "PAID";
}

async function verifyViaRemote(orderId: string): Promise<PgVerifyResult> {
  const url = process.env.PG_VERIFY_URL;
  if (!url) return { paid: false };

  const secret = process.env.PG_VERIFY_SECRET ?? "";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify({ orderId }),
    cache: "no-store",
  });

  if (!res.ok) return { paid: false };
  const body = (await res.json()) as { status?: string };
  const rawStatus = body.status ?? "";
  return { paid: normalizePaidStatus(rawStatus), rawStatus };
}

function verifyViaStub(orderId: string): PgVerifyResult {
  const paidOrderIds = (process.env.PG_STUB_PAID_ORDER_IDS ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  if (paidOrderIds.includes(orderId)) return { paid: true, rawStatus: "PAID" };
  if (orderId.startsWith("paid_")) return { paid: true, rawStatus: "PAID" };
  return { paid: false, rawStatus: "FAILED" };
}

export async function verifyPaymentWithPg(orderId: string): Promise<PgVerifyResult> {
  const mode = (process.env.PG_VERIFY_MODE ?? "stub").toLowerCase();
  if (mode === "remote") {
    return verifyViaRemote(orderId);
  }
  return verifyViaStub(orderId);
}
