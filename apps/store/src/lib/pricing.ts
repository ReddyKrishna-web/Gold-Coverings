export type CouponLike = {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderPaise: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  usedCount: number;
};

export type Totals = {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  freeShipping: boolean;
};

export type PricingConfig = {
  shippingPaise: number;
  freeShippingAbovePaise: number;
  gstPercent: number;
};

/** Returns a human-readable problem, or null when the coupon can be applied. */
export function couponProblem(coupon: CouponLike | null, subtotalPaise: number, now = new Date()): string | null {
  if (!coupon) return null;
  if (!coupon.isActive) return "This coupon is no longer active.";
  if (coupon.startsAt && coupon.startsAt > now) return "This coupon is not active yet.";
  if (coupon.endsAt && coupon.endsAt < now) return "This coupon has expired.";
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return "This coupon has reached its usage limit.";
  }
  if (subtotalPaise < coupon.minOrderPaise) {
    return `This coupon needs a minimum order of ₹${Math.round(coupon.minOrderPaise / 100).toLocaleString("en-IN")}.`;
  }
  return null;
}

export function couponDiscount(coupon: CouponLike | null, subtotalPaise: number): number {
  if (!coupon || subtotalPaise <= 0) return 0;
  if (coupon.type === "PERCENT") {
    const raw = Math.round((subtotalPaise * coupon.value) / 100);
    return Math.max(0, Math.min(raw, subtotalPaise));
  }
  return Math.max(0, Math.min(coupon.value, subtotalPaise));
}

/**
 * Server-authoritative totals. The browser never sends prices — only the
 * cart references live in the database and the coupon is re-validated here.
 */
export function computeTotals(
  subtotalPaise: number,
  coupon: CouponLike | null,
  config: PricingConfig
): Totals {
  const problem = couponProblem(coupon, subtotalPaise);
  const usableCoupon = problem ? null : coupon;
  const discountPaise = couponDiscount(usableCoupon, subtotalPaise);
  const discounted = Math.max(0, subtotalPaise - discountPaise);
  const freeShipping =
    subtotalPaise > 0 &&
    config.freeShippingAbovePaise > 0 &&
    subtotalPaise >= config.freeShippingAbovePaise;
  const shippingPaise = subtotalPaise === 0 || freeShipping ? 0 : config.shippingPaise;
  const taxPaise =
    config.gstPercent > 0 ? Math.round((discounted * config.gstPercent) / 100) : 0;

  return {
    subtotalPaise,
    discountPaise,
    shippingPaise,
    taxPaise,
    totalPaise: discounted + shippingPaise + taxPaise,
    freeShipping,
  };
}
