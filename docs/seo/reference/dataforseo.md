# Reference — DataForSEO API & MCP

How to get data out of DataForSEO for Zabble's SEO/AEO/GEO work: the auth model,
the modules we enabled, the endpoints each discipline needs, South-Africa
parameters, cost discipline, and worked examples against our own money pages.

> Pricing note: **do not treat any price in this doc as fact.** DataForSEO
> pricing and free-tier rules change. Where a cost matters, confirm it in the
> dashboard and label the figure with its capture date. The only cost we record
> as fact is the `cost` field returned on each response (captured into evidence).

---

## 1. Auth

HTTP Basic. Username = API login (email `nasheel@zabble.org`), password = the API
password from the dashboard "API CREDENTIALS" block. Sent as
`Authorization: Basic base64(username:password)`.

```bash
curl --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/appendix/user_data
```

Two base URLs:
- **Live:** `https://api.dataforseo.com` — real data, billed per `cost`.
- **Sandbox:** `https://sandbox.dataforseo.com` — dummy data, free. Same auth,
  same paths. Use for wiring/CI and structure checks.

**Account state (2026-06-04):** auth valid, balance $1, but data endpoints
(incl. sandbox) gated by `40104` until the account is verified. See
`00-access-and-credentials.md` §2.

### Response envelope

Every response shares a shape worth knowing:
```jsonc
{
  "status_code": 20000,        // 20000 = OK. 40xxx = error (e.g. 40104 verify acct)
  "cost": 0.0114,              // USD billed for THIS call — record it in evidence
  "tasks": [
    {
      "status_code": 20000,
      "result": [ /* the data you want */ ]
    }
  ]
}
```
Always check **both** the top-level and the task-level `status_code`. Read data
from `tasks[0].result`.

---

## 2. Modules we enabled (`ENABLED_MODULES`)

The MCP is scoped (conventions: keep the tool surface focused). Enabled:

| Module | Why we enabled it | Primary sessions |
|--------|-------------------|------------------|
| `SERP` | Live Google SERPs for SA — rankings, SERP features (snippets, PAA, AI Overview presence) | S01, S07, S10 |
| `KEYWORDS_DATA` | Search volume, CPC, trends (Google Ads source) | S05 |
| `DATAFORSEO_LABS` | The workhorse: keyword ideas, related/suggestions, ranked keywords, competitors, keyword difficulty, search-intent — mostly from DataForSEO's own database (cheaper, instant `live` endpoints) | S05, S02, S06, S07, S08 |
| `ONPAGE` | Technical crawl of zabble.org: status codes, render, meta, headings, Core Web Vitals signals, duplicate content | S01, S02, S09 |
| `BACKLINKS` | Link profile, referring domains, anchors — ours and competitors' | S10 |
| `DOMAIN_ANALYTICS` | Technologies, domain-level traffic/rank estimates, Whois | S10, S05 |
| `AI_OPTIMIZATION` | LLM-response / AI-search data — directly serves GEO (what models say, who they cite) | S08, S07 |
| `CONTENT_ANALYSIS` | Brand/citation mentions and sentiment across the web — supports GEO entity work | S08 |

Modules **not** enabled (enable later only if a session needs them): `BUSINESS_DATA`
(Google Business Profile / reviews — likely useful for S10 local SEO once we have
a GBP listing), `MERCHANT` (shopping — not relevant to a services business).

Full valid list: `AI_OPTIMIZATION, SERP, KEYWORDS_DATA, ONPAGE, DATAFORSEO_LABS,
BACKLINKS, BUSINESS_DATA, DOMAIN_ANALYTICS, CONTENT_ANALYSIS, MERCHANT`.

---

## 3. South Africa parameters (binding default)

Every query, unless explicitly comparative, uses:
```jsonc
{
  "location_name": "South Africa",   // or "location_code": 2710
  "language_code": "en"
}
```
For city-level SERP nuance (e.g. "Johannesburg", "Cape Town") use the matching
`location_name`. Confirm available locations once with
`/v3/dataforseo_labs/locations_and_languages` (or the SERP-specific locations
endpoint) and cache the codes into an evidence file.

---

## 4. Endpoint cheat-sheet by discipline

Paths are the live REST endpoints; the MCP exposes equivalent tools (names like
`serp_organic_live_advanced`, `dataforseo_labs_google_keyword_ideas`, etc. —
list them with the MCP once verified). Prefer `live` endpoints (synchronous) over
`task_post`/`task_get` (async) for interactive work.

### S05 — Keyword & market research
- `POST /v3/dataforseo_labs/google/keyword_ideas/live` — ideas from seed keywords.
- `POST /v3/dataforseo_labs/google/related_keywords/live` — "searches related to".
- `POST /v3/dataforseo_labs/google/keyword_suggestions/live` — long-tail completions.
- `POST /v3/dataforseo_labs/google/search_intent/live` — informational / commercial / navigational / transactional per keyword (drives which layer a keyword belongs to).
- `POST /v3/dataforseo_labs/google/bulk_keyword_difficulty/live` — KD scores.
- `POST /v3/keywords_data/google_ads/search_volume/live` — Google-Ads volume/CPC.

### S01 / S02 / S09 — Technical & on-page
- `POST /v3/on_page/instant_pages` — single-URL render + on-page facts, instant.
- `POST /v3/on_page/task_post` then `/summary`, `/pages`, `/links`, `/duplicate_content`, `/lighthouse` — full-site crawl.
- OnPage returns Core Web Vitals signals; cross-check with PageSpeed/CrUX (see `measurement-indexing.md`).

### S07 — AEO (answer slots)
- `POST /v3/serp/google/organic/live/advanced` — `item_types` reveal `featured_snippet`, `people_also_ask`, `answer_box`, `ai_overview`, etc. This is how you see which queries have an answer slot to win.

### S08 — GEO (generative engines)
- `AI_OPTIMIZATION` module endpoints — LLM responses and citations (what models answer for a prompt and which sources they cite).
- `POST /v3/content_analysis/search/live` and `/summary/live` — where Zabble (or "Kairos", "bespoke systems South Africa") is mentioned and the sentiment.
- SERP `ai_overview` item type (above) — Google's AI Overview is both AEO and GEO surface.

### S10 — Off-page, local, competitive
- `POST /v3/backlinks/summary/live`, `/backlinks/live`, `/referring_domains/live` — link profile.
- `POST /v3/dataforseo_labs/google/competitors_domain/live` — who ranks for our keywords.
- `POST /v3/dataforseo_labs/google/ranked_keywords/live` — every keyword a domain ranks for (ours + competitors').
- `DOMAIN_ANALYTICS` technologies/traffic for competitor teardown.
- `BUSINESS_DATA` (enable when ready) for Google Business Profile / reviews.

---

## 5. Worked examples (Zabble money pages)

> These are **templates** — they will return `40104` until the account is
> verified. Run them against `sandbox.` first (free) to confirm shape, then
> `api.` for real SA data. Save every response to `_evidence/`.

**Keyword ideas for the Bespoke CRM money page (`/systems/bespoke-crm`):**
```bash
curl -s -X POST --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live \
  -H "Content-Type: application/json" \
  -d '[{"keywords":["bespoke crm","custom crm"],"location_name":"South Africa","language_code":"en","limit":200}]'
```

**Does "document automation south africa" have an answer slot (AEO)?**
```bash
curl -s -X POST --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/serp/google/organic/live/advanced \
  -H "Content-Type: application/json" \
  -d '[{"keyword":"document automation south africa","location_name":"South Africa","language_code":"en"}]'
# inspect tasks[0].result[0].items[].type for featured_snippet / people_also_ask / ai_overview
```

**Technical snapshot of a single page (S01/S02):**
```bash
curl -s -X POST --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/on_page/instant_pages \
  -H "Content-Type: application/json" \
  -d '[{"url":"https://zabble.org/systems/document-intelligence"}]'
```

**Search intent classification (routes a keyword to SEO vs AEO vs GEO):**
```bash
curl -s -X POST --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/dataforseo_labs/google/search_intent/live \
  -H "Content-Type: application/json" \
  -d '[{"keywords":["what is a bespoke crm","bespoke crm pricing","zabble"],"language_code":"en"}]'
```

---

## 6. Cost discipline

- Record the `cost` field of every live call into the evidence sidecar.
- Sandbox first for structure; live only for real SA data.
- `DATAFORSEO_LABS` live endpoints are generally the cheapest way to get keyword
  intelligence at volume; SERP `live/advanced` and OnPage crawls cost more per
  call — batch and cache.
- One request body can carry **multiple tasks** (the body is a JSON array) — but
  each array element is a billable task. Don't pad arrays "just in case".
- The $1 trial credit is for smoke tests only. Fund before S05 runs at volume.

---

## 7. Gotchas

- **Two status codes** per response (top-level + task-level) — check both.
- `40104` = verify account; `40200`-ish = insufficient funds; `40501` = invalid
  field. Read `status_message` — it's specific.
- Volumes/CPC are **USD** and Google-Ads-sourced (banded, monthly-averaged).
  Treat as directional, not exact.
- Labs data comes from DataForSEO's database (fast, slightly lagged); live SERP
  is real-time (fresher, costlier). Pick deliberately and note which in evidence.
- The MCP's `DATAFORSEO_FULL_RESPONSE=false` (our default) returns a trimmed
  payload. If a session needs a field that's been trimmed, set it `true` for
  that run — but expect larger responses.

---

## 8. Sources

- Official MCP server: https://github.com/dataforseo/mcp-server-typescript
- MCP setup guide: https://dataforseo.com/help-center/setting-up-the-official-dataforseo-mcp-server-simple-guide
- API docs: https://docs.dataforseo.com
- Pricing (confirm in-dashboard, never hard-code): https://dataforseo.com/pricing
