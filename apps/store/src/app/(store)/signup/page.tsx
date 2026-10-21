import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { BRAND } from "@uma/brand";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default function SignupPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <section className="lux-container grid min-h-[70vh] items-center gap-10 py-12 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-sm">
        <p className="eyebrow">Join the house</p>
        <h1 className="display-lg mt-3 text-[var(--ink)]">Create an account</h1>
        <p className="mt-2 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
          Save addresses, follow your orders and keep your wish list in one place. It takes a
          minute.
        </p>
        <div className="mt-7">
          <AuthForm mode="signup" next={searchParams.next} />
        </div>
        <p className="mt-5 text-xs text-[rgba(14,11,7,0.55)]">
          Already have an account?{" "}
          <Link
            href={`/login${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`}
            className="text-[var(--gold-900)] underline decoration-[var(--gold-500)] underline-offset-2"
          >
            Sign in
          </Link>
        </p>
        <p className="mt-4 text-[0.65rem] leading-relaxed text-[rgba(14,11,7,0.4)]">
          By creating an account you agree to the store&rsquo;s terms and privacy policy. We only
          keep the details needed to process and deliver your orders. {BRAND.name} is a
          gold-covering jewellery store.
        </p>
      </div>

      <div className="relative hidden aspect-[4/5] overflow-hidden border border-[rgba(122,90,18,0.2)] lg:block">
        <Image
          src="/images/jewel-1.jpg"
          alt="Gold-covering jhumkas from the collection"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,11,7,0.6)] to-transparent" />
        <p className="absolute bottom-6 left-6 right-6 font-display text-2xl italic text-[var(--ivory)]">
          “{BRAND.tagline}”
        </p>
      </div>
    </section>
  );
}
