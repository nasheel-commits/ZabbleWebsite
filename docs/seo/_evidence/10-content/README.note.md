# Evidence — S06/S10 Content Strategy (this task: "S10 content")

> **Naming note.** The repo's binding conventions (`00-conventions.md` §1)
> number Content Strategy as **S06** (`seo/06-content`). This task was issued
> as **"S10 content"** on branch `seo/10-content`. To keep both reconcilable,
> content evidence lives here under `_evidence/10-content/` (not the off-page
> session's `_evidence/10/`). See `audits/10-content.md` §0 for the full
> reconciliation.

All calls: **South Africa**, `language_code: en`, **live** (account funded,
balance was $50.998 — `status.md`). The hosted MCP returned `401` in this
Claude Code session (env not loaded at launch — known caveat in `status.md`),
so calls were made directly against the DataForSEO REST API using the
`DATAFORSEO_BASIC_AUTH` token from git-ignored `.env`. **The token was loaded
into a shell variable and never echoed, written to a file, or committed**
(conventions §3). Response JSON below carries no `Authorization` header.

## Files

| File | Endpoint | Captured | Mode | Cost (USD) | What it proves |
|------|----------|----------|------|-----------|----------------|
| `labs-keyword-overview__priority-clusters__za.json` | POST `/v3/dataforseo_labs/google/keyword_overview/live` | 2026-06-04 | live | 0.0128 | SA search volume, competition, CPC, and **search intent** for 38 priority-cluster keywords. |
| `serp-organic__popia-compliance__za.json` | POST `/v3/serp/google/organic/live/advanced` | 2026-06-04 | live | 0.002 | SERP feature mix for `popia compliance` (SA). |
| `serp-organic__what-is-anomaly-detection__za.json` | same | 2026-06-04 | live | 0.002 | SERP feature mix for `what is anomaly detection` (SA). |
| `serp-organic__automated-bank-reconciliation__za.json` | same | 2026-06-04 | live | 0.002 | SERP feature mix for `automated bank reconciliation` (SA). |
| `serp-organic__demand-forecasting-software__za.json` | same | 2026-06-04 | live | 0.002 | SERP feature mix for `demand forecasting software` (SA). |
| `serp-organic__ai-receptionist__za.json` | same | 2026-06-04 | live | 0.002 | SERP feature mix for `ai receptionist` (SA). |

**Total spend: ~$0.023** (re-fetched once after an isolated worktree was set up
to escape a shared-checkout thrash from parallel sessions — same queries, same market).

## What we read (the findings the strategy is built on)

**1. SA demand for these exact terms is thin.** Highest volumes:
`popia compliance` 260/mo (informational, LOW comp), `workflow automation`
140 (informational), `anomaly detection` 90, `ipaas` 90, `master data
management` 90, `inventory management software south africa` 50. Most
module-specific commercial terms sit at **10–50/mo**; several brand-shaped
seeds returned **no measurable volume** (omitted by the API = not in its DB):
`bespoke business systems south africa`, `business process automation south
africa`, `custom crm south africa`, `bespoke crm`, `ai receptionist`,
`invoice data extraction`, `quote automation software`, `cpq software`,
`how to automate bank reconciliation`. → Volume-chasing will not build this
business. Win on (a) high-intent long-tail commercial terms (CPC is high:
`client onboarding software` $24.73, `kyc automation` $21.78, `inventory
management software SA` $18.95 — money intent), (b) **ZA regulatory anchors**
with real local volume (POPIA), and (c) **broader-English informational**
terms for topical authority + GEO.

**2. Every priority query triggers an AI Overview AND People-Also-Ask in SA.**
All five SERPs sampled (`popia compliance`, `what is anomaly detection`,
`automated bank reconciliation`, `demand forecasting software`, `ai
receptionist`) returned both `ai_overview` and `people_also_ask` item types.
→ The generative/answer surface is *the* battleground here; answer-first,
question-led, schema-backed content is not optional. This is the empirical
basis for an AEO/GEO-native editorial engine.

**3. Citation landscape (who AI Overviews currently cite in SA).**
- `what is anomaly detection`: ibm.com, crowdstrike.com, geeksforgeeks.org, vmware.com, aws.amazon.com (global tech authorities — hard to displace; we win the *SA business use-case* angle, not the textbook definition).
- `popia compliance`: popia.co.za, cliffedekkerhofmeyr.com, inforegulator.org.za, gov.za, scytale.ai (SA legal/regulatory sources — we win the *"how do I automate POPIA reporting"* operational angle).
- `ai receptionist`: ionos.com, bookipi.com, yeastar.com, withallo.com (SaaS vendors — we win the *bespoke/SA events & bookings* angle, not the generic product).

**4. PAA questions captured (seed the FAQ blocks + H2s in the briefs):**
- *AI receptionist:* What do AI receptionists do? · How much does an AI receptionist cost? · Is there any AI receptionist? · How do I make an AI receptionist?
- *Automated bank reconciliation:* Can you automate bank reconciliation? · What is the difference between manual and automated bank reconciliation? · What are the 5 steps for bank reconciliation? · Can AI do a bank reconciliation?
- *Demand forecasting software:* What is demand forecasting software? · What is the best demand planning software? · What are the four types of demand forecasting? · How to do demand forecasting in Excel?
- *POPIA compliance:* What is the POPI compliance? · How to get POPIA compliance? · What are the key compliance requirements of POPIA? · What are the main 3 principles of the POPI Act?
- *Anomaly detection:* What is meant by anomaly detection? · What does anomaly detected mean? · What does an anomaly detector do? · What is AI anomaly detection?
