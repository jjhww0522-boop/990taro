import { NextRequest, NextResponse } from "next/server";

function getUpstashConfig() {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function buildFingerprint(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "0.0.0.0";
  const ua = request.headers.get("user-agent") ?? "ua:na";
  const lang = request.headers.get("accept-language") ?? "lang:na";
  const device = request.headers.get("x-device-id") ?? "device:na";
  return sha256Hex(`${ip}|${ua}|${lang}|${device}`);
}

async function upstashIncrWithTtl(key: string, ttlSeconds: number) {
  const conf = getUpstashConfig();
  if (!conf) return { count: 0, degraded: true as const };

  const incrRes = await fetch(`${conf.baseUrl}/incr/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conf.token}` },
    cache: "no-store",
  });
  if (!incrRes.ok) throw new Error(`Upstash incr failed: ${incrRes.status}`);
  const incrJson = (await incrRes.json()) as { result?: number };
  const count = Number(incrJson.result ?? 0);

  if (count <= 1) {
    await fetch(`${conf.baseUrl}/expire/${encodeURIComponent(key)}/${ttlSeconds}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conf.token}` },
      cache: "no-store",
    });
  }

  return { count, degraded: false as const };
}

async function validatePremiumSession(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return false;

  // basePath('/tarot')를 포함한 세션 검증 URL 구성
  const sessionUrl = new URL(request.url);
  sessionUrl.pathname = "/tarot/api/auth/session";
  const verify = await fetch(sessionUrl.toString(), {
    method: "GET",
    headers: { Authorization: auth },
    cache: "no-store",
  });
  return verify.ok;
}

export async function middleware(request: NextRequest) {
  // matcher가 /api/chat 으로 제한되어 있어 이 check는 안전장치용
  const pathname = request.nextUrl.pathname;
  if (!pathname.endsWith("/api/chat")) {
    return NextResponse.next();
  }

  const isPremium = await validatePremiumSession(request);
  if (isPremium) {
    return NextResponse.next();
  }

  const fp = await buildFingerprint(request);
  const bucketKey = `abuse:chat:1m:${fp}`;
  const limited = await upstashIncrWithTtl(bucketKey, 60);
  if (!limited.degraded && limited.count > 12) {
    return NextResponse.json(
      {
        error: "비정상적으로 빠른 반복 요청이 감지되어 잠시 차단되었소.",
      },
      { status: 429 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/chat"],
};
