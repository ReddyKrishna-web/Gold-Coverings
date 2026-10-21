/**
 * Uma Fashions — shared brand source of truth.
 *
 * Every store detail that appears on BOTH the marketing website and the
 * shopping application lives here. Replace the values marked
 * "TODO(client)" with owner-verified details before launch. Nothing in this
 * file claims solid gold, purity or hallmarking: the store sells gold-covered
 * (gold-plated) jewellery.
 */

export const BRAND = {
  name: "Uma Fashions",
  shortName: "Uma",
  monogram: "UF",
  tagline: "Where Every Shine Tells a Story",
  category: "Gold Covering & Ladies' Fancy Store",
  description:
    "Gold-covering (gold-plated) jewellery and ladies' fancy accessories — earrings, jhumkas, bangles, necklaces, bridal sets and more.",
  // TODO(client): confirm the public business name, logo and owner details.
  owner: {
    name: "Uma Devi",
    role: "Proprietor",
  },
  contact: {
    // TODO(client): replace with the verified store phone number.
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    email: "hello@umafashions.in",
    // TODO(client): replace with the verified shop address.
    address: {
      line1: "Shop No. 12, Gold Arcade",
      line2: "Main Road, Ameerpet",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500016",
      country: "India",
    },
    // TODO(client): confirm opening hours with the owner.
    hours: [
      { days: "Monday – Saturday", time: "10:30 am – 8:30 pm" },
      { days: "Sunday", time: "11:00 am – 6:00 pm" },
    ],
    // TODO(client): replace with verified social profiles.
    socials: {
      instagram: "https://www.instagram.com/",
      facebook: "https://www.facebook.com/",
      youtube: "https://www.youtube.com/",
    },
    // Leave blank unless the owner supplies a real, verified GSTIN.
    gstin: "",
  },
  currency: "INR",
} as const;

export function fullAddress(): string {
  const a = BRAND.contact.address;
  return `${a.line1}, ${a.line2}, ${a.city}, ${a.state} ${a.pincode}, ${a.country}`;
}

export function mapsSearchUrl(): string {
  const a = BRAND.contact.address;
  const query = encodeURIComponent(
    `${BRAND.name}, ${a.line1}, ${a.line2}, ${a.city}, ${a.state} ${a.pincode}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function mapsEmbedUrl(): string {
  const a = BRAND.contact.address;
  const query = encodeURIComponent(`${a.line1}, ${a.line2}, ${a.city}, ${a.state} ${a.pincode}`);
  return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
}

export function telHref(): string {
  return `tel:${BRAND.contact.phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(message?: string): string {
  const number = BRAND.contact.whatsapp.replace(/\D/g, "");
  const text = message ?? `Hello ${BRAND.name}, I would like to know more about your jewellery.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function mailHref(): string {
  return `mailto:${BRAND.contact.email}`;
}

/**
 * Cross-app links are environment driven so the two deployments can be wired
 * together at deploy time (website -> store, store -> website) without code
 * changes. Local defaults match `npm run dev` on ports 3000 / 3001.
 */
export const WEBSITE_URL = (
  process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const STORE_URL = (
  process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

export type NavItem = { label: string; href: string };

export const WEBSITE_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Our Story", href: "/about" },
  { label: "Lookbook", href: "/gallery" },
  { label: "Visit Us", href: "/contact" },
];

export const STORE_NAV: NavItem[] = [
  { label: "Shop All", href: "/shop" },
  { label: "New In", href: "/shop?sort=new" },
  { label: "Bridal", href: "/shop?category=bridal-sets" },
  { label: "Our Story", href: `${WEBSITE_URL}/about` },
  { label: "Visit Us", href: `${WEBSITE_URL}/contact` },
];

export type Collection = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  image: string;
  imageAlt: string;
};

/**
 * Categories actually sold by the store. These are seeded into the database
 * and drive both the website showcase and the storefront catalog.
 */
export const CATEGORIES: Collection[] = [
  {
    slug: "earrings-jhumkas",
    name: "Earrings & Jhumkas",
    shortName: "Earrings",
    description: "Statement jhumkas, studs and chandbalis with a warm gold-covering finish.",
    image: "/images/jewel-1.jpg",
    imageAlt: "A pair of ornate gold-tone earrings on a warm background",
  },
  {
    slug: "nose-pins-studs",
    name: "Nose Pins & Studs",
    shortName: "Nose Pins",
    description: "Delicate everyday pins and studs in traditional and modern shapes.",
    image: "/images/jewel-2.jpg",
    imageAlt: "Fine gold-tone jewellery studs arranged on a soft surface",
  },
  {
    slug: "bangles-bracelets",
    name: "Bangles & Bracelets",
    shortName: "Bangles",
    description: "Classic bangles and layered bracelets for festive and daily wear.",
    image: "/images/jewel-3.jpg",
    imageAlt: "Stacked gold-tone bangles reflecting warm light",
  },
  {
    slug: "necklaces-chains",
    name: "Necklaces & Chains",
    shortName: "Necklaces",
    description: "From fine chains to temple-inspired necklaces, finished in gold covering.",
    image: "/images/jewel-4.jpg",
    imageAlt: "A layered gold-tone necklace displayed on a neutral background",
  },
  {
    slug: "bridal-sets",
    name: "Bridal Sets",
    shortName: "Bridal",
    description: "Coordinated bridal sets — necklace, earrings and maang tikka together.",
    image: "/images/jewel-5.jpg",
    imageAlt: "An ornate bridal jewellery set in warm gold tones",
  },
  {
    slug: "rings",
    name: "Rings",
    shortName: "Rings",
    description: "Everyday bands and cocktail rings with a soft golden glow.",
    image: "/images/jewel-6.jpg",
    imageAlt: "Gold-tone rings styled together on a warm surface",
  },
  {
    slug: "anklets",
    name: "Anklets",
    shortName: "Anklets",
    description: "Lightweight anklets with traditional charms and gentle movement.",
    image: "/images/jewel-7.jpg",
    imageAlt: "A delicate gold-tone anklet with small charms",
  },
  {
    slug: "hair-fancy",
    name: "Hair & Fancy Accessories",
    shortName: "Accessories",
    description: "Maang tikkas, hair pins and finishing touches for every occasion.",
    image: "/images/jewel-8.jpg",
    imageAlt: "Decorative gold-tone hair accessories on a warm background",
  },
];

/** Why choose us — no unsupported claims (no "pure gold", no invented years). */
export const TRUST_POINTS = [
  {
    title: "Gold-covering finish",
    body: "Every piece is described honestly as gold covering / gold plated — never passed off as solid gold.",
    icon: "sparkle",
  },
  {
    title: "Skin-kind comfort",
    body: "Lightweight, comfortable designs selected for long functions and everyday wear.",
    icon: "leaf",
  },
  {
    title: "Fresh, current designs",
    body: "New arrivals across bridal, festive and everyday styles through the season.",
    icon: "gem",
  },
  {
    title: "Thoughtful pricing",
    body: "The look of fine jewellery with pricing that suits real celebrations.",
    icon: "tag",
  },
  {
    title: "Bridal & custom orders",
    body: "Coordinated sets and custom requests — talk to us before your big day.",
    icon: "crown",
  },
  {
    title: "Gift-ready packing",
    body: "Every order is packed with care, ready to be gifted as it arrives.",
    icon: "gift",
  },
];

export const CARE_TIPS = [
  "Keep gold-covering jewellery away from perfume, water, hairspray and cleaning products.",
  "Wear jewellery last when getting ready and remove it first at night.",
  "Wipe gently with a soft, dry cloth after wearing; store each piece separately.",
  "Avoid sleeping, swimming or exercising with your jewellery on.",
  "For bridal sets, store the pieces flat in the pouch provided to protect the finish.",
];

export type Policy = {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  sections: { heading: string; body: string }[];
};

/**
 * Policy copy is a plain-language starting point for the owner and their
 * advisor to review. It deliberately avoids tax, purity and legal guarantees.
 */
export const POLICIES: Policy[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    summary: "What we collect when you browse, enquire or order, and how we look after it.",
    updated: "21 October 2026",
    sections: [
      {
        heading: "Information we collect",
        body: "When you send an enquiry or place an order we collect the details you give us: your name, phone number, email address, delivery address and order details. We do not store card numbers or UPI credentials — payments are handled by our payment provider.",
      },
      {
        heading: "How we use it",
        body: "We use your details to answer enquiries, pack and deliver orders, provide support, and — only if you ask us to — share new arrivals and offers. We do not sell your personal information.",
      },
      {
        heading: "Who we share it with",
        body: "We share the minimum needed with delivery partners, our payment provider and our email service so your order reaches you and messages arrive. They are not permitted to use it for their own marketing.",
      },
      {
        heading: "Keeping and deleting it",
        body: "Order records are kept as long as needed for accounts and after-sales support. You can ask us to correct or delete your personal details by contacting the store; we will act on reasonable requests except where records must be retained for legal reasons.",
      },
      {
        heading: "Cookies",
        body: "The website and store use essential cookies to remember your cart and sign-in session. We do not use advertising trackers.",
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping & Delivery",
    summary: "Where we deliver, how long it takes, and what to check on arrival.",
    updated: "21 October 2026",
    sections: [
      {
        heading: "Where we ship",
        body: "Orders are delivered across India through our delivery partners. If your pincode is not serviceable, we will contact you to arrange an alternative or cancel the order with a full refund.",
      },
      {
        heading: "Dispatch time",
        body: "In-stock pieces are packed within 1–3 working days. Custom and bridal orders may need extra time; we will confirm the timeline with you before dispatch.",
      },
      {
        heading: "Delivery charges",
        body: "Delivery charges are shown at checkout before you pay. Orders above the free-shipping threshold set by the store are delivered free.",
      },
      {
        heading: "On arrival",
        body: "Please open your parcel and check the pieces within 48 hours. If anything is missing, damaged or incorrect, contact the store with your order number and photographs so we can resolve it quickly.",
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    summary: "Our exchange window, eligibility and how to raise a request.",
    updated: "21 October 2026",
    sections: [
      {
        heading: "Exchange window",
        body: "Unworn pieces with their tags and original packing may be exchanged within the window shown at checkout (normally 7 days from delivery). Custom and bridal orders are made for you and are not returnable unless they arrive damaged or incorrect.",
      },
      {
        heading: "Eligibility",
        body: "Pieces must be unused, unaltered and returned with all accessories and packaging. For hygiene reasons, nose pins and hair accessories can only be exchanged if the seal is unbroken or the item arrived defective.",
      },
      {
        heading: "How to request",
        body: "Contact the store with your order number and a short description of the issue. We will confirm eligibility and share return instructions. Please do not ship anything back before we confirm.",
      },
      {
        heading: "Refunds",
        body: "Where a refund is approved, it is made to the original payment method. Cash-on-delivery refunds are arranged by bank transfer. Delivery charges are refunded only when the return is due to our error.",
      },
      {
        heading: "Gold-covering note",
        body: "Our jewellery is gold-covered (gold-plated), not solid gold. Colour and finish can vary slightly between pieces; this is not a defect.",
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Use",
    summary: "The simple rules for using this website and placing an order.",
    updated: "21 October 2026",
    sections: [
      {
        heading: "Product descriptions",
        body: "We describe our pieces as gold-covering or gold-plated jewellery. Nothing on this site should be read as a claim of solid gold, purity or hallmarking.",
      },
      {
        heading: "Prices and availability",
        body: "Prices are in Indian Rupees and may change without notice. Stock is limited; if an item becomes unavailable after you order, we will contact you to offer an exchange or refund.",
      },
      {
        heading: "Orders",
        body: "An order is accepted once we confirm it. We may cancel an order where payment fails, stock is unavailable, the delivery address is not serviceable, or we suspect fraud — any amount paid is refunded.",
      },
      {
        heading: "Care and colour",
        body: "Gold-covering finishes are delicate. Follow the care guide included with your order. Screens display colour differently, so slight variation is possible.",
      },
      {
        heading: "Contact",
        body: "Questions about these terms can be sent to the store using the contact details in the footer.",
      },
    ],
  },
];

/** Money is stored in integer paise everywhere. */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(paise) / 100);
}

export function discountPercent(pricePaise: number, mrpPaise?: number | null): number | null {
  if (!mrpPaise || mrpPaise <= pricePaise) return null;
  return Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100);
}

export function formatVariantLabel(variant: { size?: string | null; finish?: string | null }): string {
  return [variant.size, variant.finish].filter(Boolean).join(" · ") || "One size";
}
