import { createHash, createHmac } from "node:crypto";

type PaidSessionJwtPayload = {
  scope: "paid_session";
  sid: string;
  oid: string;
  iat: number;
  exp: number;
};

function toBase64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET ?? "";
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("JWT_SECRET must be at least 32 bytes for HS256.");
  }
  return secret;
}

export function deriveSessionId(orderId: string) {
  const digest = createHash("sha256").update(`sid:${orderId}`).digest("base64url");
  return digest.slice(0, 24);
}

export function signPaidSessionJwt(input: { sid: string; oid: string }) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 86400;
  const payload: PaidSessionJwtPayload = {
    scope: "paid_session",
    sid: input.sid,
    oid: input.oid,
    iat,
    exp,
  };

  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify(payload));
  const secret = getJwtSecret();

  const signature = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}
