# Audit 08 — Structured Data / Schema.org

- **Session:** 08 (schema) — see numbering note below
- **Branch:** seo/08-schema
- **Owner:** structured-data engineer (agent)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (foundation); 01 (`site.url` — provisionally self-set, see §6);
  06/07 (FAQ + Article content — not yet delivered); 07/10 (`sameAs` profiles — not
  yet delivered)
- **Layer(s):** Foundation / AEO / GEO

> **Numbering note.** This repo's `00-conventions.md` §1 assigns Structured Data
> to **Session 03** (`seo/03-schema`), with 08 reserved for GEO. The work was
> commissioned on branch **`seo/08-schema`** with audit **`08-schema.md`** (an
> explicit instruction, confirmed with the user). The discipline is identical to
> the `03-schema.md` placeholder; this file supersedes that placeholder's intent.
> When the boards are reconciled, fold this into whichever number survives.

## 1. Scope

**Owned & implemented here:** all JSON-LD / Schema.org for the site, via
`nuxt-schema-org` (v6.0.4) — the schema module registration, the site-wide
identity (`Organization` + `WebSite`), and per-template markup
(`WebPage`/`CollectionPage`/`ItemPage`, `BreadcrumbList`, `Service`, `ItemList`),
plus reusable, ready-to-wire patterns for `FAQPage` and `Article`/`BlogPosting`.
Schema composables/injection points are S03-owned (conventions §2).

**Explicitly out of scope / hand-offs:**
- Per-page `useSeoMeta` titles/descriptions/canonical/OG → **S02**. (Schema reads
  the page's existing `useHead` description; it does not set meta.)
- `sitemap.xml`, `robots.txt`, the SEO umbrella module, final `site.*` config →
  **S01**. (I set a provisional `site.url`/`name` so absolute `@id`s render — see §6.)
- FAQ Q&A copy and blog/editorial content (the *source* for `FAQPage`/`Article`) →
  **S06/S07**. Patterns are built; nothing is emitted until visible copy exists.
- Verified social/authoritative profile URLs (`sameAs`) → **S07/S10**.
- Brand logo / default OG image asset in `/public` → **S01/design**.
- `LocalBusiness` upgrade (NAP, geo, opening hours) → gated on **S04/S10** local plan.

## 2. Method

1. Installed `nuxt-schema-org@6.0.4` (standalone, not the `@nuxtjs/seo` umbrella —
   smaller blast radius; the umbrella bundles it and can dedupe on S01's rebase).
   Compat: peers `unhead`/`@unhead/vue` `^2` (shipped by Nuxt 4.4) + `zod >=3`. ✓
2. Wired identity in `nuxt.config.ts` (`site` + `schemaOrg.identity`); per-template
   nodes via `useSchemaOrg([...])` in the page `<script setup>` blocks and a
   reusable composable `app/composables/useContentSchema.ts`.
3. `npx nuxt generate` → JSON-LD is baked into the prerendered static HTML in
   `.output/public/**` (confirmed server-side render, not client-only).
4. Validated with `scripts/validate-schema.mjs` (committed): parses every page's
   JSON-LD, checks `@type`s, `@id` uniqueness + reference resolution, and that
   markup matches the **served** page content. All pages pass.
   `[E: 08/validation-report.txt]`
5. Saved the exact rendered graphs to `_evidence/08/`.

Worktree note: built in an isolated git worktree (`zabble-seo-08-schema`) with a
**dedicated** `node_modules` after a junctioned (shared) `node_modules` caused
ESM-loader (`throwIfUnsupportedURLScheme`) prerender failures from concurrent
build-cache contention across parallel sessions.

## 3. Current state (findings)

Before this session: **zero** structured data on the site (confirmed in
`reference/nuxt-seo-implementation.md` §1). After:

| Template / page | Nodes emitted (server-rendered) | Evidence |
|---|---|---|
| **Site-wide** (every page) | `Organization` (`/#identity`) + `WebSite` (`/#website`, publisher → org) + per-route `WebPage` (about → org, isPartOf → website) | `[E: 08/jsonld__home.json]` |
| **Home** `/` | the site-wide graph (org is the page's `about`) | `[E: 08/jsonld__home.json]` |
| **Systems index** `/systems` | `WebPage`+`CollectionPage`, `BreadcrumbList` (Home → Systems), `ItemList` of all **30** live systems (positions 1..30) | `[E: 08/jsonld__systems-index.json]` |
| **System detail** `/systems/<slug>` (×30) | `WebPage`+`ItemPage`, `BreadcrumbList` (Home → Systems → System), `Service` (provider → org, `serviceType`, `category` = pillars, `areaServed` = South Africa) | `[E: 08/jsonld__system-accounting-engine.json]` |
| **Diagnose** `/diagnose` | `WebPage` only (no FAQPage — see §4) | `[E: 08/jsonld__diagnose.json]` |

Interlink integrity (all pages): `@id`s unique within each page; every reference
(`publisher`/`about`/`isPartOf`/`provider`/`breadcrumb`) resolves in-graph; no
collisions. Markup matches content: each `Service.description` is byte-equal to
its page's served `<meta name="description">` (the on-page tagline).
`[E: 08/validation-report.txt — ALL CHECKS PASSED]`

**Organization entity (GEO infrastructure):** name, url, description (identical
boilerplate to the site meta + business reference doc — corroboration), slogan,
email (`analytics@zabble.org`), `address.addressCountry = ZA`, `areaServed =
South Africa`, `knowsAbout` (the four pillars + bespoke-systems expertise).

**Type choice — `Service`, not `Product`/`SoftwareApplication`.** Zabble delivers
a bespoke build/consulting engagement shaped per client, with no price, SKU, or
downloadable artefact. `Service` (provider → the Zabble `Organization`) is the
honest, extractable entity. `Product`/`SoftwareApplication` would imply
`offers`/`price`/`aggregateRating` we cannot truthfully populate. `Service` earns
no Google *rich result* (none exists for it) but is strong for AEO/GEO machine
understanding — the explicit intent for the module pages.

## 4. Gaps & opportunities

| # | Pri | Gap | Detail |
|---|-----|-----|--------|
| G1 | **P1** | `sameAs` empty | No verified Zabble social/authoritative profiles exist in the repo (footer has none). The slot is wired; **not** populated — inventing URLs would be a markup-only claim. Strongest single GEO lever once real profiles exist. |
| G2 | **P1** | `Organization.logo` absent | No ≥112×112 brand asset in `/public` (only a 4 KB `favicon.ico`). Required for the logo enhancement / knowledge-panel image. |
| G3 | **P2** | `FAQPage`/`QAPage` not emitted | No page carries a visible Q&A block yet (diagnose is a form, not Q&A). Reusable `useFaqSchema` is built and ready; emit once S06/S07 add real on-page FAQs. FAQ *rich results* are largely gone in 2026, but the markup still aids Bing + AEO/GEO parsing. |
| G4 | **P2** | `Article`/`BlogPosting` not emitted | The site has no blog/editorial pages. Reusable `useArticleSchema` (author + datePublished/dateModified + publisher → org) is built and ready for when S06 ships content. |
| G5 | **P2** | `LocalBusiness` not used | No NAP (street/city/phone/geo) is known. `Organization` (addressCountry ZA) is correct today; upgrade to `LocalBusiness`/`ProfessionalService` when S04/S10 supply a verified local profile. |
| G6 | P3 | 2 concept systems unreachable | `legal-intake-automation`, `hospitality-booking-marketing-dashboard` are `status:'concept'` (TODO copy), hidden from the gallery, and not prerendered → no page, no schema. Correct today; they gain `Service` markup automatically once promoted to `live`. |

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| 1 | P0 | Merge this schema foundation; keep JSON-LD baked into prerendered HTML | `seo/08-schema` → main (after S01) | `_evidence/08/` |
| 2 | P1 | Supply verified profile URLs → I add them to `schemaOrg.identity.sameAs` | S07/S10 → S03 | G1 |
| 3 | P1 | Add `/public/zabble-logo.(png\|svg)` (≥112×112, on white) + default OG image → I wire `Organization.logo` | S01/design → S03 | G2 |
| 4 | P1 | At launch, run Google Rich Results Test + `validator.schema.org` against the live URLs (no public API → manual; paste from `_evidence/08/`) | S01/S10 | README.note.md |
| 5 | P2 | When a page gets a real FAQ block, call `useFaqSchema(faqs)` (1:1 with visible copy) | S06/S07 + S03 | G3 |
| 6 | P2 | When the blog ships, call `useArticleSchema({...})` per post | S06 + S03 | G4 |
| 7 | P2 | If a verified NAP exists, upgrade identity to `LocalBusiness`/`ProfessionalService` | S04/S10 → S03 | G5 |
| 8 | P2 | S01: on umbrella install, dedupe the `nuxt-schema-org` module entry; keep `site` + `schemaOrg` blocks | S01 | nuxt.config.ts |

## 6. Cross-session asks

Mirrored into `status.md` notes for each target session.

- **S01 (Technical):** I added `nuxt-schema-org` to `modules` and a provisional
  `site: { url:'https://zabble.org', name, description }` in `nuxt.config.ts` so
  absolute `@id`s render before the umbrella lands. On your rebase: dedupe the
  module (the umbrella bundles it) and reconcile `site.*` (your version already
  sets `url`/`name`/`indexable`/`trailingSlash` — keep yours; my `schemaOrg`
  block is additive). **Logo/OG asset** (G2) is needed for the logo enhancement.
- **S02 (On-Page):** schema consumes each page's existing `useHead` description;
  no collision with your `useSeoMeta` work (additive `useSchemaOrg` calls). If you
  introduce per-system `seoDescription`, the `Service.description` will track it.
- **S06 (Content) / S07 (AEO):** `useFaqSchema` + `useArticleSchema` are ready
  (`app/composables/useContentSchema.ts`). Give me real on-page FAQ Q&A / blog
  copy and I emit `FAQPage`/`Article` 1:1 with the visible text.
- **S07 (AEO) / S10 (Off-page):** supply the **verified** `sameAs` profile URLs
  (LinkedIn, directories, etc.) → I add them to the Organization identity (G1).

## 7. Evidence index

All under `docs/seo/_evidence/08/`:
- `validation-report.txt` — full per-page PASS/FAIL from `scripts/validate-schema.mjs`; **ALL CHECKS PASSED**.
- `jsonld__home.json` — site-wide identity graph (Organization + WebSite + WebPage).
- `jsonld__systems-index.json` — `/systems` CollectionPage + Breadcrumb + 30-item ItemList.
- `jsonld__system-accounting-engine.json` — representative system page (WebPage/ItemPage + Breadcrumb + Service).
- `jsonld__diagnose.json` — `/diagnose` WebPage (no FAQPage).
- `README.note.md` — provenance, method, and the Rich Results Test caveat.
