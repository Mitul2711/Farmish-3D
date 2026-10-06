import { useRef } from "react";
import { motion, useTransform, useMotionValueEvent } from "motion/react";
import type { MotionValue } from "motion/react";
import { ArrowDown } from "lucide-react";
import { WheatMark } from "./Logo";
import { SCENES } from "@/lib/journeyStore";
import type { SceneDef } from "@/lib/journeyStore";

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function MaskedLine({ text, y, className }: { text: string; y: MotionValue<string>; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span style={{ y }} className={`block ${className ?? ""}`}>
        {text}
      </motion.span>
    </span>
  );
}

export function Caption({ progress, scene }: { progress: MotionValue<number>; scene: SceneDef }) {
  const [a, b] = scene.captionRange;
  const fi = a + (b - a) * 0.3;
  const fo = b - (b - a) * 0.3;
  const opacity = useTransform(progress, [a, fi, fo, b], [0, 1, 1, 0]);
  const y = useTransform(progress, [a, b], [70, -70]);
  const line1Y = useTransform(progress, [a, fi], ["112%", "0%"]);
  const line2Y = useTransform(progress, [a + 0.012, fi + 0.018], ["112%", "0%"]);
  const subOpacity = useTransform(progress, [a + 0.02, fi + 0.03, fo, b], [0, 1, 1, 0]);
  const isDarkScene = scene.id === "beans";

  const alignCls =
    scene.align === "left"
      ? "items-start text-left pl-[7vw] pr-6"
      : scene.align === "right"
        ? "items-end text-right pr-[7vw] pl-6"
        : "items-center text-center px-6";

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-0 z-20 flex items-center"
      data-testid={`scene-caption-${scene.id}`}
    >
      <motion.div style={{ y }} className={`flex w-full flex-col ${alignCls}`}>
        <p className={`mb-5 font-mono text-[11px] uppercase tracking-[0.3em] ${isDarkScene ? "text-[#FFE2A3]" : "text-[#6B4310]"}`}>
          {scene.kicker}
        </p>
        {scene.thumb && (
          <motion.img
            src={scene.thumb}
            alt=""
            className="mb-6 h-28 w-40 rotate-[-3deg] rounded-md object-cover shadow-[0_18px_50px_rgba(55,44,28,0.14)] ring-1 ring-[#D4A359]/40 sm:h-32 sm:w-48"
          />
        )}
        <h2 className={`font-heading text-4xl leading-[1.04] tracking-tight ${isDarkScene ? "text-[#FFFDF9]" : "text-[#1D2B25]"} sm:text-5xl lg:text-6xl`}>
          <MaskedLine text={scene.title[0]} y={line1Y} />
          <MaskedLine text={scene.title[1]} y={line2Y} className={`italic ${isDarkScene ? "text-[#FFE2A3]" : "text-[#6B4310]"}`} />
        </h2>
        <motion.p style={{ opacity: subOpacity }} className={`mt-5 max-w-md text-base leading-relaxed ${isDarkScene ? "text-[#FFFDF9]" : "text-[#1D2B25]"}`}>
          {scene.sub}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export function HeroIntro({ progress }: { progress: MotionValue<number> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(progress, "change", (v) => {
    const el = wrapRef.current;
    if (el) {
      const o = 1 - Math.min(1, Math.max(0, (v - 0.02) / 0.09));
      el.style.opacity = String(o);
      el.style.transform = `translateY(${-90 * Math.min(1, Math.max(0, v / 0.12))}px)`;
      el.style.visibility = o <= 0.01 ? "hidden" : "visible";
    }
    if (indRef.current) {
      indRef.current.style.opacity = String(1 - Math.min(1, Math.max(0, v / 0.04)));
    }
  });

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
      style={{ textShadow: "0 1px 3px rgba(17, 27, 18, 0.9), 0 2px 10px rgba(17, 27, 18, 0.65)" }}
      data-testid="hero-intro"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.25, ease: EASE }}
      >
        <WheatMark className="mx-auto mb-7 h-14 w-14 text-[#D4A359]" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
        className="mb-6 font-mono text-[11px] uppercase tracking-[0.35em] text-[#FFFDF9]"
      >
        Farmish · Farmer-Direct Grocery
      </motion.p>
      <h1 className="font-heading text-4xl leading-[1.03] tracking-tight text-[#FFFDF9] sm:text-5xl lg:text-6xl">
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span
            initial={{ y: "112%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.1, delay: 0.6, ease: EASE }}
            className="block"
          >
            From Our Farms,
          </motion.span>
        </span>
        <span className="block overflow-hidden pb-[0.12em]">
          <motion.span
            initial={{ y: "112%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.1, delay: 0.74, ease: EASE }}
            className="block italic text-[#FFE2A3]"
          >
            To Your Home.
          </motion.span>
        </span>
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
        className="mt-7 text-base text-[#FFFDF9] sm:text-lg"
      >
        Good food begins with good farmers.
      </motion.p>
      <div
        ref={indRef}
        className="absolute bottom-9 flex flex-col items-center gap-3"
        data-testid="scroll-indicator"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFFDF9]">
          Scroll to discover the journey
        </span>
        <motion.span animate={{ y: [0, 7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown className="h-4 w-4 text-[#D4A359]" />
        </motion.span>
      </div>
    </div>
  );
}

function RailDot({ progress, scene }: { progress: MotionValue<number>; scene: SceneDef }) {
  const [a, b] = scene.captionRange;
  const dotOpacity = useTransform(progress, [a, a + 0.01, b - 0.01, b], [0.28, 1, 1, 0.28]);
  const dotScale = useTransform(progress, [a, a + 0.01, b - 0.01, b], [1, 1.6, 1.6, 1]);
  return (
    <motion.span
      style={{ opacity: dotOpacity, scale: dotScale }}
      className="block h-1.5 w-1.5 rounded-full bg-[#D4A359]"
    />
  );
}

export function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      className="absolute right-5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3.5 sm:right-8"
      data-testid="journey-progress-rail"
    >
      {SCENES.map((s) => (
        <RailDot key={s.id} progress={progress} scene={s} />
      ))}
    </div>
  );
}
