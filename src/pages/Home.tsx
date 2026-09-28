import { useEffect, useState } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { NavigationHeader } from "@/components/farmish/NavigationHeader";
import { Journey } from "@/components/farmish/Journey";
import { StaticJourney } from "@/components/farmish/StaticJourney";
import { EditorialMarquee } from "@/components/farmish/EditorialMarquee";
import { FinalCTA } from "@/components/farmish/FinalCTA";
import { lenisRef } from "@/lib/journeyStore";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const fn = () => setMobile(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return mobile;
}

export default function Home() {
  const reduced = useReducedMotion() ?? false;
  const isMobile = useIsMobile();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return (
    <div id="top" className="min-h-screen overflow-x-clip bg-[#F7F2E8] text-[#1D2B25] antialiased">
      <div className="farmish-grain" aria-hidden="true" />
      <NavigationHeader />
      {reduced ? <StaticJourney /> : <Journey isMobile={isMobile} />}
      <EditorialMarquee />
      <FinalCTA />
    </div>
  );
}
