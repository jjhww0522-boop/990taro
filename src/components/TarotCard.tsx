"use client";

type TarotCardProps = {
  name: string;
  direction: "정방향" | "역방향";
  keyword: string;
  className?: string;
};

export function TarotCard({ name, direction, keyword, className = "" }: TarotCardProps) {
  return (
    <article
      className={`h-full w-full overflow-hidden rounded-xl border-2 border-[#8C1C1C]/30 bg-gradient-to-b from-[#1C1C1E] to-[#121212] p-2.5 shadow-lg ${className}`}
    >
      <div className="flex h-full flex-col">
        <span className="self-start rounded-full bg-[#3A0F0F] border border-[#8C1C1C]/40 px-2 py-0.5 text-[9px] text-[#E0E0E0]">
          {direction}
        </span>
        <div className="flex-1 flex items-center justify-center text-center px-1">
          <p className="font-serif text-base text-[#E0E0E0] leading-tight">{name}</p>
        </div>
        <p className="text-[10px] text-[#828282] text-center leading-snug">{keyword}</p>
      </div>
    </article>
  );
}
