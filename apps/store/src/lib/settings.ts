import { prisma } from "@uma/db";

export type StoreSettings = {
  codEnabled: boolean;
  codMaxPaise: number;
  shippingPaise: number;
  freeShippingAbovePaise: number;
  gstPercent: number;
  returnWindowDays: number;
  announcement: string | null;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  codEnabled: true,
  codMaxPaise: 500000,
  shippingPaise: 9900,
  freeShippingAbovePaise: 149900,
  gstPercent: 0,
  returnWindowDays: 7,
  announcement: "Free shipping above ₹1,499",
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const row = await prisma.storeSetting.findUnique({ where: { id: 1 } });
    if (!row) return DEFAULT_SETTINGS;
    return {
      codEnabled: row.codEnabled,
      codMaxPaise: row.codMaxPaise,
      shippingPaise: row.shippingPaise,
      freeShippingAbovePaise: row.freeShippingAbovePaise,
      gstPercent: row.gstPercent,
      returnWindowDays: row.returnWindowDays,
      announcement: row.announcement,
    };
  } catch (error) {
    console.error("[settings] Falling back to defaults:", error);
    return DEFAULT_SETTINGS;
  }
}
