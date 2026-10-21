import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { STORE_URL } from "@uma/brand";
import { Reveal, SectionHeading } from "@uma/ui";
import { CollectionCard } from "@/components/cards";
import { getCollections } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse gold-covering earrings, nose pins, bangles, necklaces, bridal sets, rings, anklets and hair accessories at Uma Fashions.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <>
      <section className="section-dark pb-14 pt-36">
        <div className="lux-container">
          <p className="eyebrow text-[var(--gold-300)]">The collections</p>
          <h1 className="display-hero mt-4 max-w-3xl text-[var(--ivory)]">
            Gold covering, <span className="italic gold-text">curated.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[0.98rem] font-light leading-relaxed text-[rgba(255,249,236,0.68)]">
            Eight edits across bridal, festive and everyday jewellery. Every piece is gold
            covering / gold plated — chosen for finish, comfort and how it photographs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={STORE_URL} className="btn-gold">
              Shop online <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <Link href="/contact" className="btn-outline">
              Book a store visit
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--ivory)]">
        <div className="lux-container">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {collections.map((collection, index) => (
              <Reveal key={collection.slug} delay={(index % 4) * 60}>
                <CollectionCard collection={collection} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="lux-container">
          <div className="border border-[rgba(212,175,55,0.3)] bg-[#fffdf7] p-8 text-center sm:p-12">
            <SectionHeading
              eyebrow="Not sure where to start?"
              title={
                <>
                  Tell us the <span className="italic gold-text">occasion.</span>
                </>
              }
              description="A wedding, a festival, a first day at work — we will shortlist pieces that suit the moment and your budget."
            />
            <Link href="/contact" className="btn-outline-ink mt-7">
              Ask the store <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
