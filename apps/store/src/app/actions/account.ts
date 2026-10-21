"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@uma/db";
import { requireUser } from "@/lib/auth";

const addressSchema = z.object({
  label: z.string().trim().max(30).optional(),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9+\s()-]{10,16}$/),
  line1: z.string().trim().min(5).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^\d{6}$/),
  isDefault: z.string().optional(),
});

export async function addAddressAction(formData: FormData) {
  const user = await requireUser();

  const parsed = addressSchema.safeParse({
    label: formData.get("label") || undefined,
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    isDefault: formData.get("isDefault") ?? undefined,
  });

  if (!parsed.success) {
    redirect("/account?address=invalid#addresses");
  }

  const makeDefault = parsed.data.isDefault === "on";

  await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    await tx.address.create({
      data: {
        userId: user.id,
        label: parsed.data.label || "Saved address",
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        line1: parsed.data.line1,
        line2: parsed.data.line2 ?? null,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        isDefault: makeDefault,
      },
    });
  });

  revalidatePath("/account");
  redirect("/account?address=added#addresses");
}

export async function deleteAddressAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("addressId") ?? "");

  await prisma.address.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account");
  redirect("/account#addresses");
}
