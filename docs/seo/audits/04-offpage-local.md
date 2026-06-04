# Audit 04 — Off-Page, Local SEO & Competitive

- **Session:** 04 (off-page/local/competitive)
- **Branch:** seo/04-offpage-local
- **Owner:** S04 (off-page/local strategist)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (access — done), 05 (keyword sizing — soft; this session seeded its own commercial queries)
- **Layer(s):** SEO / Off-page / Local / (entity hand-off to GEO)

> **Numbering note.** This session ran as **`seo/04-offpage-local`** per the goal
> brief. The original `00-conventions.md` §1 table (authored by S00) numbered
> off-page/local/measurement as "Session 10"; the active engagement renumbered it
> to **04**. The S00 placeholder `audits/10-offpage-local.md` is left untouched;
> the live deliverable is **this file** plus `targets/competitors.md`,
> `targets/local-seo.md`, the sameAs hand-off in `status.md`, and raw exports in
> `_evidence/04/`. Site Architecture (the other "04" in the old table) runs on its
> own distinct branch `seo/04-architecture` — no git-ref collision.

## 1. Scope

**In scope:** map the SA competitive/SERP landscape; find backlink & content gaps;
produce an authority-building, digital-PR and local-SEO/GBP build plan for a
**new, pre-launch domain with zero authority**; hand entity/`sameAs` opportunities
to GEO.

**Out of scope / hand-offs:**
- Keyword volumes/KD at scale → **S05** (this session sized only the commercial
  queries it needed to find competitors).
- On-page/metadata of the new local pages → **S02**; their schema → **S03**;
  internal linking → **S04**.
- Entity/`sameAs` schema implementation + AI-citation tracking → **S07/S08**
  (this audit hands them the target list; see §6 + status.md).
- Measurement stand-up (GSC/Bing/analytics, POPIA) → tracked as blocker **B4**;
  cannot complete until access is granted.
- **Raw competitor backlink exports** → blocked: the DataForSEO **Backlinks API
  requires a separate paid subscription** (`40204`), not activated (blocker **B5**).
  The digital-PR plan below is therefore grounded in **observable competitor link
  *assets*** (what content earns them links, visible via ranked keywords) rather
  than referring-domain exports.

## 2. Method

All via **direct DataForSEO REST** (in-session MCP returned `401` — env not loaded
at launch, access doc §3), **live**, `location_name: "South Africa"`,
`language_code: "en"`, **2026-06-04**. Auth redacted. Full call log + costs:
`_evidence/04/README.note.md`. Total spend **~$0.18**.

1. `serp_competitors` over 12 core commercial seeds → competitor discovery (77 domains).
2. `domain_rank_overview` × (zabble.org + 10 competitors) → visibility metrics.
3. `domain_intersection` (scrums.com ∩ dvt.co.za) → contested commercial keyword space.
4. `ranked_keywords` (scrums.com, pos ≤ 20) → the proven content/link-asset playbook.
5. `business_data/business_listings/search` (Johannesburg, Cape Town) → GBP/Maps benchmark.
6. `backlinks/*` → **denied (`40204`)**; recorded, not used.

## 3. Current state (findings)

| # | Finding | Evidence |
|---|---------|----------|
| F1 | **zabble.org has zero organic keywords** in SA — a true new-domain baseline. Off-page authority = ~0. | `[E: 04/labs-domain-rank-overview__competitors__za.json]` |
| F2 | The SERP is a **low-volume, winnable niche**: leader `dvt.co.za` 380 kw / 9,675 ETV; `synthesis.co.za` 152 / 6,731; most peers 40–150 kw / a few-hundred ETV. No unassailable incumbent on the long tail. | `[E: 04/labs-domain-rank-overview__*__za.json]` |
| F3 | The **dominant search intent is geo-modified** ("software/IT/tech company + {city}"): Durban 720, Pretoria 480, Cape Town 480, Sandton 260, Joburg 210, Bloemfontein 170. | `[E: 04/labs-domain-intersection__scrums-x-dvt__za.json; 04/labs-ranked-keywords__scrums__za.json]` |
| F4 | The SEO-mature peer (`scrums.com`) wins via **three repeatable assets**: programmatic `/software-development-company/{city}` local pages, a `/top-100-fintech-platforms-in-africa` linkbait directory (ranks `investec` 60,500; `yoco` 27,100), and educational `/blog` + tool guides. | `[E: 04/labs-ranked-keywords__scrums__za.json]` |
| F5 | **Directories rank for Zabble's terms** (`clutch.co`, `goodfirms.co`, `designrush.com`) — these are citation/PR **targets**, not rivals. SA media (`businesstech`, `mybroadband`, `bizcommunity`) are PR placement surfaces. | `[E: 04/labs-serp-competitors__core-cluster__za.json]` |
| F6 | **Local Maps is an opening:** comparable bespoke consultancies hold only modest review counts (BBD 4.6/249, Entelect 4.7/179, CPI 4.7/157); few bespoke peers run a strong GBP. | `[E: 04/business-listings__software-company-jhb.json; 04/business-listings__software-company-cpt.json]` |
| F7 | **Backlink data is gated** — Backlinks API not subscribed (`40204`). Competitor referring-domain profiles couldn't be exported. | `[E: 04/README.note.md]` |

## 4. Gaps & opportunities (prioritised)

- **P0 — Entity & citation foundation.** A new domain's fastest authority win is a
  consistent, corroborated entity across GBP + high-trust profiles (LinkedIn,
  Crunchbase, Clutch). Doubles as GEO infrastructure. *(→ §5 R1, local-seo.md.)*
- **P0 — Local pack + local pages.** The highest-intent, highest-volume cluster
  (F3) is unserved by Zabble and weakly held by bespoke peers (F6). *(→ local-seo.md
  §2, §6.)*
- **P1 — One flagship linkable asset (digital PR).** The proven link magnet in this
  market is an authoritative industry list/report (F4). Zabble has none. *(→ §5 R2.)*
- **P1 — Distinct money pages.** 30 near-identical `/systems` pages is the standing
  risk (aeo-geo §2). Off-page links land best on pages that deserve them. *(→ S06.)*
- **P2 — Educational content for links + AEO.** Competitor-proven (F4). *(→ S06/S07.)*
- **Blocked — Backlink intelligence (B5) & Measurement (B4).** Need decisions/access.

## 5. Recommendations — backlink, digital-PR & authority plan

A new domain cannot (and must not) chase links fast. The plan is **earn the
foundation, then earn a few high-quality editorial links, at a believable
velocity.**

### R1 — Citation & entity foundation (P0, weeks 1–4)
Build the NAP-consistent citation set in `local-seo.md` §4 (GBP, Bing Places,
Apple, LinkedIn, Crunchbase, Clutch, GoodFirms, DesignRush, Brabys, Nichemarket).
Every one carries the **identical NAP + boilerplate** (local-seo.md §3). These are
foundational links **and** the `sameAs` set for GEO (§6).

### R2 — Flagship digital-PR asset (P1, weeks 4–10)
Build **one** genuinely useful, data-led, linkable asset — the move that earns
editorial links in this market (F4). Recommended angle (pick one, make it the best
that exists):
- *"The State of Business Automation in South Africa"* — a short annual report
  with a few original data points (even a 50-respondent SA operator survey), or
- *"The South African Operations-Software Landscape"* — a curated, opinionated map
  of categories/tools (the Scrums.com "top-100" pattern, but on Zabble's turf).

**Why it works:** it's referenceable by SA tech media (businesstech, mybroadband,
bizcommunity — F5), it ranks for entity terms, and it gives outreach a *reason to
exist*. House it at `/insights/<slug>` and link it into relevant `/systems` pages.

### R3 — Outreach & placement (P1, ongoing from week 8)
| Target type | Examples | Angle |
|-------------|----------|-------|
| SA tech/business media | businesstech.co.za, mybroadband.co.za, bizcommunity.com, ITWeb | Pitch the R2 report / a founder op-ed on automation ROI for SA SMEs. |
| B2B review/listing | Clutch, GoodFirms, DesignRush | Claim profile, gather 2–3 reviews → list inclusion + referral links. |
| Partner / ecosystem | KnvilLabs (Kairos co-build), tech-stack vendors, client sites | "Built by / partner of" links; client case-study links (with permission). |
| Niche/local | Industry bodies, chambers, SA startup directories | Membership + directory links. |
| Guest content | SA dev/ops blogs, founder communities | One strong guest post per quarter tied to a Zabble guide. |

**Outreach approach:** personalised, value-first (lead with the asset, not the
ask); target editors/authors who've covered SA automation/software; never buy
links; prefer one editorial link over ten directory drops.

### R4 — Anchor-text guidance (apply to every link Zabble influences)
Without competitor anchor exports (B5), follow a **safe, natural distribution** for
a young domain (over-optimised exact-match anchors are the main penalty risk):

| Anchor type | Target share | Examples |
|-------------|-------------:|----------|
| Branded | ~50% | "Zabble", "Zabble.org", "Zabble (Pty) Ltd" |
| Naked URL | ~20% | "zabble.org", "https://zabble.org" |
| Generic | ~15% | "this case study", "here", "their platform" |
| Partial-match | ~10% | "bespoke operational systems", "Zabble's automation work" |
| Exact-match | **≤5%** | "bespoke software south africa" — sparingly, only on highly relevant editorial pages |

Control what you can (profiles, partners, guest posts); let editorial links fall
naturally. Re-balance once real backlink data is available (B5).

### R5 — Link-velocity plan (realistic for a new domain)
Slow and steady beats spikes. Indicative cadence:

| Phase | Window | Referring-domain adds | Mix |
|-------|--------|----------------------|-----|
| Foundation | Months 1–2 | ~8–12 | Citations/profiles (R1) — the base, not "ranking" links yet. |
| Seeding | Months 3–4 | ~2–4/mo editorial | First reviews, partner links, the R2 asset goes live. |
| Earning | Months 5–9 | ~3–6/mo editorial | R2-driven PR + guest posts + client case studies. |
| Steady | Month 10+ | ~4–8/mo | Sustained content + PR; review drip continues. |

Track the actual curve once **B5 (Backlinks subscription)** is activated — set
`backlinks/timeseries_summary` as the monthly monitor.

### R6 — Recommendation table

| # | Pri | Recommendation | File / owner | Evidence |
|---|-----|----------------|--------------|----------|
| 1 | P0 | Build NAP-consistent citation/entity set (GBP + 10 directories) | `targets/local-seo.md` §3–4 / user + S04 | F1, F6 |
| 2 | P0 | Create + verify GBP (Software company), seed reviews | `targets/local-seo.md` §2,§5 / user | F6 |
| 3 | P0 | Build 5 distinct metro local pages | `targets/local-seo.md` §6 / S02+S03+S04 | F3 |
| 4 | P1 | Ship one flagship digital-PR asset (`/insights/...`) | this audit §5 R2 / S06 | F4 |
| 5 | P1 | Run value-first media/B2B outreach off that asset | §5 R3 / user + S06 | F4, F5 |
| 6 | P1 | Enforce safe anchor distribution on influenced links | §5 R4 / S04 | — |
| 7 | P1 | Hold believable link velocity; monitor monthly | §5 R5 / S04 | — |
| 8 | P1 | Lock the "Zabble"/"Kairos" entity (sameAs) for GEO | status.md hand-off / S07+S08 | §6 |
| 9 | P2 | Educational guides for links + AEO | S06 / S07 | F4 |
| 10 | — | **Decide on Backlinks subscription (B5)** to unlock competitor link intel + velocity tracking | user | F7 |

## 6. Cross-session asks (mirrored into status.md)

- **S07 / S08 (AEO/GEO entity):** stand up the **`sameAs` / brand-citation set** —
  full list handed via `status.md` (S04 → S07/S08 note). Use the NAP boilerplate
  (`local-seo.md` §3) verbatim in `Organization` schema so site + profiles + GBP
  corroborate. The R2 digital-PR asset and consistent citations are GEO
  corroboration fuel.
- **S03 (schema):** `Organization` + `LocalBusiness`/`Service` (`areaServed`) schema
  on the new metro pages; `sameAs` array = the profile list in `local-seo.md` §4.
- **S02 (metadata) / S04 (internal links):** the 5 metro pages + `/insights` asset
  need titles/canonicals (S02) and internal links from `/systems` (S04). **Do not
  ship 5 boilerplate clones** — doorway-page risk (`local-seo.md` §6).
- **S06 (content):** owns the R2 flagship asset + educational guides.
- **S05 (keywords):** size the metro/geo cluster + module-level commercial terms;
  S04's seeds are in `targets/competitors.md` §3.
- **User decisions:** B5 (Backlinks subscription), B6 (NAP inputs: name/address/
  phone), B4 (GSC/Bing/analytics access for measurement).

## 7. Evidence index

| File | Proves |
|------|--------|
| `_evidence/04/labs-serp-competitors__core-cluster__za.json` | The SA SERP competitor set (77 domains) + directories to discount. |
| `_evidence/04/labs-domain-rank-overview__competitors__za.json` | zabble.org = zero organic keywords (new-domain baseline). |
| `_evidence/04/labs-domain-rank-overview__<domain>__za.json` (×10) | Per-competitor SA visibility (KW count, ETV, positions). |
| `_evidence/04/labs-domain-intersection__scrums-x-dvt__za.json` | Contested commercial keyword space (gap targets). |
| `_evidence/04/labs-ranked-keywords__scrums__za.json` | Competitor content/link-asset playbook (local pages, linkbait directory, guides). |
| `_evidence/04/business-listings__software-company-jhb.json` | Johannesburg Maps/GBP benchmark. |
| `_evidence/04/business-listings__software-company-cpt.json` | Cape Town Maps/GBP benchmark. |
| `_evidence/04/backlinks-bulk-ranks__competitors__za.json` + `backlinks-summary__*.json` | Backlinks API gated (`40204`) — blocker B5. |
| `_evidence/04/README.note.md` | Full method, request bodies, modes, and per-call costs (~$0.18 total). |
