"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MAJOR_ARCANA } from "../../lib/tarotData";

type SelectedCard = {
  slot: number;
  cardIndex: number;
  name: string;
  image: string;
  isReversed: boolean;
};

const MAX_SELECT = 3;
const DRAG_START_THRESHOLD = 6;
const DRAG_SCROLL_MULTIPLIER = 1.3;

export default function PickPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const suppressClickRef = useRef(false);

  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [exitPhase, setExitPhase] = useState<"idle" | "scatter">("idle");

  const selectedSet = useMemo(
    () => new Set(selectedCards.map((card) => card.cardIndex)),
    [selectedCards],
  );

  // 카드별 랜덤 흩어짐 방향 — 마운트 시 1회 계산
  const scatterValues = useMemo(
    () =>
      Array.from({ length: 22 }, () => ({
        x: (Math.random() - 0.5) * 1600,
        y: -(260 + Math.random() * 520),
        rotate: (Math.random() - 0.5) * 55,
        delay: Math.random() * 0.22,
      })),
    [],
  );

  const statusText =
    exitPhase === "scatter"
      ? "별빛이 카드를 거두고 있어요 ✨"
      : selectedCards.length >= MAX_SELECT
        ? "선택이 완료되었어요 ✨"
        : `세 장의 카드를 골라주세요 ( ${selectedCards.length} / 3 )`;

  const toggleCard = (cardIndex: number) => {
    if (exitPhase !== "idle") return;
    const exists = selectedSet.has(cardIndex);
    if (exists) {
      setSelectedCards((prev) => prev.filter((card) => card.cardIndex !== cardIndex));
      return;
    }
    if (selectedCards.length >= MAX_SELECT) return;

    const card = MAJOR_ARCANA[cardIndex];
    const next: SelectedCard = {
      slot: selectedCards.length + 1,
      cardIndex,
      name: card.name,
      image: card.image,
      isReversed: Math.random() < 0.3,
    };
    setSelectedCards((prev) => [...prev, next]);
  };

  useEffect(() => {
    if (selectedCards.length !== MAX_SELECT) return;

    // 플립 애니메이션(~2.2s) 완료 후 흩어지기 시작
    const scatterTimer = window.setTimeout(() => {
      setExitPhase("scatter");
    }, 2100);

    // 흩어지기 완료 후 페이지 이동
    const navTimer = window.setTimeout(() => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("selectedCards", JSON.stringify(selectedCards));
      }
      router.push("/result");
    }, 3500);

    return () => {
      window.clearTimeout(scatterTimer);
      window.clearTimeout(navTimer);
    };
  }, [selectedCards, router]);

  const handleWheelHorizontal = (event: React.WheelEvent<HTMLDivElement>) => {
    if (exitPhase !== "idle") return;
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (exitPhase !== "idle") return;
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    dragStateRef.current = {
      isDown: true,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !dragStateRef.current.isDown) return;
    const deltaX = event.clientX - dragStateRef.current.startX;
    if (Math.abs(deltaX) > DRAG_START_THRESHOLD) {
      dragStateRef.current.moved = true;
      suppressClickRef.current = true;
      setIsDragging(true);
    }
    if (!dragStateRef.current.moved) return;
    el.scrollLeft = dragStateRef.current.startScrollLeft - deltaX * DRAG_SCROLL_MULTIPLIER;
  };

  const endPointerDrag = () => {
    const el = scrollRef.current;
    if (!el || !dragStateRef.current.isDown) return;
    dragStateRef.current.isDown = false;
    setIsDragging(false);
    if (dragStateRef.current.moved) {
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
      return;
    }
    suppressClickRef.current = false;
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#DCD8C0]">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 md:px-10">
        <header className="mb-6 text-center" style={{ marginTop: "26px" }}>
          <h1 className="text-xl leading-relaxed text-[#DCD8C0] drop-shadow-[0_0_14px_rgba(140,39,39,0.45)] md:text-3xl">
            {statusText}
          </h1>
        </header>

        <section className="overflow-visible">
          <div
            ref={scrollRef}
            onWheel={handleWheelHorizontal}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPointerDrag}
            onPointerCancel={endPointerDrag}
            onPointerLeave={endPointerDrag}
            className={`w-full overflow-x-auto overflow-y-visible scrollbar-hide px-6 md:px-12 touch-pan-x select-none ${exitPhase !== "idle"
              ? "pointer-events-none"
              : isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              }`}
          >
            <div
              className="relative flex min-w-max items-center justify-start pr-24"
              style={{ paddingTop: "180px", paddingBottom: "122px" }}
            >
              {Array.from({ length: 22 }).map((_, i) => {
                const cardData = MAJOR_ARCANA[i];
                const selectedData = selectedCards.find((card) => card.cardIndex === i);
                const isSelected = Boolean(selectedData);
                const isHovered = hoveredCard === i;
                const isReversed = selectedData?.isReversed ?? false;
                const order = selectedCards.findIndex((card) => card.cardIndex === i) + 1;

                const zIndex =
                  exitPhase === "scatter" && isSelected
                    ? 400
                    : isSelected
                      ? 320 + i
                      : isHovered
                        ? 220 + i
                        : i;

                const sv = scatterValues[i];

                // ── 위치/투명도 애니메이션 ──
                const cardAnimate =
                  exitPhase === "scatter"
                    ? isSelected
                      ? { y: -340, opacity: 0, scale: 1.1, x: 0, rotate: 0 }
                      : { x: sv.x, y: sv.y, rotate: sv.rotate, opacity: 0, scale: 0.4 }
                    : { y: isSelected ? -30 : 0, scale: isSelected ? 1.05 : 1, x: 0, opacity: 1 };

                const cardTransition =
                  exitPhase === "scatter"
                    ? isSelected
                      ? { duration: 1.1, delay: 0.28, ease: [0.22, 0, 0.1, 1] as [number, number, number, number] }
                      : { duration: 0.62, delay: sv.delay, ease: [0.4, 0, 1, 1] as [number, number, number, number] }
                    : { duration: 0.6, ease: "easeOut" as const };

                return (
                  <motion.div
                    key={i}
                    data-tarot-card="true"
                    onMouseEnter={() => !isDragging && exitPhase === "idle" && setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard((prev) => (prev === i ? null : prev))}
                    onClick={() => {
                      if (suppressClickRef.current || isDragging) return;
                      toggleCard(i);
                    }}
                    whileHover={exitPhase === "idle" ? { y: isSelected ? -30 : -20 } : undefined}
                    animate={cardAnimate}
                    transition={cardTransition}
                    className="relative h-[256px] w-[172px] shrink-0 cursor-pointer"
                    style={{ marginLeft: i === 0 ? 0 : -45, zIndex, perspective: "1000px" }}
                  >
                    {/* 선택 카드 골드 글로우 — scatter 진입 시 */}
                    {isSelected && exitPhase === "scatter" && (
                      <motion.div
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.75, 0] }}
                        transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
                        style={{
                          background:
                            "radial-gradient(ellipse at center, rgba(232,201,106,0.6) 0%, transparent 70%)",
                          filter: "blur(10px)",
                        }}
                      />
                    )}

                    {/* 카드 플립 래퍼 */}
                    <motion.div
                      className="relative h-full w-full"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: isSelected ? 180 : 0 }}
                      transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* 뒷면 */}
                      <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          filter: isSelected
                            ? "drop-shadow(0 0 20px rgba(212,175,55,0.6))"
                            : "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                          overflow: "visible",
                        }}
                      >
                        <img
                          src="/cards/back_00.jpg"
                          alt="타로 카드 뒷면"
                          draggable={false}
                          className="h-full w-full object-contain bg-[#1A0A00] rounded-lg moonlight-glow"
                        />
                      </div>

                      {/* 앞면 */}
                      <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          transform: "rotateY(180deg)",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          filter: isSelected
                            ? "drop-shadow(0 0 20px rgba(212,175,55,0.6))"
                            : "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                          overflow: "visible",
                        }}
                      >
                        <motion.img
                          src={`/cards/major_${String(i).padStart(2, "0")}.jpg`}
                          alt={cardData.name}
                          draggable={false}
                          className="h-full w-full object-contain bg-[#0A0503] rounded-lg"
                          animate={{ rotate: isReversed ? 180 : 0 }}
                          transition={{ duration: 1.5 }}
                        />
                        {isReversed && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-[#8B1A1A]/50 to-transparent rounded-lg"
                            animate={{ opacity: [0.18, 0.45, 0.18] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                        {/* (이름 텍스트는 이제 카드 바깥으로 뺐습니다) */}
                        {/* 🌟 3. 금가루(Gold Dust) 흩날리는 게임 같은 타격감 파티클 애니메이션 */}
                        {isSelected && (
                          <div className="absolute inset-x-0 bottom-0 top-1/2 pointer-events-none overflow-hidden rounded-b-lg">
                            {Array.from({ length: 15 }).map((_, pIdx) => (
                              <motion.div
                                key={`dust-${pIdx}`}
                                className="absolute bottom-4 w-[2px] h-[2px] md:w-1 md:h-1 rounded-full bg-[#D4AF37]"
                                initial={{ opacity: 0, x: "50%", y: 0, scale: 0 }}
                                animate={{
                                  opacity: [0, 0.9, 0],
                                  x: `${50 + (Math.random() * 100 - 50)}%`,
                                  y: - (Math.random() * 80 + 30),
                                  scale: Math.random() * 1.5 + 0.5
                                }}
                                transition={{
                                  duration: 1.2 + Math.random() * 0.8,
                                  delay: 1.1 + Math.random() * 0.4,
                                  ease: "easeOut"
                                }}
                                style={{
                                  left: `${Math.random() * 80 + 10}%`,
                                  boxShadow: "0 0 8px #D4AF37",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* 🌟 1. 카드 밑에 뜨는 설명 박스 (절대 위치 고정) */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: exitPhase === "scatter" ? 0 : 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center w-full whitespace-nowrap"
                        style={{ bottom: "-65px" }}
                      >
                        <span
                          className="mb-1 text-[9px] md:text-[10px] font-medium tracking-[0.1em] text-[#e8c96a] uppercase font-serif drop-shadow-md"
                        >
                          {cardData.id === 0 ? "0" : cardData.id}. {cardData.original}
                        </span>
                        <span
                          className="text-[12px] md:text-[14px] font-bold tracking-[0.15em] text-[#fef9f0] font-serif drop-shadow-lg"
                        >
                          {cardData.name}
                        </span>
                      </motion.div>
                    )}

                    {/* 🌟 2. 선택 순서 배지 - 우아한 글래스모피즘 + 의미 부여 (과거/현재/미래) */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: exitPhase === "scatter" ? 0 : 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
                        style={{ top: "-55px" }}
                      >
                        <div className="rounded-full bg-black/70 px-6 py-2.5 backdrop-blur-md border border-[#e8c96a]/40 shadow-[0_0_15px_rgba(232,201,106,0.2)] flex items-center justify-center">
                          <span className="text-[12px] md:text-[14px] font-serif tracking-[0.1em] text-[#fef9f0] drop-shadow-[0_0_8px_rgba(232,201,106,0.8)]">
                            {order === 1 ? "과거 (첫 번째 패)" : order === 2 ? "현재 (두 번째 패)" : "미래 (세 번째 패)"}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* 정방향/역방향 배지 */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: exitPhase === "scatter" ? 0 : 1, y: 0 }}
                        transition={{
                          delay: exitPhase === "scatter" ? 0 : 1.2,
                          duration: 0.5,
                        }}
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-40"
                        style={{ bottom: "12px" }}
                      >
                        <div
                          className={`relative px-3 py-1 rounded-md font-semibold text-[10px] tracking-widest backdrop-blur-md shadow-xl border ${isReversed
                            ? "bg-[#2A0505]/90 text-[#FF8888] border-[#8B1A1A]/80"
                            : "bg-[#1A0A00]/90 text-[#D4AF37] border-[#D4AF37]/60"
                            }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-md" />
                          <span className="relative drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                            {isReversed ? "逆" : "正"}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <p
          className="text-center text-sm tracking-wide text-[#fef9f0]/70 md:text-base transition-opacity duration-500"
          style={{ marginTop: "42px", opacity: exitPhase === "idle" ? 1 : 0 }}
        >
          카드를 좌우로 드래그해서 둘러보세요
        </p>
      </div>
    </main>
  );
}
