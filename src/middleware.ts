import { NextRequest, NextResponse } from "next/server";

// Edge Rate Limiter — API 경로에만 적용
// IP당 분당 최대 15회 요청 허용 (메모리 기반, Vercel Edge 환경)
// Upstash 없이도 동작하는 경량 방어선

const RATE_LIMIT_MAX = 15;        // 분당 최대 요청 수
const RATE_LIMIT_WINDOW = 60_000; // 1분 (ms)

// Edge 메모리 캐시 (Vercel Edge 인스턴스 단위)
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
        // 새 윈도우 시작
        rateLimitCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return false;
    }

    record.count += 1;
    if (record.count > RATE_LIMIT_MAX) {
        return true;
    }

    rateLimitCache.set(ip, record);
    return false;
}

// 오래된 캐시 항목 정리 (메모리 누수 방지)
function pruneCache() {
    const now = Date.now();
    for (const [key, val] of rateLimitCache) {
        if (now > val.resetAt) rateLimitCache.delete(key);
    }
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // API 경로에만 rate limit 적용
    if (!pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // 100요청마다 캐시 정리
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
