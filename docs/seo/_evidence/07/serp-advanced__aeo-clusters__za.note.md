# Evidence note — AEO SERP captures (PAA / snippet / AI Overview)

- **Endpoint:** `POST /v3/serp/google/organic/live/advanced`
- **Request body (per query, one task per call — the live endpoint rejects
  multi-task bodies with "You can set only one task at a time"):**
  `[{ "keyword": "<query>", "location_name": "South Africa", "language_code": "en", "depth": 10, "people_also_ask_click_depth": 1 }]`
- **Auth:** HTTP Basic (redacted). Creds read from `.env` at runtime; never echoed
  or committed.
- **Captured:** 2026-06-04
- **Mode:** **live** (`api.dataforseo.com`). NB: the running Claude Code session's
  MCP server was unauthenticated (401), so calls were made via `curl` using the
  `.env` credentials — the documented fallback (access doc §3). Same endpoint and
  parameters the MCP tool `serp_organic_live_advanced` would use.
- **Cost (sum of `response.cost`):** **0.02535 USD** across 12 queries
  (~0.0021 each). Recorded per file; each raw JSON carries its own `cost`.
- **Files:** `serp-advanced__<slug>__za.json` (12 raw responses) +
  `paa-inventory__aeo-clusters__za.json` (extracted PAA questions + slot flags
  per query, generated from the raw files).

## What we read

- **AI Overview is near-ubiquitous on informational queries:** 10/12 queries
  returned an `ai_overview` item; the two without were `business process
  automation south africa` (knowledge_graph + reviews; navigational/brand shape)
  and `who builds custom software in south africa` (local_pack + PAA).
- **People Also Ask present on 9/12 queries**, ~6 questions each (expandable).
  PAA is the most concrete, winnable answer slot for these terms.
- **No classic `featured_snippet` or `answer_box`** appeared on any sampled
  query. The SA answer surface for our terms is **PAA + AI Overview**, not a
  snippet box — so we target those with the answer-first shape.
- **Local intent on "south africa" service queries:** `custom software
  development south africa` and `who builds custom software in south africa` both
  surfaced a `local_pack` → a hand-off to S10 (Local SEO / GBP) and S08 (GEO).

## Reproduce

Run `serp/google/organic/live/advanced`, **one keyword per request**, with
`location_name: "South Africa"`, `language_code: "en"`,
`people_also_ask_click_depth: 1`. Inspect `tasks[0].result[0].items[].type` for
`ai_overview` / `people_also_ask` / `featured_snippet`, and read PAA question
titles from the `people_also_ask` item's `items[].title`. Query list and slug
mapping: see the question inventory in `../../audits/07-aeo.md` §3.
