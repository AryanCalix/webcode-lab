import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  duration?: number;
}

/**
 * Counts a number up from its previous value. Falls back to an instant change
 * when the visitor asked for reduced motion.
 */
export function AnimatedNumber({ value, suffix = '', duration = 700 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !Number.isFinite(value)) {
      const frame = requestAnimationFrame(() => {
        if (cancelledRef.current) return;
        displayRef.current = value;
        setDisplay(value);
      });
      return () => cancelAnimationFrame(frame);
    }

    const from = displayRef.current;
    const target = value;

    if (from === target) return;

    const start = performance.now();

    const tick = (now: number) => {
      if (cancelledRef.current) return;

      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + (target - from) * eased);
      displayRef.current = next;
      setDisplay(next);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        displayRef.current = target;
        setDisplay(target);
      }
    };

    requestAnimationFrame(tick);
    return () => {
      cancelledRef.current = true;
    };
  }, [value, duration]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}
