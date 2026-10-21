import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@uma/db";
import { BRAND } from "@uma/brand";
import { clientKey, cleanText, rateLimit } from "@/lib/rate-limit";
import { escapeHtml, sendMail } from "@/lib/notify";

export const dynamic = "force-dynamic";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please share your name.").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{7,16}$/, "Please enter a valid phone number."),
  email: z.union([z.string().trim().email("Please enter a valid email."), z.literal("")]).optional(),
  interest: z.string().trim().max(80).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail (at least 10 characters).")
    .max(1200),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree to be contacted." }) }),
  company: z.string().optional(),
});

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "enquiry"), 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many enquiries. Please wait a minute or call the store." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 }
    );
  }

  // Honeypot filled → silently accept so bots don't learn anything.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true, message: "Thank you." }, { status: 201 });
  }

  const { name, phone, email, interest, message } = parsed.data;

  try {
    const enquiry = await prisma.enquiry.create({
      data: {
        name: cleanText(name, 80),
        phone: cleanText(phone, 16),
        email: email ? cleanText(email, 160).toLowerCase() : null,
        interest: interest ? cleanText(interest, 80) : null,
        message: cleanText(message, 1200),
        source: "website",
      },
    });

    const ownerEmail = process.env.OWNER_EMAIL ?? BRAND.contact.email;
    await sendMail({
      to: ownerEmail,
      subject: `New website enquiry — ${enquiry.name}`,
      replyTo: enquiry.email ?? undefined,
      html: `
        <div style="font-family:Georgia,serif;color:#0E0B07;max-width:560px">
          <h2 style="font-size:20px;margin:0 0 4px">New website enquiry</h2>
          <p style="color:#7A5A12;margin:0 0 20px">${escapeHtml(BRAND.name)}</p>
          <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${escapeHtml(enquiry.name)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${escapeHtml(enquiry.phone)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${escapeHtml(enquiry.email ?? "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666">Interest</td><td>${escapeHtml(enquiry.interest ?? "—")}</td></tr>
          </table>
          <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap;margin-top:20px">${escapeHtml(enquiry.message)}</p>
          <p style="font-family:Arial,sans-serif;font-size:12px;color:#777;margin-top:24px">
            View and mark this enquiry in the store admin → Enquiries.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Thank you — the store will get back to you during opening hours.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[enquiry] Could not save enquiry:", error);
    return NextResponse.json(
      { error: "We could not save your enquiry. Please call or WhatsApp the store." },
      { status: 500 }
    );
  }
}
