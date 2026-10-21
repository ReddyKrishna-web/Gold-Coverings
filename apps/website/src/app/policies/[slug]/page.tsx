import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { POLICIES } from "@uma/brand";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return POLICIES.map((policy) => ({ slug: policy.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const policy = POLICIES.find((entry) => entry.slug === params.slug);
  if (!policy) return { title: "Policy not found" };
  return {
    title: policy.title,
    description: policy.summary,
    alternates: { canonical: `/policies/${policy.slug}` },
  };
}

export default function PolicyPage({ params }: Params) {
  const policy = POLICIES.find((entry) => entry.slug === params.slug);
  if (!policy) notFound();

  return (
    <section className="bg-[var(--ivory)] pb-20 pt-32">
      <div className="lux-container grid gap-12 lg:grid-cols-[0.32fr_0.68fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-[rgba(14,11,7,0.5)] hover:text-[var(--gold-900)]"
          >
            <ArrowLeft size={13} aria-hidden="true" /> Back home
          </Link>
          <p className="eyebrow mt-6">Policies</p>
          <nav aria-label="Policies" className="mt-4 space-y-1">
            {POLICIES.map((entry) => (
              <Link
                key={entry.slug}
                href={`/policies/${entry.slug}`}
                aria-current={entry.slug === policy.slug ? "page" : undefined}
                className={`block border-l py-2 pl-4 text-sm font-light transition-colors ${
                  entry.slug === policy.slug
                    ? "border-[var(--gold-500)] text-[var(--ink)]"
                    : "border-[rgba(122,90,18,0.18)] text-[rgba(14,11,7,0.55)] hover:text-[var(--gold-900)]"
                }`}
              >
                {entry.title}
              </Link>
            ))}
          </nav>
          <p className="mt-6 text-[0.68rem] leading-relaxed text-[rgba(14,11,7,0.45)]">
            These policies are a starting point for the store owner and their advisor to review.
            Nothing here overrides statutory consumer rights.
          </p>
        </aside>

        <article>
          <p className="eyebrow">Legal &amp; care</p>
          <h1 className="display-lg mt-3 text-[var(--ink)]">{policy.title}</h1>
          <p className="mt-3 text-sm font-light text-[rgba(14,11,7,0.6)]">{policy.summary}</p>
          <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-[rgba(14,11,7,0.4)]">
            Last updated {policy.updated}
          </p>
          <div className="gold-rule mt-6" />
          <div className="policy-prose mt-8 max-w-2xl">
            {policy.sections.map((section) => (
              <section key={section.heading} className="mb-8">
                <h2 className="font-display text-2xl text-[var(--ink)]">{section.heading}</h2>
                <p className="mt-2">{section.body}</p>
              </section>
            ))}
          </div>
          <div className="mt-10 border border-[rgba(212,175,55,0.3)] bg-[#fffdf7] p-6">
            <p className="font-display text-xl text-[var(--ink)]">A question about this policy?</p>
            <p className="mt-1 text-sm font-light text-[rgba(14,11,7,0.6)]">
              Talk to the store before ordering — we would rather answer than have you guess.
            </p>
            <Link href="/contact" className="btn-outline-ink mt-4">
              Contact the store
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
