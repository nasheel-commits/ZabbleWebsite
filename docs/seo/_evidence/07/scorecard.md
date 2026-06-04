# GEO scorecard — monthly AI-visibility tracker

Run the fixed prompt set (`prompt-set.md`) monthly and add a column. Market: South
Africa / en. Engines: Perplexity `sonar-pro` + ChatGPT `o4-mini` (web search).
Raw captures: `_evidence/07/llm-response__*`, `content-analysis-summary__zabble*`,
`serp-ai-overview__*`.

| Metric | Run 1 — 2026-06-04 (initial) | Run 2 — 2026-06-04 (post-build, pre-deploy) | Target |
|--------|:--:|:--:|:--:|
| Perplexity category SOV (Zabble cited) | 0 / 1 | 0 / 1 | ≥ 1 citation |
| ChatGPT category SOV (Zabble cited) | 0 / 1 | 0 / 1 | ≥ 1 citation |
| Brand prompt → correct SA entity (not Zabble Inc) | FAIL | FAIL | PASS (both engines) |
| Zabble in category answer text | no | no | yes |
| AI-Overview present (SA category keywords) | 3 / 4 | 3 / 4 | track → win |
| Brand citations from South Africa (Content Analysis) | 0 (US 152, DE 32…) | 0 (US 152, DE 32…) | > 0 |
| Engine citation overlap (Perplexity ∩ ChatGPT) | 0 domains | 0 domains | — (drift watch) |

**Reading.** Run 2 is unchanged from Run 1, and that is expected: the on-site GEO
work (entity JSON-LD, pillar hubs, cited content, llms.txt) is **committed to the
build but not yet deployed to zabble.org and not yet recrawled** by the engines.
GEO results lag deployment + recrawl by weeks. Run 2 timestamps the "fix shipped,
not yet live" state so the first post-deploy run shows the true delta.

## What moves the needle (in expected order of effect)
1. **Deploy** this branch so zabble.org carries the Organization JSON-LD,
   disambiguation, pillar hubs, cited content, and `/llms.txt`.
2. **Execute the entity kit** (`../entity-kit/`): LinkedIn + GBP + Crunchbase +
   Wikidata `different from`, and get onto the cited SA listicles. Corroboration is
   what flips the brand prompt from FAIL → PASS.
3. **Re-run this scorecard monthly.** Expect the brand prompt to disambiguate first
   (entity work), then category SOV to follow (content + mentions).

## Cadence & cost
- Monthly, first week. ~$0.10/run (8–9 calls). Balance at last run: **$49.07**
  (2026-06-04). Spend log lives in `README.md` + each response's `cost` field.
