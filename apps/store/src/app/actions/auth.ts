"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@uma/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { mergeGuestCart } from "@/lib/cart";
import { rateLimit, requestIp } from "@/lib/rate-limit";

export type AuthState = { error?: string };

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");
const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(200);

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "";
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const limit = rateLimit(`login:${requestIp()}`, 12, 10 * 60_000);
  if (!limit.allowed) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));

  if (!email.success || !password.success) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }

  const user = await prisma.user.findUnique({ where: { email: email.data } });
  // Same message for unknown email and wrong password — no account enumeration.
  if (!user || !(await verifyPassword(password.data, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  await mergeGuestCart(user.id);
  await createSession(user);

  const next = safeNext(formData.get("next"));
  if (next) redirect(next);
  redirect(user.role === "CUSTOMER" ? "/account" : "/admin");
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const limit = rateLimit(`signup:${requestIp()}`, 6, 30 * 60_000);
  if (!limit.allowed) {
    return { error: "Too many attempts. Please try again a little later." };
  }

  const parsed = z
    .object({
      name: z.string().trim().min(2, "Please enter your name.").max(80),
      email: emailSchema,
      phone: z
        .string()
        .trim()
        .regex(/^[0-9+\s()-]{7,16}$/, "Enter a valid phone number.")
        .optional()
        .or(z.literal("")),
      password: passwordSchema,
    })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with this email already exists. Please sign in instead." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      role: "CUSTOMER",
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await mergeGuestCart(user.id);
  await createSession(user);

  const next = safeNext(formData.get("next"));
  redirect(next || "/account");
}

export async function signOutAction() {
  destroySession();
  redirect("/");
}
