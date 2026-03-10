"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
const TOTAL = MAJOR_ARCANA.length; // 22

// 무한 루프를 위해 카드를 3배 복제 [0..21, 0..21, 0..21]
// 실제 카드 인덱스는 virtualIndex % TOTAL로 계산
const VIRTUAL_COUNT = TOTAL * 3;

export default function PickPage() {
  const router = useRouter();

  // ── 상태 ───────────────────────────────────────────────────────────────
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [exitPhase, setExitPhase] = useState<"idle" | "scatter">("idle");
  const [isMobile, setIsMobile] = useState(false);

  // 가상 스크롤 오프셋 (픽셀 단위, 음수 가능)
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0); // 렌더 최적화용 ref

  // 드래그 상태
  const drag = useRef({ active: false, startX: 0, lastX: 0, velocity: 0, ts: 0 });
  const inertiaRaf = useRef<number | null>(null);
  const suppressClick = useRef(false);

  // 카드 크기 (PC)
  const CARD_W = 172;
  const CARD_OVERLAP = 45; // 겹치는 픽셀
  const STEP = CARD_W - CARD_OVERLAP; // 카드 1장당 가로 이동량

  // 모바일 카드 크기
  const M_CARD_W = 128;
  const M_OVERLAP = 60;
  const M_STEP = M_CARD_W - M_OVERLAP;

  const selectedSet = useMemo(
    () => new Set(selectedCards.map((c) => c.cardIndex)),
    [selectedCards],
  );

  const scatterValues = useMemo(
    () =>
      Array.from({ length: TOTAL }, () => ({
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
        : "세 장의 카드를 골라주세요";

  const showCounter = exitPhase === "idle" && selectedCards.length < MAX_SELECT;

  // ── 카드 선택 토글 ────────────────────────────────────────────────────
  const toggleCard = useCallback(
    (cardIndex: number) => {
      if (exitPhase !== "idle") return;
      if (selectedSet.has(cardIndex)) {
        setSelectedCards((prev) => prev.filter((c) => c.cardIndex !== cardIndex));
        return;
      }
      if (selectedCards.length >= MAX_SELECT) return;
      const card = MAJOR_ARCANA[cardIndex];
      setSelectedCards((prev) => [
        ...prev,
        {
          slot: prev.length + 1,
          cardIndex,
          name: card.name,
          image: card.image,
          isReversed: Math.random() < 0.3,
        },
      ]);
    },
    [exitPhase, selectedSet, selectedCards.length],
  );

  // ── 3장 선택 완료 → 결과 페이지 이동 ──────────────────────────────────
  useEffect(() => {
    if (selectedCards.length !== MAX_SELECT) return;
    const t1 = window.setTimeout(() => setExitPhase("scatter"), 2100);
    const t2 = window.setTimeout(() => {
      sessionStorage.setItem("selectedCards", JSON.stringify(selectedCards));
      router.push("/result");
    }, 3500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [selectedCards, router]);

  // ── 화면 크기 감지 ───────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const devMobile = document.body.classList.contains("dev-mobile-view");
      setIsMobile(window.innerWidth < 768 || devMobile);
    };
    check();
    window.addEventListener("resize", check);
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => { window.removeEventListener("resize", check); obs.disconnect(); };
  }, []);

  // ── 초기 오프셋: 중간 복사본의 첫 번째 카드 시작점 ──────────────────
  useEffect(() => {
    const step = isMobile ? M_STEP : STEP;
    const initial = -(TOTAL * step); // 중간 복사본 시작 위치
    setOffset(initial);
    offsetRef.current = initial;
  }, [isMobile, STEP, M_STEP]);

  // ── 무한 루프: 오프셋이 경계를 벗어나면 중앙으로 순간이동 ────────────
  const wrapOffset = useCallback(
    (raw: number) => {
      const step = isMobile ? M_STEP : STEP;
      const totalWidth = TOTAL * step;
      // raw가 0보다 크면 (오른쪽으로 너무 많이 이동) → 중간 복사본으로 점프
      if (raw > 0) {
        return raw - totalWidth;
      }
      // raw가 -2*totalWidth보다 작으면 (왼쪽으로 너무 많이 이동) → 중간 복사본으로 점프
      if (raw < -totalWidth * 2) {
        return raw + totalWidth;
      }
      return raw;
    },
    [isMobile, STEP, M_STEP],
  );

  // ── 관성 감속 ────────────────────────────────────────────────────────
  const startInertia = useCallback(
    (velocity: number) => {
      if (inertiaRaf.current) cancelAnimationFrame(inertiaRaf.current);
      let vel = velocity;
      const tick = () => {
        if (Math.abs(vel) < 0.5) return;
        vel *= 0.93; // 감속 계수
        const next = wrapOffset(offsetRef.current + vel);
        offsetRef.current = next;
        setOffset(next);
        inertiaRaf.current = requestAnimationFrame(tick);
      };
      inertiaRaf.current = requestAnimationFrame(tick);
    },
    [wrapOffset],
  );

  // ── 포인터 이벤트 (마우스 드래그) ───────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (exitPhase !== "idle" || e.button !== 0) return;
    if (inertiaRaf.current) cancelAnimationFrame(inertiaRaf.current);
    drag.current = { active: true, startX: e.clientX, lastX: e.clientX, velocity: 0, ts: Date.now() };
    suppressClick.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    if (Math.abs(e.clientX - drag.current.startX) > 6) {
      suppressClick.current = true;
      setIsDragging(true);
    }
    const now = Date.now();
    drag.current.velocity = dx / Math.max(1, now - drag.current.ts) * 16; // px/frame
    drag.current.lastX = e.clientX;
    drag.current.ts = now;
    const next = wrapOffset(offsetRef.current + dx * 1.3);
    offsetRef.current = next;
    setOffset(next);
  };

  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setIsDragging(false);
    startInertia(drag.current.velocity * 1.3);
    window.setTimeout(() => { suppressClick.current = false; }, 0);
  };

  // ── 휠 스크롤 ────────────────────────────────────────────────────────
  const onWheel = (e: React.WheelEvent) => {
    if (exitPhase !== "idle") return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const next = wrapOffset(offsetRef.current - delta);
    offsetRef.current = next;
    setOffset(next);
  };

  // ── 터치 이벤트 (모바일) ─────────────────────────────────────────────
  const touchRef = useRef({ active: false, lastX: 0, velocity: 0, ts: 0 });

  const onTouchStart = (e: React.TouchEvent) => {
    if (exitPhase !== "idle") return;
    if (inertiaRaf.current) cancelAnimationFrame(inertiaRaf.current);
    touchRef.current = { active: true, lastX: e.touches[0].clientX, velocity: 0, ts: Date.now() };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current.active) return;
    const dx = e.touches[0].clientX - touchRef.current.lastX;
    const now = Date.now();
    touchRef.current.velocity = dx / Math.max(1, now - touchRef.current.ts) * 16;
    touchRef.current.lastX = e.touches[0].clientX;
    touchRef.current.ts = now;
    const next = wrapOffset(offsetRef.current + dx * 1.3);
    offsetRef.current = next;
    setOffset(next);
  };

  const onTouchEnd = () => {
    touchRef.current.active = false;
    startInertia(touchRef.current.velocity * 1.3);
  };

  // ── PC 카드 렌더러 ────────────────────────────────────────────────────
  const renderPcCard = (virtualIdx: number) => {
    const cardIndex = virtualIdx % TOTAL;
    const cardData = MAJOR_ARCANA[cardIndex];
    const selectedData = selectedCards.find((c) => c.cardIndex === cardIndex);
    const isSelected = Boolean(selectedData);
    const isHovered = hoveredCard === cardIndex;
    const isReversed = selectedData?.isReversed ?? false;
    const order = selectedCards.findIndex((c) => c.cardIndex === cardIndex) + 1;
    const zIndex = exitPhase === "scatter" && isSelected ? 400 : isSelected ? 320 + virtualIdx : isHovered ? 220 + virtualIdx : virtualIdx;
    const sv = scatterValues[cardIndex];

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

    const leftPos = virtualIdx * STEP;

    return (
      <motion.div
        key={`pc-${virtualIdx}`}
        data-tarot-card="true"
        onMouseEnter={() => !isDragging && exitPhase === "idle" && setHoveredCard(cardIndex)}
        onMouseLeave={() => setHoveredCard((p) => (p === cardIndex ? null : p))}
        onClick={() => {
          if (suppressClick.current || isDragging) return;
          toggleCard(cardIndex);
        }}
        whileHover={exitPhase === "idle" ? { y: isSelected ? -30 : -20 } : undefined}
        animate={cardAnimate}
        transition={cardTransition}
        className="absolute h-[256px] w-[172px] cursor-pointer"
        style={{ left: `${leftPos}px`, top: "60px", zIndex }}
      >
        {isSelected && exitPhase === "scatter" && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0] }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            style={{ background: "radial-gradient(ellipse at center, rgba(232,201,106,0.6) 0%, transparent 70%)", filter: "blur(10px)" }}
          />
        )}
        {/* 플립 컨테이너 — z-index 1 */}
        <motion.div className="relative h-full w-full" style={{ zIndex: 1 }} animate={{ rotateY: isSelected ? 180 : 0 }} transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tarot/cards/back_00.jpg" alt="타로 카드 뒷면" draggable={false} className="absolute inset-0 w-full h-full object-cover rounded-lg moonlight-glow bg-[#1A0A00]" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }} />
        </motion.div>
        {/* 앞면 오버레이 — 선택 시에만 마운트, initial:0→1 보장 */}
        {isSelected && (
          <motion.div className="absolute inset-0 rounded-lg overflow-hidden" style={{ zIndex: 2, filter: "drop-shadow(0 0 20px rgba(212,175,55,0.6))" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.9 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img src={`/tarot/cards/major_${String(cardIndex).padStart(2, "0")}.jpg`} alt={cardData.name} draggable={false} className="absolute inset-0 w-full h-full object-cover rounded-lg bg-[#0A0503]" animate={{ rotate: isReversed ? 180 : 0 }} transition={{ duration: 1.5 }} />
            {isReversed && (<motion.div className="absolute inset-0 bg-gradient-to-t from-[#8B1A1A]/50 to-transparent rounded-lg" animate={{ opacity: [0.18, 0.45, 0.18] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />)}
            <div className="absolute inset-x-0 bottom-0 top-1/2 pointer-events-none overflow-hidden rounded-b-lg">
              {Array.from({ length: 15 }).map((_, pIdx) => (
                <motion.div key={`dust-${pIdx}`} className="absolute bottom-4 w-1 h-1 rounded-full bg-[#D4AF37]" initial={{ opacity: 0, x: "50%", y: 0, scale: 0 }} animate={{ opacity: [0, 0.9, 0], x: `${50 + (Math.random() * 100 - 50)}%`, y: -(Math.random() * 80 + 30), scale: Math.random() * 1.5 + 0.5 }} transition={{ duration: 1.2 + Math.random() * 0.8, delay: 1.1 + Math.random() * 0.4, ease: "easeOut" }} style={{ left: `${Math.random() * 80 + 10}%`, boxShadow: "0 0 8px #D4AF37" }} />
              ))}
            </div>
          </motion.div>
        )}
        {isSelected && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: exitPhase === "scatter" ? 0 : 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }} className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center w-full whitespace-nowrap" style={{ bottom: "-65px" }}>
            <span className="mb-1 text-[10px] font-medium tracking-[0.1em] text-[#e8c96a] uppercase font-serif drop-shadow-md">{cardData.id === 0 ? "0" : cardData.id}. {cardData.original}</span>
            <span className="text-[14px] font-bold tracking-[0.15em] text-[#fef9f0] font-serif drop-shadow-lg">{cardData.name}</span>
          </motion.div>
        )}
        {isSelected && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: exitPhase === "scatter" ? 0 : 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap" style={{ top: "-55px" }}>
            <div className="rounded-full bg-black/70 px-6 py-2.5 backdrop-blur-md border border-[#e8c96a]/40 shadow-[0_0_15px_rgba(232,201,106,0.2)] flex items-center justify-center">
              <span className="text-[14px] font-serif tracking-[0.1em] text-[#fef9f0] drop-shadow-[0_0_8px_rgba(232,201,106,0.8)]">{order === 1 ? "과거 (첫 번째 패)" : order === 2 ? "현재 (두 번째 패)" : "미래 (세 번째 패)"}</span>
            </div>
          </motion.div>
        )}
        {isSelected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: exitPhase === "scatter" ? 0 : 1, y: 0 }} transition={{ delay: exitPhase === "scatter" ? 0 : 1.2, duration: 0.5 }} className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-40" style={{ bottom: "12px" }}>
            <div className={`relative px-3 py-1 rounded-md font-semibold text-[10px] tracking-widest backdrop-blur-md shadow-xl border ${isReversed ? "bg-[#2A0505]/90 text-[#FF8888] border-[#8B1A1A]/80" : "bg-[#1A0A00]/90 text-[#D4AF37] border-[#D4AF37]/60"}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-md" />
              <span className="relative drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{isReversed ? "逆" : "正"}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // ── 모바일 카드 렌더러 ────────────────────────────────────────────────
  const renderMobileCard = (virtualIdx: number) => {
    const cardIndex = virtualIdx % TOTAL;
    const cardData = MAJOR_ARCANA[cardIndex];
    const selectedData = selectedCards.find((c) => c.cardIndex === cardIndex);
    const isSelected = Boolean(selectedData);
    const isReversed = selectedData?.isReversed ?? false;
    const order = selectedCards.findIndex((c) => c.cardIndex === cardIndex) + 1;
    const zIndex = exitPhase === "scatter" && isSelected ? 400 : isSelected ? 320 + virtualIdx : virtualIdx;
    const sv = scatterValues[cardIndex];

    const cardAnimate =
      exitPhase === "scatter"
        ? isSelected
          ? { y: -250, opacity: 0, scale: 1.1, x: 0, rotate: 0 }
          : { x: sv.x, y: sv.y, rotate: sv.rotate, opacity: 0, scale: 0.4 }
        : { y: isSelected ? -20 : 0, scale: isSelected ? 1.05 : 1, x: 0, opacity: 1 };
    const cardTransition =
      exitPhase === "scatter"
        ? isSelected
          ? { duration: 1.1, delay: 0.28, ease: [0.22, 0, 0.1, 1] as [number, number, number, number] }
          : { duration: 0.62, delay: sv.delay, ease: [0.4, 0, 1, 1] as [number, number, number, number] }
        : { duration: 0.6, ease: "easeOut" as const };

    const leftPos = virtualIdx * M_STEP;

    return (
      <motion.div
        key={`mob-${virtualIdx}`}
        data-tarot-card="true"
        onClick={() => { if (exitPhase !== "idle") return; toggleCard(cardIndex); }}
        animate={cardAnimate}
        transition={cardTransition}
        className="absolute shrink-0 cursor-pointer h-[190px] w-[128px]"
        style={{ left: `${leftPos}px`, top: "50px", zIndex }}
      >
        {isSelected && exitPhase === "scatter" && (
          <motion.div className="absolute inset-0 rounded-lg pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.75, 0] }} transition={{ duration: 0.9, delay: 0.2 }} style={{ background: "radial-gradient(ellipse at center, rgba(232,201,106,0.6) 0%, transparent 70%)", filter: "blur(10px)" }} />
        )}
        {/* 플립 컨테이너 — z-index 1 */}
        <motion.div className="relative h-full w-full" style={{ zIndex: 1 }} animate={{ rotateY: isSelected ? 180 : 0 }} transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tarot/cards/back_00.jpg" alt="타로 카드 뒷면" draggable={false} className="absolute inset-0 w-full h-full object-cover rounded-lg moonlight-glow bg-[#1A0A00]" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }} />
        </motion.div>
        {/* 앞면 오버레이 — 선택 시에만 마운트 */}
        {isSelected && (
          <motion.div className="absolute inset-0 rounded-lg overflow-hidden" style={{ zIndex: 2, filter: "drop-shadow(0 0 16px rgba(212,175,55,0.6))" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.9 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img src={`/tarot/cards/major_${String(cardIndex).padStart(2, "0")}.jpg`} alt={cardData.name} draggable={false} className="absolute inset-0 w-full h-full object-cover rounded-lg bg-[#0A0503]" animate={{ rotate: isReversed ? 180 : 0 }} transition={{ duration: 1.5 }} />
            {isReversed && (<motion.div className="absolute inset-0 bg-gradient-to-t from-[#8B1A1A]/50 to-transparent rounded-lg" animate={{ opacity: [0.18, 0.45, 0.18] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />)}
          </motion.div>
        )}
        {isSelected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: exitPhase === "scatter" ? 0 : 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center w-full whitespace-nowrap" style={{ bottom: "-52px" }}>
            <span className="text-[9px] font-medium tracking-[0.1em] text-[#e8c96a] uppercase font-serif">{cardData.id === 0 ? "0" : cardData.id}. {cardData.original}</span>
            <span className="text-[11px] font-bold tracking-[0.12em] text-[#fef9f0] font-serif">{cardData.name}</span>
          </motion.div>
        )}
        {isSelected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: exitPhase === "scatter" ? 0 : 1 }} transition={{ duration: 0.4 }} className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap" style={{ top: "-42px" }}>
            <div className="rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-md border border-[#e8c96a]/40 flex items-center justify-center">
              <span className="text-[10px] font-serif tracking-[0.08em] text-[#fef9f0]">{order === 1 ? "과거" : order === 2 ? "현재" : "미래"}</span>
            </div>
          </motion.div>
        )}
        {isSelected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: exitPhase === "scatter" ? 0 : 1 }} transition={{ delay: exitPhase === "scatter" ? 0 : 1.2, duration: 0.5 }} className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-40" style={{ bottom: "8px" }}>
            <div className={`px-2 py-0.5 rounded text-[9px] font-semibold backdrop-blur-md border ${isReversed ? "bg-[#2A0505]/90 text-[#FF8888] border-[#8B1A1A]/80" : "bg-[#1A0A00]/90 text-[#D4AF37] border-[#D4AF37]/60"}`}>
              {isReversed ? "逆" : "正"}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // ── 렌더 ──────────────────────────────────────────────────────────────
  const step = isMobile ? M_STEP : STEP;
  const cardH = isMobile ? 190 : 256;
  const totalVirtualWidth = VIRTUAL_COUNT * step;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#DCD8C0]">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 md:px-10">
        <header className="mb-4 text-center" style={{ marginTop: "20px" }}>
          <h1 className="text-sm md:text-3xl font-bold tracking-tight text-[#DCD8C0] drop-shadow-[0_0_14px_rgba(140,39,39,0.45)] whitespace-nowrap">
            {statusText}
          </h1>
          {showCounter && (
            <p className="mt-1 text-xs md:text-base tracking-widest text-[#e8c96a]/80">
              {selectedCards.length} / 3
            </p>
          )}
        </header>

        <section className="overflow-visible flex-1 flex items-center">
          {/* 드래그 캡처 영역 */}
          <div
            className={`w-full overflow-hidden select-none ${exitPhase !== "idle" ? "pointer-events-none" : isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: "none" }}
          >
            {/* 카드 트랙 — transform으로 이동, 총 너비는 가상 66장 */}
            <div
              className="relative"
              style={{
                width: `${totalVirtualWidth}px`,
                height: `${cardH + (isMobile ? 220 : 320)}px`,
                transform: `translateX(${offset + (isMobile ? 60 : 120)}px)`,
                willChange: "transform",
              }}
            >
              {Array.from({ length: VIRTUAL_COUNT }, (_, vi) =>
                isMobile ? renderMobileCard(vi) : renderPcCard(vi),
              )}
            </div>
          </div>
        </section>

        <p
          className="text-center text-sm tracking-wide text-[#fef9f0]/70 md:text-base transition-opacity duration-500"
          style={{ marginTop: "42px", opacity: exitPhase === "idle" ? 1 : 0 }}
        >
          카드를 좌우로 드래그해서 둘러보세요 — 계속 돌아가요 ↻
        </p>
      </div>
    </main>
  );
}
