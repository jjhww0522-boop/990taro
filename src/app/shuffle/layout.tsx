import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "카드 셔플 의식 | 월하 타로",
  description: "무녀 점사 전, 운명의 패를 섞는 신비로운 동양 타로 셔플 화면",
  keywords: ["동양 타로", "무녀 점사", "셔플"],
};

export default function ShuffleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
