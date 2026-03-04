"use client";

import { useEffect, useState, useCallback, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "../../components/AdBanner";
import MinorCardPick from "../../components/MinorCardPick";
import { drawMinorCards, type MinorCard } from "../../lib/minorArcanaData";

type SelectedCard = { slot: number; cardIndex: number; name: string; image: string; isReversed: boolean };
type Divination = { past: string; present: string; future: string; overall: string; advice: string };
type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatPhase = "reading" | "chatting";

const RESULT_CACHE_KEY = "resultCache";
const CHAT_CACHE_KEY = "chatCache";

const POSITIONS = ["past", "present", "future"] as const;
const LABELS = ["과거", "현재", "미래"] as const;
const FREE_CONSULT_LIMIT = 2;
const PREMIUM_CONSULT_LIMIT = 5;

export default function ResultPage() {
  const router = useRouter();
  const [cards, setCards] = useState<SelectedCard[]>([]);
  const [result, setResult] = useState<Divination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const dragStartYRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [seenCards, setSeenCards] = useState<Set<number>>(new Set([0]));
  const [unlockFired, setUnlockFired] = useState(false);
  const [cardScaleRatio, setCardScaleRatio] = useState(1);

  const deviceIdRef = useRef("");
  const entitlementRef = useRef<string | null>(null);
  const payloadCardsRef = useRef<{ position: string; name: string; isReversed: boolean }[]>([]);
  const originalQuestionRef = useRef("");

  const [chatPhase, setChatPhase] = useState<ChatPhase>("reading");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [remainingTurns, setRemainingTurns] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showCardModal, setShowCardModal] = useState<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // 마이너 아르카나 상태
  const [minorCards, setMinorCards] = useState<MinorCard[]>([]);
  const [showMinorPick, setShowMinorPick] = useState(false);
  const [hasUsedMinor, setHasUsedMinor] = useState(false);
  const [suggestMinorDraw, setSuggestMinorDraw] = useState(false); // GPT가 제안할 때만 true

  const hasSeenAllCards = seenCards.size === 3 || chatPhase === "chatting";
  const isExhausted = remainingTurns === 0;

  useEffect(() => { if (hasSeenAllCards && !unlockFired) setUnlockFired(true); }, [hasSeenAllCards, unlockFired]);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight;
      setCardScaleRatio(vh < 750 ? Math.max(0.65, vh / 800) : 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const rawCards = sessionStorage.getItem("selectedCards");
    const question = sessionStorage.getItem("question") ?? "";
    const category = sessionStorage.getItem("category") ?? "종합 운세";
    const entitlement = localStorage.getItem("entitlementJwt");
    const cleanEntitlement = entitlement && !entitlement.startsWith("mock_") ? entitlement : null;
    if (entitlement?.startsWith("mock_")) localStorage.removeItem("entitlementJwt");

    let dId = localStorage.getItem("deviceId") ?? "";
    if (!dId) { dId = crypto.randomUUID?.() ?? `${Date.now()}`; localStorage.setItem("deviceId", dId); }

    deviceIdRef.current = dId;
    entitlementRef.current = cleanEntitlement;
    originalQuestionRef.current = question;
    setIsPremium(Boolean(cleanEntitlement));

    if (!rawCards) { router.replace("/"); return; }

    const parsed = (JSON.parse(rawCards) as SelectedCard[]).slice(0, 3);
    setCards(parsed);

    try {
      const collected: number[] = JSON.parse(localStorage.getItem("collectedCards") ?? "[]");
      localStorage.setItem("collectedCards", JSON.stringify(Array.from(new Set([...collected, ...parsed.map(c => c.cardIndex)]))));
    } catch { /* ignore */ }

    payloadCardsRef.current = parsed.map((c, i) => ({ position: POSITIONS[i], name: c.name, isReversed: c.isReversed }));

    // 캐시 키: 질문 + 카드 조합으로 유니크하게 생성 (다른 질문은 다른 캐시)
    const cacheKey = `${RESULT_CACHE_KEY}_${question}_${parsed.map(c => `${c.cardIndex}${c.isReversed ? "r" : "u"}`).join("_")}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setResult(JSON.parse(cached) as Divination);
        setIsLoading(false);
        return;
      } catch { /* 캐시 파싱 실패 시 무시하고 재호출 */ }
    }

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(dId ? { "x-device-id": dId } : {}), ...(cleanEntitlement ? { Authorization: `Bearer ${cleanEntitlement}` } : {}) },
      body: JSON.stringify({ question, category, cards: payloadCardsRef.current }),
    })
      .then(async res => {
        if (res.status === 429) { const p = await res.json() as { error?: string }; setLimitMessage(p.error ?? "오늘의 무료 해석은 모두 사용하셨어요."); setResult({ past: p.error ?? "", present: "990원으로 더 들으실 수 있어요.", future: "내일 다시 오세요.", overall: "오늘의 무료 해석은 여기까지예요.", advice: "프리미엄을 이용해 보세요." }); return; }
        const data = await res.json() as Divination;
        setResult(data);
        // 결과 캐시 저장 (새로고침 시 재사용, 동일 질문+카드 조합에만 적용)
        try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* ignore */ }
      })
      .catch(() => setResult({ past: "과거에는 정리되지 않은 감정들이 있었어요.", present: "지금은 중심을 잡고 생각할 시간이에요.", future: "곧 길이 열릴 거예요.", overall: "세 장의 카드는 용기를 내라고 말해요.", advice: "오늘 하루를 차분하게 보내세요." }))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading || !result) return;
    setIsChangingCard(true);
    setSeenCards(prev => new Set([...prev, currentIndex]));
    const t = setTimeout(() => setIsChangingCard(false), 900);
    return () => clearTimeout(t);
  }, [currentIndex, isLoading, result]);

  useEffect(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [chatMessages, isChatLoading]);

  const startChat = useCallback(async () => {
    console.log("🎯 startChat called! result:", !!result);
    setChatPhase("chatting");
    setIsChatLoading(true);
    try {
      const res = await fetch("/api/chat/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(deviceIdRef.current ? { "x-device-id": deviceIdRef.current } : {}), ...(entitlementRef.current ? { Authorization: `Bearer ${entitlementRef.current}` } : {}) },
        body: JSON.stringify({ cards: payloadCardsRef.current, initialReading: result, originalQuestion: originalQuestionRef.current, history: [] }),
      });
      if (res.status === 429) { const p = await res.json() as { error?: string }; setChatMessages([{ role: "assistant", content: p.error ?? "오늘의 무료 상담은 모두 사용하셨어요." }]); setRemainingTurns(0); return; }
      if (res.status === 401) { localStorage.removeItem("entitlementJwt"); entitlementRef.current = null; setChatMessages([{ role: "assistant", content: "안녕하세요! 별빛이 카드를 읽고 있어요. 어떤 것이 마음에 걸리는지 말씀해 주세요." }]); setRemainingTurns(FREE_CONSULT_LIMIT); return; }
      if (!res.ok) { const e = await res.json().catch(() => ({}) as { message?: string }); setChatMessages([{ role: "assistant", content: (e as { message?: string }).message ?? "별빛 연결이 잠시 끊어졌어요." }]); setRemainingTurns(FREE_CONSULT_LIMIT); return; }
      const data = await res.json() as { message: string; remainingTurns: number };
      setChatMessages([{ role: "assistant", content: data.message }]);
      setRemainingTurns(data.remainingTurns);
    } catch (err) {
      console.error("[startChat] error:", err);
      setChatMessages([{ role: "assistant", content: "별빛 연결이 잠시 끊어졌어요. 잠시 후 다시 시도해 주세요." }]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => chatInputRef.current?.focus(), 300);
    }
  }, [result]);

  const handleShare = async () => {
    const shareText = `별빛 타로 리딩 결과\n\n${result?.overall ?? ""}\n\n${window.location.origin}`;
    if (navigator.share) { try { await navigator.share({ title: "별빛 타로", text: shareText, url: window.location.origin }); } catch { /* ignore */ } }
    else { await navigator.clipboard.writeText(shareText).catch(() => null); alert("결과가 클립보드에 복사되었어요!"); }
  };

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    setTimeout(() => { setIsWatchingAd(false); setRemainingTurns(p => (p ?? 0) + 1); setChatMessages(p => [...p, { role: "assistant", content: "광고 시청 보상으로 대화를 1회 더 나누실 수 있어요! ✨ 무엇이 궁금하신가요?" }]); setTimeout(() => chatInputRef.current?.focus(), 300); }, 3000);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false); setIsPremium(true); setRemainingTurns(PREMIUM_CONSULT_LIMIT);
    setChatMessages(p => [...p, { role: "assistant", content: "💎 프리미엄 결제 완료! 이제 더 깊은 이야기를 나눌 수 있어요." }]);
  };

  // 대기 중인 메시지 (카드 선택 후 전송)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [showInlinePick, setShowInlinePick] = useState(false);
  const [inlinePickCards, setInlinePickCards] = useState<MinorCard[]>([]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || isChatLoading || remainingTurns === 0) return;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: text }]);
    // 메시지 저장하고 마이너 카드 5장 표시
    setPendingMessage(text);
    setInlinePickCards(drawMinorCards(5));
    setShowInlinePick(true);
  };

  // 사용자가 인라인 MinorCardPick에서 카드를 선택했을 때
  const handleInlineMinorSelect = async (card: MinorCard, isReversed: boolean) => {
    setShowInlinePick(false);
    const direction = isReversed ? "역방향" : "정방향";
    const keyword = isReversed ? card.reversed : card.upright;
    setChatMessages(prev => [...prev, { role: "assistant", content: `🃏 **${card.name}** (${card.original}) · ${direction}\n키워드: ${keyword}` }]);
    setIsChatLoading(true);
    try {
      const selectedMinorCard = { name: card.name, original: card.original, isReversed, keyword };
      const res = await fetch("/api/chat/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(deviceIdRef.current ? { "x-device-id": deviceIdRef.current } : {}), ...(entitlementRef.current ? { Authorization: `Bearer ${entitlementRef.current}` } : {}) },
        body: JSON.stringify({ cards: payloadCardsRef.current, initialReading: result, originalQuestion: originalQuestionRef.current, history: chatMessages, message: pendingMessage ?? "", selectedMinorCard }),
      });
      if (!res.ok) { const errBody = await res.json().catch(() => ({}) as Record<string, unknown>); setChatMessages(p => [...p, { role: "assistant", content: (errBody as { message?: string }).message ?? "다시 시도해 주세요." }]); if (res.status === 429) setRemainingTurns(0); return; }
      const data = await res.json() as { message: string; remainingTurns: number; suggestMinorDraw?: boolean };
      setChatMessages(p => [...p, { role: "assistant", content: data.message }]);
      setRemainingTurns(data.remainingTurns);
      if (data.suggestMinorDraw) setSuggestMinorDraw(true);
    } catch { setChatMessages(p => [...p, { role: "assistant", content: "별빛 연결이 끊어졌어요. 다시 전송해 주세요." }]); }
    finally { setIsChatLoading(false); setPendingMessage(null); }
  };


  // 마이너 카드 선택 핸들러
  const handleMinorCardSelect = async (card: MinorCard, isReversed: boolean) => {
    setShowMinorPick(false);
    setHasUsedMinor(true);
    setSuggestMinorDraw(false); // 뽑고 나면 버튼 다시 숨김
    const direction = isReversed ? "역방향" : "정방향";
    const userMsg = `추가로 카드를 뽑았어요: [${card.name} (${card.original}) · ${direction}] — 키워드: ${isReversed ? card.reversed : card.upright}`;
    setChatMessages(prev => [...prev, { role: "user", content: `🃏 마이너 카드: ${card.name} (${direction})` }]);
    setIsChatLoading(true);
    try {
      const fullMsg = userMsg;
      const res = await fetch("/api/chat/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(deviceIdRef.current ? { "x-device-id": deviceIdRef.current } : {}), ...(entitlementRef.current ? { Authorization: `Bearer ${entitlementRef.current}` } : {}) },
        body: JSON.stringify({ cards: payloadCardsRef.current, initialReading: result, originalQuestion: originalQuestionRef.current, history: chatMessages, message: fullMsg }),
      });
      const data = await res.json() as { message: string; remainingTurns: number };
      setChatMessages(p => [...p, { role: "assistant", content: data.message }]);
      if (data.remainingTurns !== undefined) setRemainingTurns(data.remainingTurns);
    } catch {
      setChatMessages(p => [...p, { role: "assistant", content: "카드를 읽는 도중 연결이 끊어졌어요. 다시 시도해 주세요." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 마이너 카드 뽑기 버튼 핸들러
  const handleOpenMinorPick = () => {
    if (hasUsedMinor && !isPremium) {
      setShowPaymentModal(true);
      return;
    }
    setMinorCards(drawMinorCards(5));
    setShowMinorPick(true);
  };

  const goToPrev = useCallback(() => { if (cards.length) setCurrentIndex(p => (p - 1 + cards.length) % cards.length); }, [cards.length]);
  const goToNext = useCallback(() => { if (cards.length) setCurrentIndex(p => (p + 1) % cards.length); }, [cards.length]);
  const getCircularOffset = (idx: number) => { let o = idx - currentIndex; if (o > cards.length / 2) o -= cards.length; if (o < -cards.length / 2) o += cards.length; return o; };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (chatPhase === "chatting") return; if (e.key === "ArrowLeft") goToPrev(); if (e.key === "ArrowRight") goToNext(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goToPrev, goToNext, chatPhase]);

  const handleDragStart = (e: React.PointerEvent) => { setDragStart(e.clientX); dragStartYRef.current = e.clientY; setIsDragging(false); };
  const handleDragMove = (e: React.PointerEvent) => { if (dragStart === 0) return; if (Math.abs(e.clientX - dragStart) > 10) setIsDragging(true); };
  const handleDragCancel = () => { setDragStart(0); setIsDragging(false); };
  const handleDragEnd = (e: React.PointerEvent) => {
    if (dragStart === 0) return;
    const dx = e.clientX - dragStart;
    const dy = Math.abs(e.clientY - dragStartYRef.current);
    // 세로 이동이 더 크면 스크롤로 판단 → 카드 전환 안 함
    if (Math.abs(dx) > 80 && Math.abs(dx) > dy) { if (dx > 0) goToPrev(); else goToNext(); }
    setDragStart(0); setIsDragging(false);
  };

  // ── 로딩 ──
  if (isLoading) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#fef9f0]">
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
          <div className="text-center text-xl flex items-center justify-center font-medium">
            {["별", "빛", "이", " ", "카", "드", "를", " ", "읽", "고", " ", "있", "어", "요", ".", ".", "."].map((char, i) => (
              <motion.span key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.08 }} className={char === " " ? "w-2 inline-block" : "inline-block"}>
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes riseSmoke { 0%{transform:translate3d(0,0,0) scale(.82);opacity:0;} 20%{opacity:.28;} 100%{transform:translate3d(var(--drift),-180px,0) scale(1.3);opacity:0;} }
        `}</style>
      </main>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center">
        <p className="text-[#fef9f0] text-xl">선택된 카드가 없어요.</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#fef9f0]">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] justify-center px-4 py-8 gap-4">
        {!isPremium && (
          <aside className="hidden xl:flex flex-col gap-4 w-[160px] shrink-0 pt-20">
            <div className="sticky top-6 rounded-xl border border-[#e8c96a]/25 bg-black/25 text-center text-xs p-4 h-[600px] flex items-center justify-center text-[#fef9f0]/60">광고 영역 (좌)</div>
          </aside>
        )}

        <div className="flex-1 flex flex-col items-center min-h-screen py-10 max-w-4xl mx-auto">
          {limitMessage && <div className="w-full mb-8 rounded-xl border border-[#e8c96a]/45 bg-[#1a1f2e]/70 px-5 py-4 text-center text-sm text-[#fef9f0]"><p>{limitMessage}</p></div>}

          <div className="mb-12 flex flex-col items-center px-4">
            <h1 className="text-3xl md:text-4xl text-[#fef9f0] drop-shadow-[0_0_15px_rgba(232,201,106,0.5)] whitespace-nowrap mb-3 font-serif">별빛의 메시지 ✨</h1>
            <p className="text-[12px] text-[#fef9f0]/50 tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10">좌우로 스와이프해 카드를 넘겨보세요</p>
          </div>

          {/* 캐러셀 */}
          <div className="relative flex items-center justify-center mb-2 w-full mt-2">
            <div className="relative flex items-center justify-center select-none" style={{ perspective: "1800px", minHeight: `${480 * cardScaleRatio}px`, height: "50vh", width: "100%", maxWidth: "900px", touchAction: "pan-y" }} onPointerDown={handleDragStart} onPointerMove={handleDragMove} onPointerUp={handleDragEnd} onPointerCancel={handleDragCancel}>
              {cards.map((card, idx) => {
                const offset = getCircularOffset(idx);
                const isCurrent = idx === currentIndex;
                const isVisible = Math.abs(offset) <= 1;
                return (
                  <motion.div key={`${card.cardIndex}-${idx}`} className="absolute flex flex-col items-center" initial={false}
                    animate={{ x: offset * 280 * cardScaleRatio, scale: (isCurrent ? 1.05 : 0.88) * cardScaleRatio, opacity: isVisible ? (isCurrent ? 1 : 0.35) : 0, z: isCurrent ? 0 : -150, rotateY: offset * 12 }}
                    transition={isDragging ? { duration: 0.1 } : { type: "spring", stiffness: 180, damping: 20, mass: 0.8 }}
                    style={{ transformStyle: "preserve-3d", pointerEvents: isCurrent ? "auto" : "none" }}>
                    <motion.div animate={{ opacity: isCurrent ? 1 : 0, y: isCurrent ? 0 : 15 }} className="mb-6 rounded-full px-6 py-2 backdrop-blur-xl border bg-black/60 border-[#e8c96a]/50 text-[#ffd98e] pointer-events-none">
                      <span className="text-[13px] md:text-[15px] font-bold tracking-widest">{LABELS[idx]}</span>
                    </motion.div>
                    <div className={`relative mx-auto rounded-xl transition-all duration-700 ${isCurrent ? "shadow-[0_0_60px_rgba(232,201,106,0.4)]" : "grayscale-[0.3]"}`} style={{ height: "358px", width: "238px" }}>
                      {isCurrent && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} className="absolute inset-0 -z-10 blur-[40px] mix-blend-screen rounded-full pointer-events-none" style={{ backgroundImage: `url(${card.image})`, backgroundSize: "cover", transform: "scale(1.25) translateY(5%)" }} />}
                      <img src={card.image} alt={card.name} className="h-full w-full object-cover rounded-xl relative z-10 border border-white/10" style={{ transform: card.isReversed ? "rotate(180deg)" : "none" }} />
                      {/* 역방향 뱃지는 이미지 div 내부에 두지 않음 - 카드 이름과 겹침 방지 */}
                    </div>
                    {/* 역방향 뱃지 - 카드 이미지와 카드 이름 사이에 배치 */}
                    {card.isReversed && (
                      <motion.div
                        animate={{ opacity: isCurrent ? 1 : 0 }}
                        className="mt-4 flex justify-center pointer-events-none"
                      >
                        <div
                          className="flex items-center gap-1 px-4 py-1 rounded-full backdrop-blur-md"
                          style={{
                            background: "linear-gradient(135deg, rgba(139,26,26,0.80) 0%, rgba(60,8,8,0.70) 100%)",
                            border: "1px solid rgba(232,140,140,0.30)",
                            boxShadow: "0 0 14px rgba(180,40,40,0.30), inset 0 1px 0 rgba(255,180,180,0.12)",
                          }}
                        >
                          <span style={{ fontSize: "10px", color: "#ffb4b4", letterSpacing: "0.15em", fontFamily: "serif", fontWeight: 500 }}>✦ 역방향 ✦</span>
                        </div>
                      </motion.div>
                    )}
                    <motion.div animate={{ opacity: isCurrent ? 1 : 0, y: isCurrent ? 0 : -10 }} className={`${card.isReversed ? "mt-3" : "mt-6"} text-[#ffd98e] text-xl md:text-2xl font-serif tracking-[0.2em]`}>{card.name}</motion.div>

                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 리딩 텍스트 */}
          <div className="relative z-20 w-full max-w-[480px] mx-auto mb-6 px-4 mt-10">
            <AnimatePresence mode="wait">
              <motion.div key={currentIndex} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }} className="rounded-[1.75rem] border border-[#e8c96a]/25 bg-[#0f1419]/90 backdrop-blur-2xl p-5 md:px-7 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#e8c96a]/40 to-transparent" />
                <h3 className="text-[#ffd98e] text-lg font-serif mb-3 flex items-center justify-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d46b6b] animate-pulse" />
                  <span className="tracking-[0.1em]">{cards[currentIndex]?.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d46b6b] animate-pulse" />
                </h3>
                <p className={`text-[#fef9f0]/90 text-[14px] leading-[1.8] transition-opacity ${isChangingCard ? "opacity-30" : "opacity-100"}`} style={{ wordBreak: "keep-all" }}>
                  {isChangingCard ? `${LABELS[currentIndex]}의 메시지를 떠올리는 중...` : (currentIndex === 0 ? result?.past : currentIndex === 1 ? result?.present : result?.future ?? "메시지가 곧 도착해요.")}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 대화 시작 버튼 */}

          <div className="relative z-20 w-full px-4 mb-20 flex justify-center">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="w-full flex flex-col items-center gap-3"
              >
                <motion.button
                  type="button"
                  onClick={() => startChat()}
                  animate={{ boxShadow: ["0 0 20px rgba(232,201,106,0.3)", "0 0 45px rgba(232,201,106,0.65)", "0 0 20px rgba(232,201,106,0.3)"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full max-w-[340px] flex flex-col items-center justify-center gap-0.5 rounded-2xl px-6 py-5 transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #c59a1f 0%, #e8c96a 50%, #c59a1f 100%)",
                    border: "1px solid rgba(255,220,100,0.5)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <span className="text-[17px] md:text-[19px] font-bold text-[#0c1020] tracking-tight">별빛 상담 시작하기</span>
                  </span>
                  <span className="text-[11px] text-[#0c1020]/60 tracking-wide">카드 해석에 대해 AI와 직접 대화해 보세요</span>
                </motion.button>
                <p className="text-[11px] text-[#fef9f0]/30 tracking-wider">무료 {FREE_CONSULT_LIMIT}회 · 프리미엄 {PREMIUM_CONSULT_LIMIT}회</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ══════ 채팅 바텀시트 ══════ */}
      {chatPhase === "chatting" && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
          onClick={() => setChatPhase("reading")}
        >
          {/* 배경 딤 레이어 */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />

          {/* 바텀시트 본체 — stopPropagation으로 배경 클릭과 분리 */}
          <div
            style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "768px", margin: "0 auto", display: "flex", flexDirection: "column", height: "85vh", background: "linear-gradient(180deg,rgba(18,23,42,0.98)0%,rgba(12,16,32,1)100%)", borderTopLeftRadius: "2rem", borderTopRightRadius: "2rem", boxShadow: "0 -15px 60px rgba(0,0,0,0.7)", borderTop: "1px solid rgba(232,201,106,0.3)", overflow: "hidden", color: "#fef9f0" }}
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(232,201,106,0.15)", background: "rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {cards.map((card, i) => (
                  <button
                    key={i}
                    type="button"
                    title={`${LABELS[i]}: ${card.name} — 클릭하면 리딩 보기`}
                    onClick={() => setShowCardModal(showCardModal === i ? null : i)}
                    style={{ position: "relative", width: 38, height: 55, borderRadius: 8, overflow: "hidden", border: showCardModal === i ? "2px solid rgba(232,201,106,0.9)" : "1px solid rgba(232,201,106,0.3)", background: "#0f1419", flexShrink: 0, cursor: "pointer", padding: 0 }}
                  >
                    <img src={card.image} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", transform: card.isReversed ? "rotate(180deg)" : "none" }} />
                    <div style={{ position: "absolute", top: 0, inset: "0 0 auto", background: "linear-gradient(rgba(0,0,0,0.8),transparent)", padding: "2px 4px", textAlign: "center" }}>
                      <span style={{ fontSize: 8, color: "#ffd98e" }}>{LABELS[i]}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                {remainingTurns !== null && <span style={{ fontSize: 11, color: "rgba(255,249,240,0.35)" }}>{isExhausted ? "상담 종료" : `남은 ${remainingTurns}회`}</span>}
                <button onClick={() => setChatPhase("reading")} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* 카드 상세 팝업 — 헤더 바로 아래 슬라이드 */}
            {showCardModal !== null && result && cards[showCardModal] && (
              <div style={{ flexShrink: 0, background: "rgba(10,14,28,0.98)", borderBottom: "1px solid rgba(232,201,106,0.2)", padding: "0.875rem 1.5rem" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <img src={cards[showCardModal].image} alt={cards[showCardModal].name} style={{ width: 34, height: 50, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(232,201,106,0.5)", transform: cards[showCardModal].isReversed ? "rotate(180deg)" : "none", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, color: "rgba(255,249,240,0.4)", letterSpacing: "0.1em", margin: "0 0 2px" }}>{LABELS[showCardModal]}</p>
                    <p style={{ fontSize: 15, color: "#ffd98e", fontWeight: 600, margin: 0 }}>
                      {cards[showCardModal].name}{cards[showCardModal].isReversed ? " · 역방향" : ""}
                    </p>
                  </div>
                  <button onClick={() => setShowCardModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,249,240,0.35)", fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,249,240,0.75)", lineHeight: 1.75, margin: 0, wordBreak: "keep-all" }}>
                  {showCardModal === 0 ? result.past : showCardModal === 1 ? result.present : result.future}
                </p>
              </div>
            )}

            {/* 메시지 영역 */}
            <div ref={chatScrollRef} style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: "0.625rem", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "assistant" && <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(232,201,106,0.12)", border: "1px solid rgba(232,201,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>✨</div>}
                  <div style={{ maxWidth: "75%", borderRadius: 18, padding: "0.875rem 1rem", fontSize: 14, lineHeight: 1.75, ...(msg.role === "assistant" ? { background: "rgba(26,31,46,0.9)", border: "1px solid rgba(232,201,106,0.18)", borderTopLeftRadius: 6, color: "#fef9f0" } : { background: "rgba(180,80,80,0.45)", border: "1px solid rgba(232,201,106,0.2)", borderTopRightRadius: 6, color: "#fef9f0" }) }}>
                    <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
                  </div>
                </div>
              ))}
              {/* 인라인 마이너 카드 뽑기 — 질문 후 표시 */}
              {showInlinePick && inlinePickCards.length > 0 && (
                <div style={{ margin: "0.75rem 0", padding: "0.5rem 0" }}>
                  <MinorCardPick cards={inlinePickCards} onSelect={handleInlineMinorSelect} />
                </div>
              )}
              {isChatLoading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.625rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(232,201,106,0.12)", border: "1px solid rgba(232,201,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>✨</div>
                  <div style={{ borderRadius: 18, padding: "1rem 1.25rem", background: "rgba(26,31,46,0.9)", border: "1px solid rgba(232,201,106,0.18)", borderTopLeftRadius: 6 }}>
                    <div style={{ display: "flex", gap: 6 }}>{[0, 1, 2].map(d => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "rgba(232,201,106,0.5)", animationDelay: `${d * 0.18}s`, display: "inline-block", width: 8, height: 8, borderRadius: "50%" }} />)}</div>
                  </div>
                </div>
              )}
              {isExhausted && !isChatLoading && (
                <div style={{ margin: "1rem auto", maxWidth: 360, background: "rgba(26,31,46,0.9)", border: "1px solid rgba(232,201,106,0.25)", borderRadius: "1.25rem", padding: "1.25rem", textAlign: "center" }}>
                  <p style={{ fontWeight: 600, color: "#ffd98e", marginBottom: 8, fontSize: 15 }}>오늘의 무료 상담이 모두 끝났어요 ✨</p>
                  <p style={{ fontSize: 12, color: "rgba(255,249,240,0.6)", marginBottom: 16 }}>더 깊은 이야기는 내일 이어서 하거나, 프리미엄을 이용해 보세요.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button onClick={() => router.push("/payment?returnTo=/result")} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "linear-gradient(to right,#c59a1f,#e8c96a)", color: "#0c1020", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>✨ 990원 프리미엄 — 5회 대화 더보기</button>
                    <button onClick={handleWatchAd} disabled={isWatchingAd} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,249,240,0.8)", fontSize: 13, cursor: "pointer" }}>
                      {isWatchingAd ? "광고 시청 중..." : "📺 짧은 광고 보고 1회 더"}
                    </button>
                    <button onClick={handleShare} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,249,240,0.6)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                      결과 공유하기
                    </button>
                  </div>
                  <div style={{ marginTop: "1.5rem", width: "100%" }}>
                    <AdBanner slot="chat-exhausted" format="rectangle" responsive={true} />
                  </div>
                </div>
              )}
            </div>

            {/* 마이너 카드 뽑기 영역 — GPT가 제안할 때만 표시 */}
            {chatPhase === "chatting" && !isExhausted && suggestMinorDraw && (
              <div style={{ flexShrink: 0, borderTop: "1px solid rgba(232,201,106,0.08)", padding: "0.5rem 1.5rem 0" }}>
                {showMinorPick ? (
                  <MinorCardPick
                    cards={minorCards}
                    onSelect={handleMinorCardSelect}
                    disabled={isChatLoading}
                  />
                ) : (
                  <div style={{ display: "flex", justifyContent: "center", paddingBottom: "0.25rem" }}>
                    <button
                      type="button"
                      onClick={handleOpenMinorPick}
                      disabled={isChatLoading}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                        background: hasUsedMinor && !isPremium ? "rgba(255,255,255,0.04)" : "rgba(232,201,106,0.1)",
                        border: `1px solid ${hasUsedMinor && !isPremium ? "rgba(255,255,255,0.1)" : "rgba(232,201,106,0.3)"}`,
                        color: hasUsedMinor && !isPremium ? "rgba(255,249,240,0.4)" : "#ffd98e",
                      }}
                    >
                      <span>🃏</span>
                      <span>{hasUsedMinor && !isPremium ? "마이너 카드 추가 뽑기 (프리미엄)" : "✦ 마이너 카드 한 장 더 뽑기"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 입력창 */}
            <div style={{ flexShrink: 0, padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(12,16,32,0.85)" }}>
              <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 12, maxWidth: 700, margin: "0 auto" }}>
                <textarea
                  ref={chatInputRef} value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as unknown as React.FormEvent); } }}
                  placeholder={isExhausted ? "오늘의 상담이 끝났어요" : "고민을 말씀해 주세요..."}
                  disabled={isExhausted || isChatLoading} rows={1}
                  style={{ flex: 1, resize: "none", background: "rgba(26,31,50,0.85)", border: "1px solid rgba(232,201,106,0.2)", borderRadius: 16, padding: "12px 16px", color: "#fef9f0", fontSize: 14, outline: "none", maxHeight: 120 }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(232,201,106,0.5)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(232,201,106,0.2)"; }}
                />
                <button type="submit" disabled={isExhausted || isChatLoading || !chatInput.trim()} style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(232,201,106,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: (isExhausted || isChatLoading || !chatInput.trim()) ? 0.25 : 1 }}>
                  <svg style={{ width: 20, height: 20, color: "#12172a" }} viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </form>
            </div>
          </div>

          {/* 결제 모달 */}
          {showPaymentModal && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setShowPaymentModal(false)}>
              <div style={{ width: "100%", maxWidth: 340, background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
                <div style={{ background: "#f2f4f6", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e8eb" }}>
                  <h3 style={{ color: "#333d4b", fontWeight: 700, fontSize: 15, margin: 0 }}>별빛 타로 프리미엄</h3>
                  <button onClick={() => setShowPaymentModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b95a1" }}>
                    <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ textAlign: "center", marginBottom: 24 }}><div style={{ fontSize: 40, marginBottom: 12 }}>✨💳</div><p style={{ color: "#4e5968", fontSize: 14, margin: 0 }}>단돈 990원으로</p><p style={{ color: "#191f28", fontSize: 18, fontWeight: 700, margin: "4px 0 0" }}>24시간 무제한 채팅</p></div>
                  <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "#4e5968", fontSize: 13 }}>결제 금액</span><span style={{ color: "#3182f6", fontWeight: 700, fontSize: 18 }}>990원</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8b95a1" }}><span>이용 기간</span><span>결제일로부터 24시간</span></div>
                  </div>
                  <button onClick={handlePaymentSuccess} style={{ width: "100%", background: "#3182f6", color: "white", fontWeight: 700, padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15 }}>990원 결제하기</button>
                  <p style={{ textAlign: "center", color: "#8b95a1", fontSize: 11, marginTop: 16 }}>위 버튼을 누르면 가상의 결제가 즉시 완료됩니다. (데모)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
