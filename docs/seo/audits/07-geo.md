# Audit 07 — GEO — Generative Engine Optimization

- **Session:** 07-geo
- **Branch:** seo/07-geo
- **Owner:** GEO specialist (agent)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (knowledge base + DataForSEO access). Soft: 03 (schema),
  05 (keyword map), 07-aeo (answer shape), 10 (off-page/measurement).
- **Layer(s):** GEO

> Naming note: the original knowledge base maps S07→AEO and S08→GEO. This GEO work
> was commissioned on branch **`seo/07-geo`** and is filed as `audits/07-geo.md`
> alongside the placeholder `audits/08-geo.md`. Cross-session asks below are
> addressed to the **functional owner** in this repo (S01 robots, S03 schema, S06
> content, S10 off-page/measurement), regardless of the commissioning brief's
> numbering.

## 1. Scope

Make Zabble likely to be **cited and recommended by generative engines** — Google
AI Overviews / AI Mode, ChatGPT, Perplexity, Gemini, Copilot, Claude. This audit
owns five things:

1. **`/llms.txt`** (+ `/llms-full.txt`) — a curated, machine-readable map of the
   Zabble entity and its money pages.
2. **A GEO content standard** (§8) — how every key page cites credible sources,
   carries real statistics, includes real practitioner/expert quotes, and uses
   confident low-hedge prose — with applied examples (§9) and a per-page gap list
   (§10).
3. **An entity/brand plan** — the `sameAs` set, a Wikidata plan, and a cross-web
   brand-description standard. Filed separately in
   [`07-geo-entity-plan.md`](07-geo-entity-plan.md).
4. **An AI-crawler policy** — recorded as [ADR-0002](../decisions/0002-ai-crawler-policy.md);
   robots change handed to S01.
5. **AI-citation measurement** — a fixed prompt set, a baseline, and a monthly
   cadence ([`_evidence/07/prompt-set.md`](../_evidence/07/prompt-set.md)).

**Out of scope / hand-offs.** Implementing `Organization`/`sameAs` JSON-LD → **S03**
(I provide the exact object). Editing `robots.txt` → **S01** (I provide the exact
file). Per-page copy edits and FAQ blocks → **S06/S02/S07-aeo** (I provide the
standard + worked examples, not the final page commits). Directory listings, NAP,
GBP, backlinks/PR outreach, and analytics referral tracking → **S10** (I provide
the brand-description standard + a brand-mention target list). Keyword volumes/KD →
**S05**.

## 2. Method

Market **South Africa / `en`**, all live DataForSEO REST calls, captured to
`_evidence/07/` with costs (total ≈ $0.12 for the committed pull; account balance
verified live at $50.88 before work). Endpoints:

- **SERP** `google/organic/live/advanced` (×4 SA category keywords) — detect
  `ai_overview`, `people_also_ask`, `local_pack` presence. `[E: 07/serp-ai-overview__*.json]`
- **AI Optimization** `perplexity/llm_responses/live` (sonar-pro, web search) and
  `chat_gpt/llm_responses/live` (o4-mini, web search) — what the engines actually
  answer and cite for a category prompt and a brand prompt. `[E: 07/llm-response__*.json]`
- **Content Analysis** `summary/live` + `search/live` for the token "zabble" — the
  brand's web-citation footprint and country split. `[E: 07/content-analysis-*__zabble.json]`
- Manual review of the site (`app/data/systems.ts`, pages, `nuxt.config.ts`,
  `public/robots.txt`) for entity signals and schema presence.

The fixed prompt set and the monthly runbook are in
[`_evidence/07/prompt-set.md`](../_evidence/07/prompt-set.md).

## 3. Current state (findings)

| # | Finding | Evidence |
|---|---------|----------|
| **F1** | **Generative engines do not cite Zabble — share-of-voice 0%.** Asked "who builds bespoke business automation / custom operational software in South Africa", **Perplexity** named 13 SA firms and cited 9 sources; **ChatGPT** named ~12 firms and cited 10. **Zabble appears in neither answer and in zero citations.** | `[E: 07/llm-response__pplx-sonarpro__custom-software-za.json]`, `[E: 07/llm-response__chatgpt-o4mini__custom-software-za.json]` |
| **F2** | **The "Zabble" entity is conflated with a different company.** Asked "what is Zabble (zabble.org)?", Perplexity answers about **Zabble, Inc. — a California zero-waste-management SaaS** (zabbleinc.com) and dismisses zabble.org as "a small marketing site". 5 of 8 citations were zabbleinc.com/sbir.gov/zoominfo for the US firm. | `[E: 07/llm-response__pplx-sonarpro__brand-zabble.json]` |
| **F3** | **No South African brand-citation footprint.** Content Analysis finds 400 web citations for "zabble" — country split **US 152, DE 32, WW 32, AU/BZ/CH 8 each; South Africa 0.** Top domains are US/German homonyms (resource-recycling.com, waste360.com, speyer.de). The token is owned by others. | `[E: 07/content-analysis-summary__zabble.json]`, `[E: 07/content-analysis-search__zabble.json]` |
| **F4** | **Google AI Overviews are already live for SA category queries** — present on 3 of 4 tested ("business process automation south africa", "who builds custom business software in south africa", "bespoke crm south africa"); all 4 carry People-Also-Ask. The GEO surface exists today; Zabble is simply absent from it. | `[E: 07/serp-ai-overview__*.json]` |
| **F5 (DRIFT)** | **Citation/AO presence is volatile.** The two engines shared **zero** cited domains. AI-Overview presence on "bespoke crm south africa" flipped between two same-day pulls. → measurement must be a **fixed prompt set on a monthly cadence**, not a one-off. | `[E: 07/prompt-set.md]`, two pull passes |
| **F6** | **No entity infrastructure on-site.** No `Organization` JSON-LD, no `sameAs`, no `sitemap`, `site.url` unset in `nuxt.config.ts`. `robots.txt` is `Disallow:` (allows all — good for GEO, but the posture is accidental, not declared). No `llms.txt` existed. | manual review (`nuxt.config.ts`, `public/robots.txt`) |
| **F7** | **The content is GEO-rich but not GEO-shaped.** `app/data/systems.ts` holds 30 vivid, specific, first-party outcome claims ("intake from ~40 min to under 4 seconds", "ten thousand lines to a handful of exceptions") — exactly the liftable material GEO rewards — but pages carry **no third-party corroboration, no cited sources, no statistics with attribution, and no named quotes**, and headings are not question-shaped. | manual review (`systems.ts`, pages) |
| **F8** | **A ready-made competitor/citation set exists to target.** The engines cite SA listicles and directories that Zabble is absent from — e.g. `co-foundry.co.za/top-business-workflow-automation-companies-in-south-africa`, `elioplus.com` channel-partner directory, `ditstek.com`, `mo.agency`. These are concrete brand-mention/PR targets (→ S10). | `[E: 07/llm-response__pplx-sonarpro__custom-software-za.json]` |

**Baseline scorecard (2026-06-04):** Perplexity category SOV 0/2 · ChatGPT category
SOV 0/2 · Brand-entity correct (not Zabble Inc) **FAIL** on Perplexity · AI-Overview
present on 3/4 SA category keywords · SA brand citations 0.

## 4. Gaps & opportunities

**P0 — the entity must exist and be unambiguous (without this, nothing else lands).**
- **G1.** Zabble is indistinguishable from Zabble, Inc. (US). Until models can tell
  them apart, every citation we earn risks crediting the wrong company. Fix:
  `Organization` schema + `sameAs` + Wikidata + consistent cross-web description
  that always pins **"South African"** and the **bespoke-operational-systems**
  offering, and disambiguates from the US firm. (→ §entity-plan, S03/S10.)
- **G2.** No `llms.txt`, no `sitemap`, `site.url` unset. Fix: ship `llms.txt`
  (done here); S01 sets `site.url` + sitemap.

**P1 — make the content citable.**
- **G3.** Pages have no cited sources, no attributed statistics, no named quotes,
  and non-question headings → low citability. Fix: apply the GEO content standard
  (§8) to the top pages, starting with the home page and the five flagship money
  pages (§9 gap list).
- **G4.** No corroboration across the web — a model sees Zabble's claims in exactly
  one place. Fix: seed consistent boilerplate across profiles/directories (S10) so
  the same facts repeat (the GEO "corroboration" lever).

**P2 — measure, then expand.**
- **G5.** No AI-citation tracking. Fix: the fixed prompt set + monthly cadence
  (shipped here); S10 wires AI referral tracking in analytics.
- **G6.** AI-Overview cited-source capture needs the async AI-summary fetch
  (noted in the runbook) — add once we expect to appear.

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| R1 | P0 | Implement `Organization` JSON-LD with the exact `sameAs` set + disambiguating `description` | `app/composables` schema → **S03** (object in entity-plan §2) | F2, F6 |
| R2 | P0 | Ship `/llms.txt` + `/llms-full.txt` (done on this branch) | `public/llms.txt`, `public/llms-full.txt` | F6 |
| R3 | P0 | Create the Wikidata item + claim/secure consistent profiles (LinkedIn, Crunchbase, GBP, directories) using the brand-description standard | **S10** + owner | entity-plan §3–4 |
| R4 | P0 | Replace `robots.txt` with the GEO-aligned policy; keep AI bots allowed through the pre-launch guard | `public/robots.txt` → **S01** | ADR-0002, F4 |
| R5 | P1 | Apply the GEO content standard (§8) to home + 5 flagship pages: cite ≥1 credible source, add ≥1 attributed statistic (number+source+year), add ≥1 real named quote, question-shape the lead heading | `app/pages/**`, `content/` → **S06/S02/S07-aeo** | F7, §9 |
| R6 | P1 | Get Zabble onto the SA "automation companies" listicles/directories the engines cite | **S10** (target list, entity-plan §5) | F8 |
| R7 | P0 | Set `site.url` + generate `sitemap.xml`; reference it in `robots.txt` | `nuxt.config.ts` → **S01** | F6 |
| R8 | P2 | Stand up monthly AI-citation tracking on the fixed prompt set; wire AI referral analytics | **S10** / GEO | F1, F5, prompt-set.md |

## 6. Cross-session asks

Mirror each into the target session's `status.md` notes (also logged in
`status.md` "Cross-session asks (from S07-geo)").

1. **S01 (Technical, owns `robots.txt` + indexing guard):** replace `public/robots.txt`
   with the file in **ADR-0002**; ensure the pre-launch `noindex` guard does **not**
   block AI crawlers; set `site.url` and emit `sitemap.xml` (R4, R7).
2. **S03 (Schema):** implement the `Organization` JSON-LD + `sameAs` + disambiguating
   `description` in [entity-plan §2](07-geo-entity-plan.md) on every page (R1).
3. **S06 / S02 / S07-aeo (Content / On-page / AEO):** adopt the **GEO content
   standard (§8)** as the editorial bar for money pages; apply the worked examples
   in §9 (R5).
4. **S10 (Off-page, Local, Measurement):** execute the Wikidata + cross-web profile
   plan with the brand-description standard, pursue the brand-mention target list
   (entity-plan §4–5), and wire monthly AI-citation tracking + AI referral
   analytics (R3, R6, R8).
5. **S05 (Keywords):** research SA volume/intent for the GEO question targets in
   `prompt-set.md` §A–B (appended to keyword-map §4).

## 7. Evidence index

See [`_evidence/07/README.md`](../_evidence/07/README.md) for the full table. Files:
- `serp-ai-overview__bpa-za.json` — AI Overview = YES (business process automation SA).
- `serp-ai-overview__custom-software-za.json` — AI Overview = YES.
- `serp-ai-overview__bespoke-crm-za.json` — AI Overview = YES (drifts).
- `serp-ai-overview__automation-company-za.json` — AO = no; local_pack = 3.
- `content-analysis-summary__zabble.json` — 400 citations, **0 South Africa**.
- `content-analysis-search__zabble.json` — top domains are US/DE homonyms.
- `llm-response__pplx-sonarpro__custom-software-za.json` — Perplexity SOV 0%.
- `llm-response__chatgpt-o4mini__custom-software-za.json` — ChatGPT SOV 0%.
- `llm-response__pplx-sonarpro__brand-zabble.json` — entity conflated with Zabble Inc.
- `prompt-set.md` — fixed prompt set + monthly cadence + scorecard.

---

## 8. GEO content standard (the deliverable — hand to S06/S02)

The evidence-based GEO levers (cite credible sources, add expert/practitioner
quotations, add relevant statistics, write fluently and authoritatively) turn a
page from "marketing copy a model skims" into "a source a model lifts and names".
Every **money page** (home, `/systems`, the 30 `/systems/<slug>` pages, `/diagnose`)
must clear this bar before launch.

**Binding rule: accuracy over hype. Never invent a statistic or a quote.** Every
number carries a real source and year; every quote is real and attributed. A
marked placeholder (`[STAT — to source]`, `[QUOTE — to source]`) is acceptable in a
draft; a fabricated figure is not, ever.

### 8.1 The five levers, made checkable

1. **Liftable lead (answer-first).** The first 1–2 sentences under the lead heading
   must be a self-contained, declarative definition a model can quote verbatim with
   no surrounding context. Shape the heading as the question a buyer asks
   ("What is a reconciliation engine?"), then answer it in ≤ 40 words, then
   elaborate. *(This is the AEO/GEO hinge — coordinate with S07-aeo.)*
2. **Cite credible sources.** Each money page links ≥ 1 reputable third-party source
   that corroborates the problem or category (e.g. a recognised research/industry
   body, a regulator, a standards source). Sources are named inline ("according to
   X, 2025") and linked. No source = no claim of fact.
3. **Statistics (number + source + year).** Include ≥ 1 attributed statistic that
   frames the cost of the problem or the size of the opportunity. Two legitimate
   kinds: **first-party** (Zabble's own measured outcomes — fully citable as
   "Zabble reports…", drawn from `systems.ts` case copy) and **third-party** (a
   sourced external figure, verified before publish). Format: *"<number> — <source>,
   <year>"*.
4. **Expert / practitioner quotes.** Include ≥ 1 real, attributed quote — a named
   Zabble practitioner (founder/engineer who actually built it) or a named external
   expert. The quote must add a claim or judgement, not restate the body. Attribute
   with name + role. Never synthesise a quote.
5. **Confident, low-hedge prose.** Declarative and active (brand voice §3.5: "We
   build the system that solves it", not "A system could potentially help"). Strip
   hedges ("might", "may help", "in some cases", "we believe"). Specific beats
   abstract ("from a fortnight to hours", not "improves efficiency"). Structured
   facts — definition, ordered steps, comparison tables, a one-line module
   definition — give models clean extractable statements.

### 8.2 Per-page GEO checklist (paste into each brief)
- [ ] Lead heading is the buyer's question; answered in ≤ 40 words, declarative.
- [ ] A self-contained one-sentence definition of the system exists verbatim on page.
- [ ] ≥ 1 credible third-party source cited inline and linked.
- [ ] ≥ 1 statistic as *number + source + year* (first- or third-party).
- [ ] ≥ 1 real, named quote (Zabble practitioner or external expert).
- [ ] Hedges removed; voice declarative/active; outcomes specific and dated.
- [ ] Structured facts present (definition / steps / table) for clean extraction.
- [ ] Entity consistent: "Zabble", "South African", offering wording matches the
      boilerplate (entity-plan §1) and `Organization` schema.
- [ ] `FAQPage` block (S03) covers the page's top People-Also-Ask questions.

## 9. Applied examples (top pages)

Worked rewrites showing the standard. First-party stats are real (from `systems.ts`
case copy). Third-party stats and quotes are shown as **clearly-marked placeholders
the writer must fill with a real, sourced figure/quote** — never invented here.

### 9.1 Home (`/`)
- **Lead heading (question-shaped):** *"Who builds custom business systems in South
  Africa?"*
- **Liftable answer (≤ 40 words):** "Zabble is a South African consulting firm that
  builds bespoke operational systems — automation, audit trails, anomaly detection,
  and analytics — shaped around the single problem slowing one business down. It
  does not sell off-the-shelf software."
- **Statistic (third-party — to source):** `[STAT — to source: a reputable figure
  on SA SME process-automation adoption or the cost of manual processes; cite
  body + year]`.
- **Quote (real, attributed):** `[QUOTE — Zabble founder/lead, name + role: one
  sentence on the "one problem costing the most" method]`.
- **Source cited:** `[link a recognised research/industry source on bespoke vs
  off-the-shelf software]`.

### 9.2 `/systems/reconciliation-engine`
- **Heading:** *"What is reconciliation automation?"*
- **Answer:** "A reconciliation engine ingests every ledger as it lands — POS, bank,
  accounting, processor, inventory — auto-matches what it can, and surfaces only the
  mismatches that need a human."
- **First-party statistic (real):** "Zabble reports a reconciliation queue dropping
  from ten thousand lines to a handful of real exceptions." (source: Zabble build,
  `systems.ts`).
- **Source / quote:** `[link a finance-ops authority on reconciliation effort]`;
  `[QUOTE — Zabble engineer who built it, name + role]`.

### 9.3 `/systems/document-intelligence`
- **Heading:** *"What is a document intelligence system?"*
- **Answer:** "It reads each inbound document the moment it lands, extracts and
  validates the fields, and routes it — leaving humans only the exceptions."
- **First-party statistic (real):** "Zabble reports intake time falling from ~40
  minutes per document to under 4 seconds." (source: Zabble build, `systems.ts`).
- **Source / quote:** `[link an OCR/IDP accuracy or document-processing-cost source,
  year]`; `[QUOTE — practitioner, name + role]`.

### 9.4 `/systems/continuous-assurance`
- **Heading:** *"How do you catch fraud or anomalies in a stream of transactions?"*
- **Answer:** "A continuous assurance engine monitors the live stream — card
  transactions, CRM events, sensor telemetry — and surfaces only the cases that
  matter, each with its rule, history, and suggested action."
- **Statistic:** "Zabble reports mean time to detection dropping from days to
  seconds." (first-party). Pair with `[STAT — to source: a fraud/anomaly cost
  figure, e.g. occupational-fraud loss; cite body + year]`.

### 9.5 `/systems/compliance-reporting`
- **Heading:** *"How do you automate regulatory and donor reporting?"*
- **Answer:** "A compliance reporting engine knows which systems each submission
  draws from, pulls and validates the data against the regulator's rule pack, and
  traces every figure back to its source row."
- **Local entity hook:** name the SA context (SARB returns, POPIA filings) as the
  page already does — concrete, local, citable. Pair with `[STAT — to source:
  POPIA penalty ceiling or SA compliance-cost figure; cite the Act/regulator + year]`.

## 10. Gap list (per-page GEO state → target)

Top pages, current GEO state vs the §8 standard. P0 pages first.

| Page | Question heading | Liftable answer | Source cited | Stat (num+src+yr) | Named quote | Low-hedge | Priority |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/` (home) | ✗ | partial | ✗ | ✗ | ✗ | ~ | **P0** |
| `/systems` (gallery) | ✗ | ✓ (taglines) | ✗ | ✗ | ✗ | ✓ | P1 |
| `/systems/reconciliation-engine` | ✗ | ✓ | ✗ | first-party only | ✗ | ✓ | **P0** |
| `/systems/document-intelligence` | ✗ | ✓ | ✗ | first-party only | ✗ | ✓ | **P0** |
| `/systems/continuous-assurance` | ✗ | ✓ | ✗ | first-party only | ✗ | ✓ | **P0** |
| `/systems/compliance-reporting` | ✗ | ✓ | ✗ | first-party only | ✗ | ✓ | **P0** |
| `/systems/bespoke-crm` | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | **P0** |
| `/diagnose` | ~ (is a Q-flow) | ✗ | ✗ | ✗ | ✗ | ✓ | P1 |
| other 25 `/systems/<slug>` | ✗ | ✓ | ✗ | mixed | ✗ | ✓ | P2 |

Legend: ✓ meets standard · ~ partial · ✗ missing · "first-party only" = has a real
Zabble outcome stat but no third-party corroboration or attribution.

**Reading:** the raw material is strong (liftable answers and first-party stats
already exist in `systems.ts`), but **0 of the top pages cite a source, carry an
attributed third-party statistic, a named quote, or a question-shaped heading.**
That gap — plus the unresolved entity collision (F2/F3) — is why GEO share-of-voice
is 0%.
