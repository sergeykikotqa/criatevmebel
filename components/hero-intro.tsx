"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
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

type RuntimeMode = "desktop-sequence" | "static-final";
type HeroPhase =
  | "intro"
  | "phrase-enter"
  | "phrase-hold"
  | "phrase-exit"
  | "final";

type HeroMachineState = {
  phase: HeroPhase;
  activePhraseIndex: number | null;
};

const desktopBreakpointQuery = "(min-width: 1024px)";
const easing = [0.22, 1, 0.36, 1] as const;

const introDurationMs = 240;
const phraseEnterDurationMs = 460;
const phraseHoldDurationMs = 860;
const phraseExitDurationMs = 360;
const finalPauseDurationMs = 80;
const finalRevealDuration = 0.58;

const initialMachineState: HeroMachineState = {
  phase: "intro",
  activePhraseIndex: null,
};

function useDesktopViewport() {
  const [state, setState] = useState({
    ready: false,
    isDesktop: false,
  });

  useEffect(() => {
    const media = window.matchMedia(desktopBreakpointQuery);

    const sync = () => {
      setState({
        ready: true,
        isDesktop: media.matches,
      });
    };

    sync();

    const handleChange = () => {
      sync();
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);

      return () => {
        media.removeEventListener("change", handleChange);
      };
    }

    media.addListener(handleChange);

    return () => {
      media.removeListener(handleChange);
    };
  }, []);

  return state;
}

export function HeroIntro({ phrases, image }: HeroIntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ready: runtimeReady, isDesktop } = useDesktopViewport();
  const rawX = useMotionValue(280);
  const rawY = useMotionValue(160);
  const mouseX = useSpring(rawX, { stiffness: 34, damping: 24, mass: 1.05 });
  const mouseY = useSpring(rawY, { stiffness: 34, damping: 24, mass: 1.05 });
  const spotlight = useMotionTemplate`radial-gradient(15rem circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.05), rgba(255,255,255,0.018) 22%, transparent 60%)`;
  const transientPhrases = useMemo(() => phrases.slice(0, -1), [phrases]);
  const finalPhrase = phrases[phrases.length - 1] ?? "";
  const [machine, setMachine] = useState<HeroMachineState>(initialMachineState);
  const timersRef = useRef<number[]>([]);
  const settledToFinalRef = useRef(false);
  const finalFromSequenceRef = useRef(false);

  const runtimeMode: RuntimeMode =
    runtimeReady &&
    isDesktop &&
    !prefersReducedMotion &&
    transientPhrases.length > 0 &&
    !settledToFinalRef.current
      ? "desktop-sequence"
      : "static-final";

  const activePhrase =
    machine.activePhraseIndex !== null
      ? transientPhrases[machine.activePhraseIndex] ?? null
      : null;

  const transientAnimate =
    machine.phase === "phrase-enter" || machine.phase === "phrase-hold"
      ? { opacity: 0.9, y: 0 }
      : machine.phase === "phrase-exit"
        ? { opacity: 0, y: -10 }
        : { opacity: 0, y: 10 };

  const transientTransition =
    machine.phase === "phrase-enter"
      ? { duration: phraseEnterDurationMs / 1000, ease: easing }
      : machine.phase === "phrase-exit"
        ? { duration: phraseExitDurationMs / 1000, ease: easing }
        : { duration: 0.16, ease: "linear" as const };

  useEffect(() => {
    const clearTimers = () => {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }

      timersRef.current = [];
    };

    if (!runtimeReady) {
      return clearTimers;
    }

    clearTimers();

    const schedule = (delay: number, callback: () => void) => {
      const timer = window.setTimeout(callback, delay);
      timersRef.current.push(timer);
    };

    let cancelled = false;

    const updateMachine = (nextState: HeroMachineState) => {
      if (!cancelled) {
        setMachine(nextState);
      }
    };

    if (runtimeMode === "static-final") {
      settledToFinalRef.current = true;
      updateMachine({
        phase: "final",
        activePhraseIndex: null,
      });

      return () => {
        cancelled = true;
        clearTimers();
      };
    }

    finalFromSequenceRef.current = false;
    updateMachine(initialMachineState);

    const runPhrase = (index: number) => {
      if (cancelled) {
        return;
      }

      updateMachine({
        phase: "phrase-enter",
        activePhraseIndex: index,
      });

      schedule(phraseEnterDurationMs, () => {
        updateMachine({
          phase: "phrase-hold",
          activePhraseIndex: index,
        });

        schedule(phraseHoldDurationMs, () => {
          updateMachine({
            phase: "phrase-exit",
            activePhraseIndex: index,
          });

          schedule(phraseExitDurationMs, () => {
            if (index < transientPhrases.length - 1) {
              runPhrase(index + 1);
              return;
            }

            schedule(finalPauseDurationMs, () => {
              settledToFinalRef.current = true;
              finalFromSequenceRef.current = true;
              updateMachine({
                phase: "final",
                activePhraseIndex: null,
              });
            });
          });
        });
      });
    };

    schedule(introDurationMs, () => {
      runPhrase(0);
    });

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [runtimeMode, runtimeReady, transientPhrases.length]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set(event.clientX - bounds.left);
    rawY.set(event.clientY - bounds.top);
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set(bounds.width * 0.66);
    rawY.set(bounds.height * 0.42);
  };

  return (
    <div
      className="relative isolate min-h-[13.5rem] overflow-hidden rounded-[2.1rem] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:min-h-[15rem] lg:min-h-[31rem] lg:rounded-[2.75rem]"
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

      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(5,7,10,0.94)_6%,rgba(5,7,10,0.66)_42%,rgba(5,7,10,0.86)_100%)]" />
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

        <div className="hidden flex-1 items-start justify-end pt-6 lg:flex">
          <div className="relative h-[8.8rem] w-full max-w-[19rem] pr-3">
            {runtimeReady &&
            runtimeMode === "desktop-sequence" &&
            activePhrase ? (
              <motion.div
                key={machine.activePhraseIndex}
                className="absolute inset-x-0 top-0 text-right text-[clamp(1.55rem,2.55vw,2.4rem)] font-semibold leading-none tracking-[-0.08em] text-white/90 [text-shadow:0_12px_28px_rgba(0,0,0,0.42)]"
                initial={{ opacity: 0, y: 10 }}
                animate={transientAnimate}
                transition={transientTransition}
              >
                <span>{activePhrase}</span>
                <motion.span
                  key={`${machine.activePhraseIndex ?? "none"}-${
                    machine.phase === "phrase-exit" ? "exit" : "idle"
                  }`}
                  aria-hidden="true"
                  className="absolute left-[6%] right-0 top-1/2 h-px origin-right bg-white/42"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={
                    machine.phase === "phrase-exit"
                      ? {
                          opacity: [0, 0.88, 0],
                          scaleX: [0.02, 1, 1],
                        }
                      : { opacity: 0, scaleX: 0 }
                  }
                  transition={
                    machine.phase === "phrase-exit"
                      ? {
                          duration: phraseExitDurationMs / 1000,
                          ease: easing,
                          times: [0, 0.72, 1],
                        }
                      : { duration: 0.12, ease: "linear" }
                  }
                />
              </motion.div>
            ) : null}
          </div>
        </div>

        {runtimeReady && isDesktop && machine.phase === "final" ? (
          <motion.div
            key={finalFromSequenceRef.current ? "animated-final" : "static-final"}
            className="hidden w-fit max-w-full rounded-[1.8rem] border border-white/14 bg-[linear-gradient(180deg,rgba(10,14,19,0.78),rgba(10,14,19,0.44))] px-6 py-5 backdrop-blur-md lg:block"
            initial={
              finalFromSequenceRef.current && !prefersReducedMotion
                ? { opacity: 0, y: 16 }
                : false
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: finalRevealDuration, ease: easing }}
          >
            <p className="kicker text-[var(--color-accent)]">Остаётся</p>
            <p className="mt-4 text-[clamp(2rem,3.2vw,3.7rem)] font-semibold leading-none tracking-[-0.085em] text-white">
              {finalPhrase}
            </p>
          </motion.div>
        ) : null}

        <div className="flex h-full items-end lg:hidden">
          <div className="w-fit max-w-[13.5rem] rounded-[1.6rem] border border-[rgba(222,214,199,0.2)] bg-[linear-gradient(180deg,rgba(9,13,18,0.82),rgba(9,13,18,0.52))] px-4 py-4 backdrop-blur-md sm:max-w-[15rem] sm:px-5">
            <p className="kicker text-[var(--color-accent)]">Нормально</p>
            <p className="mt-3 text-[clamp(1.8rem,8vw,2.7rem)] font-semibold leading-[0.92] tracking-[-0.085em] text-white">
              {finalPhrase}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
