# Evidence — 08 Structured Data / Schema.org

- **Source:** JSON-LD extracted from the prerendered static HTML in
  `.output/public/**` after `npx nuxt generate` on branch `seo/08-schema`.
- **Captured:** 2026-06-04
- **Validator:** `scripts/validate-schema.mjs` (committed) — re-run with
  `node scripts/validate-schema.mjs` from the repo root after a `generate`.
- **Result:** `validation-report.txt` — **ALL CHECKS PASSED** (0 failures) over
  home, the systems index, all 30 content-bearing system pages, and `/diagnose`.

## Files
| File | What it proves |
|------|----------------|
| `jsonld__home.json` | Home `@graph`: Organization (`/#identity`) + WebSite + WebPage, fully interlinked; no fabricated `sameAs`/`logo`. |
| `jsonld__systems-index.json` | `/systems` CollectionPage + BreadcrumbList + ItemList of all 30 live systems (positions 1..30). |
| `jsonld__system-accounting-engine.json` | Representative system page: WebPage(ItemPage) + BreadcrumbList(3) + Service(provider → org), all `@id`s unique and resolving. |
| `jsonld__diagnose.json` | `/diagnose` WebPage only — **no** FAQPage (form prompts are not Q&A). |
| `validation-report.txt` | Full per-page PASS/FAIL run. |

## What was checked
1. JSON-LD parses (valid JSON) and there is exactly one `ld+json` block per page.
2. Expected `@type`s per template render **server-side** (static HTML).
3. `@id` values are unique within each page (no collisions).
4. Every `@id` reference (`publisher`, `about`, `isPartOf`, `provider`,
   `breadcrumb`) resolves to a node in the same graph.
5. **Markup matches served content:** each `Service.description` is byte-equal to
   that page's rendered `<meta name="description">` (the on-page tagline); the
   ItemList contains exactly the content-bearing (non-concept) systems.

## Caveat — Google Rich Results Test
Google's Rich Results Test / `validator.schema.org` have no public API and require
either a publicly reachable URL or pasted source. The site is **pre-launch**, so
live-URL testing is deferred to launch (S01/S10 checklist). The exact JSON-LD that
will be served is saved here for one-click paste-in confirmation, and has been
validated structurally/against the schema.org vocabulary by the script above.
Re-run the live Rich Results Test against `https://zabble.org/**` at launch.
