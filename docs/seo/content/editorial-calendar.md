# Zabble Editorial Engine — Topical-Authority Model & Calendar

- **Session:** Content Strategy & Editorial (issued as "S10 content"; repo convention numbers this **S06** — see `audits/10-content.md` §0)
- **Branch:** `seo/10-content`
- **Owner:** Content strategist
- **Date:** 2026-06-04
- **Market:** South Africa primary (`location_name: "South Africa"`, `language_code: en`); broader-Africa / global-English as labelled upside
- **Reads:** `00-conventions.md`, `reference/aeo-geo-principles.md`, `targets/keyword-map.md`, `app/data/systems.ts`, Zabble Business & Module Overview
- **Layer(s):** SEO · AEO · GEO (the editorial engine is AEO/GEO-native by design)

> **Voice (binding for every brief):** Zabble's *problem → what we build → what
> changes* structure, plain language, no off-the-shelf-SaaS framing. We don't
> sell software; we build the system a specific business needs. Every article
> earns the right to mention a module by first naming a problem the reader feels.

---

## 0. The strategic reality this plan is built on (evidence-grounded)

Two findings from DataForSEO (SA, live — `_evidence/10-content/`) shape everything:

1. **SA demand for our exact terms is thin.** Most module-specific commercial
   terms sit at **10–50 searches/mo**; several brand-shaped seeds
   (`bespoke business systems south africa`, `bespoke crm`, `custom crm south
   africa`, `ai receptionist`) return **no measurable volume**. The few real
   anchors are `popia compliance` (260), `workflow automation` (140),
   `anomaly detection` (90), `ipaas` (90), `master data management` (90).
   → **We cannot win by chasing volume.** We win on high-intent long-tail
   commercial terms (CPC up to $24.73 — real money intent), ZA regulatory
   anchors, and broad-English informational terms that build topical authority.

2. **Every priority query triggers an AI Overview *and* People-Also-Ask in SA.**
   All five sampled SERPs returned both. → The generative/answer surface is the
   battleground. Content that answers the question first, in liftable
   sentences, with FAQ/PAA-shaped structure, is the only thing that competes for
   the slot. **This is why the engine is AEO/GEO-native, not volume-native.**

**Consequence for strategy:** the editorial engine's job is *topical authority
+ entity citability*, not traffic-at-volume. We build a dense, well-linked hub
of question-shaped content so that when a SA operator (or their AI assistant)
asks "who automates X in South Africa?", Zabble is the corroborated, quotable
answer — and the click lands on the right `/systems/<slug>` money page.

---

## 1. The topical-authority model (hub-and-spoke)

Four tiers. Money pages convert; editorial builds the authority and the answers
that feed them.

```
TIER 0  ENTITY ANCHOR              /  (home) + /systems  + Organization schema (S03/S08)
            │  "Zabble = SA firm that builds bespoke operational systems"
            ▼
TIER 1  PILLAR GUIDE HUBS          4 comprehensive guides (one per pillar) + 1 thesis guide
            │  broad, evergreen, question-led; the topical spine
            ▼
TIER 2  CLUSTER USE-CASE ARTICLES  use-case × module × industry; the editorial pipeline
            │  answer-first, FAQ-backed; links UP to pillar, ACROSS to module money page
            ▼
TIER 3  MONEY PAGES (not ours)     /systems/<slug>  — owned by templates/S02; we link to them
```

**Tier 0 — Entity anchor.** Home + `/systems` index, hardened as a GEO entity
(consistent NAP, `Organization`/`sameAs`, the 30 modules as a structured list).
Owned by S02/S03/S08; **we do not edit it** — we link up to it and keep our
boilerplate identical to `app/data/systems.ts`.

**Tier 1 — Pillar guide hubs (NEW pages — IA owned by S04).** Five evergreen
hubs, each a comprehensive, question-led guide that owns a broad topic and links
down to every relevant module money page and cluster article.

> **IA coordination (S04):** the Architecture session has placed the pillar hubs
> at **`/what-we-build/<pillar>`** (per its `internal-linking.md` / keyword-map
> request). This calendar **adopts that path** as canonical. The `<pillar>`
> slugs match `app/data/systems.ts`: `automation`, `audit-trails`,
> `anomaly-detection`, `analytics`. The thesis hub (P1) sits above the four; if
> S04 prefers it under `/what-we-build/` too, use `/what-we-build/bespoke-systems`.

| # | Pillar hub | Canonical URL (S04 scheme) | Owns the topic | ZA/global |
|---|-----------|----------------------------|----------------|-----------|
| P1 | **Bespoke vs off-the-shelf** (the thesis) | `/what-we-build/bespoke-systems` | "custom software vs off the shelf", "bespoke business systems" | ZA-core entity |
| P2 | **Business process automation** | `/what-we-build/automation` | "workflow automation" (140), "business process automation" | ZA + global |
| P3 | **Audit trails & compliance automation** | `/what-we-build/audit-trails` | "audit trail software", POPIA/FAIS/SARB governance | ZA-core |
| P4 | **Anomaly detection & continuous assurance** | `/what-we-build/anomaly-detection` | "anomaly detection" (90), fraud/error/drift | global + ZA |
| P5 | **Operational analytics & decision support** | `/what-we-build/analytics` | "operational analytics", forecasting, dashboards | global + ZA |

> The pillars map 1:1 to Zabble's four north-star pillars (Automation, Audit
> Trails, Anomaly Detection, Analytics), plus P1 carries the brand thesis that
> sits above all four. `app/data/systems.ts` already tags every module with a
> pillar set — these hubs are the editorial expression of that taxonomy.

**Tier 2 — Cluster use-case articles (the pipeline).** Each targets one *use
case* (a job a real SA business needs done), anchored to one module and framed
for one or more industries. These are informational/how-to/comparison intent —
**deliberately a different intent from the commercial money page**, so they
*support* `/systems/<slug>` instead of cannibalising it (see §6 cannibalisation
guard). Cluster articles live under a blog/insights path (S04 to confirm — this
calendar uses `/guides/<article-slug>` pending S04's decision). This is the bulk
of the calendar and scales module-by-module, industry-by-industry.

---

## 2. Module → use-case theme → industry map (all 30 modules)

Every module gets at least one use-case article theme and a primary
pillar/industry. Canonical money page = `/systems/<slug>` from
`app/data/systems.ts`. (Two industry-bundle pages —
`/systems/legal-intake-automation`, `/systems/hospitality-booking-marketing-dashboard`
— exist in `systems.ts` and are treated as industry landing targets, listed at
the end.) **Wave** = which calendar wave the first article ships in (§4).

| # | Module | `/systems/<slug>` | Pillar(s) | Lead use-case article theme | Primary industries | Wave |
|---|--------|-------------------|-----------|------------------------------|--------------------|------|
| 1 | Kairos — Voice Agent | `kairos` | Auto·Audit·Analytics | AI receptionist / voice agent for events & bookings | Events, hospitality, clinics, agencies | **1** |
| 2 | Approval & Sign-Off | `approval-workflow` | Auto·Audit | Automating approval chains with an audit trail | Banks/FSPs, NGOs, finance | 2 |
| 3 | Multi-Channel Inbox | `multi-channel-inbox` | Auto·Audit | One inbox for WhatsApp/email/SMS/DMs | Sales, support, agencies | 3 |
| 4 | Event-Driven Orchestrator | `workflow-orchestrator` | Auto·Audit | Order-to-dispatch: one event, every system updated | E-commerce, retail, ops | 2 |
| 5 | Decision Engine | `decision-engine` | Auto·Audit | Consistent, explainable decisions (lending, discounts) | FSPs/lenders, sales | 2 |
| 6 | Document Intelligence | `document-intelligence` | Auto·Audit | Automating document data extraction (OCR + validation) | Law firms, banks, insurers | **1** |
| 7 | Document Assembly | `document-assembly` | Auto·Audit | Auto-assembling proposals/contracts/board packs | Consulting, prof. services, finance | 3 |
| 8 | Bespoke CRM | `bespoke-crm` | Auto·Analytics | Custom CRM vs off-the-shelf: when bespoke is worth it | SMBs, agencies, sales teams | **1** |
| 9 | Unified Customer Record | `customer-360` | Analytics·Auto | One customer record across Sales/Support/Finance | B2B/SaaS, subscriptions | 3 |
| 10 | Knowledge & SOP Assistant | `knowledge-assistant` | Auto·Audit | An assistant that answers from your SOPs (cited) | Retail, hospitality, ops-heavy | 3 |
| 11 | Lead Qualification | `lead-qualifier` | Auto·Analytics | Qualify every enquiry before a rep sees it | High-ticket services, events, agencies | **1** |
| 12 | Legacy Bridge | `legacy-bridge` | Auto | Connect a legacy ERP/Excel to modern AI — no rewrite | Established SMBs, manufacturing | 3 |
| 13 | Inventory Clarity (RFID) | `inventory-clarity` | Auto·Anomaly·Analytics·Audit | RFID stock truth: warehouse, books, orders agree | Warehousing, hospitality, manufacturing | 2 |
| 14 | Client Onboarding | `client-onboarding` | Auto·Audit | KYC/onboarding automation without the email chase | Wealth, banks/FSPs, prof. services | **1** |
| 15 | Case Management | `case-management` | Auto·Audit | Matter/case tracking with an audit trail by default | Law firms, NGOs, HR | 2 |
| 16 | Task Management | `task-management` | Auto·Audit | Dependency-aware matter tracking (conveyancing) | Conveyancing, project firms | 3 |
| 17 | Field Operations App | `field-ops-app` | Auto·Analytics | Offline-first field data capture that syncs clean | Utilities, installers, NGOs | 3 |
| 18 | Analytics & Decision Support | `analytics-suite` | Analytics | Role-based dashboards people actually open | Logistics, hospitality, retail | 2 |
| 19 | Accounting Engine | `accounting-engine` | Auto·Audit·Analytics | Event-driven books: close month-end in hours | Project firms, retainers, founders | 3 |
| 20 | Compliance & Reg. Reporting | `compliance-reporting` | Audit·Auto·Analytics | POPIA & regulatory reporting automation | Banks/FSPs, NGOs | **1** |
| 21 | Continuous Assurance | `continuous-assurance` | Anomaly·Audit | Transaction fraud & anomaly detection for FSPs | Banks/FSPs, ops | **1** |
| 22 | Pricing & Quote | `pricing-engine` | Auto·Audit | Quote automation that protects your margin (CPQ) | Parts/wholesale, hospitality, consulting | 2 |
| 23 | Reconciliation | `reconciliation-engine` | Auto·Anomaly·Audit | Automating bank/POS/ledger reconciliation | Retail, hospitality, finance | **1** |
| 24 | Data Routing Pipeline | `data-routing` | Auto·Analytics·Audit | Board pack / donor report / BA900 from one pipeline | Banks, NGOs, finance | 3 |
| 25 | Integration Hub | `integration-hub` | Auto | Integrate your tools without the spaghetti (vs Zapier) | Booking ops, SMBs | **1** |
| 26 | Cross-System Sync | `cross-system-sync` | Auto·Audit | Keep two systems in sync (stock↔storefront, HR↔payroll) | Retail, HR/payroll, bookings | 3 |
| 27 | Forecasting & Demand Planning | `forecasting` | Analytics | Demand forecasting for restaurants & parts suppliers | Restaurants, parts suppliers, SaaS | **1** |
| 28 | Predictive Maintenance | `predictive-maintenance` | Anomaly·Analytics | Predict equipment failure before the 3am breakdown | Mining, manufacturing | 3 |
| 29 | Master Data Hub | `master-data-hub` | Auto·Audit | One golden record (customer/supplier/product) | Distribution, retail, multi-system | 2 |
| 30 | Notification & Alert Orchestration | `notification-orchestration` | Auto·Audit | Alert fatigue: route the one alert that matters | Ops, on-call, retail/finance | 3 |
| — | *Legal Intake (industry bundle)* | `legal-intake-automation` | Auto·Audit | Law-firm intake automation (industry hub) | Law firms | 2 |
| — | *Hospitality Booking+Marketing (bundle)* | `hospitality-booking-marketing-dashboard` | Auto·Analytics | Hospitality booking & marketing in one view | Hotels, hospitality groups | 3 |

**Industry lens (cross-cutting).** The same modules recur across the seven
named industries. Each industry eventually earns a *"systems for [industry]"*
round-up article that links to its relevant module money pages — a second spoke
direction (industry-hub) layered on the pillar-hub. Industry hubs are a
Wave-3+ play once the module clusters exist to link to:

- **NGOs** → Case Management, Compliance/Donor Reporting, Approval, Field Ops, Data Routing
- **Banks / FSPs** → Decision Engine, Continuous Assurance, Approval, Client Onboarding, Compliance Reporting, Data Routing
- **Hotels / hospitality** → Kairos, Inventory Clarity, Reconciliation, Analytics Suite, Integration Hub, Hospitality bundle
- **Law firms** → Document Intelligence, Case Management, Task Management, Legal Intake bundle
- **Parts suppliers / wholesale** → Pricing & Quote, Reconciliation, Forecasting, Inventory Clarity
- **Marketing agencies** → Multi-Channel Inbox, Lead Qualification, Bespoke CRM, Integration Hub
- **SMBs** → Integration Hub, Bespoke CRM, Legacy Bridge, Notification Orchestration

---

## 3. Prioritisation rubric

Because volume is thin and the answer surface is everything, the rubric weights
**business fit + AEO/GEO winnability + topical-foundation value** above raw
search volume. Score each candidate 1–5 on five factors; the weighted total
(max 50) sets the wave.

| Factor | Weight | 1 | 5 |
|--------|:------:|---|---|
| **Business fit (B)** — closeness to revenue / a flagship module / a named ICP industry | ×3 | tangential | core money page, named ICP |
| **AEO/GEO winnability (W)** — is there an AI-Overview/PAA slot *and* can we credibly out-specific the current citations | ×2 | no slot or unbeatable incumbents | open slot, we own the SA/use-case angle |
| **Foundation value (F)** — does it establish the entity or a pillar hub the rest links to | ×2 | leaf article | pillar/entity hub |
| **Demand (D)** — SA volume + breadth of related long-tail (evidence-backed) | ×2 | no measurable volume | real SA + global-English volume |
| **Ease (E)** — can a writer ship it from existing module copy + this brief | ×1 | needs new research/quotes | brief + `systems.ts` is enough |

`Priority = 3B + 2W + 2F + 2D + 1E` (max 50). **P0 ≥ 38 · P1 30–37 · P2 < 30.**

The rubric deliberately lets a low-volume topic (e.g. `bespoke crm`, 0 measured
volume) still score P0 when B and F are high — because the win is the AI
citation and the supported money page, not the 30 clicks. Every score is
recorded per brief and rolls up into the coverage matrix in `audits/10-content.md`.

---

## 4. The prioritised, sequenced editorial calendar

**Sequencing logic for a new domain:** establish the entity and the topical
spine first (pillar hubs corroborate every downstream article and give AI
engines a coherent "what Zabble is about"), then ship the highest-fit clusters,
then breadth. Authority compounds: a cluster article is far stronger when its
pillar hub already exists to link up to.

**Cadence:** **one substantial piece per week (~4/month)** — realistic for a
bespoke consultancy and enough to show freshness/velocity to crawlers and AI
engines without thinning quality. Pillars are heavier (2,000–2,800 words);
clusters are 1,200–1,800. Front-load pillars in Weeks 1–6.

### Wave 1 — Foundation + flagship clusters (Weeks 1–8) — **first wave, all briefed**

| Wk | Title (working) | Type | Canonical target | Cluster (keyword-map) | Brief |
|----|-----------------|------|-------------------|------------------------|-------|
| 1 | What is a bespoke business system (and when it beats off-the-shelf)? | Pillar P1 | `/what-we-build/bespoke-systems` | Core offering | `01-bespoke-business-systems.md` |
| 2 | Business process automation in South Africa: a practical guide | Pillar P2 | `/what-we-build/automation` | Core offering | `02-business-process-automation.md` |
| 3 | Audit trails & compliance automation for SA regulated businesses | Pillar P3 | `/what-we-build/audit-trails` | Compliance/governance | `03-audit-trails-compliance.md` |
| 4 | What is anomaly detection in business (fraud, error, drift)? | Pillar P4 | `/what-we-build/anomaly-detection` | Continuous assurance | `04-anomaly-detection.md` |
| 5 | Operational analytics & decision support: data you already have | Pillar P5 | `/what-we-build/analytics` | Analytics | `05-operational-analytics.md` |
| 6 | How to automate bank & POS reconciliation | Cluster | `/systems/reconciliation-engine` | Reconciliation | `06-automate-reconciliation.md` |
| 7 | POPIA & regulatory reporting automation | Cluster | `/systems/compliance-reporting` | Compliance reporting | `07-popia-regulatory-reporting.md` |
| 8 | How to automate document data extraction (OCR + validation) | Cluster | `/systems/document-intelligence` | Document intelligence | `08-document-data-extraction.md` |

### Wave 1 (cont.) — flagship clusters, Weeks 9–15 — **also briefed in this first wave**

| Wk | Title (working) | Type | Canonical target | Cluster | Brief |
|----|-----------------|------|-------------------|---------|-------|
| 9 | Transaction fraud & anomaly detection for FSPs | Cluster | `/systems/continuous-assurance` | Continuous assurance | `09-fraud-detection-fsp.md` |
| 10 | AI receptionist & voice agent for events and bookings | Cluster | `/systems/kairos` | Kairos / voice | `10-ai-receptionist-voice-agent.md` |
| 11 | Lead qualification automation: qualify before a rep sees it | Cluster | `/systems/lead-qualifier` | Lead qualification | `11-lead-qualification-automation.md` |
| 12 | Custom CRM vs off-the-shelf: when a bespoke CRM is worth it | Cluster | `/systems/bespoke-crm` | Bespoke CRM | `12-custom-crm-vs-off-the-shelf.md` |
| 13 | Integrate your tools without the spaghetti (vs Zapier/point-to-point) | Cluster | `/systems/integration-hub` | Integration / iPaaS | `13-integration-hub-vs-zapier.md` |
| 14 | Demand forecasting for restaurants & parts suppliers | Cluster | `/systems/forecasting` | Forecasting | `14-demand-forecasting.md` |
| 15 | KYC & client onboarding automation for wealth & professional services | Cluster | `/systems/client-onboarding` | Client onboarding | `15-client-onboarding-kyc.md` |

> **First wave = 15 briefs (5 pillar hubs + 10 flagship clusters).** Exceeds the
> 12-brief minimum and seeds every pillar plus the highest-fit modules across
> all seven ICP industries.

### Wave 2 — High-fit clusters + first industry hubs (Weeks 16–28, outline only)

Approval workflow · Decision engine · Workflow orchestrator (order-to-dispatch)
· Inventory clarity (RFID) · Case management · Pricing & quote (CPQ) · Analytics
suite (role-based dashboards) · Master data hub · Legal-intake industry hub ·
**Industry hubs:** "Systems for NGOs", "Systems for banks & FSPs". Brief these
once Wave 1 ships and S05 returns researched volumes.

### Wave 3 — Breadth + remaining industry hubs (Weeks 29+, backlog)

Multi-channel inbox · Document assembly · Customer-360 · Knowledge/SOP assistant
· Legacy bridge · Task management · Field ops · Accounting engine · Data routing
· Cross-system sync · Predictive maintenance · Notification orchestration ·
Hospitality bundle. **Industry hubs:** hotels, law firms, parts suppliers,
agencies, SMBs. This wave completes module coverage (30/30).

---

## 5. ZA-core vs broader-market split

| Bucket | Why | Topics |
|--------|-----|--------|
| **ZA-core** (primary) | Local regulation, local entity, local phrasing; defensible against global incumbents | P1 bespoke-systems thesis, P3 audit/compliance, POPIA reporting (07), KYC/FICA onboarding (15), fraud for FSPs (09), reconciliation (06), all *"…in South Africa"* and industry-hub articles |
| **Broader-Africa** (upside) | Same English, similar regulatory/operational pain; reuse with light localisation | Automation pillar (02), reconciliation, document extraction, integration, forecasting — re-pointed to "African business" framing |
| **Global-English** (topical-authority upside) | High informational volume, builds the pillar/entity authority that GEO rewards; we win the *use-case* angle, not the textbook | P4 anomaly detection, P5 analytics, P2 automation, "what is" questions (08, 10, 13, 14) — these pull global PAA/AI-Overview presence that corroborates the entity |

**Rule:** every article is written ZA-first (examples, currency, regulators),
but global-English topics keep the universal definition liftable so AI engines
can cite it for any market while the body anchors Zabble to South Africa.

---

## 6. Internal-link plan (the link graph that makes this "topical authority")

The link structure *is* the strategy — it's what tells crawlers and AI engines
that these pages form one authoritative topic cluster. **Coordinate the concrete
URLs + anchor clusters with S04** (its `internal-linking.md` owns the site-wide
anchor map; this section is the content-side contract).

**Per cluster article (mandatory links):**
1. **Up to its pillar hub** — partial-match anchor (e.g. "business process
   automation") → `/what-we-build/<pillar>`. One per article.
2. **Across to its canonical module money page** — `/systems/<slug>`, anchored
   on the *outcome*, not the brand (e.g. "a reconciliation engine that
   auto-matches POS, bank and ledger"). One primary, money-intent link.
3. **Across to 1–2 sibling clusters** in the same pillar (related use cases).
4. **Up to the entity anchor** — one contextual link to `/` or `/systems` where
   "bespoke operational systems" / "the system your business needs" appears.
5. **To `/diagnose`** as the CTA (the question-flow asset — itself an AEO page).

**Per pillar hub (mandatory links):**
1. **Down to every relevant module money page** it covers (the pillar is a
   distribution hub for `/systems/<slug>`).
2. **Down to each cluster article** under it (added as they publish).
3. **Across to the other four pillar hubs** (sibling pillars) — completes the
   spine so AI engines see the full "four pillars" entity.
4. **Up to the entity anchor** (home / `/systems`).

**Cannibalisation guard (coordinate with S02 templates + S05 keywords):**
- Article = **informational/how-to/comparison** intent (`how to…`, `what is…`,
  `…vs…`). Money page = **commercial** intent (`<thing> software/company south
  africa`). Different intent → no cannibalisation; the article funnels to the
  page. Each brief states *its* target query *and* the money page's distinct
  target so no two URLs chase the same primary keyword.
- One canonical target page per brief (recorded in every brief header). No two
  briefs share a canonical money page as their *primary* link.
- Pillar hubs target broad heads; clusters target the long-tail under them —
  hub and spoke never compete for the same phrase.

**Anchor-text discipline:** vary anchors (partial-match + outcome phrasing),
never naked URLs, never "click here". Keep module descriptions identical to
`app/data/systems.ts` boilerplate for GEO corroboration (principle 3).

---

## 7. How this coordinates with other sessions (cross-session asks)

| Need | Owner | Why |
|------|-------|-----|
| Create the 5 pillar hub pages (`/what-we-build/<pillar>`) + cluster URLs; slot in nav/IA | **S04 Architecture** | Tier-1 hubs need real URLs + breadcrumb/IA placement; align paths with `internal-linking.md` |
| `useSeoMeta` (title/meta/canonical) per article + pillar | **S02 On-Page** | Briefs supply title/meta; S02 implements; sets canonical to prevent cannibalisation |
| `FAQPage` / `Article` schema on each piece, 1:1 with visible FAQ | **S03 Schema** | FAQ blocks in briefs are written to match the schema S03 marks up |
| Verified SA volumes/KD for Wave-2/3 candidates; append to keyword-map | **S05 Keywords** | This plan used spot-checks; S05 fills the full map (we appended requests) |
| AEO answer-shape review + voice/PAA targeting | **S07 AEO** | FAQ/answer-first specs here are S07's to refine and own the FAQ schema pairing |
| GEO entity hardening + corroboration (Organization/sameAs, off-page) | **S08 GEO / S10 Off-page** | Quotable claims here only pay off once the entity is hard and echoed off-site |

Requests for Wave-2/3 keyword research have been appended to
`targets/keyword-map.md` §4.

---

*This calendar is the plan; `content/briefs/` holds the ready-to-write briefs
for Wave 1; `audits/10-content.md` holds the method, rubric scoring, and the
per-module coverage matrix.*
