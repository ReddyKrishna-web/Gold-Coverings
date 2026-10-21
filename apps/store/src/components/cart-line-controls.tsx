"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { removeCartItemAction, updateCartItemAction } from "@/app/actions/cart";

export function CartLineControls({
  itemId,
  quantity,
  stock,
}: {
  itemId: string;
  quantity: number;
  stock: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function change(next: number) {
    setError("");
    const data = new FormData();
    data.set("itemId", itemId);
    data.set("quantity", String(next));
    startTransition(async () => {
      const result = next <= 0 ? await removeCartItemAction(data) : await updateCartItemAction(data);
      if (!result.ok) setError(result.message);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-[rgba(122,90,18,0.22)]">
          <button
            type="button"
            onClick={() => change(quantity - 1)}
            disabled={pending}
            className="flex h-9 w-8 items-center justify-center hover:bg-[rgba(212,175,55,0.1)] disabled:opacity-40"
            aria-label={`Decrease quantity of item`}
          >
            <Minus size={12} aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-xs" aria-live="polite">
            {pending ? <Loader2 size={12} className="mx-auto animate-spin" aria-hidden="true" /> : quantity}
          </span>
          <button
            type="button"
            onClick={() => change(quantity + 1)}
            disabled={pending || quantity >= stock}
            className="flex h-9 w-8 items-center justify-center hover:bg-[rgba(212,175,55,0.1)] disabled:opacity-40"
            aria-label={`Increase quantity of item`}
          >
            <Plus size={12} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => change(0)}
          disabled={pending}
          className="flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.45)] hover:text-[var(--error)]"
        >
          <Trash2 size={12} aria-hidden="true" /> Remove
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-[0.65rem] text-[var(--error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
