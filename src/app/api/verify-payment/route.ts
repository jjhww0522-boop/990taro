import { NextResponse } from "next/server";
import { deriveSessionId, signPaidSessionJwt } from "../../../server/payment/jwt";
import { verifyPaymentWithPg } from "../../../server/payment/pg";
import { initPaidSessionBestEffort } from "../../../server/payment/upstash";

export const runtime = "nodejs";

type VerifyPaymentRequest = {
  orderId?: string;
};

export async function POST(request: Request) {
  let payload: VerifyPaymentRequest = {};
  try {
    payload = (await request.json()) as VerifyPaymentRequest;
  } catch {
    return NextResponse.json({ paid: false }, { status: 400 });
  }

  const orderId = (payload.orderId ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ paid: false }, { status: 400 });
  }

  const pgResult = await verifyPaymentWithPg(orderId);
  if (!pgResult.paid) {
    return NextResponse.json({
      paid: false,
      paymentStatus: pgResult.rawStatus ?? "FAILED",
    });
  }

  const sid = deriveSessionId(orderId);
  const entitlementJwt = signPaidSessionJwt({ sid, oid: orderId });

  let sessionInitStatus: "ok" | "degraded" = "ok";
  try {
    await initPaidSessionBestEffort({ sid, oid: orderId });
  } catch (error) {
    sessionInitStatus = "degraded";
    console.error("[verify-payment] degradedMode=true session init failed", {
      sid,
      oid: orderId,
      error: error instanceof Error ? error.message : "unknown",
      degradedMode: true,
    });
  }

  return NextResponse.json({
    paid: true,
    sid,
    entitlementJwt,
    sessionInitStatus,
    degradedMode: sessionInitStatus === "degraded",
  });
}
