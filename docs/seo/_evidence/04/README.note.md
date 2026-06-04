# Evidence index & method — Session 04 (Off-Page, Local SEO & Competitive)

All calls via **direct DataForSEO REST** (the in-session MCP server returned `401`
because `DATAFORSEO_BASIC_AUTH` was not in the environment that launched this
Claude Code session — see access doc §3). Auth: HTTP Basic from `.env`
(**redacted** everywhere). Market default: `location_name: "South Africa"`,
`language_code: "en"` (`location_code 2710`). Captured **2026-06-04**, **live**
(not sandbox). Record the `cost` field per call below.

> Numbering note: this session ran as **Session 04** (`seo/04-offpage-local`,
> `audits/04-offpage-local.md`, `_evidence/04/`) per the goal brief. The original
> S00 conventions table numbered off-page/local as "10"; that placeholder
> (`audits/10-offpage-local.md`) is left untouched. Site Architecture uses its own
> distinct branch `seo/04-architecture` — no git-ref collision.

## Calls (endpoint · body · cost · what we read)

| # | File | Endpoint | Cost | Read |
|---|------|----------|------|------|
| 1 | `labs-serp-competitors__core-cluster__za.json` | POST `/v3/dataforseo_labs/google/serp_competitors/live` | $0.0150 | 77 domains rank for Zabble's core cluster; surfaced the true SA SERP competitor set (synthesis, dvt, bbd, scrums, specno, platform45, runninghill, gendac, smudge, iqbusiness …) + directories to discount (clutch, goodfirms, designrush). |
| 2 | `labs-domain-rank-overview__competitors__za.json` | POST `/v3/dataforseo_labs/google/domain_rank_overview/live` (zabble.org) | $0.0100 | **zabble.org returns zero organic keywords** — confirms new/no-authority domain. Endpoint accepts one target per task (`"You can set only one task at a time."`). |
| 3 | `labs-domain-rank-overview__<domain>__za.json` (×10) | same, one per competitor | $0.0101 ea | SA organic KW count, ETV/mo, position distribution per competitor (table in audit §3). |
| 4 | `labs-domain-intersection__scrums-x-dvt__za.json` | POST `/v3/dataforseo_labs/google/domain_intersection/live` | $0.0124 | 24 keywords both leaders rank for (vol>10) = contested commercial space → Zabble gap targets. Geo-modified "software/IT company + city" dominates. |
| 5 | `labs-ranked-keywords__scrums__za.json` | POST `/v3/dataforseo_labs/google/ranked_keywords/live` (scrums.com, pos≤20) | $0.0147 | Exposes the winning content playbook: programmatic `/software-development-company/{city}` local pages, `/top-100-fintech-platforms-in-africa` linkbait directory, `/blog` + `/software-development-tools/{tool}` educational guides. |
| 6 | `business-listings__software-company-jhb.json` | POST `/v3/business_data/business_listings/search/live` (Joburg 40km) | $0.0160 | GBP/Maps benchmark: peers BBD (4.6/249), Entelect (4.7/179); product/fintech giants dominate review volume. |
| 7 | `business-listings__software-company-cpt.json` | same (Cape Town 40km) | $0.0145 | CPT peers RecoMed, CPI Performance (4.7/157); same pattern. |
| 8 | `backlinks-bulk-ranks__competitors__za.json` + `backlinks-summary__*.json` (×4) | POST `/v3/backlinks/bulk_ranks/live`, `/v3/backlinks/summary/live` | $0.0000 | **`40204` Access denied** — the Backlinks API needs a separate paid subscription (the "higher minimum commitment" the goal warned of). Not activated. See status.md blocker B5; digital-PR plan is grounded in observable competitor link-*assets* instead of raw referring-domain exports. |

**Total live spend this session: ~$0.18 USD** (balance $50.97 → ~$50.78).
Account: verified + funded. Backlinks subscription: **not active**.
