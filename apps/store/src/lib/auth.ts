import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma, type Role, type User } from "@uma/db";

export const SESSION_COOKIE = "uma_session";
const SESSION_DAYS = 7;

function getSecret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set to a strong random value in production.");
    }
    // Local development only. Never rely on this in a deployed environment.
    return new TextEncoder().encode("uma-fashions-development-secret-change-me");
  }
  return new TextEncoder().encode(value);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: Pick<User, "id" | "email" | "name" | "role">) {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function destroySession() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Reads and verifies the session cookie. Does not touch the database. */
export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.role !== "string") return null;
    return {
      id: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "",
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/** Confirms the session still maps to a real user (role changes take effect immediately). */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "OWNER" && user.role !== "STAFF") redirect("/");
  return user;
}

export async function requireOwner() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "OWNER") redirect("/admin");
  return user;
}

/** Throws instead of redirecting — call from server actions and route handlers. */
export async function assertStaff() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OWNER" && user.role !== "STAFF")) {
    throw new Error("Not authorised.");
  }
  return user;
}

export async function assertOwner() {
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") throw new Error("Not authorised.");
  return user;
}
