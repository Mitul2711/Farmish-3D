import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { NavigationHeader } from "@/components/farmish/NavigationHeader";
import { addProductToCart, products, readCartCount, readFavoriteIds, saveFavoriteIds } from "@/lib/shopProducts";

export default function Favorites() {
  const [favoriteIds, setFavoriteIds] = useState(readFavoriteIds);
  const [cartCount, setCartCount] = useState(readCartCount);
  const [notice, setNotice] = useState("");
  const favoriteProducts = favoriteIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => product !== undefined);

  const removeFavorite = (productId: string) => {
    const next = favoriteIds.filter((id) => id !== productId);
    saveFavoriteIds(next);
    setFavoriteIds(next);
  };

  const addToCart = (product: (typeof products)[number]) => {
    const weight = product.weights[0];
    setCartCount(addProductToCart(product, weight.label, weight.price));
    setNotice(`${product.name} added to your cart.`);
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

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-12 sm:pt-16">
        <section aria-labelledby="favorites-heading">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#E8D9BF] pb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#A36E1F]">Saved for later</p>
              <h1 id="favorites-heading" className="mt-3 font-heading text-4xl text-[#1D2B25] sm:text-5xl">Your favorites</h1>
            </div>
            <Link
              to="/shop"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#D4A359] px-5 py-3 text-sm font-semibold text-[#1D2B25] transition-colors hover:bg-[#E8B86D]"
            >
              Continue shopping
            </Link>
          </div>

          {favoriteProducts.length > 0 ? (
            <ul className="divide-y divide-[#E8D9BF] border-b border-[#E8D9BF]">
              {favoriteProducts.map((product) => {
                const weight = product.weights[0];

                return (
                  <li key={product.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                    <img src={product.image} alt="" loading="lazy" className="h-24 w-full object-cover sm:h-20 sm:w-28" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#A36E1F]">{product.category}</p>
                      <h2 className="mt-1 font-heading text-2xl text-[#285A43]">{product.name}</h2>
                      <p className="mt-1 text-sm text-[#53635D]">{product.note}</p>
                      <p className="mt-2 font-semibold text-[#1D2B25]">₹{weight.price} <span className="text-xs font-normal text-[#53635D]">/ {weight.label}</span></p>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => removeFavorite(product.id)}
                        aria-label={`Remove ${product.name} from favorites`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#A36E1F] transition-colors hover:bg-[#F3E7D2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A36E1F]"
                      >
                        <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#285A43] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1D4432] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B98A37]"
                      >
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                        Add to Cart
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border-b border-[#E8D9BF] py-16 text-center">
              <Heart className="mx-auto h-8 w-8 text-[#A36E1F]" aria-hidden="true" />
              <h2 className="mt-4 font-heading text-2xl text-[#1D2B25]">No favorites saved yet</h2>
              <Link to="/shop" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#D4A359] px-5 py-3 text-sm font-semibold text-[#1D2B25] transition-colors hover:bg-[#E8B86D]">
                Explore the shop
              </Link>
            </div>
          )}

          {notice && <p role="status" aria-live="polite" className="mt-5 text-sm text-[#285A43]">{notice}</p>}
        </section>
      </main>
    </div>
  );
}