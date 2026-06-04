# Brief 09 — Transaction fraud & anomaly detection for FSPs

> **Owner:** S06 content · **Type:** Cluster (Continuous assurance) · **Wave:** 1, Week 9
> **Status:** ready to write · **Voice:** problem → what we build → what changes

| Field | Value |
|-------|-------|
| **Canonical target page** | `/systems/continuous-assurance` (money page — LINK to it) |
| **Article URL** | `/guides/transaction-fraud-detection-fsp` (NEW cluster — S04 to confirm path) |
| **Cluster (keyword-map)** | Continuous assurance |
| **Primary query** | "transaction monitoring software" / "transaction fraud detection" |
| **Secondary** | "fraud detection software", "anomaly detection for banks", "reduce false positives fraud" |
| **Search intent** | Commercial/how-to (article) — distinct from money page's commercial product intent |
| **Layer** | AEO + GEO + SEO |
| **ZA/global** | **ZA-core** (FSCA/banking) + global-English |
| **Rubric** | B5 W4 F2 D2 E4 → **3·5+2·4+2·2+2·2+1·4 = 35 → P1** |
| **Word count** | 1,500–1,900 |
| **Evidence** | `transaction monitoring software` 10/mo (commercial, HIGH comp), `fraud detection software` 10/mo (MEDIUM). Pillar `anomaly detection` 90/mo with AI Overview + PAA (brief 04). |

## Cannibalisation guard
Article = FSP use-case/how-to. Money page `/systems/continuous-assurance` =
commercial. Distinct intent + URL; both link to P4 anomaly hub.

## Answer-first intro spec
*"For a financial services provider, fraud detection means a system that watches
every transaction in real time, applies a decision engine tuned to what counts
as suspicious for your book, and surfaces only the cases that matter — each with
its rule, history and suggested action. The hard part isn't catching fraud; it's
catching it without burying investigators in false positives."* Then the arc.

## H2/H3 outline (question-led)
- **H2 — What is transaction monitoring (and how does it catch fraud)?**
- **H2 — Why false positives are the real problem** (alert fatigue; sampling misses what hurts)
- **H2 — Rules vs machine learning for fraud detection** (decision engine + ML compounding)
- **H2 — What an FSP-grade detection system includes**
  - H3 — Every flag carries its rule, history and suggested action
  - H3 — Immutable audit trail keyed by case ID (FSCA-ready)
  - H3 — A "normal" defined bespoke to your book
- **H2 — How Zabble builds it** (sit with the analysts; tune the detector)
- **H2 — What changes** (MTTD days → seconds; investigators stop triaging false positives)
- **H2 — FAQ**

## Required statistics / sources (GEO)
- 1 SA fraud-loss stat (cite SABRIC / industry + year).
- 1 on false-positive rates in transaction monitoring (cite).
- Internal proof: "MTTD days → seconds", "cases arrive with evidence already attached".
- **Expert-quote slot:** Zabble lead on bespoke "normal" ("what counts as an anomaly is defined bespoke to what the business does").

## FAQ (AEO)
1. **What is transaction monitoring?**
2. **How does AI detect transaction fraud?**
3. **How do you reduce false positives in fraud detection?**
4. **What audit trail do FSCA-regulated FSPs need for fraud decisions?**
5. **Rules-based vs machine-learning fraud detection — which is better?**

## Internal links
- **Up →** P4 anomaly-detection hub.
- **Across (money) →** `/systems/continuous-assurance`; siblings `/systems/decision-engine`, `/systems/reconciliation-engine`.
- **Siblings →** brief 04 (pillar), brief 07 (compliance/FSP).
- **CTA →** `/diagnose`.

## CTA
*"How many of your fraud alerts are real? We'll build the system that surfaces
only those."* → `/diagnose`.
