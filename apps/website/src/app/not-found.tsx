import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STORE_URL } from "@uma/brand";
import { Ornament } from "@uma/ui";

export default function NotFound() {
  return (
    <section className="section-dark flex min-h-[80svh] items-center pb-20 pt-32">
      <div className="lux-container text-center">
        <p className="eyebrow text-[var(--gold-300)]">404</p>
        <h1 className="display-hero mt-4 text-[var(--ivory)]">
          A little <span className="italic gold-text">lost.</span>
        </h1>
        <Ornament className="mx-auto mt-6" />
        <p className="mx-auto mt-6 max-w-md text-sm font-light leading-relaxed text-[rgba(255,249,236,0.65)]">
          This page has moved or never existed. The collections, however, are right where you
          left them.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/collections" className="btn-gold">
            Browse collections <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <a href={STORE_URL} className="btn-outline">
            Shop online
          </a>
        </div>
      </div>
    </section>
  );
}
