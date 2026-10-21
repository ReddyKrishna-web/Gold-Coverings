"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatINR } from "@uma/brand";
import { addToCartAction } from "@/app/actions/cart";

type Variant = {
  id: string;
  sku: string;
  size: string | null;
  finish: string | null;
  pricePaise: number;
  stock: number;
};

export function ProductPurchase({
  productName,
  variants,
  pricePaise,
  mrpPaise,
}: {
  productName: string;
  variants: Variant[];
  pricePaise: number;
  mrpPaise: number | null;
}) {
  const inStock = variants.filter((variant) => variant.stock > 0);
  const [selected, setSelected] = useState<string>((inStock[0] ?? variants[0])?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const variant = variants.find((entry) => entry.id === selected);
  const available = variant?.stock ?? 0;
  const busy = pending;

  function submit(mode: "add" | "buy") {
    if (!variant) return;
    const formData = new FormData();
    formData.set("variantId", variant.id);
    formData.set("quantity", String(quantity));

    startTransition(async () => {
      const result = await addToCartAction(formData);
      setMessage(result.message);
      setIsError(!result.ok);
      setAdded(result.ok);
      if (result.ok && mode === "buy") router.push("/checkout");
      if (result.ok && mode === "add") router.refresh();
    });
  }

  if (variants.length === 0) {
    return (
      <div className="border border-[rgba(179,38,30,0.3)] bg-[#fdf2f1] px-4 py-3 text-sm text-[var(--error)]">
        This piece is currently unavailable. Please contact the store.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3">
        <p className="font-display text-3xl text-[var(--ink)]">
          {formatINR(variant?.pricePaise ?? pricePaise)}
        </p>
        {mrpPaise && mrpPaise > (variant?.pricePaise ?? pricePaise) ? (
          <p className="text-sm text-[rgba(14,11,7,0.4)] line-through">{formatINR(mrpPaise)}</p>
        ) : null}
      </div>
      <p className={`text-[0.68rem] uppercase tracking-[0.14em] ${available > 0 ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
        {available > 0 ? `In stock · ${available <= 5 ? `only ${available} left` : "ready to ship"}` : "Sold out"}
      </p>

      <fieldset>
        <legend className="field-label">
          {variants.some((entry) => entry.size) ? "Choose your size" : "Choose an option"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {variants.map((entry) => {
            const label = [entry.size, entry.finish].filter(Boolean).join(" · ") || "One size";
            const disabled = entry.stock <= 0;
            return (
              <label
                key={entry.id}
                className={`cursor-pointer border px-3.5 py-2.5 text-xs transition-colors ${
                  selected === entry.id
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--gold-100)]"
                    : "border-[rgba(122,90,18,0.25)] text-[rgba(14,11,7,0.72)] hover:border-[var(--gold-500)]"
                } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={entry.id}
                  checked={selected === entry.id}
                  disabled={disabled}
                  onChange={() => {
                    setSelected(entry.id);
                    setQuantity(1);
                    setMessage("");
                    setAdded(false);
                  }}
                  className="sr-only"
                />
                {label}
                {disabled ? " (sold out)" : ""}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center border border-[rgba(122,90,18,0.25)]">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1 || busy}
            className="flex h-12 w-10 items-center justify-center text-[var(--ink)] disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="w-9 text-center text-sm" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(available || 1, value + 1))}
            disabled={quantity >= available || busy}
            className="flex h-12 w-10 items-center justify-center text-[var(--ink)] disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => submit("add")}
          disabled={busy || available <= 0}
          className="btn-gold min-w-[9.5rem] flex-1 py-3.5"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <ShoppingBag size={15} aria-hidden="true" />
          )}
          {busy ? "Adding" : "Add to bag"}
        </button>

        <button
          type="button"
          onClick={() => submit("buy")}
          disabled={busy || available <= 0}
          className="btn-dark min-w-[8.5rem] flex-1 py-3.5"
        >
          Buy it now
        </button>
      </div>

      <div aria-live="polite" className="min-h-5">
        {message ? (
          <p className={`flex items-center gap-2 text-xs ${isError ? "text-[var(--error)]" : "text-[var(--success)]"}`}>
            {added ? <Check size={14} aria-hidden="true" /> : null}
            {message}
            {added ? (
              <Link href="/cart" className="underline decoration-[var(--gold-500)] underline-offset-2">
                View bag
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>

      <p className="text-[0.65rem] leading-relaxed text-[rgba(14,11,7,0.45)]">
        {productName} is gold covering / gold plated, not solid gold. Slight colour variation is
        normal. Secure checkout · COD where eligible.
      </p>
    </div>
  );
}
