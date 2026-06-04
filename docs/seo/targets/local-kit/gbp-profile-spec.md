# Google Business Profile — ready-to-submit spec (owned by S04)

Everything to create + populate Zabble's GBP in one sitting, the moment the owner
provides NAP (B6) and completes verification. Every value is the single source of
truth — pull NAP from `app/data/nap.ts`, descriptions from here, so the profile,
the site, the schema (S08) and the directories all agree.

> **Gated on:** B6 (NAP: registered name, address or service-area, +27 phone) and
> owner login/verification. Nothing here can be auto-submitted by S04.

## 1. Identity (from `app/data/nap.ts`)

| Field | Value |
|-------|-------|
| Business name | `Zabble` (exact — no suffixes in the GBP name field; Google penalises keyword-stuffed names) |
| Primary phone | `{{NAP.phone}}` — international `+27` form (B6) |
| Website | `https://zabble.org` |
| Address | `{{NAP street/suburb/city/province/postal}}` (B6) — or hide if service-area (see §3) |
| Email (contact) | `analytics@zabble.org` |
| Hours | Mon–Fri 08:00–17:00 (SAST) |

## 2. Categories

- **Primary:** `Software company`
  *(the ranking category in the SA Maps benchmark —
  `../../_evidence/04/business-listings__software-company-jhb.json`)*
- **Secondary (add 2–3):**
  - `Business management consultant`
  - `Software development` / `Website designer`
  - `Business to business service`

## 3. Service-area setup

Zabble is a service-area business (`NAP.serviceArea = true`). If there is no public
walk-in office:
- Set **service areas:** Johannesburg, Sandton, Cape Town, Pretoria, Durban (mirror
  `NAP.areasServed`).
- **Hide the street address** (show service areas only) — allowed for SABs and avoids
  a verification mismatch.

## 4. Description (750 chars max — paste verbatim)

Use `NAP.description` as the opening sentence, then:

> Zabble builds bespoke operational systems for South African businesses —
> automation, audit trails, anomaly detection, and analytics — delivered as custom
> software tailored to how each business actually runs. Rather than forcing your team
> onto off-the-shelf software, we find the operational problem costing you the most
> and build the system that fixes it. We work with operators across Johannesburg,
> Sandton, Cape Town, Pretoria and Durban, across financial services, legal, NGOs,
> logistics, hospitality, manufacturing, professional services and field operations.
> Book a discovery call at zabble.org.

*(Keep ≤ 750 characters; the block above is within budget.)*

## 5. Services (add each as a GBP "Service")

Add Zabble's systems as services — name + one-line description (mirror
`app/data/systems.ts`). This also strengthens the entity for GEO. Grouped:

- **Automation & workflow:** Event-Driven Workflow Orchestrator, Approval & Sign-Off
  Workflow, Notification & Alert Orchestration, Integration Hub, Cross-System Sync.
- **Finance & compliance:** Reconciliation Engine, Accounting Engine, Pricing & Quote
  Engine, Compliance & Regulatory Reporting, Data Routing Pipeline.
- **Documents & knowledge:** Document Intelligence, Document Assembly, Internal
  Knowledge & SOP Assistant.
- **Customer & sales:** Bespoke CRM, Unified Customer Record, Lead Qualification
  Engine, Multi-Channel Inbox, Kairos.
- **Operations & field:** Case Management, Task Management, Client Onboarding, Field
  Operations App, Inventory Clarity, Predictive Maintenance.
- **Decision & assurance:** Decision Engine, Continuous Assurance Engine, Analytics &
  Decision Support Suite, Forecasting & Demand Planning, Master Data Hub, Legacy Bridge.

*(Full list + one-liners: `app/data/systems.ts`. Use the system `tagline` as the
service description.)*

## 6. Attributes

Set true where accurate: **Online appointments**, **Online estimates**,
**Identifies as Black-owned / women-owned** *(only if accurate — owner to confirm)*,
**LGBTQ+ friendly** *(if applicable)*.

## 7. Photos

Logo (square), cover (landscape), 3–5 team/work photos, and 2–3 screenshots of demo
systems. Brand accent `#01DBF1` on white.

## 8. Posts (publish weekly for freshness)

Rotate:
1. A system spotlight (link the `/systems/<slug>` page).
2. An industry angle (link `/industries/<slug>`).
3. A city angle (link `/locations/<city>`).
4. The reference asset (link `/insights/south-african-operations-software-landscape`).

## 9. Q&A (seed 5–8; doubles as AEO)

Seed and answer, in Zabble's voice:
- "What does Zabble do?" → `NAP.description`.
- "Where is Zabble based / who do you serve?" → South Africa; Joburg, Sandton, Cape
  Town, Pretoria, Durban.
- "Do you build custom software or sell a product?" → bespoke systems, built per business.
- "What industries do you work with?" → list from `/industries`.
- "How do we start?" → book a discovery call; first conversation is free.

## 10. Reviews

Run the review drip in `review-strategy.md`. Target ≥4.7 with 20–30 reviews in the
first two quarters (peer benchmark: BBD 4.6/249, Entelect 4.7/179 —
`../../_evidence/04/business-listings__software-company-jhb.json`).
