"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAJOR_ARCANA } from "../../lib/tarotData";
import Link from "next/link";

export default function CollectionPage() {
    const [collected, setCollected] = useState<number[]>([]);
    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const raw = localStorage.getItem("collectedCards");
                if (raw) {
                    setCollected(JSON.parse(raw));
                }
            } catch (e) {
                console.error("Failed to load collection", e);
            }
        }
    }, []);

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#0c1020] text-[#fef9f0] font-sans flex flex-col items-center">
            {/* 배경 장식 (메인 화면 스타일 차용) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)] blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(140,28,28,0.05)_0%,transparent_70%)] blur-[100px]" />
            </div>

            {/* 헤더 */}
            <header className="relative z-10 w-full max-w-5xl px-6 py-6 mt-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-[#e8c96a] hover:text-[#fff] transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">돌아가기</span>
                </Link>
                <div className="text-center">
                    <h1 className="font-['Nosifer'] text-[#F5ECD7] text-xl tracking-[0.1em] drop-shadow-[0_0_10px_rgba(201,168,76,0.6)]">
                        COLLECTION
                    </h1>
                    <p className="text-sm text-[#fef9f0]/60 mt-1">
                        수집한 별빛 : <span className="text-[#e8c96a] font-bold">{collected.length}</span> / {MAJOR_ARCANA.length}
                    </p>
                </div>
                <div className="w-20" /> {/* 균형 맞추기용 빈 공간 */}
            </header>

            {/* 갤러리 그리드 */}
            <section className="relative z-10 w-full max-w-5xl px-6 pb-20 mt-6 md:mt-10 overflow-y-auto">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {MAJOR_ARCANA.map((card, idx) => {
                        const isCollected = collected.includes(idx);

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.4 }}
                                onClick={() => isCollected && setSelectedCard(idx)}
                                className={`relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border ${isCollected
                                        ? "border-[#e8c96a]/40 hover:border-[#e8c96a] hover:shadow-[0_0_20px_rgba(232,201,106,0.4)] group"
                                        : "border-gray-800 opacity-50 grayscale hover:grayscale-0 hover:opacity-70"
                                    }`}
                            >
                                {/* 카드 이미지 */}
                                <div className={`w-full h-full bg-[#121212] ${!isCollected ? "brightness-50" : ""}`}>
                                    <img
                                        src={card.image}
                                        alt={card.name}
                                        className={`w-full h-full object-cover transition-transform duration-500 ${isCollected ? "group-hover:scale-110" : ""}`}
                                    />
                                </div>

                                {/* 미수집 상태 오버레이 (자물쇠) */}
                                {!isCollected && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
                                        <span className="text-3xl opacity-60">🔒</span>
                                        <span className="text-[10px] md:text-xs text-white/50 mt-2 font-serif font-bold tracking-widest">NO. {idx}</span>
                                    </div>
                                )}

                                {/* 수집 완료 오버레이 (카드 이름) */}
                                {isCollected && (
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8 pointer-events-none">
                                        <p className="text-[10px] md:text-xs text-[#e8c96a] font-serif tracking-widest drop-shadow-md">NO. {idx}</p>
                                        <p className="text-xs md:text-sm text-white font-bold drop-shadow-md truncate">{card.name}</p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* 모달: 선택한 카드 확대 보기 */}
            <AnimatePresence>
                {selectedCard !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedCard(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-lg w-full bg-[#121212] border border-[#e8c96a]/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(232,201,106,0.2)] flex flex-col md:flex-row"
                        >
                            {/* 이미지 꽉 차게 */}
                            <div className="w-full md:w-1/2 aspect-[2/3] relative">
                                <img src={MAJOR_ARCANA[selectedCard].image} alt={MAJOR_ARCANA[selectedCard].name} className="w-full h-full object-cover" />
                            </div>
                            {/* 설명 텍스트 (옵션) */}
                            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-[#1a1f2e] to-[#0c1020]">
                                <p className="text-[#e8c96a] font-serif text-sm tracking-widest mb-1">NO. {selectedCard}</p>
                                <h3 className="text-2xl md:text-3xl text-white font-serif font-bold mb-4 drop-shadow-md">{MAJOR_ARCANA[selectedCard].name}</h3>
                                <div className="space-y-3">
                                    <p className="text-sm text-[#fef9f0]/80 leading-relaxed"><span className="text-[#e8c96a] font-bold text-[10px] border border-[#e8c96a]/30 rounded px-1.5 py-0.5 mr-2">정방향</span>{MAJOR_ARCANA[selectedCard].upright}</p>
                                    <p className="text-sm text-[#fef9f0]/60 leading-relaxed"><span className="text-[#d46b6b] font-bold text-[10px] border border-[#d46b6b]/30 rounded px-1.5 py-0.5 mr-2">역방향</span>{MAJOR_ARCANA[selectedCard].reversed}</p>
                                </div>

                                <button
                                    onClick={() => setSelectedCard(null)}
                                    className="mt-8 w-full py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-white/80"
                                >
                                    닫기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
