"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { MAJOR_ARCANA } from "../lib/tarotData";

type Phase = "input" | "deck" | "shuffling" | "selecting" | "result";

const SHUFFLE_DURATION_MS = 2000;
const RESULT_DELAY_MS = 1000;
const DECK_TOTAL = 22;
const EXAMPLE_QUESTIONS = [
  { label: "연애운", icon: "💘", prompt: "저의 연애운이 궁금합니다. 앞으로 좋은 인연이 나타날까요?" },
  { label: "금전운", icon: "💰", prompt: "이번 달 금전운과 재물의 기운을 알려주세요." },
  { label: "건강운", icon: "🧿", prompt: "제 몸과 마음의 건강운을 점쳐주세요." },
  { label: "학업운", icon: "📚", prompt: "요즘 제 학업운의 흐름과 집중의 방향이 궁금합니다." },
];

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
  const [userQuestion, setUserQuestion] = useState("");
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [hasRequestedReading, setHasRequestedReading] = useState(false);
  const [orientations, setOrientations] = useState<Record<number, boolean>>({}); // true면 역방향
  const [deck, setDeck] = useState<number[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [readingMode, setReadingMode] = useState<"free" | "paid">("free");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { complete, completion, isLoading, error } = useCompletion({
    api: "/api/tarot",
    streamProtocol: "text",
    onError: (err) => {
      console.error("Tarot completion error:", err);
    },
  });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (phase !== "input" || !inputRef.current) {
      return;
    }
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
  }, [inputText, phase]);

  const handleAsk = (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    setInputText(trimmedQuestion);
    setUserQuestion(trimmedQuestion);
    setAskedText(trimmedQuestion);
    setHasRequestedReading(false);
    setPhase("deck"); // 혹은 셔플 페이즈
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
    if (!selectedCards.includes(index) && selectedCards.length < 3) {
      // 50% ?뺣쪧濡???갑??true) 寃곗젙
      const isReversed = Math.random() < 0.5;
      setOrientations(prev => ({ ...prev, [index]: isReversed }));
      setSelectedCards(prev => [...prev, index]);
      
      if (selectedCards.length + 1 === 3) {
        setTimeout(() => setPhase('result'), 1500);
      }
    }
  };

  useEffect(() => {
    if (phase === "result" && selectedCards.length === 3 && userQuestion && !hasRequestedReading) {
      const cardsData = selectedCards.map((idx) => {
        const card = MAJOR_ARCANA[deck[idx]];
        const isReversed = orientations[idx];
        return {
          name: card.name,
          orientation: isReversed ? "역방향" : "정방향",
          meaning: isReversed ? card.reversed : card.upright,
        };
      });

      setHasRequestedReading(true);
      complete(userQuestion, {
        body: {
          question: userQuestion,
          cards: cardsData,
        },
      });
    }
  }, [phase, selectedCards.length, userQuestion, hasRequestedReading]);

  return (
    <main className="relative min-h-screen w-full text-[#E0E0E0] font-sans flex flex-col overflow-x-hidden bg-[#121212]">
      
      {/* 1. ?꾨꼍?섍쾶 怨좎젙???꾩껜?붾㈃ 諛곌꼍 ?덉씠??*/}
      <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#121212]/80 z-10"></div>
        {/* 寃쎈줈瑜?main_bg2.jpg 濡?媛뺤젣 吏??*/}
        <img src="/cards/main_bg2.jpg" alt="background" className="w-full h-full object-cover z-0 opacity-70" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>

      {/* 상단 헤더 영역 */}
      <header className="relative z-20 flex flex-col items-center pt-8 pb-4 border-b border-transparent w-full transition-all duration-500">
        <h3 className="font-['Nosifer'] text-[#DCD8C0] drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] text-2xl md:text-3xl tracking-[0.2em] mb-2">
          WOLHA TAROT
        </h3>
        {/* input 페이즈에서만 한글 제목 표시하여 공간 확보 및 몰입감 증대 */}
        {phase === 'input' && (
          <h1 className="font-['East_Sea_Dokdo'] text-[#DCD8C0] drop-shadow-[0_0_10px_rgba(220,38,38,0.6)] text-5xl md:text-6xl animate-fadeIn">
            월하 타로
          </h1>
        )}
      </header>

      {/* ?쒕??섏씠 ?ㅽ???諛뺤뒪??硫붿씤 肄섑뀗痢?(input ?곸뿭) */}
      {phase === 'input' && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center w-full px-4 py-12">
          
          {/* 以묒븰 ??댄? */}
          <h2 className="text-[#E0E0E0] text-2xl md:text-4xl font-serif font-bold mb-8 text-center drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-widest">
            당신의 마음을 적어보세요
          </h2>

          <div className="w-full max-w-3xl mx-auto flex flex-col items-center px-[30px]">
            <div className="w-full max-w-[504px] md:max-w-[540px] mx-auto rounded-full bg-black/40 backdrop-blur-2xl border border-[#8C2727]/30 shadow-[0_10px_30px_rgba(0,0,0,0.45)] flex items-center px-6 py-3 min-h-[96px]">
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-full border border-[#8C2727]/60 bg-[#1A0A0A]/80 flex items-center justify-center text-[#DCD8C0] text-lg shadow-[0_0_10px_rgba(140,39,39,0.35)]">
                  ✶
                </div>
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="어떤 고민을 안고 오셨습니까? 편하게 적어주세요..."
                  className="flex-1 min-w-0 pl-4 bg-transparent text-[#ECEAD8] placeholder-[#BAB7A6] resize-none border-none outline-none focus:outline-none focus:ring-0 text-[17px] md:text-[19px] leading-relaxed max-h-[140px] overflow-y-auto custom-scrollbar font-serif"
                  value={inputText}
                  onChange={(e) => setInputText(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (inputText.trim() !== "") {
                        handleAsk(inputText);
                      }
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setReadingMode((prev) => (prev === "free" ? "paid" : "free"))}
                className={`ml-3 shrink-0 rounded-full border px-3 py-1.5 text-[11px] md:text-xs font-serif transition-all duration-300 ${
                  readingMode === "paid"
                    ? "border-[#C6A86A]/80 text-[#D14F4F] shadow-[0_0_12px_rgba(220,38,38,0.38)]"
                    : "border-[#C6A86A]/80 text-[#E9DEC3] shadow-[0_0_10px_rgba(233,222,195,0.24)]"
                }`}
              >
                {readingMode === "paid" ? "유료(신령)" : "무료(일반)"}
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.45, ease: "easeOut" }}
              className="mt-8 flex flex-wrap justify-center gap-6 w-full"
            >
              {EXAMPLE_QUESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setInputText(item.prompt)}
                  className="flex items-center space-x-2 px-5 py-3 bg-[#3A0A0A] border border-[#DCD8C0]/40 rounded-lg shadow-[0_0_15px_rgba(140,39,39,0.3)] text-[#DCD8C0] hover:-translate-y-1 hover:bg-[#5C1717] hover:shadow-[0_0_25px_rgba(140,39,39,0.6)] transition-all duration-300 cursor-pointer"
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      )}
      
      {/* ???꾨옒遺?곕뒗 湲곗〈??deck, shuffling, selecting, result ?깆쓽 ?뚮뜑留?肄붾뱶瑜??댁뼱???묒꽦??寃?*/}
      {phase !== "input" && (
        <div className="relative z-20 flex-1 flex flex-col">
          <section className="relative flex-1 overflow-hidden px-4 pt-8 pb-4">
            <AnimatePresence mode="wait">

            {/* 'deck' & 'shuffling' ?섏씠利?*/}
            {(phase === 'deck' || phase === 'shuffling') && (
              <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-12 pt-16">
                <div className="relative flex justify-center items-center w-[240px] h-[360px] md:w-[320px] md:h-[480px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute flex-none w-[200px] h-[300px] md:w-[280px] md:h-[420px] rounded-2xl shadow-2xl origin-center overflow-hidden border-2 border-[#8C1C1C]"
                      initial={{ rotate: i * 2 - 4, x: i * 2 }}
          animate={
            phase === 'shuffling'
              ? {
                  // 醫뚯슦濡쒕쭔 ?댁쭩 踰뚯뼱吏硫?鍮좊Ⅴ寃?援먯감?섎뒗 臾듭쭅???뷀뵆
                  x: [0, (i % 2 === 0 ? 80 : -80), (i % 2 === 0 ? -40 : 40), 0],
                  y: [0, (i % 2 === 0 ? -10 : 10), 0],
                  rotate: [i * 2 - 4, (i % 2 === 0 ? 5 : -5), i * 2 - 4],
                  zIndex: [10, 30, 20, 10],
                }
              : { rotate: i * 2 - 4, x: i * 2 }
          }
          transition={{ duration: 0.4, repeat: 5, ease: "linear" }}
        >
                      <img src="/cards/back_00.jpg" alt="Card Back" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </motion.div>
                  ))}
                </div>
                {/* ?섎떒 踰꾪듉 (?앸왂 ?놁씠 湲곗〈?濡??뚮뜑留? */}
                {/* ... 湲곗〈 踰꾪듉 肄붾뱶 ... */}
                <div className="h-24 flex items-center justify-center mt-10">
                  {phase === 'deck' && (
                    <div className="flex gap-3 md:gap-4 mt-8">
                      <button
                        onClick={handleShuffle}
                        className="px-6 py-2 bg-[#8C2727] text-[#DCD8C0] border border-[#8C2727] rounded-full text-sm md:text-base font-serif hover:bg-transparent hover:text-[#8C2727] transition-all duration-300 shadow-[0_0_15px_rgba(140,39,39,0.4)]"
                      >
                        카드 섞기
                      </button>
                      <button
                        onClick={() => setPhase("input")}
                        className="px-6 py-2 bg-transparent text-[#A39E93] border border-[#A39E93]/50 rounded-full text-sm md:text-base font-serif hover:border-[#A39E93] hover:text-[#DCD8C0] transition-all duration-300"
                      >
                        고민 수정
                      </button>
                    </div>
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
                  <p className="text-sm text-occult-text-muted">카드를 눌러 3장을 선택해주세요</p>
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
                    const isReversed = Boolean(orientations[index]);
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
                        {/* 移대뱶 3D ?뚮┰ ?섑띁 (Flip ?띾룄 ???媛먯냽: 2珥? */}
                        <div 
                          className="w-full h-full relative transition-all duration-[2000ms] preserve-3d"
                          style={{ transformStyle: 'preserve-3d', transform: isSelected ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                        >
                          {/* (移대뱶 ?룸㈃ 肄붾뱶??湲곗〈怨??숈씪?섍쾶 ?좎?) */}
                          <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden border-2 border-[#8C1C1C]/70 shadow-lg">
                            <img src="/cards/back_00.jpg" alt="Card Back" className="w-full h-full object-cover" />
                          </div>

                          {/* 移대뱶 ?욌㈃ (諛곌꼍/?뚮몢由??꾪솚 ?띾룄 媛먯냽: 1.7珥? */}
                          <div 
                            className={`absolute inset-0 w-full h-full rounded-xl flex flex-col items-center justify-center overflow-hidden backface-hidden transition-all duration-[1700ms] ${
                              isSelected && orientations[index] 
                                ? 'border-2 border-[#D14F4F] shadow-[0_0_40px_rgba(209,79,79,0.8)] bg-[#1a0505]' 
                                : 'border-2 border-[#A0A0A0] shadow-[0_0_20px_rgba(255,255,255,0.2)] bg-[#121212]'
                            }`} 
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          >
                            {/* 移대뱶 ?대?吏 (??갑???뚯쟾/以뚯씤 ?띾룄 ???媛먯냽: 2.5珥??숈븞 ?쒖꽌???뚯븘媛? */}
                            <img 
                              src={cardData.image} 
                              alt={cardData.name} 
                              className={`absolute inset-0 w-full h-full object-cover opacity-85 transition-all duration-[2500ms] ease-out ${
                                isSelected && orientations[index] ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                              }`}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                            />
                            
                            {/* (?섎㉧吏 遺됱? ?ㅻ쾭?덉씠, ?띿뒪???쇰꺼 肄붾뱶??湲곗〈怨??숈씪?섍쾶 ?좎?) */}
                            {isSelected && orientations[index] && (
                              <div className="absolute inset-0 bg-gradient-to-t from-[#8C1C1C]/70 via-transparent to-[#8C1C1C]/30 pointer-events-none animate-pulse mix-blend-multiply"></div>
                            )}
                            
                            <div className="z-10 text-center w-full px-2 absolute bottom-4">
                              <div className={`text-[10px] md:text-xs font-bold border px-2 py-0.5 rounded-sm mb-1 inline-block backdrop-blur-sm ${
                                orientations[index] ? 'text-[#ff6b6b] border-[#ff6b6b] bg-black/70' : 'text-[#E0E0E0] border-[#E0E0E0] bg-[#121212]/70'
                              }`}>
                                {orientations[index] ? '역방향' : '정방향'}
                              </div>
                              <div className="text-[#E0E0E0] text-sm md:text-lg font-serif font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                                {cardData.name}
                              </div>
                              <div className="text-[#D0D0D0] text-[8px] md:text-[10px] mt-1 line-clamp-2 leading-tight bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                {orientations[index] ? cardData.reversed : cardData.upright}
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
              <div className="w-full flex flex-col items-center animate-fadeIn pb-20">
                <h2 className="text-[#E0E0E0] text-xl md:text-3xl font-serif mb-12 mt-6 tracking-widest text-shadow-occult">운명의 응답</h2>
                
                {/* --- 기존 3장 카드 렌더링 영역 (유지) --- */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-6xl">
                                    {selectedCards.map((originalIndex, i) => {
                    const cardData = MAJOR_ARCANA[deck[originalIndex]];
                    const isReversed = orientations[originalIndex];

                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="flex flex-col items-center w-[200px] md:w-[280px] group"
                      >
                        
                        {/* 1. 카드 상단 라벨 영역 (크기 대폭 축소 및 톤다운) */}
                        <div className="flex items-center justify-center mb-3 w-full relative z-10">
                          
                          {/* 라벨 텍스트: 하단 설명란보다 작게 설정, 쨍한 색상 완전 제거 */}
                          <div className={`flex items-center gap-1.5 px-3 py-1 font-serif border-y border-opacity-40 ${
                            isReversed 
                              ? 'text-[#8C2727] border-[#8C2727]' // 역방향: 말라붙은 핏자국, 어두운 적색
                              : 'text-[#A39E93] border-[#A39E93]' // 정방향: 오래된 양피지, 톤다운된 웜그레이
                          }`}
                          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                            {/* 기호와 한글 크기를 동일하게 맞추고 아주 작게 축소 */}
                            <span className="text-[10px] md:text-xs font-bold opacity-80">{isReversed ? '' : ''}</span>
                            <span className="text-[10px] md:text-xs tracking-[0.2em] font-medium opacity-90 pl-1">
                              {isReversed ? '역방향' : '정방향'}
                            </span>
                          </div>
                          
                        </div>

                        {/* 2. 카드 이미지 영역 (변경 없음, 라벨 밑으로 옴) */}
                        <div className="w-full aspect-[2/3] relative rounded-2xl overflow-hidden border-2 border-[#8C1C1C] shadow-[0_0_30px_rgba(140,28,28,0.3)] bg-[#121212] mb-5 transition-transform duration-500 group-hover:-translate-y-4 group-hover:shadow-[0_0_40px_rgba(140,28,28,0.6)]">
                          <img src={cardData.image} alt={cardData.name} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isReversed ? 'rotate-180' : ''}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>

                        {/* 3. 하단 텍스트 설명 영역 (이름과 해석만 깔끔하게 남김) */}
                        <div className="flex flex-col items-center text-center w-full px-2 relative z-10">
                          <div className="absolute inset-0 bg-black/40 blur-xl -z-10 rounded-full scale-125"></div>
                          
                          {/* 카드 이름 */}
                          <div className="text-white text-xl md:text-2xl font-serif font-bold mb-3 tracking-wide" 
                               style={{ textShadow: '0 2px 4px black, 0 0 10px black, 0 0 20px black' }}>
                            {cardData.name}
                          </div>
                          
                          {/* 카드 설명 */}
                          <div className="text-[#F0F0F0] text-sm md:text-base leading-relaxed break-keep font-medium" 
                               style={{ textShadow: '0 2px 4px black, 0 0 12px black' }}>
                            {isReversed ? cardData.reversed : cardData.upright}
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </div>

                {/* --- 신규 추가: AI 점괘 스트리밍 출력 영역 --- */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="w-full max-w-4xl mt-16 p-6 md:p-10 relative z-10 flex flex-col items-center"
                >
                  {/* 다크 글래스모피즘 배경 */}
                  <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-md border border-[#8C2727]/30 rounded-2xl -z-10 shadow-[0_0_40px_rgba(140,39,39,0.15)]"></div>

                  {/* 타이틀 */}
                  <h3 className="text-[#8C2727] font-serif text-lg md:text-xl mb-6 tracking-[0.4em] font-bold border-b border-[#8C2727]/30 pb-3 flex items-center gap-3">
                    <span className="text-sm opacity-70"></span>
                    월하의 점괘
                    <span className="text-sm opacity-70"></span>
                  </h3>

                  {/* 텍스트 렌더링 영역 */}
                  <div className="text-[#DCD8C0] font-serif text-base md:text-lg leading-[2.2] md:leading-[2.5] whitespace-pre-wrap text-center md:text-left w-full min-h-[150px]">
                    {isLoading && !completion ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-70 animate-pulse mt-10">
                        <span className="text-[#8C2727] mb-3"></span>
                        <p>신령의 목소리를 듣고 있소... 향을 피우고 잠시 기다리시오...</p>
                      </div>
                    ) : error ? (
                      <p className="text-[#D14F4F] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        점괘를 불러오지 못했소. 잠시 후 다시 시도하시오.
                      </p>
                    ) : hasRequestedReading && !completion ? (
                      <p className="text-[#A39E93] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        아직 점괘가 도착하지 않았소. 잠시 후 다시 시도하시오.
                      </p>
                    ) : (
                      <p className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{completion}</p>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
      )}
    </main>
  );
}

