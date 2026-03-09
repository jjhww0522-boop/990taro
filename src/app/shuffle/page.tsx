"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";

const CARD_COUNT = 22;

const shuffleVariants: Variants = {
  initial: { rotate: 0, x: 0 },
  shuffle: {
    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
    x: [0, -30, 30, -20, 20, 0],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      staggerChildren: 0.045,
      delayChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  initial: { x: 0, rotate: 0, y: 0, opacity: 1 },
  shuffle: (i: number) => ({
    x: [0, (i - 11) * 15, 0],
    rotate: [0, (i - 11) * 3, 0],
    y: [0, -6, 0],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  }),
};

export default function ShufflePage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const smokeParticles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, idx) => ({
        id: idx,
        left: `${6 + idx * 9}%`,
        delay: `${(idx % 5) * 0.55}s`,
        duration: `${6 + (idx % 4)}s`,
        drift: `${idx % 2 === 0 ? 18 : -18}px`,
      })),
    [],
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([18, 30, 18]);
    }

    const fadeTimer = window.setTimeout(() => setIsExiting(true), 2200);
    const routeTimer = window.setTimeout(() => router.push("/pick"), 2700);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(routeTimer);
    };
  }, [router]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#DCD8C0]"
    >
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6">
        <p className="mb-14 text-center text-base md:text-2xl leading-relaxed text-[#DCD8C0] drop-shadow-[0_0_12px_rgba(140,39,39,0.45)]">
          별빛 아래 운명의 카드를 섞고 있습니다<br className="md:hidden" />
          {" "}잠시만 기다려 주세요...
        </p>

        <motion.div
          variants={shuffleVariants}
          initial="initial"
          animate="shuffle"
          className="relative h-[340px] w-[340px] md:h-[420px] md:w-[420px]"
        >
          {Array.from({ length: CARD_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              className="absolute left-1/2 top-1/2 h-[180px] w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-xl overflow-hidden border border-[#8C2727]/45 shadow-[0_0_16px_rgba(0,0,0,0.45)] brightness-[0.8] md:h-[210px] md:w-[128px]"
              style={{ zIndex: CARD_COUNT - i }}
            >
              <Image
                src="/tarot/cards/back_00.jpg"
                alt={`card-${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 110px, 128px"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48">
        {smokeParticles.map((particle) => (
          <span
            key={particle.id}
            className="smoke-particle"
            style={
              {
                left: particle.left,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
                "--drift": particle.drift,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <style jsx>{`
        .smoke-particle {
          position: absolute;
          bottom: -28px;
          width: 110px;
          height: 110px;
          border-radius: 999px;
          background: radial-gradient(circle at 50% 50%, rgba(140, 39, 39, 0.22), rgba(140, 39, 39, 0) 68%);
          filter: blur(18px);
          opacity: 0;
          animation-name: incenseSmoke;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes incenseSmoke {
          0% {
            transform: translate3d(0, 0, 0) scale(0.8);
            opacity: 0;
          }
          18% {
            opacity: 0.26;
          }
          100% {
            transform: translate3d(var(--drift), -190px, 0) scale(1.35);
            opacity: 0;
          }
        }
      `}</style>
    </motion.main>
  );
}
