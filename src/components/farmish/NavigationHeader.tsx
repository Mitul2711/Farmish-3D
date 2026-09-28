import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { WheatMark } from "./Logo";
import { scrollToId } from "@/lib/journeyStore";

type NavigationHeaderProps = {
  sticky?: boolean;
  action?: ReactNode;
};

export function NavigationHeader({ sticky = false, action }: NavigationHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && location.hash === "#journey") {
      requestAnimationFrame(() => scrollToId("journey"));
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <header
      className={`${sticky ? "sticky top-0" : "fixed inset-x-0 top-0"} z-40 transition-[background-color,border-color,box-shadow] duration-500 ${
        scrolled
          ? "border-b border-white/65 bg-[#FFFDF9]/75 shadow-[0_8px_30px_rgba(29,43,37,0.08)] backdrop-blur-2xl backdrop-saturate-150"
          : "border-b border-white/35 bg-[#F7F2E8]/35 backdrop-blur-xl backdrop-saturate-150"
      }`}
      data-testid="nav-header"
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          data-testid="nav-logo-btn"
          onClick={(event) => {
            if (location.pathname === "/") {
              event.preventDefault();
              scrollToId("top");
            }
          }}
          className="group flex items-center gap-2.5"
        >
          <WheatMark className="h-7 w-7 text-[#D4A359] transition-transform duration-500 group-hover:rotate-12" />
          <span className="flex flex-col items-start leading-none">
            <span className="font-heading text-xl tracking-tight text-[#1D2B25]">Farmish</span>
            <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-[#53635D]">Farm to Home</span>
          </span>
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 font-mono text-[11px] uppercase tracking-[0.22em] text-[#53635D] md:flex">
          <Link
            to="/#journey"
            data-testid="nav-journey-link"
            className="transition-colors hover:text-[#A36E1F]"
          >
            The Journey
          </Link>
          <Link to="/why-farmish" className="transition-colors hover:text-[#A36E1F]">Why Farmish</Link>
          <Link to="/contact" className="transition-colors hover:text-[#A36E1F]">Contact</Link>
        </nav>
        <div className="ml-auto">
          {action ?? (
            <Link
              to="/shop"
              data-testid="nav-shop-fresh-btn"
              className="hidden rounded-full bg-[#D4A359] px-5 py-2 text-sm font-semibold text-[#1D2B25] transition-all duration-300 hover:bg-[#E8B86D] hover:shadow-[0_0_28px_rgba(212,163,89,0.35)] md:inline-flex"
            >
              Shop Fresh
            </Link>
          )}
        </div>
        <button
          type="button"
          className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-[#1D2B25] transition-colors hover:bg-[#D4A359]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A36E1F] md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-primary-navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      {mobileOpen && (
        <nav
          id="mobile-primary-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-b border-[#E8D9BF] bg-[#FFFDF9]/95 px-6 py-2 shadow-[0_12px_24px_rgba(29,43,37,0.1)] backdrop-blur-2xl md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col">
            <Link
              to="/#journey"
              onClick={() => setMobileOpen(false)}
              className="border-b border-[#E8D9BF] py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#53635D] transition-colors hover:text-[#A36E1F]"
            >
              The Journey
            </Link>
            <Link
              to="/why-farmish"
              onClick={() => setMobileOpen(false)}
              className="border-b border-[#E8D9BF] py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#53635D] transition-colors hover:text-[#A36E1F]"
            >
              Why Farmish
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="border-b border-[#E8D9BF] py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#53635D] transition-colors hover:text-[#A36E1F]"
            >
              Contact
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className="my-3 rounded-full bg-[#D4A359] px-4 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D2B25] transition-colors hover:bg-[#E8B86D]"
            >
              Shop Fresh
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
