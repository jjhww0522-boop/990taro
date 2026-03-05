import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // ─── basePath: tetolab.com/tarot 경로로 서비스 ─────────────────────────────
    basePath: "/tarot",

    // ─── 보안 헤더 ─────────────────────────────────────────────────────────────
    async headers() {
        const isDev = process.env.NODE_ENV === "development";

        const contentSecurityPolicy = [
            "default-src 'self'",
            // 개발 환경: Next.js HMR이 eval()을 사용하므로 unsafe-eval 허용
            // 배포 환경: 제거
            `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://js.tosspayments.com`,
            // 스타일: 자기 자신 + Google Fonts
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            // 폰트: Google Fonts CDN
            "font-src 'self' https://fonts.gstatic.com",
            // 이미지: 자기 자신 + data URIs
            "img-src 'self' data: https:",
            // fetch/XHR: 자기 자신 + OpenAI API + Toss API
            "connect-src 'self' https://api.openai.com https://api.tosspayments.com https://aip.scaler.com https://www.google-analytics.com",
            // 프레임: Toss 결제 팝업
            "frame-src 'self' https://js.tosspayments.com https://button.tosspayments.com",
            // 오브젝트(Flash 등) 차단
            "object-src 'none'",
            // base 태그 자기 자신으로 제한
            "base-uri 'self'",
            // form 제출 자기 자신으로 제한
            "form-action 'self'",
        ].join("; ");

        return [
            {
                source: "/(.*)",
                headers: [
                    // Content Security Policy
                    {
                        key: "Content-Security-Policy",
                        value: contentSecurityPolicy,
                    },
                    // 클릭재킹 방어
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    // MIME 스니핑 방어
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    // Referer 제한
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    // 권한 제한 (마이크·카메라·위치 등 차단)
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=(), payment=(self)",
                    },
                    // HSTS (HTTPS 강제, 6개월)
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=15552000; includeSubDomains",
                    },
                    // XSS 필터 (구형 브라우저 대응)
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                ],
            },
        ];
    },

    // ─── 빌드 최적화 ────────────────────────────────────────────────────────────
    images: {
        remotePatterns: [],
    },
};

export default nextConfig;
