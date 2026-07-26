# Premier Mobile Detailing — Website

Working repository for the takeover and rebuild of **premiermobiledetailing.com.au**
(Officer & South-East Melbourne mobile car detailing).

## What's in here right now

### `original-site/` — faithful mirror of the current live site (the base)

A complete, self-contained snapshot of the existing website as it renders in a
browser, captured **26 July 2026**. This is our starting reference before rebuild.

- **62 pages** — every route in the sitemap, fully rendered to real HTML
  (home, booking, gallery, about, 4 service pages, 54 suburb landing pages).
- **All assets local** — CSS, the app JS bundle, favicon, and all 41 images are
  downloaded into `original-site/assets/`. No external CDN dependency for the
  static markup; every image reference points at `/assets/images/...`.
- **Links rewritten** to root-relative paths, so it serves from any host.
- `sitemap.xml` and `robots.txt` replicated from the original.

**Why a rendered mirror and not just the raw files?** The live site is a
client-rendered React SPA. Only the homepage and `/booking` ship pre-rendered
HTML — the 4 service pages and all 54 suburb pages serve an **empty shell** to
crawlers (this is the core problem the audit identified). Fetching the raw files
would have captured empty pages. Rendering each route in real Chrome captures the
actual content, so every page in this mirror ships real HTML.

### `SITEMAP.md`

Full categorized inventory of all 62 pages.

## Serve it locally

Each route is saved as `<route>/index.html`, so a plain static server with
directory-index support serves the whole site, deep links included:

```bash
cd original-site
npx serve .          # or: python -m http.server 8000
```

## Notes / known items (from the audit)

- The current suburb & service pages are invisible to Google (empty shells) —
  the single highest-leverage fix. This mirror already ships real HTML per page.
- `portfolio.html` legacy page should be 301-redirected in the rebuild.
- Homepage says Full Detail "from $385"; booking funnel says "from $180" — pricing
  to be reconciled in the rebuild.
- Design/UX direction takes inspiration from the Glossed Out build
  (React 19 · Vite · TypeScript).

## Roadmap

1. ✅ Mirror the current site as a base (`original-site/`).
2. ⬜ Rebuild as a properly-rendered React/Vite site (SEO-fixed, real HTML per route).
3. ⬜ Rebuild top suburb pages with genuinely local content; consolidate the long tail.
4. ⬜ Add LocalBusiness / Service / Review / FAQ structured data.
5. ⬜ Reconcile pricing & packages across home and booking.
