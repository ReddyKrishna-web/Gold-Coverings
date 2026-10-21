import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay integration kept deliberately small: Orders API + HMAC signature
 * checks. No card data ever passes through this app, and no order is marked
 * paid from a browser callback alone — verification happens server-side and
 * webhooks are processed idempotently.
 */

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function razorpayWebhookConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
}

export function getRazorpayKeyId(): string | null {
  return process.env.RAZORPAY_KEY_ID ?? null;
}

type RazorpayOrder = { id: string; amount: number; currency: string; status: string };

export async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
  orderNumber: string;
}): Promise<RazorpayOrder> {
  if (!razorpayConfigured()) {
    throw new Error("Online payments are not configured.");
  }

  const keyId = process.env.RAZORPAY_KEY_ID as string;
  const keySecret = process.env.RAZORPAY_KEY_SECRET as string;
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: { orderNumber: input.orderNumber },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[razorpay] Order creation failed", response.status, detail.slice(0, 300));
    throw new Error("Could not start the online payment. Please try again or use cash on delivery.");
  }

  return (await response.json()) as RazorpayOrder;
}

function safeEqual(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** `razorpay_signature` = HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return safeEqual(expected, input.signature);
}

/** Webhook signature is computed over the raw request body using the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
