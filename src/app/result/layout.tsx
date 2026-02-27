import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "신탁 결과 | 월하 타로",
  description: "무녀 청령의 동양 타로 점사 결과: 과거·현재·미래 해석과 조언",
  keywords: ["동양 타로", "무녀 점사", "타로 결과", "청령"],
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
