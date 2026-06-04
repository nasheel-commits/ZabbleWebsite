# Evidence — 08 Structured Data / Schema.org

- **Source:** JSON-LD extracted from the prerendered static HTML in
  `.output/public/**` after `npx nuxt generate` on branch `seo/08-schema`.
- **Captured:** 2026-06-04
- **Validator:** `scripts/validate-schema.mjs` (committed) — re-run with
  `node scripts/validate-schema.mjs` from the worktree root after a `generate`.
- **Result:** `validation-report.txt` — **ALL CHECKS PASSED** (0 failures).

## Files
| File | What it proves |
|------|----------------|
| `jsonld__home.json` | Home graph: Organization (`/#identity`, canonical description + disambiguation + areaServed + knowsAbout, no fabricated sameAs/logo) + WebSite + WebPage + **FAQPage(5)**. |
| `jsonld__system-bespoke-crm.json` | System **with** FAQ: WebPage/ItemPage/FAQPage + BreadcrumbList(3) + Service(provider → org) + 4 Questions, all `@id`s unique + resolving. |
| `jsonld__system-integration-hub.json` | System **without** FAQ: Service + Breadcrumb, **no** FAQPage/Question (no markup-only claim). |
| `jsonld__systems-index.json` | `/systems` CollectionPage + BreadcrumbList + ItemList(30, positions 1..30). |
| `jsonld__diagnose.json` | `/diagnose` WebPage only — no FAQPage (form, not Q&A). |
| `validation-report.txt` | Full per-page PASS/FAIL run. |
| `rrt-paste-in.md` + `rrt-paste-in__*.html` | Exact JSON-LD wrapped for the live Google Rich Results Test (Code mode), per template. |

## What was checked
1. Valid JSON-LD, exactly one `ld+json` block per page, expected `@type`s rendered **server-side**.
2. `@id` unique within each page; every reference (`publisher`/`about`/`isPartOf`/`provider`/`breadcrumb`/`mainEntity`) resolves in-graph.
3. **FAQ byte-identity:** every `Question.name` / `acceptedAnswer.text` is byte-for-byte equal to the rendered `<FaqList>` `<dt>`/`<dd>` text (scoped to FaqList's `divide-y divide-line` `<dl>`, so the SystemHero metadata list is not mistaken for FAQ). 8 FAQ pages, 33 Q&As.
4. `FAQPage.mainEntity` links exactly the page's `Question` nodes.
5. `Service.description` === the page's served `<meta name="description">`.
6. 23 non-FAQ system pages emit no `FAQPage`/`Question`.
7. Organization carries the canonical (byte-exact) description + 10-item `knowsAbout`, `disambiguatingDescription`, `areaServed` (SA + metros), and **no** `sameAs`/`logo`.

## Caveat — Google Rich Results Test
RRT / `validator.schema.org` have no public API and need a reachable URL or pasted
source. The site is **pre-launch**, so live-URL testing is a launch-checklist item.
The exact JSON-LD that will be served is in `rrt-paste-in__*.html` (paste into RRT
Code mode). Note (2026): Google no longer *shows* FAQ rich results in Search, but
the markup stays valid and is used by Bing + AI answer engines — the reason we keep
it. Breadcrumb + Organization remain display-eligible.
