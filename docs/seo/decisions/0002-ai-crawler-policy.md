# 0002 — AI-crawler policy (robots.txt) for GEO

- **Status:** accepted
- **Date:** 2026-06-04
- **Author:** S01 (Technical SEO & Crawlability)
- **Affects:** S01 (robots config), S08 (GEO), S07 (AEO), S10 (measurement)
- **Reviewed by:** S00 owner (per conventions §2)

## Context

Zabble's strategy stacks SEO → AEO → GEO on one foundation. GEO (being **cited**
by ChatGPT, Gemini, Perplexity, Copilot, Google AI Overviews) requires that those
engines' crawlers can actually **fetch and read** our pages. `robots.txt` is the
first gate. AI crawlers fall into three functional classes:

1. **Search / index bots** — build the index an AI answer draws from
   (`Googlebot`, `Bingbot`, `Applebot`).
2. **Answer / inference / on-demand bots** — fetch a page live to answer a user's
   prompt *now*, and are the ones that produce citations
   (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`,
   `Claude-User`, `Claude-SearchBot`, `DuckAssistBot`, `Amazonbot`).
3. **Training bots** — collect data to train future models
   (`GPTBot`, `Google-Extended`, `Applebot-Extended`, `ClaudeBot`, `anthropic-ai`,
   `CCBot`, `Meta-ExternalAgent`, `cohere-ai`).

A site that wants to be *found in* and *cited by* AI answers must allow classes 1
and 2. Class 3 (training) is a genuine policy choice — blocking it protects
proprietary content but reduces an entity's presence in model "knowledge".

## Decision

**Allow all three classes.** Zabble is a pre-launch B2B brand whose entire GEO
objective is to become a **known, citable entity** ("who builds bespoke
operational systems in South Africa?"). We have no proprietary or paywalled
content to protect on the marketing site, and broad presence — including in
training corpora — strengthens entity-knownness and corroboration (see
`reference/aeo-geo-principles.md` §4). Concretely:

- `User-agent: *` → `Allow: /` at launch (everything may crawl everything).
- An **explicit allow-list** of the named AI crawlers above, each `Allow: /`.
  This is documentary and **robust**: if a future change narrows `*` (e.g. adds a
  `Disallow`), the AI bots we care about remain explicitly allowed and are never
  silently cut off from GEO surfaces.
- **Do not** set `@nuxtjs/robots`'s `blockAiBots` / `blockNonSeoBots`.
- **Staging guard overrides everything:** when the build is not production
  (`site.indexable=false`), robots emits `User-agent: *` / `Disallow: /` for *all*
  bots — see ADR-0003 / `nuxt.config.ts`. A staging domain must never be crawled
  or indexed, by AI bots or anyone.

### Not blocking (but watch)

Aggressive scrapers that ignore `crawl-delay` and add no GEO value (e.g.
`Bytespider`) are **not** pre-emptively blocked — blocking them has SEO/GEO
opportunity cost and they are not currently a problem. **Revisit** only if server
logs (post-launch) show abusive request rates; at that point add a targeted
`Disallow` group. Log this as a measurement task for S10.

## Implementation

`nuxt.config.ts` → `robots.groups` (the named allow-list) + `robots.sitemap`
(the `Sitemap:` line). Verified in the launch build:
`_evidence/01/built-robots__launch-indexable.txt` (AI bots + `Sitemap:` line) and
the staging guard `_evidence/01/built-robots__staging-guard.txt` (`Disallow: /`).

## Consequences

- **Easy:** maximum crawl/citation surface for every AI engine; GEO measurement
  (S08) has live access to read.
- **Accepted trade-off:** our public marketing copy may appear in training data.
  Acceptable — it *is* marketing, and corroboration is the GEO goal.
- **Reversible:** the policy is one config block; a class can be disallowed in
  minutes if strategy changes.
