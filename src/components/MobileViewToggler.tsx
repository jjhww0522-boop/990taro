"use client";

import { useState, useEffect } from "react";

export default function MobileViewToggler() {
    const [isMobile, setIsMobile] = useState(false);

    // Hydration 오류 방지를 위한 마운트 체크
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const toggle = () => {
        if (!isMobile) {
            document.body.classList.add("dev-mobile-view");
        } else {
            document.body.classList.remove("dev-mobile-view");
        }
        setIsMobile(!isMobile);
    };

    return (
        <button
            onClick={toggle}
            style={{
                position: "fixed",
                top: "16px",
                right: "16px",
                zIndex: 99999999,
                padding: "8px 16px",
                backgroundColor: "#e8c96a",
                color: "#1a1a1a",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "999px",
                fontWeight: "900",
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(232, 201, 106, 0.4)",
            }}
        >
            {isMobile ? "💻 PC 뷰 복구" : "📱 모바일 뷰어 켜기"}
        </button>
    );
}
