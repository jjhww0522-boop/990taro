import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "나의 타로 도감",
  description: "지금까지 뽑은 타로 카드를 모아보세요. 별빛 타로에서 만난 카드 컬렉션을 확인할 수 있어요.",
  keywords: ["별빛 타로", "타로 도감", "카드 컬렉션", "타로 카드 모으기"],
  robots: { index: false, follow: true },
};

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
