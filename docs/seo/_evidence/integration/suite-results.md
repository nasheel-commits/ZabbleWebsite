# Integration sanity-suite results

Production-representative build (`NUXT_SITE_INDEXABLE=true nuxt generate`) of the
integrated `main` (all 10 discipline branches merged). Captured 2026-06-04.

| Check | Result |
|-------|--------|
| `nuxt generate` | **exit 0** — ~156 static routes prerendered |
| `nuxt-link-checker` | **0 broken links, 0 warnings** |
| `node scripts/validate-schema.mjs` | **ALL PASS** — incl. FAQ JSON-LD **byte-identical** to rendered Q&A (home + every system) and `Service.description` === served meta |
| `node scripts/check-seo.mjs` | **24/24 pass** — required pages render, internal links resolve (3809 links, 0 broken) |
| `node scripts/seo-metadata.test.mjs` | **PASS** — unique title/desc, canonical (non-www, root-slash), OG+Twitter, `lang=en-ZA`, one primary intent per money page (5 non-blocking editorial length warnings on `/blog` articles) |
| Architecture suite (`tests/architecture.test.mjs`) | **PASS** — zero orphans, every page ≤3 clicks from home, breadcrumbs, footer hub block |
| `node --test` (architecture+geo+analytics+indexnow+static-html) | **45 / 45 pass** |
| `vitest run` (seo-logic, prerender, content, aeo) | **400 passed, 2 skipped** |
| robots.txt | launch policy: `Allow: /` + AI-crawler allowlist + `Sitemap:`; fail-closed staging guard |
| sitemap.xml | 76 URLs, all non-www https + `lastmod`; concept pages 410/excluded; `/pillars` not present |
| canonical | non-www, no trailing slash except root (`https://zabble.org/`) |
| llms.txt / llms-full.txt | <5 KB; every live system + the 4 pillar hubs at canonical `/what-we-build/<pillar>`; no `/pillars` drift |
| consent | no analytics tags in static HTML pre-consent; Consent Mode v2 denied-by-default (region ZA) |
| privacy / cookie-policy | prerendered, footer-linked, `noindex,follow` |
| secret scan | clean — `.env` ignored, `.env.example` placeholders only, no secrets in diff |
| Lighthouse | deferred to live deploy; S01 recorded prod CWV **good** (LCP 1.97s / CLS 0 / TBT 0ms) for this codebase — see launch-checklist |

## Integration-point reconciliation
- **Pillar hubs:** the parallel `/pillars/*` (S07) duplicate was consolidated into
  the canonical `/what-we-build/<pillar>` (S04 IA) with a 301 (`vercel.json`);
  the hub now carries the AEO answer + a cited GEO stat. One hub, one URL.
- **Organization entity:** single source via `nuxt-schema-org` `#identity` (the
  duplicate hand-rolled `app.vue` node was removed).
- **FAQ ↔ FAQPage:** rendered from the same `sys.faqs` objects; byte-identical
  (asserted).
- **Blog ↔ Article schema:** every `/blog` post + the bespoke-systems thesis
  render via `ArticleView` + `useArticleHead` (Article JSON-LD).
- **`/blog` vs `/insights`:** `/blog` is the canonical editorial hub (nav
  "Insights"); `/insights` retained as keyword explainers ("Guides").
- **`/industries`:** S02 taxonomy is canonical; S10's richer angle-linking is an
  owner-checklist enhancement.
- **Metadata:** blog/about/press/legal/locations standardised onto `usePageSeo`
  (no double-branded titles; OG/Twitter everywhere).
