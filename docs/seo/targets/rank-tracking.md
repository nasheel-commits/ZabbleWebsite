# Rank & Visibility Tracking — Zabble (South Africa) — owned by S03

The monthly measurement loop for the keyword program. Tracks where `www.zabble.org` ranks for
the uber + priority targets, domain-level visibility, and the AEO/GEO answer surfaces (AI
Overview presence). Seeded with the **launch baseline (2026-06-04)**.

- **Target:** `zabble.org` (covers `www.zabble.org`; apex 301→www) · **Market:** South Africa
  (`location_name: "South Africa"`, code `2710`) · `language_code: "en"`.
- **Cadence:** **monthly**, first business day. Owner: S03 (keyword research).
- **Source of targets:** [`keyword-map.md`](keyword-map.md) §2 (uber) + §4 (P0) + §6 (key
  resolved requests). **Source of truth for metrics:** the raw pulls saved to `_evidence/03/`
  each run (date-stamped), per conventions §6.
- **Spend guard:** the full monthly loop is ≈ **$0.10–0.12** (2 Labs domain calls + a ~22-query
  SERP sweep). Check `/v3/appendix/user_data` balance before each run.

> **Entity-collision caveat (read before interpreting `zabble`):** "Zabble" is also the US firm
> *Zabble, Inc.* (waste/ESG tech, `zabble.ai`/`zabble.com`). Brand SERPs, the `zabble` knowledge
> panel, and AI-Overview/LLM answers for "zabble" may surface the US entity. Track the SA brand
> SERP separately and disambiguate via `Organization` schema + `sameAs` + consistent SA NAP
> (GEO/S08 + schema session). A US-entity result for `zabble` is **not** a Zabble-SA ranking.

---

## 1. Tracked keyword set (22)

The uber set, all P0 commercial heads, the brand term, and the three highest-value resolved
requests. Each maps to a live canonical URL (verified `keyword-map.md` §7).

<!-- TRACKED -->
| # | Keyword | Tier | Vol (ZA/mo) | KD | Intent | Target URL |
|---|---|---|---|---|---|---|
| 1 | accounting software south africa | U | 480 | 25 | commercial | https://www.zabble.org/systems/accounting-engine |
| 2 | what is popia | U | 390 | 25 | informational | https://www.zabble.org/ |
| 3 | crm software south africa | U | 320 | 18 | commercial | https://www.zabble.org/systems/bespoke-crm |
| 4 | inventory management software | U | 260 | 15 | commercial | https://www.zabble.org/systems/inventory-clarity |
| 5 | popia compliance | U | 260 | 27 | transactional | https://www.zabble.org/systems/compliance-reporting |
| 6 | software development company south africa | U | 260 | 26 | navigational | https://www.zabble.org/ |
| 7 | business process automation | U | 50 | 9 | informational | https://www.zabble.org/ |
| 8 | custom software development south africa | U | 20 | n/d | commercial | https://www.zabble.org/ |
| 9 | fraud detection software | U | 10 | n/d | commercial | https://www.zabble.org/systems/continuous-assurance |
| 10 | who builds custom software in south africa | U | n/d | n/d | commercial | https://www.zabble.org/ |
| 11 | operational systems | P0 | 2400 | 32 | informational | https://www.zabble.org/ |
| 12 | crm software in south africa | P0 | 320 | 2 | commercial | https://www.zabble.org/systems/bespoke-crm |
| 13 | decision support system | P0 | 170 | 16 | commercial | https://www.zabble.org/systems/analytics-suite |
| 14 | mdm software | P0 | 90 | n/d | commercial | https://www.zabble.org/systems/master-data-hub |
| 15 | stock management software | P0 | 70 | 27 | commercial | https://www.zabble.org/systems/inventory-clarity |
| 16 | event management software | P0 | 70 | n/d | commercial | https://www.zabble.org/systems/kairos |
| 17 | case management system | P0 | 70 | n/d | commercial | https://www.zabble.org/systems/case-management |
| 18 | software development company durban | P0 | 40 | 10 | commercial | https://www.zabble.org/ |
| 19 | predictive maintenance | Req | 210 | 26 | commercial | https://www.zabble.org/systems/predictive-maintenance |
| 20 | what is reconciliation in accounting | Req | 140 | 17 | informational | https://www.zabble.org/systems/reconciliation-engine |
| 21 | master data management | Req | 90 | 36 | informational | https://www.zabble.org/systems/master-data-hub |
| 22 | zabble | Brand | 10 | n/d | informational | https://www.zabble.org/ |
<!-- /TRACKED -->

*Expansion rule:* when a money page's primary keyword starts ranking (enters top 20), add its
two strongest supporting terms (from `keyword-map.md` §4) to the sweep the following month.

---

## 2. The monthly run (exact DataForSEO calls)

Run from the worktree with env loaded (`set -a; . ./.env; set +a`). Save every response to
`_evidence/03/rank-tracking/<YYYY-MM>/`. Replace `<YYYY-MM>` with the run month.

**A. Balance check (always first):**
```bash
curl -s --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/appendix/user_data | \
  python -c "import json,sys;print(json.load(sys.stdin)['tasks'][0]['result'][0]['money']['balance'])"
```

**B. Domain visibility (2 Labs calls, ≈ $0.02):**
```bash
# B1 — every keyword zabble.org ranks for in SA (positions, volume, ETV)
curl -s -X POST --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live \
  -H "Content-Type: application/json" \
  -d '[{"target":"zabble.org","location_name":"South Africa","language_code":"en","limit":200,"order_by":["ranked_serp_element.serp_item.rank_group,asc"]}]' \
  -o _evidence/03/rank-tracking/<YYYY-MM>/ranked-keywords__zabble-org__za.json

# B2 — domain-level organic position distribution + ETV
curl -s -X POST --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live \
  -H "Content-Type: application/json" \
  -d '[{"target":"zabble.org","location_name":"South Africa","language_code":"en"}]' \
  -o _evidence/03/rank-tracking/<YYYY-MM>/domain-rank-overview__zabble-org__za.json
```

**C. Exact-position + AEO/GEO sweep of the tracked set (≈ 22 × $0.0035 ≈ $0.08).** For each
tracked keyword, pull the live SA SERP and record (a) zabble.org's `rank_group` if present, and
(b) which SERP features fire (`ai_overview`, `people_also_ask`, `featured_snippet`, `local_pack`):
```bash
curl -s -X POST --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/serp/google/organic/live/advanced \
  -H "Content-Type: application/json" \
  -d '[{"keyword":"<tracked keyword>","location_name":"South Africa","language_code":"en","depth":30}]' \
  -o _evidence/03/rank-tracking/<YYYY-MM>/serp__<slug>__za.json
# read: tasks[0].result[0].items[] -> type for features; type=="organic" & domain=="zabble.org" -> rank_group
```

**D. (Optional, quarterly) GEO answer check** — for the brand + top 3 informational targets,
record whether an AI Overview cites/names Zabble (and whether it confuses the US homonym). Use
the `AI_OPTIMIZATION` module / manual capture; log a screenshot to
`_evidence/03/rank-tracking/<YYYY-MM>/`.

A helper that automates B+C and appends a results row is provided at
`_evidence/03/run_rank_tracking.py` (prints the log row; does not commit).

---

## 3. Metrics recorded each run

Per tracked keyword: **best organic position** (`—` = not in top 30), and **SERP features**
present (AIO / PAA / FS / Local). Domain-level: **# ranked keywords**, **organic ETV**, **#
in top-10 / top-3**. The headline visibility number is *# tracked terms in top-10*.

---

## 4. Results log

One row per month. **Baseline 2026-06-04** is the launch zero-line (site live, not yet in
DataForSEO's rank DB). Evidence: `_evidence/03/labs-ranked-keywords__zabble-org__za.json`,
`labs-domain-rank-overview__zabble-org__za.json`.

| Run date | Ranked kw (SA) | Organic ETV | Top-10 | Top-3 | Tracked in top-10 | AI-Overview presence (tracked) | Notes / evidence |
|---|---|---|---|---|---|---|---|
| **2026-06-04 (baseline)** | **0** (Labs DB) | **0** | 0 | 0 | **1 / 22** | AIO on ~17/22 tracked SERPs; local pack on the 3 core "custom software" terms; Zabble not yet *cited* in any AIO | Launch zero-line. Labs `ranked_keywords` total_count null / `domain_rank_overview` items null (DB lags new site), **but the live SERP sweep already ranks `zabble.org` #1 for brand `zabble`**. Evidence: `_evidence/03/labs-ranked-keywords__zabble-org__za.json` + `rank-tracking/2026-06/`. |
| _2026-07 (next)_ | | | | | | | |
| _2026-08_ | | | | | | | |

> **Baseline nuance (Labs DB vs live SERP):** DataForSEO's *Labs* rank database has not yet
> picked up the new site (0 ranked keywords), but the *live SERP* sweep (method C) already shows
> `zabble.org` at **#1 for `zabble`**. The live sweep is the fresher truth for a just-launched
> site; the Labs domain numbers will catch up over the coming weeks. Track both.

### Per-keyword position log (fill monthly; baseline = all unranked)

| Keyword | Target URL | 2026-06 (base) | 2026-07 | 2026-08 |
|---|---|---|---|---|
| crm software south africa | /systems/bespoke-crm | — | | |
| accounting software south africa | /systems/accounting-engine | — | | |
| inventory management software | /systems/inventory-clarity | — | | |
| popia compliance | /systems/compliance-reporting | — | | |
| predictive maintenance | /systems/predictive-maintenance | — | | |
| software development company south africa | / | — | | |
| business process automation | / | — | | |
| fraud detection software | /systems/continuous-assurance | — | | |
| who builds custom software in south africa | / | — | | |
| what is popia | /systems/compliance-reporting | — | | |
| zabble (brand) | / | **1** *(live SERP; US homonym also present)* | | |

*(remaining tracked terms in §1 follow the same pattern; `—` = not ranked in top 30.)*

---

## 5. Review triggers

- **First ranking** (any tracked term enters top 20) → add its supporting terms (§1 rule) and
  note in `status.md`.
- **AI Overview starts citing Zabble** → flag to S08 (GEO win); record the cited URL + claim.
- **Brand `zabble` still shows the US entity after 2 months indexed** → escalate entity
  disambiguation (schema `sameAs`, GBP, directory NAP) to S08 + S10.
- **A tracked target's page 404s or loses its canonical** → reconcile against `keyword-map.md` §7.
