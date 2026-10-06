import { motion } from "motion/react";
import { WheatMark } from "./Logo";
import { EASE } from "./Captions";
import { SCENES } from "@/lib/journeyStore";

export function StaticJourney() {
  const hero = SCENES[0];
  return (
    <div data-testid="static-journey">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <img src={hero.img} alt="Golden morning farm field with a farmer among the crops" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#F7F2E8]/20" />
        <div className="relative z-10 px-6 text-center">
          <WheatMark className="mx-auto mb-7 h-11 w-11 text-[#D4A359]" />
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.35em] text-[#FFE2A3] [text-shadow:0_2px_5px_rgba(17,27,18,0.95)]">{hero.kicker}</p>
          <h1 className="font-heading text-4xl leading-[1.05] tracking-tight text-[#FFFDF9] [text-shadow:0_2px_5px_rgba(17,27,18,0.95),0_5px_18px_rgba(17,27,18,0.8)] sm:text-5xl lg:text-6xl">
            {hero.title[0]}
            <br />
            <em className="italic text-[#FFE2A3]">{hero.title[1]}</em>
          </h1>
          <p className="mt-7 text-base text-[#FFFDF9] [text-shadow:0_2px_5px_rgba(17,27,18,0.95)] sm:text-lg">{hero.sub}</p>
        </div>
      </section>
      {SCENES.slice(1).map((s, i) => (
        <section key={s.id} className="relative flex min-h-[85vh] items-center overflow-hidden">
          <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-[#F7F2E8]/20" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.9, ease: EASE }}
            className={`relative z-10 w-full px-[7vw] ${i % 2 === 1 ? "text-right" : "text-left"}`}
            data-testid={`static-scene-${s.id}`}
          >
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-[#FFE2A3] [text-shadow:0_2px_5px_rgba(17,27,18,0.95)]">{s.kicker}</p>
            <h2 className="font-heading text-4xl leading-[1.05] tracking-tight text-[#FFFDF9] [text-shadow:0_2px_5px_rgba(17,27,18,0.95),0_5px_18px_rgba(17,27,18,0.8)] sm:text-5xl">
              {s.title[0]}
              <br />
              <em className="italic text-[#FFE2A3]">{s.title[1]}</em>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#FFFDF9] [text-shadow:0_2px_5px_rgba(17,27,18,0.95)] sm:ml-0" style={i % 2 === 1 ? { marginLeft: "auto" } : undefined}>
              {s.sub}
            </p>
          </motion.div>
        </section>
      ))}
    </div>
  );
}
