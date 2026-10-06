import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { WheatMark, Wordmark } from "./Logo";
import { scrollToId } from "@/lib/journeyStore";
import { FAVORITES_CHANGE_EVENT, readFavoriteIds } from "@/lib/shopProducts";

type NavigationHeaderProps = {
  sticky?: boolean;
  action?: ReactNode;
};

export function NavigationHeader({ sticky = false, action }: NavigationHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(() => readFavoriteIds().length);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const updateFavoriteCount = () => setFavoriteCount(readFavoriteIds().length);
    window.addEventListener(FAVORITES_CHANGE_EVENT, updateFavoriteCount);
    window.addEventListener("storage", updateFavoriteCount);
    return () => {
      window.removeEventListener(FAVORITES_CHANGE_EVENT, updateFavoriteCount);
      window.removeEventListener("storage", updateFavoriteCount);
    };
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
          <WheatMark className="h-10 w-10 transition-transform duration-500 group-hover:rotate-12" />
          <span className="flex flex-col items-center leading-none">
            <Wordmark className="h-8 w-24" />
            <span className="mt-1 w-full text-center font-mono text-[8px] uppercase tracking-[0.18em] text-[#53635D]">Farm to Family</span>
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
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/favorites"
            aria-label={`Favorites, ${favoriteCount} saved`}
            title="Favorites"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#A36E1F] transition-colors hover:bg-[#D4A359]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A36E1F]"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            {favoriteCount > 0 && (
              <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full border border-[#FFFDF9] bg-[#285A43] p-0 text-center font-mono text-[9px] font-semibold leading-5 text-white">
                {favoriteCount}
              </span>
            )}
          </Link>
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
        <Link
          to="/login"
          className="ml-4 hidden font-mono text-[10px] uppercase tracking-[0.15em] text-[#53635D] transition-colors hover:text-[#A36E1F] md:inline-flex"
        >
          Sign In
        </Link>
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
              to="/favorites"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 border-b border-[#E8D9BF] py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#53635D] transition-colors hover:text-[#A36E1F]"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              Favorites
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className="my-3 rounded-full bg-[#D4A359] px-4 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D2B25] transition-colors hover:bg-[#E8B86D]"
            >
              Shop Fresh
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mb-3 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53635D] transition-colors hover:text-[#A36E1F]"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
