"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { BRAND, STORE_URL, WEBSITE_NAV } from "@uma/brand";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled || !isHome || open;

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 ${
        solid
          ? "border-b border-[rgba(212,175,55,0.22)] bg-[rgba(14,11,7,0.94)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="lux-container flex h-20 items-center justify-between gap-4">
        <Link href="/" aria-label={`${BRAND.name} home`} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center border border-[rgba(212,175,55,0.5)] font-display text-lg tracking-wide gold-text">
            {BRAND.monogram}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-xl text-[var(--ivory)] sm:text-2xl">{BRAND.name}</span>
            <span className="font-accent text-[8px] uppercase tracking-[0.3em] text-[var(--gold-300)] sm:text-[9px]">
              Gold Covering Jewellery
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {WEBSITE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={pathname === item.href}
              className="nav-link text-[0.7rem] uppercase tracking-[0.2em] text-[rgba(255,249,236,0.82)] transition-colors hover:text-[var(--gold-300)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={STORE_URL}
            className="group inline-flex items-center gap-2 border border-[rgba(212,175,55,0.45)] px-4 py-2.5 text-[0.66rem] uppercase tracking-[0.2em] text-[var(--gold-100)] transition-all hover:bg-[rgba(212,175,55,0.14)]"
          >
            <ShoppingBag size={13} aria-hidden="true" />
            Shop Online
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex h-11 w-11 items-center justify-center border border-[rgba(212,175,55,0.45)] text-[var(--gold-100)] lg:hidden"
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-[rgba(212,175,55,0.18)] bg-[rgba(14,11,7,0.98)] backdrop-blur-md lg:hidden"
      >
        <nav aria-label="Mobile" className="lux-container flex flex-col py-4">
          {WEBSITE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b border-[rgba(212,175,55,0.12)] py-4 font-display text-2xl text-[var(--ivory)]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={STORE_URL}
            className="btn-gold mt-5 w-full"
            aria-label="Shop online at the Krishna Jewellers store"
          >
            <ShoppingBag size={14} aria-hidden="true" /> Shop Online
          </a>
          <a
            href={`tel:${BRAND.contact.phone.replace(/[^\d+]/g, "")}`}
            className="mt-4 pb-2 text-center text-xs uppercase tracking-[0.2em] text-[rgba(255,249,236,0.7)]"
          >
            Call {BRAND.contact.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
