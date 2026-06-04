# Wikidata item — submission-ready

Wikidata is the single highest-value disambiguation signal: a structured item that
Google's Knowledge Graph, and most LLMs, read directly. It is far more attainable
than a Wikipedia article (no notability essay required — it needs to be a clearly
identifiable real entity with at least one reference).

**Do this only after Step 1–2 (profiles + ≥1 independent mention) exist**, so the
item has a reference and survives patroller review.

---

## A. Create the Zabble (South Africa) item

Go to https://www.wikidata.org → log in → **Create a new item**
(https://www.wikidata.org/wiki/Special:NewItem).

**Label (English):**
```
Zabble
```
**Description (English)** — this is what disambiguates it in search/Knowledge Graph:
```
South African software consulting firm
```
**Also-known-as / aliases (English):**
```
Zabble (South Africa)
```

### Statements (add each — property → value)

| Property | Value | Notes |
|----------|-------|-------|
| `instance of` (P31) | `business` (Q4830453) | or `enterprise` (Q6881511) |
| `country` (P17) | `South Africa` (Q258) | |
| `headquarters location` (P159) | South Africa (or the city, once public) | |
| `official website` (P856) | `https://zabble.org` | |
| `industry` (P452) | `software industry` (Q880371) / `management consulting` (Q2920921) | |
| `email address` (P968) | `analytics@zabble.org` | optional |
| **`different from` (P1889)** | **the Zabble, Inc. item (§B)** | **the key disambiguation statement** |
| `inception` (P571) | founding year | add once confirmed |

**Reference each factual statement** (especially P856/P17) with:
- `reference URL` (P854) → `https://zabble.org`, and/or the LinkedIn/Crunchbase URL
  from Step 1. At least one reference keeps the item from being flagged.

---

## B. The `different from` target (Zabble, Inc., US)

`different from` (P1889) needs a target item for the US company.

1. Search Wikidata for "Zabble" / "Zabble Inc". If an item for the **US
   waste-management company** exists, use its QID as the P1889 value.
2. If none exists, create it (same steps as §A):
   - Label: `Zabble, Inc.`
   - Description: `American waste-management software company`
   - Statements: `instance of` (P31) → business (Q4830453); `country` (P17) →
     `United States of America` (Q30); `official website` (P856) →
     `https://www.zabbleinc.com`.
   - Reference: `https://www.zabbleinc.com` (and the SBIR profile
     `https://www.sbir.gov/portfolio/1697261` corroborates it).
3. On **both** items, add `different from` (P1889) pointing at the other — the
   relationship is reciprocal and patrollers prefer it on both sides.

---

## C. After creation — wire it back

1. Copy the new Zabble (SA) QID (e.g. `Q1234567`).
2. In `app/data/organization.ts`:
   - replace the `wikidata.org/wiki/SPECIAL:NewItem` entry in `sameAsTargets` with
     `https://www.wikidata.org/wiki/Q1234567`, then move it into `sameAs`.
   - set `differentFrom.wikidata` to the **Zabble, Inc.** QID.
3. Add the Wikidata URL to `public/llms.txt` Contact section.
4. Run `npm run test:geo` and `npm run generate`; commit.

This gives every engine a structured, referenced anchor that says, unambiguously:
*Zabble = South African operations-systems consultancy, and it is not Zabble, Inc.*
