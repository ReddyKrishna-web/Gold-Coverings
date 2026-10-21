import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@uma/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "newsletter"), 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "A few too many attempts. Please try again shortly." },
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
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: parsed.data.email },
    });

    if (!existing) {
      await prisma.newsletterSubscriber.create({ data: { email: parsed.data.email } });
    }

    // Same response either way — does not reveal who is subscribed.
    return NextResponse.json({
      ok: true,
      message: "You are on the list. Look out for our next note.",
    });
  } catch (error) {
    console.error("[newsletter] Could not subscribe:", error);
    return NextResponse.json({ error: "Could not subscribe right now." }, { status: 500 });
  }
}
