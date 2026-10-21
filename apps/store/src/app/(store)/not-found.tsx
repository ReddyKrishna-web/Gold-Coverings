import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function StoreNotFound() {
  return (
    <section className="lux-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display-lg mt-3 text-[var(--ink)]">This piece has moved on.</h1>
      <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
        The page you were looking for is not here. The rest of the collection is still waiting.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-gold">
          Shop all jewellery <ArrowRight size={14} aria-hidden="true" />
        </Link>
        <Link href="/" className="btn-outline-ink">
          Store home
        </Link>
      </div>
    </section>
  );
}
