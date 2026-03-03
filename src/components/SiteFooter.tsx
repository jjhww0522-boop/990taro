import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-20 mt-auto w-full border-t border-[#e8c96a]/25 bg-black/30 px-4 py-5 text-xs text-[#fef9f0]/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 text-center">
        <p>대표: 별빛 타로 | 문의: support@990taro.com</p>
        <p>본 서비스의 결과는 재미와 참고용으로 제공됩니다.</p>
        <div className="flex flex-wrap items-center justify-center gap-1 underline-offset-2">
          <Link href="/about" className="hover:underline px-3">
            서비스 소개
          </Link>
          <span className="text-[#fef9f0]/30">·</span>
          <Link href="/privacy-policy" className="hover:underline px-3">
            개인정보처리방침
          </Link>
          <span className="text-[#fef9f0]/30">·</span>
          <Link href="/terms" className="hover:underline px-3">
            이용약관
          </Link>
        </div>
      </div>
    </footer>
  );
}
