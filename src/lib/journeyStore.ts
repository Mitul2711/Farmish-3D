import type Lenis from "lenis";

export const IMGS = {
  field: "https://static.prod-images.emergentagent.com/jobs/3ac92bb0-d896-4715-9198-cd766c03ba36/images/95d0711dc1b3d8d3a89d26632d9139489ec9456497f5908b97428cbcdbfd45aa.jpeg",
  harvest: "https://static.prod-images.emergentagent.com/jobs/3ac92bb0-d896-4715-9198-cd766c03ba36/images/38d868f3b626e6ba5b213759046b2426040f929f766a9cd2b91d21fb8b615443.jpeg",
  selection: "https://static.prod-images.emergentagent.com/jobs/3ac92bb0-d896-4715-9198-cd766c03ba36/images/f42542205f5e6909ce1d4751bf61f11686e8ca55fd06eb2dc9a85d126979d328.jpeg",
  beans: "https://static.prod-images.emergentagent.com/jobs/3ac92bb0-d896-4715-9198-cd766c03ba36/images/85b54e79a4b41a88b03141db456db2b070d5594dc29574166f7243355a3b1e43.jpeg",
  pack: "https://static.prod-images.emergentagent.com/jobs/3ac92bb0-d896-4715-9198-cd766c03ba36/images/bb9c7ff32449fb1d87c4fc159010008f9f134262b981d5b4bf981904a0bfc2c8.jpeg",
  delivery: "https://static.prod-images.emergentagent.com/jobs/3ac92bb0-d896-4715-9198-cd766c03ba36/images/e00da11fbbbbe350e7adc18063ebf78042b09a2eb3de15c1cc76b4434f3a8e0e.jpeg",
  landscape: "https://static.prod-images.emergentagent.com/jobs/3ac92bb0-d896-4715-9198-cd766c03ba36/images/53fae9a805f62afe49f8fb1c911a894feaeea7f03589718486cd439b8e75a465.jpeg",
  beansMacro: "https://static.prod-images.emergentagent.com/jobs/3ac92bb0-d896-4715-9198-cd766c03ba36/images/4ce56e8af7ef2327de27910af7fad0601e1dbdfaacd563ec2244111ce5f31652.jpeg",
  packDetail: "https://static.prod-images.emergentagent.com/jobs/3ac92bb0-d896-4715-9198-cd766c03ba36/images/4171a18331c60c25440a3e831e0b14d05c64e1832d745ebdcca873928c6ebaf7.jpeg",
};

export interface SceneDef {
  id: string;
  img: string;
  imgRange: [number, number];
  captionRange: [number, number];
  kicker: string;
  title: string[];
  sub: string;
  align: "left" | "right" | "center";
  thumb?: string;
}

export const SCENES: SceneDef[] = [
  {
    id: "field",
    img: IMGS.field,
    imgRange: [0, 0.185],
    captionRange: [0, 0.12],
    kicker: "Farmish · Farmer-Direct Grocery",
    title: ["From Our Farms,", "To Your Home."],
    sub: "Good food begins with good farmers.",
    align: "center",
  },
  {
    id: "harvest",
    img: IMGS.harvest,
    imgRange: [0.14, 0.365],
    captionRange: [0.165, 0.33],
    kicker: "01 · The Harvest",
    title: ["Grown by farmers", "who care."],
    sub: "Every harvest begins in the hands of a farmer.",
    align: "left",
  },
  {
    id: "selection",
    img: IMGS.selection,
    imgRange: [0.32, 0.535],
    captionRange: [0.35, 0.50],
    kicker: "02 · The Selection",
    title: ["Selected", "with care."],
    sub: "We choose the best, so you receive the best.",
    align: "right",
    thumb: IMGS.beansMacro,
  },
  {
    id: "beans",
    img: IMGS.beans,
    imgRange: [0.49, 0.675],
    captionRange: [0.515, 0.645],
    kicker: "03 · From Farm to Farmish",
    title: ["Packed", "with care."],
    sub: "Straight from the farm. Prepared for your home.",
    align: "left",
  },
  {
    id: "package",
    img: IMGS.pack,
    imgRange: [0.63, 0.835],
    captionRange: [0.66, 0.80],
    kicker: "04 · The Seal",
    title: ["The Farmish", "standard."],
    sub: "Small-batch sealed in breathable kraft. Honest by design.",
    align: "center",
    thumb: IMGS.packDetail,
  },
  {
    id: "delivery",
    img: IMGS.delivery,
    imgRange: [0.79, 1.001],
    captionRange: [0.825, 0.985],
    kicker: "05 · The Arrival",
    title: ["From the farmer who grew it…", "…to you."],
    sub: "Freshness, delivered with care.",
    align: "right",
  },
];

export const journeyProgress = { value: 0 };

export const lenisRef: { current: Lenis | null } = { current: null };

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.8 });
  else el.scrollIntoView({ behavior: "smooth" });
}
