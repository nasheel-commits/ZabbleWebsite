# Site Architecture — URL taxonomy & sitemap tree

- **Owner:** S04 (Site Architecture & Internal Linking) · `seo/04-architecture`
- **Status:** v1 — 2026-06-04
- **Market:** South Africa (`en-ZA`)
- **Reads:** `../audits/04-architecture.md` (evidence), `keyword-map.md` (S05),
  `../reference/nuxt-seo-implementation.md` (S01/S02/S03 implementation).
- **Companion:** `internal-linking.md` (linking rules + anchor text).

> Numbering note: the goal brief labels this workstream "S2 / 02-architecture".
> In *this repo's* binding conventions (`../00-conventions.md` §1) Site
> Architecture is **session 04** (`seo/04-architecture`); "02" is the On-Page
> session. This doc uses the repo numbering. Where the brief says "S1 owns
> routing" → repo **S01 (Technical)**; "coordinate page templates with S5" →
> repo **S02 (On-Page)** for `useSeoMeta`/template SEO and **S06** for copy;
> **S05** owns the keyword map this anchors to.

---

## 1. Design goals

1. **Crawl-efficient** — every money page ≤3 clicks from `/`; no orphans; no
   crawl traps from faceted URLs.
2. **Semantically legible to humans AND AI engines** — the URL itself encodes the
   `pillar → module → use-case → industry` relationships so an LLM can infer the
   entity graph from structure alone (GEO infrastructure; see
   `../reference/aeo-geo-principles.md`).
3. **Stable & scalable** — published slugs never churn; the scheme absorbs blog +
   use-case + industry growth without re-nesting existing money pages.
4. **Equity concentration** — hub-and-spoke funnels authority to the 30 module
   money pages and the 4 pillar hubs, not to conversion or faceted pages.

---

## 2. URL taxonomy (the scheme)

All URLs: **lowercase, hyphen-delimited, ASCII, no stop-words, no trailing
slash** (trailing-slash policy is **S01's** to set in `nuxt.config`/`routeRules`
— see ask **OR-1**). Slugs are **immutable once indexed**; a rename ships a 301
(see `internal-linking.md` and ask **OR-2**).

| Content type | Pattern | Example | Status | Owner of pages |
|---|---|---|---|---|
| Home / brand | `/` | `/` | live | S02 copy |
| Modules hub | `/systems` | `/systems` | live | S04 nav / S06 copy |
| **Module (money page)** | `/systems/<module>` | `/systems/bespoke-crm` | live ×30 | data `systems.ts` + S02/S06 |
| **Pillar hub** | `/what-we-build/<pillar>` | `/what-we-build/automation` | **LIVE ×4** | S04 (`pillars.ts` + `[pillar].vue`) |
| **Industry hub** | `/solutions/<industry>` | `/solutions/ngos` | **planned** | S06 |
| **Use-case** | `/use-cases/<slug>` | `/use-cases/automated-bank-reconciliation` | **planned** | S06 |
| Blog post | `/blog/<slug>` | `/blog/popia-reporting-checklist` | **planned** | S06 |
| Blog taxonomy (opt.) | `/blog/topic/<slug>` | `/blog/topic/automation` | later | S06 |
| Conversion | `/diagnose` | `/diagnose` | live | S02 |

### 2.1 Why these patterns (tradeoffs)

- **Keep `/systems` (not `/modules` or `/products`).** It already exists, is
  already in the prerender list and global nav, and "systems" is the brand's own
  word ("operational systems"). Renaming would churn 31 live URLs for no gain.
  *Tradeoff:* "systems" is less of a head keyword than "software/automation"; we
  recover that in on-page copy and pillar hubs, not in the path.
- **Pillar hubs at `/what-we-build/<pillar>`** rather than root-level
  `/automation`. Rationale: matches the existing site vocabulary (the home
  section + nav are literally "What We Build"), so the home four-pillar block and
  nav link to hubs with **consistent, descriptive anchor text**, and it keeps the
  root namespace clean for future top-level pages. *Tradeoff:* longer path and one
  extra segment vs. a punchy `/automation`. If S05 keyword data shows strong
  exact-match volume for a bare pillar term, a root-level alias (`/automation`
  301→ hub, or canonical) can be revisited — recorded as a future decision, not
  a v1 commitment.
- **`/solutions/<industry>` (not `/industries/`).** "Solutions" is commercial-
  intent and pairs with how buyers search ("automation for NGOs"). Industry is a
  *cross-cut* of modules, so it must be its own branch, not nested under a module.
- **`/use-cases/<slug>` flat (not `/systems/<module>/<use-case>`).** Flat keeps
  every use-case at depth ≤2 from the hub that links it and avoids deep nesting
  that buries pages >3 clicks. A use-case routinely spans multiple modules and an
  industry, so nesting it under one module would misrepresent the relationship.
  *Tradeoff:* the URL doesn't show the parent module; we encode the relationship
  with breadcrumbs + contextual links instead (see `internal-linking.md`).
- **`/blog/<slug>` flat, undated.** Evergreen URLs don't signal staleness and
  never need redirecting when a post is refreshed. *Tradeoff:* no date in URL; we
  expose freshness via `dateModified` schema (S03), not the path.
- **Faceted filter URLs `/systems?pillar=<slug>` are NOT taxonomy.** They are a
  UI convenience and must be **canonicalised to `/systems`** (or `noindex,follow`)
  so they don't compete with the real pillar hubs (issue **A5**; ask **OR-3** to
  S01/S03). The indexable pillar entity is `/what-we-build/<pillar>`.

### 2.2 Canonical hierarchy (breadcrumb parent)

The **canonical parent of a module is `/systems`** — breadcrumb `Home › Systems ›
<Module>`. Pillars and industries are **cross-cutting clusters**, not the
breadcrumb spine (a module legitimately belongs to 2–4 pillars and several
industries; picking one as "the" parent would be arbitrary). Cluster membership
is expressed through contextual links, "related systems", and the hub pages —
not through nesting. This keeps one clean tree for crawlers while still building
multi-pillar topical density through links.

---

## 3. Full sitemap tree

```
/                                           [live]  Home — brand + entity, links to all 4 pillar hubs + /systems
├── /systems                                [live]  Modules hub (canonical parent of all module pages)
│   ├── /systems/kairos                      [live]
│   ├── /systems/approval-workflow           [live]
│   ├── /systems/multi-channel-inbox         [live]
│   ├── /systems/workflow-orchestrator       [live]
│   ├── /systems/decision-engine             [live]
│   ├── /systems/document-intelligence       [live]
│   ├── /systems/document-assembly           [live]
│   ├── /systems/bespoke-crm                 [live]
│   ├── /systems/customer-360                [live]
│   ├── /systems/knowledge-assistant         [live]
│   ├── /systems/lead-qualifier              [live]
│   ├── /systems/legacy-bridge               [live]
│   ├── /systems/inventory-clarity           [live]
│   ├── /systems/client-onboarding           [live]
│   ├── /systems/case-management             [live]
│   ├── /systems/task-management             [live]
│   ├── /systems/field-ops-app               [live]
│   ├── /systems/analytics-suite             [live]
│   ├── /systems/accounting-engine           [live]
│   ├── /systems/compliance-reporting        [live]
│   ├── /systems/continuous-assurance        [live]
│   ├── /systems/pricing-engine              [live]
│   ├── /systems/reconciliation-engine       [live]
│   ├── /systems/data-routing                [live]
│   ├── /systems/integration-hub             [live]
│   ├── /systems/cross-system-sync           [live]
│   ├── /systems/forecasting                 [live]
│   ├── /systems/predictive-maintenance      [live]
│   ├── /systems/master-data-hub             [live]
│   ├── /systems/notification-orchestration  [live]
│   ├── /systems/legal-intake-automation     [CONCEPT/THIN → noindex+exclude until real copy — ask OR-4]
│   └── /systems/hospitality-booking-marketing-dashboard  [CONCEPT/THIN → noindex+exclude — ask OR-4]
│
├── /what-we-build/automation               [LIVE]     Pillar hub → 28 member modules
├── /what-we-build/audit-trails             [LIVE]     Pillar hub → 27 member modules
├── /what-we-build/anomaly-detection        [LIVE]     Pillar hub → 10 member modules
├── /what-we-build/analytics                [LIVE]     Pillar hub → 14 member modules
│
├── /solutions/ngos                         [planned]  Industry hub
├── /solutions/banks                        [planned]
├── /solutions/hotels                       [planned]  (hospitality)
├── /solutions/law-firms                    [planned]
├── /solutions/parts-suppliers              [planned]  (distribution/wholesale)
├── /solutions/agencies                     [planned]
├── /solutions/smbs                         [planned]
│
├── /use-cases/<slug>                       [planned]  e.g. automated-bank-reconciliation,
│                                                       popia-regulatory-reporting, ai-receptionist-for-events,
│                                                       document-data-extraction, demand-forecasting-for-restaurants …
│
├── /blog/<slug>                            [planned]  editorial / informational (AEO/GEO feeders)
│   └── /blog/topic/<slug>                  [later]    optional topic taxonomy
│
└── /diagnose                               [live]     conversion (noindex optional — S01/S02 call)
```

### 3.1 Pillar-hub membership (spokes per hub)

A module appears on **every** pillar hub it claims (union — drives multi-pillar
in-links). Source: `pillars[]` in `app/data/systems.ts`. Hubs **feature** the
modules where the pillar leads and **list** the rest (content shape = S06).

| Pillar hub | Member module slugs (link targets) | Count |
|---|---|---|
| `/what-we-build/automation` | kairos, approval-workflow, multi-channel-inbox, workflow-orchestrator, decision-engine, document-intelligence, document-assembly, bespoke-crm, customer-360, knowledge-assistant, lead-qualifier, legacy-bridge, inventory-clarity, client-onboarding, case-management, task-management, field-ops-app, accounting-engine, compliance-reporting, pricing-engine, reconciliation-engine, data-routing, integration-hub, cross-system-sync, forecasting, predictive-maintenance, master-data-hub, notification-orchestration | 28 |
| `/what-we-build/audit-trails` | kairos, approval-workflow, multi-channel-inbox, workflow-orchestrator, decision-engine, document-intelligence, document-assembly, bespoke-crm, customer-360, knowledge-assistant, lead-qualifier, legacy-bridge, inventory-clarity, client-onboarding, case-management, task-management, field-ops-app, accounting-engine, compliance-reporting, continuous-assurance, pricing-engine, reconciliation-engine, data-routing, integration-hub, cross-system-sync, master-data-hub, notification-orchestration | 27 |
| `/what-we-build/anomaly-detection` | customer-360, analytics-suite, compliance-reporting, continuous-assurance, reconciliation-engine, data-routing, forecasting, predictive-maintenance, master-data-hub, notification-orchestration | 10 |
| `/what-we-build/analytics` | kairos, multi-channel-inbox, decision-engine, bespoke-crm, knowledge-assistant, inventory-clarity, client-onboarding, field-ops-app, analytics-suite, accounting-engine, continuous-assurance, pricing-engine, forecasting, predictive-maintenance | 14 |

> Automation/Audit-Trails hubs are large (the firm is automation-led). To stay
> usable, those hubs feature ~8 lead modules above the fold and group the rest;
> this is a content/layout decision for S06, not a URL change.

### 3.2 Industry → module seeds (for `/solutions/*` spokes)

From the `industry`/`bestFor`/`Where it fits` fields. S06 confirms; S05 sizes.

| Industry hub | Seed module spokes |
|---|---|
| `/solutions/ngos` | case-management, compliance-reporting, data-routing, approval-workflow, field-ops-app |
| `/solutions/banks` | decision-engine, continuous-assurance, approval-workflow, compliance-reporting, reconciliation-engine, data-routing |
| `/solutions/hotels` | kairos, integration-hub, reconciliation-engine, pricing-engine, forecasting, analytics-suite |
| `/solutions/law-firms` | document-intelligence, case-management, task-management, client-onboarding, knowledge-assistant |
| `/solutions/parts-suppliers` | pricing-engine, reconciliation-engine, forecasting, inventory-clarity, integration-hub |
| `/solutions/agencies` | multi-channel-inbox, lead-qualifier, bespoke-crm, document-assembly |
| `/solutions/smbs` | integration-hub, bespoke-crm, knowledge-assistant, notification-orchestration, accounting-engine |

---

## 4. Page inventory & disposition (every existing + planned page)

| URL | Type | State | Disposition |
|---|---|---|---|
| `/` | home | live | **DONE** — body now links 4 pillar hubs + `/systems` (TheWhatWeBuild + footer). |
| `/systems` | hub | live | **DONE** — breadcrumb + "Browse by pillar" hub links added. |
| `/systems/<30 live>` | money | live | **DONE** — breadcrumb + related-systems + pillar-hub back-links wired. |
| `/systems/legal-intake-automation` | money | **concept/thin** | **Delinked + not generated** (verified by test). S01: `noindex`/410 the indexing guard (OR-4). |
| `/systems/hospitality-booking-marketing-dashboard` | money | **concept/thin** | **Delinked + not generated** (verified by test). S01: `noindex`/410 (OR-4). |
| `/systems?pillar=<4>` | facet | live | **Removed from crawl graph** — `PillarChip` now links hubs; filter is button-only UX. S01: canonical (OR-3). |
| `/diagnose` | conversion | live | Keep (chrome-less funnel, link sink — rule L9). Consider `noindex` (S01/S02). |
| `/what-we-build/<4 pillars>` | hub | **LIVE** | **DONE** — server-rendered hubs (`[pillar].vue`), link all members + back. |
| `/solutions/<7 industries>` | hub | **create** | New industry hubs (P2). |
| `/use-cases/<n>` | content | **create** | New, as S06 content lands (P2). |
| `/blog/<n>` | content | **create** | New, when editorial starts (P2). |

---

## 5. Crawl-depth proof (ACHIEVED — asserted by tests)

`tests/architecture.test.mjs` runs BFS over the real generated `.output/public`
and asserts depth ≤3 + zero orphans on every build.

| Page set | Depth from `/` (before S04) | Depth from `/` (now, verified) |
|---|---|---|
| `/systems` | 1 (nav) | 1 |
| 30 live module pages | 2 (card only; in-degree 1) | **2** (card + 4-hub footer + pillar hub + related); in-degree ≥4 |
| 2 concept pages | ∞ (orphan) | **delinked + not generated** (zero inbound) |
| 4 pillar hubs | n/a (didn't exist) | **1** (home + footer, sitewide) |
| industry hubs | n/a | 2 (planned — footer/pillar/module cross-links) |
| use-cases | n/a | 2 (planned — module + industry + pillar links) |
| blog posts | n/a | 2 (planned — blog index + contextual) |

All money + hub pages are **≤3 clicks** with **zero orphans** — proven by the
test suite, not just intended. See `internal-linking.md` for the rules and
`../audits/04-architecture.md` §8 for the implementation log.
