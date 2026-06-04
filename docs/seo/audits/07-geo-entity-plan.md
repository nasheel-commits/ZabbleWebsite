# Entity & Brand Plan — Zabble (GEO)

- **Session:** 07-geo · **Branch:** seo/07-geo · **Date:** 2026-06-04 · **Status:** done
- **Companion to:** [`07-geo.md`](07-geo.md). Addresses goal deliverable #3.

**Why this exists.** Baseline `[E: 07/llm-response__pplx-sonarpro__brand-zabble.json]`:
generative engines think "Zabble" is **Zabble, Inc.**, a California zero-waste SaaS
(zabbleinc.com), and dismiss zabble.org as "a small marketing site". Content
Analysis finds **0** South-African citations for the brand token
`[E: 07/content-analysis-summary__zabble.json]`. Models reason about *entities*, not
pages — so the first GEO job is to make **Zabble (SA)** a distinct, well-described,
corroborated entity. This plan is the blueprint; implementation is S03 (schema) and
S10 (off-page/profiles), coordinated here.

---

## 1. Cross-web brand-description standard (the boilerplate)

One description, three lengths, **used verbatim everywhere** — site, schema, every
profile, every directory, every press mention. Consistency is the corroboration
signal models trust. Every version pins **"South African"** and the **offering**,
and (where space allows) disambiguates from the US firm.

**A — Micro (≤ 160 chars, meta/description, directory tagline):**
> Zabble is a South African firm that builds bespoke operational systems —
> automation, audit trails, anomaly detection, and analytics.

**B — Standard (~50 words, LinkedIn/Crunchbase/about):**
> Zabble is a South African consulting firm that builds bespoke operational systems
> — automation, audit trails, anomaly detection, and analytics — shaped around the
> single problem slowing one specific business down. Zabble does not sell
> off-the-shelf software; it assembles a library of 30 modules into one operating
> system, built for one business and no other.

**C — Long (~90 words, with disambiguation, for Wikidata sources / press kit):**
> Zabble is a consulting firm based in South Africa that designs and builds bespoke
> operational systems — automation, audit trails, anomaly detection, and analytics —
> shaped around the single operational problem costing a specific business the most.
> Rather than selling off-the-shelf software, Zabble assembles a library of 30
> modules into one operating system built for one business and no other. It has
> worked across NGOs, banks, hotels, law firms, parts suppliers, and agencies.
> (Zabble is unrelated to Zabble, Inc., the US waste-management software company.)

**NAP (Name-Address-Phone), kept identical everywhere:**
- **Name:** `Zabble` (never "Zabble Inc", never "Zabble Pty Ltd" unless that is the
  registered legal name — S10 to confirm the registered entity and then use it
  consistently).
- **Location:** South Africa. *(Add city + registered address once available — S10.)*
- **Contact:** `analytics@zabble.org`. *(Add a public phone once available — S10;
  NAP consistency matters for the local-pack signal seen in `[E:
  07/serp-ai-overview__automation-company-za.json]`.)*
- **Website:** `https://zabble.org`.

---

## 2. `Organization` schema + `sameAs` (IMPLEMENTED — S03 to extend)

> **Status: implemented on `seo/07-geo`.** The canonical entity now lives in
> `app/data/organization.ts` and is emitted site-wide as `Organization` JSON-LD via
> `app/app.vue` (`organizationJsonLd()`), including `disambiguatingDescription`. The
> `npm run test:geo` suite asserts the different-from/sameAs data is present.
> **S03 should consume `organization.ts` (not redeclare the Organization)** and add
> per-page `Service`/`Product`, `FAQPage`, and hub `ItemList` nodes on top.
> External-account steps are in [`../entity-kit/`](../entity-kit/) (ready to execute).

The shipped node (for reference). **Only add a `sameAs` URL once the profile is
live** — a dead/wrong `sameAs` weakens the entity; promote each from
`sameAsTargets` as S10 creates it (§4, and `entity-kit/profiles.md`).

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://zabble.org/#organization",
  "name": "Zabble",
  "url": "https://zabble.org",
  "description": "Zabble is a South African consulting firm that builds bespoke operational systems — automation, audit trails, anomaly detection, and analytics — shaped around the single problem slowing one specific business down.",
  "slogan": "We don't sell software. We build the system your business actually needs.",
  "email": "analytics@zabble.org",
  "areaServed": { "@type": "Country", "name": "South Africa" },
  "address": { "@type": "PostalAddress", "addressCountry": "ZA" },
  "knowsAbout": [
    "business process automation",
    "workflow automation",
    "audit trails",
    "anomaly detection",
    "business analytics",
    "bespoke software development",
    "document intelligence",
    "reconciliation automation",
    "regulatory reporting automation",
    "custom CRM"
  ],
  "sameAs": [
    "PENDING: https://www.linkedin.com/company/<zabble>",
    "PENDING: https://www.crunchbase.com/organization/<zabble>",
    "PENDING: https://www.wikidata.org/wiki/<Qxxxx>"
  ]
}
```

Notes for S03:
- Keep `name`/`description` **byte-identical** to boilerplate B/A (§1) and to
  `llms.txt`. Divergent descriptions split the entity.
- Once the **Wikidata** item exists (§3), its URL in `sameAs` is the single highest-
  value entity link — it gives the knowledge graph an anchor that disambiguates from
  Zabble, Inc.
- Optionally add `WebSite` + `SearchAction` and per-page `Service`/`Product` nodes
  for the 30 modules (S03's call; not required for the entity fix).

---

## 3. Wikidata plan

Wikidata is the disambiguation lever: a structured, machine-read item that engines
and knowledge graphs consume, and it is far more attainable than a Wikipedia article.

**Item:**
- **Label:** Zabble · **Description:** "South African software consulting firm"
  (this description is what disambiguates it from the US "Zabble, Inc." item if one
  exists).
- **Statements:** `instance of (P31)` → business/enterprise · `country (P17)` →
  South Africa · `official website (P856)` → https://zabble.org · `industry (P452)`
  → software/consulting · `inception (P571)` → <founding year, once confirmed> ·
  **`different from (P1889)` → the Zabble, Inc. item** (create/identify it; this is
  the explicit "we are not them" link) · `email`/`described at URL` as available.

**Notability / sourcing caution.** Wikidata wants each item to be a clearly
identifiable entity, ideally with ≥ 1 reliable external reference. Today Zabble has
**none** (F3). So sequence it:
1. First earn ≥ 1–2 independent references (a directory listing with editorial
   weight, a press mention, an industry-listicle inclusion — see §5). 
2. Then create the Wikidata item citing them, so it survives review.
3. Add the Wikidata URL to schema `sameAs` (§2) and to `llms.txt`'s contact section.

**Owner:** S10 executes; GEO reviews the statements for description consistency.

---

## 4. Cross-web profile / corroboration plan (S10)

Seed the **same** boilerplate (§1) across owned profiles so the facts repeat
(GEO corroboration lever). Priority order:

| # | Profile | Why (GEO value) | Description to use |
|---|---------|-----------------|--------------------|
| 1 | **LinkedIn company page** | Highest-trust entity profile; feeds many KGs | B |
| 2 | **Google Business Profile** | Drives the SA `local_pack` (seen in evidence) + Google entity | A + NAP |
| 3 | **Crunchbase** | Common training/citation source for "company" queries | B |
| 4 | **Wikidata item** (§3) | Disambiguation anchor for all engines | C |
| 5 | **Clutch / GoodFirms** | B2B services directories engines cite for "agencies in X" | B |
| 6 | **SA tech directories** (e.g. local startup/agency listings) | Local corroboration, ZA signal | B |

Rule: identical name, identical description, same URL, same contact — every time.
Log each live URL back into schema `sameAs` (§2) and `llms.txt`.

---

## 5. Brand-mention / PR target list

The engines already cite a specific set of SA "automation companies" pages that
Zabble is missing from `[E: 07/llm-response__pplx-sonarpro__custom-software-za.json]`,
`[E: 07/llm-response__chatgpt-o4mini__custom-software-za.json]`. Getting onto these
is the most direct path from SOV 0% to first citation.

**Listicles / directories cited by the engines (pursue inclusion — S10):**
- `co-foundry.co.za/top-business-workflow-automation-companies-in-south-africa`
  (a ranked listicle — direct citation magnet; request inclusion).
- `elioplus.com` — SA business-process-management channel-partner directory.
- `ditstek.com/south-africa`, `mo.agency` — agency/automation roundups.

**Competitors the engines name (the SOV denominator — for positioning, not
imitation):** Perplexity cited business-automation.co.za, badrobot.co.za,
co-foundry.co.za, sivoxi.com, signaturegroup.co.za, aiautomatedsolutions.co.za;
ChatGPT cited norsit.co.za, opuweb.app, dpsoft.co.za, fintiq.co.za, imbalics.co.za,
nuvio.co.za, twipsi.com, shiftbridge.co.za, excentrasolutions.co.za, lunasoft.co.za.
**Zero domain overlap between the two engines** — so breadth of corroboration (be in
*many* places) matters more than any single placement.

**Owned-content corroboration (helps every engine):** publish the 30 modules as
clean, self-contained definitions (already strong in `systems.ts`) + the `llms.txt`
map shipped on this branch; ensure each module page meets the GEO content standard
(`07-geo.md` §8) so when an engine does fetch us, the page is liftable.

**Disambiguation hygiene:** wherever Zabble is listed, ensure "South Africa" + the
offering appear, so the listing reinforces the SA entity and never merges into the
US "Zabble, Inc." footprint.
