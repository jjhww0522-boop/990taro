import { NextResponse } from "next/server";
import { extractBearerToken, verifyEntitlementJwt } from "../../../../server/auth/entitlement";

export async function GET(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return NextResponse.json({ ok: false, premium: false }, { status: 401 });
  }

  const verified = verifyEntitlementJwt(token);
  if (!verified.ok) {
    return NextResponse.json({ ok: false, premium: false }, { status: 401 });
  }

  return NextResponse.json(
    {
      ok: true,
      premium: true,
      sid: verified.payload.sid,
    },
    { status: 200 },
  );
}
