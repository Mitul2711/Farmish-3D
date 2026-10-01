import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle2, Leaf, LockKeyhole, MapPin, Minus, PackageCheck, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { CartButton } from "@/components/farmish/CartButton";
import { NavigationHeader } from "@/components/farmish/NavigationHeader";

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  weight: string;
  qty: number;
};

const CART_KEY = "farmish-cart";
const LAST_ORDER_KEY = "farmish-last-order";
const DEMO_COUPON_CODE = "FARMISH10";
const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
];

type CheckoutAddress = {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

type OrderConfirmation = {
  reference: string;
  address: CheckoutAddress;
  deliveryMethod: string;
  paymentMethod: string;
  couponCode: string | null;
  discount: number;
  total: number;
  createdAt: string;
};

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [checkoutAddress, setCheckoutAddress] = useState<CheckoutAddress | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (checkoutStep > 0) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [checkoutStep]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  );
  const delivery = cart.length ? 49 : 0;
  const discount = couponApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const total = subtotal + delivery - discount;
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const deliveryMethod = "Home Delivery (Within 24 hours)";
  const paymentMethod = "Cash on Delivery";

  const updateQty = (id: string, weight: string, delta: number) => {
    setCouponMessage("");
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.weight === weight
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeItem = (id: string, weight: string) => {
    setCouponMessage("");
    setCart((prev) => prev.filter((item) => !(item.id === id && item.weight === weight)));
  };

  const applyCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (couponInput.trim().toUpperCase() === DEMO_COUPON_CODE) {
      setCouponApplied(true);
      setCouponInput(DEMO_COUPON_CODE);
      setCouponMessage("FARMISH10 applied: 10% off your items.");
      return;
    }

    setCouponApplied(false);
    setCouponMessage("That coupon code isn’t valid. Try FARMISH10.");
  };

  const saveAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setCheckoutAddress({
      fullName: String(formData.get("fullName") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      street: String(formData.get("street") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      state: String(formData.get("state") ?? "").trim(),
      postalCode: String(formData.get("postalCode") ?? "").trim(),
    });
    setCheckoutStep(2);
  };

  const placeOrder = () => {
    if (!checkoutAddress) return;
    const reference = `FM-${Date.now().toString().slice(-6)}`;
    const order = {
      reference,
      address: checkoutAddress,
      deliveryMethod,
      paymentMethod,
      items: cart,
      subtotal,
      delivery,
      couponCode: couponApplied ? DEMO_COUPON_CODE : null,
      discount,
      total,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    window.localStorage.removeItem(CART_KEY);
    setCart([]);
    setCheckoutStep(0);
    setOrderConfirmation(order);
  };

  const fieldClassName = "mt-1.5 w-full rounded-md border border-[#E8D9BF] bg-white px-3.5 py-3 text-sm text-[#1D2B25] outline-none transition focus:border-[#285A43] focus:ring-2 focus:ring-[#285A43]/15";

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#1D2B25] antialiased">
      <NavigationHeader
        sticky
        action={(
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/shop" className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-[#53635D] hover:text-[#A36E1F] sm:inline">
              Continue shopping
            </Link>
            <CartButton count={cartItemCount} />
          </div>
        )}
      />

      <main className="mx-auto max-w-7xl px-6 py-16">
        {checkoutStep > 0 ? (
          <section className="mx-auto max-w-6xl pb-10">
            <div className="text-center">
              <h1 className="font-heading text-4xl text-[#1D2B25]">Checkout</h1>
              <ol aria-label="Checkout progress" className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-2 sm:gap-4">
                  {["Address", "Delivery", "Payment"].map((step, index) => (
                  <li key={step} aria-current={checkoutStep === index + 1 ? "step" : undefined} className={`flex items-center gap-2 text-xs sm:text-sm ${index < checkoutStep ? "font-medium text-[#285A43]" : "text-[#8A8B80]"}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${index < checkoutStep ? "bg-[#285A43] text-white" : "bg-[#E8E4D9] text-white"}`}>
                      {index < checkoutStep - 1 ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                    </span>
                    <span>{step}</span>
                    {index < 2 && <span className={`hidden h-px w-7 sm:block md:w-10 ${index < checkoutStep - 1 ? "bg-[#285A43]" : "bg-[#E8D9BF]"}`} aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.9fr)] lg:gap-14">
              <section className="rounded-xl border border-[#E8D9BF] bg-[#FFFDF9] p-6 shadow-[0_12px_36px_rgba(45,41,29,0.04)] sm:p-8">
                {checkoutStep === 1 && (
                  <form onSubmit={saveAddress}>
                    <div className="border-b border-[#E8D9BF] pb-3">
                      <h2 className="font-heading text-2xl text-[#1D2B25]">Delivery Address</h2>
                      <p className="mt-1 text-sm text-[#6C6A5F]">Where should we bring your farm-fresh order?</p>
                    </div>
                    <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-[#1D2B25] sm:col-span-2">
                        Full Name
                        <input className={fieldClassName} name="fullName" autoComplete="name" required />
                      </label>
                      <label className="block text-sm font-medium text-[#1D2B25]">
                        Mobile Number
                        <input className={fieldClassName} name="phone" type="tel" autoComplete="tel" required />
                      </label>
                      <label className="block text-sm font-medium text-[#1D2B25]">
                        Email Address
                        <input className={fieldClassName} name="email" type="email" autoComplete="email" />
                      </label>
                      <label className="block text-sm font-medium text-[#1D2B25] sm:col-span-2">
                        Complete Address
                        <textarea className={`${fieldClassName} min-h-24 resize-y`} name="street" autoComplete="street-address" required />
                      </label>
                      <label className="block text-sm font-medium text-[#1D2B25]">
                        City
                        <input className={fieldClassName} name="city" autoComplete="address-level2" required />
                      </label>
                      <label className="block text-sm font-medium text-[#1D2B25]">
                        State
                        <select className={fieldClassName} name="state" autoComplete="address-level1" defaultValue="" required>
                          <option value="" disabled>Select state</option>
                          {INDIA_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </label>
                      <label className="block text-sm font-medium text-[#1D2B25]">
                        PIN Code
                        <input className={fieldClassName} name="postalCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" title="Enter a 6-digit PIN code" required />
                      </label>
                    </div>
                    <div className="mt-8 flex justify-end border-t border-[#E8D9BF] pt-6">
                      <button type="submit" className="rounded-md bg-[#285A43] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4432]">Continue to Delivery</button>
                    </div>
                  </form>
                )}

                {checkoutStep === 2 && (
                  <div>
                    <div className="border-b border-[#E8D9BF] pb-3">
                      <h2 className="font-heading text-2xl text-[#1D2B25]">Delivery Method</h2>
                    </div>
                    <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-lg border border-[#285A43] bg-[#F7F8F1] p-4">
                      <input type="radio" name="deliveryMethod" value="home-delivery" checked readOnly className="mt-1 accent-[#285A43]" />
                      <span>
                        <span className="block font-heading text-lg text-[#1D2B25]">{deliveryMethod}</span>
                        <span className="mt-1 block text-sm text-[#53635D]">₹{delivery.toFixed(0)}</span>
                      </span>
                    </label>
                    <div className="mt-8 flex flex-col gap-3 border-t border-[#E8D9BF] pt-6 sm:flex-row sm:justify-between">
                      <button type="button" onClick={() => setCheckoutStep(1)} className="w-full rounded-md border border-[#285A43] px-6 py-3 text-sm text-[#285A43] transition hover:bg-[#F7F2E8] sm:w-auto">Back</button>
                      <button type="button" onClick={() => setCheckoutStep(3)} className="w-full whitespace-nowrap rounded-md bg-[#285A43] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4432] sm:w-auto sm:px-6">Continue to Payment</button>
                    </div>
                  </div>
                )}

                {checkoutStep === 3 && (
                  <div>
                    <div className="border-b border-[#E8D9BF] pb-3">
                      <h2 className="font-heading text-2xl text-[#1D2B25]">Payment Method</h2>
                    </div>
                    <p className="mt-6 border-l-2 border-[#D4A359] bg-[#F7F2E8] px-4 py-3 text-sm leading-relaxed text-[#53635D]">
                      <strong className="text-[#1D2B25]">Demo checkout:</strong> no real payments are processed.
                    </p>
                    <label className="mt-5 flex cursor-pointer items-start gap-4 rounded-lg border border-[#285A43] bg-[#F7F8F1] p-4">
                      <input type="radio" name="paymentMethod" value="cod" checked readOnly className="mt-1 accent-[#285A43]" />
                      <span>
                        <span className="block font-heading text-lg text-[#1D2B25]">{paymentMethod}</span>
                        <span className="mt-1 block text-sm text-[#53635D]">Pay when your order arrives</span>
                      </span>
                    </label>
                    <p className="mt-4 border-l-2 border-[#D4A359] bg-[#F7F2E8] px-4 py-3 text-sm text-[#53635D]">Only Cash on Delivery is available for Farmish orders.</p>
                    <div className="mt-8 flex flex-col gap-3 border-t border-[#E8D9BF] pt-6 sm:flex-row sm:justify-between">
                      <button type="button" onClick={() => setCheckoutStep(2)} className="w-full rounded-md border border-[#285A43] px-6 py-3 text-sm text-[#285A43] transition hover:bg-[#F7F2E8] sm:w-auto">Back</button>
                      <button type="button" onClick={placeOrder} className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#285A43] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4432] sm:w-auto sm:px-6">
                        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                        Place Order · ₹{total.toFixed(0)}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <aside className="self-start lg:sticky lg:top-28">
                <h2 className="border-b border-[#E8D9BF] pb-3 font-heading text-2xl text-[#1D2B25]">Order Summary</h2>
                <ul className="space-y-4 py-5">
                  {cart.map((item) => (
                    <li key={`${item.id}-${item.weight}`} className="flex items-start justify-between gap-4 text-sm text-[#53635D]">
                      <span>{item.qty}x {item.name} ({item.weight})</span>
                      <span className="shrink-0 font-medium text-[#1D2B25]">₹{(item.price * item.qty).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 border-t border-[#E8D9BF] py-5 text-sm text-[#53635D]">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>₹{delivery.toFixed(2)}</span></div>
                  {couponApplied && <div className="flex justify-between text-[#285A43]"><span>FARMISH10 discount</span><span>−₹{discount.toFixed(2)}</span></div>}
                </div>
                <div className="flex justify-between border-t border-[#E8D9BF] pt-5 font-semibold text-[#1D2B25]">
                  <span>Total</span><span>₹{total.toFixed(2)}</span>
                </div>
                <p className="mt-5 text-xs leading-relaxed text-[#6C6A5F]">Your address is used only to prepare this delivery.</p>
              </aside>
            </div>
          </section>
        ) : (
          <>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#A36E1F]">Your basket</p>
            <h1 className="mt-3 font-heading text-4xl tracking-[-0.03em] text-[#1D2B25] sm:text-5xl">Fresh picks for this week</h1>
          </div>
          <Link to="/shop" className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#53635D] hover:text-[#A36E1F]">
            Back to shop
          </Link>
        </div>

        {orderConfirmation ? (
          <section className="mx-auto max-w-3xl py-8 text-center" aria-live="polite">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#285A43]" />
            <h2 className="mt-5 font-heading text-3xl text-[#1D2B25] sm:text-4xl">Thank you for choosing Farmish!</h2>
            <p className="mt-2 text-sm text-[#53635D]">Order placed successfully. We&apos;re now preparing your Farmish goodness.</p>
            <div className="mt-7 rounded-xl border border-[#E8D9BF] bg-[#FFFDF9] p-6 text-left shadow-[0_12px_36px_rgba(45,41,29,0.04)] sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#6C6A5F]">Order Number</p>
                  <p className="mt-1 text-sm font-semibold text-[#1D2B25]">{orderConfirmation.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6C6A5F]">Order Date</p>
                  <p className="mt-1 text-sm font-semibold text-[#1D2B25]">{new Date(orderConfirmation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6C6A5F]">Payment Method</p>
                  <p className="mt-1 text-sm font-semibold text-[#1D2B25]">{orderConfirmation.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6C6A5F]">Expected Delivery</p>
                  <p className="mt-1 text-sm font-semibold text-[#1D2B25]">Within 24 hours</p>
                </div>
              </div>
              <div className="mt-6 border-t border-[#E8D9BF] pt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#285A43]">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Deliver to
                </div>
                <p className="mt-2 pl-6 text-sm leading-relaxed text-[#53635D]">
                  <span className="font-medium text-[#1D2B25]">{orderConfirmation.address.fullName}</span><br />
                  {orderConfirmation.address.street}<br />
                  {orderConfirmation.address.city}, {orderConfirmation.address.state} {orderConfirmation.address.postalCode}<br />
                  Phone: {orderConfirmation.address.phone}
                </p>
              </div>
              <div className="mt-6 flex justify-between border-t border-[#E8D9BF] pt-5 font-semibold text-[#1D2B25]">
                <span>Order total</span><span>₹{orderConfirmation.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#285A43] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4432]">
                <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Continue Shopping
              </Link>
              <Link to="/" className="inline-flex items-center justify-center rounded-md border border-[#285A43] px-6 py-3 text-sm font-medium text-[#285A43] transition hover:bg-[#F7F2E8]">
                Back to Home
              </Link>
            </div>
          </section>
        ) : cart.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#D9C8A5] bg-[#FFFDF9]/80 p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-[#A36E1F]" />
            <h2 className="mt-6 font-heading text-3xl text-[#1D2B25]">Your basket is empty</h2>
            <p className="mt-3 text-base text-[#4F5F59]">Add a few fresh picks from the farm to get started.</p>
            <Link
              to="/shop"
              className="mt-8 inline-flex rounded-full bg-[#D4A359] px-6 py-3 text-sm font-semibold text-[#1D2B25] transition-all duration-300 hover:bg-[#E8B86D]"
            >
              Browse the market
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-5">
              {cart.map((item) => (
                <article key={`${item.id}-${item.weight}`} className="flex flex-col gap-4 rounded-[1.6rem] border border-[#E8D9BF] bg-[#FFFDF9] p-4 sm:flex-row sm:items-center">
                  <img src={item.image} alt={item.name} className="h-28 w-full rounded-[1.2rem] object-cover sm:w-28" />
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-heading text-2xl text-[#1D2B25]">{item.name}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#53635D]">{item.weight}</p>
                      </div>
                      <p className="font-heading text-xl text-[#1D2B25]">₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-[#E8D9BF] bg-[#F7F2E8] p-1">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name}`}
                          onClick={() => updateQty(item.id, item.weight, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[#1D2B25] hover:bg-[#E8D9BF]"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-[#1D2B25]">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name}`}
                          onClick={() => updateQty(item.id, item.weight, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[#1D2B25] hover:bg-[#E8D9BF]"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.weight)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#D9C8A5] px-3 py-2 text-sm font-medium text-[#1D2B25] hover:bg-[#F7F2E8]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="rounded-[1.75rem] border border-[#E8D9BF] bg-[#FFFDF9] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#A36E1F]">Summary</p>
              <div className="mt-6 space-y-4 text-[#4F5F59]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>₹{delivery.toFixed(2)}</span>
                </div>
                <form onSubmit={applyCoupon} className="border-b border-[#E8D9BF] py-4">
                  <label htmlFor="coupon-code" className="mb-2 block text-xs font-medium text-[#285A43]">Coupon code</label>
                  <div className="flex gap-2">
                    <input
                      id="coupon-code"
                      name="coupon"
                      value={couponInput}
                      onChange={(event) => {
                        setCouponInput(event.target.value);
                        setCouponMessage("");
                      }}
                      placeholder="Enter code"
                      autoComplete="off"
                      disabled={couponApplied}
                      className="min-w-0 flex-1 rounded-full border border-[#D9C8A5] bg-white px-4 py-2.5 text-sm text-[#1D2B25] outline-none transition placeholder:text-[#8A8B80] focus:border-[#285A43] focus:ring-2 focus:ring-[#285A43]/15 disabled:bg-[#F7F2E8]"
                    />
                    {couponApplied ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCouponApplied(false);
                          setCouponInput("");
                          setCouponMessage("");
                        }}
                        className="rounded-full border border-[#D9C8A5] px-4 py-2 text-xs font-semibold text-[#285A43] transition hover:bg-[#F7F2E8]"
                      >
                        Remove
                      </button>
                    ) : (
                      <button type="submit" className="rounded-full bg-[#285A43] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1D4432]">
                        Apply
                      </button>
                    )}
                  </div>
                  {couponMessage && (couponApplied || couponInput.trim()) && <p role="status" className={`mt-2 text-xs ${couponApplied ? "text-[#285A43]" : "text-[#A34E35]"}`}>{couponMessage}</p>}
                  {!couponMessage && !couponApplied && <p className="mt-2 text-[11px] text-[#7A796E]">Try FARMISH10 for 10% off items.</p>}
                </form>
                {couponApplied && (
                  <div className="flex items-center justify-between text-[#285A43]">
                    <span>FARMISH10 discount</span>
                    <span>−₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 font-semibold text-[#1D2B25]">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={() => setCheckoutStep(1)} className="mt-8 w-full rounded-full bg-[#D4A359] px-5 py-3.5 text-sm font-semibold text-[#1D2B25] transition-all duration-300 hover:bg-[#E8B86D]">
                Checkout
              </button>
            </aside>
          </div>
        )}

        <section className="mt-16 border-y border-[#D9C8A5] py-10 sm:mt-20 sm:py-12" aria-labelledby="basket-journey-title">
          <div className="mb-8 max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#A36E1F]">A more thoughtful basket</p>
            <h2 id="basket-journey-title" className="mt-3 font-heading text-3xl text-[#285A43] sm:text-4xl">
              Good food, with a good journey.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#53635D]">
              Every Farmish order connects your kitchen to the people and care behind each harvest.
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-3 sm:gap-5">
            <div>
              <Leaf className="h-5 w-5 text-[#A36E1F]" aria-hidden="true" />
              <h3 className="mt-3 font-heading text-xl text-[#1D2B25]">Grown with care</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#53635D]">Sourced directly from growers who know their land and crops.</p>
            </div>
            <div>
              <PackageCheck className="h-5 w-5 text-[#A36E1F]" aria-hidden="true" />
              <h3 className="mt-3 font-heading text-xl text-[#1D2B25]">Packed fresh</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#53635D]">Carefully packed to help each pick arrive in its best condition.</p>
            </div>
            <div>
              <Truck className="h-5 w-5 text-[#A36E1F]" aria-hidden="true" />
              <h3 className="mt-3 font-heading text-xl text-[#1D2B25]">Delivered home</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#53635D]">From the farmer&apos;s field to your kitchen, without the extra stops.</p>
            </div>
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}
