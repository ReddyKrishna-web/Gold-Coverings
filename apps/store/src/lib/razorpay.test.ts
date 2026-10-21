import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  razorpayConfigured,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "./razorpay";

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

test("payment signatures are verified with the key secret", () => {
  process.env.RAZORPAY_KEY_ID = "rzp_test_demo";
  process.env.RAZORPAY_KEY_SECRET = "test_key_secret";

  const orderId = "order_test_123";
  const paymentId = "pay_test_456";
  const signature = sign(`${orderId}|${paymentId}`, "test_key_secret");

  assert.equal(razorpayConfigured(), true);
  assert.equal(verifyPaymentSignature({ orderId, paymentId, signature }), true);
  assert.equal(
    verifyPaymentSignature({ orderId, paymentId, signature: "0".repeat(64) }),
    false
  );
  assert.equal(
    verifyPaymentSignature({ orderId: "order_other", paymentId, signature }),
    false
  );
});

test("missing configuration never validates a payment", () => {
  delete process.env.RAZORPAY_KEY_SECRET;
  assert.equal(razorpayConfigured(), false);
  assert.equal(
    verifyPaymentSignature({ orderId: "order_x", paymentId: "pay_x", signature: "abc" }),
    false
  );
});

test("webhook signatures use the raw body and webhook secret", () => {
  process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_demo";
  const rawBody = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_test_456" } } },
  });
  const signature = sign(rawBody, "whsec_demo");

  assert.equal(verifyWebhookSignature(rawBody, signature), true);
  assert.equal(verifyWebhookSignature(rawBody, null), false);
  assert.equal(verifyWebhookSignature(`${rawBody} `, signature), false);
  assert.equal(verifyWebhookSignature(rawBody, "f".repeat(64)), false);
});
