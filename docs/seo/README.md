# Zabble SEO / AEO / GEO Knowledge Base

This is the shared knowledge base for Zabble's search-visibility work. It is the
single source of truth that the **10 parallel discipline sessions** consume. If
something is true about how we do SEO/AEO/GEO on this site, it is written here —
not in a chat log, not in one person's head.

**Site:** Zabble — bespoke operational systems (automation, audit trails, anomaly
detection, analytics) for South African businesses.
**Production domain:** https://zabble.org (pre-launch at time of writing).
**Stack:** Nuxt 4.4 (Vue 3.5), statically prerendered via Nitro. See
[`reference/nuxt-seo-implementation.md`](reference/nuxt-seo-implementation.md).
**Primary market:** South Africa (`en-ZA`, `location_name: "South Africa"`).

---

## The one-foundation model

SEO, AEO, and GEO are **three additive layers on one foundation**, not three
separate projects. Build the foundation once; each layer adds on top.

```
                 ┌─────────────────────────────────────────┐
   GEO layer  →  │  Cited by AI answers (ChatGPT, Gemini,   │
                 │  AI Overviews, Perplexity): entities,     │
                 │  corroboration, quotable claims           │
                 ├─────────────────────────────────────────┤
   AEO layer  →  │  Wins the answer slot (snippets, PAA,     │
                 │  FAQ, voice): question-shaped, concise    │
                 ├─────────────────────────────────────────┤
   SEO layer  →  │  Ranks in classic results: relevance,     │
                 │  authority, intent match                  │
                 ├─────────────────────────────────────────┤
 FOUNDATION  →   │  Crawlable, fast, semantically structured │
                 │  HTML + schema + clean IA + measurement   │
                 └─────────────────────────────────────────┘
```

A page that isn't crawlable can't rank (SEO), can't be lifted into an answer box
(AEO), and won't be cited by a model (GEO). So the foundation comes first. See
[`reference/aeo-geo-principles.md`](reference/aeo-geo-principles.md) for the
distinctions and what each layer demands.

---

## How to use this knowledge base

1. **Read [`00-conventions.md`](00-conventions.md) first.** It defines
   branch-per-session, write-ownership (who may edit what), the definition of
   done, the audit-doc template, the evidence format, and the secrets rule.
   These are binding for every session.
2. **Check [`status.md`](status.md)** for your session's number, branch, owner,
   dependencies, and current state. Do not start work that a dependency hasn't
   delivered.
3. **Read the reference docs** relevant to your discipline (below).
4. **Do your audit** in `audits/0X-*.md`, using the template in conventions.
   Capture every DataForSEO response under `_evidence/` (see the evidence rule).
5. **Record any cross-cutting decision** as an ADR in `decisions/`.

---

## Directory map

| Path | What lives here | Who writes it |
|------|-----------------|---------------|
| `README.md` | This orientation doc | Setup (S00) |
| `status.md` | Live board of all 11 sessions | Each session updates its own row |
| `00-conventions.md` | Binding rules for all sessions | Setup (S00) |
| `00-access-and-credentials.md` | DataForSEO access, balance record, MCP wiring | Setup (S00) |
| `reference/dataforseo.md` | DataForSEO API + MCP usage, endpoints, costs, SA params | Setup (S00) |
| `reference/aeo-geo-principles.md` | SEO vs AEO vs GEO, what each layer demands | Setup (S00) |
| `reference/nuxt-seo-implementation.md` | How to ship SEO in this Nuxt 4 codebase | Setup (S00) |
| `reference/measurement-indexing.md` | GSC, Bing, analytics, indexing, rank tracking | Setup (S00) |
| `targets/keyword-map.md` | Keyword → URL → intent → layer map (skeleton) | S05 fills, others read |
| `audits/0X-*.md` | One audit per discipline session | The owning session |
| `content/` | Draft copy, briefs, FAQ blocks produced by audits | S06 + content-producing sessions |
| `decisions/` | ADRs — cross-cutting decisions with rationale | Any session, reviewed by S00 owner |
| `_evidence/` | Raw API responses + screenshots backing every claim | Every session |

---

## The 10 discipline sessions (+ this setup session)

| # | Session | Layer focus |
|---|---------|-------------|
| 00 | Setup & access foundation *(this session)* | Foundation |
| 01 | Technical SEO & Crawlability | Foundation / SEO |
| 02 | On-Page & Metadata | SEO |
| 03 | Structured Data / Schema.org | Foundation / AEO / GEO |
| 04 | Site Architecture & Internal Linking | SEO |
| 05 | Keyword & Market Research (South Africa) | SEO (feeds AEO/GEO) |
| 06 | Content Strategy & Editorial | SEO / AEO |
| 07 | AEO — Answer Engine Optimization | AEO |
| 08 | GEO — Generative Engine Optimization | GEO |
| 09 | Performance & Core Web Vitals | Foundation |
| 10 | Off-Page, Local SEO & Measurement | SEO / measurement |

Full ownership, branches, and dependencies are in [`status.md`](status.md).
