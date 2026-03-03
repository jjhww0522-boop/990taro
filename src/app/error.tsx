"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
        style={{
          background: "rgba(212, 107, 107, 0.1)",
          border: "1px solid rgba(212, 107, 107, 0.25)",
        }}
      >
        ⚠️
      </div>

      <h1 className="text-xl font-bold text-[#d46b6b] mb-2">
        별빛이 잠시 흐려졌어요
      </h1>

      <p className="text-[#fef9f0]/50 text-sm leading-relaxed max-w-xs mb-8">
        일시적인 문제가 발생했어요. 잠시 후 다시 시도해 주세요.
      </p>

      <button
        onClick={reset}
        className="rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.97]"
        style={{
          background: "linear-gradient(135deg, rgba(232,201,106,0.9), rgba(200,160,70,0.9))",
          color: "#0c1020",
        }}
      >
        다시 시도하기
      </button>
    </div>
  );
}
