import { prisma } from "@uma/db";
import { CATEGORIES, type Collection } from "@uma/brand";

export type WebsiteCollection = Collection & { productCount?: number };

export type FeaturedProduct = {
  id: string;
  slug: string;
  name: string;
  pricePaise: number;
  mrpPaise: number | null;
  image: string;
  imageAlt: string;
  categoryName: string;
};

const fallbackCollections: WebsiteCollection[] = CATEGORIES.map((category) => ({
  ...category,
}));

/**
 * The website reads the same catalog the store sells from. If the database is
 * unreachable (for example during a fresh build) the approved brand content is
 * shown instead of failing the whole page — the store itself never degrades
 * like this because it cannot sell without the database.
 */
export async function getCollections(): Promise<WebsiteCollection[]> {
  try {
    const rows = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    if (rows.length === 0) return fallbackCollections;

    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      shortName: row.name.split(" ")[0] ?? row.name,
      description: row.description,
      image: row.imageUrl ?? "/images/jewel-1.jpg",
      imageAlt: row.imageAlt ?? `${row.name} at Uma Fashions`,
      productCount: row._count.products,
    }));
  } catch (error) {
    console.error("[website] Category query failed, using brand fallback:", error);
    return fallbackCollections;
  }
}

export async function getFeaturedProducts(limit = 6): Promise<FeaturedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: { select: { name: true } },
      },
    });

    return products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      pricePaise: product.pricePaise,
      mrpPaise: product.mrpPaise,
      image: product.images[0]?.url ?? "/images/jewel-1.jpg",
      imageAlt: product.images[0]?.alt ?? product.name,
      categoryName: product.category.name,
    }));
  } catch (error) {
    console.error("[website] Featured product query failed:", error);
    return [];
  }
}

export async function getProductsForCollection(slug: string, limit = 12): Promise<FeaturedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, category: { slug } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: { select: { name: true } },
      },
    });

    return products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      pricePaise: product.pricePaise,
      mrpPaise: product.mrpPaise,
      image: product.images[0]?.url ?? "/images/jewel-1.jpg",
      imageAlt: product.images[0]?.alt ?? product.name,
      categoryName: product.category.name,
    }));
  } catch (error) {
    console.error("[website] Collection product query failed:", error);
    return [];
  }
}

export type GalleryItem = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
};

export async function getGallery(limit = 9): Promise<GalleryItem[]> {
  try {
    const rows = await prisma.galleryImage.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      take: limit,
    });
    if (rows.length > 0) return rows;

    return CATEGORIES.map((category, index) => ({
      id: `fallback-${category.slug}`,
      url: category.image,
      alt: category.imageAlt,
      caption: category.name,
    })).slice(0, limit);
  } catch (error) {
    console.error("[website] Gallery query failed:", error);
    return CATEGORIES.slice(0, limit).map((category, index) => ({
      id: `fallback-${index}`,
      url: category.image,
      alt: category.imageAlt,
      caption: category.name,
    }));
  }
}

export type Testimonial = {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
};

const fallbackTestimonials: Testimonial[] = [
  {
    id: "fallback-1",
    name: "Sravani K.",
    rating: 5,
    title: "My wedding set, but affordable",
    body: "I bought the Heritage Bridal Set for my reception and everyone asked where it was from. The finish looks beautiful in photos.",
  },
  {
    id: "fallback-2",
    name: "Divya R.",
    rating: 5,
    title: "Everyday jhumkas",
    body: "The meenakari jhumkas are my new default for work functions. Light, and the gold tone has held up well with care.",
  },
  {
    id: "fallback-3",
    name: "Lakshmi P.",
    rating: 4,
    title: "Lovely gifting",
    body: "Ordered a bangle set for my sister. The packing was neat and the store helped me pick the right size over WhatsApp.",
  },
];

export async function getTestimonials(limit = 3): Promise<Testimonial[]> {
  try {
    const rows = await prisma.review.findMany({
      where: { status: "APPROVED", isTestimonial: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    if (rows.length === 0) return fallbackTestimonials.slice(0, limit);
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      title: row.title,
      body: row.body,
    }));
  } catch (error) {
    console.error("[website] Testimonial query failed:", error);
    return fallbackTestimonials.slice(0, limit);
  }
}
