# Audit 03 — Keyword & Market Research (South Africa)

- **Session:** 03 (Keyword & Market Research) — *this session's branch is `seo/03-keywords`;
  the original `00-conventions.md` table numbered keyword research as "05". See
  `decisions/0002-session-numbering-and-worktree.md`. The keyword-research audit skeleton at
  `audits/05-keywords.md` is superseded by this file.*
- **Branch:** `seo/03-keywords` (worked in an isolated git worktree — see §2 / ADR-0002)
- **Owner:** SEO strategist (keyword research)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (DataForSEO verified + funded — both delivered)
- **Layer(s):** SEO (feeds AEO + GEO)

## 1. Scope

**Covers:** the South-Africa keyword universe for Zabble — brand/entity, the core bespoke-
systems offering, the 4 pillars, all 30 module money pages, key industries, and AEO/GEO
question intent. Produces the two shared deliverables every downstream session reads:
- `targets/keyword-map.md` — 213-keyword map: keyword → cluster → intent → funnel → volume/
  KD/CPC (source+date) → SERP features → target page → module/pillar → priority tier, plus
  the "uber" head-target set and the scoring method.
- `targets/intent-clusters.md` — topical clusters with primary (hub/money) and supporting
  (use-case/blog/FAQ) page roles, and per-cluster AEO question sets.

**Explicitly out of scope / hand-offs:**
- **On-page assignment** of the primary keyword into title/H1/body → S02 (on-page).
- **FAQ blocks + `FAQPage`/`Organization`/`LocalBusiness` schema** → schema session + S07.
- **Page creation** (pillar hubs, industry pages, blog/use-case) → S06 (content).
- **GEO entity definitions + corroboration** → S08; **GBP / local SEO / measurement** → S10.
- **Backlink / competitor-domain teardown** → S10 (not run here).

## 2. Method

All queries: `location_name: "South Africa"` (code `2710`), `language_code: "en"`, captured
**2026-06-04**, via the live REST API (HTTP Basic from `.env`; Authorization redacted in all
evidence). Sandbox used first to confirm response shape (free), then live with `limit` +
`order_by` filters to control spend (conventions / cost discipline).

**Working environment (important):** the shared repo checkout was being branch-switched and
`git clean`-ed by other parallel SEO sessions, which deleted an initial set of uncommitted
evidence. All work was redone in an **isolated git worktree** at
`C:/Users/nashe/zabble-seo-03-keywords` (outside OneDrive), with **frequent commits**. See
`decisions/0002-session-numbering-and-worktree.md`.

**Pipeline:**
1. **Balance check first** (constraint): `GET /v3/appendix/user_data` → `money.balance`
   $50.998 at start `[E: userdata__balance__live.json shows $49.636 post-run]`.
2. **Seed → discovery:** 8× `dataforseo_labs/google/keyword_ideas/live` across thematic
   clusters (core-automation, crm-sales, finance-ops, document-ai, compliance-fraud,
   integration-data, inventory-forecast-maint, industry-saas) to learn what carries real ZA
   demand `[E: labs-keyword-ideas__*__za.json]`.
3. **Long-tail mining:** 6× `keyword_suggestions/live` on the strongest commercial heads
   (software-development-company, crm-software, inventory-management-software, accounting-
   software, business-automation, case-management-software) `[E: labs-keyword-suggestions__*]`.
4. **Curated universe (213 kw):** authored from the 30 modules / 4 pillars / industries /
   problem language / AEO questions (`_evidence/03/_build_curated.py`, list in
   `curated-keywords.json`), then exact metrics for **every** term via the trio:
   - `keywords_data/google_ads/search_volume/live` → volume, CPC, competition `[E: gads-search-volume__curated__za.json]`
   - `dataforseo_labs/google/bulk_keyword_difficulty/live` → KD `[E: labs-bulk-kd__curated__za.json]`
   - `dataforseo_labs/google/search_intent/live` → intent `[E: labs-search-intent__curated__za.json]`
   *(`keyword_overview` was rejected mid-build: it silently drops zero/no-data keywords and
   returned null KD — dishonest for reporting thin demand. The trio returns a row for every
   term incl. `n/d`.)*
5. **SERP features:** 10× `serp/google/organic/live/advanced` on representative cluster
   queries → AI Overview / PAA / local pack / video presence + extracted PAA question text
   `[E: serp-advanced__*__za.json, serp-paa-questions__clusters__za.json]`.
6. **Merge + score + map** in `_merge.py` / `_gen_map.py` → `consolidated.json` → the map table.

**Spend:** recorded `cost` per response. This worktree's pull = **$0.4336**. Total session
burn incl. the clobbered first pull + structural sandbox/test calls = **$1.362** (balance
$50.998 → $49.636). Well within the funded $51. Standard live Labs/Keywords queue.

## 3. Current state (findings)

| # | Finding | Evidence |
|---|---------|----------|
| F1 | **ZA exact-match demand for bespoke-B2B language is thin.** keyword_ideas expansions are dominated by navigational/consumer/education noise (bank logins, `capfin loan` 165k, `software engineer jobs`, `nmu information system`); genuine bespoke-systems demand barely registers. | `labs-keyword-ideas__*__za.json` |
| F2 | **The real commercial heads are generic software categories + ZA mid-tail.** `crm` 8 100, `erp system` 4 400, `accounting software south africa` 480, `inventory management software` 260, `crm software south africa` 320 (KD 18), `crm software in south africa` 320 (**KD 2**), `software development company south africa` 260. | `gads-…`, `labs-bulk-kd-…`, `labs-keyword-suggestions__crm-software__za.json` |
| F3 | **173 of 213 curated terms have measurable ZA volume; 40 return `n/d`.** Most of the 30 module heads sit at 10–70/mo. High deal value makes low-volume/high-intent acceptable. | `consolidated.json` |
| F4 | **AI Overview on 9/10, PAA on 8/10** Zabble-relevant SERPs checked. GEO + AEO are mandatory, not optional. | `serp-advanced__*`, `serp-paa-questions__clusters__za.json` |
| F5 | **Local pack fires on the core offering** (`custom software development south africa`, `who builds custom software in south africa`). GBP + `LocalBusiness` schema is a direct lever. | `serp-advanced__custom-software-dev-za__za.json`, `…__who-builds-custom-software-za__za.json` |
| F6 | **POPIA is the cleanest SA-unique play.** `popia compliance` 260 (transactional) + `what is popia` 390 (informational, AIO+PAA+Video) → the Compliance Reporting money page + its FAQ. | `gads-…`, `serp-advanced__what-is-popia__za.json`, `…__popia-compliance__za.json` |
| F7 | **`operational systems` 2 400/mo is a volume trap** — ZA intent skews academic ("operating systems"); low business fit. Flagged not to over-invest. | `consolidated.json` (intent=informational), `keyword-map.md` §5 |
| F8 | **Bespoke CRM is the highest-opportunity cluster** — two 320/mo terms at KD 2 and 18. | `gads-…`, `labs-bulk-kd-…` |

Baseline for measurement: brand `zabble` = 10/mo (pre-launch); the program's tracked heads
are the 10 uber targets in `keyword-map.md` §2.

## 4. Gaps & opportunities (prioritised)

- **P0 — Win the winnable commercial heads.** `crm software (in) south africa`, `inventory
  management software`, `accounting software south africa`, `popia compliance` — real volume,
  KD ≤ 27, clean money-page fit. On-page + distinct copy (S02/S06).
- **P0 — Stand up GEO/AEO now.** With AIO on ~every head, the liftable per-module definition
  + `FAQPage` schema + Organization entity is the highest-leverage work (S07/S08/schema).
- **P1 — Claim the local pack.** GBP + `LocalBusiness` + consistent NAP for the home/offering
  page (S10).
- **P1 — POPIA content spine.** `what is popia` explainer → `/systems/compliance-reporting`.
- **P2 — Pillar hubs + industry pages** to host long-tail and structure topical authority (S06).
- **P2 — Don't build thin geo-variants** for the ~20 sub-50/mo module heads; serve them via
  AEO/GEO + the single money page.

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| 1 | P0 | Assign each `/systems/<slug>` its primary keyword from `intent-clusters.md` §2 into title/H1/H2/body; keep copy distinct (anti-cannibalisation). | S02 on-page | `keyword-map.md` §4 |
| 2 | P0 | Flagship the Bespoke CRM page on `crm software (in) south africa`; lead with bespoke-vs-SaaS. | S02/S06 | F8 |
| 3 | P0 | Add `FAQPage` schema + first-40-words answers for the §3 question sets (PAA-eligible on 8/10). | schema session + S07 | F4 |
| 4 | P0 | Establish the `Organization` entity + per-module liftable definitions for AI Overviews. | S08 (schema) | F4 |
| 5 | P1 | Create Google Business Profile + `LocalBusiness` schema + consistent NAP. | S10 (+schema) | F5 |
| 6 | P1 | Build the POPIA content spine (`what is popia` → compliance-reporting). | S06/S07 | F6 |
| 7 | P2 | Create the 4 pillar hubs + priority industry pages; wire internal links to modules. | S06 / S04 | `intent-clusters.md` §2,§5 |
| 8 | P2 | Treat `operational systems` as low-priority; do not target as a core head. | S02/S06 | F7 |

## 6. Cross-session asks (mirror into each target session's status.md notes)

- **Schema session:** `FAQPage` on money pages, `Organization` + `sameAs`, `LocalBusiness`
  (local pack present). — *Rec 3,4,5.*
- **S07 (AEO):** build first-40-word answers for the per-cluster question sets in
  `intent-clusters.md` §3; PAA winnable on 8/10. — *Rec 3.*
- **S08 (GEO):** AIO on ~all heads → liftable per-module entity definitions. — *Rec 4.*
- **S10 (off-page/local):** GBP + NAP consistency for the local pack; backlink/competitor
  teardown not done here. — *Rec 5.*
- **S06 (content):** pillar hubs + industry pages + POPIA spine; distinct per-module copy
  (thin-content is the #1 risk). — *Rec 6,7.*
- **S02 (on-page):** primary-keyword assignment per `intent-clusters.md` §2. — *Rec 1,2.*

## 7. Evidence index (`_evidence/03/`)

- `userdata__balance__live.json` — account balance/health (top status 20000, balance $49.636 post-run).
- `curated-keywords.json` — the 213-keyword curated universe with cluster/page/owner/type/scope tags (the exact query input).
- `gads-search-volume__curated__za.json` — volume/CPC/competition for all 213 (google_ads, $0.075).
- `labs-bulk-kd__curated__za.json` — keyword difficulty for all 213 ($0.0313).
- `labs-search-intent__curated__za.json` — intent label for all 213 ($0.0223).
- `labs-keyword-ideas__{core-automation,crm-sales,finance-ops,document-ai,compliance-fraud,integration-data,inventory-forecast-maint,industry-saas}__za.json` — 8 discovery expansions (landscape; proves F1/F2).
- `labs-keyword-suggestions__{software-development-company,crm-software,inventory-management-software,accounting-software,business-automation,case-management-software}__za.json` — 6 long-tail mines.
- `serp-advanced__*__za.json` — 10 live SERPs (item types → SERP features; proves F4/F5/F6).
- `serp-paa-questions__clusters__za.json` — extracted PAA questions + related searches per query (AEO sets).
- `consolidated.json` — merged + scored dataset (the source of the map table).
- `_build_curated.py`, `_merge.py`, `_gen_map.py` — reproducible generators (method, not data).
