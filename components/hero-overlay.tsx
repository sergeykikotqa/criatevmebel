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
    <div
      aria-hidden="true"
      data-hero-overlay
      className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden hero:flex"
    >
      <div className="ml-auto w-full max-w-[18.75rem] px-4 pt-[7.25rem] lg:px-10 lg:pt-[7.8rem]">
        <div className="grid gap-2.5 text-right">
          {phrases.map((phrase, index) => {
            const isProcessed = index < currentIndex;
            const isCurrent = index === currentIndex && currentIndex < phrases.length;
            const isCrossing = isCurrent && phase === "crossing";
            const toneClass = isProcessed
              ? "text-white/34"
              : isCurrent
                ? "text-white/84"
                : "text-white/62";
            const strikeClass = isProcessed
              ? "scale-x-100 opacity-34"
              : isCrossing
                ? "scale-x-100 opacity-82"
                : "scale-x-0 opacity-0";

            return (
              <div
                key={phrase}
                className={`relative flex justify-end text-[clamp(1.8rem,2.25vw,2.9rem)] font-semibold leading-[0.92] tracking-[-0.085em] transition-[color,opacity] duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${toneClass}`}
                style={overlayTextStyle}
              >
                <span>{phrase}</span>
                <span
                  aria-hidden="true"
                  style={transitionStyle}
                  className={`absolute left-[8%] right-0 top-1/2 h-px -translate-y-1/2 bg-white/46 transition-[opacity,transform] duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${strikeClass} origin-right`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function HeroOverlay(props: HeroOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return <AnimatedHeroOverlay key={props.phrases.join("|")} {...props} />;
}
