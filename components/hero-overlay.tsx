"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type HeroOverlayProps = {
  phrases: [string, string, string];
  holdMs?: number;
  exitMs?: number;
  gapMs?: number;
  onComplete?: () => void;
};

type OverlayPhase = "visible" | "exiting" | "done";

const overlayTextStyle = {
  textShadow: "0 10px 28px rgba(0, 0, 0, 0.34), 0 3px 10px rgba(0, 0, 0, 0.48)",
} as const;

function AnimatedHeroOverlay({
  phrases,
  holdMs = 1000,
  exitMs = 420,
  gapMs = 140,
  onComplete,
}: HeroOverlayProps) {
  const [activeIndex, setActiveIndex] = useState<0 | 1 | 2 | null>(0);
  const [phase, setPhase] = useState<OverlayPhase>("visible");
  const [hasCompleted, setHasCompleted] = useState(false);
  const transitionStyle = {
    transitionDuration: `${exitMs}ms`,
  } as const;

  useEffect(() => {
    if (phase === "done" || activeIndex === null) {
      return;
    }

    if (phase === "visible") {
      const holdTimer = setTimeout(() => {
        setPhase("exiting");
      }, holdMs);

      return () => {
        clearTimeout(holdTimer);
      };
    }

    let gapTimer: ReturnType<typeof setTimeout> | null = null;
    const exitTimer = setTimeout(() => {
      if (activeIndex < phrases.length - 1) {
        gapTimer = setTimeout(() => {
          setActiveIndex((current) =>
            current === null ? current : ((current + 1) as 0 | 1 | 2),
          );
          setPhase("visible");
        }, gapMs);
        return;
      }

      setActiveIndex(null);
      setPhase("done");
      if (!hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    }, exitMs);

    return () => {
      clearTimeout(exitTimer);
      if (gapTimer) {
        clearTimeout(gapTimer);
      }
    };
  }, [
    activeIndex,
    exitMs,
    gapMs,
    holdMs,
    phase,
    phrases.length,
    hasCompleted,
    onComplete,
  ]);

  const currentPhrase = activeIndex === null ? null : phrases[activeIndex];
  const isVisible = phase === "visible" && currentPhrase !== null;
  const toneClass =
    activeIndex === 1 ? "text-white/88" : activeIndex === 2 ? "text-white/82" : "text-white/92";

  return (
    <div
      aria-hidden="true"
      data-hero-overlay
      className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden justify-end px-10 pt-10 hero:flex"
    >
      <div className="min-h-[4.1rem] w-full max-w-[24rem] text-right">
        <p
          className={`relative inline-block whitespace-nowrap text-[clamp(2rem,2.45vw,2.95rem)] font-semibold leading-[0.9] tracking-[-0.085em] ${toneClass} transition-[opacity,transform] duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
          style={{ ...overlayTextStyle, ...transitionStyle }}
        >
          <span>{currentPhrase ?? ""}</span>
          <span
            style={transitionStyle}
            className={`absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.88)_18%,rgba(255,255,255,0.98)_50%,rgba(255,255,255,0.88)_82%,rgba(255,255,255,0.16)_100%)] transition-transform duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "scale-x-0" : "scale-x-100"
            } origin-left`}
          />
        </p>
      </div>
    </div>
  );
}

export function HeroOverlay(props: HeroOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return <AnimatedHeroOverlay {...props} />;
}
