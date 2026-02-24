import { useCallback, useEffect, useRef, useState } from "react";

type UseUnlockCtaPulseOptions = {
  prefersReducedMotion: boolean;
};

export function useUnlockCtaPulse(options: UseUnlockCtaPulseOptions) {
  const [pulseTick, setPulseTick] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const hasRunRef = useRef(false);

  const clearPulseTimer = useCallback(() => {
    if (timeoutRef.current === null) return;
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  useEffect(() => clearPulseTimer, [clearPulseTimer]);

  const runPulseAfterTypewriterDone = useCallback(() => {
    if (options.prefersReducedMotion) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const pulseCount = Math.random() > 0.5 ? 2 : 1;
    let emitted = 0;

    const emit = () => {
      emitted += 1;
      setPulseTick((prev) => prev + 1);
      if (emitted >= pulseCount) return;
      timeoutRef.current = window.setTimeout(emit, 700);
    };

    emit();
  }, [options.prefersReducedMotion]);

  const resetPulseLock = useCallback(() => {
    hasRunRef.current = false;
    clearPulseTimer();
  }, [clearPulseTimer]);

  return {
    pulseTick,
    runPulseAfterTypewriterDone,
    resetPulseLock,
  };
}
