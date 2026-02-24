import type { Metadata } from "next";
import { AgentationDevtools } from "../components/AgentationDevtools";
import "./globals.css";

export const metadata: Metadata = {
  title: "월하 타로 | 당신의 운명을 비추는 달빛",
  description: "달빛 아래 펼쳐지는 신비로운 타로 리딩. 지금 당신의 고민을 비춰보세요."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className="bg-occult-bg-main text-occult-text-main h-[100dvh] flex justify-center items-center overflow-hidden">
        {children}
        <AgentationDevtools />
      </body>
    </html>
  );
}
