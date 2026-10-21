"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Mail,
  MessageSquareQuote,
  Settings,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/coupons", label: "Coupons", Icon: Tags },
  { href: "/admin/enquiries", label: "Enquiries", Icon: Mail },
  { href: "/admin/reviews", label: "Reviews", Icon: MessageSquareQuote },
];

function useAdminLinks(role: string) {
  return role === "OWNER"
    ? [...links, { href: "/admin/settings", label: "Settings", Icon: Settings }]
    : links;
}

export function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = useAdminLinks(role);

  return (
    <nav aria-label="Admin" className="hidden flex-col gap-1 lg:flex">
      {items.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition-colors ${
              active
                ? "border-[var(--gold-700)] bg-[rgba(212,175,55,0.12)] text-[var(--ink)]"
                : "border-transparent text-[rgba(14,11,7,0.62)] hover:bg-[rgba(212,175,55,0.07)] hover:text-[var(--ink)]"
            }`}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = useAdminLinks(role);

  return (
    <nav
      aria-label="Admin sections"
      className="hide-scrollbar flex gap-1 overflow-x-auto border-t border-[rgba(122,90,18,0.16)] px-3 py-2 lg:hidden"
    >
      {items.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 px-3 py-2 text-[0.62rem] uppercase tracking-[0.08em] ${
              active
                ? "bg-[var(--ink)] text-[var(--gold-100)]"
                : "bg-[#fffdf7] text-[rgba(14,11,7,0.62)]"
            }`}
          >
            <Icon size={13} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
