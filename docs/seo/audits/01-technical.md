# Audit 01 — Technical SEO & Crawlability

- **Session:** 01
- **Branch:** seo/01-technical
- **Owner:** S01 (senior technical SEO engineer)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (DataForSEO access — delivered; foundation knowledge base)
- **Layer(s):** Foundation / SEO (enables AEO + GEO)

## 1. Scope

Crawlability, render-completeness, indexability, and Core Web Vitals of the
Nuxt 4 site. **Owns:** `nuxt.config.ts` SEO-module wiring, `public/robots.txt` /
robots config, sitemap config, `routeRules` + Nitro prerender, canonical strategy,
redirect map / trailing-slash / www canonicalisation, custom 404, `app/error.vue`,
`vercel.json`, the staging-noindex guard, and the `en-ZA` locale signal.

**Out of scope (hand-offs):**
- Per-page `useSeoMeta` titles/descriptions, OG/Twitter → **S02**.
- JSON-LD / Schema.org (`Organization`, `Service`, `BreadcrumbList`, `FAQPage`) → **S03**.
- Internal-link depth / site architecture → **S04** (noted: home exposes only 3 internal links).
- Keyword targets / distinct per-module copy (thin-content risk) → **S05/S06**.
- OG-image generation, deep CWV/JS-payload tuning of the 30 demo components → **S09**.
- GSC/Bing/IndexNow submission, analytics, AI-referral tracking → **S10**.

## 2. Method

All DataForSEO queries used the live REST API (the MCP server returned `401` in
this session — credentials are session-launch-scoped, see `status.md` S00 note —
so calls were made directly via `curl` with `.env` Basic auth, secrets redacted).
Market default: South Africa context; the OnPage/Lighthouse calls are URL-scoped.

**Exact DataForSEO calls (all `live`):**

| # | Endpoint | Body | Target | cost | Evidence |
|---|----------|------|--------|------|----------|
| 1 | `POST /v3/on_page/instant_pages` | `[{"url":"https://zabble.org/"}]` | legacy site (session start) | 0.000125 | `baseline__legacy-spa__session-start.note.md` |
| 2 | `POST /v3/on_page/lighthouse/live/json` | `[{"url":"https://zabble.org/","for_mobile":true,"categories":["performance","accessibility","best_practices","seo"]}]` | legacy site | 0.00425 | ″ |
| 3 | `POST /v3/on_page/instant_pages` | `[{"url":"https://www.zabble.org/"}]` | our Nuxt app (production) | 0.000125 | `onpage-instant__home__production-now.json` (+note) |
| 4 | `POST /v3/on_page/lighthouse/live/json` | `[{"url":"https://www.zabble.org/","for_mobile":true,"categories":[...4...]}]` | our Nuxt app (production) | 0.00425 | `lighthouse__home__production-now-mobile.json` (+note) |

**Total live spend ≈ $0.0088** (cost discipline: 4 billable calls; one earlier
Lighthouse errored on a bad category name at `$0`, corrected to `best_practices`).

**Manual checks:** `curl -I` redirect tracing on apex/www/http
(`redirect-chains__key-paths__production.txt`); inspection of the static build
`.output/public/**` after `npm run generate` for full HTML, `robots.txt`,
`sitemap.xml`, canonical tags, and the noindex guard; two builds (production
`NUXT_SITE_INDEXABLE=true` and default staging-guard) compared.

> **Environment note:** the 11 SEO sessions share one repo. This work was done in
> an isolated git worktree (`zabble-seo-01-technical`) with its own `node_modules`
> after a parallel session (S04) reset the shared checkout mid-run and clobbered
> the first evidence capture. The production re-captures are the surviving raw
> exports; the legacy baseline is preserved as a dated note.

## 3. Current state (findings)

Severity-ranked. `[E: 01/<file>]` = evidence ref.

| # | Sev | Finding |
|---|-----|---------|
| F1 | **P0 (historic→resolved mid-session)** | At session start the production domain served a **legacy Vite SPA** — a *different codebase* with US/digital-marketing positioning (`sales@zabble.org`, `addressCountry: US`), **zero server-rendered text** (`plain_text_word_count: 0`, `no_h1_tag: true`), 1 internal link. Any indexing would have indexed the wrong content. `[E: 01/baseline__legacy-spa__session-start.note.md]` Mid-session the Nuxt app was deployed; the legacy SPA is gone. |
| F2 | **P1** | **Host/canonical split.** Production canonicalises **apex→www** (`zabble.org 308→ www.zabble.org`), but the knowledge base + our canonical tags use **non-www**. A declared canonical that 308-redirects is a weak signal. `[E: 01/redirect-chains__key-paths__production.txt]` → ADR-0003; needs a Vercel domain toggle (B5). |
| F3 | **P0 (pre-fix)** | No `sitemap.xml` (404 in production), bare `robots.txt` (`Disallow:` empty, **no `Sitemap:` line, no host, no AI-bot policy**). `[E: 01/robots__production-now.txt; sitemap 404]` → fixed (§6). |
| F4 | **P1 (pre-fix)** | No canonical tags, no staging-noindex guard. The site is **already live + indexable** with the pre-S01 config — risk that a future staging deploy indexes, or that a config swap accidentally noindexes prod. → fixed with a Vercel-env-aware fail-closed guard. |
| F5 | **P2** | `html lang="en"` (no SA locale signal). → set to `en-ZA`. |
| F6 | **P2 (hand-off)** | Home exposes only **3 internal links** `[E: 01/onpage-instant__home__production-now.json]`; `low_content_rate` flagged on the home page. Crawl depth + content depth → **S04 / S02 / S06**. |
| F7 | **info** | **Render baseline is excellent.** Our Nuxt app prerenders full HTML: production home `plain_text_word_count: 1004`, H1 present, `onpage_score: 100`; local build home 78 KB, `/systems` 120 KB, 32 system pages real. `[E: 01/onpage-instant__home__production-now.json]` |
| F8 | **info** | **CWV (production, mobile) all "good":** Perf **98**, A11y **100**, BP **100**, SEO **100**; **LCP 1.77 s, CLS 0, TBT 137 ms**. The SSR migration fixed the legacy SPA's CLS 0.205 / TBT 235 ms. `[E: 01/lighthouse__home__production-now-mobile.json]` |

## 4. Gaps & opportunities

- **P0 (closed):** crawlable sitemap + robots policy + Sitemap reference — *done*.
- **P1 (closed in-repo):** canonical strategy, staging guard, `en-ZA` — *done*.
- **P1 (1 host action):** flip Vercel primary domain to apex (F2 / ADR-0003).
- **P1 (S10):** submit `sitemap.xml` to GSC + Bing; verify the `zabble.org` domain
  property; evaluate IndexNow (the Nuxt sitemap module supports it).
- **P2 (S04/S02/S06):** internal-link depth + per-page content depth (F6) and the
  30-near-duplicate **thin-content risk** (`reference/aeo-geo-principles.md` §2).

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| R1 | P0 ✅ | Adopt `@nuxtjs/seo` suite; wire `@nuxtjs/sitemap` + `@nuxtjs/robots`; set `site.url` | `nuxt.config.ts` / S01 | `built-sitemap__launch-indexable.xml`, `built-robots__launch-indexable.txt` |
| R2 | P0 ✅ | robots: allow AI bots (ADR-0002) + `Sitemap:` line; **fail-closed** staging noindex (Vercel-env aware) | `nuxt.config.ts` / S01 | `built-robots__staging-guard.txt` |
| R3 | P0 ✅ | Prerender every priority route (crawlLinks + explicit `routes()` from `SYSTEMS`) | `nuxt.config.ts` / S01 | `_generate-indexable.log` (77 routes) |
| R4 | P1 ✅ | Self-referencing canonical, non-www, no trailing slash | `app/app.vue` / S01 | canonical tags verified |
| R5 | P1 ✅ | Host canonicalisation via `vercel.json` (trailing-slash, clean URLs); **remove** redirect `routeRules` (they clobber static pages) | `vercel.json`, `nuxt.config.ts` / S01 | ADR-0003 |
| R6 | P1 ✅ | Custom 404 (noindex) + `en-ZA` lang | `app/error.vue`, `nuxt.config.ts` / S01 | `404.html` noindex |
| R7 | **P1 ⚠** | **Set Vercel Primary Domain = `zabble.org`** (apex), so `www→apex` | Vercel dashboard / **devops** | F2, ADR-0003 |
| R8 | P1 | Submit sitemap to GSC + Bing; verify domain property; consider IndexNow | **S10** | `measurement-indexing.md` §1 |
| R9 | P2 | Distinct, intent-bearing copy per system page (thin-content) | **S05/S06/S02** | `aeo-geo-principles.md` §2 |
| R10 | P2 | Increase internal-link depth from home/hub pages | **S04** | F6 |

## 6. Implementation log (this branch)

1. Installed `@nuxtjs/seo@5.1.3` (peer `nuxt: ^3.16 || ^4`, `@nuxt/kit ^4.4.2` —
   confirmed compatible with Nuxt 4.4.6). Activated `@nuxtjs/sitemap@8` +
   `@nuxtjs/robots@6` (with transitive `nuxt-site-config@4`); deferred `schema-org`
   (S03), `og-image` (S02/S09), `seo-utils`/`link-checker` to their owners
   (conventions §2) — rationale in ADR-0002.
2. `nuxt.config.ts`: `site{url,name,defaultLocale,trailingSlash,indexable}`;
   `robots` groups (AI allow-list + `Sitemap:`); `sitemap{urls from SYSTEMS,
   exclude, autoLastmod}`; `nitro.prerender{crawlLinks, routes: priorityRoutes,
   failOnError:false}`; `html lang=en-ZA`. Fail-closed indexable guard:
   `NUXT_SITE_INDEXABLE==='true' || VERCEL_ENV==='production'`.
3. `app/app.vue`: self-referencing canonical from `site.url`.
4. `app/error.vue`: branded, noindex custom 404/error page.
5. `vercel.json`: `trailingSlash:false`, `cleanUrls:true`.
6. **Bug caught + fixed:** initial `routeRules` redirects (`/systems/`, `/index.html`)
   emitted meta-refresh stubs that clobbered `systems/index.html` (94-byte stub) and
   dropped `/systems` from the sitemap. Removed; canonicalisation moved to the host
   layer. Sitemap back to **35/35** priority URLs.

## 7. Verification

- `npm run generate` → **exit 0**, **77 routes prerendered**, no errors. Only
  warnings are pre-existing `@tailwindcss/vite` sourcemap notices (not attributable
  to S01). `[E: 01/_generate-indexable.log]`
- **Full HTML (cond. 2):** home 78 KB, `/systems` 120 KB, system pages real;
  production `instant_pages` word_count 1004, H1 present, score 100.
- **robots + sitemap (cond. 3):** launch `robots.txt` lists AI bots `Allow: /`,
  `User-agent: * Allow: /`, `Sitemap: https://zabble.org/sitemap.xml`;
  `sitemap.xml` = **35** `<loc>` with `<lastmod>`. Staging build →
  `Disallow: /` + `noindex` meta. `[E: built-robots__*, built-sitemap__*]`
- **Canonicals + redirects (cond. 4):** non-www, slash-stripped, self-referencing
  on `/`, `/systems`, `/systems/<slug>`. No loops on key paths; one apex→www hop to
  fix at the host (R7/B5). `[E: redirect-chains__key-paths__production.txt]`
- **CWV (cond. 5):** production mobile LCP 1.77 s / CLS 0 / TBT 137 ms — all
  "good"; no remediation needed. `[E: lighthouse__home__production-now-mobile.json]`

## 8. Cross-session asks

- **Devops/infra (R7, B5):** set Vercel Primary Domain to apex `zabble.org`.
- **S10 (R8):** submit `sitemap.xml` (GSC+Bing), verify domain property, evaluate
  IndexNow. **Production is already live + indexable** — prioritise.
- **S00:** `reference/*` assume "pre-launch on staging"; reality is **deployed on
  Vercel (www-primary)**. Propose updating the reference baseline (ADR-tracked).
- **S02/S03:** `site.url` is set (`https://zabble.org`) — your canonicals/schema
  `url` can derive from it. `useSeoMeta`/JSON-LD modules are *not* yet wired (I
  scoped only sitemap+robots); add `nuxt-schema-org`/`og-image` from the installed
  `@nuxtjs/seo` suite in your sessions.
- **S04/S05/S06 (R9/R10):** thin-content + internal-link depth (F6).

## 10. Implementation pass — Open Requests (OR-1..OR-4) + regression suite

This pass closes the cross-session Open Requests S01 owns (from S04's audit /
`status.md`) and hardens the foundation with an automated test suite + link
checker. **Everything is driven off one rule** — a system page is published
(indexable/prerendered/200) iff `status === 'live'` — so the behaviour is
self-maintaining as the catalogue grows (`app/utils/seo.ts`).

| OR | Pri | Resolution | Files | Verified |
|----|-----|-----------|-------|----------|
| **OR-4** | **P0** | The 2 concept pages (`legal-intake-automation`, `hospitality-booking-marketing-dashboard`) are **excluded from prerender + sitemap**, carry `X-Robots-Tag: noindex`, and the `[slug].vue` gate returns **410 Gone** for any non-`live` slug. Self-maintaining via `status==='live'`. | `nuxt.config.ts`, `app/pages/systems/[slug].vue`, `app/utils/seo.ts`, `app/error.vue` (410 copy) | Hybrid server: concept→**410** + `X-Robots-Tag`, live→200, unknown→404 `[E: http-status__hybrid-preview.txt, http-410-headers__concept-page.txt]`; sitemap excludes both `[E: built-sitemap__launch-indexable.xml]` |
| **OR-3** | P1 | Faceted `/systems?pillar=` **canonicalises to `/systems`** — `canonicalUrl()` strips query/hash; the facet UI uses buttons (not crawlable `<a href>`), so facet URLs are never in the crawl graph and `/systems` is the hub. | `app/utils/seo.ts`, `app/app.vue` | Unit test asserts `?pillar=` → `/systems` |
| **OR-2** | P1 | **Slug-immutability + 301 redirect-map mechanism** (ADR-0004): typed `REDIRECTS` map → `routeRules`, validated for self-loops/duplicates/chains at build time. Empty today (no renames). | `app/data/redirects.ts`, `nuxt.config.ts`, `decisions/0004-slug-immutability.md` | Unit tests: valid map, rejects self-loop/dup/chain, no chains in output |
| **OR-1** | P2 | **One trailing-slash policy**: no trailing slash (except root), enforced at canonical (`canonicalUrl`), `site.trailingSlash:false`, and host (`vercel.json trailingSlash:false`). | `app/utils/seo.ts`, `nuxt.config.ts`, `vercel.json` | Unit + built-output canonical tests |
| **www** | P1 | Canonical, sitemap, robots `Sitemap:` line, and `vercel.json` are **all non-www**. The apex→www host redirect is the one human action (B5); no `vercel.json` host redirect added — it would **loop** against the current www-primary setting. | all of the above | Tests assert no `://www.` anywhere; `[E: redirect-chains…]` |

**Tooling added:**
- **`nuxt-link-checker`** wired (build-time inspection, non-failing): "Running link
  inspections… Total errors: 0" `[E: link-checker-report.md]`.
- **SEO-regression suite (vitest)** — `npm test` (29 assertions) + `npm run test:seo`
  (generate-indexable + assert). Covers: canonical present/non-www/trailing-slash;
  facet→hub; thin-page partition + sitemap exclusion + not-prerendered; redirect map
  no-loops; sitemap has live URLs + lastmod; robots correct per `VERCEL_ENV`;
  prerender emits real HTML; `en-ZA` lang. `[E: _test-seo.log]`

**Verification (this pass):**
- `npm run test:seo` → **29 passed, 1 skipped**; **33** sitemap URLs (30 live + 3),
  concept pages absent. `[E: _test-seo.log, built-sitemap__launch-indexable.xml]`
- Hybrid `nuxt build` + Nitro server: `/`=200, live systems=200, **both concept
  pages=410** (+`X-Robots-Tag: noindex, nofollow`), unknown=404, robots/sitemap=200.
  `[E: http-status__hybrid-preview.txt]`
- Fresh production Lighthouse (mobile): Perf 98, **LCP 1.97 s / CLS 0 / TBT 0 ms —
  all good**. `[E: lighthouse__home__production-recheck-mobile.json]`

## 11. One owner action (B5)

> **Vercel → Settings → Domains → set `zabble.org` (apex) as the Primary Domain.**
> This makes `www.zabble.org → zabble.org` (301) and serves the apex 200, aligning
> the served host with the non-www canonical. It is the **only** human action; all
> code is non-www-consistent and a `vercel.json` host redirect is deliberately
> omitted (it would loop against the current www-primary). After the toggle,
> re-capture `redirect-chains__key-paths__production.txt`.

## 9. Evidence index (`_evidence/01/`)

| File | Proves |
|------|--------|
| `baseline__legacy-spa__session-start.note.md` | Legacy SPA: 0 words, no H1, wrong positioning; CWV CLS 0.205/TBT 235 ms (historic) |
| `onpage-instant__home__production-now.json` (+`.note.md`) | Our Nuxt app renders full HTML in prod (1004 words, H1, score 100) |
| `lighthouse__home__production-now-mobile.json` (+`.note.md`) | Production CWV all "good": LCP 1.77 s, CLS 0, TBT 137 ms; Perf 98 |
| `lighthouse__home__production-recheck-mobile.json` (+`.note.md`) | Post-implementation CWV still good: LCP 1.97 s, CLS 0, TBT 0 ms; Perf 98 |
| `http-status__hybrid-preview.txt` | OR-4 410 proof: concept→410, live→200, unknown→404 |
| `http-410-headers__concept-page.txt` | 410 + `X-Robots-Tag: noindex, nofollow` on concept page |
| `redirect-chains__key-paths__production.txt` | apex→www split (F2 / B5) |
| `built-robots__launch-indexable.txt` | Launch robots (AI bots + Sitemap line) |
| `built-robots__staging-guard.txt` | Staging guard (`Disallow: /`) |
| `built-sitemap__launch-indexable.xml` | 33 priority URLs (live only) + lastmod; concept excluded |
| `link-checker-report.md` | nuxt-link-checker wired; 0 broken links |
| `_test-seo.log` | SEO-regression suite: 29 passed / 1 skipped |
| `_generate-final-indexable.log` / `_build-hybrid.log` / `_npm-install*.log` | Clean builds; module + test-dep installs |
