# MASTER PROMPT — Web Application (Online Store + Admin) for Gold Covering & Ladies Fancy Store

> Paste this whole file into your AI coding tool as the first message. Replace everything in [BRACKETS] with the client's real details first.

---

## 1. ROLE
You are a senior full-stack engineer and product designer. Build a complete, secure, production-ready **e-commerce web application** with a **customer storefront** and an **owner admin dashboard** for a fancy jewellery store. Write real working code, no placeholders for core logic. Before coding, show me your plan and wait for my "go".

## 2. CLIENT & BUSINESS
- Store: **[STORE NAME]**, [CITY, STATE, INDIA]
- Products: gold covering (gold-plated) jewellery and ladies' fancy items: earrings, jhumkas, nose pins/studs, bangles, bracelets, necklaces, chains, bridal sets, rings, anklets, hair accessories, other fancy items.
- Market: India (currency INR ₹, GST-aware, UPI/Razorpay, Indian phone/pincode formats).
- Purpose: let customers browse, order and pay online (and COD / WhatsApp order), and let the owner manage products, stock, orders and customers easily from phone or laptop.
- The marketing website lives separately at [WEBSITE URL]; keep the same brand look (gold theme) for consistency.

## 3. DESIGN DIRECTION
Consistent with the website, but **optimised for usability and speed** over spectacle.
- Colours: `--gold-500:#D4AF37`, `--gold-700:#B8860B`, `--gold-100:#FFF4CC`, `--ink:#0E0B07`, `--ivory:#FFF9EC`, `--maroon:#5B1A1A`, success `#2E7D32`, error `#B3261E`.
- Fonts: **Cormorant Garamond** for headings, **Jost** for UI/body, **Cinzel** for small labels.
- Subtle, purposeful motion only: page fade, hover zoom on product images, add-to-cart fly animation, skeleton loaders, toast notifications, smooth drawer for the cart. No heavy parallax in the app.
- Mobile-first (most shoppers are on phones), bottom sticky "Add to Cart", large tap targets, thumb-friendly filters.
- Light mode default; optional dark mode (ink + gold).
- Admin dashboard: clean, data-dense, light theme with gold accents, works well on a phone.

## 4. USER ROLES
1. **Guest** – browse, search, add to cart, checkout as guest.
2. **Customer** – account, saved addresses, wishlist, order history/tracking, reviews.
3. **Owner/Admin** – full control. 4. **Staff** (optional) – limited: orders & stock only.

## 5. CUSTOMER STOREFRONT FEATURES
- **Home:** banners, categories, new arrivals, bestsellers, offers, trust badges (secure payment, easy returns, gift packing).
- **Catalog:** category/subcategory pages, filters (category, price range, colour/finish, occasion, in-stock), sort (new, price, popularity), pagination/infinite scroll, instant search with suggestions and typo tolerance.
- **Product page:** image gallery with zoom, variants (size for bangles 2.2/2.4/2.6/2.8, colour/finish), price & MRP & discount %, stock indicator, delivery pincode check, description, care instructions, reviews & ratings, related products, share on WhatsApp.
- **Cart:** drawer + page, quantity update, coupon code, gift-wrap option, price breakdown (subtotal, discount, shipping, GST, total). Persist cart for guests (local) and merge on login.
- **Checkout:** address (with pincode auto-fill), shipping method, payment: **Razorpay (UPI, cards, netbanking, wallets)**, **Cash on Delivery** (with pincode eligibility), and "Order via WhatsApp" fallback. Order confirmation page + email + SMS/WhatsApp message.
- **Account:** sign up/login via **phone OTP** (primary) and email/password or Google; profile, addresses, wishlist, orders, invoices (PDF), return/exchange request.
- **Order tracking:** statuses Placed → Confirmed → Packed → Shipped (with courier + tracking link) → Delivered / Cancelled / Returned.
- **Extras:** wishlist, recently viewed, back-in-stock notify, product reviews with photos (moderated), festival offers banner.

## 6. ADMIN DASHBOARD FEATURES (`/admin`)
- **Overview:** today's sales, orders, low-stock alerts, top products, revenue chart (7/30 days), pending orders.
- **Products:** create/edit/delete, multiple images (Cloudinary), variants, SKU, price/MRP, stock, tags, SEO fields, bulk CSV import/export, duplicate product, visibility toggle.
- **Categories:** manage with images and order.
- **Inventory:** stock adjustments with reason log, low-stock threshold, out-of-stock auto-hide option.
- **Orders:** list/filter/search, update status, add tracking, print invoice and packing slip, refund/cancel, order notes, export CSV.
- **Customers:** list, order history, notes, block.
- **Coupons & offers:** percentage/flat, min order, usage limit, expiry, category-specific.
- **Reviews moderation, banners/homepage content, shipping rules (free above ₹[X], pincode rules), store settings (GST, address, contact, policies).**
- **Reports:** sales by day/category/product, GST summary export.
- **Roles & audit log** of important actions.
- Notifications: new order email + browser/WhatsApp alert to owner.

## 7. TECH STACK (default, justify if you change it)
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui, TanStack Query, Zustand (cart), React Hook Form + Zod, Framer Motion (light).
- **Backend:** Next.js Route Handlers / server actions **or** NestJS/Express REST API; **Prisma ORM + PostgreSQL** (Supabase/Neon). Redis (Upstash) for rate-limit/cache if needed.
- **Auth:** NextAuth/Auth.js or Supabase Auth; phone OTP via MSG91/Twilio; JWT in httpOnly cookies; RBAC middleware.
- **Payments:** Razorpay (orders API + webhook signature verification, idempotent, handle failures/refunds).
- **Storage:** Cloudinary. **Email:** Resend. **Shipping:** manual tracking first; leave adapter for Shiprocket/Delhivery.
- **Search:** Postgres full-text (trigram) to start; Meilisearch optional.
- **Hosting:** Vercel + Neon/Supabase; Sentry for errors; GA4/Plausible analytics.

## 8. DATABASE (design in Prisma schema)
User, Address, Category, Product, ProductVariant, ProductImage, Cart/CartItem, Wishlist, Order, OrderItem, Payment, Shipment, Coupon, Review, Banner, StockLog, StoreSettings, AuditLog, Notification. Include indexes, enums for statuses, soft-delete where sensible, money stored as integer paise, timestamps everywhere.

## 9. API & BUSINESS RULES
- Versioned REST (`/api/v1/...`) with consistent JSON error format and Zod validation on every input.
- **Never trust the client for prices**: recompute totals on the server; reserve stock at checkout and release on payment failure/timeout.
- Verify Razorpay payment signatures + webhooks; orders become "Confirmed" only after verified payment (or COD confirmation).
- Rate limit auth/OTP/checkout endpoints; OTP expiry & attempt limits.
- Atomic stock decrement (transactions) to prevent overselling.
- Generate sequential invoice numbers and GST-compliant PDF invoices.
- Return/exchange window configurable [e.g. 7 days]; policies pages editable.

## 10. SECURITY & COMPLIANCE
OWASP Top-10 aware; CSRF protection, secure headers/CSP, sanitised uploads (type/size limits), password hashing (argon2/bcrypt), least-privilege DB user, secrets in env, audit log, GDPR/India DPDP-friendly privacy (consent, data deletion request), no card data stored.

## 11. PERFORMANCE, SEO, QUALITY
- SSR/ISR for catalog & product pages; next/image; code-splitting; Lighthouse 90+ mobile.
- Product JSON-LD, sitemap, canonical, clean slugs, OG images.
- Accessibility WCAG AA. PWA (installable, offline cart view).
- Testing: unit (Vitest), API/integration tests for checkout & payment flows, E2E (Playwright) for: browse → add to cart → checkout (test mode) → admin sees order.
- CI (GitHub Actions): lint, typecheck, test, build.

## 12. DELIVERABLES
1. Architecture overview + folder structure + ER diagram (Mermaid).
2. Prisma schema + migrations + seed data (20 sample products, categories, coupons, admin user).
3. Full working code (storefront + admin + API).
4. `.env.example`, README, Postman/OpenAPI collection.
5. Deployment guide (Vercel + DB + Razorpay live-mode checklist + domain + email).
6. Owner manual (how to add products, process orders, run offers).

## 13. WORKING METHOD
1. First reply: confirm stack, folder structure, DB schema outline, and a phased plan:
   - Phase 1: setup, auth, DB, catalog, product page
   - Phase 2: cart, checkout, Razorpay, orders
   - Phase 3: admin dashboard, inventory, coupons
   - Phase 4: account area, reviews, emails/notifications, invoices
   - Phase 5: SEO, PWA, tests, security hardening, deployment
2. Wait for my "go", then build phase by phase; after each phase explain how to run and test it.
3. Keep code typed, modular and commented where non-obvious. Never hardcode secrets.
4. At the end, run a final checklist and list known limitations.

**Success criterion:** a customer can discover, order and pay in under 2 minutes on a phone, and the owner can run the whole shop from the dashboard without a developer.
