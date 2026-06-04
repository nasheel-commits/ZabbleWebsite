# Audit 04 — Site Architecture & Internal Linking

- **Session:** 04
- **Branch:** seo/04-architecture
- **Owner:** S04 (SEO information architect)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (knowledge base + access). Soft handshake with 05 (keyword
  clusters for anchor text), 01 (routing/routeRules/sitemap/canonical), 02
  (per-page meta + page template SEO regions), 03 (BreadcrumbList + hub schema),
  06 (hub/use-case/industry copy).
- **Layer(s):** SEO (Foundation for AEO/GEO entity structure).

> **Numbering / role mapping.** The goal brief labels this "S2 / 02-architecture"
> and refers to "S1" (routing) and "S5" (page templates). In *this repo's*
> binding conventions (`../00-conventions.md` §1), Site Architecture is **session
> 04**; "02" is On-Page. Mapping used throughout: brief **S1 → repo S01**
> (Technical: routing, routeRules, sitemap, canonical, robots); brief **S5 → repo
> S02** (On-Page: per-page `useSeoMeta` + page template SEO) **and S06** (copy);
> the keyword map this anchors to is **S05's**. Deliverables live at the repo's
> canonical paths (`audits/04-*`, `seo/04-architecture`).

## 1. Scope

URL taxonomy; site map / hub-and-spoke clustering; the internal-link graph
(crawl depth, in/out-degree, orphans, anchor text); breadcrumbs; and the
navigation components that make every module reachable ≤3 clicks from home with
no orphans.

**Deliverables (all on this branch):**
- This audit (current-state graph + proposed IA + ranked issues + recs).
- `../targets/site-architecture.md` — URL taxonomy + full sitemap tree.
- `../targets/internal-linking.md` — link rule set (L1–L12) + anchor-text strategy.
- Components: `app/components/SeoBreadcrumb.vue`, `app/components/RelatedSystems.vue`,
  `app/composables/useRelatedSystems.ts`; wired into `systems/index.vue` and
  `systems/[slug].vue` (navigation regions only).
- Evidence: `../_evidence/04/` link-graph export + method notes.

**Out of scope / hand-offs:**
- **S01** — routing, `routeRules`, trailing-slash policy, `sitemap.xml`
  generation/exclusions, canonical config, 301/410 redirects. *I do not edit
  routing; requested via Open Requests below.*
- **S02** — per-page `useSeoMeta`/titles/descriptions; wiring breadcrumb/related
  blocks into any remaining page templates.
- **S03** — `BreadcrumbList` JSON-LD and pillar/industry hub schema.
- **S05** — keyword volume/KD/intent that turns seed anchors into verified targets.
- **S06** — copy for `/systems` hero, pillar hubs, industry hubs, use-cases, blog.

## 2. Method

No crawlable build exists yet (**pre-launch**; staging URL is blocker **B3**), and
a live DataForSEO On-Page call returned **HTTP 401** in this session (MCP env not
loaded — documented caveat in `status.md`; *not* an account issue). See
`../_evidence/04/on-page-instant__zabble-org__live-401.note.md`.

The site is **statically prerendered** (`nitro.prerender` + `routeRules`,
`crawlLinks: true`), so the prerendered HTML is a deterministic function of the
page/component source + `app/data/systems.ts`. I therefore built the current-state
link graph by **static source analysis** — enumerating every `<NuxtLink :to>` /
`<a :href>` edge across the components rendered on each route — which reproduces
exactly what a crawler would find on `.output/public/**`. Method + reproduction in
`../_evidence/04/link-graph__zabble__static.note.md`; the adjacency export is
`../_evidence/04/link-graph__zabble__static.json`.

Files read: `app/pages/{index,diagnose}.vue`, `app/pages/systems/{index,[slug]}.vue`,
`app/components/{TheNav,TheFooter,TheHero,TheMeet,TheDoNothing,TheFinalCta,CtaStrip,SystemCard,PillarChip,SystemHero}.vue`,
`app/data/systems.ts` (commit `b2962e1`).

**Validation owed once B3 lands:** re-run as live DataForSEO On-Page (`/on_page`
`/links`) from an env-loaded session to confirm depth/orphan findings against
rendered HTML.

## 3. Current state (findings)

**Route inventory** `[E: 04/link-graph__zabble__static.json]`

| Route | Instances | Depth from `/` | Notes |
|---|---|---|---|
| `/` | 1 | 0 | Home. Body links only to `/diagnose` + hash anchors. |
| `/systems` | 1 | 1 | Modules hub. Lists **live only** (index.vue line 50). |
| `/systems/<slug>` | **30 live** | 2 | Money pages. Reachable only via the `/systems` grid card. |
| `/systems/<slug>` | **2 concept** | ∞ | `legal-intake-automation`, `hospitality-booking-marketing-dashboard` — render 200 with TODO copy, **linked from nowhere**. |
| `/systems?pillar=<slug>` | 4 | 2 | Faceted filter views; crawlable; no unique content. |
| `/diagnose` | 1 | 1 | Conversion. Over-linked (nav CTA + body CTAs everywhere). |

**Sitewide chrome** `[E: 04/link-graph__zabble__static.json]`
- **Nav** (`TheNav`, every page): → `/` (logo + 3 hash tabs), `/systems`,
  `/diagnose`. No module/pillar links.
- **Footer** (`TheFooter`, every page): → `/` (3 hash tabs), `mailto:`. **No
  `/systems` link, no module links** — footer equity never reaches the money set.

**Link-graph metrics (baseline)**

| Metric | Today | Why it matters |
|---|---|---|
| In-degree, each live module | **1** | Single point of failure; minimal equity; weak ranking signal. |
| Out-degree module → sibling modules | **0** | Each module is a near-dead-end; no topical cluster. |
| Orphan pages (indexable, in-degree 0) | **2** | Concept pages crawlable but unreachable + thin. |
| Indexable pillar hub pages | **0** | No anchor page for pillar topical authority. |
| Home body links to `/systems` or modules | **0** | "What We Build" (4-pillar section) links nowhere. |
| Faceted duplicate URLs | **4** | `?pillar=` views compete with `/systems`. |
| Primary money-page anchor text | generic | "View system" / aria "View `<name>`" — no descriptive anchor. |
| Breadcrumb | partial | `[slug].vue` had a single "← All systems" back-link; no `Home›Systems›Name`, no `BreadcrumbList`. |

**What's already good (keep):** static prerender → crawlers get full HTML;
`/systems` is in global nav (hub at depth 1); module slugs are clean,
lowercase-hyphenated, and human-readable; `[slug].vue` 404s correctly on unknown
slugs; data is centralised in `systems.ts` (single source for sitemap + links).

## 4. Gaps & opportunities (severity-ranked)

| ID | Sev | Issue | Evidence |
|---|---|---|---|
| **A1** | **P0** | **2 orphan + thin pages.** Concept modules render 200 with placeholder TODO copy, linked from nowhere; `[slug].vue` has no `status` guard (only 404s unknown slugs). Indexable thin content + orphan. | `[E: 04/link-graph__zabble__static.json#issues.A1]` |
| **A2** | **P0** | **Weak cluster / no spokes.** Every live module = in-degree 1, sibling out-degree 0. No hub-and-spoke depth; equity can't flow between related modules; no topical clustering. | `…#A2` |
| **A3** | **P1** | **No pillar hubs.** The 4 pillars exist only as `?pillar=` facets with no unique content → no page to build pillar-level topical authority or to receive pillar head-terms. | `…#A3` |
| **A4** | **P1** | **Footer omits `/systems` + modules.** Cheapest sitewide depth-flattener is unused. | `…#A4` |
| **A5** | **P1** | **Faceted duplicates.** `/systems?pillar=` (×4) crawlable, no unique content → dilution / cannibalisation of `/systems`. | `…#A5` |
| **A6** | **P2** | **Generic anchor text** into money pages ("View system"). No descriptive, keyword-aligned anchors. | `…#A6` |
| **A7** | **P2** | **Thin/duplicate meta risk.** `/systems` title is placeholder; 30 same-shaped module pages derive meta from `tagline` only (S02/S06 own the fix; flagged for cannibalisation guard). | `…#A7` |

**Opportunity:** a hub-and-spoke with pillar hubs + footer/home links + related-
systems turns 30 in-degree-1 stars into a connected mesh where each money page
gets in-degree ≥4 (rule L2), all hubs sit at depth 1, and AI engines can read the
`pillar → module → industry` graph from URLs + links alone (GEO infrastructure).

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| R1 | **P0** | **De-orphan the 2 concept pages**: `noindex,follow` + exclude from `sitemap.xml` until real copy exists; gate `[slug].vue` to 404/410 non-`live` slugs, or publish copy (S06). | S01 (sitemap/robots) + data `systems.ts` guard / OR-4 | A1 |
| R2 | **P0** | **Related-systems block** on every module page → 3–6 shared-pillar siblings. **Done** (`RelatedSystems.vue` wired into `[slug].vue`). | S04 (this branch) | A2 |
| R3 | **P1** | **Create 4 pillar hubs** `/what-we-build/<pillar>`, each linking all member modules (membership table in `site-architecture.md` §3.1). | S06 copy + S01 route + S04 links / OR-7 | A3 |
| R4 | **P1** | **Footer pillar/module block**: link `/systems` + 4 pillar hubs + `/diagnose` sitewide. | S02/S06 (`TheFooter.vue`) / OR-6 | A4 |
| R5 | **P1** | **Home "What We Build" → 4 pillar hubs + `/systems`** (currently links nothing). | S06 (`TheWhatWeBuild.vue`) / OR-6 | A3, A2 |
| R6 | **P1** | **Canonicalise/contain facets**: `/systems?pillar=` → canonical `/systems` or `noindex,follow`; keep chips as UX but ensure the indexable pillar path is the hub. | S01 + S03 / OR-3 | A5 |
| R7 | **P1** | **Real breadcrumbs** `Home›Systems›<Name>` + `BreadcrumbList` JSON-LD. Visible trail **done** (`SeoBreadcrumb.vue` wired into `[slug].vue` + `index.vue`); schema handed to S03. | S04 (done) + S03 (schema) / OR-8 | A6 |
| R8 | **P2** | **Descriptive anchors**: upgrade `/systems` card so the module **name** is the link heading; use capability anchors from `internal-linking.md` §2.2 on hubs/use-cases. | S02 (`SystemCard.vue`) + S06 / OR-5 | A6 |
| R9 | **P2** | **Industry hubs** `/solutions/<industry>` (7 seeds, §3.2) + **use-cases** `/use-cases/<slug>` as content scales. | S06 + S01 routes | A2 |
| R10 | **P2** | **Distinct, intent-bearing meta** per module (add `seoTitle`/`seoDescription` to `System`); cannibalisation guard via `keyword-map.md` §3. | S02 + S05/S06 | A7 |

## 6. Cross-session asks (Open Requests — mirrored in `status.md`)

| Ref | To | Ask | Priority |
|---|---|---|---|
| **OR-1** | S01 | Decide + document **trailing-slash policy** (`routeRules`); confirm clean-URL canonical form for the taxonomy in `site-architecture.md` §2. | P2 |
| **OR-2** | S01 | Adopt **"published slugs are immutable; rename ⇒ 301"** policy in routing; add redirect map mechanism. | P1 |
| **OR-3** | S01 + S03 | **Faceted `/systems?pillar=` → canonical `/systems`** (or `noindex,follow`); ensure not the sole path to a pillar. | P1 |
| **OR-4** | S01 (+ S06) | **noindex + sitemap-exclude** `legal-intake-automation` & `hospitality-booking-marketing-dashboard`; gate `[slug].vue` to non-`live` slugs (404/410) or have S06 publish copy. | **P0** |
| **OR-5** | S02 | Upgrade `SystemCard` anchor so the **module name** is the link text (A6/R8); review the breadcrumb/related blocks S04 added to page templates (navigation regions only — meta blocks untouched). | P2 |
| ~~**OR-6**~~ | S04 ✓ | **DONE by S04** — footer block (`/systems` + 4 hubs) and home "What We Build" → hubs implemented (§8). S06 may refine footer copy only. | ~~P1~~ |
| ~~**OR-7**~~ | S04 ✓ | **DONE by S04** — 4 pillar hubs live at `/what-we-build/<pillar>` with full membership linking (§8). S06 may enrich hub prose; S01 may add hubs to `sitemap.xml` (currently auto-discovered via `crawlLinks`). | ~~P1~~ |
| **OR-8** | S03 | **`BreadcrumbList` JSON-LD** matching the visible `SeoBreadcrumb` 1:1 on all non-home pages; hub schema for pillar/industry pages. | P1 |
| **OR-9** | S05 | **Verify the 10 seed anchor clusters** (`internal-linking.md` §2.2) + one "…South Africa" variant per module, for non-repeating geo-anchors. (Also appended to `keyword-map.md` §4.) | P1 |

## 7. Evidence index

Files under `../_evidence/04/`:
- `link-graph__zabble__static.json` — current-state internal link adjacency
  (routes, sitewide-component edges, per-page edges, in-degree summary, detected
  issues A1–A7). The quantitative backbone of §3–§4.
- `link-graph__zabble__static.note.md` — method + full reproduction steps for the
  static-source link graph; why static analysis is the authoritative pre-launch
  method; what to re-run once B3 lands.
- `on-page-instant__zabble-org__live-401.note.md` — record of the live DataForSEO
  On-Page attempt returning HTTP 401 (env not loaded) + pre-launch context.

## 8. Implementation log (the audit, built)

The recommendations above are **implemented, tested, and committed** on
`seo/04-architecture` (built in an isolated git worktree outside OneDrive with a
dedicated `node_modules`, so concurrent sessions' edits to the shared checkout
could not affect the build). `nuxt generate` exits **0** (76 routes, 39 HTML
pages); **16/16** automated checks pass.

**Commits:** `bbec6b7` (audit + targets + breadcrumb/related components),
`5b86c9b` (pillar hubs + nav wiring), `3e1df3b` (balanced related + tests).

### What was built

| Rec | Built | Files |
|---|---|---|
| R3 (P1) — 4 pillar hubs | **DONE** — real server-rendered hubs at `/what-we-build/<pillar>`; each introduces the pillar and links every live member; prerendered via `crawlLinks`. | `app/data/pillars.ts`, `app/pages/what-we-build/[pillar].vue` |
| R2 (P0) — related-systems on every module | **DONE** — `RelatedSystems` wired into `[slug].vue`; selection is **coverage-balanced** so inbound is even and every module has in-degree ≥4 (the naive top-N left 8 niche modules at 3). | `RelatedSystems.vue`, `useRelatedSystems.ts`, `systems/[slug].vue` |
| R4 (P1) — footer hub block | **DONE** — sitewide footer links `/systems` + 4 hubs (L7). | `TheFooter.vue` |
| R5 (P1) — home → hubs | **DONE** — "What We Build" cards link the 4 hubs (L8). | `TheWhatWeBuild.vue` |
| R6 (P1) — contain facets | **DONE (S04 side)** — `PillarChip` link mode now targets `/what-we-build/<slug>`; faceted `?pillar=` links removed from the crawl graph (filter bar is button-only UX). Canonical/robots remains S01 (OR-3). | `PillarChip.vue` |
| R7 (P1) — breadcrumbs | **DONE** — `SeoBreadcrumb` on `/systems`, every module page, every pillar hub; `BreadcrumbList` JSON-LD still S03 (OR-8). | `SeoBreadcrumb.vue`, `systems/index.vue`, `systems/[slug].vue`, `[pillar].vue` |
| R1 (P0) — de-orphan concept pages | **DONE (S04 side)** — concept pages excluded from every link surface; `crawlLinks` no longer generates them (verified by test). Indexing guard (`noindex`/410/sitemap) remains S01 (OR-4). | `pillars.ts` (live-only members), `systems/index.vue` (live-only grid) |
| — module → pillar back-links | **DONE** — owned-pillar cards on the module page link up to their hub (L2/L6). | `systems/[slug].vue` |
| — `/systems` → hubs | **DONE** — "Browse by pillar" row (L6 reciprocal). | `systems/index.vue` |

### Tests (`tests/architecture.test.mjs`, `npm run test:arch`)

Dependency-free (`node:test`), run against the generated `.output/public`:
zero orphans (L3), depth ≤3 (L1), breadcrumbs on every relevant template (L4),
hub↔member closure (L6/L2), module in-degree ≥4 (L2), ≥3 related siblings per
module (L5), `/diagnose` is a link sink (L9), no faceted `?pillar=` links (L10),
concept pages delinked + not generated, descriptive hub anchors (L11), and a full
internal link-checker. `npm test` re-generates then asserts.

### Design decisions worth recording
- **`/diagnose` is exempt** from breadcrumb and the sitewide footer block: it is a
  full-screen conversion funnel with its own minimal chrome and is a deliberate
  link **sink** (L9). It stays reachable (depth 1) and links home. The tests
  encode this exemption explicitly.
- **Pillar = cross-cutting cluster, not breadcrumb spine.** Module breadcrumb
  stays `Home › Systems › <Module>`; pillar hubs are reached via footer/home/chips
  and link bidirectionally. A module belongs to 2–4 hubs (union membership),
  which is exactly what raises its in-degree.
- **Coverage-balanced related selection** is the non-obvious fix that makes L2
  (in-degree ≥4) hold for *every* module rather than only the popular ones.
