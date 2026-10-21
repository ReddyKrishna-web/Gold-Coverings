import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { STORE_URL } from "@uma/brand";
import { Reveal } from "@uma/ui";
import { GalleryGrid } from "@/components/gallery-grid";
import { getGallery } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lookbook",
  description:
    "A visual lookbook of gold-covering jewellery from Uma Fashions — bridal sets, jhumkas, bangles and everyday pieces.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const images = await getGallery(12);

  return (
    <>
      <section className="section-dark pb-14 pt-36">
        <div className="lux-container">
          <p className="eyebrow text-[var(--gold-300)]">The lookbook</p>
          <h1 className="display-hero mt-4 max-w-3xl text-[var(--ivory)]">
            Seen in <span className="italic gold-text">the light.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[0.98rem] font-light leading-relaxed text-[rgba(255,249,236,0.68)]">
            A closer look at pieces from the store — the finishes, the details and the way they
            catch the light. Tap any image to open it.
          </p>
        </div>
      </section>

      <section className="section-pad bg-[var(--ivory)]">
        <div className="lux-container">
          <Reveal>
            <GalleryGrid images={images} />
          </Reveal>

          <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-[rgba(212,175,55,0.28)] pt-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-2xl text-[var(--ink)]">
                Like something you see?
              </p>
              <p className="mt-1 text-sm font-light text-[rgba(14,11,7,0.6)]">
                Most pieces are one-of-a-kind or limited. Ask before it goes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-outline-ink">
                Ask the store
              </Link>
              <a href={STORE_URL} className="btn-gold">
                Shop online <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
