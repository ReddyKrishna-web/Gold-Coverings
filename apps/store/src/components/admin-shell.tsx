import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { BRAND } from "@uma/brand";
import { signOutAction } from "@/app/actions/auth";
import { AdminMobileNav, AdminNav } from "./admin-nav";

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <header className="sticky top-0 z-40 border-b border-[rgba(122,90,18,0.2)] bg-[rgba(255,253,247,0.97)] backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center border border-[rgba(122,90,18,0.4)] font-display text-base text-[var(--gold-900)]">
              {BRAND.monogram}
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg text-[var(--ink)]">{BRAND.name}</span>
              <span className="font-accent text-[7px] uppercase tracking-[0.28em] text-[var(--gold-700)]">
                Store admin
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-[var(--ink)]">{user.name}</p>
              <p className="text-[0.58rem] uppercase tracking-[0.14em] text-[var(--gold-700)]">
                {user.role.toLowerCase()}
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 border border-[rgba(122,90,18,0.24)] px-3 py-2 text-[0.58rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.6)] hover:bg-[rgba(212,175,55,0.1)]"
            >
              <ExternalLink size={12} aria-hidden="true" /> View store
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 border border-[rgba(122,90,18,0.24)] px-3 py-2 text-[0.58rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.6)] hover:bg-[rgba(212,175,55,0.1)]"
              >
                <LogOut size={12} aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-[1500px] px-0 sm:px-6">
          <AdminMobileNav role={user.role} />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-0 px-4 py-6 sm:px-6 lg:grid-cols-[14rem_1fr] lg:gap-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <AdminNav role={user.role} />
            <div className="mt-6 border border-[rgba(122,90,18,0.16)] bg-[#fffdf7] p-3">
              <p className="text-[0.58rem] uppercase tracking-[0.14em] text-[var(--gold-900)]">
                Signed in
              </p>
              <p className="mt-1 truncate text-xs text-[rgba(14,11,7,0.65)]">{user.email}</p>
              <p className="mt-1 text-[0.6rem] text-[rgba(14,11,7,0.4)]">
                {user.role === "OWNER"
                  ? "Full access, including settings and coupons."
                  : "Staff access: orders, products, enquiries and reviews."}
              </p>
            </div>
          </div>
        </aside>
        <main id="store-main" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
