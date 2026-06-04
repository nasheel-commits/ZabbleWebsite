# content/ — drafts, briefs & reusable copy blocks

Where SEO/AEO/GEO **copy** lives before it lands in the app. Keeps editorial work
reviewable and out of the component files until it's ready.

## What goes here
- **Content briefs** — per money page: target keyword (from `targets/keyword-map.md`),
  intent, the question(s) to answer, required headings, internal links to include.
- **Draft copy** — distinct per-module copy (the antidote to the 30-page
  duplicate-content risk), answerable intro paragraphs.
- **FAQ blocks** — Q&A pairs for AEO, written 1:1 with the `FAQPage` schema S03
  will mark up. Keep the visible copy and the schema identical.
- **Boilerplate** — the canonical Zabble + per-module descriptions used
  consistently everywhere (GEO corroboration). These should match
  `app/data/systems.ts`.

## Conventions
- One file per page/topic: `content/<page-slug>.md` (e.g. `content/bespoke-crm.md`).
- FAQ files: `content/faq/<page-slug>.md`.
- Mostly owned by **S06** (content); AEO FAQ blocks by **S07**. Name the owner at
  the top of each file.
- Every claim that cites a number must trace to `_evidence/` (conventions §6).
- Copy here is a **draft** until the owning session's PR merges it into the app.

## Status
Empty skeleton — populated by S06/S07 once S05 delivers the keyword map.
