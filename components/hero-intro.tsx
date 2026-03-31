"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import type { ImageAsset } from "@/lib/content";

type HeroIntroProps = {
  introPhrase: string;
  finalPhrase: string;
  image: ImageAsset;
};

type OverlayStage = "idle" | "visible" | "exiting" | "done";

const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

const overlayPauseMs = 220;
const overlayEnterMs = 520;
const overlayHoldMs = 1100;
const overlayExitMs = 520;

export function HeroIntro({
  introPhrase,
  finalPhrase,
  image,
}: HeroIntroProps) {
  const [overlayStage, setOverlayStage] = useState<OverlayStage>("idle");
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }

      timersRef.current = [];
    };

    const schedule = (delay: number, callback: () => void) => {
      const timer = window.setTimeout(callback, delay);
      timersRef.current.push(timer);
    };

    clearTimers();

    schedule(overlayPauseMs, () => {
      setOverlayStage("visible");

      schedule(overlayEnterMs + overlayHoldMs, () => {
        setOverlayStage("exiting");

        schedule(overlayExitMs, () => {
          setOverlayStage("done");
        });
      });
    });

    return clearTimers;
  }, [introPhrase]);

  const overlayStyle: CSSProperties =
    overlayStage === "idle"
      ? {
          opacity: 0,
          transform: "translateY(12px)",
          pointerEvents: "none",
        }
      : overlayStage === "visible"
        ? {
            opacity: 1,
            transform: "translateY(0)",
            transition: `opacity ${overlayEnterMs}ms ${easing}, transform ${overlayEnterMs}ms ${easing}`,
          }
        : overlayStage === "exiting"
          ? {
              opacity: 0,
              transform: "translateY(-8px)",
              transition: `opacity ${overlayExitMs}ms ${easing}, transform ${overlayExitMs}ms ${easing}`,
            }
          : {
              opacity: 0,
              transform: "translateY(-8px)",
              pointerEvents: "none",
            };

  const plateStyle: CSSProperties =
    overlayStage === "visible"
      ? {
          opacity: 1,
          transform: "translateY(0)",
          transition: `opacity ${overlayEnterMs}ms ${easing}, transform ${overlayEnterMs}ms ${easing}`,
        }
      : overlayStage === "exiting"
        ? {
            opacity: 0,
            transform: "translateY(-8px)",
            transition: `opacity ${overlayExitMs}ms ${easing}, transform ${overlayExitMs}ms ${easing}`,
          }
        : {
            opacity: 0,
            transform: "translateY(12px)",
            pointerEvents: "none",
          };

  const strikeStyle: CSSProperties =
    overlayStage === "exiting"
      ? {
          opacity: 0.95,
          transform: "scaleX(1)",
          transition: `transform ${overlayExitMs}ms ${easing}, opacity ${overlayExitMs}ms ${easing}`,
        }
      : {
          opacity: 0,
          transform: "scaleX(0)",
        };

  return (
    <div className="relative isolate min-h-[13.5rem] overflow-hidden rounded-[2.1rem] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:min-h-[15rem] lg:min-h-[31rem] lg:rounded-[2.75rem]">
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

      <div className="relative flex h-full flex-col p-4 sm:p-6 lg:p-10">
        <div className="hidden max-w-[14rem] lg:block">
          <p className="kicker text-white/40">Временные решения</p>
          <p className="mt-3 text-sm leading-6 text-white/56">
            То, что сначала кажется терпимым, а потом раздражает каждый день.
          </p>
        </div>

        <div className="flex-1">
          <div className="relative hidden h-full items-start justify-end pt-6 lg:flex">
            <div className="relative h-[8.8rem] w-full max-w-[19rem] pr-3">
              <div
                aria-hidden="true"
                className="absolute right-0 top-0"
                style={plateStyle}
              >
                <div className="relative rounded-full border border-white/18 bg-[rgba(4,6,9,0.82)] px-5 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.44)]">
                  <div
                    className="relative text-right text-[clamp(1.75rem,2.8vw,2.65rem)] font-semibold leading-none tracking-[-0.085em] text-white [text-shadow:0_18px_36px_rgba(0,0,0,0.58)]"
                    style={overlayStyle}
                  >
                    <span>{introPhrase}</span>
                    <span
                      aria-hidden="true"
                      className="absolute left-2 right-2 top-1/2 h-[2px] origin-right bg-white/90"
                      style={strikeStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-fit max-w-[13.5rem] rounded-[1.6rem] border border-[rgba(222,214,199,0.2)] bg-[linear-gradient(180deg,rgba(9,13,18,0.82),rgba(9,13,18,0.52))] px-4 py-4 backdrop-blur-md sm:max-w-[15rem] sm:px-5 lg:max-w-full lg:rounded-[1.8rem] lg:border-white/14 lg:bg-[linear-gradient(180deg,rgba(10,14,19,0.78),rgba(10,14,19,0.44))] lg:px-6 lg:py-5">
          <p className="kicker text-[var(--color-accent)]">Остаётся</p>
          <p className="mt-3 text-[clamp(1.8rem,8vw,2.7rem)] font-semibold leading-[0.92] tracking-[-0.085em] text-white sm:mt-4 lg:text-[clamp(2rem,3.2vw,3.7rem)] lg:leading-none">
            {finalPhrase}
          </p>
        </div>
      </div>
    </div>
  );
}
