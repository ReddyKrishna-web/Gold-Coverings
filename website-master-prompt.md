# MASTER PROMPT — Showcase Website (Gold Covering & Ladies Fancy Store)

> Paste this whole file into your AI coding tool (Claude Code, Cursor, etc.) as the first message. Replace everything in [BRACKETS] with the client's real details first.

---

## 1. ROLE
You are a senior full-stack engineer and award-level UI/UX designer. Build a complete, production-ready, **artistic luxury showcase website** for a fancy jewellery store. Write real, working code, not mockups. Ask me before making any major assumption that is not covered below.

## 2. CLIENT & BUSINESS
- Store name: **[STORE NAME]**
- Tagline: **[TAGLINE, e.g. "Where Every Shine Tells a Story"]**
- Location: [FULL ADDRESS, CITY, STATE, PIN]
- Sells: gold covering (gold-plated / micro-gold) jewellery and ladies' fancy items: **earrings, jhumkas, nose pins/studs, bangles, necklaces, chains, bridal sets, anklets, rings, hair accessories, other fancy items**.
- Audience: women aged 16-50, brides and families, gifting buyers. Mostly mobile users, some Telugu/Hindi speakers.
- Goal of this site: make visitors fall in love with the brand, understand what is sold, trust the shop, and **contact / visit / WhatsApp the store**. (Online checkout lives in the separate web application, so link to it with a "Shop Online" button at [WEBAPP URL].)

## 3. DESIGN DIRECTION — "Liquid Gold, Quiet Luxury"
**Mood:** warm, royal, elegant, artistic, not loud. Think heritage jeweller meets modern editorial magazine.

**Colour tokens (CSS variables):**
- `--gold-100: #FFF4CC`, `--gold-300: #F2D675`, `--gold-500: #D4AF37`, `--gold-700: #B8860B`, `--gold-900: #7A5A12`
- `--ink: #0E0B07` (deep warm black), `--charcoal: #1A1610`
- `--ivory: #FFF9EC`, `--blush: #F7E7E1`, `--maroon: #5B1A1A` (accent)
- Use a **metallic gold gradient** (`linear-gradient(135deg,#7A5A12,#D4AF37,#FFF4CC,#D4AF37,#B8860B)`) for headings, borders, buttons and dividers; animate its background-position slowly for a shimmer.
- Alternate dark (ink) and light (ivory) sections for rhythm.

**Typography (Google Fonts):**
- Display / headings: **Cormorant Garamond** (600/700) or **Playfair Display**
- Accent / small caps labels: **Cinzel**
- Body / UI: **Jost** or **Poppins** (300/400/500)
- Optional script flourish for tagline: **Great Vibes**
- Fluid type scale with `clamp()`; generous letter-spacing on uppercase labels.

**Visual language:** thin gold line borders, ornamental dividers (SVG filigree/paisley/lotus), soft gold glow, grain/noise overlay at 3-4% opacity, rounded-none or very subtle radius, large high-quality imagery with slow zoom.

## 4. ANIMATION & FLOW (core requirement)
Implement a smooth, continuous, story-like scroll experience:
- **Smooth scrolling:** Lenis.
- **Scroll-driven storytelling:** GSAP + ScrollTrigger (or Framer Motion) for reveal, parallax, pinned sections and horizontal scroll galleries.
- **Preloader:** gold logo draws itself (SVG stroke animation) then curtain-lifts to reveal the hero (max ~2s, skippable, only on first visit).
- **Hero:** full-screen with slow-zoom video/image background, headline with split-text letter reveal, floating gold particles/sparkles (canvas or tsParticles, lightweight), CTA buttons with magnetic hover.
- **Custom cursor** (desktop only): small gold ring that expands over products/links.
- **Section transitions:** fade-up + slight blur-to-sharp, staggered children, gold line "draw" dividers.
- **Product cards:** 3D tilt on hover, image swap on hover, gold shimmer sweep.
- **Marquee:** infinite scrolling strip of category names ("EARRINGS ✦ BANGLES ✦ NOSE PINS ✦ ...").
- **Counters:** animated numbers (years of trust, happy customers, designs).
- **Testimonials:** smooth draggable carousel.
- Respect `prefers-reduced-motion` (disable heavy motion). Keep 60fps; lazy-load everything below the fold.

## 5. PAGES / SECTIONS (single-page with anchor nav + a few dedicated pages)
1. **Navbar** — transparent → solid ink on scroll; logo, links (Home, Collections, About, Gallery, Testimonials, Contact), "Shop Online" gold button, mobile full-screen animated menu.
2. **Hero** — brand name, tagline, 2 CTAs (Explore Collections / Visit Store).
3. **Intro / Brand story teaser** — what we are, why gold covering looks luxurious yet affordable.
4. **Collections** — category cards with image, name, short description: Earrings & Jhumkas, Nose Pins & Studs, Bangles & Bracelets, Necklaces & Chains, Bridal Sets, Rings, Anklets, Hair & Fancy Accessories.
5. **Featured / Trending designs** — horizontal-scroll gallery (12 items, placeholder images with alt text; easy to replace).
6. **Why choose us** — 4-6 icon points (long-lasting gold finish, skin-safe, latest designs, affordable pricing, bridal & custom orders, gift packing).
7. **Care guide** — short tips to keep gold covering shining.
8. **About / Our story** — owner photo, story, values.
9. **Gallery** — masonry grid with lightbox.
10. **Testimonials** — customer reviews.
11. **Visit us** — Google Maps embed, opening hours, directions button.
12. **Contact / Enquiry form** — name, phone, email (optional), interest dropdown, message → saved to backend + WhatsApp redirect option.
13. **Footer (required content)** — store logo & tagline; **owner info: [OWNER NAME], [ROLE/Proprietor], [PHONE], [EMAIL], [WHATSAPP]**; full address; working hours; quick links; social icons ([INSTAGRAM], [FACEBOOK], [YOUTUBE]); GSTIN/licence if any [GST NO.]; "Crafted by [YOUR NAME / STUDIO]"; © year; Privacy & Terms links.
14. **Floating elements** — WhatsApp chat button, back-to-top gold arrow.

## 6. BACKEND (must be properly functioning)
- **Stack (default):** Next.js 14 (App Router) + TypeScript + Tailwind CSS for the frontend, API routes (or separate Node/Express) for backend, **MongoDB Atlas** (Mongoose) or **Supabase Postgres**. Tell me if you'd choose differently and why.
- **Endpoints:**
  - `POST /api/enquiry` — validate (Zod), sanitize, rate-limit (5/min/IP), honeypot + reCAPTCHA/hCaptcha, store in DB, email owner via Resend/Nodemailer, send auto-reply to customer.
  - `POST /api/newsletter` — email subscribe with duplicate check.
  - `GET /api/collections` & `GET /api/gallery` — content served from DB (so the owner can update without code).
  - `GET /api/reviews`, `POST /api/reviews` (moderated: `approved:false` by default).
  - `GET /api/health`.
- **Mini admin panel** (`/admin`, protected by login with hashed password + JWT/httpOnly cookie): view/export enquiries (CSV), mark as handled, approve reviews, upload/replace gallery & collection images (Cloudinary), edit store hours/contact info.
- **Security:** helmet-style headers, CORS allowlist, input validation, env vars for all secrets, no secrets in repo, CSRF-safe cookies.
- Provide `.env.example`, seed script with sample data, and README with run/deploy steps.

## 7. SEO, PERFORMANCE, ACCESSIBILITY
- Semantic HTML, unique meta title/description, Open Graph + Twitter cards, JSON-LD `JewelryStore` LocalBusiness schema (address, hours, phone), sitemap.xml, robots.txt, canonical URLs.
- Images: next/image, WebP/AVIF, lazy loading, blur placeholders. Target Lighthouse **90+** on all four metrics (mobile).
- WCAG AA contrast (gold on ink OK; check gold on ivory), keyboard navigation, focus rings, alt text, aria labels.
- Fully **responsive**: 360px → 1920px, mobile-first.
- Favicon and PWA manifest (gold monogram).

## 8. CONTENT RULES
- Write real, elegant copy (not lorem ipsum) in English; structure copy so Telugu/Hindi can be added later (i18n-ready, `next-intl`).
- Use royalty-free placeholder imagery (Unsplash/Pexels links or local placeholders) clearly marked `TODO: replace with client photo`.
- Never claim "pure gold"; describe products accurately as **gold covering / gold-plated** jewellery.

## 9. DELIVERABLES
1. Complete project folder structure with all files.
2. Reusable components (Navbar, Hero, SectionHeading, ProductCard, Marquee, Footer, etc.).
3. Backend + admin panel + DB models.
4. `README.md`, `.env.example`, seed data.
5. Deployment guide (Vercel + MongoDB Atlas, custom domain, email setup).
6. A short "client handover" doc: how the owner updates content.

## 10. WORKING METHOD
1. First reply with: your chosen stack, folder structure, and a 10-step build plan. Wait for my "go".
2. Build step by step; after each step tell me how to run and test it.
3. Keep code clean, typed, commented where non-obvious.
4. At the end, run a checklist: responsiveness, animations, form → DB → email flow, SEO, Lighthouse, accessibility.

**Success criterion:** the client opens the site and feels it is *attractive, artistic and trustworthy*, and a visitor can contact or visit the shop in two taps.
