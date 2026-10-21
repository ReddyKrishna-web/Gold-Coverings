"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@uma/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const reviewSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(2, "Please share your name.").max(60),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  rating: z.coerce.number().int().min(1, "Choose a rating.").max(5),
  title: z.string().trim().max(100).optional(),
  body: z
    .string()
    .trim()
    .min(10, "Please write at least a few words about the piece.")
    .max(800),
});

export async function submitReviewAction(formData: FormData) {
  const limit = rateLimit(`product-review:${requestIp()}`, 3, 10 * 60_000);

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
    email: formData.get("email"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    redirect(`/product/${String(formData.get("slug") ?? "")}?review=invalid#reviews`);
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, slug: true, isActive: true },
  });

  if (!product || !product.isActive) redirect("/shop");

  if (!limit.allowed) {
    redirect(`/product/${product.slug}?review=slow#reviews`);
  }

  const user = await getCurrentUser();

  await prisma.review.create({
    data: {
      productId: product.id,
      userId: user?.role === "CUSTOMER" ? user.id : null,
      name: parsed.data.name,
      email: parsed.data.email ? parsed.data.email.toLowerCase() : null,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
      status: "PENDING",
    },
  });

  revalidatePath(`/product/${product.slug}`);
  redirect(`/product/${product.slug}?review=pending#reviews`);
}
