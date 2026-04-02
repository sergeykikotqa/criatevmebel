"use client";

import { useReducedMotion } from "framer-motion";
import { useState } from "react";

import { HeroOverlay } from "@/components/hero-overlay";

type HeroFinalProps = {
  finalPhrase: string;
  transientPhrases: [string, string, string];
};

export function HeroFinal({ finalPhrase, transientPhrases }: HeroFinalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [finalVisible, setFinalVisible] = useState(false);
  const finalPhraseClassName =
    finalVisible || prefersReducedMotion
      ? "opacity-100"
      : "opacity-100 hero:opacity-0 motion-reduce:opacity-100";

  return (
    <>
      <div className="mt-2 w-fit max-w-[15rem] rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,18,0.76),rgba(9,13,18,0.42))] px-4 py-4 backdrop-blur-md sm:mt-3 sm:max-w-[17rem] sm:px-5 sm:py-5 hero:mt-4 hero:ml-auto hero:w-full hero:max-w-[24rem] hero:rounded-[2rem] hero:border-white/12 hero:px-7 hero:py-6">
        <p
          className={`text-[clamp(1.8rem,8vw,2.75rem)] font-semibold leading-[0.9] tracking-[-0.09em] text-white transition-opacity duration-500 hero:text-[clamp(2.3rem,2.8vw,3.45rem)] ${finalPhraseClassName}`}
        >
          {finalPhrase}
        </p>
      </div>

      <HeroOverlay phrases={transientPhrases} onComplete={() => setFinalVisible(true)} />
    </>
  );
}
