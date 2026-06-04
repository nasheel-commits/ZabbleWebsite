# Audit 07 — AEO — Answer Engine Optimization

- **Session:** 07
- **Branch:** seo/07-aeo
- **Owner:** AEO specialist (agent)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (foundation/access ✓), 03 (schema — hand-off, see §6), 05
  (keyword map — used the AEO seed sets; full volumes still pending)
- **Layer(s):** AEO (feeds GEO / S08)

> **Numbering note.** The goal brief used a loose scheme (it called Architecture
> "S5", Schema/JSON-LD "S8", Content "S10", and this session "06"). The repo's
> **binding** convention (`00-conventions.md` §1) fixes AEO as **session 07 /
> branch `seo/07-aeo`**, with 06 owned by Content. This audit follows the repo
> convention to avoid colliding with S06=Content. Mapping: brief "S5"→repo S04
> (Architecture), brief "S8"→repo **S03** (Schema/JSON-LD), brief "S10"→repo S06
> (Content). Worked in an isolated **git worktree** because the shared checkout
> is branch-thrashed by parallel sessions.

## 1. Scope

**Covers:** making Zabble's money pages extractable into answer surfaces —
featured snippets, People Also Ask (PAA), and Google AI Overviews / AI Mode — via
(a) a reusable **AEO content standard** the content engine reuses, (b) a
**question inventory** mapped query→page→slot→format from SA SERP data, (c)
reusable **answer-block + FAQ components** rendering server-side, and (d)
**populated answer-first blocks + FAQs** on the top-priority pages in Zabble's
voice.

**Explicitly out of scope / hand-offs:**
- **JSON-LD (`FAQPage`/`QAPage`, `Organization`) → S03.** This audit produces the
  FAQ data and *requests* the schema; it does not implement JSON-LD (§6).
- **Keyword volumes/KD → S05.** Used S05's AEO seed sets and added live SERP
  slot data; did not run the full volume/difficulty pass.
- **GEO citation/AI-Overview tracking → S08.** Flagged the AI-Overview ubiquity;
  S08 owns measuring who gets cited.
- **Local pack / GBP → S10.** Two service queries surfaced a local pack.
- **Deeper article copy & page-structure coordination → S06 (content) / S04
  (architecture).** This audit owns the answer-shape; long-form copy is S06's.
- **Per-page `useSeoMeta`/canonical → S02.** Untouched.

## 2. Method

**SERP slot data (live, South Africa).** `POST
/v3/serp/google/organic/live/advanced`, **one keyword per call** (the live
endpoint rejects multi-task bodies), `location_name: "South Africa"`,
`language_code: "en"`, `depth: 10`, `people_also_ask_click_depth: 1`. Read
`tasks[0].result[0].items[].type` for `featured_snippet` / `answer_box` /
`people_also_ask` / `ai_overview`, and extracted PAA question titles. 12 priority
queries; total live cost **$0.02535** (`response.cost` per file).

**Access caveat (reproducibility).** The running session's DataForSEO **MCP
server was unauthenticated (401)** — the documented gotcha that creds load only
at Claude Code launch (`status.md`). Calls were made via `curl` with `.env`
credentials (access doc §3 fallback), hitting the identical live endpoint the
MCP tool wraps. No secret was printed or committed.

**Inputs read:** `Zabble-Business-and-Modules-Overview.md` (voice + factual
ground truth for every answer), `reference/aeo-geo-principles.md`,
`00-conventions.md`, `targets/keyword-map.md` (AEO seed sets), `app/data/systems.ts`
(32 systems), the system + home page templates.

**Evidence:** all raw JSON + the extracted `paa-inventory` + sidecar note under
`_evidence/07/` (§7).

## 3. Current state (findings)

### 3.1 The SA answer surface for our terms = PAA + AI Overview (not snippet box)

Across 12 priority queries `[E: 07/paa-inventory__aeo-clusters__za.json,
07/serp-advanced__*__za.json]`:

| Signal | Result |
|---|---|
| `ai_overview` present | **10 / 12** queries |
| `people_also_ask` present | **9 / 12** queries (~6 questions each) |
| classic `featured_snippet` / `answer_box` | **0 / 12** |
| `local_pack` (on "…south africa" service queries) | 2 / 12 |

**Reading:** there is no snippet box to win on these terms — the winnable,
machine-liftable slots are **PAA** (answer with question-shaped Q&A) and the **AI
Overview** (answer with self-contained, declarative claims). The same
answer-first shape serves both, and the AI-Overview lift is also a GEO signal
(S08). Two service queries are local-pack territory (S10/S08).

### 3.2 Baseline: the site had zero answer-first / FAQ structure

Before this session, no page carried a question-led heading, a self-contained
definition, or an FAQ block. Pages led with brand-voice taglines (e.g.
`/systems/bespoke-crm` opened on a tagline, never the words "A bespoke CRM
is…"). Nothing was eligible for PAA, and AI Overviews had no liftable, declarative
Zabble claim to cite. **Answer-slot ownership baseline = 0 pages.**

### 3.3 PAA questions are a mix of ownable and commodity

Real PAA (sample): "What is a bespoke CRM?", "How much does a bespoke CRM cost?",
"Can bank reconciliation be automated?", "What is AI anomaly detection?", "How do
you automate invoice processing?" — directly ownable. Others are commodity/
competitor-shaped ("Is Excel a CRM?", "Which CRM is most used?") — **re-phrased**
into honest Zabble questions rather than answered literally (per the standard).

### 3.4 Delivered this session

- **AEO content standard** authored for reuse: `content/aeo-standard.md`
  (answer-block pattern, definition blocks, lists, comparison tables, FAQ rules,
  semantic-HTML rules, voice/accuracy guardrails, quarterly PAA-refresh process,
  ship checklist).
- **Reusable components** (server-rendered, verified in prerendered HTML):
  `app/components/AnswerBlock.vue`, `app/components/FaqList.vue`, and
  `app/components/TheFaq.vue` (home wrapper).
- **Data-driven content** on **8 top pages**: home (`HOME_ANSWER`/`HOME_FAQS` in
  `app/data/site-faqs.ts`) + 7 systems (`AEO_CONTENT` map in `app/data/systems.ts`):
  bespoke-crm, document-intelligence, reconciliation-engine, continuous-assurance,
  compliance-reporting, kairos, workflow-orchestrator. Each: one answer block
  (40–60 words) + 3–4 PAA-shaped FAQs.
- **SSR verified:** `npm run generate` → 68 routes, exit 0, no new warnings; the
  answer/FAQ text is present in `.output/public/**/index.html` (grep-confirmed on
  home + all 7 systems). **Answer-slot-ready baseline = 8 pages.**

## 3.5 Question inventory (query → page → snippet type → on-page format)

Targets are South Africa. "Slot today" from live SERP `[E: 07/serp-advanced__*]`.
"Format" = the on-page shape that wins it (per `content/aeo-standard.md`).
Status: ✅ shipped this session · ⬜ backlog (data-only fill).

| Query (SA) | Target page | Slot to target | On-page format | Status |
|---|---|---|---|---|
| what is a bespoke crm | `/systems/bespoke-crm` | PAA + AI Overview | Definition answer block ("What is a bespoke CRM?") | ✅ |
| how is bespoke crm different from off-the-shelf | `/systems/bespoke-crm` | PAA | FAQ Q&A | ✅ |
| how much does a bespoke crm cost | `/systems/bespoke-crm` | PAA | FAQ Q&A | ✅ |
| document automation south africa | `/systems/document-intelligence` | PAA + AI Overview | Definition answer block + FAQ | ✅ |
| what is document automation | `/systems/document-intelligence` | PAA | FAQ Q&A | ✅ |
| how to automate invoice processing | `/systems/document-intelligence` | PAA + AI Overview | **Ordered-list** how-to block (backlog) + FAQ ✅ | ✅ FAQ / ⬜ list |
| how to automate bank reconciliation | `/systems/reconciliation-engine` | PAA + AI Overview | Definition answer block + FAQ | ✅ |
| can bank reconciliation be automated | `/systems/reconciliation-engine` | PAA | FAQ Q&A | ✅ |
| what is reconciliation in accounting | `/systems/reconciliation-engine` | PAA + AI Overview | Definition / FAQ | ✅ (FAQ "what ledgers…") |
| what is anomaly detection | `/systems/continuous-assurance` | PAA + AI Overview | Definition answer block | ✅ |
| what is AI anomaly detection | `/systems/continuous-assurance` | PAA | FAQ Q&A | ✅ |
| what is workflow automation | `/systems/workflow-orchestrator` | PAA + AI Overview | Definition answer block | ✅ |
| what is an example of workflow automation | `/systems/workflow-orchestrator` | PAA | FAQ Q&A | ✅ |
| regulatory reporting software south africa | `/systems/compliance-reporting` | AI Overview | Definition answer block + FAQ (POPIA/SARB) | ✅ |
| what is an AI receptionist / voice agent | `/systems/kairos` | AI Overview (informational) | Definition answer block + FAQ | ✅ |
| what does Zabble do | `/` | AI Overview / brand | Definition answer block | ✅ |
| who builds custom software in south africa | `/` | PAA + local_pack | FAQ Q&A + local (S10) | ✅ copy / ⬜ local |
| bespoke vs off-the-shelf software | `/` | AI Overview | **Comparison table** (backlog) + FAQ ✅ | ✅ FAQ / ⬜ table |
| how much does a bespoke business system cost | `/` | PAA | FAQ Q&A | ✅ |
| custom software development south africa | `/` | AI Overview + local_pack | Entity + local (S08/S10) | ⬜ |
| how do I know which system my business needs | `/diagnose` | informational | Answer-block intro (backlog) | ⬜ |
| _remaining 24 systems_ | `/systems/<slug>` | PAA + AI Overview (assumed; verify at fill) | Definition answer block + 3–5 FAQs | ⬜ |

## 4. Gaps & opportunities (prioritised)

| Pri | Gap | Why it matters | Action / owner |
|---|---|---|---|
| **P0** | **FAQ/answer JSON-LD not emitted** | On-page FAQs are eligible for PAA/FAQ results, but `FAQPage` schema materially lifts eligibility and is GEO entity signal. Data is ready and exposed. | **S03** — attach `FAQPage` from `system.faqs` / `HOME_FAQS` (§6). |
| **P0** | **24 / 31 system pages still have no answer block or FAQ** | Each is a money page with an informational query that shows PAA + AI Overview. Components are live; filling is **data-only**. | **S07→S06**: author `AEO_CONTENT` for the rest, one cluster at a time. Brief: `content/aeo-standard.md`. |
| **P1** | **AI Overview ubiquity unmeasured** | 10/12 queries show an AI Overview; we don't yet know who it cites or whether Zabble appears. | **S08** — `AI_OPTIMIZATION` + SERP `ai_overview` citation tracking on the priority queries. |
| **P1** | **No comparison table for "bespoke vs off-the-shelf"** | A high-intent decision query; tables lift whole into AI Overviews. Currently answered only as an FAQ paragraph on `/`. | **S07/S06** — add a comparison-table block (standard §4) on `/` or a `/bespoke-vs-off-the-shelf` asset. |
| **P1** | **Local pack on "…south africa" service queries** | `custom software development south africa` / `who builds custom software…` surface a local_pack we can't win with copy alone. | **S10** (GBP/local) + **S08** (entity). |
| **P1** | **Keyword volumes/KD still TBD** for the AEO question set | Prioritisation of the next pages is by judgement, not volume. | **S05** — see request appended to `targets/keyword-map.md` §4. |
| **P2** | **No "how-to" ordered-list blocks yet** | "How to automate invoice processing / bank reconciliation" reward an ordered-list format we haven't built on-page. | **S07/S06** — add ordered-list answer blocks on document-intelligence & reconciliation-engine. |
| **P2** | **`/diagnose` is an unexploited AEO asset** | It's literally a question flow; its copy can target "how do I know which system my business needs?". | **S07/S06** — shape `/diagnose` intro copy as an answer block. |
| **P2** | **Quarterly PAA refresh not yet scheduled** | PAA/AIO drift; today's inventory dates. | **S07** — process documented (standard §8); first refresh due **2026-09**. |

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| 1 | P0 | Emit `FAQPage` JSON-LD from `system.faqs` (systems pages) and `HOME_FAQS` (`/`), text identical to on-page | `app/` schema composable — **S03** | `_evidence/07/paa-inventory…json` |
| 2 | P0 | Populate `AEO_CONTENT` for the remaining 24 systems (one answer block + 3–5 FAQs each), to the standard | `app/data/systems.ts` — **S07→S06** | `content/aeo-standard.md` |
| 3 | P1 | Track AI-Overview citations for the 12 priority queries; report if Zabble is cited | **S08** | `_evidence/07/serp-advanced__*` |
| 4 | P1 | Add a "bespoke vs off-the-shelf software" comparison-table block | `/` or new page — **S07/S06** | standard §4 |
| 5 | P1 | Research SA volume/KD for the AEO question set to re-rank the page backlog | `targets/keyword-map.md` — **S05** | keyword-map §4 request |
| 6 | P1 | Win/measure the local pack on SA service queries | **S10** + **S08** | `serp-advanced__home-*__za.json` |
| 7 | P2 | Add ordered-list "how-to" answer blocks (invoice processing, bank reconciliation) | `app/` — **S07/S06** | PAA "how do you automate…" |
| 8 | P2 | Shape `/diagnose` intro as an answer block | `app/pages/diagnose.vue` — **S07/S06/S04** | standard §1 |
| 9 | P2 | Run the quarterly PAA refresh (first: 2026-09) | **S07** | standard §8 |

## 6. Cross-session asks

Mirrored into each target session's `status.md` notes.

- **→ S03 (Schema/JSON-LD) — P0.** Attach `FAQPage` JSON-LD on system pages and
  `/`, sourced from `system.faqs` (in `app/data/systems.ts`) and `HOME_FAQS` (in
  `app/data/site-faqs.ts`). The `Faq`/`AnswerBlock` types are exported from
  `app/data/systems.ts`. **On-page text and schema must be byte-identical** —
  read from the same data, don't re-write. Consider `QAPage` for the answer
  block.
- **→ S05 (Keywords) — P1.** Need SA search volume + KD for the AEO question set
  (request appended to `targets/keyword-map.md` §4) to re-rank the page backlog.
- **→ S08 (GEO) — P1.** AI Overview present on 10/12 priority queries; please run
  citation/mention tracking and tell us which pages need stronger entity claims.
- **→ S06 (Content) — P1.** Author `AEO_CONTENT` for the remaining 24 systems
  using `content/aeo-standard.md`; coordinate long-form copy with the answer-first
  shape.
- **→ S04 (Architecture) — P2.** Answer block sits directly under the hero and
  FAQ above the CTA on `/systems/[slug]`; please keep that order if the page
  template is restructured. `/diagnose` is an AEO asset (rec #8).
- **→ S02 (On-page) — FYI.** Added page sections (no `useSeoMeta` changes).

## 7. Evidence index

Files under `_evidence/07/`:

- `serp-advanced__bespoke-crm__za.json` — "what is a bespoke crm": ai_overview + PAA(6). Proves the bespoke-crm answer slot.
- `serp-advanced__crm-system__za.json` — "what is a crm system": ai_overview + PAA(6). Broader CRM definitional intent.
- `serp-advanced__document-intelligence__za.json` — "document automation south africa": ai_overview + PAA(6).
- `serp-advanced__invoice-processing__za.json` — "how to automate invoice processing": ai_overview + PAA(6) (how-to).
- `serp-advanced__reconciliation-engine__za.json` — "how to automate bank reconciliation": ai_overview + PAA(6).
- `serp-advanced__reconciliation-accounting__za.json` — "what is reconciliation in accounting": ai_overview + PAA(6).
- `serp-advanced__continuous-assurance__za.json` — "what is anomaly detection": ai_overview + PAA(6).
- `serp-advanced__workflow-automation__za.json` — "what is workflow automation": ai_overview + PAA(6).
- `serp-advanced__compliance-reporting__za.json` — "regulatory reporting software south africa": ai_overview, no PAA.
- `serp-advanced__business-automation__za.json` — "business process automation south africa": no AIO/PAA (knowledge_graph + reviews).
- `serp-advanced__home-custom-software__za.json` — "custom software development south africa": ai_overview + local_pack.
- `serp-advanced__home-who-builds__za.json` — "who builds custom software in south africa": local_pack + PAA(6).
- `paa-inventory__aeo-clusters__za.json` — extracted PAA questions + slot flags per query (the question-inventory source).
- `serp-advanced__aeo-clusters__za.note.md` — endpoint, request, mode (live), total cost ($0.02535), and what we read.
