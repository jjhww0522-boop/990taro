import type { Metadata } from "next";
import { AgentationDevtools } from "../components/AgentationDevtools";
import { SiteFooter } from "../components/SiteFooter";
import StarParticles from "../components/StarParticles";
import "./globals.css";

export const metadata: Metadata = {
  title: "별빛 타로 | 밤하늘 아래 펼쳐지는 운명",
  description: "별빛 타로에서 당신의 이야기를 들려주세요. 카드 세 장이 과거·현재·미래를 따뜻하게 비춰드립니다.",
  keywords: ["별빛 타로", "동양 타로", "타로 상담", "운세", "타로 점"],
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nosifer&family=East+Sea+Dokdo&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-[#0f1419] text-[#fef9f0] overflow-x-hidden">
        <div className="bg-layer" />
        <div className="mist" />
        <StarParticles />
        <div className="deco-line left" />
        <div className="deco-line right" />

        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          <div className="w-full flex-1">{children}</div>
          <SiteFooter />
        </main>
        <AgentationDevtools />
      </body>
    </html>
  );
}
