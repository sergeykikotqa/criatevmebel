"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type HeroOverlayProps = {
  phrases: [string, string, string];
  holdMs?: number;
  exitMs?: number;
  gapMs?: number;
};

type OverlayPhase = "visible" | "exiting" | "done";

const overlayTextStyle = {
  textShadow: "0 10px 28px rgba(0, 0, 0, 0.34), 0 3px 10px rgba(0, 0, 0, 0.48)",
} as const;

export function HeroOverlay({
  phrases,
  holdMs = 1000,
  exitMs = 420,
  gapMs = 140,
}: HeroOverlayProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<0 | 1 | 2 | null>(0);
  const [phase, setPhase] = useState<OverlayPhase>("visible");
  const transitionStyle = {
    transitionDuration: `${prefersReducedMotion ? 0 : exitMs}ms`,
  } as const;

  useEffect(() => {
    if (prefersReducedMotion) {
      const doneTimer = setTimeout(() => {
        setActiveIndex(null);
        setPhase("done");
      }, 0);

      return () => {
        clearTimeout(doneTimer);
      };
    }

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
    }, exitMs);

    return () => {
      clearTimeout(exitTimer);
      if (gapTimer) {
        clearTimeout(gapTimer);
      }
    };
  }, [activeIndex, exitMs, gapMs, holdMs, phase, phrases.length, prefersReducedMotion]);

  const currentPhrase = activeIndex === null ? null : phrases[activeIndex];
  const isVisible = phase === "visible" && currentPhrase !== null;
  const toneClass =
    activeIndex === 1 ? "text-white/88" : activeIndex === 2 ? "text-white/82" : "text-white/92";

  return (
    <div
      aria-hidden="true"
      data-hero-overlay
      className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden justify-end px-10 pt-10 lg:flex"
    >
      <div className="min-h-[3.5rem] max-w-[15rem] text-right">
        <p
          className={`relative inline-block text-[clamp(1.9rem,2.7vw,3rem)] font-semibold leading-[0.92] tracking-[-0.085em] ${toneClass} transition-[opacity,transform] duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
          style={{ ...overlayTextStyle, ...transitionStyle }}
        >
          <span>{currentPhrase ?? ""}</span>
          <span
            style={transitionStyle}
            className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/72 transition-transform duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
              isVisible ? "scale-x-0" : "scale-x-100"
            } origin-left`}
          />
        </p>
      </div>
    </div>
  );
}
