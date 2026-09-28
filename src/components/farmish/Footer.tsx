import { Link } from "react-router-dom";
import { WheatMark } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-[#D9C8A5] bg-[#F1E7D5] text-[#1D2B25]">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_1fr] lg:gap-16">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label="Farmish home">
              <WheatMark className="h-8 w-8 text-[#B98A37]" />
              <span className="flex flex-col items-start leading-none">
                <span className="font-heading text-3xl text-[#1D2B25]">Farmish</span>
                <span className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#53635D]">Farm to Home</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#53635D]">
              Carefully selected groceries, grown with care and brought straight from farmers to your home.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#A36E1F]">Explore</p>
            <nav aria-label="Footer navigation" className="mt-4 flex flex-col items-start gap-3 text-sm text-[#285A43]">
              <Link to="/" className="transition-colors hover:text-[#A36E1F]">Our story</Link>
              <Link to="/why-farmish" className="transition-colors hover:text-[#A36E1F]">Why Farmish</Link>
              <Link to="/shop" className="transition-colors hover:text-[#A36E1F]">Shop fresh</Link>
              <Link to="/cart" className="transition-colors hover:text-[#A36E1F]">Your basket</Link>
            </nav>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#A36E1F]">The Farmish promise</p>
            <p className="mt-4 font-heading text-2xl leading-snug text-[#285A43]">
              From the farmer&apos;s field to your home.
            </p>
            <Link to="/shop" className="mt-4 inline-block text-sm font-semibold text-[#1D2B25] underline decoration-[#D4A359] underline-offset-4 transition-colors hover:text-[#A36E1F]">
              Discover this week&apos;s picks
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#D9C8A5] pt-5 font-mono text-[10px] tracking-[0.12em] text-[#53635D] sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Farmish</p>
          <p>Good food, grown with care.</p>
        </div>
      </div>
    </footer>
  );
}