# Launch Checklist — Zabble SEO/AEO/GEO v1

State of the integrated `main` and the gate to "indexed + measured in production".
Code items are ✅ (verified in this integration); owner items link to
`owner-actions.md`.

## Build & crawlability
- [x] `nuxt generate` exits 0 — **156 static routes** prerendered (production-indexable build).
- [x] `nuxt-link-checker`: **0 broken links, 0 warnings** across the build.
- [x] Architecture suite: **zero orphans, every page ≤3 clicks from home**, breadcrumbs on every template.
- [x] `robots.txt`: launch policy allows `/` + explicitly allow-lists AI crawlers (OpenAI/Perplexity/Google-Extended/Claude/…), emits `Sitemap:`; **fail-closed staging guard** (preview deploys emit `Disallow: /`).
- [x] `sitemap.xml`: 76 URLs, **all non-www https, `lastmod` present**; thin/concept system pages excluded (served 410 + noindex); the retired `/pillars/*` are NOT in the sitemap.
- [x] Canonicals: self-referencing, **non-www, no trailing slash except root** (`https://zabble.org/`); faceted `?pillar=` collapses to `/systems`.
- [ ] **Owner:** set apex as Vercel Primary Domain so the served host matches the canonical (owner-actions #1).

## Structured data (schema) + AEO
- [x] One **Organization + WebSite** entity site-wide (`nuxt-schema-org`, single `#identity` node — no duplicate Organization).
- [x] `validate-schema.mjs`: **ALL checks pass** — incl. **FAQ JSON-LD byte-identical to the rendered Q&A** on home + every system, and `Service.description` === served meta description.
- [x] FAQPage on home + answer pages; Service per live system; BreadcrumbList per template; CollectionPage + ItemList on `/systems`; Article on every `/blog` post + the bespoke-systems thesis.
- [x] `data-answer-first` answer block on every money page; pillar hubs carry a question-led answer + a **real cited statistic** (GEO).
- [ ] **Owner:** run the live Google Rich Results Test post-deploy (owner-actions #11).

## On-page metadata
- [x] `seo-metadata.test.mjs`: every prerendered route has a unique title (`· Zabble`, ≤60 on money/core pages), unique description, canonical, **OG + Twitter cards**, `lang=en-ZA`; one primary intent per money page (no cannibalisation). (Editorial `/blog`+`/insights` title/desc length is advisory.)
- [x] `/blog`, `/about`, `/press`, `/privacy`, `/cookie-policy`, `/locations*` standardised onto `usePageSeo` (no double-branded titles).

## GEO / AI surfaces
- [x] `llms.txt` (<5 KB) + `llms-full.txt` — H1 + brand blockquote, every live system + the 4 pillar hubs at their canonical `/what-we-build/<pillar>` URLs (no stale `/pillars`, no drift vs `systems.ts`).
- [x] On-site entity disambiguation present (names "Zabble, Inc.", Wikidata P1889 reference) for the homonym problem.
- [ ] **Owner:** create + link `sameAs` profiles + Wikidata item (owner-actions #6).

## Analytics + privacy (POPIA)
- [x] No analytics tags in static HTML pre-consent; **Consent Mode v2 denied-by-default, region-scoped ZA**; tags load only after opt-in; empty id ⇒ no-op.
- [x] Key events compiled (`generate_lead`, `schedule_call` wired into `/diagnose`); IndexNow refuses staging + emits a host-scoped payload.
- [x] `/privacy` + `/cookie-policy` prerendered, linked from the footer, `noindex,follow`; consent banner + "Cookie settings" re-open control.
- [ ] **Owner:** set GA4/GTM/Clarity env vars + redeploy; submit sitemap to GSC+Bing; IndexNow bulk ping; mark `generate_lead` key event (owner-actions #2–5).

## Security
- [x] Secret scan: nothing sensitive committed; `.env` git-ignored; `.env.example` placeholders only; `.mcp.json` uses `${VAR}` expansion.

## Performance (CWV)
- [x] Static-generated, lazy-section + content-visibility, deferred/consent-gated analytics. S01 recorded production CWV **good** (LCP 1.97s / CLS 0 / TBT 0ms) for this codebase.
- [ ] **Owner:** re-run Lighthouse mobile on the live deploy (home / a system / a pillar hub / a `/blog` post) to confirm "good" post-env-vars. *(Headless Lighthouse was not run in the integration env; the build is the same static output S01 measured.)*

## Tests (run in CI on every deploy)
- [x] `npm run test:vitest` — 400 passed.
- [x] `npm run test:node` — 45 passed (architecture, geo, analytics, indexnow, static-html).
- [x] `npm run test:scripts` — seo-metadata + check-seo green.
- [x] `node scripts/validate-schema.mjs` — all schema/FAQ byte-match checks pass.
