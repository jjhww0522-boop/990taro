"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MAJOR_ARCANA } from "../lib/tarotData";

type Phase = "input" | "deck" | "shuffling" | "selecting" | "result";

const SHUFFLE_DURATION_MS = 2000;
const RESULT_DELAY_MS = 1000;
const DECK_TOTAL = 22;

function createShuffledDeck(): number[] {
  const values = Array.from({ length: DECK_TOTAL }, (_, index) => index);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }
  return values;
}

export default function ChatPage() {
  const [phase, setPhase] = useState<Phase>("input");
  const [inputText, setInputText] = useState("");
  const [askedText, setAskedText] = useState("");
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [deck, setDeck] = useState<number[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setAskedText(text);
    setInputText("");
    setSelectedCards([]);
    setDeck([]);
    setIsShuffling(false);
    setPhase("deck");
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    setPhase("shuffling");

    window.setTimeout(() => {
      setDeck(createShuffledDeck());
      setPhase("selecting");
      setIsShuffling(false);
    }, SHUFFLE_DURATION_MS);
  };

  const handleCardSelect = (index: number) => {
    if (phase !== "selecting" || selectedCards.includes(index)) return;

    const next = [...selectedCards, index];
    setSelectedCards(next);

    if (next.length === 3) {
      window.setTimeout(() => setPhase("result"), RESULT_DELAY_MS);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full justify-center overflow-hidden bg-occult-bg-main text-occult-text-main">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(140,28,28,0.2),transparent_45%)]" />

      <main className="relative flex h-[100dvh] w-full max-w-md flex-col border-x border-occult-accent-muted/50 bg-occult-bg-main/95 px-4 shadow-[0_0_50px_rgba(0,0,0,0.75)]">
        <header className="shrink-0 border-b border-occult-accent-muted/40 py-5 text-center">
          <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-occult-text-muted">WOLHA TAROT</p>
          <h1 className="font-serif text-xl tracking-widest text-occult-text-main">월하 타로</h1>
        </header>

        <section className="relative flex-1 overflow-hidden px-1 pt-8 pb-4">
          <AnimatePresence mode="wait">
            {phase === "input" && (
              <motion.div
                key="phase-input"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -16 }}
                transition={{ duration: reduceMotion ? 0.15 : 0.45 }}
                className="grid h-full place-items-center"
              >
                <p className="max-w-[17rem] text-center font-serif text-2xl leading-relaxed text-occult-text-main/90">
                  어떤 고민을 안고 오셨습니까?
                </p>
              </motion.div>
            )}

            {/* 'deck' & 'shuffling' 페이즈 */}
            {(phase === 'deck' || phase === 'shuffling') && (
              <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-12 pt-16">
                <div className="relative flex justify-center items-center w-[240px] h-[360px] md:w-[320px] md:h-[480px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute flex-none w-[240px] h-[360px] md:w-[320px] md:h-[480px] bg-[#1C1C1E] border-2 border-[#8C1C1C] rounded-2xl shadow-2xl flex items-center justify-center origin-center"
                      initial={{ rotate: i * 2 - 4, x: i * 2 }}
                      animate={
                        phase === 'shuffling'
                          ? {
                              // 허공으로 솟구치며 360도 회전하고 넓게 퍼지는 매우 화려한 모션
                              x: [0, (i % 2 === 0 ? 1 : -1) * 200, (i % 2 === 0 ? -1 : 1) * 100, 0],
                              y: [0, -150, 50, 0],
                              rotate: [0, (i % 2 === 0 ? 180 : -180), (i % 2 === 0 ? 360 : -360), i * 2 - 4],
                              scale: [1, 1.2, 0.9, 1],
                              zIndex: [10, 30, 20, 10],
                            }
                          : { rotate: i * 2 - 4, x: i * 2 }
                      }
                      transition={{ duration: 0.8, repeat: 3, ease: "easeInOut" }}
                    >
                      <div className="absolute inset-3 border border-[#8C1C1C]/40 rounded-xl pointer-events-none"></div>
                      <span className="text-[#8C1C1C] text-8xl md:text-9xl opacity-40"></span>
                    </motion.div>
                  ))}
                </div>
                {/* 하단 버튼 (생략 없이 기존대로 렌더링) */}
                {/* ... 기존 버튼 코드 ... */}
                <div className="h-24 flex items-center justify-center mt-10">
                  {phase === 'deck' && (
                    <button
                      onClick={handleShuffle}
                      className="px-12 py-4 bg-[#8C1C1C] text-[#E0E0E0] font-serif text-xl md:text-2xl rounded-full shadow-[0_0_20px_rgba(140,28,28,0.5)] hover:bg-[#A62B2B] hover:scale-105 transition-all duration-300 z-50"
                    >
                      카드 섞기
                    </button>
                  )}
                  {phase === 'shuffling' && (
                    <div className="text-[#8C1C1C] font-serif text-xl md:text-2xl tracking-widest animate-pulse">
                      운명의 흐름을 섞는 중...
                    </div>
                  )}
                </div>
              </div>
            )}

            {phase === "selecting" && (
              <motion.div
                key="phase-selecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.15 : 0.4 }}
                className="w-full max-w-5xl mx-auto pt-10 pb-20 overflow-hidden"
              >
                <div className="mb-5 space-y-2 text-center">
                  <p className="font-serif text-lg text-occult-text-main">[ 당신의 물음 : "{askedText}" ]</p>
                  <p className="text-sm text-occult-text-muted">카드를 눌러 뒤집고, 세 장을 완성하세요.</p>
                  <p className="text-sm font-medium text-occult-accent-text">선택한 카드: {selectedCards.length} / 3</p>
                </div>

                <motion.div
                  initial={{ x: reduceMotion ? 0 : 70, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: reduceMotion ? 0.15 : 0.7, ease: "easeOut" }}
                  className="flex flex-row flex-nowrap overflow-x-auto overflow-y-visible items-center py-20 px-10 md:px-[20vw] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#1C1C1E] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#8C1C1C]/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#8C1C1C]"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {Array.from({ length: 22 }).map((_, index) => {
                    const isSelected = selectedCards.includes(index);
                    const cardData = MAJOR_ARCANA[deck[index] ?? index];
                    return (
                      <div
                        key={index}
                        onClick={() => handleCardSelect(index)}
                        className={`
              relative shrink-0 flex-none
              w-[140px] h-[210px] md:w-[180px] md:h-[270px] 
              -ml-16 md:-ml-20 first:ml-0 
              transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer
              ${isSelected ? "-translate-y-16 z-50" : "hover:-translate-y-8 hover:z-40"}
            `}
                        style={{ perspective: "1000px" }}
                      >
                        <div
                          className="w-full h-full relative"
                          style={{
                            transformStyle: "preserve-3d",
                            transition: "transform 0.8s",
                            transform: isSelected ? "rotateY(180deg)" : "rotateY(0deg)"
                          }}
                        >
                          <div
                            className="absolute inset-0 w-full h-full bg-[#1C1C1E] border border-[#8C1C1C] rounded-xl shadow-2xl flex items-center justify-center backface-hidden"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <div className="absolute inset-2 border border-[#8C1C1C]/40 rounded-lg pointer-events-none"></div>
                            <span className="text-[#8C1C1C] text-4xl opacity-50"></span>
                          </div>

                          {/* 카드 앞면 (데이터 바인딩 적용) */}
                          <div className="absolute inset-0 w-full h-full bg-[#121212] border-2 border-[#D14F4F] rounded-xl shadow-[0_0_30px_rgba(209,79,79,0.7)] flex flex-col items-center justify-center overflow-hidden backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            {/* 이미지가 준비된 경우를 대비한 img 태그 (fallback으로 배경색) */}
                            <img 
                              src={cardData.image} 
                              alt={cardData.name} 
                              className="absolute inset-0 w-full h-full object-cover opacity-80"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent pointer-events-none"></div>
                            
                            <div className="z-10 text-center w-full px-2 absolute bottom-4">
                              <div className="text-[#8C1C1C] text-[10px] md:text-xs font-bold border border-[#8C1C1C] px-1 py-0.5 rounded mb-1 inline-block bg-[#121212]/80">
                                {/* 정방향 고정 (추후 역방향 로직 추가 가능) */}
                                정방향
                              </div>
                              <div className="text-[#E0E0E0] text-sm md:text-base font-serif font-bold text-shadow-occult">
                                {cardData.name}
                              </div>
                              <div className="text-[#A0A0A0] text-[8px] md:text-[10px] mt-1 line-clamp-2 leading-tight bg-[#121212]/60 px-1 rounded">
                                {cardData.upright}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}

            {phase === 'result' && (
              <div className="w-full flex justify-center items-center gap-4 md:gap-10 mt-10 px-4">
                {selectedCards.map((originalIndex, i) => {
                  const cardId = deck[originalIndex];
                  const cardData = MAJOR_ARCANA[cardId]; // 실제 데이터 매핑
                  return (
                    <div key={i} className="shrink-0 flex-none w-[110px] h-[165px] md:w-[200px] md:h-[300px] relative rounded-xl overflow-hidden border-2 border-[#D14F4F] shadow-[0_0_30px_rgba(209,79,79,0.5)] bg-[#121212]">
                      <img src={cardData.image} alt={cardData.name} className="absolute inset-0 w-full h-full object-cover opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent pointer-events-none"></div>
                      <div className="absolute bottom-3 w-full text-center px-1 md:px-2 z-10">
                        <div className="text-[#8C1C1C] text-[9px] md:text-xs font-bold border border-[#8C1C1C] px-1 py-0.5 rounded mb-1 inline-block bg-[#121212]/80">정방향</div>
                        <div className="text-[#E0E0E0] text-sm md:text-xl font-serif font-bold text-shadow-occult">{cardData.name}</div>
                        <div className="text-[#A0A0A0] text-[8px] md:text-[11px] mt-1 line-clamp-2 leading-tight bg-[#121212]/60 px-1 rounded">{cardData.upright}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </section>

        <AnimatePresence>
          {phase === "input" && (
            <motion.footer
              key="input-footer"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.35 }}
              className="shrink-0 pb-12 pt-2"
            >
              <form
                onSubmit={handleSubmit}
                className="rounded-[1.75rem] border border-occult-accent-muted/60 bg-occult-bg-card/90 p-2 shadow-[0_18px_28px_rgba(0,0,0,0.5)]"
              >
                <label htmlFor="question-input" className="sr-only">
                  고민 입력
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="question-input"
                    type="text"
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    placeholder="마음에 걸리는 고민을 적어주세요..."
                    className="min-h-14 flex-1 rounded-full border border-occult-accent-muted/60 bg-occult-bg-main px-5 py-4 text-base text-occult-text-main shadow-lg outline-none placeholder:text-occult-text-muted focus:border-occult-accent focus:ring-2 focus:ring-occult-accent/40"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-occult-accent px-5 py-4 text-base font-bold text-occult-text-main shadow-lg transition-colors hover:bg-occult-accent-hover focus:outline-none focus:ring-2 focus:ring-occult-accent/40"
                  >
                    전송
                  </button>
                </div>
              </form>
            </motion.footer>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
