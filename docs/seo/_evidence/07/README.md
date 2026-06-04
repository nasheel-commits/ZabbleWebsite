# Evidence index — Session 07 (GEO)

All captures: **live** mode, market **South Africa / en**, via DataForSEO REST
(`https://api.dataforseo.com/v3`), HTTP Basic auth (**redacted** — creds in `.env`
only, never in these files). Captured **2026-06-04**. API version `0.1.20260525`.
Each `.json` is the raw response; the `cost` field is the billed USD for that call.

**Total spend this session: ≈ $0.23** (two pull passes; the second, committed set
below totals **$0.114965**). Account balance checked live before work: $50.88.

> Note on reproducibility: SERP AI-Overview presence and LLM citations **drift run
> to run** (see finding F-DRIFT in the audit). These files are a point-in-time
> baseline, not a fixed truth. Re-run the fixed prompt set monthly (`prompt-set.md`).

## Files

| File | Endpoint | Request (key fields) | cost | Reads |
|------|----------|----------------------|------|-------|
| `serp-ai-overview__bpa-za.json` | `POST /serp/google/organic/live/advanced` | `keyword:"business process automation south africa"`, SA/en, depth 20 | 0.00365 | **AI Overview = YES**, PAA present. Google GEO surface is live for this query. |
| `serp-ai-overview__custom-software-za.json` | same | `keyword:"who builds custom business software in south africa"` | 0.00365 | **AI Overview = YES**, PAA present. |
| `serp-ai-overview__bespoke-crm-za.json` | same | `keyword:"bespoke crm south africa"` | 0.00365 | **AI Overview = YES**, PAA present. (First pull: no AO — surface drifts.) |
| `serp-ai-overview__automation-company-za.json` | same | `keyword:"business automation company south africa"` | 0.00350 | AI Overview = no; **local_pack = 3** (a local-SEO/GBP signal → S10). |
| `content-analysis-summary__zabble.json` | `POST /content_analysis/summary/live` | `keyword:"zabble"` | 0.02003 | 400 web citations for the token "zabble"; **countries US 152, DE 32, WW 32, AU/BZ/CH 8 — ZERO South Africa**. The brand token is owned by homonyms. |
| `content-analysis-search__zabble.json` | `POST /content_analysis/search/live` | `keyword:"zabble"`, limit 15, one_per_domain | 0.02045 | Top domains: speyer.de, resource-recycling.com, waste360.com, techstartups.com… — none are zabble.org or SA. |
| `llm-response__pplx-sonarpro__custom-software-za.json` | `POST /ai_optimization/perplexity/llm_responses/live` | `model:"sonar-pro"`, web_search, category prompt | 0.02563 | Perplexity names **13 SA firms, cites 9 sources — Zabble in none** (SOV 0%). |
| `llm-response__chatgpt-o4mini__custom-software-za.json` | `POST /ai_optimization/chat_gpt/llm_responses/live` | `model:"o4-mini"`, web_search, category prompt | 0.02090 | ChatGPT names a **different ~12 SA firms, cites 10 — Zabble in none** (SOV 0%). Zero domain overlap with Perplexity. |
| `llm-response__pplx-sonarpro__brand-zabble.json` | same (perplexity) | `model:"sonar-pro"`, web_search, brand prompt | 0.01351 | Asked "what is Zabble (zabble.org)?", the model answers about **Zabble, Inc. — a California zero-waste SaaS** (zabbleinc.com) and calls zabble.org "a small marketing site". Entity fully conflated. |

## Competitor / citation sets (for share-of-voice tracking)

- **Perplexity (category):** business-automation.co.za, badrobot.co.za,
  co-foundry.co.za, sivoxi.com, signaturegroup.co.za, aiautomatedsolutions.co.za,
  elioplus.com, mo.agency, ditstek.com.
- **ChatGPT (category):** norsit.co.za, opuweb.app, dpsoft.co.za, fintiq.co.za,
  imbalics.co.za, nuvio.co.za, twipsi.com, shiftbridge.co.za,
  excentrasolutions.co.za, lunasoft.co.za.
- **Brand-collision domain:** zabbleinc.com (+ sbir.gov, zoominfo.com/c/zabble-inc,
  zwconference.org) — the US "Zabble".
