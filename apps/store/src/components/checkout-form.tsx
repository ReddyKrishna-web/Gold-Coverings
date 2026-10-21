"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Check, Loader2, Lock, MapPin, ShieldCheck } from "lucide-react";
import { BRAND, formatINR } from "@uma/brand";
import { createOrderAction } from "@/app/actions/checkout";
import { loadRazorpay } from "@/lib/razorpay-client";

type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

type Props = {
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  addresses: SavedAddress[];
  totalPaise: number;
  codEnabled: boolean;
  codMaxPaise: number;
  razorpayEnabled: boolean;
  isSignedIn: boolean;
};


export function CheckoutForm({
  defaultName,
  defaultEmail,
  defaultPhone,
  addresses,
  totalPaise,
  codEnabled,
  codMaxPaise,
  razorpayEnabled,
  isSignedIn,
}: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState({
    fullName: defaultName,
    phone: defaultPhone,
    email: defaultEmail,
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [method, setMethod] = useState<"RAZORPAY" | "COD">(razorpayEnabled ? "RAZORPAY" : "COD");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [openingPayment, setOpeningPayment] = useState(false);

  const codAvailable = codEnabled && totalPaise <= codMaxPaise;
  const busy = pending || openingPayment;

  function update(key: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function applySavedAddress(address: SavedAddress) {
    setSelectedAddress(address.id);
    setFields((current) => ({
      ...current,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
  }

  async function openRazorpay(payload: {
    keyId: string;
    orderId: string;
    amountPaise: number;
    name: string;
    description: string;
    prefill: { name: string; email: string; contact: string };
    orderNumber: string;
    token: string;
  }) {
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setOpeningPayment(false);
      setError(
        "The payment window could not load. Check your connection — your order is saved and can be paid from the order page."
      );
      return;
    }

    const instance = new window.Razorpay({
      key: payload.keyId,
      amount: payload.amountPaise,
      currency: "INR",
      name: payload.name,
      description: payload.description,
      order_id: payload.orderId,
      prefill: payload.prefill,
      theme: { color: "#D4AF37" },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const result = (await verify.json()) as { ok?: boolean; error?: string };
          if (!result.ok) throw new Error(result.error ?? "Payment could not be verified.");
          router.push(`/orders/${payload.orderNumber}?t=${payload.token}&paid=1`);
        } catch (verifyError) {
          setError(
            verifyError instanceof Error
              ? verifyError.message
              : "Payment verification failed. Please contact the store with your order number."
          );
          router.push(`/orders/${payload.orderNumber}?t=${payload.token}`);
        }
      },
      modal: {
        ondismiss: () => {
          setOpeningPayment(false);
          router.push(`/orders/${payload.orderNumber}?t=${payload.token}`);
        },
      },
    });

    instance.on("payment.failed", (response) => {
      setOpeningPayment(false);
      setError(response.error?.description ?? "The payment did not go through. You can try again.");
    });

    instance.open();
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;
    setError("");
    const formData = new FormData(formRef.current);
    formData.set("paymentMethod", method);

    startTransition(async () => {
      const result = await createOrderAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.method === "COD") {
        router.push(`/orders/${result.orderNumber}?t=${result.token}`);
        return;
      }

      setOpeningPayment(true);
      await openRazorpay({
        ...result.razorpay,
        orderNumber: result.orderNumber,
        token: result.token,
      });
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-8" noValidate>
      {addresses.length > 0 ? (
        <section>
          <h2 className="field-label">Saved addresses</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => applySavedAddress(address)}
                className={`border p-3 text-left text-xs transition-colors ${
                  selectedAddress === address.id
                    ? "border-[var(--gold-700)] bg-[#fdf6e3]"
                    : "border-[rgba(122,90,18,0.2)] hover:border-[var(--gold-500)]"
                }`}
              >
                <span className="flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.12em] text-[var(--gold-900)]">
                  <MapPin size={11} aria-hidden="true" /> {address.label}
                  {address.isDefault ? " · default" : ""}
                </span>
                <span className="mt-1 block font-medium text-[var(--ink)]">{address.fullName}</span>
                <span className="mt-0.5 block font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
                  {address.line1}, {address.city} {address.pincode}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="field-label">Contact</h2>
        <p className="mb-4 text-xs font-light text-[rgba(14,11,7,0.5)]">
          Order updates are sent here. {isSignedIn ? "" : "You can check out as a guest."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="checkout-email" className="field-label">
              Email *
            </label>
            <input
              id="checkout-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={fields.email}
              onChange={(event) => update("email", event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="checkout-phone" className="field-label">
              Phone *
            </label>
            <input
              id="checkout-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              value={fields.phone}
              onChange={(event) => update("phone", event.target.value)}
              className="field"
              placeholder="+91 …"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="field-label">Delivery address</h2>
        <div className="grid gap-4">
          <div>
            <label htmlFor="checkout-name" className="field-label">
              Full name *
            </label>
            <input
              id="checkout-name"
              name="fullName"
              required
              autoComplete="name"
              value={fields.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="checkout-line1" className="field-label">
              House / flat, street *
            </label>
            <input
              id="checkout-line1"
              name="line1"
              required
              autoComplete="address-line1"
              value={fields.line1}
              onChange={(event) => update("line1", event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="checkout-line2" className="field-label">
              Area / landmark (optional)
            </label>
            <input
              id="checkout-line2"
              name="line2"
              autoComplete="address-line2"
              value={fields.line2}
              onChange={(event) => update("line2", event.target.value)}
              className="field"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="checkout-city" className="field-label">
                City *
              </label>
              <input
                id="checkout-city"
                name="city"
                required
                autoComplete="address-level2"
                value={fields.city}
                onChange={(event) => update("city", event.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="checkout-state" className="field-label">
                State *
              </label>
              <input
                id="checkout-state"
                name="state"
                required
                autoComplete="address-level1"
                value={fields.state}
                onChange={(event) => update("state", event.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="checkout-pincode" className="field-label">
                Pincode *
              </label>
              <input
                id="checkout-pincode"
                name="pincode"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="postal-code"
                value={fields.pincode}
                onChange={(event) => update("pincode", event.target.value.replace(/\D/g, ""))}
                className="field"
              />
            </div>
          </div>
          <div>
            <label htmlFor="checkout-notes" className="field-label">
              Order note (optional)
            </label>
            <textarea
              id="checkout-notes"
              name="notes"
              rows={2}
              maxLength={500}
              value={fields.notes}
              onChange={(event) => update("notes", event.target.value)}
              className="field resize-none"
              placeholder="Gift note, delivery instructions, preferred time…"
            />
          </div>
          {isSignedIn ? (
            <label className="flex items-center gap-2 text-xs font-light text-[rgba(14,11,7,0.6)]">
              <input type="checkbox" name="saveAddress" defaultChecked className="accent-[var(--gold-700)]" />
              Save this address to my account
            </label>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="field-label">Payment</h2>
        <div className="space-y-2">
          <label
            className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
              method === "RAZORPAY"
                ? "border-[var(--gold-700)] bg-[#fdf6e3]"
                : "border-[rgba(122,90,18,0.2)]"
            } ${!razorpayEnabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type="radio"
              name="pay"
              value="RAZORPAY"
              checked={method === "RAZORPAY"}
              disabled={!razorpayEnabled}
              onChange={() => setMethod("RAZORPAY")}
              className="mt-1 accent-[var(--gold-700)]"
            />
            <span>
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
                <Lock size={13} aria-hidden="true" /> Pay online — UPI, cards, netbanking
              </span>
              <span className="mt-1 block text-xs font-light text-[rgba(14,11,7,0.55)]">
                {razorpayEnabled
                  ? "Secured by Razorpay. We never see or store your card details."
                  : "Online payment is not configured for this store yet."}
              </span>
            </span>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
              method === "COD"
                ? "border-[var(--gold-700)] bg-[#fdf6e3]"
                : "border-[rgba(122,90,18,0.2)]"
            } ${!codAvailable ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type="radio"
              name="pay"
              value="COD"
              checked={method === "COD"}
              disabled={!codAvailable}
              onChange={() => setMethod("COD")}
              className="mt-1 accent-[var(--gold-700)]"
            />
            <span>
              <span className="text-sm font-medium text-[var(--ink)]">Cash on delivery</span>
              <span className="mt-1 block text-xs font-light text-[rgba(14,11,7,0.55)]">
                {codEnabled
                  ? `Available on orders up to ${formatINR(codMaxPaise)}. Pay the courier when it arrives.`
                  : "Cash on delivery is currently unavailable."}
              </span>
            </span>
          </label>
        </div>
      </section>

      {error ? (
        <p role="alert" className="border border-[rgba(179,38,30,0.3)] bg-[#fdf2f1] px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </p>
      ) : null}

      <div>
        <button type="submit" disabled={busy} className="btn-gold w-full py-4">
          {busy ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck size={16} aria-hidden="true" />
          )}
          {busy
            ? "Placing your order…"
            : method === "COD"
              ? `Place COD order · ${formatINR(totalPaise)}`
              : `Pay securely · ${formatINR(totalPaise)}`}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.62rem] text-[rgba(14,11,7,0.45)]">
          <Check size={11} aria-hidden="true" /> By ordering you agree to the store&rsquo;s terms and
          returns policy.
        </p>
        <p className="mt-2 text-center text-[0.6rem] text-[rgba(14,11,7,0.4)]">
          Questions? Call {BRAND.contact.phone}
        </p>
      </div>
    </form>
  );
}
