import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";
import styles from "./unlock-reveal.module.css";

type UnlockRevealProps = {
  lockedText: string;
  detailButtonLabel?: string;
  onDetailClick?: () => void;
  onTypewriterDone?: () => void;
  className?: string;
};

type LockPhase = "idle" | "shaking" | "breaking" | "gone";

const LOCKED_TEXT_LIMIT = 80;
const TYPEWRITER_MS_PER_CHAR = 40;

export function UnlockReveal(props: UnlockRevealProps) {
  const { onTypewriterDone } = props;
  const prefersReducedMotion = usePrefersReducedMotion();
  const [lockPhase, setLockPhase] = useState<LockPhase>(prefersReducedMotion ? "gone" : "idle");
  const [visibleLength, setVisibleLength] = useState(prefersReducedMotion ? LOCKED_TEXT_LIMIT : 0);
  const [pulseTick, setPulseTick] = useState(0);
  const [isTypewriterDone, setIsTypewriterDone] = useState(prefersReducedMotion);
  const pulseStartedRef = useRef(false);

  const text = useMemo(() => props.lockedText.slice(0, LOCKED_TEXT_LIMIT), [props.lockedText]);
  const visibleText = text.slice(0, visibleLength);

  useEffect(() => {
    if (prefersReducedMotion) {
      setLockPhase("gone");
      setVisibleLength(text.length);
      setIsTypewriterDone(true);
      return;
    }

    const timers: number[] = [];
    setLockPhase("shaking");
    timers.push(window.setTimeout(() => setLockPhase("breaking"), 420));
    timers.push(window.setTimeout(() => setLockPhase("gone"), 860));

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [prefersReducedMotion, text.length]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (lockPhase !== "gone") return;

    let cancelled = false;
    let index = 0;

    const tick = () => {
      if (cancelled) return;
      index += 1;
      setVisibleLength(index);
      if (index >= text.length) {
        setIsTypewriterDone(true);
        onTypewriterDone?.();
        return;
      }
      window.setTimeout(tick, TYPEWRITER_MS_PER_CHAR);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [lockPhase, onTypewriterDone, prefersReducedMotion, text.length]);

  useEffect(() => {
    if (!isTypewriterDone) return;
    if (prefersReducedMotion) return;
    if (pulseStartedRef.current) return;

    pulseStartedRef.current = true;
    const pulses = Math.random() > 0.5 ? 2 : 1;
    let count = 0;
    const timers: number[] = [];

    const run = () => {
      count += 1;
      setPulseTick((prev) => prev + 1);
      if (count >= pulses) return;
      timers.push(window.setTimeout(run, 700));
    };

    run();
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [isTypewriterDone, prefersReducedMotion]);

  const pulseClass = pulseTick === 0 ? "" : pulseTick % 2 === 0 ? styles.detailPulseB : styles.detailPulseA;

  return (
    <section className={`${styles.wrapper} ${props.className ?? ""}`.trim()} aria-live="polite">
      <div className={styles.lockStage}>
        {lockPhase !== "gone" ? (
          <div
            className={[
              styles.lockGlyph,
              lockPhase === "shaking" ? styles.lockShake : "",
              lockPhase === "breaking" ? styles.lockBreak : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className={styles.lockIcon} aria-hidden="true" focusable="false">
              <path
                d="M7.5 10V7.7a4.5 4.5 0 1 1 9 0V10m-10.5 0h12a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8a1 1 0 0 1 1-1Zm6 4v3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className={styles.lockDust} aria-hidden="true" />
        )}
      </div>

      <p className={styles.lockedText}>
        {visibleText}
        {!isTypewriterDone && <span className={styles.cursor} aria-hidden="true">|</span>}
      </p>

      <button
        type="button"
        onClick={props.onDetailClick}
        disabled={!isTypewriterDone}
        className={`${styles.detailButton} ${pulseClass}`}
        data-pulse={pulseTick}
      >
        {props.detailButtonLabel ?? "자세히 (1회)"}
      </button>
    </section>
  );
}
