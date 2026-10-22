/**
 * Development seed. Creates the catalog, website content, staff accounts,
 * coupons and a few sample orders so every screen has something to show.
 *
 * Run from the repository root:  npm run db:seed
 * WARNING: this clears the shop tables first. Never run it against production.
 */
import "dotenv/config";
import { PrismaClient, type OrderStatus, type PaymentMethod, type PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = (n: number) => `/images/jewel-${n}.jpg`;

type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  featured?: boolean;
  bestseller?: boolean;
  images: number[];
  description: string;
  variants: { sku: string; size?: string; finish?: string; stock: number }[];
};

const products: SeedProduct[] = [
  {
    slug: "meenakari-jhumka",
    name: "Meenakari Jhumka",
    category: "earrings-jhumkas",
    price: 149900,
    mrp: 249900,
    featured: true,
    bestseller: true,
    images: [1, 4, 7],
    description:
      "A classic dome jhumka finished in warm gold covering, with hand-painted meenakari detailing and a soft pearl drop. Light enough for long functions.",
    variants: [{ sku: "UF-EAR-001", size: "One size", finish: "Gold tone", stock: 18 }],
  },
  {
    slug: "chandbali-drop-earrings",
    name: "Chandbali Drop Earrings",
    category: "earrings-jhumkas",
    price: 129900,
    images: [2, 5, 8],
    description:
      "Crescent chandbali silhouettes with a fine filigree edge and gentle movement. A graceful pick for sarees and lehengas alike.",
    variants: [{ sku: "UF-EAR-002", size: "One size", finish: "Antique gold", stock: 14 }],
  },
  {
    slug: "pearl-cluster-studs",
    name: "Pearl Cluster Studs",
    category: "earrings-jhumkas",
    price: 89900,
    mrp: 119900,
    images: [3, 6, 9],
    description:
      "Small pearl-tone clusters set on a gold-covered base. An easy everyday stud that still feels dressed up.",
    variants: [{ sku: "UF-EAR-003", size: "One size", finish: "Polished gold", stock: 25 }],
  },
  {
    slug: "nose-pin-trio",
    name: "Nose Pin Trio",
    category: "nose-pins-studs",
    price: 39900,
    images: [2, 7, 1],
    description:
      "Three tiny gold-covered nose pins — a plain dot, a flower and a crystal — for switching up your everyday look.",
    variants: [{ sku: "UF-NOS-001", size: "One size", finish: "Gold tone", stock: 40 }],
  },
  {
    slug: "temple-nose-stud",
    name: "Temple Nose Stud",
    category: "nose-pins-studs",
    price: 59900,
    bestseller: true,
    images: [8, 2, 5],
    description:
      "A temple-inspired nose stud with a delicate ruby-tone stone, finished in antique gold covering.",
    variants: [{ sku: "UF-NOS-002", size: "One size", finish: "Antique gold", stock: 22 }],
  },
  {
    slug: "antique-kada-bangle-pair",
    name: "Antique Kada Bangle Pair",
    category: "bangles-bracelets",
    price: 189900,
    mrp: 259900,
    featured: true,
    images: [3, 6, 1],
    description:
      "A matched pair of wide kada bangles with antique gold covering and a subtly textured surface. A bridal-favourite silhouette.",
    variants: [
      { sku: "UF-BAN-001-24", size: "2.4", finish: "Antique gold", stock: 8 },
      { sku: "UF-BAN-001-26", size: "2.6", finish: "Antique gold", stock: 10 },
      { sku: "UF-BAN-001-28", size: "2.8", finish: "Antique gold", stock: 6 },
    ],
  },
  {
    slug: "slim-bangle-set-of-four",
    name: "Slim Bangle Set of Four",
    category: "bangles-bracelets",
    price: 159900,
    bestseller: true,
    images: [6, 3, 9],
    description:
      "Four slim bangles designed to be worn together, with alternating polished and textured gold-covering finishes.",
    variants: [
      { sku: "UF-BAN-002-24", size: "2.4", finish: "Mixed gold", stock: 12 },
      { sku: "UF-BAN-002-26", size: "2.6", finish: "Mixed gold", stock: 16 },
      { sku: "UF-BAN-002-28", size: "2.8", finish: "Mixed gold", stock: 9 },
    ],
  },
  {
    slug: "layered-coin-necklace",
    name: "Layered Coin Necklace",
    category: "necklaces-chains",
    price: 219900,
    mrp: 299900,
    featured: true,
    images: [4, 7, 2],
    description:
      "Two fine gold-covered chains layered with soft coin charms. Wear it over a plain blouse or a festive kurta.",
    variants: [{ sku: "UF-NEC-001", size: "Adjustable", finish: "Polished gold", stock: 11 }],
  },
  {
    slug: "rope-chain-20",
    name: "Rope Chain 20\"",
    category: "necklaces-chains",
    price: 99900,
    images: [5, 8, 3],
    description:
      "A 20-inch rope chain in gold covering with a secure clasp — the simplest way to add warmth to an everyday outfit.",
    variants: [{ sku: "UF-NEC-002", size: "20 inch", finish: "Polished gold", stock: 30 }],
  },
  {
    slug: "heritage-bridal-set",
    name: "Heritage Bridal Set",
    category: "bridal-sets",
    price: 649900,
    mrp: 899900,
    featured: true,
    bestseller: true,
    images: [5, 1, 4],
    description:
      "A coordinated bridal set — long necklace, matching jhumkas and maang tikka — in antique gold covering with stone detailing. Custom colour requests welcome.",
    variants: [{ sku: "UF-BRD-001", size: "Set", finish: "Antique gold", stock: 4 }],
  },
  {
    slug: "polki-style-bridal-set",
    name: "Polki-Style Bridal Set",
    category: "bridal-sets",
    price: 549900,
    images: [7, 2, 6],
    description:
      "A polki-inspired bridal set with uncut-look stones and a soft gold-covering finish, made for reception and muhurtham looks.",
    variants: [{ sku: "UF-BRD-002", size: "Set", finish: "Champagne gold", stock: 3 }],
  },
  {
    slug: "adjustable-cocktail-ring",
    name: "Adjustable Cocktail Ring",
    category: "rings",
    price: 79900,
    images: [7, 9, 1],
    description:
      "A bold stone cocktail ring on an adjustable gold-covered band — one size fits most, no resizing needed.",
    variants: [{ sku: "UF-RIN-001", size: "Adjustable", finish: "Gold tone", stock: 20 }],
  },
  {
    slug: "classic-band-ring",
    name: "Classic Band Ring",
    category: "rings",
    price: 49900,
    mrp: 69900,
    images: [9, 4, 6],
    description:
      "A simple polished band in gold covering, designed for stacking or wearing on its own.",
    variants: [
      { sku: "UF-RIN-002-12", size: "12", finish: "Polished gold", stock: 10 },
      { sku: "UF-RIN-002-14", size: "14", finish: "Polished gold", stock: 12 },
      { sku: "UF-RIN-002-16", size: "16", finish: "Polished gold", stock: 8 },
    ],
  },
  {
    slug: "charm-anklet-pair",
    name: "Charm Anklet Pair",
    category: "anklets",
    price: 69900,
    bestseller: true,
    images: [8, 3, 5],
    description:
      "A lightweight pair of anklets with tiny bell charms that catch the light as you walk.",
    variants: [{ sku: "UF-ANK-001", size: "Adjustable", finish: "Gold tone", stock: 26 }],
  },
  {
    slug: "maang-tikka",
    name: "Maang Tikka",
    category: "hair-fancy",
    price: 99900,
    featured: true,
    images: [1, 7, 2],
    description:
      "A delicate maang tikka with a central stone drop, finished to match our bridal sets.",
    variants: [{ sku: "UF-HAI-001", size: "Adjustable", finish: "Antique gold", stock: 15 }],
  },
  {
    slug: "rhinestone-hair-pin-set",
    name: "Rhinestone Hair Pin Set",
    category: "hair-fancy",
    price: 59900,
    images: [6, 9, 8],
    description:
      "A set of six sparkle hair pins for gajra-style styling, buns and festive updos.",
    variants: [{ sku: "UF-HAI-002", size: "Set of 6", finish: "Gold tone", stock: 34 }],
  },
];

const categories = [
  { slug: "earrings-jhumkas", name: "Earrings & Jhumkas", image: 1, blurb: "Statement jhumkas, studs and chandbalis with a warm gold-covering finish." },
  { slug: "nose-pins-studs", name: "Nose Pins & Studs", image: 2, blurb: "Delicate everyday pins and studs in traditional and modern shapes." },
  { slug: "bangles-bracelets", name: "Bangles & Bracelets", image: 3, blurb: "Classic bangles and layered bracelets for festive and daily wear." },
  { slug: "necklaces-chains", name: "Necklaces & Chains", image: 4, blurb: "From fine chains to temple-inspired necklaces, finished in gold covering." },
  { slug: "bridal-sets", name: "Bridal Sets", image: 5, blurb: "Coordinated bridal sets — necklace, earrings and maang tikka together." },
  { slug: "rings", name: "Rings", image: 6, blurb: "Everyday bands and cocktail rings with a soft golden glow." },
  { slug: "anklets", name: "Anklets", image: 7, blurb: "Lightweight anklets with traditional charms and gentle movement." },
  { slug: "hair-fancy", name: "Hair & Fancy Accessories", image: 8, blurb: "Maang tikkas, hair pins and finishing touches for every occasion." },
];

const gallery = [
  { image: 1, caption: "The bridal edit" },
  { image: 4, caption: "Layered for the season" },
  { image: 7, caption: "Quiet gold, every day" },
  { image: 3, caption: "Bangles that stack" },
  { image: 5, caption: "A set to remember" },
  { image: 8, caption: "Finishing touches" },
  { image: 2, caption: "Small, but noticed" },
  { image: 6, caption: "Rings for every hand" },
  { image: 9, caption: "In the light" },
];

async function main() {
  console.log("Seeding Krishna Jewellers…");
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
    throw new Error("Refusing to seed with NODE_ENV=production. Set ALLOW_PROD_SEED=true only for a fresh demo.");
  }

  // Clear in dependency order.
  await prisma.webhookEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const ownerEmail = process.env.OWNER_EMAIL ?? "owner@umafashions.in";
  const ownerPassword = process.env.OWNER_PASSWORD ?? "UmaDemo@2026";
  const staffEmail = process.env.STAFF_EMAIL ?? "staff@umafashions.in";
  const staffPassword = process.env.STAFF_PASSWORD ?? "StaffDemo@2026";

  const [owner, staff] = await Promise.all([
    prisma.user.create({
      data: {
        email: ownerEmail.toLowerCase(),
        name: "Krishna N.",
        phone: "+919876543210",
        role: "OWNER",
        passwordHash: await bcrypt.hash(ownerPassword, 12),
      },
    }),
    prisma.user.create({
      data: {
        email: staffEmail.toLowerCase(),
        name: "Store Staff",
        role: "STAFF",
        passwordHash: await bcrypt.hash(staffPassword, 12),
      },
    }),
  ]);

  const categoryIds = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const row = await prisma.category.create({
      data: {
        slug: category.slug,
        name: category.name,
        description: category.blurb,
        imageUrl: IMG(category.image),
        imageAlt: `${category.name} — gold covering jewellery at Krishna Jewellers`,
        sortOrder: index,
      },
    });
    categoryIds.set(category.slug, row.id);
  }

  const variantsByProduct = new Map<string, { id: string; price: number }[]>();

  for (const product of products) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Missing category ${product.category}`);

    const created = await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        careInfo:
          "Gold-covered (gold-plated) jewellery. Keep away from perfume and water, wipe with a soft dry cloth and store separately.",
        categoryId,
        sku: product.variants[0]?.sku ?? null,
        pricePaise: product.price,
        mrpPaise: product.mrp ?? null,
        isFeatured: product.featured ?? false,
        isBestseller: product.bestseller ?? false,
        tags: [product.category, "gold covering"],
        searchTerms: `${product.name} ${product.category} gold plated`,
        images: {
          create: product.images.map((image, index) => ({
            url: IMG(image),
            alt: `${product.name} — view ${index + 1}`,
            sortOrder: index,
          })),
        },
        variants: {
          create: product.variants.map((variant) => ({
            sku: variant.sku,
            size: variant.size,
            finish: variant.finish,
            pricePaise: product.price,
            stock: variant.stock,
          })),
        },
      },
      include: { variants: true },
    });

    variantsByProduct.set(
      created.slug,
      created.variants.map((v) => ({ id: v.id, price: v.pricePaise }))
    );

    for (const variant of created.variants) {
      await prisma.inventoryMovement.create({
        data: {
          variantId: variant.id,
          delta: variant.stock,
          reason: "RESTOCK",
          note: "Opening stock (seed)",
          actorId: owner.id,
        },
      });
    }
  }

  for (const [index, item] of gallery.entries()) {
    await prisma.galleryImage.create({
      data: {
        url: IMG(item.image),
        alt: `${item.caption} — Krishna Jewellers lookbook`,
        caption: item.caption,
        sortOrder: index,
      },
    });
  }

  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: {
      codEnabled: true,
      codMaxPaise: 500000,
      shippingPaise: 9900,
      freeShippingAbovePaise: 149900,
      gstPercent: 0,
      returnWindowDays: 7,
      announcement: "Festive edit is here · Free shipping above ₹1,499",
    },
    create: {
      id: 1,
      codEnabled: true,
      codMaxPaise: 500000,
      shippingPaise: 9900,
      freeShippingAbovePaise: 149900,
      gstPercent: 0,
      returnWindowDays: 7,
      announcement: "Festive edit is here · Free shipping above ₹1,499",
    },
  });

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "10% off your first order",
        type: "PERCENT",
        value: 10,
        minOrderPaise: 99900,
        maxUses: 200,
        isActive: true,
      },
      {
        code: "FESTIVE500",
        description: "₹500 off festive orders above ₹2,999",
        type: "FLAT",
        value: 50000,
        minOrderPaise: 299900,
        maxUses: 100,
        isActive: true,
      },
      {
        code: "BRIDAL15",
        description: "15% off bridal sets above ₹5,000",
        type: "PERCENT",
        value: 15,
        minOrderPaise: 500000,
        maxUses: 50,
        isActive: true,
      },
    ],
  });

  const testimonialData = [
    {
      name: "Sravani K.",
      rating: 5,
      title: "My wedding set, but affordable",
      body: "I bought the Heritage Bridal Set for my reception and everyone asked where it was from. The finish looks beautiful in photos and it stayed comfortable all evening.",
    },
    {
      name: "Divya R.",
      rating: 5,
      title: "Everyday jhumkas",
      body: "The meenakari jhumkas are my new default for work functions. Light, and the gold tone has held up well with regular care.",
    },
    {
      name: "Lakshmi P.",
      rating: 4,
      title: "Lovely gifting",
      body: "Ordered a bangle set for my sister. The packing was neat and the store helped me pick the right size over WhatsApp.",
    },
    {
      name: "Anusha M.",
      rating: 5,
      title: "Great for festive shopping",
      body: "Wide range of designs and honest about the gold covering. Much easier than hunting through a mall for one evening's jewellery.",
    },
  ];

  for (const testimonial of testimonialData) {
    await prisma.review.create({
      data: {
        name: testimonial.name,
        rating: testimonial.rating,
        title: testimonial.title,
        body: testimonial.body,
        status: "APPROVED",
        isTestimonial: true,
      },
    });
  }

  // One pending product review so moderation is visible in the admin.
  await prisma.review.create({
    data: {
      productId: (await prisma.product.findUniqueOrThrow({ where: { slug: "meenakari-jhumka" } })).id,
      name: "Priya S.",
      rating: 5,
      title: "Beautiful finish",
      body: "Wore these for a family function and got so many compliments. Would love more colours.",
      status: "PENDING",
    },
  });

  await prisma.enquiry.createMany({
    data: [
      {
        name: "Rajeswari",
        phone: "+919876500011",
        email: "rajeswari@example.com",
        interest: "Bridal Sets",
        message: "Looking for a bridal set in antique gold for a December wedding. Can I visit the store this weekend?",
        status: "NEW",
      },
      {
        name: "Harika",
        phone: "+919876500022",
        interest: "Bangles",
        message: "Do you have the slim bangle set in size 2.4? Please share the price.",
        status: "HANDLED",
        handledAt: new Date(),
      },
    ],
  });

  await prisma.newsletterSubscriber.createMany({
    data: [{ email: "updates@example.com" }],
  });

  // --- sample orders -------------------------------------------------------
  const address = {
    fullName: "Sravani Kolli",
    phone: "+919876500033",
    line1: "Flat 402, Lotus Residency",
    line2: "Road No. 3, Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500034",
    country: "India",
  };

  async function makeOrder(opts: {
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    daysAgo: number;
    lines: { slug: string; qty: number }[];
    discount?: number;
  }) {
    const lines = [];
    let subtotal = 0;
    for (const line of opts.lines) {
      const product = await prisma.product.findUniqueOrThrow({
        where: { slug: line.slug },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: true },
      });
      const variant = product.variants[0];
      const lineTotal = variant.pricePaise * line.qty;
      subtotal += lineTotal;
      lines.push({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        sku: variant.sku,
        variantLabel: [variant.size, variant.finish].filter(Boolean).join(" · ") || "One size",
        imageUrl: product.images[0]?.url ?? null,
        unitPricePaise: variant.pricePaise,
        quantity: line.qty,
        lineTotalPaise: lineTotal,
      });
    }
    const discount = opts.discount ?? 0;
    const shipping = subtotal - discount >= 149900 ? 0 : 9900;
    const total = subtotal - discount + shipping;
    const createdAt = new Date(Date.now() - opts.daysAgo * 86400000);

    const order = await prisma.order.create({
      data: {
        orderNumber: opts.orderNumber,
        customerName: address.fullName,
        email: "sravani@example.com",
        phone: address.phone,
        shippingAddress: address,
        subtotalPaise: subtotal,
        discountPaise: discount,
        shippingPaise: shipping,
        taxPaise: 0,
        totalPaise: total,
        status: opts.status,
        paymentStatus: opts.paymentStatus,
        paymentMethod: opts.paymentMethod,
        couponCode: discount ? "WELCOME10" : null,
        createdAt,
        items: { create: lines },
        history: {
          create: [
            { status: "PENDING_PAYMENT", note: "Order created", createdAt },
            ...(opts.status !== "PENDING_PAYMENT"
              ? [{ status: "CONFIRMED" as OrderStatus, note: "Payment confirmed", createdAt: new Date(createdAt.getTime() + 60000) }]
              : []),
            ...(["PACKED", "SHIPPED", "DELIVERED"].includes(opts.status)
              ? [{ status: opts.status, note: "Fulfilment updated", createdAt: new Date(createdAt.getTime() + 86400000) }]
              : []),
          ],
        },
      },
    });
    return order;
  }

  const order1 = await makeOrder({
    orderNumber: "UF-100001",
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "RAZORPAY",
    daysAgo: 12,
    lines: [{ slug: "meenakari-jhumka", qty: 1 }, { slug: "pearl-cluster-studs", qty: 1 }],
    discount: 23980,
  });

  const order2 = await makeOrder({
    orderNumber: "UF-100002",
    status: "CONFIRMED",
    paymentStatus: "COD_PENDING",
    paymentMethod: "COD",
    daysAgo: 2,
    lines: [{ slug: "slim-bangle-set-of-four", qty: 1 }],
  });

  await makeOrder({
    orderNumber: "UF-100003",
    status: "SHIPPED",
    paymentStatus: "PAID",
    paymentMethod: "RAZORPAY",
    daysAgo: 1,
    lines: [{ slug: "heritage-bridal-set", qty: 1 }],
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      provider: "razorpay",
      providerOrderId: "order_seed_demo_1",
      providerPaymentId: "pay_seed_demo_1",
      amountPaise: order1.totalPaise,
      status: "PAID",
      method: "RAZORPAY",
      raw: { seeded: true },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      provider: "cod",
      amountPaise: order2.totalPaise,
      status: "COD_PENDING",
      method: "COD",
    },
  });

  console.log("Seed complete.");
  console.log(`  Owner login: ${ownerEmail} / ${ownerPassword}  (role OWNER)`);
  console.log(`  Staff login: ${staffEmail} / ${staffPassword}  (role STAFF)`);
  console.log(`  Products: ${products.length}, categories: ${categories.length}, staff id: ${staff.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
