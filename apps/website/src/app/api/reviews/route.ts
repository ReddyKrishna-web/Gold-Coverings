import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@uma/db";
import { clientKey, cleanText, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { status: "APPROVED", isTestimonial: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, name: true, rating: true, title: true, body: true, createdAt: true },
    });
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("[reviews] Could not load reviews:", error);
    return NextResponse.json({ error: "Reviews are unavailable right now." }, { status: 500 });
  }
}

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional(),
  body: z.string().trim().min(10).max(800),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
});

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "review"), 3, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Please wait a little before submitting another review." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the review." },
      { status: 400 }
    );
  }

  try {
    await prisma.review.create({
      data: {
        name: cleanText(parsed.data.name, 60),
        rating: parsed.data.rating,
        title: parsed.data.title ? cleanText(parsed.data.title, 100) : null,
        body: cleanText(parsed.data.body, 800),
        email: parsed.data.email ? cleanText(parsed.data.email, 160).toLowerCase() : null,
        status: "PENDING",
        isTestimonial: true,
      },
    });

    return NextResponse.json(
      { ok: true, message: "Thank you. Your note will appear after a quick review." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[reviews] Could not save review:", error);
    return NextResponse.json({ error: "Could not submit your review." }, { status: 500 });
  }
}
