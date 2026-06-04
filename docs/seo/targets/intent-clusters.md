# Intent Clusters & Page Roles — Zabble (South Africa) — owned by S03

Companion to [`keyword-map.md`](keyword-map.md). Where the map is the flat keyword table,
this document is the **topical structure**: each cluster, its **primary** (hub / money)
page, its **supporting** (use-case / blog) pages, and the **AEO/GEO question set** that
S06 (content), S07 (AEO) and S08 (GEO) build answers around.

- **Market:** South Africa · `location_name: "South Africa"` · `language_code: "en"`
- **Data captured:** 2026-06-04 · evidence in `_evidence/03/` · metrics + tiers in `keyword-map.md`.
- **Primary vs supporting (definition):**
  - **Primary (hub / money page)** — one canonical page owns the cluster's head term and
    carries the commercial intent. For modules this is `/systems/<slug>`; for the offering
    it's `/`; for a pillar a `/pillars/<slug>` hub (to-create).
  - **Supporting (use-case / blog / FAQ)** — long-tail, industry-cut and question pages that
    link up to the primary and capture awareness/answer intent. Mostly to-create (S06).

> **The thin-demand reality (see `keyword-map.md` §1).** Most module heads sit at 10–70/mo
> in ZA. The cluster structure therefore optimises for **topical authority + AEO/GEO answer
> ownership**, not single-keyword volume: a tight money page + a handful of question-shaped
> supporting answers will out-perform chasing exact-match heads that barely exist.

---

## 1. Cluster overview (which surface wins each)

| Cluster group | # kw | Lead intent | Primary surface | Notes |
|---|---|---|---|---|
| Brand / entity | 5 | navigational | **GEO entity** + brand SERP | `zabble` only ~10/mo (pre-launch) — build the entity now. |
| Core offering (home) | 24 | commercial / navigational | **SEO + Local + GEO** | Local pack present on the core terms — GBP + `LocalBusiness` schema. |
| 4 Pillar hubs | 17 | commercial + informational | **SEO hub + AEO** | Hubs to-create; each gathers its modules + a "what is" answer. |
| 30 Module money pages | 129 | commercial | **SEO money page + AEO FAQ** | One primary kw each (table §2). |
| Industry use-case | 11 | commercial | **SEO use-case + GEO** | ZA-cut pages per industry (to-create). |
| AEO/GEO questions | 27 | informational | **AEO/GEO** | FAQ blocks on money pages + a few standalone explainers. |

---

## 2. Module clusters → primary & supporting pages (all 30)

Primary keyword is the top-scored term for that money page (`keyword-map.md` §3 scoring).
Pillars per `app/data/systems.ts` / the business overview.

<!-- MODTABLE -->
| Module (page) | Pillars | Primary keyword (vol/KD) | Supporting keywords |
|---|---|---|---|
| **Kairos — Voice Agent & Event Orchestration** `/systems/kairos` | Automation · Audit · Analytics | `event management software` (70/n/d) | ai receptionist, virtual receptionist software, ai voice agent |
| **Approval & Sign-Off Workflow** `/systems/approval-workflow` | Automation · Audit | `approval workflow software` (10/n/d) | approval management software, loan approval workflow, sign off workflow software |
| **Multi-Channel Inbox** `/systems/multi-channel-inbox` | Automation · Audit · Analytics | `omnichannel inbox` (10/n/d) | shared inbox software, unified inbox software, multichannel customer support software |
| **Event-Driven Workflow Orchestrator** `/systems/workflow-orchestrator` | Automation · Audit | `workflow orchestration software` (10/n/d) | workflow automation software, business workflow software, event driven automation |
| **Decision Engine** `/systems/decision-engine` | Automation · Audit · Analytics | `decision engine software` (10/n/d) | decision management software, rules engine software, loan decisioning software |
| **Document Intelligence System** `/systems/document-intelligence` | Automation · Audit | `intelligent document processing` (20/n/d) | ocr automation software, invoice data capture software, document data extraction |
| **Document Assembly System** `/systems/document-assembly` | Automation · Audit | `document assembly software` (10/n/d) | document generation software, contract generation software, proposal automation software |
| **Bespoke CRM** `/systems/bespoke-crm` | Automation · Analytics · Audit | `crm software in south africa` (320/2) | crm software south africa, custom crm, bespoke crm |
| **Unified Customer Record** `/systems/customer-360` | Automation · Audit · Anomaly | `customer data platform` (40/57) | single customer view, unified customer view, customer 360 software |
| **Internal Knowledge & SOP Assistant** `/systems/knowledge-assistant` | Automation · Audit · Analytics | `internal knowledge base software` (10/n/d) | sop software, company wiki software, ai knowledge assistant |
| **Lead Qualification Engine** `/systems/lead-qualifier` | Automation · Audit | `lead qualification automation` (10/n/d) | automated lead qualification, lead scoring software, lead qualification software |
| **Legacy Bridge** `/systems/legacy-bridge` | Automation | `legacy system integration` (10/n/d) | legacy system modernization, erp integration software, legacy modernization |
| **Inventory Clarity System** `/systems/inventory-clarity` | Automation · Anomaly · Analytics · Audit | `inventory management software` (260/15) | stock management software, rfid inventory system, rfid asset tracking |
| **Client Onboarding System** `/systems/client-onboarding` | Automation · Audit · Analytics | `client onboarding software` (10/n/d) | customer onboarding software, kyc onboarding software, digital onboarding software |
| **Case Management System** `/systems/case-management` | Automation · Audit | `case management system` (70/n/d) | case management software, legal case management software, matter management software |
| **Task Management System** `/systems/task-management` | Automation · Audit | `conveyancing software` (10/n/d) | task management software, workflow task management |
| **Field Operations App** `/systems/field-ops-app` | Automation · Analytics | `field service management software` (50/50) | field operations software, field service app, offline data collection app |
| **Analytics & Decision Support Suite** `/systems/analytics-suite` | Analytics · Anomaly | `business analytics software` (210/53) | business intelligence dashboard, decision support software, operational analytics software |
| **Accounting Engine** `/systems/accounting-engine` | Automation · Audit · Analytics | `accounting software south africa` (480/25) | accounting automation software, automated accounting software, event driven accounting |
| **Compliance & Regulatory Reporting Engine** `/systems/compliance-reporting` | Audit · Automation · Anomaly | `popia compliance` (260/27) | regulatory reporting software, regulatory reporting automation, compliance reporting software |
| **Continuous Assurance Engine** `/systems/continuous-assurance` | Anomaly · Audit · Analytics | `transaction monitoring software` (10/n/d) | continuous monitoring software, aml transaction monitoring |
| **Pricing & Quote Engine** `/systems/pricing-engine` | Automation · Audit · Analytics | `cpq software` (10/n/d) | pricing engine software, quote management software, quoting software |
| **Reconciliation Engine** `/systems/reconciliation-engine` | Automation · Anomaly · Audit | `bank reconciliation software` (30/n/d) | reconciliation software, automated bank reconciliation, account reconciliation software |
| **Data Routing Pipeline** `/systems/data-routing` | Automation · Analytics · Audit | `data pipeline software` (10/n/d) | data integration platform, automated reporting software, regulatory reporting pipeline |
| **Integration Hub** `/systems/integration-hub` | Automation | `integration platform` (10/n/d) | system integration software, api integration platform, business systems integration |
| **Cross-System Sync Engine** `/systems/cross-system-sync` | Automation · Audit | `data synchronization software` (10/n/d) | real time data sync, system sync software, two way data sync |
| **Forecasting & Demand Planning** `/systems/forecasting` | Analytics · Automation · Anomaly | `demand forecasting software` (10/n/d) | demand planning software, sales forecasting software, inventory forecasting software |
| **Predictive Maintenance System** `/systems/predictive-maintenance` | Anomaly · Analytics · Automation | `predictive maintenance software` (10/n/d) | condition monitoring software, predictive maintenance system, machine failure prediction |
| **Master Data Hub** `/systems/master-data-hub` | Automation · Audit · Anomaly | `mdm software` (90/n/d) | master data management, master data management software, golden record software |
| **Notification & Alert Orchestration** `/systems/notification-orchestration` | Automation · Anomaly · Audit | `alert management software` (0/n/d) | notification management software, incident alerting software, alert orchestration software |
<!-- /MODTABLE -->

**Module notes for downstream sessions:**
- **Bespoke CRM** is the strongest cluster on the board — `crm software in south africa`
  (KD **2**) and `crm software south africa` (KD 18) both at 320/mo. Make `/systems/bespoke-crm`
  the flagship money page; lead with the *bespoke vs off-the-shelf* angle (the SERP is full
  of Zoho/Salesforce/Sage — Zabble's wedge is "shaped to your pipeline", not another SaaS).
- **Accounting Engine** (`accounting software south africa` 480/mo) and **Inventory Clarity**
  (`inventory management software` 260/mo) carry real volume but crowded SERPs — differentiate
  on *event-driven / bespoke / RFID source-of-truth*.
- **Compliance & Regulatory Reporting** owns the uniquely-SA `popia compliance` (260) +
  `what is popia` (390) pair — the clearest "own the question, win the buyer" play.
- **~20 modules sit at 10/mo or `n/d`.** These win through AEO/GEO (§3) and being a clean,
  liftable entity (§4), not classic SEO. Do **not** spin up thin geo-variant pages for them.

---

## 3. AEO / GEO question sets per cluster (for S06 / S07 / S08 / S10)

Each set is the question-shaped content a money page (or its FAQ block) should answer in the
**first 40–60 words**, then elaborate (per `reference/aeo-geo-principles.md` §3). Questions
marked **[SERP✓]** were confirmed live to carry an AI Overview and/or People-Also-Ask slot
(`_evidence/03/serp-paa-questions__clusters__za.json`, 2026-06-04) — those are the highest-
priority answer targets. Others are authored from module language + validated for volume in
`keyword-map.md`.

### Core offering / "who builds bespoke software" (→ `/`, `/diagnose`)
- **who builds custom software in south africa** **[SERP✓ AIO+PAA+LocalPack]** — the money question.
- how much does custom software cost in south africa **[SERP✓ PAA: "How much does it cost to develop custom software?"]**
- what is bespoke software · what is custom software development
- custom software vs off the shelf · bespoke software vs off the shelf software
- PAA seen live: *"How to build a custom software?"*, *"Who is the biggest IT company in South Africa?"*

### Automation pillar (→ `/pillars/automation`, home)
- **what is business process automation** **[SERP✓ AIO+PAA]** · what is workflow automation
- how to automate business processes · how to integrate business systems
- PAA seen live: *"What are the 5 stages of BPM?"*, *"Is RPA better than AI?"*

### Bespoke CRM (→ `/systems/bespoke-crm` FAQ)
- **what is crm software** **[SERP✓ AIO+PAA+Video]** · what is a crm system (390/mo)
- best crm for small business south africa
- PAA seen live: *"What are the 4 types of CRM?"*, *"What does CRM software do?"*, *"What is an example of CRM software?"*, *"Which is the most popular CRM software?"*

### Compliance & Regulatory Reporting (→ `/systems/compliance-reporting` FAQ)
- **what is popia** **[SERP✓ AIO+PAA+Video]** (390/mo) · popia compliance requirements · what is regulatory reporting
- PAA seen live: *"How to get POPIA compliance?"*, *"What are the key compliance requirements of POPIA?"*, *"What are the main 3 principles of the POPI Act?"*, *"What is a POPI Act violation?"*

### Continuous Assurance / anomaly (→ `/systems/continuous-assurance` FAQ)
- **fraud detection software** **[SERP✓ AIO+PAA]** · what is anomaly detection
- PAA seen live: *"What is the best fraud detection software?"*, *"What are fraud detection tools?"*, *"Which AI tool is commonly used for fraud detection?"*

### Inventory Clarity (→ `/systems/inventory-clarity` FAQ)
- **inventory management software** **[SERP✓ PAA+Video]**
- PAA seen live: *"What are the 4 types of inventory management?"*, *"Can I use Excel to track inventory?"*, *"Is there a free software for inventory management?"*

### Accounting Engine (→ `/systems/accounting-engine` FAQ)
- **accounting software south africa** **[SERP✓ AIO+PAA+Video]** · best accounting software for small business south africa
- PAA seen live: *"What is the best accounting software in South Africa?"*, *"Can I use Excel as an accounting software?"*

### Reconciliation Engine (→ `/systems/reconciliation-engine` FAQ)
- what is reconciliation in accounting (140/mo, KD 17) · how to automate bank reconciliation

### Document Intelligence (→ `/systems/document-intelligence` FAQ)
- what is intelligent document processing · how to automate document processing

### Other module FAQ anchors (one each, authored; validate slot before publishing)
- Master Data Hub → what is master data management (90/mo) ·
  Decision Engine → what is a decision engine ·
  Pricing & Quote → what is cpq ·
  Forecasting → what is demand forecasting (40/mo) ·
  Predictive Maintenance → what is predictive maintenance (30/mo) ·
  Field Ops → what is field service management ·
  Case Management → what is a case management system ·
  Lead Qualifier → how to automate lead qualification.

> **GEO note (S08):** AI Overviews fire on nearly every commercial head here. The win is to
> be the **liftable, self-contained definition** — each module's first sentence should be a
> declarative "X is a system that …" a model can quote verbatim, consistent with
> `app/data/systems.ts` and the boilerplate. See `aeo-geo-principles.md` §4.

---

## 4. SERP-feature snapshot (the 10 queries pulled live, 2026-06-04)

`POST /v3/serp/google/organic/live/advanced`, South Africa. Full item lists in
`_evidence/03/serp-advanced__*__za.json`; questions in `serp-paa-questions__clusters__za.json`.

| Query | AI Overview | PAA | Local pack | Video | Cluster |
|---|:--:|:--:|:--:|:--:|---|
| crm software south africa | ✓ | ✓ | | | bespoke-crm |
| accounting software south africa | ✓ | ✓ | | ✓ | accounting-engine |
| inventory management software | | ✓ | | ✓ | inventory-clarity |
| business process automation | ✓ | ✓ | | | automation pillar |
| fraud detection software | ✓ | ✓ | | | continuous-assurance |
| popia compliance | ✓ | ✓ | | | compliance-reporting |
| custom software development south africa | ✓ | | ✓ | | core |
| who builds custom software in south africa | ✓ | ✓ | ✓ | | core |
| what is crm software | ✓ | ✓ | | ✓ | bespoke-crm (AEO) |
| what is popia | ✓ | ✓ | | ✓ | compliance-reporting (AEO) |

**Reads:** (1) AI Overview is effectively table-stakes — GEO is mandatory. (2) PAA is
winnable on 8/10 — FAQ schema on money pages is high-leverage (cross-ask to schema session).
(3) Local pack on both core "custom software" queries — **GBP + `LocalBusiness` + NAP
consistency** is a direct ranking lever for the home/offering page (cross-ask to S10).

---

## 5. Brand, pillar, core & industry clusters (supporting detail)

- **Brand (→ `/`):** `zabble` (10/mo), `zabble south africa`, `zabble.org`, `zabble systems`,
  `kairos voice agent`. Pre-launch and tiny — the job is **entity establishment** (Organization
  schema, `sameAs`, consistent boilerplate), not volume. Owns the navigational SERP at launch.
- **Pillar hubs (to-create `/pillars/<slug>`):** automation (`robotic process automation` 260,
  `business process automation` 50), analytics (`decision support system` 170, `business
  intelligence software`), anomaly-detection (`fraud detection software`, `anomaly detection`
  90), audit-trails (`audit management software`, `audit trail software`). Each hub links down
  to its member modules (see §2 pillar tags) and answers the pillar "what is" question.
- **Core (→ `/`):** `software development company south africa` (260), `custom software
  development south africa` (20, +local pack), `business process automation` (50), the
  city-cut `software development company {cape town|johannesburg|durban}`, and the
  high-but-ambiguous `operational systems` (2400 — **flagged**: ZA intent skews to academic
  "operating systems", low business fit; do not over-invest).
- **Industry use-case (to-create `/industries/<slug>`):** hospitality (30), legal (20),
  logistics (20+`warehouse management system south africa` 40), manufacturing (10); banking &
  NGO return `n/d` → GEO/AEO + global-English plays, not classic SEO. Each industry page
  assembles the relevant modules (overview "How It Comes Together") for that vertical.

---

## 6. Hand-offs

| Need | Owner | What |
|---|---|---|
| FAQ + `FAQPage` schema on money pages | schema session + S07 | The §3 question sets are PAA-eligible; schema unlocks the rich result. |
| Google Business Profile + `LocalBusiness` schema + NAP | S10 + schema session | Local pack fires on core "custom software" queries (§4). |
| Pillar hub + industry pages (to-create) | S06 | Page stubs referenced in §2/§5 do not exist yet. |
| Liftable entity definitions per module | S08 | First-sentence definitions for GEO (§3 note). |
| On-page primary-keyword assignment | S02 | Use the §2 primary per `/systems/<slug>`. |
