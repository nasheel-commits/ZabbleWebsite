#!/usr/bin/env python3
import io
p="docs/seo/targets/keyword-map.md"
doc=open(p,encoding="utf-8").read()
req=open("docs/seo/_evidence/03/_frag_requests.md",encoding="utf-8").read().strip()
urlcov=open("docs/seo/_evidence/03/_frag_urlcov.md",encoding="utf-8").read().strip()

# 1) Header status line + canonical host + tracking pointer
old_status="- **Status:** ✅ RESEARCHED — 213 keywords pulled from DataForSEO, **captured 2026-06-04**."
new_status=("- **Status:** ✅ RESEARCHED + OPERATIONALISED — 213-keyword map; all cross-session\n"
"  requests resolved (§6); live URL coverage verified (§7); launch rank baseline recorded (§8).\n"
"  **Updated 2026-06-04** (zabble.org live).\n"
"- **Canonical host:** `https://www.zabble.org` — apex `zabble.org` 301-redirects to `www`;\n"
"  all target URLs below use `www`. Live status of every URL: `_evidence/03/url-coverage__zabble-org__live.csv`.\n"
"- **Live baseline + monthly tracking:** [`rank-tracking.md`](rank-tracking.md).")
assert old_status in doc, "status anchor not found"
doc=doc.replace(old_status,new_status)

# 2) Replace §6 body
old6="""## 6. Requests for keywords (other sessions append here)

> S02 / S06 / S07 / S08: add the keyword/intent you need researched and your session #.
> S03 picks these up. Do **not** edit the tables above.

- _(none yet)_"""
new6="""## 6. Cross-session requests — RESOLVED (2026-06-04)

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

""" + req + """

### 6.2 New requests (other sessions append below; S03 resolves)

> S02 / S06 / S07 / S08 / S10: add the keyword/intent you need + your session #. Do **not** edit
> the tables above. S03 resolves and moves the row into §6.1.

- _(none open)_"""
assert old6 in doc, "section 6 anchor not found"
doc=doc.replace(old6,new6)

# 3) Insert §7 (URL coverage) + §8 (baseline) before the existing scope-notes section; renumber scope to §9
old7head="## 7. Scope notes — broader-Africa / global-English"
new_sections="""## 7. URL coverage & canonical targets (live, 2026-06-04)

Every **uber + priority (P0/P1)** cluster mapped to a live canonical URL on `www.zabble.org`.
Status verified by HTTP pull `_evidence/03/url-coverage__zabble-org__live.csv` (all 32
`/systems/<slug>` pages + `/`, `/systems`, `/diagnose` return `200`; `/pillars/*`,
`/industries/*`, `/blog`, `/faq`, `/about`, `/contact` return `404`).

""" + urlcov + """

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
| Ranked keywords (SA, organic) | **0** | `ranked_keywords` `total_count: null`, 0 items. |
| Domain rank / organic ETV | **none** | `domain_rank_overview` `items: null`. |

This is the expected **launch baseline** for a site only just live and not yet in DataForSEO's
rank database (Labs data lags new indexation). It is the zero-line against which `rank-tracking.md`
measures monthly progress. **Entity-collision caveat:** "Zabble" also denotes the US firm
*Zabble, Inc.* (waste/ESG tech). Brand SERPs and AI answers for `zabble` may surface the US
entity; disambiguate via `Organization` schema + `sameAs` + consistent SA NAP (GEO/S08 + schema).

"""
assert old7head in doc, "scope head not found"
doc=doc.replace(old7head, new_sections+"## 9. Scope notes — broader-Africa / global-English")

open(p,"w",encoding="utf-8").write(doc)
print("injected; new line count:", doc.count(chr(10))+1)
print("has §6.1:", "6.1 Resolved-request detail" in doc, "| §7 URLcov:", "7. URL coverage" in doc, "| §8 baseline:", "8. Live rank baseline" in doc, "| §9 scope:", "9. Scope notes" in doc)
