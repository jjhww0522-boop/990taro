import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프리미엄 구매",
  description: "별빛 타로 프리미엄 24시간 이용권 결제. 990원으로 AI 타로 상담 5회, 심층 카드 분석을 이용하세요.",
  keywords: ["별빛 타로 프리미엄", "타로 이용권", "타로 결제"],
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
