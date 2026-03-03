import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "카드 선택",
  description: "22장의 타로 카드에서 운명의 3장을 골라보세요. 별빛 타로 AI 상담사가 당신의 카드를 해석해 드려요.",
  keywords: ["별빛 타로", "AI 타로", "카드 선택", "타로 카드 고르기"],
};

export default function PickLayout({ children }: { children: React.ReactNode }) {
  return children;
}
