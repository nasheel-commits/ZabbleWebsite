# Audit 08 — Structured Data / Schema.org

- **Session:** 08 (schema) — see numbering note below
- **Branch:** seo/08-schema
- **Owner:** structured-data engineer (agent)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (foundation); 01 (`site.url` — provisionally self-set, §6);
  **07-aeo** (FAQ content — delivered, integrated here); **07-geo** (entity plan
  — consumed for boilerplate + disambiguation); **04** (local plan — areaServed).
- **Layer(s):** Foundation / AEO / GEO

> **Numbering note.** `00-conventions.md` §1 assigns Structured Data to **Session
> 03**; 08 was reserved for GEO. This work was commissioned on **`seo/08-schema`**
> with audit **`08-schema.md`** (explicit, user-confirmed). Same discipline as the
> `03-schema.md` placeholder; reconcile to one number when the boards merge.

## 1. Scope

All JSON-LD / Schema.org for the site, via `nuxt-schema-org` (v6.0.4), baked into
prerendered static HTML:

- **Site identity:** `Organization` (`/#identity`) + auto `WebSite` + per-route
  `WebPage`, interlinked by `@id`. Canonical boilerplate description, `knowsAbout`,
  `disambiguatingDescription` (homonym), `areaServed`, `email`, `address` (ZA).
- **Per-template:** `WebPage`/`CollectionPage`/`ItemPage`, `BreadcrumbList`,
  `Service` (×30 live systems), `ItemList` (`/systems`), and **`FAQPage`** on every
  page that renders a visible FAQ block (home + 7 systems).
- **Reusable patterns:** `useContentSchema.ts` — `useFaqSchema` (used) and
  `useArticleSchema` (ready; no blog pages exist yet).

**Out of scope / hand-offs:** per-page meta/OG/canonical → S02/S05; sitemap/robots/
umbrella module → S01; FAQ *copy* + blog *posts* → S06/S07/S10; verified `sameAs`
profiles + Wikidata + logo asset → S07/S10/design; NAP for `LocalBusiness` → S04/S10.

## 2. Method

1. `nuxt-schema-org@6.0.4` (standalone; the `@nuxtjs/seo` umbrella bundles it —
   S01 dedupes on rebase). Identity in `nuxt.config` (`site` + `schemaOrg.identity`);
   per-template nodes via `useSchemaOrg` in page `<script setup>`.
2. **Integrated S07's AEO FAQ content** as a dependency so FAQPage markup matches
   *visible* content: `app/data/site-faqs.ts`, `systems.ts` `AEO_CONTENT`, and the
   `AnswerBlock`/`FaqList`/`TheFaq` components (S07-owned, **unchanged**) now render
   the FAQs; my FAQPage JSON-LD reads the **same** `faqs` arrays, so the Q&A text is
   byte-identical by construction. Only the schema injection in `index.vue`/`[slug].vue`
   (a shared, multi-owner page — schema is S03's concern) is mine.
3. `npx nuxt generate` → JSON-LD in `.output/public/**` (server-rendered).
4. `scripts/validate-schema.mjs` (committed) — parses every page's JSON-LD and the
   rendered DOM, and asserts the checks in §3. **ALL CHECKS PASSED.**
   `[E: 08/validation-report.txt]`
5. Saved rendered graphs + a **Rich Results Test paste-in bundle** to `_evidence/08/`.

Built in an isolated git worktree **outside OneDrive** with a dedicated
`node_modules` (a shared/junctioned one caused ESM prerender failures under
concurrent multi-session builds).

## 3. Current state (findings)

| Template / page | Nodes emitted (server-rendered) | Evidence |
|---|---|---|
| **Site-wide** | `Organization` (`/#identity`) + `WebSite` (publisher → org) + per-route `WebPage` (about → org, isPartOf → website) | `jsonld__home.json` |
| **Home** `/` | site-wide graph **+ `FAQPage`** with 5 `Question`s (= `HOME_FAQS`), `mainEntity`-linked | `jsonld__home.json` |
| **Systems index** `/systems` | `WebPage`+`CollectionPage` + `BreadcrumbList` + `ItemList` (30 live systems, 1..30) | `jsonld__systems-index.json` |
| **System (with FAQ)** ×7 | `WebPage`+`ItemPage`**+`FAQPage`** + `BreadcrumbList`(3) + `Service`(provider → org) + 3–4 `Question`s | `jsonld__system-bespoke-crm.json` |
| **System (no FAQ)** ×23 | `WebPage`+`ItemPage` + `BreadcrumbList`(3) + `Service` (no FAQPage) | `jsonld__system-integration-hub.json` |
| **Diagnose** `/diagnose` | `WebPage` only (no FAQPage — a form, not Q&A) | `jsonld__diagnose.json` |

**Validation (all PASS) `[E: 08/validation-report.txt]`:**
- Valid JSON-LD; one block/page; expected `@type`s server-rendered.
- `@id` unique within each page; every `@id` ref (`publisher`/`about`/`isPartOf`/
  `provider`/`breadcrumb`/`mainEntity`) resolves in-graph.
- `Service.description` === the page's served `<meta name="description">`.
- **FAQ byte-identity:** every `Question.name`/`acceptedAnswer.text` === the rendered
  `<FaqList>` `<dt>`/`<dd>` text, byte-for-byte (8 FAQ pages, 33 Q&As).
- `FAQPage.mainEntity` links exactly the page's `Question` nodes.
- 23 non-FAQ system pages emit no `FAQPage`/`Question` (no markup-only claims).
- **Organization:** `description` + `knowsAbout` byte-exact to the GEO standard;
  `disambiguatingDescription` present; `areaServed` = SA + 3 metros; **no** `sameAs`,
  **no** `logo` (deliberate — §4).

**Entity (GEO).** `description`/`knowsAbout` are byte-identical to
`07-geo-entity-plan.md` boilerplate B + `public/llms.txt` (one entity, one
description — divergence splits the entity). `disambiguatingDescription` encodes the
"different from Zabble, Inc. (US)" disambiguation that GEO flagged as the #1 entity
risk `[E: 07/llm-response__pplx-sonarpro__brand-zabble.json]`.

**Type choice — `Service`, not `Product`/`SoftwareApplication`:** bespoke
build/consulting engagement, no price/SKU/offers to populate truthfully.

## 4. Gaps & opportunities

| # | Pri | Gap | Status / why |
|---|-----|-----|------|
| G1 | **P1** | `sameAs` absent | **Blocked by design.** 07-geo §2/§4 + 04 local plan: every profile (LinkedIn/Crunchbase/Wikidata/GBP) is PENDING — "add a `sameAs` only once the profile is live." Wired-on-arrival (commented block in `nuxt.config`); S10 supplies URLs. |
| G2 | **P1** | `Organization.logo` absent | **Blocked + wired.** No ≥112×112 brand asset in `/public` (only `favicon.ico`); 04 GBP plan §2.5 also needs it. One-line uncomment in `nuxt.config` the moment `/public/zabble-logo.png` lands. |
| G3 | P2 | Wikidata `different from (P1889)` | Encoded today via `disambiguatingDescription`. The structured Wikidata link is sequenced after Zabble earns ≥1 reference (07-geo §3, S10); add its URL to `sameAs` then. |
| G4 | P2 | `Article`/`BlogPosting` not emitted | **No blog pages exist** — S10 shipped content *briefs* (`docs/seo/content/briefs/`), not live `app/pages` posts. `useArticleSchema` is built and ready; emit per post when the blog ships. |
| G5 | P2 | `LocalBusiness` not used | No verified NAP (04 local plan **blocker B6** — name/address/phone pending). `Organization` + `areaServed` (SA + metros) is the correct, truthful state today; upgrade when S04/S10 confirm NAP. |
| G6 | P3 | 23 systems have no FAQ | Only 7 systems + home have researched FAQ copy (S07 fills more over time). Those pages gain `FAQPage` automatically — it is data-only, no schema change. |

**Resolved since the prior pass:** FAQPage emitted (was a ready-but-unused pattern);
Organization description/`knowsAbout` aligned to the canonical boilerplate;
disambiguation added; `areaServed` enriched from the local plan.

## 5. Recommendations

| # | Pri | Recommendation | Owner | Evidence |
|---|-----|----------------|-------|----------|
| 1 | P0 | Merge this schema foundation (after S01 + S07 land) | S01 then S03 | `_evidence/08/` |
| 2 | P1 | Supply verified profile URLs → wire `sameAs` (uncomment block) | S10 → S03 | G1 |
| 3 | P1 | Add `/public/zabble-logo.png` (≥112×112, white) → uncomment `logo` | S01/design → S03 | G2 |
| 4 | P1 | At launch, run Google Rich Results Test + `validator.schema.org` on live URLs (paste from `_evidence/08/rrt-paste-in.md`) | S01/S10 | rrt-paste-in.md |
| 5 | P2 | As S07 researches more system FAQ sets, they render + emit automatically — no code change | S07 | systems.ts |
| 6 | P2 | When the blog ships, call `useArticleSchema({...})` per post | S06/S10 → S03 | G4 |
| 7 | P2 | On verified NAP, upgrade identity to `LocalBusiness` | S04/S10 → S03 | G5 |
| 8 | P2 | S01: dedupe `nuxt-schema-org` vs the umbrella; keep `site`+`schemaOrg` | S01 | nuxt.config.ts |

## 6. Cross-session asks

- **S07 (AEO) — RESOLVED:** FAQ content delivered and integrated; FAQPage now emits
  byte-identically on home + all 7 systems that have FAQs. As you add more system
  FAQ sets to `AEO_CONTENT`, FAQPage follows for free.
- **S07-geo (entity) — RESOLVED (schema side):** boilerplate B + `knowsAbout`
  applied byte-exact; `disambiguatingDescription` carries the "not Zabble, Inc."
  signal. Still owed by **S10**: live profile URLs (`sameAs`) + the Wikidata item.
- **S04 (local) — PARTIALLY RESOLVED:** `areaServed` = SA + Jhb/CPT/Pretoria added.
  `LocalBusiness`/NAP awaits blocker **B6** (registered name + address + phone).
- **S01:** `nuxt-schema-org` + provisional `site` in `nuxt.config` — dedupe vs the
  umbrella on rebase; provide the logo asset (G2).
- **S10/design:** verified profile URLs (G1), logo (G2), Wikidata item (G3), blog
  pages (G4).

## 7. Evidence index

Under `docs/seo/_evidence/08/`:
- `validation-report.txt` — full `scripts/validate-schema.mjs` run; **ALL CHECKS PASSED** (8 FAQ pages byte-verified, 30 Services, identity, no `@id` collisions).
- `jsonld__home.json` — identity + home FAQPage(5).
- `jsonld__system-bespoke-crm.json` — system **with** FAQ (WebPage/ItemPage/FAQPage + Breadcrumb + Service + 4 Questions).
- `jsonld__system-integration-hub.json` — system **without** FAQ (Service, no FAQPage).
- `jsonld__systems-index.json` — CollectionPage + Breadcrumb + ItemList(30).
- `jsonld__diagnose.json` — WebPage only (no FAQPage).
- `rrt-paste-in.md` + `rrt-paste-in__*.html` — exact JSON-LD for the live Google Rich Results Test (launch-checklist item).
- `README.note.md` — provenance, method, RRT caveat.
