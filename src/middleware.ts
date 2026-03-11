import { NextRequest, NextResponse } from "next/server";

// ─── 설정 ───────────────────────────────────────────────────────────────────
const RATE_LIMIT_MAX = 15;        // 분당 최대 요청 수 (per IP)
const RATE_LIMIT_WINDOW = 60_000; // 1분 (ms)

// 허용된 Origin 목록 (CSRF 방어)
const ALLOWED_ORIGINS = [
    "https://990taro.vercel.app",
    "https://tetolab.com",
    "https://www.tetolab.com",
    "http://localhost:3000",
    "http://localhost:3001",
];

// ─── Rate Limit 캐시 ────────────────────────────────────────────────────────
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"
    );
}

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitCache.get(ip);

    if (!record || now > record.resetAt) {
        rateLimitCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return false;
    }

    record.count += 1;
    if (record.count > RATE_LIMIT_MAX) return true;

    rateLimitCache.set(ip, record);
    return false;
}

function pruneCache() {
    const now = Date.now();
    for (const [key, val] of rateLimitCache) {
        if (now > val.resetAt) rateLimitCache.delete(key);
    }
}

// ─── CSRF Origin 검증 ────────────────────────────────────────────────────────
function isCsrfBlocked(req: NextRequest): boolean {
    // GET / HEAD / OPTIONS 는 CSRF 무관
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return false;

    const origin = req.headers.get("origin");
    // Origin 헤더 없으면 서버-to-서버 or 구형 브라우저 — 차단하지 않음
    if (!origin) return false;

    return !ALLOWED_ORIGINS.includes(origin);
}

// ─── 미들웨어 본체 ────────────────────────────────────────────────────────────
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // API 경로에만 적용
    if (!pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // CSRF 방어
    if (isCsrfBlocked(req)) {
        return NextResponse.json(
            { error: "허용되지 않은 요청 출처예요." },
            { status: 403 },
        );
    }

    // Rate Limit
    if (Math.random() < 0.01) pruneCache();

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
        return NextResponse.json(
            {
                error: "요청이 너무 많아요. 잠시 후에 다시 이야기해 주세요.",
                retryAfter: 60,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": "60",
                    "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
                },
            },
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"],
};
