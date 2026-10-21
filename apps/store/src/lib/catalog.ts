import { prisma, type Prisma } from "@uma/db";

export const productCardInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 2 },
  category: { select: { name: true, slug: true } },
  variants: { where: { isActive: true }, select: { stock: true, pricePaise: true } },
} satisfies Prisma.ProductInclude;

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

export function totalStock(product: ProductCardData): number {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export async function getNewArrivals(limit = 4) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: productCardInclude,
  });
}

export async function getBestsellers(limit = 4) {
  return prisma.product.findMany({
    where: { isActive: true, isBestseller: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: productCardInclude,
  });
}

export async function getNavCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export type ShopQuery = {
  q?: string;
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
  inStock?: string;
  page?: string;
};

export const SHOP_PAGE_SIZE = 12;

export async function getShopProducts(query: ShopQuery) {
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const minPaise = query.min ? Math.max(0, Number.parseFloat(query.min) * 100) : undefined;
  const maxPaise = query.max ? Math.max(0, Number.parseFloat(query.max) * 100) : undefined;
  const search = query.q?.trim().slice(0, 80);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.inStock === "1" ? { variants: { some: { isActive: true, stock: { gt: 0 } } } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { searchTerms: { contains: search, mode: "insensitive" } },
            { category: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(minPaise !== undefined || maxPaise !== undefined
      ? {
          pricePaise: {
            ...(minPaise !== undefined ? { gte: Math.round(minPaise) } : {}),
            ...(maxPaise !== undefined ? { lte: Math.round(maxPaise) } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "price-asc"
      ? [{ pricePaise: "asc" }]
      : query.sort === "price-desc"
        ? [{ pricePaise: "desc" }]
        : query.sort === "popular"
          ? [{ isBestseller: "desc" }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }];

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * SHOP_PAGE_SIZE,
      take: SHOP_PAGE_SIZE,
      include: productCardInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / SHOP_PAGE_SIZE)),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { pricePaise: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, name: true, rating: true, title: true, body: true, createdAt: true },
      },
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: excludeId } },
    orderBy: { isBestseller: "desc" },
    take: limit,
    include: productCardInclude,
  });
}
