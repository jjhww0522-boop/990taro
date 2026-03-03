import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 소개",
  description: "별빛 타로 서비스 소개, 무료/프리미엄 이용권 비교, 자주 묻는 질문. AI 별빛 상담사와 함께하는 타로 리딩.",
  keywords: ["별빛 타로", "AI 타로 서비스", "타로 이용권", "프리미엄 타로"],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
