import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

type CartButtonProps = {
  count: number;
};

export function CartButton({ count }: CartButtonProps) {
  return (
    <Link
      to="/cart"
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      title="Cart"
      data-testid="cart-header-button"
      className="inline-flex h-11 min-w-16 shrink-0 items-center justify-center gap-2 rounded-md bg-[#D4A359] px-3 text-sm font-semibold text-[#1D2B25] transition-colors hover:bg-[#E8B86D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A36E1F]"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      <span aria-hidden="true">{count}</span>
    </Link>
  );
}