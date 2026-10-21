import { getCurrentUser } from "@/lib/auth";
import { cartCount, findCart } from "@/lib/cart";
import { getStoreSettings } from "@/lib/settings";
import { StoreHeaderShell } from "./store-header-client";

export async function StoreHeader() {
  const [cart, user, settings] = await Promise.all([
    findCart(),
    getCurrentUser(),
    getStoreSettings(),
  ]);

  return (
    <StoreHeaderShell
      cartCount={cartCount(cart)}
      user={user ? { name: user.name, role: user.role } : null}
      announcement={settings.announcement}
    />
  );
}
