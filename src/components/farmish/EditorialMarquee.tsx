import { WheatMark } from "./Logo";

const ITEMS = [
  "Farmer-Direct Sourcing",
  "Traceable Harvest",
  "Sun-Dried & Hand-Sorted",
  "Zero Preservatives",
  "Fair-Price Promise",
  "Small-Batch Packing",
  "48h Farm to Door",
];

export function EditorialMarquee() {
  return (
    <section
      className="relative overflow-hidden border-y border-[#213023] bg-[#0D130E] py-7"
      data-testid="editorial-marquee"
    >
      <div className="animate-farmish-marquee flex w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
            {ITEMS.map((item) => (
              <span
                key={`${half}-${item}`}
                className="flex items-center gap-8 px-8 font-mono text-xs uppercase tracking-[0.3em] text-[#A8B3A7]"
              >
                {item}
                <WheatMark className="h-4 w-4 text-[#D4A359]/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
