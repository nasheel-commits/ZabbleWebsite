# Audit 09 — Analytics, Measurement & Indexing

- **Session:** 09 (analytics + indexing track; runs alongside the disciplines in
  `00-conventions.md`. Branch differs from the conventions' S09 *Performance*
  row — this is the measurement/indexing implementation requested for launch.)
- **Branch:** seo/09-analytics
- **Owner:** analytics + indexing engineer (agent)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (foundation, env/secrets pattern). Coordinates with 01
  (robots/sitemap/`site.url`, staging noindex) and 10 (measurement KPIs).
- **Layer(s):** Foundation (measurement + indexing that SEO/AEO/GEO stand on)

## 1. Scope

**Owns / delivers:**
- GA4 + GTM tagging wired into Nuxt, consent-gated, with B2B lead-gen **key
  events** (`generate_lead`, `phone_call_click`, `email_click`, `file_download`,
  `schedule_click`/`schedule_call`, 90% `scroll` on money pages, SPA `page_view`).
- **POPIA Consent Mode v2**: four signals default-**denied** → **update** on
  opt-in; region-scoped to ZA + global; a first-party CMP banner; opt-in (no
  non-essential tag before consent).
- **Microsoft Clarity** first-party, consent-gated, GA4-linkable.
- **Indexing**: IndexNow key hosted + publish-time ping script; GSC Domain
  (DNS TXT) + Bing Webmaster Tools setup **documented** (need DNS/account access).
- A **measurement plan**, an **ID/secret registry**, and a **pre-launch → launch
  checklist** (`measurement-plan.md`, `id-secret-registry.md`, this audit §5).
- ADR `decisions/0002-analytics-stack-and-consent.md`.

**Does NOT cover (hand-offs):**
- `robots.txt`, `sitemap.xml`, `site.url`, staging `noindex` → **S01**. This
  session only *reads* the generated sitemap; it never edits robots/sitemap.
- Per-page `useSeoMeta`/canonicals → S02; JSON-LD → S03. Untouched.
- Ongoing rank/AI tracking via DataForSEO → S10/S08.
- A **privacy/cookie policy page** (`/privacy`) — not yet in the app; a launch
  blocker for POPIA (cross-session ask, §6).

## 2. Method

- Read `00-conventions.md`, `reference/measurement-indexing.md`,
  `reference/nuxt-seo-implementation.md`, and the business overview.
- Inspected the app: `nuxt.config.ts` (prerender + head), `app/app.vue`,
  conversion surfaces (`TheFinalCta.vue`, `CtaStrip.vue`, `TheNav.vue`,
  `TheFooter.vue`), and the primary conversion flow `app/pages/diagnose.vue`
  (contact submit + book-call CTA). Confirmed all contact actions are
  `mailto:analytics@zabble.org`; the booking CTA is a `mailto:` deep-link; there
  is currently **no `tel:`** and **no file download** on the site (handlers added
  for future-proofing).
- Implemented a hand-rolled, env-driven, consent-first measurement layer (see
  ADR 0002 for why hand-rolled over `@nuxt/scripts`).
- Verified with `npm run build` (exit 0) and `npm run generate` (exit 0, 68
  routes, 33 HTML pages) in an **isolated git worktree** (the shared checkout is
  thrashed by the other parallel-session agents). Evidence in `_evidence/09/`.

## 3. Current state (findings)

| # | Finding | Evidence |
|---|---------|----------|
| F1 | Baseline had **zero** measurement: only a static `app.head` title + 1 meta description; no GA4/GTM/Clarity, no consent, no analytics IDs. | `nuxt.config.ts` (read) |
| F2 | All contact CTAs are `mailto:analytics@zabble.org`; the diagnose "Book your 30-minute call" is a `mailto:` deep-link; **no phone or downloads** exist yet. | components read; `[E: 09/static-html-and-consent.note.md]` |
| F3 | The diagnose flow is the **primary B2B conversion** (collects name/email/company) — the correct `generate_lead` trigger. | `app/pages/diagnose.vue:340` |
| F4 | Statically prerendered (Nitro). Analytics MUST be client-side; nothing analytics-related should bake into HTML — verified it doesn't. | `[E: 09/static-html-and-consent.note.md]` |
| F5 | No real GA4/GTM/Clarity IDs or DNS access available pre-launch → wired the full machinery to no-op safely until ids/env are provided. | `[E: 09/static-html-and-consent.note.md]` |
| F6 | Build + prerender are **clean** with the change (no new warnings). | `[E: 09/build-generate-verification.note.md]` |

**Baseline to record (pre-launch, expected zero):** 0 GA4 sessions, 0 key
events, 0 indexed pages, GSC/Bing not yet verified. Post-launch movement is
measured against this zero.

## 4. Gaps & opportunities

| Pri | Gap | Closes with |
|-----|-----|-------------|
| **P0** | No analytics at all → blind at launch. | This session's tagging layer + ids (user provides ids). |
| **P0** | POPIA: must not load non-essential tags before opt-in. | Consent Mode v2 default-denied + first-party CMP (done). |
| **P0** | Not in GSC/Bing → won't be discovered/measured. | Verify GSC Domain (DNS TXT) + Bing import (needs access). |
| **P1** | Slow organic discovery on publish. | IndexNow key + publish-time ping (done; runs at launch). |
| **P1** | No `/privacy` cookie policy for the CMP to link. | Add `/privacy` page (cross-session ask, §6). |
| **P1** | GA4 ↔ GSC + GA4 ↔ Clarity links give cross-tool insight. | Link in GA4/Clarity UIs at launch (checklist). |
| **P2** | Estimated **lead value** (ZAR) for `generate_lead` ROI. | Agree a value; set in GA4 (checklist). |

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| R1 | P0 | Create GTM container + GA4 property (TZ Africa/Johannesburg, currency ZAR), set ids in env (`.env`). | User → env; `id-secret-registry.md` | — |
| R2 | P0 | Build GA4/Clarity tags + Consent Mode + the 6 key-event triggers inside GTM per the container spec. | `measurement-plan.md` §GTM | — |
| R3 | P0 | Verify **GSC Domain** property for `zabble.org` via DNS TXT; submit S01's sitemap once live. | User (DNS) → S01 sitemap | `measurement-plan.md` §Indexing |
| R4 | P0 | POPIA: keep opt-in CMP; mark non-essential tags consent-gated in GTM; ship `/privacy`. | done + cross-session `/privacy` | `[E: 09/static-html-and-consent.note.md]` |
| R5 | P1 | Bing Webmaster Tools — import from GSC; confirm sitemap. | User | `measurement-plan.md` §Indexing |
| R6 | P1 | At each publish: `node scripts/indexnow-ping.mjs` after `nuxt generate` (prod host only). | `scripts/indexnow-ping.mjs` | `[E: 09/static-html-and-consent.note.md]` |
| R7 | P1 | Link **GA4 ↔ GSC** and **GA4 ↔ Clarity** in the respective UIs. | User | `measurement-plan.md` |
| R8 | P2 | Configure AI-engine referral tracking (chatgpt/perplexity/gemini/copilot) as a GA4 channel group / exploration. | S10 | `measurement-plan.md` |

### Pre-launch → launch checklist (condensed; full version in `measurement-plan.md` §Checklist)

**Pre-launch (staging):**
- [ ] GA4 property created — TZ Africa/Johannesburg, currency ZAR; enhanced
      measurement on (incl. SPA history). _(user)_
- [ ] GTM container created; GA4 config + 6 key-event tags + Consent Mode built. _(user, per spec)_
- [ ] Clarity project created; default consent off; GA4 integration enabled. _(user)_
- [ ] ids placed in env (`NUXT_PUBLIC_ANALYTICS_*`); never in git. _(user)_
- [x] App code: consent-gated loader + CMP + key events implemented + build-clean. _(this session)_
- [ ] GSC Domain property added; DNS TXT record published; verified. _(user — DNS)_
- [ ] Bing Webmaster Tools — import from GSC. _(user)_
- [x] IndexNow key hosted at `/<key>.txt` + ping script ready. _(this session)_
- [ ] `/privacy` cookie/POPIA policy page exists + linked from CMP. _(cross-session)_
- [ ] Staging stays `noindex` (S01) — **never** submit staging URLs.

**At launch (production cutover):**
- [ ] Flip env to production ids; deploy.
- [ ] Tag Assistant / GA DebugView: confirm denied-by-default, then events fire
      only after "Accept". _(see measurement-plan §Verification)_
- [ ] GSC: submit `https://zabble.org/sitemap.xml`; URL-inspect + request
      indexing for `/`, `/systems`, top money pages.
- [ ] `node scripts/indexnow-ping.mjs` (prod). 
- [ ] Link GA4↔GSC and GA4↔Clarity. Mark the 6 events as **Key events** in GA4.
- [ ] Record the zero→first-data baseline in `_evidence/09/` + S10.

## 6. Cross-session asks

| Ask | Owner | Mirrored in |
|-----|-------|-------------|
| Confirm `site.url=https://zabble.org`, robots `Sitemap:` line, and **staging `noindex`** so IndexNow/GSC never see staging. Provide the generated `sitemap.xml` path. | **S01** | status.md S01 notes |
| Add a **`/privacy`** (POPIA/cookie) policy page; the CMP + footer should link it. (Not added here to avoid a prerender 404 and S02's metadata ownership.) | **S02/S06 + owner** | status.md notes |
| Fold the 6 key events + AI-referral channel into the launch **KPI set**. | **S10** | status.md S10 notes |
| Provide GA4 id, GTM id, Clarity id, and **DNS access** for the GSC TXT record. | **User** | status.md blockers B4 |

## 7. Evidence index

- `_evidence/09/build-generate-verification.note.md` — `npm run build` + `generate`
  both exit 0; 68 routes / 33 HTML pages; warnings are pre-existing framework noise.
- `_evidence/09/static-html-and-consent.note.md` — proves: no analytics/dataLayer
  in static HTML (POPIA), key-event + consent logic compiled into the client
  bundle, and env→runtimeConfig→client id wiring (test id `GTM-TEST123`).
