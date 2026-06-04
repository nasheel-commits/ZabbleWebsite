# Keyword Map (skeleton) — owned by S05

The master map from **keyword → URL → intent → layer → priority**. S05 fills it
from DataForSEO (South Africa); S02/S06/S07/S08 read it. Until S05 runs, this is
a **skeleton with structure + seed candidates**, not researched data — every row
needs a volume/KD backed by `_evidence/05/` before it counts as a target
(conventions §6).

- **Market:** South Africa · `location_name: "South Africa"` · `language_code: "en"`
- **Owner:** S05 (`seo/05-keywords`). Other sessions append requests in §4 only.
- **Status:** SKELETON — awaiting research (DataForSEO blocked on account
  verification as of 2026-06-04).

---

## 1. How to fill this

For each target keyword, capture from DataForSEO Labs/Keywords:
`search volume (SA)`, `keyword difficulty`, `search intent`
(informational/commercial/transactional/navigational → drives the **layer**),
then assign the **destination URL** (an existing page or a "to-create" gap) and a
**priority** (P0/P1/P2). One evidence file per cluster.

Layer rule of thumb (see `reference/aeo-geo-principles.md`):
informational/question → **AEO/GEO**; commercial/transactional → **SEO**;
navigational ("zabble") → brand/**GEO entity**.

---

## 2. Primary clusters (seed candidates — UNVERIFIED)

Group by money page. Volumes/KD/intent are **TBD — fill from evidence**.

### Brand / entity (navigational → GEO)
| Keyword | URL | Intent | Layer | Vol (SA) | KD | Priority | Evidence |
|---------|-----|--------|-------|----------|----|----------|----------|
| zabble | `/` | navigational | GEO/brand | TBD | TBD | — | — |

### Core offering (home + /systems)
| Keyword (seed) | URL | Intent | Layer | Vol | KD | Pri | Evidence |
|----------------|-----|--------|-------|-----|----|----|----------|
| bespoke business systems south africa | `/` | commercial | SEO | TBD | TBD | TBD | — |
| custom software development south africa | `/` or `/systems` | commercial | SEO | TBD | TBD | TBD | — |
| business automation south africa | `/systems` | commercial | SEO | TBD | TBD | TBD | — |
| workflow automation company | `/systems` | commercial | SEO | TBD | TBD | TBD | — |
| how do I automate my business processes | `/diagnose` | informational | AEO/GEO | TBD | TBD | TBD | — |

### Per-module money pages (`/systems/<slug>`)
One small cluster per module. Seeds below derive from `app/data/systems.ts`
problems/pillars — S05 expands each with Labs `keyword_ideas`.

| Module / URL | Seed keyword(s) | Intent | Layer | Vol | KD | Pri | Evidence |
|--------------|-----------------|--------|-------|-----|----|----|----------|
| `/systems/bespoke-crm` | custom crm south africa; bespoke crm | commercial | SEO | TBD | TBD | TBD | — |
| `/systems/reconciliation-engine` | automated bank reconciliation; reconciliation software | commercial | SEO | TBD | TBD | TBD | — |
| `/systems/document-intelligence` | document data extraction; ocr document automation | commercial | SEO | TBD | TBD | TBD | — |
| `/systems/pricing-engine` | quote automation; cpq south africa | commercial | SEO | TBD | TBD | TBD | — |
| `/systems/compliance-reporting` | regulatory reporting automation; popia reporting | commercial | SEO | TBD | TBD | TBD | — |
| `/systems/continuous-assurance` | transaction fraud detection; anomaly detection | commercial | SEO | TBD | TBD | TBD | — |
| `/systems/kairos` | ai receptionist; voice agent for events | commercial | SEO | TBD | TBD | TBD | — |
| `/systems/lead-qualifier` | lead qualification automation | commercial | SEO | TBD | TBD | TBD | — |
| `/systems/integration-hub` | integrate business tools; ipaas south africa | commercial | SEO | TBD | TBD | TBD | — |
| `/systems/forecasting` | demand forecasting software | commercial | SEO | TBD | TBD | TBD | — |
| _…remaining ~20 modules — one row each, from `systems.ts`…_ | | | | | | | |

### Question / answer targets (AEO + GEO)
| Question keyword | URL | Layer | Has SERP answer slot? | Evidence |
|------------------|-----|-------|-----------------------|----------|
| what is a bespoke crm | `/systems/bespoke-crm` | AEO | TBD (check SERP item_types) | — |
| how to automate document processing | `/systems/document-intelligence` | AEO | TBD | — |
| who builds custom business software in south africa | `/` | GEO | TBD (AI Overview) | — |
| what is anomaly detection in business | `/systems/continuous-assurance` | AEO/GEO | TBD | — |

---

## 3. Coverage check (fill after research)
- [ ] Every one of the 30 `/systems/<slug>` pages has ≥1 verified primary keyword.
- [ ] No two pages target the same primary keyword (cannibalisation guard).
- [ ] Each money page has ≥1 question target for AEO.
- [ ] Brand + 3–5 core-offering keywords baselined.

## 4. Requests for keywords (other sessions append here)
> S02/S06/S07/S08: add the keyword/intent you need researched and your session #.
> S05 picks these up. Do not edit the tables above.

- **(S06 content, 2026-06-04)** Spot-research done for Wave 1 (SA, live) is in
  `_evidence/10-content/`. Key reads: `popia compliance` 260/mo (informational,
  LOW), `workflow automation` 140, `anomaly detection` 90, `ipaas` 90, `master
  data management` 90, `inventory management software south africa` 50; most
  module terms 10–50/mo; `bespoke crm`, `custom crm south africa`, `ai
  receptionist`, `business process automation south africa`, `invoice data
  extraction`, `quote automation software`, `cpq software` returned **no
  measured SA volume**. Every sampled query shows an **AI Overview + PAA**.
- **S06 requests for full research (Wave 2/3 candidates):** verify SA volume/KD
  + intent + SERP item_types for: `approval workflow software`, `decision engine
  software`, `order management automation`, `rfid inventory tracking`, `case
  management software` (got 30/mo — expand long-tail), `cpq` / `quote
  automation`, `role based dashboard` / `bi dashboard south africa`, `master
  data management` (90 — expand), `predictive maintenance`, `alert management` /
  `notification orchestration`. Also confirm **no two `/systems/<slug>` pages
  share a primary keyword** (cannibalisation guard, §3).
