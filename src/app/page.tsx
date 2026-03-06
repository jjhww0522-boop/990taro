"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_QUESTIONS = [
  {
    label: "연애운",
    icon: "💕",
    category: "애정운",
    prompts: [
      "저의 연애운이 궁금해요. 좋은 인연이 다가올까요?",
      "지금 썸 타고 있는 그 사람의 속마음은 어떨까요?",
      "최근 헤어진 연인과 다시 만날 수 있을까요?",
      "올해 벚꽃이 피기 전에 연애 탈출 가능할지 타로를 봐주세요."
    ]
  },
  {
    label: "금전운",
    icon: "🪙",
    category: "금전운",
    prompts: [
      "이번 달 금전운의 흐름은 어떨까요?",
      "요즘 지출이 심한데, 곧 돈이 들어올 구멍이 있을지 궁금해요.",
      "새로운 투자를 계획 중인데 금전 흐름이 받쳐줄까요?",
      "내 집 마련을 위한 금전운, 언제쯤 탁 트일까요?"
    ]
  },
  {
    label: "건강운",
    icon: "🌿",
    category: "종합 운세",
    prompts: [
      "최근 몸이 피곤한데, 전체적인 건강운은 어떤가요?",
      "스트레스가 많은 요즘, 몸과 마음의 안정을 찾을 수 있을까요?",
      "새로운 운동을 시작할까 하는데 건강 면에서 좋은 타이밍일까요?"
    ]
  },
  {
    label: "학업운",
    icon: "📜",
    category: "직장·학업운",
    prompts: [
      "제 학업운과 다가오는 시험의 흐름이 궁금해요.",
      "원하는 직장(또는 학교)에 합격할 수 있을지 타로로 엿보고 싶어요.",
      "지금 하고 있는 공부 방법이 저와 잘 맞는지 힌트를 주세요.",
      "슬럼프가 온 것 같아요. 학업 슬럼프를 극복할 수 있는 조언이 있을까요?"
    ]
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("종합 운세");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const inputBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
  }, [inputText]);

  const shakeInput = () => {
    const el = inputBoxRef.current;
    if (!el || typeof el.animate !== "function") return;
    el.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 380, easing: "ease-out" },
    );
  };

  const handleAsk = (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("question", trimmedQuestion);
      sessionStorage.setItem("category", selectedCategory);
    }
    router.push("/shuffle");
  };

  return (
    <main className="relative min-h-screen w-full text-[#E0E0E0] font-sans flex flex-col overflow-x-hidden bg-transparent">
      <div className="page relative z-20 w-full flex flex-col items-center justify-center py-16 gap-0">
        {/* 타이틀 */}
        <div className="flex flex-col items-center text-center w-full mb-8">
          <div className="title-wrap w-full flex flex-col items-center">
            <p className="title-en text-[#e8c96a] tracking-[0.2em] uppercase text-sm font-semibold mb-2">Byeolbit Tarot</p>
            <h1 className="title-ko text-5xl md:text-6xl font-bold mb-4 drop-shadow-md pb-1 whitespace-nowrap">별빛 타로</h1>
            <div className="title-divider w-12 h-[2px] bg-[#e8c96a] mb-4"></div>
            <p className="title-sub text-lg md:text-xl text-neutral-300">별빛 아래 운명을 엿보는 곳</p>
          </div>
        </div>

        {/* 입력창 */}
        <div className="w-full max-w-[600px] flex flex-col items-center">
          <div className="input-box w-full" ref={inputBoxRef}>
            <textarea
              ref={inputRef}
              rows={2}
              placeholder="요즘 마음이 어떠신가요? 별빛 아래 편하게 이야기해 주세요."
              className="custom-scrollbar"
              value={inputText}
              onChange={(e) => setInputText(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (inputText.trim() !== "") {
                    handleAsk(inputText);
                  } else {
                    shakeInput();
                  }
                }
              }}
            />
            <div className="input-footer">
              <button
                type="button"
                onClick={() => {
                  if (inputText.trim() !== "") {
                    handleAsk(inputText);
                  } else {
                    shakeInput();
                  }
                }}
                className="btn-submit"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 8h12M9 3l5 5-5 5" />
                </svg>
                타로점 보기
              </button>
            </div>
          </div>

          {/* 카테고리 버튼 */}
          <div className="w-full flex flex-col items-center mt-5">
            <p className="text-[#e8c96a]/70 text-xs mb-3 font-medium tracking-wide">버튼을 누르면 대표 질문이 자동 입력돼요</p>
            <div className="grid grid-cols-2 md:flex md:flex-row md:flex-nowrap justify-center gap-x-3 gap-y-3 md:gap-4 w-full mx-auto">
              {EXAMPLE_QUESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(item.category);
                    const randomPrompt = item.prompts[Math.floor(Math.random() * item.prompts.length)];
                    setInputText(randomPrompt);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className={`btn-quick w-full md:w-auto justify-center transition-all duration-200 ${selectedCategory === item.category
                    ? "ring-2 ring-[#e8c96a] ring-offset-1 ring-offset-transparent brightness-125"
                    : ""
                    }`}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {selectedCategory === item.category && (
                    <span className="ml-1 text-[10px] text-[#e8c96a] font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <p className="hint mt-4 mb-2">카드 세 장으로 오늘과 내일을 살짝 엿볼까요? ✨</p>
        </div>
      </div>
    </main>
  );
}
