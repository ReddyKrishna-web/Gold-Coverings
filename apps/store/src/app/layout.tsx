import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Jost } from "next/font/google";
import "@uma/brand/tokens.css";
import "./globals.css";
import { BRAND, STORE_URL } from "@uma/brand";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(STORE_URL),
  title: {
    default: `${BRAND.name} — Shop Gold Covering Jewellery Online`,
    template: `%s · ${BRAND.name} Store`,
  },
  description:
    "Shop gold-covering earrings, jhumkas, bangles, necklaces, bridal sets and fancy accessories online. Secure payments, cash on delivery and delivery across India.",
  keywords: [
    "buy gold covering jewellery online",
    "gold plated jewellery India",
    "bridal jewellery online",
    "jhumkas online",
    "imitation jewellery store",
    BRAND.name,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: `${BRAND.name} Store`,
    title: `${BRAND.name} — Shop Gold Covering Jewellery`,
    description: BRAND.description,
    url: STORE_URL,
    images: [{ url: "/images/jewel-5.jpg", width: 1600, height: 1067, alt: BRAND.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Shop Online`,
    description: BRAND.description,
    images: ["/images/jewel-5.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFF9EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className={`${cormorant.variable} ${jost.variable} ${cinzel.variable}`}>
        <a
          href="#store-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--ink)] focus:px-4 focus:py-3 focus:text-sm focus:text-[var(--gold-100)]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
