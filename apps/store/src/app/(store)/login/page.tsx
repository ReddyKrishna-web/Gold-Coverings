import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { BRAND } from "@uma/brand";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <section className="lux-container grid min-h-[70vh] items-center gap-10 py-12 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-sm">
        <p className="eyebrow">Welcome back</p>
        <h1 className="display-lg mt-3 text-[var(--ink)]">Sign in</h1>
        <p className="mt-2 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
          View your orders, keep addresses handy and check out faster. Your guest bag will be
          carried over.
        </p>
        <div className="mt-7">
          <AuthForm mode="login" next={searchParams.next} />
        </div>
        <p className="mt-5 text-xs text-[rgba(14,11,7,0.55)]">
          New here?{" "}
          <Link
            href={`/signup${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`}
            className="text-[var(--gold-900)] underline decoration-[var(--gold-500)] underline-offset-2"
          >
            Create an account
          </Link>
        </p>
        <p className="mt-4 text-[0.65rem] leading-relaxed text-[rgba(14,11,7,0.4)]">
          Trouble signing in? Contact the store at {BRAND.contact.phone}. We never ask for your
          password over the phone.
        </p>
      </div>

      <div className="relative hidden aspect-[4/5] overflow-hidden border border-[rgba(122,90,18,0.2)] lg:block">
        <Image
          src="/images/jewel-4.jpg"
          alt="Layered gold-covering necklaces"
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
