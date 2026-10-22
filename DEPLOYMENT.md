# Deployment runbook — Krishna Jewellers

This deploys **two Next.js apps from one repository** against **one PostgreSQL
database**, then wires their URLs together and verifies the integration.

Recommended baseline:

- **Database:** Neon Postgres (pooled connection).
- **Hosting:** two Vercel projects from the same GitHub repository.
- **Domains:** e.g. `umafashions.in` (website) and `shop.umafashions.in` (store).
- **Payments:** Razorpay test mode first, live only after owner approval.
- **Email:** optional Resend key.

> Free tiers are suitable for development and demos. Before taking real orders,
> confirm commercial terms, backups, uptime and payment-provider requirements, and
> budget for paid plans where needed.

---

## 0. Before deploying

Get owner sign-off on:

- [ ] Store name, owner details, public phone/WhatsApp/email, address, hours.
- [ ] Collections actually sold, product photos, descriptions, prices, stock.
- [ ] Policy text (privacy, shipping, returns, terms) reviewed by the owner/advisor.
- [ ] Returns window, COD limit, shipping fee and free-shipping threshold.
- [ ] GST/tax treatment. **Do not invent a GSTIN or tax rate.**
- [ ] Razorpay merchant account status (test keys are enough for acceptance).
- [ ] Who owns the domain, GitHub repo, Neon project, Vercel projects and email.

Then update `packages/brand/src/index.ts` with the real values and replace the
placeholder images. Commit and push through review — never commit `.env`.

---

## 1. Create the production database (Neon)

1. Create a Neon account/project owned by the client (or the agreed owner).
2. Choose the region closest to customers (India/Singapore where available).
3. Copy the **pooled** connection string. It looks like:
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep it in a password manager; set it in Vercel, not in Git.
5. For production, enable the provider’s backup/branching options available on the
   chosen plan. Know how to restore before you need it.

Run migrations from a trusted machine (or a CI release step):

```bash
# with the production DATABASE_URL in your shell environment
DATABASE_URL="postgresql://…" npm run db:deploy
```

Then bootstrap the owner account, settings and category list:

```bash
DATABASE_URL="postgresql://…" \
OWNER_EMAIL="owner@yourdomain.com" \
OWNER_PASSWORD="a-strong-unique-password" \
OWNER_NAME="Owner name" \
npm run db:bootstrap
```

Do **not** run `npm run db:seed` against production — it inserts demo products and
fake orders.

> No database connection string should ever appear in a repository, screenshot,
> issue or chat with the client’s customers.

---

## 2. Push the repository

```bash
git checkout -b launch
git add .
git commit -m "…"
git push origin launch
```

Create a **private** GitHub repository owned by the client/organisation. Confirm
no `.env` file, payment secret or database URL is tracked:

```bash
git ls-files | grep -E '^\.env'
# should print nothing
```

---

## 3. Create the two Vercel projects

Import the same repository twice.

### Project A — Website

- **Project name:** `uma-fashions-website`
- **Root Directory:** `apps/website`
- **Framework preset:** Next.js (auto-detected)
- **Install/Build:** leave the detected defaults. Vercel installs the npm workspace
  from the repo root and runs the app’s `next build`.
- **Node version:** 20.x or 22.x.

Environment variables:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled URL |
| `NEXT_PUBLIC_WEBSITE_URL` | `https://umafashions.in` (final website URL) |
| `NEXT_PUBLIC_STORE_URL` | `https://shop.umafashions.in` (final store URL) |
| `AUTH_SECRET` | strong random (website does not sign in, but keep consistent) |
| `OWNER_EMAIL` | where enquiry notifications go |
| `RESEND_API_KEY` | optional |
| `EMAIL_FROM` | verified sending identity, e.g. `Krishna Jewellers <hello@umafashions.in>` |

### Project B — Store + admin

- **Project name:** `uma-fashions-store`
- **Root Directory:** `apps/store`
- **Framework preset:** Next.js
- **Node version:** 20.x or 22.x.

Environment variables:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | same Neon pooled URL |
| `AUTH_SECRET` | **same strong secret as the website** (or rotate both together) |
| `NEXT_PUBLIC_WEBSITE_URL` | `https://umafashions.in` |
| `NEXT_PUBLIC_STORE_URL` | `https://shop.umafashions.in` |
| `OWNER_EMAIL` | owner notification address |
| `RAZORPAY_KEY_ID` | `rzp_test_…` during acceptance |
| `RAZORPAY_KEY_SECRET` | server-only secret |
| `RAZORPAY_WEBHOOK_SECRET` | webhook secret you set in Razorpay |
| `RESEND_API_KEY` | optional |
| `EMAIL_FROM` | optional verified sender |

`NEXT_PUBLIC_*` values are baked into the build. If you change a URL, **redeploy
both projects** — otherwise the old cross-links remain.

Deploy both projects. Vercel should give you two `*.vercel.app` URLs.

---

## 4. First-run checks on the preview URLs

Open both `/api/health` endpoints:

```bash
curl -s https://your-website.vercel.app/api/health
curl -s https://your-store.vercel.app/api/health
```

Expected:

```json
{ "status": "ok", "app": "website", "database": "connected", … }
{ "status": "ok", "app": "store", "database": "connected", … }
```

If the database is unavailable, fix `DATABASE_URL` (pooled host, `sslmode=require`)
and redeploy. Do not announce anything while health is degraded.

Then, on the store preview:

1. Sign in at `/login` with the bootstrapped owner account.
2. Change the seeded password handling as agreed (rotate by creating a new owner
   and disabling the old account, or reset via your agreed process).
3. Add at least one real product with approved photos, price and stock.
4. Confirm the product appears in `/shop` and on the website home.

---

## 5. Razorpay setup (test mode)

1. In Razorpay Dashboard → **Settings → API Keys**, generate **test** keys.
2. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` in Vercel (store project) and
   redeploy.
3. Checkout will now show “Pay online”. COD remains governed by admin settings.
4. Create a webhook:
   - URL: `https://<store-domain>/api/razorpay/webhook`
   - Secret: a long random value → save as `RAZORPAY_WEBHOOK_SECRET`
   - Events: `payment.captured`, `order.paid`, `payment.failed`
5. Test with Razorpay test UPI/cards:
   - Payment success → order shows **Paid** and **Confirmed**.
   - Cancel the modal → order stays **Payment pending**; “Pay now” on the order page
     re-opens checkout without creating a duplicate order.
   - Simulate a failed payment → order remains pending; stock is still reserved.
   - Re-deliver the same webhook from Razorpay → no duplicate confirmation email
     or status history entry (idempotent event id).
6. Verify the signature path cannot be bypassed: an invalid signature must return
   HTTP 400 from `/api/verify` and `/api/razorpay/webhook`.

### Going live
Only after merchant activation, client sign-off and successful test-mode
acceptance:

- Swap to live keys and a live-mode webhook secret.
- Update the webhook URL if the domain changes.
- Place one real low-value order end-to-end, then refund it through Razorpay.
- Keep test keys available for future staging.

Refunds are issued in the Razorpay dashboard. The admin order status can then be
moved to Refunded; the app records the state but does not call the refunds API.

---

## 6. Domains, HTTPS and cross-linking

1. Add the website domain in Vercel (Project A) and the store subdomain in
   Project B. Follow **only** the DNS records Vercel shows.
2. Wait for HTTPS certificates to be issued; verify both apex and `www`
   redirects/canonicals.
3. Set the final `NEXT_PUBLIC_WEBSITE_URL` / `NEXT_PUBLIC_STORE_URL` in **both**
   projects and redeploy both.
4. Update the Razorpay webhook URL to the final store domain.
5. Run the integration verifier:

```bash
NEXT_PUBLIC_WEBSITE_URL="https://umafashions.in" \
NEXT_PUBLIC_STORE_URL="https://shop.umafashions.in" \
npm run verify:deploy -- --production
```

It checks:

- both health endpoints are OK and connected to PostgreSQL;
- the website contains the store URL and the store contains the website URL;
- production URLs are HTTPS and not localhost.

---

## 7. Acceptance smoke test

Run once on desktop and once on a phone.

**Website**
- [ ] Home sections load; no horizontal scroll; mobile menu works with keyboard.
- [ ] Collections → product → store opens the correct piece.
- [ ] Enquiry submits; appears in admin → Enquiries; owner email if configured.
- [ ] Lookbook lightbox opens, closes with Escape, arrows navigate.
- [ ] Policy pages and footer contact links work.
- [ ] `sitemap.xml`, `robots.txt`, favicon and page titles are correct.

**Store**
- [ ] Search/filter/sort/pagination return correct results.
- [ ] Product with one variant and one with multiple sizes; low stock cannot exceed.
- [ ] Add to bag as guest → cart persists after refresh → checkout as guest.
- [ ] Coupon `WELCOME10` applies, invalid/expired coupon is rejected.
- [ ] COD under the limit succeeds; COD above the limit is hidden/rejected.
- [ ] Razorpay test payment succeeds and the order becomes Confirmed/Paid.
- [ ] Cancel the Razorpay modal → order remains pending and “Pay now” works.
- [ ] Order confirmation is reachable with the token and hidden without it.
- [ ] Sign up → order appears under account → sign out → sign in.
- [ ] Customer cannot open `/admin`; staff cannot open owner-only settings/coupons.
- [ ] Admin: create/edit product, adjust stock, see inventory movement, hide product.
- [ ] Admin: status transitions enforced; cancelling restores stock.
- [ ] Admin: approve/reject a review; mark an enquiry handled.
- [ ] Admin settings: COD toggle, shipping fee, announcement reflect on storefront.

**Security**
- [ ] No secrets in `git ls-files`, client bundles or screenshots.
- [ ] `/admin` and `/api/*` responses are not cached/indexed.
- [ ] Invalid Razorpay signatures are rejected.
- [ ] Session cookie is `HttpOnly`, `Secure`, `SameSite=Lax` in production.

---

## 8. Backups, monitoring, rollback

**Backups**
- Use Neon branching/point-in-time restore on the chosen plan.
- Also take a logical dump before risky releases:
  ```bash
  pg_dump "$DATABASE_URL" --no-owner --no-privileges -f backup-$(date +%F).sql
  ```
- Test restoring into a separate branch/database at least once.

**Monitoring**
- Uptime check on both `/api/health` endpoints (5-minute interval).
- Vercel deployment failure notifications to the owner/developer.
- Razorpay webhook failure emails enabled; review the webhook logs after launch.
- Database compute/storage alerts from Neon.
- Error tracking (Sentry or similar) is recommended once volume grows.

**Rollback**
- Vercel: promote the previous deployment if a release is bad.
- Database: migrations are forward-only; restore a branch or apply a reviewed
  compensating migration. Never run destructive SQL on production ad hoc.
- Payments: reconcile any orders created during the incident in the Razorpay
  dashboard and mark them in the admin.

---

## 9. Handover

- Transfer ownership (not just access) of domain, GitHub, Neon and Vercel to the
  client where possible; use MFA and least privilege.
- Give the owner a short walkthrough: add product, adjust stock, process order,
  cancel/refund, mark enquiry handled, moderate reviews, change announcement.
- Provide the live URLs, admin URL, and the contact for support.
- Agree who monitors backups, security updates, payment webhooks and customer
  support; and when a paid hosting/database tier becomes necessary.
- Hand over `README.md`, this runbook and a record of the environment variable
  names (never the secret values) in a password manager.
