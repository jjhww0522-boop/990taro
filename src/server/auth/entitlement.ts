import { createHmac, timingSafeEqual } from "node:crypto";

type EntitlementPayload = {
  scope: "paid_session";
  sid: string;
  oid: string;
  iat: number;
  exp: number;
};

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET ?? "";
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("JWT_SECRET must be at least 32 bytes for HS256.");
  }
  return secret;
}

function sign(header: string, payload: string) {
  const secret = getJwtSecret();
  return createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
}

export function verifyEntitlementJwt(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false as const, reason: "INVALID_FORMAT" };
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  let expectedSig = "";
  try {
    expectedSig = sign(headerPart, payloadPart);
  } catch {
    return { ok: false as const, reason: "SIGNING_UNAVAILABLE" };
  }
  const expectedBuffer = Buffer.from(expectedSig, "utf8");
  const actualBuffer = Buffer.from(signaturePart, "utf8");
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return { ok: false as const, reason: "INVALID_SIGNATURE" };
  }

  let header: { alg?: string; typ?: string } = {};
  let payload: Partial<EntitlementPayload> = {};
  try {
    header = JSON.parse(decodeBase64Url(headerPart)) as { alg?: string; typ?: string };
    payload = JSON.parse(decodeBase64Url(payloadPart)) as Partial<EntitlementPayload>;
  } catch {
    return { ok: false as const, reason: "INVALID_JSON" };
  }

  if (header.alg !== "HS256") {
    return { ok: false as const, reason: "INVALID_ALG" };
  }
  if (payload.scope !== "paid_session" || !payload.sid || !payload.oid || !payload.exp) {
    return { ok: false as const, reason: "INVALID_PAYLOAD" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    return { ok: false as const, reason: "EXPIRED" };
  }

  return {
    ok: true as const,
    payload: payload as EntitlementPayload,
  };
}

export function extractBearerToken(request: Request) {
  const auth = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}
