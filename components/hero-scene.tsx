"use client";

import { useState } from "react";

import { HeroOverlay } from "@/components/hero-overlay";
import type { HeroContent } from "@/lib/content";

type HeroSceneProps = Pick<HeroContent, "transientPhrases" | "finalPhrase">;

const finalPlateBaseClass =
  "absolute inset-x-0 bottom-0 rounded-[1.7rem] border border-[rgba(222,214,199,0.2)] bg-[linear-gradient(180deg,rgba(9,13,18,0.82),rgba(9,13,18,0.52))] px-4 py-4 backdrop-blur-md transition-all duration-[220ms] ease-out sm:rounded-[1.8rem] sm:px-5 hero:rounded-[1.8rem]";

export function HeroScene({ transientPhrases, finalPhrase }: HeroSceneProps) {
  const [finalVisible, setFinalVisible] = useState(false);

  return (
    <>
      <div className="absolute inset-0 z-10 hero:hidden">
        <div className="absolute left-4 top-4 z-20 max-w-[10.75rem] sm:left-6 sm:top-6 sm:max-w-[11.5rem]">
          <p className="kicker text-white/40">Временные решения</p>
          <p className="mt-3 text-sm leading-6 text-white/56">
            То, что сначала кажется терпимым, а потом раздражает каждый день.
          </p>
        </div>

        <div className="absolute inset-x-4 bottom-4 z-10 flex justify-end sm:inset-x-6 sm:bottom-6">
          <div className="relative h-[13.75rem] w-full max-w-[15.5rem] sm:h-[14.5rem] sm:max-w-[16.5rem]">
            <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[9rem] z-10">
              <HeroOverlay
                phrases={transientPhrases}
                dimmed={finalVisible}
                onComplete={() => setFinalVisible(true)}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 min-h-[9rem]">
              <div
                aria-hidden={!finalVisible}
                className={`${finalPlateBaseClass} ${
                  finalVisible
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-[6px] opacity-0"
                }`}
              >
                <p className="kicker text-[var(--color-accent)]">Остаётся</p>
                <p className="mt-3 max-w-[8ch] text-[clamp(1.8rem,8vw,2.7rem)] font-semibold leading-[0.92] tracking-[-0.085em] text-white sm:mt-4">
                  {finalPhrase}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 hidden hero:block">
        <div className="flex h-full gap-6 p-10">
          <div className="relative z-20 max-w-[13rem]">
            <p className="kicker text-white/40">Временные решения</p>
            <p className="mt-3 text-sm leading-6 text-white/56">
              То, что сначала кажется терпимым, а потом раздражает каждый день.
            </p>
          </div>

          <div className="ml-auto flex h-full w-full max-w-[21rem] flex-col">
            <div className="pointer-events-none min-h-0 flex-1 pt-[5.15rem]">
              <HeroOverlay
                phrases={transientPhrases}
                dimmed={finalVisible}
                onComplete={() => setFinalVisible(true)}
              />
            </div>

            <div className="relative min-h-[10.75rem]">
              <div
                aria-hidden={!finalVisible}
                className={`${finalPlateBaseClass} ${
                  finalVisible
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-[6px] opacity-0"
                } hero:px-5 hero:py-4`}
              >
                <p className="kicker text-[var(--color-accent)]">Остаётся</p>
                <p className="mt-3 max-w-[8ch] text-[clamp(2.05rem,3vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.085em] text-white">
                  {finalPhrase}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
