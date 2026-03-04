"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MinorCard, SUIT_LABELS } from "../lib/minorArcanaData";

type Props = {
    cards: MinorCard[]; // 뒷면으로 보여줄 5장
    onSelect: (card: MinorCard, isReversed: boolean) => void;
    disabled?: boolean;
};

// 수트별 이모지
const SUIT_EMOJI: Record<MinorCard["suit"], string> = {
    wands: "🔥",
    cups: "🌙",
    swords: "⚔️",
    pentacles: "🌿",
};

export default function MinorCardPick({ cards, onSelect, disabled }: Props) {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);

    function handlePick(idx: number) {
        if (disabled || selectedIdx !== null) return;
        const isReversed = Math.random() < 0.3;
        setSelectedIdx(idx);
        setTimeout(() => setRevealed(true), 600);
        setTimeout(() => onSelect(cards[idx], isReversed), 1400);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "4px 0" }}>
            <p style={{ fontSize: 11, color: "rgba(232,201,106,0.7)", letterSpacing: "0.08em", margin: 0 }}>
                ✦ 카드 한 장을 골라 더 깊이 살펴볼게요
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {cards.map((card, idx) => {
                    const isPicked = selectedIdx === idx;
                    const isOther = selectedIdx !== null && !isPicked;

                    return (
                        <motion.button
                            key={card.id}
                            type="button"
                            disabled={disabled || selectedIdx !== null}
                            onClick={() => handlePick(idx)}
                            style={{ position: "relative", width: 48, height: 72, borderRadius: 8, overflow: "hidden", cursor: selectedIdx === null ? "pointer" : "default", border: "none", padding: 0, background: "transparent" }}
                            animate={{
                                scale: isPicked ? 1.15 : isOther ? 0.88 : 1,
                                opacity: isOther ? 0.4 : 1,
                                y: isPicked ? -8 : 0,
                            }}
                            whileHover={selectedIdx === null ? { y: -5, scale: 1.07 } : {}}
                            transition={{ type: "spring", stiffness: 280, damping: 20 }}
                        >
                            {/* 카드 뒷면 */}
                            <motion.div
                                style={{
                                    position: "absolute", inset: 0, borderRadius: 8, overflow: "hidden",
                                    backfaceVisibility: "hidden",
                                    background: "linear-gradient(160deg, #1e0a3c 0%, #0c1020 60%, #0a1a2e 100%)",
                                    border: "1px solid rgba(232,201,106,0.35)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                                animate={{ rotateY: isPicked && revealed ? 180 : 0 }}
                                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* 별빛 패턴 */}
                                <span style={{ fontSize: 18, opacity: 0.6, userSelect: "none" }}>✦</span>
                                <div style={{
                                    position: "absolute", inset: 0, borderRadius: 8,
                                    background: "radial-gradient(ellipse at 50% 30%, rgba(232,201,106,0.12) 0%, transparent 70%)",
                                }} />
                            </motion.div>

                            {/* 카드 앞면 (뒤집혔을 때) */}
                            <motion.div
                                style={{
                                    position: "absolute", inset: 0, borderRadius: 8,
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                    background: "linear-gradient(160deg, #1a0a2e, #0c1020)",
                                    border: "1px solid rgba(232,201,106,0.5)",
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: 4,
                                }}
                                animate={{ rotateY: isPicked && revealed ? 0 : -180 }}
                                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <span style={{ fontSize: 16 }}>{SUIT_EMOJI[card.suit]}</span>
                                <p style={{ fontSize: 8, color: "#ffd98e", fontWeight: 700, textAlign: "center", margin: 0, lineHeight: 1.2, wordBreak: "keep-all" }}>
                                    {card.name}
                                </p>
                            </motion.div>

                            {/* 골드 글로우 (선택 시) */}
                            <AnimatePresence>
                                {isPicked && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            position: "absolute", inset: 0, borderRadius: 8, pointerEvents: "none",
                                            boxShadow: "0 0 20px 4px rgba(232,201,106,0.55)",
                                            border: "1.5px solid rgba(232,201,106,0.8)",
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
