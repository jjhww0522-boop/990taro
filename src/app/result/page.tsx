"use client";

import { useEffect, useState, useCallback, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SelectedCard = {
  slot: number;
  cardIndex: number;
  name: string;
  image: string;
  isReversed: boolean;
};

type Divination = {
  past: string;
  present: string;
  future: string;
  overall: string;
  advice: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatPhase = "reading" | "chatting";

const POSITIONS = ["past", "present", "future"] as const;
const LABELS = ["과거", "현재", "미래"] as const;
const FREE_CONSULT_LIMIT = 2;
const PREMIUM_CONSULT_LIMIT = 5;

export default function ResultPage() {
  // --- 기존 상태 ---
  const [cards, setCards] = useState<SelectedCard[]>([]);
  const [result, setResult] = useState<Divination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [seenCards, setSeenCards] = useState<Set<number>>(new Set([0]));
  const [unlockFired, setUnlockFired] = useState(false);
  const [viewportHeight, setViewportHeight] = useState("85vh");

  // --- 인증 토큰 (상담 API 재사용) ---
  const deviceIdRef = useRef("");
  const entitlementRef = useRef<string | null>(null);
  const payloadCardsRef = useRef<{ position: string; name: string; isReversed: boolean }[]>([]);
  const originalQuestionRef = useRef("");

  // --- 채팅 상태 ---
  const [chatPhase, setChatPhase] = useState<ChatPhase>("reading");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [remainingTurns, setRemainingTurns] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const hasSeenAllCards = seenCards.size === 3 || chatPhase === "chatting";

  // --- 잠금 해제 감지 ---
  useEffect(() => {
    if (hasSeenAllCards && !unlockFired) {
      setUnlockFired(true);
    }
  }, [hasSeenAllCards, unlockFired]);

  // --- 모바일 키보드 호환 (visualViewport) ---
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height * 0.85}px`);
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      handleResize();
      return () => window.visualViewport?.removeEventListener("resize", handleResize);
    }
  }, []);

  // --- 초기 로드 ---
  useEffect(() => {
    const rawCards = typeof window !== "undefined" ? sessionStorage.getItem("selectedCards") : null;
    const question = typeof window !== "undefined" ? sessionStorage.getItem("question") ?? "" : "";
    const entitlement = typeof window !== "undefined" ? localStorage.getItem("entitlementJwt") : null;

    let dId = "";
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("deviceId");
      if (saved) {
        dId = saved;
      } else {
        dId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem("deviceId", dId);
      }
    }

    deviceIdRef.current = dId;
    entitlementRef.current = entitlement;
    originalQuestionRef.current = question;
    setIsPremium(Boolean(entitlement));

    if (!rawCards) {
      setIsLoading(false);
      return;
    }

    const parsed = (JSON.parse(rawCards) as SelectedCard[]).slice(0, 3).map((card) => ({
      ...card,
      isReversed: typeof card.isReversed === "boolean" ? card.isReversed : Math.random() < 0.3,
    }));
    setCards(parsed);

    const pCards = parsed.map((card, idx) => ({
      position: POSITIONS[idx],
      name: card.name,
      isReversed: card.isReversed,
    }));
    payloadCardsRef.current = pCards;

    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(dId ? { "x-device-id": dId } : {}),
        ...(entitlement ? { Authorization: `Bearer ${entitlement}` } : {}),
      },
      body: JSON.stringify({ question, cards: pCards }),
    })
      .then(async (res) => {
        if (res.status === 429) {
          const payload = (await res.json()) as { error?: string };
          setLimitMessage(payload.error ?? "오늘의 무료 해석은 모두 사용하셨어요.");
          setResult({
            past: payload.error ?? "오늘의 무료 해석은 모두 사용하셨어요.",
            present: "990원으로 더 많은 이야기를 들으실 수 있어요.",
            future: "내일 다시 오시면 새로운 메시지가 기다리고 있을 거예요.",
            overall: "오늘의 무료 해석은 여기까지예요.",
            advice: "더 듣고 싶으시다면 프리미엄을 이용해 보세요.",
          });
          return;
        }
        const data = (await res.json()) as Divination;
        setResult(data);
      })
      .catch(() => {
        setResult({
          past: "과거에는 정리되지 않은 감정들이 남아 있었어요.",
          present: "지금은 중심을 잡고 차분히 생각할 시간이에요.",
          future: "곧 길이 열릴 거예요. 조급해하지 않으면 더 좋은 결과가 있을 거예요.",
          overall: "세 장의 카드는 용기를 내라고 말하고 있어요.",
          advice: "오늘 하루를 차분하고 성실하게 보내세요.",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);


  // --- 카드 전환 페이드 이펙트 적용 ---
  useEffect(() => {
    if (isLoading || !result) return;
    setIsChangingCard(true);
    setSeenCards((prev) => new Set([...prev, currentIndex]));
    const timer = setTimeout(() => setIsChangingCard(false), 900); // 0.9s 동안 쾌적한 딜레이(페이드) 제공
    return () => clearTimeout(timer);
  }, [currentIndex, isLoading, result]);

  // --- 채팅 스크롤 ---
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  // --- 채팅 시작 (오프너 생성) ---
  const startChat = useCallback(async () => {
    setChatPhase("chatting");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(deviceIdRef.current ? { "x-device-id": deviceIdRef.current } : {}),
          ...(entitlementRef.current ? { Authorization: `Bearer ${entitlementRef.current}` } : {}),
        },
        body: JSON.stringify({
          cards: payloadCardsRef.current,
          initialReading: result,
          originalQuestion: originalQuestionRef.current,
          history: [],
          // message 없음 = 오프너 요청
        }),
      });

      if (res.status === 429) {
        const payload = (await res.json()) as { error?: string };
        setChatMessages([{ role: "assistant", content: payload.error ?? "오늘의 무료 상담은 모두 사용하셨어요." }]);
        setRemainingTurns(0);
        return;
      }

      const data = (await res.json()) as { message: string; remainingTurns: number };
      setChatMessages([{ role: "assistant", content: data.message }]);
      setRemainingTurns(data.remainingTurns);
    } catch {
      setChatMessages([{ role: "assistant", content: "별빛 연결이 잠시 끊어졌어요. 잠시 후 다시 시도해 주세요." }]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => chatInputRef.current?.focus(), 300);
    }
  }, [result]);

  // --- 메시지 전송 ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || isChatLoading || remainingTurns === 0) return;

    setChatInput("");
    const newHistory: ChatMessage[] = [...chatMessages, { role: "user", content: text }];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(deviceIdRef.current ? { "x-device-id": deviceIdRef.current } : {}),
          ...(entitlementRef.current ? { Authorization: `Bearer ${entitlementRef.current}` } : {}),
        },
        body: JSON.stringify({
          cards: payloadCardsRef.current,
          initialReading: result,
          originalQuestion: originalQuestionRef.current,
          history: chatMessages,
          message: text,
        }),
      });

      if (res.status === 429) {
        const payload = (await res.json()) as { error?: string };
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: payload.error ?? "오늘의 무료 상담은 모두 사용하셨어요." },
        ]);
        setRemainingTurns(0);
        return;
      }

      const data = (await res.json()) as { message: string; remainingTurns: number };
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      setRemainingTurns(data.remainingTurns);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "별빛 연결이 잠시 끊어졌어요. 다시 전송해 주세요." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- 캐러셀 함수 ---
  const goToPrev = useCallback(() => {
    if (cards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const goToNext = useCallback(() => {
    if (cards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const getCircularOffset = (idx: number) => {
    const total = cards.length;
    let offset = idx - currentIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chatPhase === "chatting") return;
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext, chatPhase]);

  const handleDragStart = (e: React.PointerEvent) => {
    setDragStart(e.clientX);
    setIsDragging(false);
  };
  const handleDragMove = (e: React.PointerEvent) => {
    if (dragStart === 0) return;
    if (Math.abs(e.clientX - dragStart) > 10) setIsDragging(true);
  };
  const handleDragEnd = (e: React.PointerEvent) => {
    if (dragStart === 0) return;
    const diff = e.clientX - dragStart;
    if (Math.abs(diff) > 80) {
      if (diff > 0) goToPrev();
      else goToNext();
    }
    setDragStart(0);
    setIsDragging(false);
  };

  // --- 로딩 화면 ---
  if (isLoading) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#fef9f0]">
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
          <div className="text-center text-xl md:text-2xl drop-shadow-[0_0_12px_rgba(232,201,106,0.45)] flex items-center justify-center font-medium">
            {["별", "빛", "이", " ", "카", "드", "를", " ", "읽", "고", " ", "있", "어", "요", ".", ".", ".", " ", "✨"].map((char, index) => (
              <motion.span
                key={index}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.08,
                }}
                className={char === " " ? "w-2 md:w-3 inline-block" : "inline-block"}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
          <div className="pointer-events-none relative mt-12 h-32 w-full max-w-3xl">
            {Array.from({ length: 9 }).map((_, idx) => (
              <span
                key={idx}
                className="result-smoke"
                style={
                  {
                    left: `${8 + idx * 10}%`,
                    animationDelay: `${idx * 0.4}s`,
                    animationDuration: `${5 + (idx % 3)}s`,
                    "--drift": `${idx % 2 === 0 ? 22 : -22}px`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
        <style jsx>{`
          .result-smoke {
            position: absolute;
            bottom: 0;
            width: 110px;
            height: 110px;
            border-radius: 999px;
            background: radial-gradient(circle at 50% 50%, rgba(232, 201, 106, 0.2), rgba(232, 201, 106, 0) 70%);
            filter: blur(14px);
            opacity: 0;
            animation: riseSmoke ease-in-out infinite;
          }
          @keyframes riseSmoke {
            0% { transform: translate3d(0, 0, 0) scale(0.82); opacity: 0; }
            20% { opacity: 0.28; }
            100% { transform: translate3d(var(--drift), -180px, 0) scale(1.3); opacity: 0; }
          }
        `}</style>
      </main>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#fef9f0]">
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
          <p className="text-center text-xl md:text-2xl drop-shadow-[0_0_12px_rgba(232,201,106,0.45)]">
            선택된 카드가 없어요.
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // Phase 2: 채팅 모드 — Bottom Sheet 오버레이 레이아웃
  // ============================================================
  let chatOverlay = null;
  if (chatPhase === "chatting") {
    const maxTurns = isPremium ? PREMIUM_CONSULT_LIMIT : FREE_CONSULT_LIMIT;
    const isExhausted = remainingTurns === 0;

    chatOverlay = (
      <div className="fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none">
        {/* 뒷배경 어두워짐 및 클릭 시 모달 닫기 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          onClick={() => setChatPhase("reading")}
        />

        {/* 바텀 시트 */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-3xl mx-auto flex flex-col rounded-t-[2rem] shadow-[0_-15px_60px_rgba(0,0,0,0.6)] border-t border-l border-r border-[#e8c96a]/30 pointer-events-auto text-[#fef9f0] overflow-hidden"
          style={{ height: viewportHeight, background: "linear-gradient(180deg, rgba(18,23,42,0.97) 0%, rgba(12,16,32,1) 100%)", backdropFilter: "blur(20px)" }}
        >
          {/* ── 헤더: 카드명 뱃지 + 상담 정보 ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="shrink-0 flex items-center justify-between gap-4 px-5 md:px-7 py-4 border-b border-[#e8c96a]/10 bg-black/20"
          >
            {/* 카드 이름 뱃지 */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] md:text-xs border shadow-sm"
                  style={{
                    background: "rgba(232,201,106,0.05)",
                    borderColor: "rgba(232,201,106,0.25)",
                    color: "#ffd98e",
                  }}
                >
                  <span className="text-[#fef9f0]/50 text-[10px] whitespace-nowrap">{LABELS[i]}</span>
                  {card.isReversed && <span className="text-[#d46b6b]/90 text-[10px] font-bold">逆</span>}
                  <span className="whitespace-nowrap font-medium">{card.name}</span>
                </div>
              ))}
            </div>

            {/* 우측 컨트롤 (남은횟수 및 닫기) */}
            <div className="flex items-center gap-4 shrink-0">
              {remainingTurns !== null && (
                <span className="text-[11px] text-[#fef9f0]/35 whitespace-nowrap">
                  {isExhausted ? "상담 종료" : `남은 상담 ${remainingTurns}회`}
                </span>
              )}
              <button
                onClick={() => setChatPhase("reading")}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="닫기"
              >
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* ── 채팅 메시지 목록 ── */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(232,201,106,0.2) transparent" }}
          >
            <AnimatePresence initial={false}>
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="shrink-0 w-8 h-8 mb-1 rounded-full flex items-center justify-center text-base"
                      style={{ background: "rgba(232,201,106,0.12)", border: "1px solid rgba(232,201,106,0.3)" }}>
                      ✨
                    </div>
                  )}
                  <div
                    className="max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3.5 text-sm md:text-[15px] leading-[1.75]"
                    style={
                      msg.role === "assistant"
                        ? {
                          background: "rgba(26,31,46,0.9)",
                          border: "1px solid rgba(232,201,106,0.18)",
                          borderTopLeftRadius: 6,
                          color: "#fef9f0",
                        }
                        : {
                          background: "rgba(180,80,80,0.45)",
                          border: "1px solid rgba(232,201,106,0.2)",
                          borderTopRightRadius: 6,
                          color: "#fef9f0",
                        }
                    }
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* 타이핑 인디케이터 */}
              {isChatLoading && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex items-end gap-2.5"
                >
                  <div className="shrink-0 w-8 h-8 mb-1 rounded-full flex items-center justify-center text-base"
                    style={{ background: "rgba(232,201,106,0.12)", border: "1px solid rgba(232,201,106,0.3)" }}>
                    ✨
                  </div>
                  <div className="rounded-2xl px-5 py-4" style={{ background: "rgba(26,31,46,0.9)", border: "1px solid rgba(232,201,106,0.18)", borderTopLeftRadius: 6 }}>
                    <span className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{ background: "rgba(232,201,106,0.5)", animationDelay: `${d * 0.18}s` }}
                        />
                      ))}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 상담 종료 안내 및 결제 전환 (Paywall) */}
            {isExhausted && !isChatLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-sm rounded-2xl p-5 text-center mt-4 border border-[#e8c96a]/25 bg-[#1a1f2e]/90 shadow-[0_0_20px_rgba(232,201,106,0.1)]"
              >
                <div className="mb-4">
                  <p className="text-[15px] font-semibold text-[#ffd98e] mb-2">오늘의 무료 상담이 모두 끝났어요 ✨</p>
                  <p className="text-[11px] md:text-xs text-[#fef9f0]/60 leading-relaxed">
                    더 깊은 이야기는 내일 이어서 하거나,<br className="md:hidden" /> 프리미엄을 이용해 보세요.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8C2727] to-[#d46b6b] text-[#fef9f0] text-sm font-bold shadow-[0_2px_12px_rgba(212,107,107,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    <span className="text-base drop-shadow-md">💎</span> 990원 프리미엄 1일권 결제
                  </button>
                  <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[#fef9f0]/80 hover:bg-white/10 hover:border-white/20 text-[13px] font-medium transition-all flex items-center justify-center gap-2">
                    <span className="text-base drop-shadow-md">📺</span> 짧은 광고 보고 1회 더 대화하기
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── 입력창 ── */}
          <div
            className="shrink-0 px-4 md:px-8 py-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(12,16,32,0.8)" }}
          >
            <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-3xl mx-auto">
              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as unknown as React.FormEvent);
                  }
                }}
                placeholder={isExhausted ? "오늘의 상담이 모두 끝났어요" : "고민을 이어서 말씀해 주세요..."}
                disabled={isExhausted || isChatLoading}
                rows={1}
                className="flex-1 resize-none text-[#fef9f0] text-sm md:text-base leading-relaxed px-4 py-3 rounded-2xl outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(26,31,50,0.85)",
                  border: "1px solid rgba(232,201,106,0.2)",
                  scrollbarWidth: "none",
                  maxHeight: "120px",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,201,106,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(232,201,106,0.2)"; }}
              />
              <button
                type="submit"
                disabled={isExhausted || isChatLoading || !chatInput.trim()}
                className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: "rgba(232,201,106,0.85)" }}
              >
                <svg className="w-5 h-5" style={{ color: "#12172a" }} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // Phase 1: 리딩 모드 (기존 캐러셀)
  // ============================================================
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#fef9f0]">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] justify-center px-4 py-6 gap-4">
        {/* 왼쪽 광고 (데스크탑만) */}
        {!isPremium && (
          <aside className="hidden xl:flex flex-col gap-4 w-[160px] shrink-0 pt-20">
            <div className="sticky top-6 rounded-xl border border-[#e8c96a]/25 bg-black/25 text-center text-xs p-4 h-[600px] flex items-center justify-center text-[#fef9f0]/60">
              광고 영역 (좌)
            </div>
          </aside>
        )}

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex flex-col justify-center min-h-screen py-12 max-w-4xl mx-auto">
          {limitMessage && (
            <div className="mb-8 rounded-xl border border-[#e8c96a]/45 bg-[#1a1f2e]/70 px-5 py-4 text-center text-sm leading-relaxed text-[#fef9f0]">
              <p>{limitMessage}</p>
              {!isPremium && (
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-[#e8c96a]/70 bg-[#d46b6b]/70 px-4 py-2 text-xs text-[#fef9f0] hover:bg-[#d46b6b]/90 transition-colors shadow-[0_2px_8px_rgba(232,201,106,0.2)]"
                >
                  990원으로 전체 해석
                </button>
              )}
            </div>
          )}

          <div className="mb-6 relative flex flex-col items-center justify-center lg:flex-row lg:justify-between px-4 lg:px-0">
            {/* 중앙 타이틀 */}
            <h1 className="text-2xl md:text-3xl text-[#fef9f0] drop-shadow-[0_0_14px_rgba(232,201,106,0.5)] whitespace-nowrap lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              별빛의 메시지 ✨
            </h1>

            {/* 모바일 화면용 (타이틀 아래) 간소화 안내 */}
            <p className="text-center text-[11px] text-[#fef9f0]/40 tracking-wide mt-2 lg:hidden">
              좌우로 스와이프해 카드를 넘겨보세요
            </p>

            {/* 상담 시작 버튼 - 우측 끝 (정독 확인 시 등장 & 애니메이션) */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mt-4 lg:mt-0 lg:ml-auto z-20 flex relative"
                >
                  {/* Ping Animation (10초마다 반복) */}
                  {hasSeenAllCards && (
                    <div
                      className="absolute inset-0 rounded-full border border-[#e8c96a] pointer-events-none z-0"
                      style={{ animation: 'buttonPing 10s cubic-bezier(0,0,0.2,1) infinite' }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={startChat}
                    disabled={!hasSeenAllCards}
                    className={`relative z-10 overflow-hidden inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full border border-[#e8c96a]/50 bg-[#1a1f2e]/90 backdrop-blur-md px-4 py-2.5 transition-all duration-300 group shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${!hasSeenAllCards
                      ? "opacity-50 grayscale cursor-not-allowed"
                      : "hover:border-[#e8c96a] hover:shadow-[0_2px_15px_rgba(232,201,106,0.25)]"
                      }`}
                  >
                    {/* Shimmer (Unlock 직후 한 번) */}
                    {hasSeenAllCards && unlockFired && (
                      <div
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(232,201,106,0.4), transparent)",
                          transform: "skewX(-20deg) translateX(-150%)",
                          animation: "buttonShimmer 1.5s ease-out forwards 0.2s"
                        }}
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-2 pointer-events-none w-full justify-center">
                      <span className="text-sm">{!hasSeenAllCards ? "🔒" : "✨"}</span>
                      <div className="text-left flex flex-col">
                        <div className="flex items-center gap-1.5 leading-tight">
                          <span className={`text-[12px] md:text-[13px] font-semibold whitespace-nowrap transition-colors ${hasSeenAllCards ? "text-[#ffd98e]" : "text-[#fef9f0]/80"}`}>
                            별빛과 깊은 대화
                          </span>
                          {hasSeenAllCards && <span className="text-[9px] bg-[#d46b6b] text-white px-1.5 py-0.5 rounded font-bold shadow-sm whitespace-nowrap">무료 1회</span>}
                        </div>
                      </div>
                      <div className={`shrink-0 flex items-center justify-center p-1.5 rounded-full transition-colors ml-1 ${hasSeenAllCards ? "bg-[#e8c96a]/10 group-hover:bg-[#e8c96a]/20" : "bg-white/5"}`}>
                        <svg width="12" height="12" className={`w-3 h-3 transition-transform ${hasSeenAllCards ? "text-[#e8c96a]/90 group-hover:translate-x-0.5" : "text-white/20"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Unlock 폭죽 (Unlock 직후 한 번 터짐) */}
                  {hasSeenAllCards && unlockFired && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`spark-${i}`}
                          className="absolute w-1.5 h-1.5 rounded-full bg-[#e8c96a]"
                          style={{
                            boxShadow: "0 0 8px #e8c96a",
                            animation: `particleSpark ${0.8 + Math.random() * 0.4}s ease-out forwards`,
                            transformOrigin: "center",
                            "--angle": `${i * 45}deg`,
                            "--distance": `${30 + Math.random() * 20}px`
                          } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  )}

                  <style jsx>{`
                    @keyframes buttonPing {
                      0% { transform: scale(1); opacity: 0.6; }
                      10% { transform: scale(1.15); opacity: 0; }
                      100% { transform: scale(1.15); opacity: 0; }
                    }
                    @keyframes buttonShimmer {
                      0% { transform: skewX(-20deg) translateX(-150%); }
                      100% { transform: skewX(-20deg) translateX(250%); }
                    }
                    @keyframes particleSpark {
                      0% { transform: rotate(var(--angle)) translateY(0) scale(1); opacity: 1; }
                      100% { transform: rotate(var(--angle)) translateY(var(--distance)) scale(0); opacity: 0; }
                    }
                  `}</style>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 데스크탑 화면용 안내 */}
          <p className="hidden lg:block text-center text-[11px] text-[#fef9f0]/40 tracking-wide mt-[-10px] mb-8">
            드래그로 카드를 넘겨보세요
          </p>

          {/* 캐러셀 */}
          <div className="relative flex items-center justify-center mb-6">
            <div
              className="relative flex items-center justify-center select-none"
              style={{ perspective: "1800px", height: "min(430px, 45vh)", width: "100%", maxWidth: "900px" }}
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
            >
              {cards.map((card, idx) => {
                const offset = getCircularOffset(idx);
                const isCurrent = idx === currentIndex;
                const isVisible = Math.abs(offset) <= 1;

                return (
                  <motion.div
                    key={`${card.cardIndex}-${idx}`}
                    className="absolute flex flex-col items-center"
                    initial={false}
                    animate={{
                      x: offset * 260,
                      scale: isCurrent ? 1 : 0.88,
                      opacity: isVisible ? (isCurrent ? 1 : 0.4) : 0,
                      z: isCurrent ? 0 : -100,
                      rotateY: offset * 8,
                    }}
                    transition={
                      isDragging
                        ? { duration: 0.1, ease: "linear" }
                        : { type: "spring", stiffness: 150, damping: 16, mass: 0.9 }
                    }
                    style={{ transformStyle: "preserve-3d", pointerEvents: isCurrent ? "auto" : "none", willChange: "transform" }}
                  >
                    {/* 선택 순서 및 카드명 배지 */}
                    <motion.div
                      animate={{ opacity: isCurrent ? 1 : 0, y: isCurrent ? 0 : 10 }}
                      className="mb-5 rounded-full px-5 py-1.5 backdrop-blur-md border shadow-[0_0_15px_rgba(232,201,106,0.15)] bg-black/50 border-[#e8c96a]/40 text-[#fef9f0] pointer-events-none"
                    >
                      <span className="text-[12px] md:text-[14px] font-serif tracking-[0.1em] drop-shadow-[0_0_8px_rgba(232,201,106,0.8)]">
                        {LABELS[idx]}
                      </span>
                    </motion.div>

                    {/* 타로 카드 */}
                    <div
                      className={`relative mx-auto rounded-lg transition-all duration-500 ${isCurrent ? "shadow-[0_0_50px_rgba(232,201,106,0.5)]" : "shadow-lg"}`}
                      style={{ height: "358px", width: "238px" }}
                    >
                      {/* 🎨 동적 분위기 조명 (Dynamic Ambient Light) */}
                      {isCurrent && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.65 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="absolute inset-0 -z-10 blur-[35px] mix-blend-screen rounded-full pointer-events-none"
                          style={{
                            backgroundImage: `url(${card.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            transform: "scale(1.2) translateY(5%)",
                          }}
                        />
                      )}

                      <img
                        src={card.image}
                        alt={card.name}
                        className="h-full w-full object-contain rounded-lg relative z-10"
                        style={{ transform: card.isReversed ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                      {card.isReversed && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                          <div className="relative px-3 py-1 rounded-md font-semibold text-xs tracking-widest backdrop-blur-md shadow-xl border bg-[#d46b6b]/85 text-[#fef9f0] border-[#e8c96a]/60">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-md" />
                            <span className="relative drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">逆</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 리딩 텍스트 패널 (카드와 종속되지 않는 넉넉한 독립 박스) */}
          <div className="relative z-20 w-full max-w-2xl mx-auto mb-6 px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.97, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -15 }}
                transition={{ duration: 0.4 }}
                className="rounded-[2rem] border border-[#e8c96a]/25 bg-[#0f1419]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 md:p-10 text-center relative overflow-hidden"
              >
                {/* 배경 반사광 */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#e8c96a]/40 to-transparent" />

                <h3 className="text-[#ffd98e] text-lg lg:text-xl font-serif mb-5 flex items-center justify-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d46b6b]" />
                  <span className="tracking-widest">{cards[currentIndex]?.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d46b6b]" />
                </h3>
                <p
                  className={`text-[#fef9f0]/90 text-[15px] md:text-[17px] leading-[2.1] tracking-wide transition-opacity duration-300 ${isChangingCard ? "opacity-30" : "opacity-100"}`}
                  style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
                >
                  {isChangingCard
                    ? `${LABELS[currentIndex]}의 메시지를 다시 떠올리는 중...`
                    : (currentIndex === 0 ? result?.past : currentIndex === 1 ? result?.present : result?.future || "별빛의 메시지가 곧 도착할 거예요.")}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── 상담 시작 버튼 (상단 헤더로 이동됨) ── */}

          {/* 오른쪽 광고 (데스크탑만) */}
          {!isPremium && (
            <aside className="hidden xl:flex flex-col gap-4 w-[160px] shrink-0 pt-20">
              <div className="sticky top-6 rounded-xl border border-[#e8c96a]/25 bg-black/25 text-center text-xs p-4 h-[600px] flex items-center justify-center text-[#fef9f0]/60">
                광고 영역 (우)
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* 바텀 시트 (채팅) 렌더링 영역 */}
      <AnimatePresence>
        {chatOverlay}
      </AnimatePresence>
    </main>
  );
}
