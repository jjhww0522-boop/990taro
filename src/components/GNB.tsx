"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/tarot-guide", label: "타로 도감" },
  { href: "/guide", label: "입문 가이드" },
  { href: "/about", label: "서비스 소개" },
];

export function GNB() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // 페이지 이동 시 메뉴 자동 닫기
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // 메뉴 열려있을 때 바디 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // 리딩/결과 화면에서는 GNB 숨김 (몰입감 유지)
  const hidden = ["/pick", "/result", "/shuffle"].some((p) => pathname.startsWith(p));
  if (hidden) return null;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-8 h-14"
        style={{
          background: "rgba(12, 16, 32, 0.85)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(232, 201, 106, 0.12)",
        }}
      >
        {/* 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#ffd98e] font-semibold text-[15px] tracking-wide hover:opacity-80 transition-opacity"
        >
          <span className="text-base">✨</span>
          <span>별빛 타로</span>
        </Link>

        {/* 데스크탑 링크 */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="px-4 py-1.5 rounded-full text-sm transition-all duration-200"
                style={{
                  color: isActive ? "#ffd98e" : "rgba(254,249,240,0.55)",
                  background: isActive ? "rgba(232,201,106,0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(232,201,106,0.3)" : "1px solid transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* 데스크탑: 리딩 시작 버튼 */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, rgba(232,201,106,0.9) 0%, rgba(200,160,70,0.9) 100%)",
            color: "#0c1020",
            boxShadow: "0 0 16px rgba(232,201,106,0.25)",
          }}
        >
          <span className="text-xs">✦</span>
          <span>리딩 시작</span>
        </Link>

        {/* 모바일: 햄버거 버튼 */}
        <button
          type="button"
          className="md:hidden flex flex-col items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ background: isOpen ? "rgba(232,201,106,0.12)" : "transparent" }}
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label="메뉴 열기"
        >
          <motion.span
            className="block w-5 h-[2px] bg-[#ffd98e] rounded-full"
            animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-5 h-[2px] bg-[#ffd98e] rounded-full mt-1"
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.span
            className="block w-5 h-[2px] bg-[#ffd98e] rounded-full mt-1"
            animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
        </button>
      </nav>

      {/* 모바일 메뉴 오버레이 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 배경 딤 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setIsOpen(false)}
            />

            {/* 메뉴 패널 */}
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-14 left-0 right-0 z-50 px-5 pb-6 pt-4"
              style={{
                background: "rgba(12, 16, 32, 0.95)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(232, 201, 106, 0.15)",
              }}
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label }) => {
                  const isActive = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="px-4 py-3 rounded-xl text-[15px] transition-all"
                      style={{
                        color: isActive ? "#ffd98e" : "rgba(254,249,240,0.7)",
                        background: isActive ? "rgba(232,201,106,0.1)" : "transparent",
                      }}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>

              {/* 리딩 시작 CTA */}
              <Link
                href="/"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, rgba(232,201,106,0.9) 0%, rgba(200,160,70,0.9) 100%)",
                  color: "#0c1020",
                  boxShadow: "0 0 20px rgba(232,201,106,0.2)",
                }}
              >
                <span>✦</span>
                <span>리딩 시작하기</span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
