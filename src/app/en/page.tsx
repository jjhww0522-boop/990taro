"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_QUESTIONS = [
  {
    label: "Love",
    icon: "💕",
    category: "love",
    prompts: [
      "I'm curious about my love life. Will a meaningful connection come my way?",
      "What is the person I'm interested in truly thinking about me?",
      "Is there a chance of reconnecting with someone from my past?",
      "I've been single for a while — what energy surrounds my love life right now?",
    ],
  },
  {
    label: "Money",
    icon: "🪙",
    category: "money",
    prompts: [
      "What does my financial flow look like this month?",
      "I've been spending a lot lately — will money come in soon?",
      "I'm planning a new investment — does my financial energy support it?",
      "What does my financial energy say about achieving my savings goal?",
    ],
  },
  {
    label: "Health",
    icon: "🌿",
    category: "health",
    prompts: [
      "I've been feeling tired lately — what does my overall health energy say?",
      "I'm under a lot of stress. Can I find balance and calm soon?",
      "I want to start a new workout routine — is this a good time?",
    ],
  },
  {
    label: "Career",
    icon: "📜",
    category: "career",
    prompts: [
      "What does my career energy look like right now?",
      "I want to get into my dream job (or school) — what do the cards say?",
      "I feel like I'm in a slump at work. Is there a way through it?",
      "I'm considering a big career change — what energy surrounds this decision?",
    ],
  },
];

export default function EnglishHomePage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("love");
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
    const trimmed = question.trim();
    if (!trimmed) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("question", trimmed);
      sessionStorage.setItem("category", selectedCategory);
      sessionStorage.setItem("lang", "en");
    }
    router.push("/shuffle");
  };

  return (
    <main className="relative min-h-screen w-full text-[#E0E0E0] font-sans flex flex-col overflow-x-hidden bg-transparent">
      <div className="page relative z-20 w-full flex flex-col items-center justify-center py-16 gap-0">
        {/* Title */}
        <div className="flex flex-col items-center text-center w-full mb-8">
          <div className="title-wrap w-full flex flex-col items-center">
            <p className="title-en text-[#e8c96a] tracking-[0.2em] uppercase text-sm font-semibold mb-2">Byeolbit Tarot</p>
            <h1 className="title-ko text-5xl md:text-6xl font-bold mb-4 drop-shadow-md pb-1 whitespace-nowrap">Starlight Tarot</h1>
            <div className="title-divider w-12 h-[2px] bg-[#e8c96a] mb-4"></div>
            <p className="title-sub text-lg md:text-xl text-neutral-300">A place to glimpse your fate beneath the stars</p>
          </div>
        </div>

        {/* Input */}
        <div className="w-full max-w-[600px] flex flex-col items-center">
          <div className="input-box w-full" ref={inputBoxRef}>
            <textarea
              ref={inputRef}
              rows={2}
              placeholder="How are you feeling today? Share anything on your mind beneath the stars."
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
                Read My Cards
              </button>
            </div>
          </div>

          {/* Quick category buttons */}
          <div className="w-full flex flex-col items-center mt-5">
            <p className="text-[#e8c96a]/70 text-xs mb-3 font-medium tracking-wide">Tap a topic to auto-fill a sample question</p>
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
                  className={`btn-quick w-full md:w-auto justify-center transition-all duration-200 ${
                    selectedCategory === item.category
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

          <p className="hint mt-4 mb-2">Three cards reveal today and tomorrow — shall we peek? ✨</p>
        </div>
      </div>
    </main>
  );
}
