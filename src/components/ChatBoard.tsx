"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { TarotCard } from "./TarotCard";

type CardData = {
  id: string;
  name: string;
  keyword: string;
  isReversed: boolean;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  isLoading?: boolean;
  cards?: CardData[];
};

const FREE_DATE_KEY = "tarot.v1.lastFreeUsedDate";

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function buildMockCards(seed: number): CardData[] {
  const presets = [
    { name: "은둔자", keyword: "내면 탐색과 고요한 통찰" },
    { name: "별", keyword: "회복과 미세한 희망의 징후" },
    { name: "심판", keyword: "되돌아보는 결단의 순간" }
  ];

  return presets.map((card, index) => ({
    id: `card-${seed}-${index}`,
    name: card.name,
    keyword: card.keyword,
    isReversed: (seed + index) % 2 === 1
  }));
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "어떤 고민을 안고 오셨습니까?"
  }
];

export function ChatBoard() {
  const isDev = process.env.NODE_ENV === "development";
  const isTestMode = isDev;
  const [inputText, setInputText] = useState("");
  const [isFreeUsedToday, setIsFreeUsedToday] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isTestMode) {
      setIsFreeUsedToday(false);
      return;
    }
    const savedDate = localStorage.getItem(FREE_DATE_KEY);
    setIsFreeUsedToday(savedDate === getTodayDateKey());
  }, [isTestMode]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTop = scroller.scrollHeight;
  }, [messages]);

  const placeholder = useMemo(() => {
    if (isFreeUsedToday) {
      return "오늘의 무료 기운이 다했습니다. 심화 세션을 열어주세요.";
    }

    return "지금 가장 마음에 걸리는 고민을 적어주세요...";
  }, [isFreeUsedToday]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isTestMode && isFreeUsedToday) return;

    const text = inputText.trim();
    if (!text) return;

    const now = Date.now();
    const aiMessageId = `assistant-${now}`;
    const cards = buildMockCards(now);

    if (!isTestMode) {
      localStorage.setItem(FREE_DATE_KEY, getTodayDateKey());
      setIsFreeUsedToday(true);
    }
    setInputText("");

    setMessages((prev) => [
      ...prev,
      { id: `user-${now}`, role: "user", content: text },
      {
        id: aiMessageId,
        role: "assistant",
        content: "운명의 흐름을 읽는 중입니다...",
        isLoading: true,
        cards
      }
    ]);

    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== aiMessageId) return message;

          return {
            ...message,
            isLoading: false,
            content: "세 장의 카드가 펼쳐졌습니다. 지금 보이는 상징을 먼저 천천히 느껴보세요."
          };
        })
      );
    }, 1100);
  };

  const handleResetFreeGate = () => {
    localStorage.removeItem(FREE_DATE_KEY);
    setIsFreeUsedToday(false);
    setInputText("");
  };

  return (
    <>
      <header className="shrink-0 p-4 border-b border-occult-bg-card text-center flex justify-center items-center">
        <h1 className="text-xl font-serif text-occult-text-main tracking-widest">동양 오컬트 타로 챗</h1>
      </header>

      <div ref={scrollerRef} className="flex-1 min-h-0 overflow-y-auto p-4 md:p-5 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="w-full">
            <div
              className={`max-w-[85%] p-4 text-sm leading-7 sm:text-base ${
                message.role === "assistant"
                  ? "bg-occult-bg-card text-occult-text-main rounded-2xl rounded-tl-sm"
                  : "ml-auto bg-occult-accent text-white rounded-2xl rounded-tr-sm"
              }`}
            >
              {message.content}
              {message.isLoading ? <span className="ml-1 inline-block animate-pulse text-occult-text-muted">...</span> : null}
            </div>

            {message.cards ? (
              <div className="mt-4 grid grid-cols-3 gap-3 md:gap-4">
                {message.cards.map((card) => (
                  <TarotCard
                    key={card.id}
                    name={card.name}
                    direction={card.isReversed ? "역방향" : "정방향"}
                    keyword={card.keyword}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <footer className="shrink-0 p-4 border-t border-occult-bg-card bg-occult-bg-main">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label htmlFor="tarot-input" className="sr-only">
            고민 입력
          </label>
          <input
            id="tarot-input"
            type="text"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder={placeholder}
            disabled={!isTestMode && isFreeUsedToday}
            className="flex-1 bg-occult-bg-card text-occult-text-main placeholder-occult-text-muted px-5 py-3 rounded-full outline-none focus:ring-1 focus:ring-occult-accent disabled:cursor-not-allowed disabled:opacity-65"
          />
          <button
            type="submit"
            disabled={(!isTestMode && isFreeUsedToday) || inputText.trim().length === 0}
            className="bg-occult-accent text-white px-6 py-3 rounded-full font-bold shrink-0 hover:bg-occult-accent-hover transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            전송
          </button>
        </form>
        {isDev && isFreeUsedToday ? (
          <button
            type="button"
            onClick={handleResetFreeGate}
            className="mt-2 text-xs text-occult-text-muted underline underline-offset-2 hover:text-occult-text-main"
          >
            개발용: 무료 상태 초기화
          </button>
        ) : null}
      </footer>
    </>
  );
}
