import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-8"
        style={{
          background: "rgba(232, 201, 106, 0.08)",
          border: "1px solid rgba(232, 201, 106, 0.2)",
        }}
      >
        ✨
      </div>

      <h1 className="text-2xl font-bold text-[#ffd98e] mb-3">
        별빛이 닿지 않는 곳이에요
      </h1>

      <p className="text-[#fef9f0]/50 text-sm leading-relaxed max-w-sm mb-2">
        찾으시는 페이지가 존재하지 않거나, 이동되었을 수 있어요.
        별빛 타로의 다른 페이지를 둘러보시는 건 어떨까요?
      </p>

      <p className="text-[#fef9f0]/30 text-xs mb-8">
        혹시 타로 리딩 결과를 찾고 계신다면, 리딩은 브라우저 세션에 저장되어
        새로운 리딩을 시작하면 이전 결과는 사라져요.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, rgba(232,201,106,0.9), rgba(200,160,70,0.9))",
            color: "#0c1020",
            boxShadow: "0 0 20px rgba(232,201,106,0.2)",
          }}
        >
          타로 리딩 시작하기
        </Link>

        <Link
          href="/guide"
          className="rounded-xl px-6 py-3 text-sm text-[#fef9f0]/60 hover:text-[#fef9f0] transition-colors"
          style={{
            border: "1px solid rgba(254,249,240,0.12)",
          }}
        >
          입문 가이드 보기
        </Link>
      </div>
    </div>
  );
}
