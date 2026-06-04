# Competitor & SERP Landscape — South Africa (owned by S10)

The true SERP competitors for Zabble's clusters, their visibility, the per-cluster
gaps, and what they do that Zabble should copy. All metrics from **DataForSEO
Labs, `location_name: "South Africa"`, `language_code: "en"`, captured
2026-06-04** (evidence under `../_evidence/10/`). Zabble is a **new domain with
zero organic keywords** [E: 10/labs-domain-rank-overview__competitors__za.json] —
this is competitive intelligence + a build target, not a ranking comparison.

---

## 1. How the competitor set was chosen

Seeded `serp_competitors` with 12 core commercial queries spanning Zabble's
clusters — custom/bespoke software development, business-process & workflow
automation, custom CRM, system integration, document automation, and the two
biggest metros (Johannesburg, Cape Town)
[E: 10/labs-serp-competitors__core-cluster__za.json]. That returned **77 domains**.
We then **discounted** three groups that rank but aren't competitors Zabble can
displace by being better — they're a different play:

- **Global B2B directories** — `clutch.co`, `goodfirms.co`, `designrush.com`,
  `topsoftwarecompanies.co`, `lusha.com`. *(These are link/citation **targets**,
  not rivals — see `local-seo.md` and the digital-PR plan in `audits/10`.)*
- **SA tech media** — `businesstech.co.za`, `mybroadband.co.za`,
  `bizcommunity.com`. *(Digital-PR **placement** targets, not rivals.)*
- **Social/jobs** — `facebook.com`, `linkedin.com`, `glassdoor.com`,
  `offerzen.com`.

What remains is the real peer set: **SA bespoke-software / automation
consultancies** with the same buyer and the same money pages as Zabble.

---

## 2. The competitor set + visibility (sourced)

Organic visibility in **South Africa** (DataForSEO Labs `domain_rank_overview`,
2026-06-04). `ETV` = estimated organic traffic value/clicks per month; position
buckets count ranked keywords.
[E: 10/labs-domain-rank-overview__*__za.json]

| Tier | Domain | Org KW | ETV/mo | pos 1 | pos 2–3 | pos 4–10 | What they are |
|------|--------|-------:|-------:|------:|--------:|---------:|---------------|
| **Leaders** | `dvt.co.za` | 380 | 9,675 | 23 | 37 | 117 | DVT — large enterprise software consultancy (resourcing + delivery). Broadest footprint by far. |
| | `synthesis.co.za` | 152 | 6,731 | 25 | 20 | 25 | Synthesis — fintech / cloud / AWS specialist; high-authority brand. |
| **Challengers** | `bbdsoftware.com` | 42 | 2,980 | 10 | 3 | 17 | BBD — established bespoke software house; few keywords but high-value terms (high ETV/kw). |
| | `iqbusiness.net` | 23 | 3,475 | 6 | 0 | 3 | IQbusiness — management-consulting + delivery; high ETV/kw. |
| | `scrums.com` | 125 | 1,121 | 2 | 2 | 16 | **Scrums.com (ex-SovTech)** — the content/SEO machine of the set. Modest ETV but owns commercial + local + linkbait terms. **The template to study.** |
| **Niche / SME** | `gendac.co.za` | 65 | 410 | 1 | 0 | 3 | Gendac — explicitly "custom software". |
| | `smudge.co.za` | 64 | 286 | 0 | 0 | 13 | Smudge — app/product studio. |
| | `specno.com` | 48 | 328 | 1 | 1 | 5 | Specno — Cape Town app/venture studio, content-led. |
| | `runninghill.co.za` | 43 | 97 | 0 | 0 | 5 | Running Hill — custom software/dev. |
| | `platform45.com` | 12 | 210 | 1 | 1 | 1 | Platform45 — product/app dev. |

Also surfaced but lower in the set (worth tracking): `webtonic.co.za`,
`quadrantsystems.co.za`, `krs.co.za`, `livex.co.za`, `codehesion.com`,
`co-foundry.co.za`, `sasoft.co.za`, `insightconsulting.co.za`.

**Strategic read.** This is a **low-volume, winnable niche.** The *leader* holds
~380 keywords and <10k ETV; most peers sit at 40–150 keywords and a few hundred
ETV. There is no unassailable incumbent on the bespoke-systems long tail — a
focused, distinctly-written set of money pages + a few link assets can reach the
challenger tier within 2–3 quarters. The risk is not a giant competitor; it's
**doing nothing distinctive** across 30 near-identical pages.

---

## 3. Per-cluster gaps (what's contested, where Zabble can win)

Volumes are **SA monthly** searches; the contested set is the keywords the two
leaders both rank for plus Scrums.com's ranked terms
[E: 10/labs-domain-intersection__scrums-x-dvt__za.json; 10/labs-ranked-keywords__scrums__za.json].

### Cluster A — Core identity (home + `/systems`)
The head terms of the market. **All winnable** (KD-light, mid CPC = commercial).

| Keyword | SA vol | Who ranks | Zabble target |
|---------|-------:|-----------|---------------|
| software development company | 480 | scrums (home p6), dvt | `/` |
| software development company south africa | 260 | scrums LP p1 | `/` |
| software / software development agency / firm | 480 ea | scrums, dvt | `/` |
| business process automation south africa | (seed) | dvt, synthesis | `/systems` |
| workflow automation south africa | (seed) | — thin | `/systems` (open) |

> **Gap:** "business automation / workflow automation **South Africa**" is only
> thinly held — Zabble's actual positioning ("bespoke operational systems")
> differentiates here. This is the **least contested, most on-brand** cluster.

### Cluster B — Local / geo-modified (the dominant intent in this market)
The single biggest pattern in the SERP. "**{software | IT | tech} compan{y|ies}
+ {city}**" repeats across every metro.
[E: 10/labs-domain-intersection__scrums-x-dvt__za.json; 10/labs-ranked-keywords__scrums__za.json]

| City | Representative term(s) | SA vol |
|------|------------------------|-------:|
| Durban | it company in durban | 720 |
| Pretoria | it companies pretoria / it company in pretoria | 480 |
| Cape Town | cape town it companies; software companies cape town | 480 / 210 |
| Sandton | sandton it companies; it company sandton | 260 |
| Johannesburg | software companies in johannesburg | 210 |
| Bloemfontein | it companies bloemfontein | 170 |

> **Gap & opportunity:** Scrums.com wins these with **programmatic local landing
> pages** (`/software-development-company/{city}`). Zabble has **none**. This is
> the highest-volume, clearest-intent cluster in the market — see the
> local-landing recommendation in `targets/local-seo.md` §6.

### Cluster C — Per-module commercial (the 30 `/systems/<slug>` pages)
Lower individual volume, but 30 pages × distinct intent = the long-tail moat.
S05 sizes each; S10's note: competitors barely touch module-level terms
(e.g. "reconciliation automation", "document data extraction", "anomaly
detection") — **wide-open** for distinct, well-shaped money pages.

### Cluster D — Informational / educational (AEO/GEO, hand to S06/S07)
Scrums.com ranks for tool/how-to guides — `types of software testing` (p3, 260),
`/software-development-tools/{tool}`, `top-level domains explained`. These earn
links and feed PAA/snippets. Zabble's equivalent: "what is a bespoke operational
system", "how to automate {month-end close | bank reconciliation | document
processing}". Owned by S06 (content) / S07 (AEO); listed here as a competitor-proven
angle.

---

## 4. What competitors do that Zabble should (evidence-backed playbook)

From Scrums.com's ranked-keyword footprint — the most SEO-mature peer
[E: 10/labs-ranked-keywords__scrums__za.json]:

1. **Programmatic local landing pages** — one page per SA metro targeting
   "{discipline} company {city}". Proven to rank (Cape Town p15–20, Joburg p8,
   Pretoria p6, Sandton p10). → **Zabble: build 5 metro pages** (Joburg, Cape
   Town, Pretoria, Durban, Sandton). Spec in `local-seo.md` §6.
2. **A flagship linkbait directory asset** — `/top-100-fintech-platforms-in-africa`
   (+ `/top-100-ai-companies-in-africa`) ranks for huge entity terms
   (`investec` 60,500; `yoco` 27,100) and is a natural backlink magnet. → **Zabble:
   build one authoritative, genuinely useful list** (e.g. *"The state of business
   automation in South Africa"* or *"South African operations-software landscape"*).
   This is the centrepiece of the digital-PR plan in `audits/10` §5.
3. **Educational guides** that answer buyer questions (testing types, dev tools,
   glossary) — informational traffic + PAA/snippet eligibility + internal-link
   equity into money pages. → **Hand to S06/S07.**
4. **Distinct, conversion-shaped landing pages** (`/lp/custom-software-services`
   ranks p1 for "software development companies south africa") rather than relying
   on the homepage alone.
5. **Brand-term ownership** — every leader ranks p1 for its own name; Zabble must
   lock `zabble` and `kairos` as entities (hand to S07/S08 GEO; see status.md
   sameAs list).

---

## 5. Tracking set (re-pull each quarter)

Baseline these 6 each quarter via `domain_rank_overview` (SA) to measure Zabble's
catch-up: `dvt.co.za`, `synthesis.co.za`, `bbdsoftware.com`, `scrums.com`,
`gendac.co.za`, `specno.com`. Add `zabble.org` once it has rankings.

---

## 6. Evidence
- `_evidence/10/labs-serp-competitors__core-cluster__za.json` — competitor discovery.
- `_evidence/10/labs-domain-rank-overview__*__za.json` — visibility metrics (zabble.org + 10 competitors).
- `_evidence/10/labs-domain-intersection__scrums-x-dvt__za.json` — contested keyword space.
- `_evidence/10/labs-ranked-keywords__scrums__za.json` — competitor content playbook.
- Method + costs: `_evidence/10/README.note.md`.
