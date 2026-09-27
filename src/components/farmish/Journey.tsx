import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useProgress } from "@react-three/drei";
import { SceneCanvas } from "./SceneCanvas";
import { Caption, HeroIntro, ProgressRail } from "./Captions";
import { WheatMark } from "./Logo";
import { SCENES, journeyProgress } from "@/lib/journeyStore";

function LoaderOverlay() {
  const { active, progress } = useProgress();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setDone(true), 500);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  if (done) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#0D130E] transition-opacity duration-700"
      style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
      data-testid="loader-overlay"
    >
      <WheatMark className="mb-6 h-12 w-12 animate-pulse text-[#D4A359]" />
      <p className="font-heading text-2xl tracking-tight text-[#F5EFE6]">Farmish</p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#A8B3A7]">
        Preparing the field · {Math.round(progress)}%
      </p>
    </div>
  );
}

export function Journey({ isMobile }: { isMobile: boolean }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    journeyProgress.value = v;
  });

  return (
    <div ref={trackRef} id="journey" className="relative h-[640vh]" data-testid="journey-track">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <SceneCanvas isMobile={isMobile} />
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(13,19,14,0.18) 0%, rgba(13,19,14,0.62) 88%), linear-gradient(180deg, rgba(13,19,14,0.42) 0%, rgba(13,19,14,0.08) 30%, rgba(13,19,14,0.1) 68%, rgba(13,19,14,0.72) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: "radial-gradient(ellipse at 50% 18%, rgba(212,163,89,0.14) 0%, rgba(13,19,14,0) 60%)" }}
        />
        <HeroIntro progress={scrollYProgress} />
        {SCENES.slice(1).map((s) => (
          <Caption key={s.id} progress={scrollYProgress} scene={s} />
        ))}
        <ProgressRail progress={scrollYProgress} />
        <LoaderOverlay />
      </div>
    </div>
  );
}
