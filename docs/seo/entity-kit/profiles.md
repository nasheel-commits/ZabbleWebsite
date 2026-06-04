# Official profiles — copy-paste ready

Create these in order. Use the **exact** text below on every one — identical
name/description/contact is the corroboration signal. After each goes live, add its
URL to `app/data/organization.ts` → `sameAs` and to `public/llms.txt`.

**Shared fields (paste everywhere):**
- **Name:** `Zabble`
- **Tagline (≤160):** `Zabble is a South African firm that builds bespoke operational systems — automation, audit trails, anomaly detection, and analytics.`
- **About (≈50 words):**
  > Zabble is a South African consulting firm that builds bespoke operational
  > systems — automation, audit trails, anomaly detection, and analytics — shaped
  > around the single problem slowing one specific business down. Zabble does not
  > sell off-the-shelf software; it assembles a library of 30 modules into one
  > operating system, built for one business and no other.
- **Website:** `https://zabble.org`
- **Email:** `sales@zabble.org`
- **Location/Country:** `South Africa`
- **Industry/Category:** Software / IT consulting / business process automation

---

## 1. LinkedIn company page  — highest priority
- Create at https://www.linkedin.com/company/setup/new/
- Name `Zabble`; tagline + About as above; Industry → *IT Services and IT
  Consulting* (or *Software Development*); Location → South Africa; Website →
  zabble.org.
- Target URL: `https://www.linkedin.com/company/zabble` (claim the cleanest handle
  available; record the actual one).

## 2. Google Business Profile  — drives the SA local pack
- Create at https://www.google.com/business/ (needs a verifiable SA presence/address).
- Name `Zabble`; primary category → *Software company* / *Business management
  consultant*; service area → South Africa; website → zabble.org; description as
  above. Verification by postcard/phone.
- This is what feeds the `local_pack` we saw for "business automation company south
  africa" (`_evidence/07/serp-ai-overview__automation-company-za.json`).

## 3. Crunchbase
- Create at https://www.crunchbase.com/ → Add a company.
- Name `Zabble`; description as above; HQ → South Africa; website → zabble.org;
  category → Software / Consulting / Automation.
- Target URL: `https://www.crunchbase.com/organization/zabble`.

## 4. Clutch & GoodFirms  — B2B services directories engines cite
- https://clutch.co/ and https://www.goodfirms.co/ — list under *Software
  Development* / *Business Process Automation* / *South Africa*. Same copy.

## 5. South African tech/startup directories
- List on local directories (e.g. SA startup/agency listings, Ventureburn/
  disrupt-africa company lists, local chambers). Same name + description + ZA.

---

## After each profile is live
1. Add the real URL to `app/data/organization.ts`:
   - move it from `sameAsTargets` into `sameAs`.
2. Add it to `public/llms.txt` (Contact section).
3. `npm run test:geo && npm run generate`; commit.

> Why `sameAs` matters: it tells schema.org/Knowledge-Graph consumers "these
> profiles are the same Zabble", binding the corroboration into one entity. Only
> add URLs that are **live and verified** — a dead `sameAs` weakens the signal.
