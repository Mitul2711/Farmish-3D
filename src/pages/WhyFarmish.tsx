import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { NavigationHeader } from "@/components/farmish/NavigationHeader";
import { IMGS } from "@/lib/journeyStore";

const commitments = [
  {
    number: "01",
    title: "Closer to the farmer",
    description: "We bring groceries directly from farmers to your home, creating a clearer connection between the people who grow your food and the people who enjoy it.",
    image: IMGS.harvest,
    alt: "A farmer tending a crop in the field",
  },
  {
    number: "02",
    title: "Chosen with care",
    description: "Thoughtful groceries selected by farmers and packed for your kitchen. We keep the focus on good ingredients, careful harvests, and food that feels at home on your table.",
    image: IMGS.selection,
    alt: "Freshly harvested produce being prepared",
  },
  {
    number: "03",
    title: "Packed in small batches",
    description: "Each small batch is sealed in breathable kraft packaging, ready for the journey from the farm to your home.",
    image: IMGS.pack,
    alt: "Farmish produce packed in kraft packaging",
  },
];

const standards = [
  "Farmer-direct sourcing",
  "Traceable harvests",
  "No preservatives",
  "Fair-price promise",
  "Small-batch packing",
  "48-hour farm to door",
];

export default function WhyFarmish() {
  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#1D2B25] antialiased">
      <NavigationHeader sticky />

      <main>
        <section className="relative isolate flex min-h-[68vh] items-end overflow-hidden bg-[#1D2B25]">
          <img
            src={IMGS.field}
            alt="Rows of fresh crops growing on a farm"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1D2B25]/45" />
          <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-32 sm:pb-20">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#F0D9AE]">Good food starts with good people</p>
            <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[1.02] text-[#FFFDF9] sm:text-6xl lg:text-7xl">
              Why Farmish
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#FFFDF9] sm:text-lg">
              A more direct journey from the people who grow your food to the home where you share it.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="grid gap-6 border-b border-[#D9C8A5] pb-10 sm:grid-cols-[0.9fr_1.1fr] sm:items-end sm:gap-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#A36E1F]">From farm to home</p>
              <h2 className="mt-3 max-w-lg font-heading text-3xl leading-tight text-[#1D2B25] sm:text-4xl">
                A shorter path makes a better story.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-[#53635D]">
              We believe everyday groceries should feel thoughtful, honest, and connected to the hands that grew them. That belief guides every step at Farmish.
            </p>
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {commitments.map((commitment) => (
              <article key={commitment.number}>
                <img
                  src={commitment.image}
                  alt={commitment.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-[#A36E1F]">{commitment.number}</span>
                  <h3 className="font-heading text-2xl text-[#1D2B25]">{commitment.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#53635D]">{commitment.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#1D2B25] text-[#FFFDF9]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E8B86D]">The Farmish standard</p>
              <h2 className="mt-3 max-w-md font-heading text-3xl leading-tight sm:text-4xl">
                Care you can trace, from harvest to home.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-[#E4E9E3]">
                Our commitments are simple: respect the people who grow your food, keep ingredients honest, and handle every order with care.
              </p>
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {standards.map((standard) => (
                <li key={standard} className="flex items-center gap-3 border-b border-white/15 py-4 text-sm text-[#FFFDF9]">
                  <Check className="h-4 w-4 shrink-0 text-[#E8B86D]" aria-hidden="true" />
                  {standard}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#A36E1F]">A good place to begin</p>
            <h2 className="mt-2 font-heading text-3xl text-[#1D2B25]">Bring a little farm home.</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-[#D4A359] px-6 py-3 text-sm font-semibold text-[#1D2B25] transition-colors hover:bg-[#E8B86D] sm:self-auto"
          >
            Shop Fresh <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  );
}
