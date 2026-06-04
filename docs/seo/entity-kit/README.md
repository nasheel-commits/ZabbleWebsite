# Zabble entity kit — ready to execute

Everything needed to establish "Zabble" as a distinct, corroborated entity across
the web and disambiguate it from **Zabble, Inc.** (the US waste-management software
company) that generative engines currently confuse it with (audit `07-geo.md`, F2).

These are **external account actions** — they need a human with the relevant logins.
Each file is copy-paste ready. Do them in this order; corroboration compounds.

| Step | File | Owner | Why first |
|------|------|-------|-----------|
| 1 | [`profiles.md`](profiles.md) | User / S10 | LinkedIn + Google Business Profile + Crunchbase are the highest-trust entity anchors and the references Wikidata will need. |
| 2 | [`pr-and-mentions.md`](pr-and-mentions.md) | User / S10 | Get listed on the SA "automation companies" pages the engines already cite — first independent corroboration. |
| 3 | [`wikidata.md`](wikidata.md) | User / S10 | Create the Wikidata item (with `different from` → Zabble, Inc.) once 1–2 independent references exist, so it survives review. |
| 4 | back to site | S03 / S10 | As each profile goes live, add its URL to `app/data/organization.ts` → `sameAs`, and to `llms.txt`. Re-run `npm run test:geo`. |

**The one rule:** every surface uses the **identical** name, description, and contact
(see the boilerplate in [`../audits/07-geo-entity-plan.md`](../audits/07-geo-entity-plan.md) §1).
Divergent descriptions split the entity; identical ones corroborate it.

**Canonical facts (paste-safe):**
- Name: **Zabble**
- One-liner: *Zabble is a South African firm that builds bespoke operational systems — automation, audit trails, anomaly detection, and analytics.*
- Location: **South Africa**
- Website: **https://zabble.org**
- Contact: **analytics@zabble.org**
- Disambiguation: *Not affiliated with Zabble, Inc. (US waste-management software).*

After each step, mirror the live URL into:
- `app/data/organization.ts` → `sameAs` (move it out of `sameAsTargets`),
- `public/llms.txt` Contact section,
then run `npm run test:geo` and `npm run generate`.
