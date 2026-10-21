import { StoreHeader } from "@/components/store-header";
import { StoreFooter } from "@/components/store-footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main id="store-main">{children}</main>
      <StoreFooter />
    </>
  );
}
