"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type AdBannerProps = {
    slot: string;
    format?: "auto" | "fluid" | "rectangle";
    responsive?: boolean;
    className?: string;
    // 무료/프리미엄 판단을 위한 옵션 등 (상위 컴포넌트에서 판단 후 렌더링을 권장)
};

export default function AdBanner({ slot, format = "auto", responsive = true, className = "" }: AdBannerProps) {
    const pathname = usePathname();
    const adRef = useRef<HTMLModElement>(null);

    // 로컬 환경 또는 Adsense 미설정 시점에서는 배너 영역만 PlaceHolder로 둡니다.
    const isDev = process.env.NODE_ENV === "development";
    const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    useEffect(() => {
        // 이미 로드된 광고인지 체크 (에러 방지)
        if (adRef.current && !adRef.current.firstChild) {
            if (!isDev && clientId) {
                try {
                    // @ts-ignore
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                } catch (error) {
                    console.error("AdSense 발동 에러:", error);
                }
            }
        }
    }, [pathname]); // 페이지 이동 시 다시 렌더하도록

    if (isDev || !clientId) {
        return (
            <div className={`w-full bg-[#121626] border border-[#e8c96a]/15 flex items-center justify-center p-4 rounded-xl text-center text-[#fef9f0]/40 text-xs ${className}`}>
                광고 영역 (AdSense)<br />
                <span className="text-[10px] opacity-70">실제 배포 및 승인 후 표시됩니다</span>
            </div>
        );
    }

    return (
        <div className={`w-full overflow-hidden flex justify-center ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle w-full"
                style={{ display: "block", textAlign: "center" }}
                data-ad-client={clientId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
}
