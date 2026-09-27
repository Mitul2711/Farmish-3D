import { useEffect, useState } from "react";
import { WheatMark } from "./Logo";
import { scrollToId } from "@/lib/journeyStore";

export function NavigationHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-500 ${
        scrolled
          ? "border-b border-[#D4A359]/15 bg-[#0D130E]/75 backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent"
      }`}
      data-testid="nav-header"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button
          data-testid="nav-logo-btn"
          onClick={() => scrollToId("top")}
          className="group flex items-center gap-2.5"
        >
          <WheatMark className="h-7 w-7 text-[#D4A359] transition-transform duration-500 group-hover:rotate-12" />
          <span className="font-heading text-xl tracking-tight text-[#F5EFE6]">Farmish</span>
        </button>
        <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.22em] text-[#A8B3A7] md:flex">
          <button
            data-testid="nav-journey-link"
            onClick={() => scrollToId("journey")}
            className="transition-colors hover:text-[#E8B86D]"
          >
            The Journey
          </button>
          <button
            data-testid="nav-promise-link"
            onClick={() => scrollToId("cta")}
            className="transition-colors hover:text-[#E8B86D]"
          >
            Our Promise
          </button>
        </nav>
        <button
          data-testid="nav-shop-fresh-btn"
          onClick={() => scrollToId("cta")}
          className="rounded-full bg-[#D4A359] px-5 py-2 text-sm font-semibold text-[#0D130E] transition-all duration-300 hover:bg-[#E8B86D] hover:shadow-[0_0_28px_rgba(212,163,89,0.4)]"
        >
          Shop Fresh
        </button>
      </div>
    </header>
  );
}
