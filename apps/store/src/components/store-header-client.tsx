"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShieldCheck, ShoppingBag, User, X } from "lucide-react";
import { BRAND, STORE_NAV, WEBSITE_URL } from "@uma/brand";

type Props = {
  cartCount: number;
  user: { name: string; role: string } | null;
  announcement: string | null;
};

export function StoreHeaderShell({ cartCount, user, announcement }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isStaff = user?.role === "OWNER" || user?.role === "STAFF";

  return (
    <>
      {announcement ? (
        <div className="bg-[var(--ink)] px-4 py-2 text-center">
          <p className="font-accent text-[0.55rem] uppercase tracking-[0.26em] text-[var(--gold-300)] sm:text-[0.6rem]">
            {announcement}
          </p>
        </div>
      ) : null}

      <header className="header-shell sticky top-0 z-50 border-b border-[rgba(122,90,18,0.18)] bg-[rgba(255,249,236,0.96)] backdrop-blur-md">
        <div className="lux-container flex h-[4.5rem] items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center border border-[rgba(122,90,18,0.25)] text-[var(--ink)] lg:hidden"
            aria-expanded={open}
            aria-controls="store-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND.name} store home`}>
            <span className="flex h-9 w-9 items-center justify-center border border-[rgba(122,90,18,0.4)] font-display text-base text-[var(--gold-900)]">
              {BRAND.monogram}
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl text-[var(--ink)]">{BRAND.name}</span>
              <span className="font-accent text-[7px] uppercase tracking-[0.3em] text-[var(--gold-700)]">
                The Online Store
              </span>
            </span>
          </Link>

          <nav aria-label="Store" className="ml-6 hidden items-center gap-6 lg:flex">
            {STORE_NAV.map((item) => {
              const external = item.href.startsWith("http");
              const active = !external && pathname === item.href;
              return external ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[0.68rem] uppercase tracking-[0.16em] text-[rgba(14,11,7,0.65)] transition-colors hover:text-[var(--gold-900)]"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-[0.68rem] uppercase tracking-[0.16em] transition-colors hover:text-[var(--gold-900)] ${
                    active ? "text-[var(--gold-900)]" : "text-[rgba(14,11,7,0.65)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <form action="/shop" method="get" role="search" className="hidden items-center sm:flex">
              <label htmlFor="header-search" className="sr-only">
                Search products
              </label>
              <input
                id="header-search"
                name="q"
                type="search"
                placeholder="Search jewellery"
                className="w-36 border border-[rgba(122,90,18,0.2)] bg-transparent px-3 py-2 text-xs focus:border-[var(--gold-500)] focus:outline-none md:w-48"
              />
              <button
                type="submit"
                aria-label="Search"
                className="-ml-px flex h-[34px] w-9 items-center justify-center border border-[rgba(122,90,18,0.2)] text-[var(--gold-900)] hover:bg-[rgba(212,175,55,0.12)]"
              >
                <Search size={15} aria-hidden="true" />
              </button>
            </form>

            {isStaff ? (
              <Link
                href="/admin"
                className="hidden items-center gap-1.5 border border-[rgba(122,90,18,0.25)] px-3 py-2 text-[0.6rem] uppercase tracking-[0.14em] text-[var(--gold-900)] hover:bg-[rgba(212,175,55,0.12)] md:flex"
              >
                <ShieldCheck size={13} aria-hidden="true" /> Admin
              </Link>
            ) : null}

            <Link
              href={user ? "/account" : "/login"}
              className="flex h-10 w-10 items-center justify-center text-[rgba(14,11,7,0.7)] hover:text-[var(--gold-900)]"
              aria-label={user ? "Your account" : "Sign in"}
            >
              <User size={19} aria-hidden="true" />
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center text-[rgba(14,11,7,0.7)] hover:text-[var(--gold-900)]"
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            >
              <ShoppingBag size={19} aria-hidden="true" />
              {cartCount > 0 ? <span className="cart-count">{cartCount}</span> : null}
            </Link>
          </div>
        </div>

        <div
          id="store-mobile-nav"
          hidden={!open}
          className="border-t border-[rgba(122,90,18,0.16)] bg-[var(--ivory)] lg:hidden"
        >
          <div className="lux-container py-4">
            <form action="/shop" method="get" role="search" className="mb-4 flex">
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <input
                id="mobile-search"
                name="q"
                type="search"
                placeholder="Search jewellery"
                className="field flex-1"
              />
              <button type="submit" className="btn-dark px-4" aria-label="Search">
                <Search size={16} aria-hidden="true" />
              </button>
            </form>

            <nav aria-label="Mobile store" className="flex flex-col">
              {STORE_NAV.slice(0, 3).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="border-b border-[rgba(122,90,18,0.12)] py-3.5 font-display text-xl text-[var(--ink)]"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`${WEBSITE_URL}/about`}
                className="border-b border-[rgba(122,90,18,0.12)] py-3.5 font-display text-xl text-[var(--ink)]"
              >
                Our Story
              </a>
              <a
                href={`${WEBSITE_URL}/contact`}
                className="border-b border-[rgba(122,90,18,0.12)] py-3.5 font-display text-xl text-[var(--ink)]"
              >
                Visit Us
              </a>
              <Link href="/cart" className="py-3.5 font-display text-xl text-[var(--gold-900)]">
                Cart ({cartCount})
              </Link>
              {user ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Link href="/account" className="text-sm text-[rgba(14,11,7,0.7)]">
                    {user.name}
                  </Link>
                  {isStaff ? (
                    <Link href="/admin" className="btn-outline-ink px-4 py-2">
                      Admin
                    </Link>
                  ) : null}
                </div>
              ) : (
                <Link href="/login" className="btn-gold mt-3">
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
