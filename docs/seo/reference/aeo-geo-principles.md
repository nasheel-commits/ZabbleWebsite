# Reference — SEO vs AEO vs GEO principles

The three layers, what each one actually demands, and how they apply to Zabble
specifically. Read this before S07 (AEO) or S08 (GEO). The governing idea from
the README: **three additive layers on one foundation.** You don't choose between
them — you build the foundation, then stack relevance (SEO), then answer-shape
(AEO), then citability (GEO).

---

## 1. The three layers at a glance

| | **SEO** | **AEO** | **GEO** |
|---|---|---|---|
| Question it answers | "Do we rank?" | "Do we *become* the answer?" | "Do AI engines *cite* us?" |
| Surface | Blue links in Google/Bing | Featured snippet, People-Also-Ask, FAQ rich result, voice answer | AI Overviews, ChatGPT, Gemini, Perplexity, Copilot |
| Unit of victory | Position on the SERP | Owning the answer box / PAA slot | Being named/quoted in a generated answer |
| What wins it | Relevance + authority + intent match | Concise, question-shaped, well-structured answers + schema | Clear entities, corroborated facts, quotable claims, presence across the web |
| How you measure it | Rankings, clicks, impressions (GSC) | SERP-feature ownership, PAA presence, voice | Citation/mention tracking, AI-Overview presence, referral traffic from AI |
| Zabble DataForSEO tools | `SERP`, `DATAFORSEO_LABS` | `SERP` (`item_types`), schema | `AI_OPTIMIZATION`, `CONTENT_ANALYSIS`, SERP `ai_overview` |

They share one foundation: crawlable, fast, semantic HTML with structured data
and measurement. Get that wrong and **all three** fail at once.

---

## 2. SEO — be found in ranked results

Still the base layer; AEO/GEO ride on the same signals. What it demands:

- **Crawlable, render-complete HTML.** Our site is statically prerendered
  (Nitro) — good: crawlers get full HTML, not an empty shell. S01 verifies every
  route prerenders with content.
- **Intent-matched pages.** Each Zabble system page should target the intent its
  buyers actually search (S05 maps this). A page about "Reconciliation Engine"
  should rank for how a SA finance lead phrases the pain ("automate bank
  reconciliation", "POS vs bank reconciliation software"), not just our product
  name.
- **On-page relevance.** Title, H1, headings, body, internal anchors aligned to
  the target keyword and its variants (S02).
- **Authority.** Internal linking (S04) + external links/mentions (S10).
- **No technical leaks.** Correct canonicals, no duplicate content across the 30
  system pages, clean status codes, indexable (S01).

Zabble reality: we're pre-launch with ~30 near-identical-structured system pages.
The biggest SEO risk is **thin/duplicate content** across those pages — each
needs genuinely distinct, intent-bearing copy, or they'll cannibalise each other.

---

## 3. AEO — become the answer

Answer Engine Optimization = winning the slots that answer the query *without a
click into a ranked list*: featured snippets, People-Also-Ask, FAQ rich results,
and voice answers.

What it demands:
- **Question-shaped content.** Phrase a heading as the question the user asks,
  then answer it in the first 40–60 words, concisely, before elaborating. The
  answer box is lifted from exactly this shape.
- **Structure the answer.** Definitions, ordered steps, and comparison tables win
  snippet types: a paragraph snippet for "what is X", a numbered-list snippet for
  "how to X", a table snippet for "X vs Y".
- **FAQ blocks with `FAQPage` schema** (S03) on money pages — directly eligible
  for FAQ rich results and feeds PAA.
- **Match the real question.** Use SERP `live/advanced` (`item_types`) to see
  which Zabble-relevant queries actually *have* a featured snippet or PAA to win
  — only then is there a slot to target.

Zabble application:
- On `/systems/document-intelligence`, add an answerable heading:
  *"What is a document intelligence system?"* → a 1–2 sentence definition first,
  then detail. Pair with FAQ schema (*"How accurate is automated document
  extraction?"*, *"Does it work with handwritten forms?"*).
- The `/diagnose` page is an AEO asset: it's literally a question flow. Shape its
  copy around the questions SA operators ask ("how do I know which system my
  business needs?").
- Voice/conversational: SA buyers asking "who builds custom business software in
  South Africa" — answerable, local, and a slot we can own with concise copy +
  `LocalBusiness`/`Organization` schema.

AEO is mostly **content shape + schema** on top of the SEO foundation. Little new
infrastructure; a lot of editorial discipline (S06/S07).

---

## 4. GEO — be cited by generative engines

Generative Engine Optimization = being the source an AI answer *uses and names*:
Google AI Overviews, ChatGPT, Gemini, Perplexity, Copilot. The user may never see
a SERP at all — they see a synthesized answer, and the win is being **in** it.

What it demands (this is where GEO diverges from SEO):
- **Strong, unambiguous entities.** Models reason about *things*, not just pages.
  "Zabble" must be a well-defined entity: a South African firm that builds
  bespoke operational systems, with consistent name, description, location, and
  offerings everywhere it appears. `Organization` schema with `sameAs` links,
  consistent NAP, and a crisp boilerplate description are GEO infrastructure (S03,
  S08).
- **Corroboration across sources.** Models trust facts that appear consistently
  across multiple independent places. One claim on one site is weak; the same
  claim echoed across our site, a directory, a profile, a press mention is
  citable. S10 (off-page) and S08 (GEO) coordinate here.
- **Quotable, self-contained claims.** Write sentences a model can lift verbatim:
  *"Zabble builds bespoke operational systems — automation, audit trails, anomaly
  detection, and analytics — for South African businesses."* Declarative,
  complete, attributable. Avoid claims that only make sense with surrounding
  context.
- **Structured facts.** Lists, tables, definitions, and schema give models
  clean, extractable statements (e.g. the 30 modules as a structured list with a
  one-line definition each).
- **Freshness & specificity.** Concrete, specific, dated claims beat vague
  marketing. "Cut month-end close from a fortnight to hours" is more citable than
  "improves efficiency".

What it demands of *measurement*: you can't use GSC for GEO. Use
`AI_OPTIMIZATION` (what models answer + cite for a prompt), `CONTENT_ANALYSIS`
(brand mentions + sentiment), and SERP `ai_overview` presence. Track referral
traffic from AI engines in analytics (S10/measurement doc).

Zabble application:
- Make each of the 30 modules an extractable, self-contained definition (a
  module = an entity with a name, a one-line "what it is", a problem it solves, a
  pillar set). This is gold for GEO: ask an AI "what system catches fraud in
  transactions" and the Continuous Assurance Engine description should be the
  liftable answer.
- Establish the "Zabble" entity hard: `Organization` + `sameAs` (LinkedIn, any
  directories), consistent description, South Africa location.
- Seed corroboration: consistent boilerplate across site + profiles so the same
  facts repeat (S10).

---

## 5. How they stack on Zabble's pages (worked)

Take one money page, `/systems/reconciliation-engine`:

- **Foundation:** prerendered HTML, fast, `Service`/`Product`-style schema, clean
  canonical, in the sitemap, internally linked from `/systems`.
- **SEO:** title/H1/body target "automated reconciliation South Africa" +
  variants (from S05); distinct copy (not boilerplate shared with other modules);
  ranks for the pain, not just the product name.
- **AEO:** a *"What is reconciliation automation?"* heading answered in 2
  sentences; an FAQ block (*"Does it work with my POS and bank feed?"*) with
  `FAQPage` schema → eligible for snippet/PAA.
- **GEO:** a self-contained, quotable definition of the Reconciliation Engine as
  an entity; consistent with how it's described in `app/data/systems.ts` and any
  external profile; specific outcome claims ("ten thousand lines to a handful of
  exceptions") a model can cite.

One page, one foundation, three layers — each addition cheap once the base is
right.

---

## 6. Principles to keep (the short list)

1. **Foundation first.** Crawlable + fast + structured, or nothing else lands.
2. **Answer the question, then elaborate.** First 1–2 sentences carry the AEO/GEO
   value.
3. **Be an entity, not just a page.** Consistent name/description/location +
   `Organization`/`sameAs` schema is GEO infrastructure.
4. **Write liftable, specific, declarative claims.** Vague marketing is not
   citable.
5. **Distinct content per module.** 30 thin near-duplicates is the #1 risk.
6. **Measure each layer with its own tool.** GSC for SEO/AEO presence;
   `AI_OPTIMIZATION`/`CONTENT_ANALYSIS` for GEO.
7. **South Africa is the context.** Local entity, local phrasing, local intent.

## 7. Sources / further reading
- Google Search Central — featured snippets & structured data guidance: https://developers.google.com/search/docs
- Schema.org vocabulary: https://schema.org
- DataForSEO AI Optimization API (GEO data): https://docs.dataforseo.com
- Cross-references: [`nuxt-seo-implementation.md`](nuxt-seo-implementation.md),
  [`measurement-indexing.md`](measurement-indexing.md).
