# Uma Fashions — brand website + online store

A complete product for a gold-covering (gold-plated) jewellery and ladies' fancy
store, built as **two deployments that stay in sync**:

| App | Path | What it is | Local port |
| --- | --- | --- | --- |
| **Brand website** | `apps/website` | Editorial marketing site: story, collections, lookbook, care, testimonials, contact/enquiries, policies, SEO. | `3000` |
| **Online store** | `apps/store` | E-commerce application: catalog, product pages, cart, checkout (Razorpay + COD), customer accounts, order tracking, and the owner/staff admin. | `3001` |

Shared foundation:

- `packages/brand` — brand identity, contact details, navigation, categories, trust copy, policies, cross-app URLs and money formatting. **Change business details here, once.**
- `packages/db` — Prisma schema + client + seed/bootstrap. Both apps read and write the **same PostgreSQL database**.
- `packages/ui` — shared `Reveal`, `SectionHeading`, `Ornament` and `Stars` components.

The website and store share tokens (`packages/brand/src/tokens.css`), typography,
palette, product data and business details. At deploy time the two URLs are wired
with `NEXT_PUBLIC_WEBSITE_URL` / `NEXT_PUBLIC_STORE_URL`, and `npm run verify:deploy`
checks that both deployments are live, share a database, and link to each other.

---

## What is implemented

### Brand website (P0)
- Responsive home, collections index, collection pages, about, lookbook with
  keyboard lightbox, contact/visit page, policy pages, 404.
- Gold-on-ink “quiet luxury” design system: Cormorant Garamond + Jost + Cinzel,
  liquid-gold gradients, grain overlay, scroll reveals, marquee, reduced-motion
  support, visible focus states, skip link.
- Live FEATURED products and categories pulled from the same DB as the store, so
  the showcase cannot drift from stock.
- Enquiry form → validated API → database → optional owner email → visible in the
  store admin. Honeypot, consent, rate limit.
- Newsletter endpoint, moderated reviews API, sitemap, robots, Open Graph,
  JSON-LD `JewelryStore`, PWA manifest, favicon.
- Every “Shop Online” link is environment-driven to the store deployment.

### Online store (P0)
- Catalog with server-side search, collection filter, price filter, in-stock
  filter, sorting and pagination.
- Product page: image zoom/gallery, variants (size/finish), live stock,
  add-to-bag / buy-now, care + delivery detail, approved reviews, review form
  (moderated), related products, Product JSON-LD.
- Guest or signed-in cart persisted server-side, stock-aware quantities, coupon
  apply/remove, transparent subtotal/discount/shipping/GST/total.
- Checkout: saved addresses, guest checkout, server-authoritative price and stock
  recalculation, stock decrement in a transaction, COD eligibility rules,
  Razorpay order creation.
- **Razorpay** flow with server-side HMAC signature verification, idempotent
  webhook handling (`payment.captured`, `order.paid`, `payment.failed`),
  duplicate-event protection, retry payment for pending orders, and stock release
  if the payment provider cannot be reached.
- Order confirmation/tracking by signed-in account or unguessable token, status
  history, tracking fields, token-protected guest access.
- Customer auth: email + password (bcrypt, httpOnly JWT cookie via `jose`),
  guest cart merge on login, account page with orders and saved addresses.
- Owner/staff admin: dashboard (paid revenue, orders, COD to collect, low stock,
  top sellers, 7-day chart), orders list/detail with validated status transitions
  and stock restore on cancel, product create/edit + inventory movements, coupon
  management, website enquiries inbox, review moderation, store settings.
- Server-side role checks on every admin page/action; audit log for sensitive
  operations; Zod validation; secure headers; no secrets in the client bundle.
- SEO: sitemap, robots, metadata, noindex on private routes.

### Deliberate scope boundaries
These are documented, not hidden:

- **Tax/invoices:** GST stays at **0** until the owner and a tax professional
  confirm the treatment. There is no GSTIN, invoice PDF or tax filing claim.
- **OTP / Google auth:** accounts use email + password. Phone OTP needs an SMS
  provider and is left as a future adapter.
- **Refunds:** refunds are issued in the Razorpay dashboard; the admin records the
  status change but does not call the refunds API.
- **Wishlist, loyalty, back-in-stock, returns workflow UI:** not built (P1/P2).
- **Image uploads:** the admin references image paths in `public/images`; it does
  not upload to Cloudinary yet.
- **Email:** optional Resend HTTP integration. Without `RESEND_API_KEY`, emails
  are logged and skipped; the shop still works.
- **Rate limiting:** in-memory per instance. Move to Upstash/Redis for
  multi-region production.
- **Product variants in admin:** existing variants can be priced/stocked; adding a
  brand-new size/finish is a developer change for now.

---

## Quick start (local)

### 1. Requirements
- Node.js **20 or 22 LTS** (Node 18.18+ works; 24 is not officially targeted by
  Next 14)
- npm 10+
- Git
- A PostgreSQL database (Neon or Supabase — both work unchanged)

### 2. Install
```bash
npm install
```
The root `postinstall` generates the Prisma client.

### 3. Environment
```bash
cp .env.example .env
```
Edit `.env`:

- `DATABASE_URL` — PostgreSQL connection string (use the **pooled** host for
  serverless).
- `AUTH_SECRET` — at least 24 chars. Generate:
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
- `NEXT_PUBLIC_WEBSITE_URL` / `NEXT_PUBLIC_STORE_URL` — keep the local defaults
  for development.
- `OWNER_EMAIL` / `OWNER_PASSWORD` — used by the demo seed.
- Razorpay keys are optional locally; without them the store shows COD only.

The root `.env` is loaded by both apps through `next.config.mjs`.

### 4. Create the schema
```bash
npm run db:migrate      # creates migration files + applies them locally
npm run db:seed         # demo catalog, content, accounts and orders
```
`db:seed` is destructive and for development only. For a real deployment use
`npm run db:bootstrap` instead (settings + owner + categories, no fake orders).

### 5. Run both apps
```bash
npm run dev
```
- Website: http://localhost:3000
- Store: http://localhost:3001
- Admin: http://localhost:3001/admin

### Demo logins (from the seed)
| Role | Email | Password |
| --- | --- | --- |
| Owner | `owner@umafashions.in` | `UmaDemo@2026` |
| Staff | `staff@umafashions.in` | `StaffDemo@2026` |

**Change these immediately in any shared or deployed environment.**

---

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Both apps with one terminal. |
| `npm run dev:website` / `npm run dev:store` | One app. |
| `npm run build` | Production build for both. |
| `npm run typecheck` | TypeScript both apps. |
| `npm run lint` | ESLint both apps. |
| `npm run db:generate` | Regenerate Prisma client. |
| `npm run db:migrate` | Create/apply dev migrations. |
| `npm run db:deploy` | Apply committed migrations in staging/production. |
| `npm run db:seed` | Destructive demo data. |
| `npm run db:bootstrap` | Safe production bootstrap (owner, settings, categories). |
| `npm run verify:deploy` | Check both live deployments, DB and cross-links. |

---

## Where to change things

### Business details (single source of truth)
`packages/brand/src/index.ts`:

- `BRAND` — name, tagline, owner, phone, WhatsApp, email, address, hours,
  socials, GSTIN (blank until provided).
- `CATEGORIES` — the collections actually sold.
- `TRUST_POINTS`, `CARE_TIPS`, `POLICIES`.
- Cross-app URLs are resolved from environment variables at build time.

Values marked `TODO(client)` are demo values and **must be replaced and approved
before launch**. The site deliberately says “gold covering / gold plated” and
never claims solid gold, purity or hallmarking.

### Policies
`packages/brand/src/index.ts` → `POLICIES`. The supplied text is a plain-language
starting point for the owner and their advisor to review. Do not invent GSTINs,
tax statements or legal guarantees.

### Images
- Add approved photos to `apps/store/public/images/` (and mirror featured ones to
  `apps/website/public/images/` for the lookbook).
- The seed references `/images/jewel-1.jpg` … `/images/jewel-9.jpg`.
- Current placeholders are royalty-free Unsplash photographs (Unsplash License).
  Replace them with client-owned photography before launch.

### Products, stock, orders, coupons, settings
Use `/admin` in the store. Every price is stored in integer paise; the UI accepts
rupees and converts server-side.

---

## How the “two products, one brand” integration works

1. **Shared design tokens and copy** — both apps import `@uma/brand`, so changing
   the store name, phone, hours or policies updates both.
2. **Shared database** — website collections/featured products/lookbook read the
   same tables the store sells from; website enquiries and reviews appear in the
   store admin. The store can never show a different catalog from the site.
3. **Environment-driven links** — website header/footer “Shop Online” → store URL;
   store header/footer “Our Story / Visit Us / Policies” → website URL. Set the
   `NEXT_PUBLIC_*` URLs per deployment and redeploy so the links are baked in.
4. **Deployment verification** — `npm run verify:deploy` checks `/api/health` on
   both apps, requires a connected database, confirms each site links to the
   other, and (with `--production`) rejects localhost/HTTP.

See `DEPLOYMENT.md` for the step-by-step launch runbook.

---

## Security notes

- Sessions: signed JWT in an `httpOnly`, `SameSite=Lax`, `Secure` (production)
  cookie. Passwords hashed with bcrypt (cost 12).
- All authorization is enforced server-side in layouts **and** actions.
- Payment: browser callbacks are never trusted alone; HMAC signatures are verified
  and webhooks are idempotent. Webhook secret and Razorpay secret are server-only.
- All public payloads are validated with Zod; price/stock/permissions are never
  accepted from the browser.
- `NEXT_PUBLIC_` is used only for public URLs.
- `.env*` is gitignored except `.env.example`.
- Before launch: rotate the seeded credentials, set a unique `AUTH_SECRET`, use
  Razorpay test keys until acceptance, and review access to Neon/Vercel/GitHub
  with MFA.

---

## Known limitations / next steps

- Add an approved GST configuration and sequential invoice numbering only after
  professional review. Current admin numbers are order numbers, not tax invoices.
- Add Razorpay refunds API + reconciliation report for cancelled/returned orders.
- Add automated integration tests around checkout/webhooks with a disposable
  Postgres schema; current verification is typecheck, lint, build and the manual
  flow checklist in `DEPLOYMENT.md`.
- Consider Cloudinary (or S3) uploads for the admin.
- Consider Redis-backed rate limiting and email queues when traffic grows.
- Consider phone OTP / Google sign-in once provider accounts exist.

---

## Credits

- Placeholder photography: Unsplash (Unsplash License) — replace before launch.
- Typefaces: Cormorant Garamond, Jost, Cinzel via Google Fonts / `next/font`.
