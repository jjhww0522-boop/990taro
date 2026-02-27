import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "카드 선택 | 월하 타로",
  description: "22장의 패에서 운명의 3장을 고르는 동양 타로 카드 선택 화면",
  keywords: ["동양 타로", "무녀 점사", "카드 선택"],
};

export default function PickLayout({ children }: { children: React.ReactNode }) {
  return children;
}
