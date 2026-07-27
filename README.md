# Premier Mobile Detailing — Website

Working repository for the takeover and rebuild of **premiermobiledetailing.com.au**
(Officer & South-East Melbourne mobile car detailing). Deployed on **Vercel** —
the site is served from the repo root, and pushes to `main` auto-deploy.

## What's in here

A complete, self-contained mirror of the current live site, captured
**26 July 2026**, plus new pages and enhancements built on top of it.

- **Pages at the repo root** — every route as `<route>/index.html`
  (home, `booking`, `gallery`, `about`, 4 `services/…` pages, 54
  `mobile-detailing/…` suburb pages), plus new **`warranties/`** and
  **`product-tds/`** pages.
- **All assets local** in [`assets/`](assets/) — CSS, the app JS bundle,
  `enhance.js` (premium interactions), fonts, and all images. Every reference is
  root-relative (`/assets/…`), so it serves from any host.
- `sitemap.xml`, `robots.txt`, `favicon.svg`, and `vercel.json` (clean URLs).

**Why a rendered mirror and not just the raw files?** The live site is a
client-rendered React SPA. Only the homepage and `/booking` ship pre-rendered
HTML — the 4 service pages and all 54 suburb pages serve an **empty shell** to
crawlers (the core problem the audit identified). Rendering each route in real
Chrome captured the actual content, so every page here ships real HTML.

See [`SITEMAP.md`](SITEMAP.md) for the full page inventory.

## Serve it locally

Each route is `<route>/index.html`, so any static server with directory-index
support serves the whole site, deep links included:

```bash
npx serve .          # or: python -m http.server 8000
```

## Deployment

- **Vercel**, git-connected to this repo. Root Directory = repo root (`.`);
  `vercel.json` enables clean URLs. Every push to `main` triggers a deploy.

## Enhancements layered on the mirror

- Carbon-fibre hex mesh on the dark sections (50% opacity).
- Playfair Display italic hero accents.
- Premium interaction layer (`assets/enhance.js`): button sheen + magnetic pull,
  cursor-tracking card spotlights, image zooms, animated nav underlines,
  scroll-reveal, stat count-up. Nav/footer auto-inject the Warranties + TDS links.

## Notes / known items (from the audit)

- Suburb & service pages are invisible to Google on the live site (empty shells);
  this mirror already ships real HTML per page.
- `portfolio.html` legacy page should be 301-redirected in the rebuild.
- Homepage says Full Detail "from $385"; booking funnel says "from $180" — pricing
  to be reconciled.
- Warranties/TDS copy is **placeholder** around the real product list, pending
  post-meeting details; "View TDS" buttons point to `#` until docs are supplied.

## Roadmap

1. ✅ Mirror the current site as a base (now at repo root).
2. ✅ Warranties + Product TDS pages (placeholder content).
3. ⬜ Rebuild as a properly-rendered React/Vite site (SEO-fixed, real HTML per route).
4. ⬜ Rebuild top suburb pages with genuinely local content; consolidate the long tail.
5. ⬜ Add LocalBusiness / Service / Review / FAQ structured data.
6. ⬜ Reconcile pricing & packages across home and booking.
