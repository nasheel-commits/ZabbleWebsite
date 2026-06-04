# AEO Content Standard — how Zabble pages win the answer

**Owner:** S07 (AEO). **Audience:** anyone writing or reviewing page copy —
especially the content engine (S10/S06). **Status:** active standard.

This is the repeatable pattern for making a Zabble page *extractable* — so an
answer engine (Google featured snippet, People Also Ask, AI Overview / AI Mode,
ChatGPT, Perplexity) can lift a clean, correct, attributable answer from it. It
sits on top of the SEO foundation (S01) and feeds GEO (S08). Read
[`../reference/aeo-geo-principles.md`](../reference/aeo-geo-principles.md) first
for the why; this doc is the how.

> **One rule above all:** *answer the question first, then elaborate.* The first
> 40–60 words of a section are what gets lifted. Everything else is for the
> human who clicked through.

---

## 0. What the SA SERP actually rewards (2026-06 evidence)

From live South-African SERP captures across our priority queries
(`_evidence/07/`, method in [`audits/07-aeo.md`](../audits/07-aeo.md)):

- **AI Overview fires on almost every informational query** we target ("what is
  a bespoke CRM", "what is anomaly detection", "how to automate bank
  reconciliation", …). Winning the answer now means feeding the AI Overview, not
  just a blue link.
- **People Also Ask is present on most of them** — typically 6 questions, and
  they expand. PAA is the most winnable, most concrete answer slot we have.
- **Classic `featured_snippet` / `answer_box` did not appear** on our sampled
  queries. Do not optimise for a snippet box that the SA SERP isn't showing;
  optimise for **PAA + AI Overview**, which the same answer-first shape wins.

Implication: the answer-block + FAQ pattern below is dual-purpose — it targets
PAA (AEO) and makes our claims liftable into AI Overviews (GEO) at the same time.

---

## 1. The answer-block pattern (the core move)

Every money page gets at least one **answer block**: a question-led heading
immediately followed by a self-contained answer.

**Shape:**
1. **Heading = the question**, phrased the way a person actually types or speaks
   it. "What is a bespoke CRM?" not "Our CRM Philosophy".
2. **First paragraph = the answer, 40–60 words**, self-contained. It must make
   sense lifted out of the page with zero surrounding context. Lead with the
   definition/answer in the first sentence.
3. **Then elaborate** — the rest of the page (triptych, demo, pillars) carries
   the detail and the persuasion.

**Worked example (live on `/systems/bespoke-crm`):**

> ### What is a bespoke CRM?
> A bespoke CRM is a customer relationship management system built around how
> your team actually sells — your real pipeline stages, automations, and
> channels — instead of a generic template. Moving a deal between stages
> triggers the right work automatically, and every interaction lands on one
> timeline, so the pipeline reflects what is really happening.

Why it works: first sentence is a complete definition; the answer is 52 words;
it names the entity ("bespoke CRM"), and it's true to how we actually build.

**Word count is a real constraint, not a vibe.** Under ~40 words reads thin and
gets passed over; over ~60 gets truncated mid-thought in the lift. Count them.

---

## 2. Definition blocks

A definition block is an answer block whose question is "What is X?". Use one
wherever a page introduces a term a buyer might search ("anomaly detection",
"reconciliation automation", "regulatory reporting automation").

Rules:
- **First sentence = "X is …"** — a copy-paste-able definition. Models and
  snippet algorithms strongly prefer the `term + is + definition` pattern.
- Define the **category**, then say what Zabble's version does. ("Anomaly
  detection in business is automated monitoring that … Zabble's engine surfaces
  only the cases that matter.")
- One concept per block. Don't define three things in one paragraph.

---

## 3. Lists — for "how to" and "types of" questions

When the question is a process or an enumeration, a **list** is the format that
wins. Match the list type to the question:

| Question shape | Format | Example query (from PAA) |
|---|---|---|
| "How do I / how to …" (sequence) | **Ordered list** `<ol>` — one step per item, step-first | "How do you automate invoice processing?" |
| "What are the types / what can it …" (set) | **Unordered list** `<ul>` — parallel items | "What can a reconciliation engine match?" |

Rules:
- **Lead each item with the action or noun**, not a clause. "Reads the document
  the moment it lands." not "When a document lands, the system reads it."
- Keep items parallel in grammar and length.
- Introduce the list with one sentence that states what it enumerates (the
  intro line is what an engine pairs with the list when lifting it).
- 3–8 items. A 2-item list isn't a list; a 12-item list won't lift whole.

---

## 4. Comparison tables — for "X vs Y" questions

For "bespoke vs off-the-shelf", "X or Y", or any decision-between-two query, a
**table** is the liftable format. AI Overviews frequently reproduce a clean
comparison table verbatim.

Rules:
- Header row + a column per option. Rows are the dimensions that actually decide
  the choice (speed to deploy, fit, cost shape, when it wins).
- Cells are short and symmetrical — same dimension answered for both columns.
- Don't stack the deck dishonestly. A table that admits where off-the-shelf wins
  is *more* citable, not less — and it's true to how we advise. (See the
  off-the-shelf vs bespoke FAQ on `/`.)
- Pair the table with a one-sentence answer above it for the engine that prefers
  prose.

---

## 5. FAQ blocks — the PAA engine

Every money page gets a **FAQ block** of 3–5 question-shaped Q&A pairs, rendered
with `<FaqList>`.

Rules:
- **Source questions from real PAA**, not invention. Pull them from
  `_evidence/07/paa-inventory__aeo-clusters__za.json` (and re-harvest quarterly,
  §8). Re-phrase a commodity PAA into one we can honestly answer — e.g. PAA "Is
  Excel a CRM?" → our "How is a bespoke CRM different from an off-the-shelf CRM?"
- **Each answer is its own 40–60 word answer block** — self-contained, because
  PAA lifts one Q&A at a time, out of context.
- Answer the question in the **first sentence**; don't warm up.
- All answers **visible by default** (not behind a collapsed accordion that
  needs a click). `<FaqList>` renders them open and server-side.
- The exact same Q&A array is handed to S03 for `FAQPage` JSON-LD — on-page text
  and schema must match word-for-word (Google requires it). One source: the
  `faqs` field in `app/data/systems.ts` (per system) / `app/data/site-faqs.ts`
  (home).

---

## 6. Semantic-HTML rules (the foundation AEO rides on)

Extraction is structural. Get the HTML right or the best copy won't be lifted.

- **One `<h1>` per page** (the page/system name, in the hero). Answer-block
  questions are `<h2>`; FAQ questions are within the FAQ section's heading
  hierarchy (`<h2>` "FAQ" → each question a `<dt>`/`<h3>`-level term). Never skip
  levels.
- Use **real semantic elements**: `<section>`, `<article>`, `<ol>`/`<ul>`,
  `<table>`, `<dl>`/`<dt>`/`<dd>` for Q&A. Not a `<div>` soup styled to look like
  them.
- **Content must be in the server-rendered HTML.** Our site is prerendered
  (Nitro) — verify the answer text appears in the static `.output/public/**.html`
  (`grep` for it). Nothing that matters for AEO may be injected by client-only
  JS. Reveal-on-scroll animation is fine (the text is in the SSR DOM; only
  opacity is JS-enhanced) — a click-to-load accordion is not.
- **Don't bury the answer below the fold of the DOM.** Place the primary answer
  block high (right after the hero), so it's early in the document order.
- One question = one place. Don't answer the same question three times across a
  page; it splits the signal.

---

## 7. Voice & accuracy guardrails (Zabble-specific)

AEO copy is still Zabble copy. The bespoke model makes overclaiming both wrong
and risky.

- **No overclaiming.** We build bespoke systems; we don't sell a fixed product
  with guaranteed numbers. Frame outcomes as **representative**: "In a Zabble
  build, intake dropped from ~40 minutes to under four seconds" — not "cuts
  intake to 4 seconds" as a universal promise.
- **Stay true to the model.** Every answer should survive the test: *would we say
  this to a client in a discovery session?* "We sit with the business, find the
  problem costing the most, and build the system that fixes it" is the spine.
- **Declarative and specific.** "Zabble builds bespoke operational systems for
  South African businesses" beats "we improve efficiency". Specific, dated,
  concrete claims are what models cite (GEO) and what reads as true (humans).
- **South Africa is the context**, not a keyword to stuff. Name it where it's
  genuinely relevant (POPIA, SARB, "in South Africa") — don't tack "south
  africa" onto every sentence.
- **No keyword stuffing.** Write the answer a smart human would. If a query
  variant doesn't fit naturally, it goes in a different FAQ, not jammed in.

---

## 8. Quarterly PAA-refresh process (keep it alive)

PAA and AI Overviews drift. Re-harvest every quarter (or when a page's strategy
changes):

1. **Re-run the SERP capture** for each priority query set via
   `serp/google/organic/live/advanced` with `people_also_ask_click_depth: 1`,
   `location_name: "South Africa"`, `language_code: "en"`. Method + script
   pattern: [`audits/07-aeo.md`](../audits/07-aeo.md) §2. Save raw JSON to
   `_evidence/07/` with a new capture date in the filename/sidecar.
2. **Diff against last quarter's `paa-inventory`** — note new questions, dropped
   questions, and any query that newly gained/lost an AI Overview.
3. **Update the `faqs`/`answer` data** for affected pages where we can answer a
   new question honestly. Re-check the 40–60 word budget on any edited answer.
4. **Tell S03** if FAQ Q&A changed, so the `FAQPage` JSON-LD is regenerated to
   match (on-page text and schema must stay identical).
5. **Log the refresh** in `status.md` and bump the date at the top of the
   question inventory in `audits/07-aeo.md`.

Cadence: quarterly. Trigger early if GSC/AI-referral data (S10) shows a page
losing answer presence.

---

## 9. How to ship it (components & data)

The pattern is implemented as data-driven, server-rendered Vue — **filling a new
page is data-only**, no new components.

- **Per system:** add `answer` (an `AnswerBlock`) and `faqs` (a `Faq[]`) to that
  system's entry in the `AEO_CONTENT` map in `app/data/systems.ts`. The detail
  page (`app/pages/systems/[slug].vue`) renders the answer block high and the
  FAQ near the foot automatically when those fields exist.
- **Home / core offering:** edit `HOME_ANSWER` / `HOME_FAQS` in
  `app/data/site-faqs.ts`; `app/components/TheFaq.vue` renders them on `/`.
- **Primitives:** `app/components/AnswerBlock.vue` (question heading + answer)
  and `app/components/FaqList.vue` (visible Q&A list). Reuse them anywhere; don't
  fork them.
- **Checklist before commit:** 40–60 words on every answer · question phrased as
  a user asks it · first sentence answers it · no overclaim · `npm run generate`
  then `grep` the prerendered HTML for the answer text · FAQ data handed to S03.
