# GEO measurement — fixed prompt set & monthly cadence

The point of a **fixed** set is comparability: same prompts, same models, same
market, every month, so a change in citations means a real change — not a
different question. Citation drift is high (the two engines we tested shared zero
cited domains, and Google's AI-Overview presence flipped between two pulls on the
same day), so **do not edit the prompts below** once baselined. Add new ones to a
"v2" block instead; keep v1 running.

- **Market:** South Africa · `location_name:"South Africa"` · `language_code:"en"`
- **Cadence:** monthly (1st week). **Owner:** GEO (S07-geo) → hands to S10 measurement.
- **Cost:** ~$0.12 per full run (8 calls). Trivial; do not batch-skip.

## A. Category / share-of-voice prompts (does an engine name + cite Zabble?)

Run each on Perplexity `sonar-pro` (web_search) and ChatGPT `o4-mini` (web_search).
Record: is "Zabble" in the answer text? is zabble.org in the citations? which
competitors are named/cited? (the SOV denominator).

1. "Who builds bespoke business automation and custom operational software
   (workflow automation, audit trails, anomaly detection, analytics) for companies
   in South Africa? Name specific firms and their websites."
2. "I run a South African business and need a custom internal system built around
   my workflow, not off-the-shelf software. Which firms should I talk to?"
3. "What software can automatically detect fraud or anomalies in a stream of
   transactions for a South African company, and who builds it?"
4. "Who can build a custom CRM shaped around my sales process in South Africa?"

## B. Brand / entity prompts (does the engine know who Zabble is?)

Run on Perplexity `sonar-pro` and ChatGPT `o4-mini` (web_search).

5. "What is Zabble (zabble.org)? What does this company do, what products or
   systems does it offer, and where is it based?"
6. "Is Zabble a South African company? What does it build?"

Pass condition for B: the engine describes Zabble as a **South African firm that
builds bespoke operational systems** and does **not** confuse it with Zabble, Inc.
(the US zero-waste SaaS). Baseline 2026-06-04: **FAIL** (conflated).

## C. Google AI-Overview presence (SERP)

`POST /serp/google/organic/live/advanced`, SA/en, for the category keywords:
`business process automation south africa`, `who builds custom business software in
south africa`, `bespoke crm south africa`, `business automation company south
africa`. Record `ai_overview` presence per keyword.

> The `ai_overview` item returns `asynchronous_ai_overview: true` with empty inline
> `markdown`/`references`. To capture the **cited sources inside the AO**, follow up
> with the AI-Overview / AI-summary async fetch (extra call) — add this to the
> runbook once the entity work lands and we expect to appear.

## D. Brand citation footprint (Content Analysis)

`POST /content_analysis/summary/live` and `/search/live` for `keyword:"zabble"`.
Record `total_count`, country split, and how many citations are zabble.org / SA
vs the US "Zabble" homonym. Baseline 2026-06-04: 400 citations, **0 South Africa**.

## Scorecard (fill each month)

| Metric | Baseline 2026-06-04 | Target |
|--------|---------------------|--------|
| Perplexity category SOV (Zabble cited / runs) | 0 / 2 prompts | ≥1 citation |
| ChatGPT category SOV | 0 / 2 prompts | ≥1 citation |
| Brand prompt: correct SA entity (not Zabble Inc) | FAIL | PASS on both engines |
| AI-Overview presence (SA category kws) | 3 / 4 keywords | — (track, then win) |
| Brand citations from South Africa (Content Analysis) | 0 | >0 |
