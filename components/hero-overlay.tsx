"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type HeroOverlayProps = {
  phrases: [string, string, string];
  holdMs?: number;
  crossMs?: number;
  gapMs?: number;
};

type OverlayPhase = "idle" | "crossing";

const overlayTextStyle = {
  textShadow: "0 10px 28px rgba(0, 0, 0, 0.34), 0 3px 10px rgba(0, 0, 0, 0.48)",
} as const;

function AnimatedHeroOverlay({
  phrases,
  holdMs = 940,
  crossMs = 420,
  gapMs = 140,
}: HeroOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<OverlayPhase>("idle");
  const transitionStyle = {
    transitionDuration: `${crossMs}ms`,
  } as const;

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (delay: number, callback: () => void) => {
      const timer = setTimeout(callback, delay);
      timers.push(timer);
    };

    const clearTimers = () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };

    const runPhrase = (index: number) => {
      if (cancelled || index >= phrases.length) {
        return;
      }

      setCurrentIndex(index);
      setPhase("idle");

      schedule(holdMs, () => {
        if (cancelled) {
          return;
        }

        setPhase("crossing");

        schedule(crossMs, () => {
          if (cancelled) {
            return;
          }

          const nextIndex = index + 1;
          setCurrentIndex(nextIndex);
          setPhase("idle");

          if (nextIndex < phrases.length) {
            schedule(gapMs, () => {
              runPhrase(nextIndex);
            });
          }
        });
      });
    };

    runPhrase(0);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [crossMs, gapMs, holdMs, phrases]);

  return (
    <div aria-hidden="true" data-hero-overlay className="grid gap-1.5 text-right">
      {phrases.map((phrase, index) => {
        const isProcessed = index < currentIndex;
        const isCurrent = index === currentIndex && currentIndex < phrases.length;
        const isCrossing = isCurrent && phase === "crossing";
        const toneClass = isProcessed
          ? "text-white/42"
          : isCurrent
            ? "text-white/84"
            : "text-white/52";
        const strikeClass = isProcessed
          ? "scale-x-100 opacity-44"
          : isCrossing
            ? "scale-x-100 opacity-88"
            : "scale-x-0 opacity-0";

        return (
          <div
            key={phrase}
            className={`relative ml-auto w-fit whitespace-nowrap text-[clamp(1.55rem,1.95vw,2.3rem)] font-semibold leading-[0.9] tracking-[-0.075em] transition-[color,opacity] duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${toneClass}`}
            style={overlayTextStyle}
          >
            <span>{phrase}</span>
            <span
              aria-hidden="true"
              style={transitionStyle}
              className={`absolute left-[8%] right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.66)_26%,rgba(255,255,255,0.92)_50%,rgba(255,255,255,0.66)_74%,rgba(255,255,255,0.14)_100%)] transition-[opacity,transform] duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${strikeClass} origin-right`}
            />
          </div>
        );
      })}
    </div>
  );
}

export function HeroOverlay(props: HeroOverlayProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setHasMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!hasMounted || prefersReducedMotion) {
    return null;
  }

  return <AnimatedHeroOverlay key={props.phrases.join("|")} {...props} />;
}
