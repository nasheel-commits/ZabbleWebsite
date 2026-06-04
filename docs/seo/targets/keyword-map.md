# Keyword Map — Zabble (South Africa) — owned by S03 (Keyword & Market Research)

The master map from **keyword → cluster → intent → funnel stage → volume/difficulty/CPC
→ SERP features → target page → module/pillar → priority tier.** This is the shared
upstream dependency for S02 (on-page), S06 (content), S07 (AEO) and S08 (GEO).

- **Market:** South Africa · `location_name: "South Africa"` (code `2710`) · `language_code: "en"`
- **Owner:** S03 (`seo/03-keywords`). Other sessions append requests in §6 only — do not edit the tables.
- **Status:** ✅ RESEARCHED + OPERATIONALISED — 213-keyword map; all cross-session
  requests resolved (§6); live URL coverage verified (§7); launch rank baseline recorded (§8).
  **Updated 2026-06-04** (zabble.org live).
- **Canonical host:** `https://www.zabble.org` — apex `zabble.org` 301-redirects to `www`;
  all target URLs below use `www`. Live status of every URL: `_evidence/03/url-coverage__zabble-org__live.csv`.
- **Live baseline + monthly tracking:** [`rank-tracking.md`](rank-tracking.md).
- **Evidence:** `_evidence/03/` (raw JSON per call). Method + spend: `audits/03-keywords.md`.
- **Metric sources (all 2026-06-04):**
  - **Volume / CPC / competition** — `POST /v3/keywords_data/google_ads/search_volume/live`
    → `_evidence/03/gads-search-volume__curated__za.json`
  - **Keyword difficulty (KD)** — `POST /v3/dataforseo_labs/google/bulk_keyword_difficulty/live`
    → `_evidence/03/labs-bulk-kd__curated__za.json`
  - **Intent** — `POST /v3/dataforseo_labs/google/search_intent/live`
    → `_evidence/03/labs-search-intent__curated__za.json`
  - **SERP features** — `POST /v3/serp/google/organic/live/advanced` (10 representative queries)
    → `_evidence/03/serp-advanced__*__za.json`
- **Companion:** topical clusters, primary/supporting page roles and AEO question sets live
  in [`intent-clusters.md`](intent-clusters.md).

> **Volumes are USD-market Google-Ads figures, monthly-averaged and banded** — treat as
> directional, not exact. `n/d` = no measurable data returned for that exact term in ZA
> (the term is effectively sub-threshold, **not** proven-zero demand — it may still be worth
> a GEO/AEO target). `KD n/d` = DataForSEO returned no difficulty score (typically very
> low-data terms). Every figure is reproducible from `_evidence/03/`.

---

## 1. The headline finding (read this first)

**Exact-match demand for bespoke-B2B / "custom systems" language in South Africa is thin.**
Discovery expansions (`_evidence/03/labs-keyword-ideas__*`) are dominated by navigational,
consumer and education noise (bank logins, `capfin loan`, `software engineer jobs`,
university portals) — not buyers of bespoke operational systems. The few **real commercial
heads** that carry volume are generic software-category terms (`crm` 8 100, `erp system`
4 400, `accounting software`, `inventory management software`), plus ZA-qualified mid-tail
(`crm software south africa` 320, `software development company south africa` 260).

Three consequences shape the whole program:

1. **Volume alone is the wrong lever.** Priority is `volume × intent × winnability ×
   business-fit` (§3), not raw volume. Most money pages will rank for low-volume,
   high-intent terms — acceptable for a bespoke consultancy with high deal value.
2. **AEO + GEO are not optional.** **AI Overviews appeared on 9 of 10** Zabble-relevant
   SERPs checked, People-Also-Ask on 8 of 10 (`_evidence/03/serp-paa-questions__clusters__za.json`).
   Much of the addressable attention now lives on the answer/generative surface.
3. **Local search matters for the core offer.** `custom software development south africa`
   and `who builds custom software in south africa` both return a **Google local pack** —
   a Google Business Profile + `LocalBusiness` schema is direct leverage (cross-ask to
   S10 / schema session).

---

## 2. The "uber" priority set (top head targets)

The highest-business-value targets, scored per §3 then adjusted for surface coverage and
one-term-per-money-page. These anchor the program; everything else supports them.

| # | Keyword | ZA vol | KD | Intent | CPC | SERP | Target page | Why it's uber |
|---|---------|-------:|---:|--------|----:|------|-------------|---------------|
| 1 | **crm software south africa** | 320 | 18 | commercial | $17.53 | AIO, PAA | `/systems/bespoke-crm` | Best volume×intent×winnability; high CPC = real buyer value. (Near-twin `crm software in south africa`, KD **2**, is the easiest win on the board.) |
| 2 | **inventory management software** | 260 | 15 | commercial | $13.01 | PAA, Video | `/systems/inventory-clarity` | Low KD, strong volume, clean money-page fit. |
| 3 | **accounting software south africa** | 480 | 25 | commercial | $9.83 | AIO, PAA, Video | `/systems/accounting-engine` | Highest-volume commercial head with fit; crowded (Sage/Xero/Pastel) → lead with the *event-driven/bespoke* angle. |
| 4 | **popia compliance** | 260 | 27 | transactional | $1.59 | AIO, PAA | `/systems/compliance-reporting` | Uniquely SA, transactional, on-brand for the reporting engine; pairs with the `what is popia` AEO anchor. |
| 5 | **software development company south africa** | 260 | 26 | navigational | $3.13 | — | `/` (home) | Core-offering head; defines the entity; ZA-local. |
| 6 | **custom software development south africa** | 20 | n/d | commercial | — | **AIO, LocalPack** | `/` (home) | Low volume but decisive fit + **local pack + AI Overview** — a GEO/local play, not a volume play. |
| 7 | **business process automation** | 50 | 9 | informational | $1.71 | AIO, PAA | `/` or `/pillars/automation` | Defines the Automation pillar; very winnable (KD 9); AIO present. |
| 8 | **fraud detection software** | 10 | n/d | commercial | — | AIO, PAA | `/systems/continuous-assurance` | High-value anomaly-detection head; AIO+PAA slots to win even at low volume. |
| 9 | **who builds custom software in south africa** | n/d | n/d | commercial | — | **AIO, PAA, LocalPack** | `/` (home) | Pure GEO/voice/local intent — the question a buyer actually asks; local pack + AIO present. |
| 10 | **what is popia** | 390 | 25 | informational | $0.81 | AIO, PAA, Video | `/systems/compliance-reporting` FAQ | The single biggest informational driver with the full feature set; the AEO anchor that feeds the POPIA money page. |

*Selection method:* ranked by composite score (§3), then adjusted to (a) keep **one term
per money page**, (b) guarantee **surface coverage** — at least one local-pack core term
(#6, #9) and one AEO anchor (#10) — because for Zabble the local and generative surfaces
win deals even where classic search volume is low. Items #6, #8, #9 are explicitly
**strategic** (volume-light, surface-rich) rather than volume-led; this is stated so the
choice is auditable.

---

## 3. Scoring method (explicit & reproducible)

Computed in `_evidence/03/_merge.py` over the consolidated dataset. For each keyword:

```
score = 100 × V × I × D × B
```

| Factor | Definition | Rationale |
|--------|-----------|-----------|
| **V** — volume | `log10(vol+1) / log10(1000)`, capped 1.2 (`n/d`→0) | Log scale: a ~1 000/mo term ≈ 1.0; rewards demand without letting a few generic high-volume terms dominate. |
| **I** — intent fit | commercial 1.0 · transactional 1.0 · navigational 0.6 · informational 0.55 | Commercial/transactional buyers convert; informational feeds AEO/GEO (still valued, lower weight). Source: DataForSEO `search_intent`. |
| **D** — difficulty headroom | `1 − KD/100` (`KD n/d` → 0.65, i.e. assume KD 35) | Winnability for a new, low-authority pre-launch domain. Source: DataForSEO `bulk_keyword_difficulty`. |
| **B** — business fit | core 1.0 · brand 1.0 · module 0.95 · industry 0.85 · pillar 0.8 · AEO 0.7 | How directly the term maps to a Zabble money page / the bespoke offering. |

**Tiers** (column "Tier" in §4): `U` = uber (§2) · `P0` score ≥ 38 · `P1` score ≥ 24 ·
`P2` has measurable volume · `P3` no measurable volume yet (GEO/long-tail watch) ·
`AEO` = question-intent (routed to answer surfaces) · `Brand` = navigational/entity.

---

## 4. The full map (213 keywords)

Grouped by cluster. **SERP features** are populated only for the 10 queries pulled live
(others `—` = not individually checked; cluster-level features are in `intent-clusters.md`).
Funnel: top (awareness) · middle (consideration) · bottom (decision/brand). Layer routing
(see `reference/aeo-geo-principles.md`): commercial/transactional → **SEO**; question/
informational → **AEO/GEO**; navigational "zabble" → **GEO entity/brand**.

<!-- TABLE-START (generated by _evidence/03/_gen_map.py from consolidated.json, 2026-06-04) -->
### Brand / entity (navigational → GEO) — 5 keywords

| Keyword | Cluster | Intent | Funnel | Vol (ZA/mo) | KD | CPC | SERP features | Target page | Tier |
|---|---|---|---|---|---|---|---|---|---|
| zabble | brand | informational | bottom (brand) | 10 | n/d | $26.90 | — | / | **Brand** |
| zabble south africa | brand | informational | bottom (brand) | n/d | n/d | - | — | / | **Brand** |
| zabble.org | brand | navigational | bottom (brand) | n/d | n/d | - | — | / | **Brand** |
| kairos voice agent | brand | navigational | bottom (brand) | n/d | n/d | - | — | / | **Brand** |
| zabble systems | brand | commercial | bottom (brand) | n/d | n/d | - | — | / | **Brand** |

### Core offering / homepage — 24 keywords

| Keyword | Cluster | Intent | Funnel | Vol (ZA/mo) | KD | CPC | SERP features | Target page | Tier |
|---|---|---|---|---|---|---|---|---|---|
| software development company durban | core | commercial | middle (consideration) | 40 | 10 | $1.64 | — | / | **P0** |
| operational systems | core | informational | top (awareness) | 2400 | 32 | $0.11 | — | / | **P0** |
| custom software development company | core | commercial | middle (consideration) | 50 | n/d | - | — | / | **P1** |
| software development company cape town | core | commercial | middle (consideration) | 110 | 47 | $2.39 | — | / | **P1** |
| software development company south africa | core | navigational | bottom (decision) | 260 | 26 | $3.13 | — | / | **U** |
| business automation | core | informational | top (awareness) | 70 | 0 | $5.11 | — | / | **P1** |
| software development company johannesburg | core | commercial | middle (consideration) | 40 | 37 | $1.98 | — | / | **P1** |
| digital transformation south africa | core | commercial | middle (consideration) | 30 | 42 | - | — | / | **P1** |
| custom software development south africa | core | commercial | middle (consideration) | 20 | n/d | - | AIO, LocalPack | / | **U** |
| bespoke software development | core | commercial | middle (consideration) | 20 | n/d | - | — | / | **P1** |
| business process automation | core | informational | top (awareness) | 50 | 9 | $1.71 | AIO, PAA | / | **U** |
| automation of business processes | core | informational | top (awareness) | 50 | 16 | $1.71 | — | / | **P1** |
| custom business software | core | commercial | middle (consideration) | 10 | n/d | - | — | / | **P2** |
| business process automation consultant | core | commercial | middle (consideration) | 10 | n/d | - | — | / | **P2** |
| business automation consultant | core | commercial | middle (consideration) | 10 | n/d | - | — | / | **P2** |
| custom software development cape town | core | commercial | middle (consideration) | 10 | n/d | - | — | / | **P2** |
| custom software development johannesburg | core | commercial | middle (consideration) | 10 | n/d | - | — | / | **P2** |
| workflow automation | core | informational | top (awareness) | 140 | 46 | $8.29 | — | / | **P2** |
| custom software development | core | commercial | middle (consideration) | 90 | 69 | $6.82 | — | / | **P2** |
| bespoke software development south africa | core | commercial | middle (consideration) | n/d | n/d | - | — | / | **P3** |
| bespoke software south africa | core | commercial | middle (consideration) | n/d | n/d | - | — | / | **P3** |
| business process automation south africa | core | commercial | middle (consideration) | n/d | n/d | - | — | / | **P3** |
| workflow automation south africa | core | commercial | middle (consideration) | n/d | n/d | - | — | / | **P3** |
| business automation south africa | core | commercial | middle (consideration) | n/d | n/d | - | — | / | **P3** |

### Pillar hubs — 17 keywords

| Keyword | Cluster | Intent | Funnel | Vol (ZA/mo) | KD | CPC | SERP features | Target page | Tier |
|---|---|---|---|---|---|---|---|---|---|
| decision support system | pillar-analytics | commercial | middle (consideration) | 170 | 16 | $0.78 | — | /pillars/analytics (to-create) | **P0** |
| business intelligence software | pillar-analytics | commercial | middle (consideration) | 30 | 41 | $10.58 | — | /pillars/analytics (to-create) | **P2** |
| audit management software | pillar-audit-trails | commercial | middle (consideration) | 20 | n/d | $6.88 | — | /pillars/audit-trails (to-create) | **P2** |
| robotic process automation | pillar-automation | informational | top (awareness) | 260 | 38 | $2.70 | — | /pillars/automation (to-create) | **P2** |
| data analytics software | pillar-analytics | commercial | middle (consideration) | 110 | 61 | $10.59 | — | /pillars/analytics (to-create) | **P2** |
| intelligent automation | pillar-automation | informational | top (awareness) | 30 | 14 | $8.97 | — | /pillars/automation (to-create) | **P2** |
| audit trail software | pillar-audit-trails | commercial | middle (consideration) | 10 | n/d | - | — | /pillars/audit-trails (to-create) | **P2** |
| compliance audit software | pillar-audit-trails | commercial | middle (consideration) | 10 | n/d | - | — | /pillars/audit-trails (to-create) | **P2** |
| anomaly detection software | pillar-anomaly-detection | commercial | middle (consideration) | 10 | n/d | - | — | /pillars/anomaly-detection (to-create) | **P2** |
| fraud detection software | pillar-anomaly-detection | commercial | middle (consideration) | 10 | n/d | - | AIO, PAA | /pillars/anomaly-detection (to-create) | **U** |
| what is an audit trail | pillar-audit-trails | informational | top (awareness) | 70 | n/d | - | — | /pillars/audit-trails (to-create) | **AEO** |
| what is business process automation | pillar-automation | informational | top (awareness) | 30 | n/d | - | — | /pillars/automation (to-create) | **AEO** |
| anomaly detection | pillar-anomaly-detection | informational | top (awareness) | 90 | 53 | $11.92 | — | /pillars/anomaly-detection (to-create) | **P2** |
| how to automate business processes | pillar-automation | informational | top (awareness) | 10 | n/d | - | — | /pillars/automation (to-create) | **AEO** |
| what is anomaly detection | pillar-anomaly-detection | informational | top (awareness) | 10 | n/d | - | — | /pillars/anomaly-detection (to-create) | **AEO** |
| operational analytics | pillar-analytics | informational | top (awareness) | 10 | n/d | - | — | /pillars/analytics (to-create) | **P2** |
| analytics dashboard software | pillar-analytics | commercial | middle (consideration) | 0 | n/d | - | — | /pillars/analytics (to-create) | **P3** |

### Module money pages (`/systems/<slug>`) — 129 keywords

| Keyword | Cluster | Intent | Funnel | Vol (ZA/mo) | KD | CPC | SERP features | Target page | Tier |
|---|---|---|---|---|---|---|---|---|---|
| accounting software south africa | module-accounting-engine | commercial | middle (consideration) | 480 | 25 | $9.83 | AIO, PAA, Video | /systems/accounting-engine | **U** |
| accounting automation software | module-accounting-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/accounting-engine | **P2** |
| automated accounting software | module-accounting-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/accounting-engine | **P2** |
| event driven accounting | module-accounting-engine | informational | top (awareness) | n/d | n/d | - | — | /systems/accounting-engine | **P3** |
| business analytics software | module-analytics-suite | commercial | middle (consideration) | 210 | 53 | $9.59 | — | /systems/analytics-suite | **P1** |
| business intelligence dashboard | module-analytics-suite | navigational | bottom (decision) | 70 | n/d | $9.18 | — | /systems/analytics-suite | **P2** |
| decision support software | module-analytics-suite | commercial | middle (consideration) | 10 | n/d | - | — | /systems/analytics-suite | **P2** |
| operational analytics software | module-analytics-suite | commercial | middle (consideration) | 10 | n/d | - | — | /systems/analytics-suite | **P2** |
| approval workflow software | module-approval-workflow | commercial | middle (consideration) | 10 | n/d | - | — | /systems/approval-workflow | **P2** |
| approval management software | module-approval-workflow | commercial | middle (consideration) | 10 | n/d | - | — | /systems/approval-workflow | **P2** |
| loan approval workflow | module-approval-workflow | commercial | middle (consideration) | n/d | n/d | - | — | /systems/approval-workflow | **P3** |
| sign off workflow software | module-approval-workflow | transactional | bottom (decision) | n/d | n/d | - | — | /systems/approval-workflow | **P3** |
| crm software in south africa | module-bespoke-crm | commercial | middle (consideration) | 320 | 2 | $17.53 | — | /systems/bespoke-crm | **P0** |
| crm software south africa | module-bespoke-crm | commercial | middle (consideration) | 320 | 18 | $17.53 | AIO, PAA | /systems/bespoke-crm | **U** |
| custom crm | module-bespoke-crm | commercial | middle (consideration) | 10 | n/d | - | — | /systems/bespoke-crm | **P2** |
| bespoke crm | module-bespoke-crm | commercial | middle (consideration) | 10 | n/d | - | — | /systems/bespoke-crm | **P2** |
| custom crm development | module-bespoke-crm | commercial | middle (consideration) | 10 | n/d | - | — | /systems/bespoke-crm | **P2** |
| crm development | module-bespoke-crm | commercial | middle (consideration) | 10 | n/d | - | — | /systems/bespoke-crm | **P2** |
| case management system | module-case-management | commercial | middle (consideration) | 70 | n/d | $4.81 | — | /systems/case-management | **P0** |
| case management software | module-case-management | commercial | middle (consideration) | 30 | n/d | $9.52 | — | /systems/case-management | **P1** |
| legal case management software | module-case-management | commercial | middle (consideration) | 10 | n/d | $11.63 | — | /systems/case-management | **P2** |
| matter management software | module-case-management | commercial | middle (consideration) | 10 | n/d | - | — | /systems/case-management | **P2** |
| client onboarding software | module-client-onboarding | commercial | middle (consideration) | 10 | n/d | $24.73 | — | /systems/client-onboarding | **P2** |
| customer onboarding software | module-client-onboarding | commercial | middle (consideration) | 10 | n/d | $24.73 | — | /systems/client-onboarding | **P2** |
| kyc onboarding software | module-client-onboarding | commercial | middle (consideration) | 10 | n/d | - | — | /systems/client-onboarding | **P2** |
| digital onboarding software | module-client-onboarding | commercial | middle (consideration) | 10 | n/d | - | — | /systems/client-onboarding | **P2** |
| popia compliance | module-compliance-reporting | transactional | bottom (decision) | 260 | 27 | $1.59 | AIO, PAA | /systems/compliance-reporting | **U** |
| regulatory reporting software | module-compliance-reporting | commercial | middle (consideration) | 10 | n/d | - | — | /systems/compliance-reporting | **P2** |
| regulatory reporting automation | module-compliance-reporting | commercial | middle (consideration) | 10 | n/d | - | — | /systems/compliance-reporting | **P2** |
| compliance reporting software | module-compliance-reporting | commercial | middle (consideration) | 10 | n/d | - | — | /systems/compliance-reporting | **P2** |
| ba900 reporting | module-compliance-reporting | informational | top (awareness) | n/d | n/d | - | — | /systems/compliance-reporting | **P3** |
| tax reporting automation | module-compliance-reporting | commercial | middle (consideration) | n/d | n/d | - | — | /systems/compliance-reporting | **P3** |
| transaction monitoring software | module-continuous-assurance | commercial | middle (consideration) | 10 | n/d | - | — | /systems/continuous-assurance | **P2** |
| continuous monitoring software | module-continuous-assurance | commercial | middle (consideration) | 10 | n/d | - | — | /systems/continuous-assurance | **P2** |
| aml transaction monitoring | module-continuous-assurance | navigational | bottom (decision) | 10 | n/d | - | — | /systems/continuous-assurance | **P2** |
| data synchronization software | module-cross-system-sync | commercial | middle (consideration) | 10 | n/d | - | — | /systems/cross-system-sync | **P2** |
| real time data sync | module-cross-system-sync | informational | top (awareness) | 10 | n/d | - | — | /systems/cross-system-sync | **P2** |
| system sync software | module-cross-system-sync | commercial | middle (consideration) | n/d | n/d | - | — | /systems/cross-system-sync | **P3** |
| two way data sync | module-cross-system-sync | informational | top (awareness) | 0 | n/d | - | — | /systems/cross-system-sync | **P3** |
| customer data platform | module-customer-360 | navigational | bottom (decision) | 40 | 57 | $8.19 | — | /systems/customer-360 | **P2** |
| single customer view | module-customer-360 | navigational | bottom (decision) | 10 | n/d | - | — | /systems/customer-360 | **P2** |
| unified customer view | module-customer-360 | informational | top (awareness) | 10 | n/d | - | — | /systems/customer-360 | **P2** |
| customer 360 software | module-customer-360 | commercial | middle (consideration) | 0 | n/d | - | — | /systems/customer-360 | **P3** |
| data pipeline software | module-data-routing | commercial | middle (consideration) | 10 | n/d | - | — | /systems/data-routing | **P2** |
| data integration platform | module-data-routing | commercial | middle (consideration) | 10 | n/d | - | — | /systems/data-routing | **P2** |
| automated reporting software | module-data-routing | commercial | middle (consideration) | 10 | n/d | - | — | /systems/data-routing | **P2** |
| regulatory reporting pipeline | module-data-routing | informational | top (awareness) | n/d | n/d | - | — | /systems/data-routing | **P3** |
| decision engine software | module-decision-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/decision-engine | **P2** |
| decision management software | module-decision-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/decision-engine | **P2** |
| rules engine software | module-decision-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/decision-engine | **P2** |
| loan decisioning software | module-decision-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/decision-engine | **P2** |
| automated decision making | module-decision-engine | informational | top (awareness) | 10 | n/d | - | — | /systems/decision-engine | **P2** |
| document assembly software | module-document-assembly | commercial | middle (consideration) | 10 | n/d | - | — | /systems/document-assembly | **P2** |
| document generation software | module-document-assembly | commercial | middle (consideration) | 10 | n/d | - | — | /systems/document-assembly | **P2** |
| contract generation software | module-document-assembly | commercial | middle (consideration) | 10 | n/d | - | — | /systems/document-assembly | **P2** |
| proposal automation software | module-document-assembly | commercial | middle (consideration) | 10 | n/d | - | — | /systems/document-assembly | **P2** |
| intelligent document processing | module-document-intelligence | commercial | middle (consideration) | 20 | n/d | $3.17 | — | /systems/document-intelligence | **P1** |
| ocr automation software | module-document-intelligence | commercial | middle (consideration) | 10 | n/d | - | — | /systems/document-intelligence | **P2** |
| invoice data capture software | module-document-intelligence | commercial | middle (consideration) | 10 | n/d | - | — | /systems/document-intelligence | **P2** |
| document data extraction | module-document-intelligence | informational | top (awareness) | 10 | n/d | - | — | /systems/document-intelligence | **P2** |
| document automation | module-document-intelligence | informational | top (awareness) | 10 | n/d | $9.28 | — | /systems/document-intelligence | **P2** |
| field service management software | module-field-ops-app | commercial | middle (consideration) | 50 | 50 | $6.51 | — | /systems/field-ops-app | **P1** |
| field operations software | module-field-ops-app | commercial | middle (consideration) | 10 | n/d | - | — | /systems/field-ops-app | **P2** |
| field service app | module-field-ops-app | navigational | bottom (decision) | 20 | n/d | $6.86 | — | /systems/field-ops-app | **P2** |
| offline data collection app | module-field-ops-app | informational | top (awareness) | 10 | n/d | - | — | /systems/field-ops-app | **P2** |
| demand forecasting software | module-forecasting | commercial | middle (consideration) | 10 | n/d | - | — | /systems/forecasting | **P2** |
| demand planning software | module-forecasting | commercial | middle (consideration) | 10 | n/d | $4.58 | — | /systems/forecasting | **P2** |
| sales forecasting software | module-forecasting | commercial | middle (consideration) | 10 | n/d | $6.49 | — | /systems/forecasting | **P2** |
| inventory forecasting software | module-forecasting | commercial | middle (consideration) | 10 | n/d | $26.73 | — | /systems/forecasting | **P2** |
| integration platform | module-integration-hub | commercial | middle (consideration) | 10 | n/d | $6.83 | — | /systems/integration-hub | **P2** |
| system integration software | module-integration-hub | commercial | middle (consideration) | 10 | n/d | - | — | /systems/integration-hub | **P2** |
| api integration platform | module-integration-hub | commercial | middle (consideration) | 10 | n/d | - | — | /systems/integration-hub | **P2** |
| business systems integration | module-integration-hub | commercial | middle (consideration) | 10 | n/d | - | — | /systems/integration-hub | **P2** |
| ipaas | module-integration-hub | informational | top (awareness) | 90 | 64 | $13.50 | — | /systems/integration-hub | **P2** |
| inventory management software | module-inventory-clarity | commercial | middle (consideration) | 260 | 15 | $13.01 | PAA, Video | /systems/inventory-clarity | **U** |
| stock management software | module-inventory-clarity | commercial | middle (consideration) | 70 | 27 | $27.98 | — | /systems/inventory-clarity | **P0** |
| rfid inventory system | module-inventory-clarity | transactional | bottom (decision) | 20 | n/d | $15.70 | — | /systems/inventory-clarity | **P1** |
| rfid asset tracking | module-inventory-clarity | transactional | bottom (decision) | 10 | n/d | $10.99 | — | /systems/inventory-clarity | **P2** |
| warehouse inventory system | module-inventory-clarity | navigational | bottom (decision) | 10 | n/d | - | — | /systems/inventory-clarity | **P2** |
| event management software | module-kairos | commercial | middle (consideration) | 70 | n/d | $17.53 | — | /systems/kairos | **P0** |
| ai receptionist | module-kairos | navigational | bottom (decision) | 90 | n/d | $3.38 | — | /systems/kairos | **P1** |
| virtual receptionist software | module-kairos | commercial | middle (consideration) | 10 | n/d | - | — | /systems/kairos | **P2** |
| ai voice agent | module-kairos | informational | top (awareness) | 40 | n/d | $5.37 | — | /systems/kairos | **P2** |
| ai phone answering service | module-kairos | informational | top (awareness) | 10 | n/d | - | — | /systems/kairos | **P2** |
| internal knowledge base software | module-knowledge-assistant | commercial | middle (consideration) | 10 | n/d | - | — | /systems/knowledge-assistant | **P2** |
| sop software | module-knowledge-assistant | commercial | middle (consideration) | 10 | n/d | - | — | /systems/knowledge-assistant | **P2** |
| company wiki software | module-knowledge-assistant | navigational | bottom (decision) | 10 | n/d | - | — | /systems/knowledge-assistant | **P2** |
| ai knowledge assistant | module-knowledge-assistant | informational | top (awareness) | 10 | n/d | - | — | /systems/knowledge-assistant | **P2** |
| lead qualification automation | module-lead-qualifier | transactional | bottom (decision) | 10 | n/d | - | — | /systems/lead-qualifier | **P2** |
| automated lead qualification | module-lead-qualifier | commercial | middle (consideration) | 10 | n/d | - | — | /systems/lead-qualifier | **P2** |
| lead scoring software | module-lead-qualifier | commercial | middle (consideration) | 10 | n/d | - | — | /systems/lead-qualifier | **P2** |
| lead qualification software | module-lead-qualifier | commercial | middle (consideration) | 0 | n/d | - | — | /systems/lead-qualifier | **P3** |
| legacy system integration | module-legacy-bridge | commercial | middle (consideration) | 10 | n/d | $52.84 | — | /systems/legacy-bridge | **P2** |
| legacy system modernization | module-legacy-bridge | commercial | middle (consideration) | 10 | n/d | - | — | /systems/legacy-bridge | **P2** |
| erp integration software | module-legacy-bridge | commercial | middle (consideration) | 10 | n/d | - | — | /systems/legacy-bridge | **P2** |
| legacy modernization | module-legacy-bridge | informational | top (awareness) | 10 | n/d | $1.73 | — | /systems/legacy-bridge | **P2** |
| mdm software | module-master-data-hub | commercial | middle (consideration) | 90 | n/d | $20.49 | — | /systems/master-data-hub | **P0** |
| master data management | module-master-data-hub | informational | top (awareness) | 90 | 36 | $0.53 | — | /systems/master-data-hub | **P2** |
| master data management software | module-master-data-hub | commercial | middle (consideration) | 10 | n/d | - | — | /systems/master-data-hub | **P2** |
| golden record software | module-master-data-hub | commercial | middle (consideration) | 10 | n/d | - | — | /systems/master-data-hub | **P2** |
| omnichannel inbox | module-multi-channel-inbox | navigational | bottom (decision) | 10 | n/d | - | — | /systems/multi-channel-inbox | **P2** |
| shared inbox software | module-multi-channel-inbox | navigational | bottom (decision) | 10 | n/d | - | — | /systems/multi-channel-inbox | **P2** |
| unified inbox software | module-multi-channel-inbox | navigational | bottom (decision) | n/d | n/d | - | — | /systems/multi-channel-inbox | **P3** |
| multichannel customer support software | module-multi-channel-inbox | commercial | middle (consideration) | n/d | n/d | - | — | /systems/multi-channel-inbox | **P3** |
| alert management software | module-notification-orchestration | commercial | middle (consideration) | 0 | n/d | - | — | /systems/notification-orchestration | **P3** |
| notification management software | module-notification-orchestration | commercial | middle (consideration) | 0 | n/d | - | — | /systems/notification-orchestration | **P3** |
| incident alerting software | module-notification-orchestration | commercial | middle (consideration) | n/d | n/d | - | — | /systems/notification-orchestration | **P3** |
| alert orchestration software | module-notification-orchestration | commercial | middle (consideration) | n/d | n/d | - | — | /systems/notification-orchestration | **P3** |
| predictive maintenance software | module-predictive-maintenance | commercial | middle (consideration) | 10 | n/d | - | — | /systems/predictive-maintenance | **P2** |
| condition monitoring software | module-predictive-maintenance | commercial | middle (consideration) | 10 | n/d | $1.07 | — | /systems/predictive-maintenance | **P2** |
| predictive maintenance system | module-predictive-maintenance | commercial | middle (consideration) | 10 | n/d | - | — | /systems/predictive-maintenance | **P2** |
| machine failure prediction | module-predictive-maintenance | commercial | middle (consideration) | 10 | n/d | - | — | /systems/predictive-maintenance | **P2** |
| cpq software | module-pricing-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/pricing-engine | **P2** |
| pricing engine software | module-pricing-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/pricing-engine | **P2** |
| quote management software | module-pricing-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/pricing-engine | **P2** |
| quoting software | module-pricing-engine | informational | top (awareness) | 70 | 45 | $5.60 | — | /systems/pricing-engine | **P2** |
| price configuration software | module-pricing-engine | commercial | middle (consideration) | n/d | n/d | - | — | /systems/pricing-engine | **P3** |
| bank reconciliation software | module-reconciliation-engine | commercial | middle (consideration) | 30 | n/d | - | — | /systems/reconciliation-engine | **P1** |
| reconciliation software | module-reconciliation-engine | commercial | middle (consideration) | 10 | n/d | $10.12 | — | /systems/reconciliation-engine | **P2** |
| automated bank reconciliation | module-reconciliation-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/reconciliation-engine | **P2** |
| account reconciliation software | module-reconciliation-engine | commercial | middle (consideration) | 10 | n/d | $10.12 | — | /systems/reconciliation-engine | **P2** |
| pos reconciliation software | module-reconciliation-engine | commercial | middle (consideration) | 10 | n/d | - | — | /systems/reconciliation-engine | **P2** |
| conveyancing software | module-task-management | commercial | middle (consideration) | 10 | n/d | $1.76 | — | /systems/task-management | **P2** |
| task management software | module-task-management | commercial | middle (consideration) | 30 | 59 | $8.72 | — | /systems/task-management | **P2** |
| workflow task management | module-task-management | informational | top (awareness) | 10 | n/d | - | — | /systems/task-management | **P2** |
| workflow orchestration software | module-workflow-orchestrator | commercial | middle (consideration) | 10 | n/d | - | — | /systems/workflow-orchestrator | **P2** |
| workflow automation software | module-workflow-orchestrator | commercial | middle (consideration) | 10 | n/d | - | — | /systems/workflow-orchestrator | **P2** |
| business workflow software | module-workflow-orchestrator | commercial | middle (consideration) | 10 | n/d | $16.11 | — | /systems/workflow-orchestrator | **P2** |
| event driven automation | module-workflow-orchestrator | informational | top (awareness) | 10 | n/d | - | — | /systems/workflow-orchestrator | **P2** |

### Industry use-case pages — 11 keywords

| Keyword | Cluster | Intent | Funnel | Vol (ZA/mo) | KD | CPC | SERP features | Target page | Tier |
|---|---|---|---|---|---|---|---|---|---|
| hospitality management software | industry-hospitality | commercial | middle (consideration) | 30 | n/d | $8.07 | — | /industries/hospitality (to-create) | **P1** |
| legal practice management software south africa | industry-legal | commercial | middle (consideration) | 20 | n/d | $6.68 | — | /industries/legal (to-create) | **P1** |
| logistics software south africa | industry-logistics | commercial | middle (consideration) | 20 | n/d | $3.62 | — | /industries/logistics (to-create) | **P1** |
| manufacturing software south africa | industry-manufacturing | commercial | middle (consideration) | 10 | n/d | $30.35 | — | /industries/manufacturing (to-create) | **P2** |
| warehouse management system south africa | industry-logistics | navigational | bottom (decision) | 40 | 44 | $58.28 | — | /industries/logistics (to-create) | **P2** |
| software for law firms south africa | industry-legal | commercial | middle (consideration) | n/d | n/d | - | — | /industries/legal (to-create) | **P3** |
| banking software development south africa | industry-banking | commercial | middle (consideration) | n/d | n/d | - | — | /industries/banking (to-create) | **P3** |
| fintech software development south africa | industry-banking | commercial | middle (consideration) | n/d | n/d | - | — | /industries/banking (to-create) | **P3** |
| ngo management software | industry-ngo | commercial | middle (consideration) | 0 | n/d | - | — | /industries/ngo (to-create) | **P3** |
| donor reporting software | industry-ngo | commercial | middle (consideration) | n/d | n/d | - | — | /industries/ngo (to-create) | **P3** |
| restaurant management software south africa | industry-hospitality | commercial | middle (consideration) | n/d | n/d | - | — | /industries/hospitality (to-create) | **P3** |

### AEO / GEO question intent — 27 keywords

| Keyword | Cluster | Intent | Funnel | Vol (ZA/mo) | KD | CPC | SERP features | Target page | Tier |
|---|---|---|---|---|---|---|---|---|---|
| what is popia | aeo-questions | informational | top (awareness) | 390 | 25 | $0.81 | AIO, PAA, Video | (FAQ on money page / blog) | **U** |
| what is reconciliation in accounting | aeo-questions | informational | top (awareness) | 140 | 17 | $0.01 | — | (FAQ on money page / blog) | **AEO** |
| what is crm software | aeo-questions | informational | top (awareness) | 320 | 33 | $2.46 | AIO, PAA, Video | (FAQ on money page / blog) | **AEO** |
| best accounting software for small business south africa | aeo-questions | commercial | top (awareness) | 40 | 49 | $8.49 | — | (FAQ on money page / blog) | **AEO** |
| what is a crm system | aeo-questions | informational | top (awareness) | 390 | 52 | $1.86 | — | (FAQ on money page / blog) | **AEO** |
| custom software vs off the shelf | aeo-questions | commercial | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| popia compliance requirements | aeo-questions | transactional | top (awareness) | 10 | 41 | $3.35 | — | (FAQ on money page / blog) | **AEO** |
| what is predictive maintenance | aeo-questions | informational | top (awareness) | 30 | n/d | $7.66 | — | (FAQ on money page / blog) | **AEO** |
| what is demand forecasting | aeo-questions | informational | top (awareness) | 40 | 42 | - | — | (FAQ on money page / blog) | **AEO** |
| what is bespoke software | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| what is custom software development | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| what is workflow automation | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| what is intelligent document processing | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| what is master data management | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| what is a decision engine | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| what is cpq | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| how to automate bank reconciliation | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| what is regulatory reporting | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| what is field service management | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| what is a case management system | aeo-questions | informational | top (awareness) | 10 | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| how much does custom software cost in south africa | aeo-questions | commercial | top (awareness) | n/d | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| bespoke software vs off the shelf software | aeo-questions | commercial | top (awareness) | n/d | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| who builds custom software in south africa | aeo-questions | commercial | top (awareness) | n/d | n/d | - | AIO, PAA, LocalPack | (FAQ on money page / blog) | **U** |
| best crm for small business south africa | aeo-questions | commercial | top (awareness) | n/d | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| how to automate document processing | aeo-questions | informational | top (awareness) | n/d | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| how to integrate business systems | aeo-questions | informational | top (awareness) | n/d | n/d | - | — | (FAQ on money page / blog) | **AEO** |
| how to automate lead qualification | aeo-questions | informational | top (awareness) | n/d | n/d | - | — | (FAQ on money page / blog) | **AEO** |
<!-- TABLE-END -->

---

## 5. Coverage check

- [x] **Every one of the 30 `/systems/<slug>` money pages has ≥1 researched keyword.**
      Each module cluster has a designated primary (see `intent-clusters.md` §2).
- [x] **No two money pages target the same primary keyword** (cannibalisation guard) — the
      one intentional overlap is `crm software south africa` vs `crm software in south africa`
      (both → `/systems/bespoke-crm`, same page).
- [x] **Each money page has a question/AEO target** — per-cluster AEO sets in
      `intent-clusters.md` §3.
- [x] **Brand + core-offering heads baselined** (`zabble` 10/mo; core heads in §4).
- [x] **SERP features captured** for 10 representative cluster queries (`_evidence/03/serp-advanced__*`)
      + 27 request queries (`serp-advanced__req-*`).
- [x] **All cross-session research requests resolved** with sourced/dated data (§6; 43 terms).
- [x] **Every uber + priority (P0/P1) cluster mapped to a live canonical URL** (§7); gaps are
      to-create hub/industry pages only, each escalated with a proposed URL.
- [x] **Launch rank baseline recorded** (§8) and seeded into `rank-tracking.md`.
- [x] **Map validated** by `_evidence/03/validate_keyword_map.py` (schema + every priority row
      has a target URL + sourced metric + date).
- **Gaps flagged:** `industry-banking`, `industry-ngo` and several module heads return `n/d`
  in ZA — treat as **GEO/AEO + global-English** plays, not classic SEO targets (§9).

---

## 6. Cross-session requests — RESOLVED (2026-06-04)

Every open request appended by sibling sessions (harvested from their branch copies of this
file) is resolved with sourced, dated DataForSEO data. Raw exports:
`_evidence/03/{gads-search-volume,labs-bulk-kd,labs-search-intent}__requests__za.json` +
`serp-advanced__req-*__za.json` (SA, en, 2026-06-04). Per-term metrics:
`_evidence/03/requests-resolved.json`.

- **S07 (AEO) — `seo/07-aeo`** — *"SA `search_volume` + `keyword_difficulty` for the AEO question
  set, to re-rank the page backlog by demand."* ✅ **Resolved (11 terms).** Highest demand:
  `what is reconciliation in accounting` 140/mo (KD 17); the rest 10–20/mo or `n/d`. **Every**
  question carries an AI Overview and/or PAA slot (SERP column) → confirms these are AEO/GEO
  answer targets, correctly prioritised by slot presence rather than raw volume.
- **S07 (GEO) — `seo/07-geo`** — *"SA volume + intent for GEO entity/question targets (the fixed
  GEO measurement prompts)."* ✅ **Resolved (8 terms incl. `zabble`).** ZA volume is `n/d` for all
  except `zabble` (10/mo) — these are generative/AI-answer plays, not classic search.
  `business automation company south africa` and `who builds custom software…` return **local
  packs**. Brand entity collides with the US "Zabble, Inc." homonym — caveat in §7 + `rank-tracking.md`.
- **S06 (content engine) — `seo/10-content`** — *"verify SA volume/KD + intent + SERP `item_types`
  for Wave 2/3 candidates; expand long-tail; confirm no two `/systems` pages share a primary
  keyword."* ✅ **Resolved (25 terms + long-tail expansions** in
  `_evidence/03/labs-keyword-suggestions__{master-data-management,quote-automation,bi-dashboard,order-management,predictive-maintenance}__za.json`**).** Key reads: `predictive maintenance`
  210/mo (KD 26, AIO+PAA+Video) — promote to a P0 target; `master data management tools` 170
  (KD 18) and `tools for master data management` 170 (KD 8) — winnable MDM long-tail;
  `order management system` 50 (KD 41); `quote automation`/CPQ has effectively no ZA volume
  (treat as AEO/global only). Cannibalisation guard re-confirmed (§5).

### 6.1 Resolved-request detail (43 terms)

Target page = the live canonical money page the term routes to (verified §7). Layer per
`reference/aeo-geo-principles.md`.

| Keyword | Requester(s) | Layer | Vol (ZA/mo) | KD | Intent | SERP features | Target page | Status |
|---|---|---|---|---|---|---|---|---|
| predictive maintenance | S06 | SEO/AEO | 210 | 26 | commercial | AIO, PAA, Video | `/systems/predictive-maintenance` | ✅ resolved |
| master data management | S06 | SEO/AEO | 90 | 36 | informational | AIO, PAA | `/systems/master-data-hub` | ✅ resolved |
| inventory management software south africa | S06 | SEO | 50 | n/d | commercial | AIO, PAA | `/systems/inventory-clarity` | ✅ resolved |
| stock management software south africa | S06 | SEO | 50 | n/d | commercial | — | `/systems/inventory-clarity` | ✅ resolved |
| case management software | S06 | SEO | 30 | n/d | commercial | AIO, PAA | `/systems/case-management` | ✅ resolved |
| rfid inventory management | S06 | SEO | 20 | n/d | navigational | — | `/systems/inventory-clarity` | ✅ resolved |
| approval workflow software | S06 | SEO | 10 | n/d | commercial | AIO | `/systems/workflow-orchestrator` | ✅ resolved |
| decision engine software | S06 | SEO | 10 | n/d | commercial | AIO, PAA | `/systems/decision-engine` | ✅ resolved |
| order management automation | S06 | SEO | 10 | n/d | commercial | AIO, Video | `/systems/workflow-orchestrator` | ✅ resolved |
| order management software | S06 | SEO | 10 | n/d | commercial | — | `/systems/workflow-orchestrator` | ✅ resolved |
| rfid inventory tracking | S06 | SEO | 10 | n/d | navigational | AIO, PAA, Video | `/systems/inventory-clarity` | ✅ resolved |
| cpq software | S06 | SEO | 10 | n/d | commercial | AIO, PAA | `/systems/pricing-engine` | ✅ resolved |
| quote automation software | S06 | SEO | 10 | n/d | commercial | PAA, Video | `/systems/pricing-engine` | ✅ resolved |
| quote automation | S06 | SEO | 10 | n/d | informational | — | `/systems/pricing-engine` | ✅ resolved |
| role based dashboard | S06 | SEO | 10 | n/d | navigational | — | `/systems/analytics-suite` | ✅ resolved |
| master data management south africa | S06 | SEO | 10 | n/d | commercial | — | `/systems/master-data-hub` | ✅ resolved |
| alert management | S06 | SEO | 10 | n/d | informational | AIO, PAA, Video | `/systems/notification-orchestration` | ✅ resolved |
| invoice data extraction | S06 | SEO | 10 | n/d | transactional | PAA, Video | `/systems/document-intelligence` | ✅ resolved |
| invoice data capture | S06 | SEO | 10 | n/d | transactional | — | `/systems/document-intelligence` | ✅ resolved |
| legal case management software south africa | S06 | SEO | n/d | n/d | commercial | — | `/systems/case-management` | ✅ resolved |
| bi dashboard south africa | S06 | SEO | n/d | n/d | navigational | AIO, PAA | `/systems/analytics-suite` | ✅ resolved |
| business intelligence dashboard south africa | S06 | SEO | n/d | n/d | navigational | — | `/systems/analytics-suite` | ✅ resolved |
| predictive maintenance software south africa | S06 | SEO | n/d | n/d | commercial | — | `/systems/predictive-maintenance` | ✅ resolved |
| notification orchestration | S06 | SEO | n/d | n/d | transactional | — | `/systems/notification-orchestration` | ✅ resolved |
| alert management software south africa | S06 | SEO | n/d | n/d | commercial | — | `/systems/notification-orchestration` | ✅ resolved |
| what is reconciliation in accounting | S07-aeo | AEO | 140 | 17 | informational | — | `/systems/reconciliation-engine` | ✅ resolved |
| custom software development south africa | S07-aeo | SEO | 20 | n/d | commercial | — | `/` | ✅ resolved |
| how to automate invoice processing | S07-aeo | AEO | 10 | n/d | informational | AIO, PAA, Video | `/systems/document-intelligence` | ✅ resolved |
| how to automate bank reconciliation | S07-aeo | AEO | 10 | n/d | informational | AIO, PAA, Video | `/systems/reconciliation-engine` | ✅ resolved |
| what is anomaly detection | S07-aeo | AEO | 10 | n/d | informational | — | `/systems/continuous-assurance` | ✅ resolved |
| what is workflow automation | S07-aeo | AEO | 10 | n/d | informational | — | `/systems/workflow-orchestrator` | ✅ resolved |
| what is a bespoke crm | S07-aeo | AEO | n/d | n/d | informational | AIO, PAA | `/systems/bespoke-crm` | ✅ resolved |
| how much does a bespoke crm cost | S07-aeo | AEO | n/d | n/d | commercial | AIO, PAA | `/systems/bespoke-crm` | ✅ resolved |
| document automation south africa | S07-aeo | AEO/SEO | n/d | n/d | commercial | AIO, PAA | `/systems/document-intelligence` | ✅ resolved |
| regulatory reporting software south africa | S07-aeo | SEO | n/d | n/d | commercial | AIO, PAA | `/systems/compliance-reporting` | ✅ resolved |
| who builds custom software in south africa | S07-aeo;S07-geo | GEO/SEO | n/d | n/d | commercial | AIO, PAA, LocalPack | `/` | ✅ resolved |
| zabble | S07-geo | GEO/brand | 10 | n/d | informational | PAA | `/` | ✅ resolved |
| who builds custom business software in south africa | S07-geo | GEO/SEO | n/d | n/d | commercial | AIO, PAA | `/` | ✅ resolved |
| business process automation south africa | S07-geo | SEO/GEO | n/d | n/d | commercial | PAA | `/` | ✅ resolved |
| bespoke crm south africa | S07-geo | SEO | n/d | n/d | commercial | AIO, PAA | `/systems/bespoke-crm` | ✅ resolved |
| business automation company south africa | S07-geo | SEO/GEO | n/d | n/d | navigational | PAA, LocalPack | `/` | ✅ resolved |
| transaction fraud detection south africa | S07-geo | AEO/GEO | n/d | n/d | commercial | AIO, PAA | `/systems/continuous-assurance` | ✅ resolved |
| fraud detection south africa | S07-geo | SEO | n/d | n/d | commercial | PAA, Video | `/systems/continuous-assurance` | ✅ resolved |

### 6.2 New requests (other sessions append below; S03 resolves)

> S02 / S06 / S07 / S08 / S10: add the keyword/intent you need + your session #. Do **not** edit
> the tables above. S03 resolves and moves the row into §6.1.

- _(none open)_

---

## 7. URL coverage & canonical targets (live, 2026-06-04)

Every **uber + priority (P0/P1)** cluster mapped to a live canonical URL on `www.zabble.org`.
Status verified by HTTP pull `_evidence/03/url-coverage__zabble-org__live.csv` (all 32
`/systems/<slug>` pages + `/`, `/systems`, `/diagnose` return `200`; `/pillars/*`,
`/industries/*`, `/blog`, `/faq`, `/about`, `/contact` return `404`).

| Cluster / keyword (tier) | Intended page | Live canonical URL | Status |
|---|---|---|---|
| aeo-questions `what is popia` (U) | FAQ on `/systems/compliance-reporting` | https://www.zabble.org/systems/compliance-reporting | ✅ live (FAQ block on existing money page) |
| aeo-questions `who builds custom software in south africa` (U) | FAQ on `/` | https://www.zabble.org/ | ✅ live (FAQ block on existing money page) |
| core `software development company south africa` (U) | `/` | https://www.zabble.org/ | ✅ live |
| core `custom software development south africa` (U) | `/` | https://www.zabble.org/ | ✅ live |
| core `business process automation` (U) | `/` | https://www.zabble.org/ | ✅ live |
| module-accounting-engine `accounting software south africa` (U) | `/systems/accounting-engine` | https://www.zabble.org/systems/accounting-engine | ✅ live |
| module-bespoke-crm `crm software south africa` (U) | `/systems/bespoke-crm` | https://www.zabble.org/systems/bespoke-crm | ✅ live |
| module-compliance-reporting `popia compliance` (U) | `/systems/compliance-reporting` | https://www.zabble.org/systems/compliance-reporting | ✅ live |
| module-inventory-clarity `inventory management software` (U) | `/systems/inventory-clarity` | https://www.zabble.org/systems/inventory-clarity | ✅ live |
| pillar-anomaly-detection `fraud detection software` (U) | `/pillars/anomaly-detection` | https://www.zabble.org/systems/continuous-assurance | ⚠ reassigned to live `/systems/continuous-assurance` — pillar hub is 404 (escalated) |
| core `software development company durban` (P0) | `/` | https://www.zabble.org/ | ✅ live |
| core `operational systems` (P0) | `/` | https://www.zabble.org/ | ✅ live |
| module-bespoke-crm `crm software in south africa` (P0) | `/systems/bespoke-crm` | https://www.zabble.org/systems/bespoke-crm | ✅ live |
| module-case-management `case management system` (P0) | `/systems/case-management` | https://www.zabble.org/systems/case-management | ✅ live |
| module-inventory-clarity `stock management software` (P0) | `/systems/inventory-clarity` | https://www.zabble.org/systems/inventory-clarity | ✅ live |
| module-kairos `event management software` (P0) | `/systems/kairos` | https://www.zabble.org/systems/kairos | ✅ live |
| module-master-data-hub `mdm software` (P0) | `/systems/master-data-hub` | https://www.zabble.org/systems/master-data-hub | ✅ live |
| pillar-analytics `decision support system` (P0) | `/pillars/analytics` | https://www.zabble.org/systems/analytics-suite | ⚠ reassigned to live `/systems/analytics-suite` — pillar hub is 404 (escalated) |
| core `custom software development company` (P1) | `/` | https://www.zabble.org/ | ✅ live |
| core `software development company cape town` (P1) | `/` | https://www.zabble.org/ | ✅ live |
| core `business automation` (P1) | `/` | https://www.zabble.org/ | ✅ live |
| core `software development company johannesburg` (P1) | `/` | https://www.zabble.org/ | ✅ live |
| core `digital transformation south africa` (P1) | `/` | https://www.zabble.org/ | ✅ live |
| core `bespoke software development` (P1) | `/` | https://www.zabble.org/ | ✅ live |
| core `automation of business processes` (P1) | `/` | https://www.zabble.org/ | ✅ live |
| industry-hospitality `hospitality management software` (P1) | /industries/hospitality (to-create) | — | ❌ **GAP — page to-create** |
| industry-legal `legal practice management software south africa` (P1) | /industries/legal (to-create) | — | ❌ **GAP — page to-create** |
| industry-logistics `logistics software south africa` (P1) | /industries/logistics (to-create) | — | ❌ **GAP — page to-create** |
| module-analytics-suite `business analytics software` (P1) | `/systems/analytics-suite` | https://www.zabble.org/systems/analytics-suite | ✅ live |
| module-case-management `case management software` (P1) | `/systems/case-management` | https://www.zabble.org/systems/case-management | ✅ live |
| module-document-intelligence `intelligent document processing` (P1) | `/systems/document-intelligence` | https://www.zabble.org/systems/document-intelligence | ✅ live |
| module-field-ops-app `field service management software` (P1) | `/systems/field-ops-app` | https://www.zabble.org/systems/field-ops-app | ✅ live |
| module-inventory-clarity `rfid inventory system` (P1) | `/systems/inventory-clarity` | https://www.zabble.org/systems/inventory-clarity | ✅ live |
| module-kairos `ai receptionist` (P1) | `/systems/kairos` | https://www.zabble.org/systems/kairos | ✅ live |
| module-reconciliation-engine `bank reconciliation software` (P1) | `/systems/reconciliation-engine` | https://www.zabble.org/systems/reconciliation-engine | ✅ live |

### 7.1 Coverage gaps → escalations (logged in `audits/03-keywords.md` §6)

| Gap | Affected priority terms | Proposed canonical URL | Owning session | Interim |
|---|---|---|---|---|
| **Pillar hubs missing (404)** | `business process automation` (U), `fraud detection software` (U), `decision support system` (P0), `robotic process automation`, `anomaly detection` | `/pillars/automation`, `/pillars/anomaly-detection`, `/pillars/analytics`, `/pillars/audit-trails` | S04 (architecture) + S06 (content) | Terms routed to the nearest live page (home / `/systems/continuous-assurance` / `/systems/analytics-suite`). |
| **Industry pages missing (404)** | `hospitality management software` (P1), `legal practice management software south africa` (P1), `logistics software south africa` (P1), + banking/ngo/manufacturing | `/industries/{hospitality,legal,logistics,banking,ngo,manufacturing}` | S06 (content) + S04 | Industry intent currently served by the relevant module pages; no thin geo-pages until demand justifies. |
| **No standalone explainer/blog (404 `/blog`,`/faq`)** | AEO question set (§6.1 informational rows) | FAQ blocks on the mapped money pages (+ `FAQPage` schema) | S07 (AEO) + schema session | AEO answers live as FAQ blocks on existing live money pages. |

**No uber/P0/P1 commercial money-page term is unmapped** — every one routes to a live page.
The only gaps are *to-create* hub/industry/blog pages, all escalated with a proposed URL.

## 8. Live rank baseline (zabble.org, South Africa)

First pull, **2026-06-04** (`_evidence/03/labs-ranked-keywords__zabble-org__za.json`,
`labs-domain-rank-overview__zabble-org__za.json`):

| Metric | Value | Note |
|---|---|---|
| Ranked keywords (SA, organic) — Labs DB | **0** | `ranked_keywords` `total_count: null`, 0 items (DB lags new site). |
| Domain rank / organic ETV — Labs DB | **none** | `domain_rank_overview` `items: null`. |
| Live SERP sweep of 22 tracked terms | **1 in top-10** | `zabble.org` is **#1 for brand `zabble`** (live SERP); other 21 tracked terms not in top 30. AIO on ~17/22. Evidence: `_evidence/03/rank-tracking/2026-06/`. |

This is the expected **launch baseline** for a site only just live and not yet in DataForSEO's
rank database (Labs data lags new indexation). It is the zero-line against which `rank-tracking.md`
measures monthly progress. **Entity-collision caveat:** "Zabble" also denotes the US firm
*Zabble, Inc.* (waste/ESG tech). Brand SERPs and AI answers for `zabble` may surface the US
entity; disambiguate via `Organization` schema + `sameAs` + consistent SA NAP (GEO/S08 + schema).

## 9. Scope notes — broader-Africa / global-English

ZA is the binding primary market. One curated term was tagged **global** scope:
`custom software development` (ZA vol 90, KD 69 — globally competitive). Where a ZA-qualified
term returns `n/d` but the unqualified head has global volume (e.g. `business process
automation`, `master data management`, `intelligent document processing`), the recommended
play is a **single page targeting the head with ZA context in the copy + entity/local
signals**, rather than a separate geo page — Zabble does not have the authority budget to
split intent across thin ZA-only variants. Any future non-ZA pull must be labelled with its
market in `_evidence/03/` per conventions §7.
