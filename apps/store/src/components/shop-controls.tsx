"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-[rgba(14,11,7,0.55)]">
      <span className="sr-only sm:not-sr-only">Sort</span>
      <select
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", event.target.value);
          params.delete("page");
          router.push(`/shop?${params.toString()}`);
        }}
        className="border border-[rgba(122,90,18,0.24)] bg-[#fffdf8] px-2.5 py-2 text-xs text-[var(--ink)] focus:border-[var(--gold-500)] focus:outline-none"
      >
        <option value="new">Newest</option>
        <option value="popular">Most loved</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </label>
  );
}

export function MobileFilterSummary({ count }: { count: number }) {
  return (
    <summary className="flex cursor-pointer list-none items-center gap-2 border border-[rgba(122,90,18,0.24)] px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--gold-900)] lg:hidden">
      <SlidersHorizontal size={14} aria-hidden="true" />
      Filters{count > 0 ? ` (${count})` : ""}
    </summary>
  );
}
