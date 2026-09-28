import { IMGS } from "./journeyStore";

export type ProductCategory = "Produce" | "Pantry" | "Fruit" | "Bundles";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  subtitle: string;
  image: string;
  basePrice: number;
  note: string;
  weights: { label: string; price: number }[];
};

type CartLine = {
  id: string;
  name: string;
  image: string;
  price: number;
  weight: string;
  qty: number;
};

export const CART_KEY = "farmish-cart";
export const FAVORITES_KEY = "farmish-favorites";
export const FAVORITES_CHANGE_EVENT = "farmish-favorites-change";

export const products: Product[] = [
  {
    id: "greens-box",
    name: "Heirloom Greens Box",
    category: "Produce",
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
    category: "Pantry",
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
    category: "Produce",
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
    category: "Pantry",
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
    category: "Fruit",
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
    category: "Bundles",
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

export function readFavoriteIds(): string[] {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((id): id is string => typeof id === "string" && products.some((product) => product.id === id));
  } catch {
    return [];
  }
}

export function saveFavoriteIds(ids: string[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
}

export function readCartCount(): number {
  try {
    const cart: unknown = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]");
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((sum, item) => sum + Number(item?.qty || 0), 0);
  } catch {
    return 0;
  }
}

export function addProductToCart(product: Product, weightLabel: string, price: number): number {
  let current: CartLine[] = [];
  const raw = window.localStorage.getItem(CART_KEY);

  try {
    if (raw) current = JSON.parse(raw) as CartLine[];
  } catch {
    current = [];
  }

  const existing = current.find((item) => item.id === product.id && item.weight === weightLabel);
  const next = existing
    ? current.map((item) => item.id === product.id && item.weight === weightLabel
      ? { ...item, qty: item.qty + 1, price }
      : item)
    : [...current, { id: product.id, name: product.name, image: product.image, price, weight: weightLabel, qty: 1 }];

  window.localStorage.setItem(CART_KEY, JSON.stringify(next));
  return next.reduce((sum, item) => sum + Number(item.qty || 0), 0);
}