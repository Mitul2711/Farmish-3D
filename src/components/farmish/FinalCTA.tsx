import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
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
            "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.12) 42%, rgba(255,255,255,0.26) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(212,163,89,0.15) 0%, rgba(255,255,255,0) 62%)" }}
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
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.35em] text-[#1D2B25]"
        >
          The Farmish Promise
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="font-heading text-4xl leading-[1.05] tracking-tight text-[#1D2B25] sm:text-5xl lg:text-6xl"
        >
          Know where your <em className="italic text-[#A36E1F]">food</em> comes from.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, delay: 0.34, ease: EASE }}
          className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-[#1D2B25] sm:text-lg"
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
          <Link
            to="/shop"
            data-testid="cta-shop-fresh-btn"
            className="group flex items-center gap-2 rounded-full bg-[#D4A359] px-8 py-3.5 text-sm font-semibold text-[#1D2B25] transition-all duration-300 hover:bg-[#E8B86D] hover:shadow-[0_0_40px_rgba(212,163,89,0.45)]"
          >
            Shop Fresh
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button
            data-testid="cta-explore-story-btn"
            onClick={() => scrollToId("journey")}
            className="rounded-full border border-[#D4A359]/50 bg-[#FFFDF9]/60 px-8 py-3.5 text-sm font-semibold text-[#1D2B25] transition-all duration-300 hover:border-[#D4A359] hover:bg-[#D4A359]/10"
          >
            Explore Our Story
          </button>
        </motion.div>
      </div>
    </section>
  );
}
