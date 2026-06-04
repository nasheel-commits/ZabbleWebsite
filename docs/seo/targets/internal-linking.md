# Internal Linking — rule set & anchor-text strategy

- **Owner:** S04 · `seo/04-architecture`
- **Status:** v1 — 2026-06-04
- **Reads:** `site-architecture.md` (this folder), `keyword-map.md` (S05),
  `../audits/04-architecture.md`, `../reference/aeo-geo-principles.md`.
- **Implements:** components `SeoBreadcrumb.vue`, `RelatedSystems.vue` +
  composable `useRelatedSystems` (this branch); footer/home/hub wiring specced
  for S02/S06 (asks OR-5/OR-6).

The job of this document: turn the hub-and-spoke IA in `site-architecture.md`
into **concrete, enforceable linking rules** and **varied, descriptive anchor
text** so link equity concentrates on the 30 module money pages + 4 pillar hubs,
no page is orphaned, and anchors read naturally to humans while signalling the
right entity to search/AI engines.

---

## 1. The link-graph rule set (binding for the build)

Each rule is testable. The "check" column is what a link-graph crawl (live
DataForSEO On-Page once B3 is resolved) must show.

| # | Rule | Check |
|---|---|---|
| **L1** | Every module page is **≤3 clicks from `/`**. | Crawl depth ≤3 for all `/systems/<slug>`. |
| **L2** | Every live module is linked from its **modules hub** (`/systems`) **and ≥1 pillar hub** **and ≥2 contextual spots** (related-systems, industry hub, use-case, or body prose). → in-degree **≥4**. | In-degree(module) ≥4; 0 modules with in-degree <4. |
| **L3** | **No orphans.** Every indexable URL has ≥1 internal in-link. Pages with no business reason to be indexed (concept/thin, facets) are `noindex` **and** sitemap-excluded, not left as silent orphans. | 0 indexable pages with in-degree 0. |
| **L4** | Every page carries a **breadcrumb** `Home › Systems › <Module>` (and the hub/industry/use-case equivalents), emitted as visible nav **and** `BreadcrumbList` JSON-LD (schema = S03). | Breadcrumb present + valid `BreadcrumbList` on every non-home page. |
| **L5** | Each module page links to **3–6 related modules** (shared-pillar siblings), and to **every pillar hub it belongs to**. | Out-degree(module → modules) ≥3; → pillar hubs = its pillar count. |
| **L6** | Each **pillar hub** links to **all** its member modules (§3.1 of site-architecture) and to the other 3 pillar hubs + `/systems`. | Out-degree(pillar hub) = members + 4. |
| **L7** | The **footer** carries a sitewide block linking `/systems`, the **4 pillar hubs**, and `/diagnose` (cheapest sitewide depth-flattener). | Footer edges include /systems + 4 hubs on every page. |
| **L8** | The **home** body links to `/systems` and the **4 pillar hubs** from the "What We Build" section (today it links to nothing — issue A2/A3). | Home → /systems + 4 pillar-hub edges. |
| **L9** | **Conversion pages don't hoard equity.** `/diagnose` stays a sink: many in-links, few out (nav/footer only). Don't add `/diagnose` body links *out* to money pages. | Out-degree(/diagnose) ≤ nav+footer. |
| **L10** | **Faceted URLs don't leak crawl budget.** `/systems?pillar=` is canonical→`/systems` or `noindex,follow`; chips may stay as UX but must not be the *only* path to a pillar (the hub is). | Facet URLs non-canonical; pillar reachable via hub. |
| **L11** | **Descriptive anchors, varied, non-exact-spam** (see §2). No "click here"/"view system" as the *primary* money-page anchor. | No money page whose only inbound anchors are generic. |
| **L12** | **One canonical parent per module = `/systems`** (breadcrumb spine). Pillar/industry/use-case links are additive cross-links, never the breadcrumb. | Breadcrumb spine consistent across all modules. |

**Reachability guarantee.** L7+L8 put all 4 pillar hubs at depth 1 and every
module at depth 1–2 (footer/hub) — even if the `/systems` grid changes. L2+L5
turn the current in-degree-1 stars into a connected cluster so equity flows
module→module within a pillar.

---

## 2. Anchor-text strategy

### 2.1 Principles
- **Descriptive over branded over generic.** Prefer an anchor that names the
  capability/intent ("automated bank reconciliation") over the bare product name
  ("Reconciliation Engine") over generic ("view system"). Use all three across
  the site, weighted to descriptive.
- **Vary every inbound anchor.** A money page should accrue a *spread* of anchors
  (exact, partial, branded, natural-sentence), never the same string 30×.
  Same-anchor repetition reads as manipulation and wastes the signal.
- **Map to the keyword cluster, not the head term.** Each module owns a small
  cluster in `keyword-map.md`; anchors draw from that cluster's variants once
  S05 verifies volume/KD. **Until S05 verifies, use the descriptive seed anchors
  below** (they're intent-true, just not yet volume-backed — conventions §6).
- **South-Africa qualifier where natural**, not forced into every anchor (e.g.
  one "…in South Africa" variant per cluster, not all of them).
- **Sentence-case, human phrasing.** Anchors live inside real sentences on hub
  and use-case pages, not as keyword lists.

### 2.2 Anchor inventory per cluster (seed — S05 verifies)

Anchor pools each module page should *receive* (from hub, related-systems,
use-cases, blog prose). Cross-ref `keyword-map.md` §2 seeds.

| Money page | Exact-ish anchor | Partial / descriptive | Branded | Natural-sentence example |
|---|---|---|---|---|
| `/systems/bespoke-crm` | custom CRM | a CRM shaped around your pipeline | Bespoke CRM | "…we built a **custom CRM** around how their team actually sells." |
| `/systems/reconciliation-engine` | automated bank reconciliation | reconcile POS against bank and processor | Reconciliation Engine | "…the **automated reconciliation** engine matches ledgers in the background." |
| `/systems/document-intelligence` | document data extraction | read and route every document | Document Intelligence | "…an **intake pipeline that extracts document fields** automatically." |
| `/systems/pricing-engine` | quote automation / CPQ | compose the right price from every rule | Pricing & Quote Engine | "…a **pricing and quote engine** that blocks under-margin deals." |
| `/systems/compliance-reporting` | regulatory reporting automation | POPIA & SARB submissions from your data | Compliance Reporting Engine | "…**automated regulatory reporting** with every figure traced to source." |
| `/systems/continuous-assurance` | transaction anomaly detection | catch fraud and drift at volume | Continuous Assurance | "…**anomaly detection** that surfaces only the cases that matter." |
| `/systems/kairos` | AI receptionist / voice agent | answer every call and run the event arc | Kairos | "…**Kairos**, a voice agent that never sends a call to voicemail." |
| `/systems/lead-qualifier` | lead qualification automation | qualify every inbound before a rep sees it | Lead Qualification Engine | "…**automated lead qualification** routes the good leads first." |
| `/systems/integration-hub` | integrate your business tools / iPaaS | connect the tools you already run | Integration Hub | "…an **integration hub** so every system that should know, knows." |
| `/systems/forecasting` | demand forecasting | project demand, orders and cash forward | Forecasting & Demand Planning | "…**demand forecasting** trained on your own history." |
| *(remaining 20 modules)* | *from keyword-map cluster* | *capability phrase from `systems.ts` tagline* | *module name* | *prose in hub/use-case* |

### 2.3 Anchors by link source

| Link source | Anchor pattern | Why |
|---|---|---|
| Breadcrumb | exact page name ("Systems", module name) | navigational clarity + `BreadcrumbList`. |
| `/systems` grid card | **upgrade** from generic "View system" → module name as the heading link, with the capability tagline adjacent | give crawlers the module name as anchor (fixes A6). |
| Footer module/pillar block | pillar name ("Automation"), "All systems" | sitewide, concise, descriptive. |
| Pillar hub → module | **descriptive capability** anchor (col 3 above) | hub is where keyword-rich anchors live. |
| Related-systems block | module name + 3–5 word capability | varied, sibling context. |
| Home "What We Build" → pillar hub | pillar name ("Audit Trails") | matches section vocabulary. |
| Use-case / blog prose → module | natural-sentence anchor (col 5) | most authoritative, in-context. |

### 2.4 Don'ts
- Don't point >1 page at the same primary keyword anchor → **cannibalisation**
  (coverage check in `keyword-map.md` §3). One primary per page.
- Don't use exact-match anchor for *every* inbound link to a page.
- Don't anchor money pages from `/diagnose` body (rule L9).
- Don't anchor to faceted `?pillar=` URLs as a page's canonical path (rule L10).

---

## 3. Mapping to keyword-map clusters (S05 handshake)

- Every anchor in §2.2 corresponds to a **row in `keyword-map.md`** for that URL.
  S04 supplies the *descriptive seed anchors*; **S05 verifies volume/KD/intent**
  and may swap a seed for a higher-value variant. When S05 updates a cluster's
  primary term, the **pillar-hub and use-case anchors** to that module should be
  refreshed to match (S06 edit; S04 rule L11 still applies).
- **Request logged to S05** (mirrored in `keyword-map.md` §4 and `status.md`):
  verify the 10 seed clusters above + provide one "…South Africa" variant per
  module so we can place exactly one geo-anchor per cluster without repetition.
- **Cannibalisation guard:** S04's IA gives pillars their own hub URLs so pillar
  terms ("business automation south africa") target `/what-we-build/automation`,
  **not** a module page — keeping module clusters clean for their specific
  capability terms.

---

## 4. Implementation status

| Piece | State | Owner |
|---|---|---|
| `SeoBreadcrumb.vue` (Home›Systems›Name, a11y nav) | **built** (this branch) | S04 |
| `RelatedSystems.vue` + `useRelatedSystems` (shared-pillar siblings) | **built** (this branch) | S04 |
| Wire breadcrumb + related into `[slug].vue` / `index.vue` | **specced** (ask OR-5) — page `<script>`/template SEO regions are S02's; files also carry uncommitted WIP | S02 |
| Footer pillar/module block (L7) | **specced** (ask OR-6) | S02/S06 |
| Home "What We Build" → pillar-hub links (L8) | **specced** (ask OR-6) | S06 |
| `BreadcrumbList` + hub schema (L4) | **handed to S03** | S03 |
| Facet canonical/noindex (L10) | **handed to S01/S03** (OR-3) | S01/S03 |

See `../audits/04-architecture.md` §6 for the full cross-session ask list.
