import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "타로 결과",
  description: "별빛 상담사의 타로 리딩 결과 — 과거·현재·미래 카드 해석과 따뜻한 조언을 확인하세요.",
  keywords: ["별빛 타로", "AI 타로", "타로 결과", "타로 해석", "타로 리딩"],
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
