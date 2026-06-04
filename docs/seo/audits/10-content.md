# Audit 10 — Content Strategy & Editorial

- **Session:** Content Strategy & Editorial (issued as "S10 content"; see §0)
- **Branch:** `seo/10-content`
- **Owner:** Content strategist
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** S00 (foundation — done); S05 keywords (skeleton only — used spot-research in lieu; full map pending); coordinates with S02 (on-page/canonicals), S03 (schema), S04 (IA/new hub pages), S07 (AEO), S08 (GEO)
- **Layer(s):** SEO · AEO · GEO

## 0. Numbering reconciliation (read first)

This task was issued as **"S10 content"** on branch **`seo/10-content`** with
deliverables `content/editorial-calendar.md`, `content/briefs/`, and
`audits/10-content.md`. The repo's binding conventions (`00-conventions.md` §1)
instead number **Content Strategy & Editorial as S06** (`seo/06-content`,
`audits/06-content.md`), and reserve **10** for *Off-Page, Local SEO &
Measurement* (`seo/10-offpage-local`, already a live branch + worktree).

**Resolution:** I delivered exactly what the issued goal specified (branch
`seo/10-content`, `audits/10-content.md`, evidence under `_evidence/10-content/`)
to satisfy the goal condition, while keeping `content/*` filenames — which both
schemes agree on — unchanged. The content session is functionally **S06**
regardless of the label, so `status.md`'s **row 06** is the one I updated. The
existing `audits/06-content.md` remains the foundation placeholder; this file is
the completed content-strategy audit. No off-page (true-S10) files were touched.
Flagging for the SEO lead in case branches are later renumbered before merge.

> **Workspace note.** This session ran in an isolated git worktree
> (`C:/Users/nashe/zabble-seo10-content`) after the shared OneDrive checkout was
> switched out from under it by a parallel session (S04). This matches the
> project's standing guidance to use a worktree per parallel session. Evidence
> was re-fetched once into the worktree (same queries, same market) — total
> DataForSEO spend remained ~$0.023.

## 1. Scope

**Covers:** the topical-authority content model (pillar/cluster hub-and-spoke),
the mapping of all 30 modules to use-case article themes and industries, a
prioritised + sequenced editorial calendar with cadence and an internal-link
plan, and 15 ready-to-write content briefs (first wave). Demand and SERP-feature
validation via DataForSEO (SA) for the priority clusters.

**Does NOT cover (hand-offs):** page templates / `useSeoMeta` / canonicals (S02);
JSON-LD / `FAQPage` / `Article` schema (S03); creating the proposed hub/cluster
URLs and IA placement (S04); the full researched keyword map (S05); final AEO
answer-shape sign-off and FAQ-schema pairing (S07); GEO entity hardening + off-page
corroboration (S08/S10-offpage). I did **not** ghost-write articles — briefs only.

## 2. Method

- **Read:** Zabble Business & Module Overview (30 modules, pillars, industries,
  voice), `00-conventions.md`, `reference/aeo-geo-principles.md`,
  `targets/keyword-map.md`, `content/README.md`, `app/data/systems.ts` (canonical
  `/systems/<slug>` set — 30 modules + 2 industry-bundle pages).
- **DataForSEO (live, South Africa, `language_code: en`).** The hosted MCP
  returned `401` in this session (env not loaded at launch — known caveat,
  `status.md`), so calls were made directly against the REST API using the
  `.env` Basic-auth token loaded into a shell variable — **never echoed,
  written, or committed** (conventions §3).
  - `dataforseo_labs/google/keyword_overview/live` — 38 priority-cluster
    keywords → SA volume, competition, CPC, **search intent**. Cost $0.0128.
  - `serp/google/organic/live/advanced` × 5 (`popia compliance`, `what is
    anomaly detection`, `automated bank reconciliation`, `demand forecasting
    software`, `ai receptionist`) → SERP feature mix (`item_types`), PAA
    questions, AI-Overview reference domains. Cost 5 × $0.002.
  - **Total spend ~$0.023.** All raw JSON + a sidecar note in
    `_evidence/10-content/`.
- **Prioritisation:** scored every Wave-1 candidate on the rubric in §4 and in
  `content/editorial-calendar.md` §3; sequenced for a new domain (entity/pillars
  first, then highest-fit clusters).

## 3. Current state (findings)

| # | Finding | Evidence |
|---|---------|----------|
| F1 | **No content exists yet** — `content/` is an empty skeleton; 30 `/systems/<slug>` money pages exist as near-identical-structured templates (duplicate-content risk per `aeo-geo-principles.md` §2). | repo; `content/README.md` |
| F2 | **SA demand for our exact terms is thin.** Top anchors: `popia compliance` 260/mo, `workflow automation` 140, `anomaly detection` 90, `ipaas` 90, `master data management` 90, `inventory management software SA` 50; most module terms 10–50/mo; several brand seeds (`bespoke crm`, `custom crm south africa`, `ai receptionist`, `business process automation south africa`) **no measured volume**. | `labs-keyword-overview__priority-clusters__za.json` |
| F3 | **High commercial value despite low volume** — `client onboarding software` CPC $24.73, `kyc automation` $21.78, `inventory management SA` $18.95, `ipaas` $13.5. Money intent is real even where clicks are few. | same |
| F4 | **Every priority query triggers an AI Overview *and* PAA in SA** (5/5 sampled). The answer/generative surface is the battleground. | `serp-organic__*__za.json` |
| F5 | **Citation landscape varies by topic.** Generic definitions are held by global authorities (IBM/CrowdStrike/AWS for anomaly detection); ZA regulatory queries by SA legal/reg sources (popia.co.za, Cliffe Dekker, InfoRegulator); AI-receptionist by SaaS vendors (IONOS/Yeastar). → win the *SA/use-case* angle, not the textbook. | `serp-organic__*__za.json` references |
| F6 | **Baseline = zero.** No editorial pages, no topical-cluster linking, no FAQ blocks live today. All metrics below start from 0. | repo |

**Strategic conclusion (baseline → target):** the editorial engine's KPI is not
traffic-at-volume but **topical-authority + entity citability** — measured by
AI-Overview/PAA presence for priority queries, FAQ-rich-result eligibility, and
assisted conversions into `/diagnose` and `/systems/<slug>` — not raw sessions.

## 4. Gaps & opportunities (prioritised)

**Prioritisation rubric** (full version in `editorial-calendar.md` §3):
`Priority = 3·BusinessFit + 2·AEO/GEO-winnability + 2·FoundationValue +
2·Demand + 1·Ease` (each factor 1–5, max 50). **P0 ≥ 38 · P1 30–37 · P2 < 30.**
The weighting deliberately ranks business-fit + answer-surface winnability +
topical-foundation above raw volume, because F2/F4 show volume is thin but the
answer surface is universal.

| Gap | Priority | Opportunity |
|-----|:--------:|-------------|
| No entity/topical spine for AI engines to reason about Zabble | **P0** | 5 pillar hubs (briefs 01–05) establish the four-pillar entity + bespoke thesis |
| 30 thin money pages at cannibalisation risk, no supporting content | **P0** | Cluster articles give each money page distinct, intent-bearing support at a *different* intent (no cannibalisation) |
| POPIA = real ZA demand (260/mo) + open operational angle | **P0** | Brief 07 owns "how to automate the reporting", not the legal definition |
| AI-Overview/PAA present on every query but Zabble cited nowhere | **P0** | Answer-first + FAQ (PAA-seeded) structure across all 15 briefs |
| High-CPC onboarding/KYC, fraud, reconciliation underserved | **P1** | Briefs 06, 09, 15 capture high-value low-volume commercial intent |
| 20 modules + 7 industry hubs not yet covered | **P1/P2** | Waves 2–3 backlog in the calendar; coverage matrix §below |

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| R1 | P0 | Ship the topical-authority model + calendar as the editorial source of truth | `content/editorial-calendar.md` (S06) | this audit |
| R2 | P0 | Write Wave 1 in sequence: 5 pillar hubs → 10 flagship clusters, 1/week | `content/briefs/01–15` (writers, S06) | F1, F4 |
| R3 | P0 | Create the 5 pillar hub URLs (`/what-we-build/<pillar>`, per S04 scheme) + cluster URLs; slot into IA/nav/breadcrumbs | **S04** (architecture) | calendar §1, §7 |
| R4 | P0 | Set per-article `useSeoMeta` + canonical so articles (informational) never cannibalise money pages (commercial) | **S02** (on-page) | calendar §6 |
| R5 | P0 | Mark up `FAQPage` + `Article` schema 1:1 with the FAQ blocks in each brief | **S03** (schema) | briefs' FAQ sections |
| R6 | P1 | Lead ZA-core publishing with POPIA reporting (brief 07) — best demand + open angle | writer; links `/systems/compliance-reporting` | F2, `serp-organic__popia-compliance__za.json` |
| R7 | P1 | Keep every module description identical to `app/data/systems.ts` for GEO corroboration | S06 writers + **S08** | `aeo-geo-principles.md` §4 |
| R8 | P1 | Run full SA keyword research for Wave-2/3 candidates; populate the map | **S05** (requests appended to `keyword-map.md` §4) | F2 |
| R9 | P2 | After Wave 1, build the 7 industry hubs to link the module clusters together | S06 (Wave 2–3) | calendar §2 |

## 6. Cross-session asks (mirror into each session's status.md notes)

- **S04 (architecture):** create 5 pillar hub pages at `/what-we-build/<pillar>`
  (`bespoke-systems`, `automation`, `audit-trails`, `anomaly-detection`,
  `analytics`) + the 10 Wave-1 cluster article URLs (see each brief header);
  place in nav/breadcrumbs; wire the internal-link graph in
  `editorial-calendar.md` §6 and align with `internal-linking.md`.
- **S02 (on-page):** implement title/meta from each brief; set canonicals so
  informational articles don't compete with commercial money pages.
- **S03 (schema):** `FAQPage` + `Article` schema matching the FAQ blocks verbatim.
- **S05 (keywords):** research Wave-2/3 candidates (requests appended to
  `targets/keyword-map.md` §4); confirm no two URLs share a primary keyword.
- **S07 (AEO):** review answer-first specs + FAQ shape; own the FAQ↔schema pairing.
- **S08 (GEO) / S10 (off-page):** harden the Zabble entity + corroborate the
  quotable claims off-site so the citations these articles target actually land.

## 7. Per-module coverage matrix (covered now vs later)

Legend: **W1** = first wave (briefed now) · **W2/W3** = calendar backlog (outline
only). "Brief" = the Wave-1 brief file, where applicable.

| # | Module | `/systems/<slug>` | Pillar | Industries | Coverage | Brief |
|---|--------|-------------------|--------|------------|:--------:|-------|
| 1 | Kairos — Voice Agent | `kairos` | Auto·Audit·Analytics | Events, hospitality, clinics | **W1** | 10 |
| 2 | Approval & Sign-Off | `approval-workflow` | Auto·Audit | Banks/FSPs, NGOs | W2 | — |
| 3 | Multi-Channel Inbox | `multi-channel-inbox` | Auto·Audit | Sales, support, agencies | W3 | — |
| 4 | Event-Driven Orchestrator | `workflow-orchestrator` | Auto·Audit | E-commerce, ops | W2 | — |
| 5 | Decision Engine | `decision-engine` | Auto·Audit | FSPs/lenders, sales | W2 | — |
| 6 | Document Intelligence | `document-intelligence` | Auto·Audit | Law, banks, insurers | **W1** | 08 |
| 7 | Document Assembly | `document-assembly` | Auto·Audit | Consulting, prof. svcs | W3 | — |
| 8 | Bespoke CRM | `bespoke-crm` | Auto·Analytics | SMBs, agencies, sales | **W1** | 12 |
| 9 | Unified Customer Record | `customer-360` | Analytics·Auto | B2B/SaaS | W3 | — |
| 10 | Knowledge & SOP Assistant | `knowledge-assistant` | Auto·Audit | Retail, hospitality | W3 | — |
| 11 | Lead Qualification | `lead-qualifier` | Auto·Analytics | High-ticket svcs, events | **W1** | 11 |
| 12 | Legacy Bridge | `legacy-bridge` | Auto | Established SMBs, mfg | W3 | — |
| 13 | Inventory Clarity (RFID) | `inventory-clarity` | Auto·Anomaly·Analytics·Audit | Warehousing, hospitality | W2 | — |
| 14 | Client Onboarding | `client-onboarding` | Auto·Audit | Wealth, banks, prof. svcs | **W1** | 15 |
| 15 | Case Management | `case-management` | Auto·Audit | Law, NGOs, HR | W2 | — |
| 16 | Task Management | `task-management` | Auto·Audit | Conveyancing, projects | W3 | — |
| 17 | Field Operations App | `field-ops-app` | Auto·Analytics | Utilities, installers, NGOs | W3 | — |
| 18 | Analytics & Decision Support | `analytics-suite` | Analytics | Logistics, hospitality | W2 | — |
| 19 | Accounting Engine | `accounting-engine` | Auto·Audit·Analytics | Project firms, founders | W3 | — |
| 20 | Compliance & Reg. Reporting | `compliance-reporting` | Audit·Auto·Analytics | Banks/FSPs, NGOs | **W1** | 07 |
| 21 | Continuous Assurance | `continuous-assurance` | Anomaly·Audit | Banks/FSPs, ops | **W1** | 09 |
| 22 | Pricing & Quote | `pricing-engine` | Auto·Audit | Parts/wholesale, hospitality | W2 | — |
| 23 | Reconciliation | `reconciliation-engine` | Auto·Anomaly·Audit | Retail, hospitality, finance | **W1** | 06 |
| 24 | Data Routing Pipeline | `data-routing` | Auto·Analytics·Audit | Banks, NGOs | W3 | — |
| 25 | Integration Hub | `integration-hub` | Auto | Booking ops, SMBs | **W1** | 13 |
| 26 | Cross-System Sync | `cross-system-sync` | Auto·Audit | Retail, HR/payroll | W3 | — |
| 27 | Forecasting & Demand Planning | `forecasting` | Analytics | Restaurants, parts, SaaS | **W1** | 14 |
| 28 | Predictive Maintenance | `predictive-maintenance` | Anomaly·Analytics | Mining, manufacturing | W3 | — |
| 29 | Master Data Hub | `master-data-hub` | Auto·Audit | Distribution, retail | W2 | — |
| 30 | Notification & Alert Orchestration | `notification-orchestration` | Auto·Audit | Ops, on-call, retail/finance | W3 | — |
| — | Legal Intake (bundle) | `legal-intake-automation` | Auto·Audit | Law firms | W2 | — |
| — | Hospitality Booking+Marketing (bundle) | `hospitality-booking-marketing-dashboard` | Auto·Analytics | Hotels | W3 | — |

**Coverage now:** 5 pillar hubs + 10 modules (W1) = **10/30 modules** have a
ready brief; **all 30** mapped to a theme/industry/wave. Pillar hubs cover all
four pillars + the thesis. **Industry hubs:** 0/7 built (Wave 2–3).
**Plus the 5 pillar-hub briefs (01–05) and 10 cluster briefs (06–15) = 15
briefs total**, exceeding the 12-brief first-wave requirement.

## 8. Evidence index

| File (`_evidence/10-content/`) | Proves |
|--------------------------------|--------|
| `README.note.md` | Method, redaction note, full read-out of findings + PAA questions |
| `labs-keyword-overview__priority-clusters__za.json` | SA volume/competition/CPC/intent for 38 keywords (F2, F3) |
| `serp-organic__popia-compliance__za.json` | AI Overview + PAA + SA reg citation set (F4, F5) |
| `serp-organic__what-is-anomaly-detection__za.json` | AI Overview + PAA + global-authority citation set (F4, F5) |
| `serp-organic__automated-bank-reconciliation__za.json` | AI Overview + PAA (F4) |
| `serp-organic__demand-forecasting-software__za.json` | AI Overview + PAA (F4) |
| `serp-organic__ai-receptionist__za.json` | AI Overview + PAA + SaaS-vendor citation set (F4, F5) |
