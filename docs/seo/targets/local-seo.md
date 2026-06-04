# Local SEO — South Africa (owned by S10)

Google Business Profile setup, the NAP standard everyone must use, the SA
citation/directory list, a review-generation strategy, and the local-landing-page
approach. Grounded in a Maps benchmark of SA software companies
[E: 10/business-listings__software-company-jhb.json; 10/business-listings__software-company-cpt.json]
captured 2026-06-04. Zabble is **pre-launch with no GBP**, so this is a build plan.

> **Inputs needed from the user (blockers for GBP/NAP).** Local SEO depends on a
> real, consistent physical presence. Before GBP creation, lock:
> 1. **Registered business name** (exact legal/trading name + entity, e.g.
>    "Zabble (Pty) Ltd").
> 2. **Address** — a real, verifiable SA address (or a service-area designation if
>    no public office; GBP allows hiding the address for service-area businesses).
> 3. **Primary phone** (a SA number, +27).
> 4. **Public contact email** — `analytics@zabble.org` is on file; confirm it's the
>    public-facing one or provide a `hello@`/`info@`.
> These are recorded as blocker **B6** in `status.md`.

---

## 1. Why local matters here (evidence)

The dominant search pattern in Zabble's market is **geo-modified**: "{software |
IT | tech} compan{y|ies} + {city}" across every metro (Durban 720, Pretoria 480,
Cape Town 480, Sandton 260, Joburg 210, Bloemfontein 170)
[E: 10/labs-domain-intersection__scrums-x-dvt__za.json; 10/labs-ranked-keywords__scrums__za.json].
Winning these needs **both** a Google Business Profile (for the Map Pack) **and**
local landing pages (for organic). Competitors do the landing pages; almost none
of the bespoke-software peers run a strong GBP — **an opening for Zabble.**

---

## 2. Google Business Profile (GBP) — setup plan

**Category.** Primary: **Software company**. Secondary (add 2–3):
*Business management consultant*, *Website designer / Software development*,
*Business to business service*. (Benchmark listings use "Software company" as the
ranking category [E: 10/business-listings__software-company-jhb.json].)

**Profile build (in order):**
1. **Create + verify** the profile (video/postcard verification). Use the exact
   NAP from §3.
2. **Service-area business**: if no walk-in office, set Johannesburg + Cape Town +
   Pretoria as service areas and hide the street address.
3. **Description** (750 chars) — use the GEO boilerplate from §3 verbatim so it
   matches the site and `Organization` schema (S03) word-for-word.
4. **Services** — add each of the 30 systems as a GBP "Service" with its one-line
   definition (mirrors `app/data/systems.ts`). This is also a GEO/entity win.
5. **Products/Photos** — logo, cover, team, and demo screenshots; brand colour
   `#01DBF1`.
6. **Attributes** — "Online appointments", "Online estimates", LGBTQ+/owner
   attributes as true.
7. **Posts** — publish a GBP Post weekly (new system, case note, guide) for
   freshness signals.
8. **Q&A** — seed 5–8 buyer questions and answer them (doubles as AEO).

**Hand-off:** GBP creation is a user/marketing task (needs verification access).
S10 supplies category, description, services list, and review cadence.

---

## 3. NAP consistency standard (the single source of truth)

**NAP = Name, Address, Phone.** It must be **byte-identical** everywhere Zabble
appears (site footer, schema, GBP, every directory). Inconsistent NAP is the #1
local-ranking and entity-confusion killer (also hurts GEO — see
`reference/aeo-geo-principles.md` §4).

```
Name:    Zabble            (use the exact registered form once confirmed — B6)
Address: <street>, <suburb>, <city>, <province>, <postal>, South Africa
Phone:   +27 <number>      (one canonical number, international format)
Email:   analytics@zabble.org   (confirm public-facing — B6)
Web:     https://zabble.org
Hours:   Mon–Fri 08:00–17:00 SAST
```

**Boilerplate description (use verbatim everywhere — site, GBP, directories, schema
`Organization.description`):**
> *Zabble builds bespoke operational systems for South African businesses —
> automation, audit trails, anomaly detection, and analytics — delivered as custom
> software tailored to how each business actually runs.*

Rules: identical name string; international `+27` phone everywhere; one URL form
(`https://zabble.org`, no trailing slash, no `www` unless canonical); same hours.
Any change propagates to **all** listings the same day.

---

## 4. SA citation / directory list (build in this order)

Citations corroborate the entity (GEO) **and** earn early links/authority for a new
domain. **P0 = do first.** Each must carry the exact NAP from §3.

| Pri | Directory | Type | Notes |
|-----|-----------|------|-------|
| P0 | **Google Business Profile** | Maps | The anchor citation. §2. |
| P0 | **Bing Places for Business** | Maps | Mirror of GBP; feeds Copilot/Bing. |
| P0 | **LinkedIn Company Page** | Social/entity | Highest-trust `sameAs`; also a GEO source. |
| P0 | **Apple Business Connect** | Maps | Apple Maps / Siri. |
| P1 | **Clutch.co** | B2B reviews | Already ranks SA software queries [E: serp-competitors]; review-gated authority + referral. |
| P1 | **GoodFirms.co** | B2B reviews | Same as Clutch; ranks SA. |
| P1 | **DesignRush** | B2B agencies | Ranks SA; profile + list inclusion. |
| P1 | **Crunchbase** | Company/entity | Strong `sameAs`, feeds AI models. |
| P1 | **Brabys** | SA local directory | Long-standing SA business directory. |
| P1 | **Nichemarket.co.za** | SA directory | SA business + content directory. |
| P1 | **Cylex / Yalwa / Tuugo (.co.za)** | SA aggregators | Quick NAP citations. |
| P2 | **SA Yellow Pages (yellosa / yellowpages.co.za)** | Directory | Legacy but indexed. |
| P2 | **Hotfrog South Africa** | Directory | Aggregator citation. |
| P2 | **Bizcommunity company profile** | SA biz media | Also a PR surface (see `audits/10`). |
| P2 | **Local chamber / industry body** (e.g. relevant ICT body) | Membership | Authoritative local link if Zabble joins. |
| P2 | **Facebook / Instagram business** | Social | NAP consistency + brand. |

> The P1 review platforms (Clutch, GoodFirms, DesignRush, Crunchbase) double as the
> **digital-PR / link targets** in `audits/10` §5 and the **`sameAs` set** handed
> to S07/S08 — one action, three layers.

---

## 5. Review-generation strategy

**Benchmark** (Maps, "software company", 2026-06-04): directly comparable bespoke
consultancies sit at **BBD 4.6 (249 reviews)**, **Entelect 4.7 (179)**, **CPI
Performance 4.7 (157)** [E: 10/business-listings__software-company-jhb.json;
10/business-listings__software-company-cpt.json]. Product/fintech giants (Cartrack
3,369; RecoMed 1,659) dominate volume but aren't Zabble's class.

**Target:** reach **20–30 reviews at ≥4.7** in the first two quarters post-launch —
enough to look credible and verified next to the SME peer tier; then a steady drip.

**How:**
1. **Ask at the moment of delivered value** — when a system ships and the outcome
   lands (e.g. "month-end close cut from a fortnight to hours"), ask that
   stakeholder for a GBP review. Specific outcomes → specific, quotable reviews
   (which also feed GEO).
2. **Direct review link** — generate the GBP short review URL; put it in email
   signatures, project-closeout emails, and invoices.
3. **Sequence:** project kickoff → midpoint check-in → closeout review request →
   1 gentle follow-up. Never incentivise (against Google policy).
4. **Spread platforms** — most to GBP; seed 2–3 on Clutch/GoodFirms for B2B trust.
5. **Respond to every review** (signal + GEO corroboration), using the brand name
   in replies.
6. **POPIA:** only contact clients you have a lawful basis to (existing
   relationship); keep requests transactional. Coordinate with B4 analytics/privacy.

---

## 6. Local-landing-page approach (recommendation)

**Build 5 metro landing pages** mirroring the proven competitor pattern
[E: 10/labs-ranked-keywords__scrums__za.json] but **distinct, not thin doorway
pages** (Google penalises near-duplicate local pages — each must carry genuinely
local content):

| URL | Targets | SA vol signal |
|-----|---------|---------------|
| `/locations/johannesburg` (or `/bespoke-software-johannesburg`) | software/IT company johannesburg, sandton | 210 + 260 |
| `/locations/cape-town` | software companies cape town, cape town it companies | 210 + 480 |
| `/locations/pretoria` | it companies pretoria | 480 |
| `/locations/durban` | it company in durban | 720 |
| `/locations/sandton` | sandton it companies | 260 |

**Each page must include (to avoid doorway-page thinness):**
- A locally-meaningful H1 ("Bespoke operational systems for {City} businesses").
- 250+ words of genuinely city-specific copy (local industries, a local client
  outcome where one exists, why on-the-ground delivery matters).
- The NAP + an embedded map (service-area).
- `LocalBusiness`/`Service` schema with `areaServed` = the city (S03).
- Internal links to the 3–5 most relevant `/systems/<slug>` money pages.
- A local CTA.

**Sequencing:** Durban + Pretoria first (highest volume, least Zabble-specific
competition), then Joburg/Sandton/Cape Town. **Owner:** page creation is app-code
(coordinate via status.md — S02 metadata, S03 schema, S04 internal links). S10
supplies targets + structure; **do not ship 5 boilerplate clones.**

---

## 7. Evidence
- `_evidence/10/business-listings__software-company-jhb.json` — Joburg Maps benchmark.
- `_evidence/10/business-listings__software-company-cpt.json` — Cape Town Maps benchmark.
- `_evidence/10/labs-ranked-keywords__scrums__za.json` — competitor local-page pattern + geo volumes.
- Method + costs: `_evidence/10/README.note.md`.
