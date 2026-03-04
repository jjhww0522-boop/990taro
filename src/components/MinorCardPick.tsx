"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MinorCard, SUIT_LABELS } from "../lib/minorArcanaData";

type Props = {
    cards: MinorCard[]; // 뒷면으로 보여줄 5장
    onSelect: (card: MinorCard, isReversed: boolean) => void;
    disabled?: boolean;
};

export default function MinorCardPick({ cards, onSelect, disabled }: Props) {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);

    function handlePick(idx: number) {
        if (disabled || selectedIdx !== null) return;
        const isReversed = Math.random() < 0.3;
        setSelectedIdx(idx);
        // 0.6초 뒤 뒤집기 → 1.2초 뒤 부모에 전달
        setTimeout(() => setRevealed(true), 600);
        setTimeout(() => onSelect(cards[idx], isReversed), 1400);
    }

    return (
        <div className="flex flex-col items-center gap-3 py-2">
            <p className="text-[12px] text-[#ffd98e]/70 tracking-wide">
                ✦ 카드 한 장을 골라 더 깊이 살펴볼게요
            </p>

            <div className="flex items-center justify-center gap-2">
                {cards.map((card, idx) => {
                    const isPicked = selectedIdx === idx;
                    const isOther = selectedIdx !== null && !isPicked;

                    return (
                        <motion.button
                            key={card.id}
                            type="button"
                            disabled={disabled || selectedIdx !== null}
                            onClick={() => handlePick(idx)}
                            className="relative shrink-0 rounded-lg overflow-hidden cursor-pointer focus:outline-none"
                            style={{ width: 56, height: 84 }}
                            animate={{
                                scale: isPicked ? 1.15 : isOther ? 0.88 : 1,
                                opacity: isOther ? 0.4 : 1,
                                y: isPicked ? -8 : 0,
                            }}
                            whileHover={selectedIdx === null ? { y: -4, scale: 1.06 } : {}}
                            transition={{ type: "spring", stiffness: 280, damping: 20 }}
                        >
                            {/* 카드 뒷면 (항상 보임) */}
                            <motion.div
                                className="absolute inset-0 rounded-lg overflow-hidden"
                                style={{ backfaceVisibility: "hidden" }}
                                animate={{ rotateY: isPicked && revealed ? 180 : 0 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <img
                                    src="/cards/back_00.jpg"
                                    alt="타로 뒷면"
                                    draggable={false}
                                    className="h-full w-full object-cover"
                                />
                            </motion.div>

                            {/* 카드 앞면 (뒤집혔을 때) */}
                            <motion.div
                                className="absolute inset-0 rounded-lg overflow-hidden flex flex-col items-center justify-end"
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                    background: "linear-gradient(160deg,#1a0a2e,#0c1020)",
                                }}
                                animate={{ rotateY: isPicked && revealed ? 0 : -180 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="w-full text-center p-1">
                                    <p className="text-[9px] text-[#ffd98e] leading-tight font-bold truncate px-1">
                                        {card.name}
                                    </p>
                                    <p className="text-[8px] text-[#ffd98e]/50 truncate px-1">
                                        {SUIT_LABELS[card.suit]}
                                    </p>
                                </div>
                            </motion.div>

                            {/* 골드 글로우 (선택 시) */}
                            <AnimatePresence>
                                {isPicked && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 rounded-lg pointer-events-none"
                                        style={{
                                            boxShadow: "0 0 16px 4px rgba(232,201,106,0.5)",
                                            border: "1px solid rgba(232,201,106,0.7)",
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
