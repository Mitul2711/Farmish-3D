import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Leaf, Search, ShoppingBag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartButton } from "@/components/farmish/CartButton";
import { NavigationHeader } from "@/components/farmish/NavigationHeader";
import { IMGS } from "@/lib/journeyStore";
import { CART_KEY, addProductToCart, products, readFavoriteIds, saveFavoriteIds, type Product, type ProductCategory } from "@/lib/shopProducts";

type ProductSort = "featured" | "price-low-high" | "price-high-low" | "name-a-z";

const sortLabels: Record<ProductSort, string> = {
  featured: "Featured",
  "price-low-high": "Price: low to high",
  "price-high-low": "Price: high to low",
  "name-a-z": "Name: A to Z",
};

export default function Shop() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [cartCount, setCartCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(readFavoriteIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">("All");
  const [sortOrder, setSortOrder] = useState<ProductSort>("featured");
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
    setCartCount(addProductToCart(product, weightLabel, weightPrice));
  };

  const toggleFavorite = (productId: string) => {
    const next = favoriteIds.includes(productId)
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId];

    saveFavoriteIds(next);
    setFavoriteIds(next);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
      const searchText = `${product.name} ${product.subtitle} ${product.note}`.toLowerCase();
      return matchesCategory && searchText.includes(searchQuery.trim().toLowerCase());
    })
    .sort((first, second) => {
      if (sortOrder === "price-low-high") return first.basePrice - second.basePrice;
      if (sortOrder === "price-high-low") return second.basePrice - first.basePrice;
      if (sortOrder === "name-a-z") return first.name.localeCompare(second.name);
      return 0;
    });
  const favoriteProducts = favoriteIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => product !== undefined);

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#1D2B25] antialiased">
      <NavigationHeader
        sticky
        action={<CartButton count={cartCount} />}
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
                <Link to="/why-farmish" className="inline-flex items-center justify-center rounded-full border border-[#D4A359]/50 bg-white/30 px-7 py-3.5 text-sm font-semibold text-[#1D2B25] transition-all duration-300 hover:border-[#D4A359] hover:bg-[#D4A359]/10">
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

        <section id="featured" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#A36E1F]">Featured picks</p>
              <h2 className="mt-3 font-heading text-4xl tracking-[-0.03em] text-[#1D2B25] sm:text-5xl">Fresh from the fields</h2>
            </div>
            <Link to="/favorites" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#285A43] transition-colors hover:text-[#A36E1F]">
              <Heart className="h-4 w-4" aria-hidden="true" />
              Favorites <span className="text-[#53635D]">({favoriteProducts.length})</span>
            </Link>
          </div>

          <div className="mb-6 grid gap-4 border-y border-[#E8D9BF] py-5 md:grid-cols-[minmax(220px,1fr)_minmax(150px,220px)_minmax(170px,220px)] md:items-end">
            <div>
              <label htmlFor="shop-search" className="mb-2 block text-xs font-semibold text-[#1D2B25]">Search products</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A796E]" aria-hidden="true" />
                <input
                  id="shop-search"
                  data-testid="shop-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search the collection"
                  className="w-full rounded-md border border-[#D9C8A5] bg-[#FFFDF9] py-2.5 pl-10 pr-3 text-sm text-[#1D2B25] outline-none transition focus:border-[#285A43] focus:ring-2 focus:ring-[#285A43]/15"
                />
              </div>
            </div>
            <div>
              <span id="shop-category-label" className="mb-2 block text-xs font-semibold text-[#1D2B25]">Category</span>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ProductCategory | "All")}>
                <SelectTrigger
                  id="shop-category-filter"
                  data-testid="shop-category-filter"
                  aria-labelledby="shop-category-label"
                  className="h-10 w-full rounded-md border-[#D9C8A5] bg-[#FFFDF9] px-3 text-sm text-[#1D2B25] hover:bg-[#F3E7D2] focus-visible:border-[#285A43] focus-visible:ring-2 focus-visible:ring-[#285A43]/15 dark:bg-[#FFFDF9] dark:hover:bg-[#F3E7D2]"
                >
                  <SelectValue>{categoryFilter === "All" ? "All categories" : categoryFilter}</SelectValue>
                </SelectTrigger>
                <SelectContent side="bottom" align="start" alignItemWithTrigger={false} className="rounded-md border border-[#E8D9BF] bg-[#FFFDF9] p-1 text-[#1D2B25] shadow-[0_12px_30px_rgba(29,43,37,0.12)]">
                  <SelectItem value="All" className="rounded-sm py-2 data-[highlighted]:bg-[#F3E7D2] data-[highlighted]:text-[#1D2B25]">All categories</SelectItem>
                  <SelectItem value="Produce" className="rounded-sm py-2 data-[highlighted]:bg-[#F3E7D2] data-[highlighted]:text-[#1D2B25]">Produce</SelectItem>
                  <SelectItem value="Pantry" className="rounded-sm py-2 data-[highlighted]:bg-[#F3E7D2] data-[highlighted]:text-[#1D2B25]">Pantry</SelectItem>
                  <SelectItem value="Fruit" className="rounded-sm py-2 data-[highlighted]:bg-[#F3E7D2] data-[highlighted]:text-[#1D2B25]">Fruit</SelectItem>
                  <SelectItem value="Bundles" className="rounded-sm py-2 data-[highlighted]:bg-[#F3E7D2] data-[highlighted]:text-[#1D2B25]">Bundles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <span id="shop-sort-label" className="mb-2 block text-xs font-semibold text-[#1D2B25]">Sort by</span>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as ProductSort)}>
                <SelectTrigger
                  id="shop-sort-filter"
                  data-testid="shop-sort-filter"
                  aria-labelledby="shop-sort-label"
                  className="h-10 w-full rounded-md border-[#D9C8A5] bg-[#FFFDF9] px-3 text-sm text-[#1D2B25] hover:bg-[#F3E7D2] focus-visible:border-[#285A43] focus-visible:ring-2 focus-visible:ring-[#285A43]/15 dark:bg-[#FFFDF9] dark:hover:bg-[#F3E7D2]"
                >
                  <SelectValue>{sortLabels[sortOrder]}</SelectValue>
                </SelectTrigger>
                <SelectContent side="bottom" align="start" alignItemWithTrigger={false} className="rounded-md border border-[#E8D9BF] bg-[#FFFDF9] p-1 text-[#1D2B25] shadow-[0_12px_30px_rgba(29,43,37,0.12)]">
                  <SelectItem value="featured" className="rounded-sm py-2 data-[highlighted]:bg-[#F3E7D2] data-[highlighted]:text-[#1D2B25]">Featured</SelectItem>
                  <SelectItem value="price-low-high" className="rounded-sm py-2 data-[highlighted]:bg-[#F3E7D2] data-[highlighted]:text-[#1D2B25]">Price: low to high</SelectItem>
                  <SelectItem value="price-high-low" className="rounded-sm py-2 data-[highlighted]:bg-[#F3E7D2] data-[highlighted]:text-[#1D2B25]">Price: high to low</SelectItem>
                  <SelectItem value="name-a-z" className="rounded-sm py-2 data-[highlighted]:bg-[#F3E7D2] data-[highlighted]:text-[#1D2B25]">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="mb-5 text-sm text-[#53635D]" aria-live="polite">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </p>

          {filteredProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const selectedWeight = product.weights.find((weight) => weight.label === selectedWeights[product.id]) ?? product.weights[0];
              const isFavorite = favoriteIds.includes(product.id);

              return (
              <article key={product.id} className="group overflow-hidden rounded-lg border border-[#E8D9BF] bg-[#FFFDF9] shadow-[0_16px_38px_rgba(28,31,25,0.06)] transition-shadow duration-300 hover:shadow-[0_20px_45px_rgba(28,31,25,0.12)]">
                <div className="relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <button
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    aria-label={`${isFavorite ? "Remove" : "Add"} ${product.name} ${isFavorite ? "from" : "to"} favorites`}
                    aria-pressed={isFavorite}
                    className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8D9BF] bg-[#FFFDF9]/95 text-[#A36E1F] shadow-sm transition-colors hover:bg-[#F3E7D2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A36E1F]"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} aria-hidden="true" />
                  </button>
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
          ) : (
            <div className="border-y border-[#E8D9BF] py-14 text-center">
              <p className="font-heading text-2xl text-[#1D2B25]">No products found</p>
              <p className="mt-2 text-sm text-[#53635D]">Try another search or category.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                }}
                className="mt-5 text-sm font-semibold text-[#285A43] underline decoration-[#D4A359] underline-offset-4 hover:text-[#A36E1F]"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
