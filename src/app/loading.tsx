export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16 mb-6">
        <div
          className="absolute inset-0 rounded-full border-[3px] animate-spin"
          style={{
            borderColor: "rgba(232, 201, 106, 0.15)",
            borderTopColor: "#e8c96a",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xl">
          ✨
        </div>
      </div>
      <p className="text-[#fef9f0]/40 text-sm">별빛이 모이고 있어요…</p>
    </div>
  );
}
