import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { NavigationHeader } from "@/components/farmish/NavigationHeader";
import { IMGS } from "@/lib/journeyStore";

type Product = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  basePrice: number;
  note: string;
  weights: { label: string; price: number }[];
};

const CART_KEY = "farmish-cart";

const products: Product[] = [
  {
    id: "greens-box",
    name: "Heirloom Greens Box",
    subtitle: "Seasonal harvest",
    image: IMGS.field,
    basePrice: 24,
    note: "Curated for slow dinners",
    weights: [
      { label: "500g", price: 24 },
      { label: "1kg", price: 38 },
      { label: "2kg", price: 62 },
    ],
  },
  {
    id: "golden-bean-bundle",
    name: "Golden Bean Bundle",
    subtitle: "Small-batch roasted",
    image: IMGS.beans,
    basePrice: 18,
    note: "Farmer direct and freshly packed",
    weights: [
      { label: "250g", price: 18 },
      { label: "500g", price: 28 },
      { label: "1kg", price: 45 },
    ],
  },
  {
    id: "root-leaf-mix",
    name: "Root & Leaf Mix",
    subtitle: "Picked this week",
    image: IMGS.harvest,
    basePrice: 21,
    note: "Balanced greens from local growers",
    weights: [
      { label: "500g", price: 21 },
      { label: "1kg", price: 34 },
      { label: "2kg", price: 58 },
    ],
  },
  {
    id: "kitchen-staple-set",
    name: "Kitchen Staple Set",
    subtitle: "Everyday essentials",
    image: IMGS.pack,
    basePrice: 29,
    note: "A pantry upgrade for real meals",
    weights: [
      { label: "1 pack", price: 29 },
      { label: "2 packs", price: 52 },
      { label: "3 packs", price: 74 },
    ],
  },
  {
    id: "citrus-sunrise-box",
    name: "Citrus Sunrise Box",
    subtitle: "Fresh from the grove",
    image: IMGS.selection,
    basePrice: 26,
    note: "Bright, juicy, and harvest-ready",
    weights: [
      { label: "1 box", price: 26 },
      { label: "2 boxes", price: 42 },
      { label: "3 boxes", price: 60 },
    ],
  },
  {
    id: "family-farm-basket",
    name: "Family Farm Basket",
    subtitle: "Weekly share",
    image: IMGS.delivery,
    basePrice: 36,
    note: "A fuller box of orchard and field picks",
    weights: [
      { label: "1 basket", price: 36 },
      { label: "2 baskets", price: 66 },
      { label: "3 baskets", price: 90 },
    ],
  },
];

const promises = [
  { icon: Leaf, title: "Farmer direct", text: "Every item is sourced from trusted growers we know by name." },
  { icon: ShieldCheck, title: "Transparent quality", text: "Selected for freshness, flavor, and honest farming standards." },
  { icon: Truck, title: "Delivered fast", text: "Packed carefully and delivered within 48 hours of harvest." },
];

export default function Shop() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [cartCount, setCartCount] = useState(0);
  const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>(
    () => Object.fromEntries(products.map((product) => [product.id, product.weights[0].label])),
  );

  useEffect(() => {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return;

    try {
      const cart = JSON.parse(raw) as Array<{ qty: number }>;
      const total = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, []);

  const addToCart = (product: Product, weightLabel: string, weightPrice: number) => {
    const raw = window.localStorage.getItem(CART_KEY);
    const current = raw
      ? (JSON.parse(raw) as Array<{ id: string; name: string; image: string; price: number; weight: string; qty: number }>)
      : [];

    const existing = current.find((item) => item.id === product.id && item.weight === weightLabel);

    const next = existing
      ? current.map((item) =>
          item.id === product.id && item.weight === weightLabel
            ? { ...item, qty: item.qty + 1, price: weightPrice }
            : item,
        )
      : [...current, { id: product.id, name: product.name, image: product.image, price: weightPrice, weight: weightLabel, qty: 1 }];

    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
    setCartCount(next.reduce((sum, item) => sum + item.qty, 0));
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#1D2B25] antialiased">
      <NavigationHeader
        sticky
        action={(
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-full bg-[#D4A359] px-4 py-2.5 text-sm font-semibold text-[#1D2B25] transition-all duration-300 hover:bg-[#E8B86D]"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart {cartCount > 0 ? `(${cartCount})` : ""}
          </Link>
        )}
      />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,163,89,0.16),_transparent_52%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <div>
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.35em] text-[#A36E1F]">Freshly picked</p>
              <h1 className="font-heading text-5xl leading-[0.95] tracking-[-0.04em] text-[#1D2B25] sm:text-6xl lg:text-7xl">
                Real food,
                <span className="mt-2 block italic text-[#A36E1F]">from the farm</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4F5F59]">
                Thoughtful groceries selected by farmers and packed for your kitchen. No middlemen, no mystery.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#featured" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4A359] px-7 py-3.5 text-sm font-semibold text-[#1D2B25] transition-all duration-300 hover:bg-[#E8B86D]">
                  Shop this week
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link to="/" className="inline-flex items-center justify-center rounded-full border border-[#D4A359]/50 bg-white/30 px-7 py-3.5 text-sm font-semibold text-[#1D2B25] transition-all duration-300 hover:border-[#D4A359] hover:bg-[#D4A359]/10">
                  Explore story
                </Link>
              </div>
            </div>

            <motion.div
              className="group relative"
              whileHover={prefersReducedMotion ? undefined : { x: 4, y: -10, rotate: 0.5 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="overflow-hidden rounded-[2rem] border border-[#E8D9BF] bg-[#FFFDF9] shadow-[0_30px_80px_rgba(45,41,29,0.12)]">
                <img src={IMGS.landscape} alt="Farm field" className="h-[520px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
              </div>
              <div className="absolute -bottom-6 left-6 rounded-2xl border border-[#E8D9BF] bg-[#FFFDF9]/90 p-4 shadow-lg backdrop-blur-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#53635D]">This week’s top pick</p>
                <p className="mt-2 font-heading text-2xl text-[#1D2B25]">Spring Greens Box</p>
                <p className="mt-1 text-sm text-[#4F5F59]">From ₹24 · small-batch harvest</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid gap-4 rounded-[1.75rem] border border-[#E8D9BF] bg-[#FFFDF9]/80 p-4 md:grid-cols-3">
            {promises.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl bg-[#F7F2E8] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A359]/15 text-[#A36E1F]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading text-xl text-[#1D2B25]">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#4F5F59]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="featured" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#A36E1F]">Featured picks</p>
              <h2 className="mt-3 font-heading text-4xl tracking-[-0.03em] text-[#1D2B25] sm:text-5xl">Fresh from the fields</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const selectedWeight = product.weights.find((weight) => weight.label === selectedWeights[product.id]) ?? product.weights[0];

              return (
              <article key={product.id} className="group overflow-hidden rounded-lg border border-[#E8D9BF] bg-[#FFFDF9] shadow-[0_16px_38px_rgba(28,31,25,0.06)] transition-shadow duration-300 hover:shadow-[0_20px_45px_rgba(28,31,25,0.12)]">
                <div className="relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute left-4 top-4 rounded-sm border border-white/80 bg-[#FFFDF9]/85 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#1D2B25] backdrop-blur-sm">
                    {product.subtitle}
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#A36E1F]">Farmish selection</p>
                  <h3 className="mt-1 font-heading text-2xl text-[#285A43]">{product.name}</h3>
                  <p className="mt-1 text-sm text-[#6C6A5F]">{product.note}</p>

                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#285A43]">
                    <Leaf className="h-4 w-4 text-[#B98A37]" aria-hidden="true" />
                    <span>Farm to table</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[9px] font-semibold uppercase text-[#426B55]">
                    <span>Harvested</span><span className="h-px flex-1 bg-[#D4A359]" />
                    <span>Checked</span><span className="h-px flex-1 bg-[#D4A359]" />
                    <span>Packed</span><span className="h-px flex-1 bg-[#D4A359]" />
                    <span>Home</span>
                  </div>

                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-heading text-3xl font-semibold text-[#285A43]">₹{selectedWeight.price}</span>
                    <span className="text-xs text-[#6C6A5F]">/ {selectedWeight.label}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label={`Choose ${product.name} size`}>
                    {product.weights.map((weight) => (
                      <button
                        key={weight.label}
                        type="button"
                        aria-pressed={selectedWeights[product.id] === weight.label}
                        onClick={() => setSelectedWeights((current) => ({ ...current, [product.id]: weight.label }))}
                        className={`min-h-9 rounded-full border px-4 py-1.5 text-xs transition-colors ${selectedWeights[product.id] === weight.label ? "border-[#285A43] bg-[#285A43] font-semibold text-white" : "border-[#D8DCCF] bg-white text-[#6C6A5F] hover:border-[#285A43] hover:text-[#285A43]"}`}
                      >
                        {weight.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product, selectedWeight.label, selectedWeight.price)}
                    className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#285A43] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1D4432] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B98A37]"
                  >
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    Add to Cart
                  </button>
                </div>
              </article>
              );
            })}
          </div>
        </section>

        <section id="farmers" className="border-y border-[#E8D9BF] bg-[#F1E7D5]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="overflow-hidden rounded-[1.75rem] border border-[#E8D9BF] bg-[#FFFDF9]">
              <img src={IMGS.harvest} alt="Farmer in field" className="h-full min-h-[420px] w-full object-cover" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#A36E1F]">Our growers</p>
              <h2 className="mt-4 font-heading text-4xl tracking-[-0.03em] text-[#1D2B25] sm:text-5xl">Partnered with growers we trust.</h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#4F5F59]">
                We work with small farms that grow with care, respect the land, and harvest at the right moment so your food arrives at its best.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#FFFDF9] p-4">
                  <p className="font-heading text-3xl text-[#1D2B25]">42</p>
                  <p className="mt-2 text-sm text-[#4F5F59]">grower partners</p>
                </div>
                <div className="rounded-2xl bg-[#FFFDF9] p-4">
                  <p className="font-heading text-3xl text-[#1D2B25]">48h</p>
                  <p className="mt-2 text-sm text-[#4F5F59]">to your door</p>
                </div>
                <div className="rounded-2xl bg-[#FFFDF9] p-4">
                  <p className="font-heading text-3xl text-[#1D2B25]">100%</p>
                  <p className="mt-2 text-sm text-[#4F5F59]">transparent sourcing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="journal" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#A36E1F]">Farmish journal</p>
            <h2 className="mt-4 font-heading text-4xl tracking-[-0.03em] text-[#1D2B25] sm:text-5xl">Notes from the field</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "What makes a great harvest?", text: "We talk about timing, care, and how good soil shapes flavor.", image: IMGS.selection },
              { title: "How we choose what lands in your box", text: "A practical look at selection standards from the farm gate to your table.", image: IMGS.beans },
              { title: "Why freshness changes everything", text: "Learn why delivery windows and careful packing matter as much as the crop itself.", image: IMGS.pack },
            ].map((entry) => (
              <article key={entry.title} className="overflow-hidden rounded-[1.5rem] border border-[#E8D9BF] bg-[#FFFDF9]">
                <img src={entry.image} alt={entry.title} className="h-56 w-full object-cover" />
                <div className="p-5">
                  <p className="font-heading text-2xl text-[#1D2B25]">{entry.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#4F5F59]">{entry.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
