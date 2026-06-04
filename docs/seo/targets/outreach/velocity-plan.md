# Link-Velocity Plan (owned by S04)

A new domain earns trust by growing its link profile **believably**. Spikes look
manufactured. The plan: build the citation base, then earn a small number of
quality editorial links per month, steadily.

## Phased cadence

| Phase | Window | Referring-domain adds | What's happening |
|-------|--------|----------------------|------------------|
| **Foundation** | Months 1–2 | ~8–12 (citations/profiles) | GBP, Bing, LinkedIn, Crunchbase, Clutch, GoodFirms, DesignRush + SA directories. Not "ranking" links — the base. (`../local-kit/citation-checklist.csv`) |
| **Seeding** | Months 3–4 | ~2–4 / month editorial | First client reviews, partner/vendor links; the `/insights` landscape asset goes into outreach. |
| **Earning** | Months 5–9 | ~3–6 / month editorial | Landscape-asset PR, guest posts, client case studies. |
| **Steady** | Month 10+ | ~4–8 / month | Sustained content + PR; review drip continues. |

## Operating rules

1. **Foundation before editorial.** Don't chase media links before the citation base
   exists — a profile with no presence converts poorly.
2. **Quality gate.** One on-topic editorial link from a real SA publication is worth
   more than ten directory drops. Don't pad the curve.
3. **No bursts.** If a single PR hit lands several links at once, slow other outreach
   that month so the trend stays smooth.
4. **Diversify.** Mix link types (media, directory, partner, guest, resource) and
   destinations (home, insights, industries, locations) — not all to the homepage.
5. **Reviews are links-adjacent.** Run the GBP/Clutch review drip (`../local-kit/`)
   in parallel; it builds trust signals the link profile rides on.

## Monitoring (once B5 — Backlinks subscription — is active)

- Monthly: `backlinks/timeseries_summary` for zabble.org → watch referring-domain
  growth track the curve above (no cliffs, no spikes).
- Monthly: `backlinks/anchors` → keep distribution within `anchor-guidance.md`.
- Quarterly: re-pull competitors' referring domains (`backlinks/referring_domains`
  for scrums.com / dvt.co.za / synthesis.co.za) to refresh `prospect-list.md`.
- Record each pull's `cost` to `../../_evidence/04/` (conventions §6).

> Until B5 lands, track velocity manually from `tracker.csv` (one row per acquired
> link, dated) — the tracker is the interim source of truth for the curve.
