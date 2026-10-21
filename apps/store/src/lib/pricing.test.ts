import test from "node:test";
import assert from "node:assert/strict";
import { computeTotals, couponProblem, type CouponLike } from "./pricing";

const config = {
  shippingPaise: 9900,
  freeShippingAbovePaise: 149900,
  gstPercent: 0,
};

function coupon(overrides: Partial<CouponLike> = {}): CouponLike {
  return {
    code: "TEST10",
    type: "PERCENT",
    value: 10,
    minOrderPaise: 0,
    isActive: true,
    startsAt: null,
    endsAt: null,
    maxUses: null,
    usedCount: 0,
    ...overrides,
  };
}

test("charges shipping below the free-shipping threshold", () => {
  const totals = computeTotals(50000, null, config);
  assert.equal(totals.discountPaise, 0);
  assert.equal(totals.shippingPaise, 9900);
  assert.equal(totals.totalPaise, 59900);
  assert.equal(totals.freeShipping, false);
});

test("free shipping starts exactly at the threshold", () => {
  const totals = computeTotals(149900, null, config);
  assert.equal(totals.shippingPaise, 0);
  assert.equal(totals.totalPaise, 149900);
  assert.equal(totals.freeShipping, true);
});

test("percentage coupon rounds to paise and is capped at subtotal", () => {
  const totals = computeTotals(199900, coupon({ value: 15 }), config);
  assert.equal(totals.discountPaise, 29985);
  assert.equal(totals.totalPaise, 199900 - 29985);
  const capped = computeTotals(1000, coupon({ value: 100 }), config);
  assert.equal(capped.discountPaise, 1000);
  // The item is free, but the order is still below the free-shipping threshold.
  assert.equal(capped.totalPaise, config.shippingPaise);
});

test("flat coupon cannot exceed the subtotal", () => {
  const totals = computeTotals(30000, coupon({ type: "FLAT", value: 50000 }), config);
  assert.equal(totals.discountPaise, 30000);
});

test("coupon minimum, expiry and usage limits are enforced", () => {
  assert.match(couponProblem(coupon({ minOrderPaise: 100000 }), 50000) ?? "", /minimum order/);
  assert.match(
    couponProblem(coupon({ endsAt: new Date(Date.now() - 1000) }), 50000) ?? "",
    /expired/
  );
  assert.match(couponProblem(coupon({ maxUses: 5, usedCount: 5 }), 50000) ?? "", /usage limit/);
  assert.equal(couponProblem(coupon(), 50000), null);
});

test("an invalid coupon is ignored rather than silently discounted", () => {
  const totals = computeTotals(50000, coupon({ isActive: false }), config);
  assert.equal(totals.discountPaise, 0);
  assert.equal(totals.totalPaise, 59900);
});

test("GST is added on the discounted subtotal when configured", () => {
  const totals = computeTotals(100000, coupon({ value: 10 }), { ...config, gstPercent: 5 });
  assert.equal(totals.discountPaise, 10000);
  assert.equal(totals.shippingPaise, 9900);
  assert.equal(totals.taxPaise, 4500);
  assert.equal(totals.totalPaise, 90000 + 9900 + 4500);
});
