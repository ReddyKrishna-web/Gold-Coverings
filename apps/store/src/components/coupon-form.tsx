"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { applyCouponAction, removeCouponAction } from "@/app/actions/cart";

export function CouponForm({ appliedCode }: { appliedCode: string | null }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData();
    data.set("code", code);
    setMessage("");
    startTransition(async () => {
      const result = await applyCouponAction(data);
      setMessage(result.message);
      if (result.ok) setCode("");
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeCouponAction();
      setMessage(result.message);
      router.refresh();
    });
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-3 border border-[rgba(46,125,50,0.3)] bg-[#eef7ee] px-3 py-2.5">
        <p className="flex items-center gap-2 text-xs text-[var(--success)]">
          <Tag size={13} aria-hidden="true" /> {appliedCode} applied
        </p>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="flex items-center gap-1 text-[0.58rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.5)] hover:text-[var(--error)]"
        >
          {pending ? <Loader2 size={11} className="animate-spin" aria-hidden="true" /> : <X size={11} aria-hidden="true" />}
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={apply} className="space-y-2">
      <label htmlFor="coupon-code" className="field-label">
        Coupon code
      </label>
      <div className="flex">
        <input
          id="coupon-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="WELCOME10"
          className="field flex-1 py-2.5 text-sm uppercase"
          maxLength={40}
        />
        <button type="submit" disabled={pending || !code} className="btn-dark px-4 py-2.5 disabled:opacity-50">
          {pending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : "Apply"}
        </button>
      </div>
      {message ? (
        <p role="status" className="text-[0.68rem] text-[var(--error)]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
