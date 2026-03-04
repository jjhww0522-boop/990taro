import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AgentationDevtools } from "../components/AgentationDevtools";
import { GNB } from "../components/GNB";
import { SiteFooter } from "../components/SiteFooter";
import StarParticles from "../components/StarParticles";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "별빛 타로 | AI 타로 상담 · 오늘의 운세",
    template: "%s | 별빛 타로",
  },
  description: "별빛 타로에서 당신의 이야기를 들려주세요. AI 별빛 상담사가 22장 동양 타로 카드로 연애운·금전운·학업운을 따뜻하게 풀어드립니다. 하루 1회 무료, 회원가입 불필요.",
  keywords: ["별빛 타로", "AI 타로", "타로 상담", "오늘의 운세", "타로 점", "연애운", "금전운", "학업운", "건강운", "무료 타로", "타로 카드", "AI 점술", "타로 해석"],
  metadataBase: new URL("https://990taro.vercel.app"),
  alternates: {
    canonical: "https://990taro.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title: "별빛 타로 | AI 타로 상담",
    description: "AI 별빛 상담사와 함께하는 타로 리딩. 연애·금전·건강·학업 무료 상담. 회원가입 없이 바로 시작.",
    url: "https://990taro.vercel.app",
    siteName: "별빛 타로",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "별빛 타로 | AI 타로 상담",
    description: "AI 별빛 상담사와 함께하는 타로 리딩. 연애·금전·건강·학업 무료 상담.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nosifer&family=East+Sea+Dokdo&display=swap" rel="stylesheet" />
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
            `}</Script>
          </>
        )}
        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans bg-[#0f1419] text-[#fef9f0] overflow-x-hidden">
        <div className="bg-layer" />
        <div className="mist" />
        <StarParticles />
        <div className="deco-line left" />
        <div className="deco-line right" />
        <GNB />

        <main className="relative z-10 mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 md:px-8">
          <div className="w-full max-w-7xl flex-1 relative flex flex-col">{children}</div>
          <SiteFooter />
        </main>
        <AgentationDevtools />

      </body>
    </html>
  );
}
