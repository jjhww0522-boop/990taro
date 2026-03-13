import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "카드 셔플",
  description: "별빛이 당신의 카드를 섞고 있어요. 잠시 마음을 가다듬고 질문에 집중해 보세요.",
  keywords: ["별빛 타로", "AI 타로", "카드 셔플", "타로 카드"],
  robots: { index: false, follow: true },
};

export default function ShuffleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
