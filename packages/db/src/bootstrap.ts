/**
 * Production bootstrap. Unlike the demo seed, this does NOT create sample
 * products or orders. It creates the store settings row, the owner account and
 * the real category list so the owner can start adding products in the admin.
 *
 * Run once after migrations:   npm run db:bootstrap
 * Requires OWNER_EMAIL and OWNER_PASSWORD in the environment.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES } from "@uma/brand";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error(
      "Set OWNER_EMAIL and a strong OWNER_PASSWORD (12+ characters) before bootstrapping."
    );
  }

  const existingOwner = await prisma.user.findUnique({ where: { email } });
  if (existingOwner) {
    console.log(`Owner account already exists for ${email} — leaving the password untouched.`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name: process.env.OWNER_NAME ?? "Store Owner",
        phone: process.env.OWNER_PHONE ?? null,
        role: "OWNER",
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    console.log(`Created owner account: ${email}`);
  }

  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      codEnabled: true,
      codMaxPaise: 500000,
      shippingPaise: 9900,
      freeShippingAbovePaise: 149900,
      gstPercent: 0,
      returnWindowDays: 7,
      announcement: "Free shipping above ₹1,499",
    },
  });
  console.log("Store settings ready.");

  for (const [index, category] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        imageUrl: category.image,
        imageAlt: category.imageAlt,
        sortOrder: index,
      },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        imageUrl: category.image,
        imageAlt: category.imageAlt,
        sortOrder: index,
      },
    });
  }
  console.log(`Category list ready (${CATEGORIES.length} collections).`);

  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    await prisma.galleryImage.createMany({
      data: CATEGORIES.slice(0, 8).map((category, index) => ({
        url: category.image,
        alt: category.imageAlt,
        caption: category.name,
        sortOrder: index,
      })),
    });
    console.log("Seeded the initial lookbook from approved brand images.");
  }

  console.log("\nBootstrap complete. Sign in at /login with the owner account, then:");
  console.log("  1. Change the owner password flow / rotate credentials as agreed.");
  console.log("  2. Add products with real photos, prices and stock.");
  console.log("  3. Replace the demo phone/address/social values in packages/brand/src/index.ts.");
  console.log("  4. Set Razorpay keys and register the webhook before enabling online payment.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
