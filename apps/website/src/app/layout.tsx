import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Jost } from "next/font/google";
import "@uma/brand/tokens.css";
import "./globals.css";
import { BRAND, WEBSITE_URL, mapsSearchUrl } from "@uma/brand";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingActions } from "@/components/floating-actions";

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
  metadataBase: new URL(WEBSITE_URL),
  title: {
    default: `${BRAND.name} — Gold Covering Jewellery & Ladies' Fancy Store`,
    template: `%s · ${BRAND.name}`,
  },
  description: `${BRAND.description} Visit our store in ${BRAND.contact.address.city} or shop online.`,
  keywords: [
    "gold covering jewellery",
    "gold plated jewellery",
    "imitation jewellery Hyderabad",
    "bridal jewellery sets",
    "jhumkas",
    "bangles",
    "ladies fancy store",
    BRAND.name,
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    url: WEBSITE_URL,
    images: [
      {
        url: "/images/jewel-5.jpg",
        width: 1600,
        height: 1067,
        alt: `${BRAND.name} gold-covering jewellery`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: ["/images/jewel-5.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0E0B07",
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: BRAND.name,
  description: BRAND.description,
  url: WEBSITE_URL,
  image: `${WEBSITE_URL}/images/jewel-5.jpg`,
  telephone: BRAND.contact.phone,
  email: BRAND.contact.email,
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Cards",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${BRAND.contact.address.line1}, ${BRAND.contact.address.line2}`,
    addressLocality: BRAND.contact.address.city,
    addressRegion: BRAND.contact.address.state,
    postalCode: BRAND.contact.address.pincode,
    addressCountry: "IN",
  },
  hasMap: mapsSearchUrl(),
  openingHours: ["Mo-Sa 10:30-20:30", "Su 11:00-18:00"],
  sameAs: [
    BRAND.contact.socials.instagram,
    BRAND.contact.socials.facebook,
    BRAND.contact.socials.youtube,
  ],
  founder: { "@type": "Person", name: BRAND.owner.name },
  slogan: BRAND.tagline,
  makesOffer: {
    "@type": "Offer",
    itemOffered: { "@type": "Product", name: "Gold covering jewellery" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className={`${cormorant.variable} ${jost.variable} ${cinzel.variable} grain`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--ink)] focus:px-4 focus:py-3 focus:text-sm focus:text-[var(--gold-100)]"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <FloatingActions />
        <script
          type="application/ld+json"
          // Static, trusted configuration — not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
