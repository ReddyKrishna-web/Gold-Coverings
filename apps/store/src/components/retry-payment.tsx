"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { retryPaymentAction } from "@/app/actions/payments";
import { loadRazorpay } from "@/lib/razorpay-client";

export function RetryPayment({
  orderNumber,
  token,
  amountPaise,
}: {
  orderNumber: string;
  token: string;
  amountPaise: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

  function retry() {
    setError("");
    const formData = new FormData();
    formData.set("orderNumber", orderNumber);
    formData.set("token", token);

    startTransition(async () => {
      const result = await retryPaymentAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpening(true);
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        setOpening(false);
        setError("The payment window could not load. Please check your connection and try again.");
        return;
      }

      const instance = new window.Razorpay({
        key: result.razorpay.keyId,
        amount: amountPaise,
        currency: "INR",
        name: "Uma Fashions",
        description: result.razorpay.description,
        order_id: result.razorpay.orderId,
        theme: { color: "#D4AF37" },
        handler: async (response: {
          razorpay_payment_id?: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) => {
          if (
            !response.razorpay_payment_id ||
            !response.razorpay_order_id ||
            !response.razorpay_signature
          ) {
            setError("The payment response was incomplete. Please contact the store.");
            setOpening(false);
            return;
          }

          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const payload = (await verify.json()) as { ok?: boolean; error?: string };
          if (!payload.ok) {
            setError(payload.error ?? "Payment could not be verified.");
            setOpening(false);
            return;
          }
          router.push(`/orders/${orderNumber}?t=${token}&paid=1`);
        },
        modal: {
          ondismiss: () => {
            setOpening(false);
            setError("Payment window closed. Your order is still awaiting payment.");
          },
        },
      });

      instance.on("payment.failed", (response) => {
        setOpening(false);
        setError(response.error?.description ?? "The payment did not go through. You can try again.");
      });

      instance.open();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={retry}
        disabled={pending || opening}
        className="btn-gold px-6 py-3"
      >
        {pending || opening ? (
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw size={15} aria-hidden="true" />
        )}
        {opening ? "Opening payment…" : "Pay now"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 max-w-sm text-xs text-[var(--error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
