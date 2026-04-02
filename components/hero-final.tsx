"use client";

import { useState } from "react";

import { HeroOverlay } from "@/components/hero-overlay";

type HeroFinalProps = {
  finalPhrase: string;
  transientPhrases: [string, string, string];
};

export function HeroFinal({ finalPhrase, transientPhrases }: HeroFinalProps) {
  const [finalVisible, setFinalVisible] = useState(false);
  const finalPhraseClassName = finalVisible
    ? "opacity-100"
    : "opacity-100 lg:opacity-0";

  return (
    <>
      <div className="mt-2 w-fit max-w-[14.5rem] rounded-[1.6rem] border border-[rgba(222,214,199,0.2)] bg-[linear-gradient(180deg,rgba(9,13,18,0.82),rgba(9,13,18,0.52))] px-4 py-4 backdrop-blur-md sm:mt-3 sm:max-w-[16rem] sm:px-5 lg:mt-4 lg:max-w-full lg:rounded-[1.8rem] lg:border-white/14 lg:bg-[linear-gradient(180deg,rgba(10,14,19,0.78),rgba(10,14,19,0.44))] lg:px-6 lg:py-5">
        <p className="kicker text-[var(--color-accent)]">Остаётся</p>
        <p
          className={`mt-3 text-[clamp(1.8rem,8vw,2.7rem)] font-semibold leading-[0.92] tracking-[-0.085em] text-white transition-opacity duration-500 sm:mt-4 lg:text-[clamp(2rem,3.2vw,3.7rem)] lg:leading-none ${finalPhraseClassName}`}
        >
          {finalPhrase}
        </p>
      </div>

      <HeroOverlay phrases={transientPhrases} onComplete={() => setFinalVisible(true)} />
    </>
  );
}
