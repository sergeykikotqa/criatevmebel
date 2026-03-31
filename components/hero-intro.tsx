"use client";

import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import type { ImageAsset } from "@/lib/content";

type HeroIntroProps = {
  phrases: string[];
  image: ImageAsset;
};

const easing = [0.22, 1, 0.36, 1] as const;

const desktopIntroDelay = 0.74;
const desktopPhraseIn = 0.22;
const desktopHold = 0.28;
const desktopGesture = 0.26;
const desktopFade = 0.15;
const desktopPause = 0.11;
const desktopPhaseDuration =
  desktopPhraseIn + desktopHold + desktopGesture + desktopFade;
const desktopCycleDuration = desktopPhaseDuration + desktopPause;

export function HeroIntro({ phrases, image }: HeroIntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const rawX = useMotionValue(280);
  const rawY = useMotionValue(160);
  const mouseX = useSpring(rawX, { stiffness: 58, damping: 24, mass: 0.9 });
  const mouseY = useSpring(rawY, { stiffness: 58, damping: 24, mass: 0.9 });
  const spotlight = useMotionTemplate`radial-gradient(17rem circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.08), rgba(255,255,255,0.022) 18%, transparent 58%)`;

  const finalPhrase = phrases[phrases.length - 1];
  const transientPhrases = phrases.slice(0, -1);
  const finalDelay =
    desktopIntroDelay + transientPhrases.length * desktopCycleDuration + 0.14;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set(event.clientX - bounds.left);
    rawY.set(event.clientY - bounds.top);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set(bounds.width * 0.66);
    rawY.set(bounds.height * 0.42);
  };

  return (
    <div
      className="relative isolate min-h-[15.25rem] overflow-hidden rounded-[2.1rem] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:min-h-[18rem] lg:min-h-[31rem] lg:rounded-[2.75rem]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 42vw"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(5,7,10,0.9)_6%,rgba(5,7,10,0.6)_44%,rgba(5,7,10,0.8)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_32%)] opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[linear-gradient(180deg,transparent,rgba(7,10,14,0.92))]" />
      {!prefersReducedMotion ? (
        <motion.div
          className="absolute inset-0 mix-blend-screen"
          style={{ background: spotlight }}
        />
      ) : null}

      <div className="relative flex h-full flex-col justify-between p-4 sm:p-6 lg:p-10">
        <div className="hidden max-w-[14rem] lg:block">
          <p className="kicker text-white/40">Временные решения</p>
          <p className="mt-3 text-sm leading-6 text-white/56">
            То, что сначала кажется терпимым, а потом раздражает каждый день.
          </p>
        </div>

        <div className="hidden flex-1 items-center justify-end lg:flex">
          <div className="relative h-[8.8rem] w-full max-w-[21rem]">
            {transientPhrases.map((phrase, index) => {
              const delay = desktopIntroDelay + index * desktopCycleDuration;

              return (
                <motion.div
                  key={phrase}
                  className="absolute inset-x-0 top-0 text-right text-[clamp(1.55rem,2.55vw,2.4rem)] font-semibold leading-none tracking-[-0.08em] text-white/72"
                  initial={prefersReducedMotion ? false : { opacity: 0.22 }}
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { opacity: [0.22, 0.84, 0.84, 0.38, 0.16] }
                  }
                  transition={{
                    duration: desktopPhaseDuration,
                    delay,
                    times: [
                      0,
                      desktopPhraseIn / desktopPhaseDuration,
                      (desktopPhraseIn + desktopHold) / desktopPhaseDuration,
                      (desktopPhraseIn + desktopHold + desktopGesture) /
                        desktopPhaseDuration,
                      1,
                    ],
                    ease: easing,
                  }}
                >
                  <span className={prefersReducedMotion ? "line-through decoration-white/18" : ""}>
                    {phrase}
                  </span>
                  <motion.span
                    aria-hidden="true"
                    className="absolute left-[6%] right-0 top-1/2 h-px origin-right bg-white/20"
                    initial={prefersReducedMotion ? false : { scaleX: 0 }}
                    animate={prefersReducedMotion ? undefined : { scaleX: 1 }}
                    transition={{
                      duration: desktopGesture + desktopFade,
                      delay: delay + desktopPhraseIn + desktopHold,
                      ease: easing,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="hidden w-fit max-w-full rounded-[1.8rem] border border-white/14 bg-[linear-gradient(180deg,rgba(10,14,19,0.78),rgba(10,14,19,0.44))] px-6 py-5 backdrop-blur-md lg:block"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.78, delay: finalDelay, ease: easing }}
        >
          <p className="kicker text-[var(--color-accent)]">Остаётся</p>
          <p className="mt-4 text-[clamp(2rem,3.2vw,3.7rem)] font-semibold leading-none tracking-[-0.085em] text-white">
            {finalPhrase}
          </p>
        </motion.div>

        <motion.div
          className="flex h-full items-end lg:hidden"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.76, delay: 0.18, ease: easing }}
        >
          <div className="w-fit max-w-[13.5rem] rounded-[1.6rem] border border-[rgba(222,214,199,0.2)] bg-[linear-gradient(180deg,rgba(9,13,18,0.82),rgba(9,13,18,0.52))] px-4 py-4 backdrop-blur-md sm:max-w-[15rem] sm:px-5">
            <p className="kicker text-[var(--color-accent)]">Нормально</p>
            <p className="mt-3 text-[clamp(1.8rem,8vw,2.7rem)] font-semibold leading-[0.92] tracking-[-0.085em] text-white">
              {finalPhrase}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
