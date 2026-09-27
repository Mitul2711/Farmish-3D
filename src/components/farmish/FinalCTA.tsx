import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { WheatMark } from "./Logo";
import { EASE } from "./Captions";
import { IMGS, scrollToId } from "@/lib/journeyStore";

export function FinalCTA() {
  return (
    <section id="cta" className="relative flex min-h-screen items-center justify-center overflow-hidden" data-testid="final-cta">
      <img
        src={IMGS.landscape}
        alt="Golden-hour farm landscape"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(13,19,14,0.92) 0%, rgba(13,19,14,0.55) 45%, rgba(13,19,14,0.94) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(212,163,89,0.2) 0%, rgba(13,19,14,0) 62%)" }}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-36 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <WheatMark className="mx-auto mb-8 h-12 w-12 text-[#D4A359]" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.35em] text-[#E8B86D]"
        >
          The Farmish Promise
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="font-heading text-4xl leading-[1.05] tracking-tight text-[#FDFBF7] sm:text-5xl lg:text-6xl"
        >
          Know where your <em className="italic text-[#E8B86D]">food</em> comes from.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, delay: 0.34, ease: EASE }}
          className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-[#B8C5B7] sm:text-lg"
        >
          Farmish brings carefully selected groceries directly from farmers to your home.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, delay: 0.48, ease: EASE }}
          className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            data-testid="cta-shop-fresh-btn"
            className="group flex items-center gap-2 rounded-full bg-[#D4A359] px-8 py-3.5 text-sm font-semibold text-[#0D130E] transition-all duration-300 hover:bg-[#E8B86D] hover:shadow-[0_0_40px_rgba(212,163,89,0.45)]"
          >
            Shop Fresh
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <button
            data-testid="cta-explore-story-btn"
            onClick={() => scrollToId("journey")}
            className="rounded-full border border-[#D4A359]/40 px-8 py-3.5 text-sm font-semibold text-[#E8D3B0] transition-all duration-300 hover:border-[#D4A359] hover:bg-[#D4A359]/10"
          >
            Explore Our Story
          </button>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-[#213023]/80 bg-[#0D130E]/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <WheatMark className="h-5 w-5 text-[#D4A359]" />
            <span className="font-heading text-base text-[#F5EFE6]">Farmish</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#A8B3A7]">
            From the farmer&apos;s field to your home
          </p>
          <p className="font-mono text-[10px] tracking-[0.15em] text-[#A8B3A7]/70">© 2026 Farmish</p>
        </div>
      </div>
    </section>
  );
}
