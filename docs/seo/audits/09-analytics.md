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
- **POPIA pages**: real, server-rendered **`/privacy`** (POPIA notice) and
  **`/cookie-policy`** (cookie categories + manage control), linked from the CMP
  banner/dialog and the footer.
- **Microsoft Clarity** first-party, consent-gated, GA4-linkable.
- **Indexing**: IndexNow key hosted + publish-time ping script; **in-code GSC +
  Bing verification** meta (env fallback to DNS TXT); GSC Domain (DNS TXT) + Bing
  Webmaster Tools setup **documented** (need DNS/account access).
- **Automated test harness** (`npm test`, node:test, zero deps): consent defaults,
  opt-in gating, key-event wiring, IndexNow staging-refusal + payload, and
  zero-tags-in-static-HTML — 21 checks, self-contained.
- A **measurement plan**, an **ID/secret registry**, a **consolidated owner list**
  (§8), and a **pre-launch → launch checklist** (`measurement-plan.md`,
  `id-secret-registry.md`, this audit §5/§8).
- ADR `decisions/0002-analytics-stack-and-consent.md`.

**Does NOT cover (hand-offs):**
- `robots.txt`, `sitemap.xml`, `site.url`, staging `noindex` → **S01**. This
  session only *reads* the generated sitemap; it never edits robots/sitemap.
- Per-page `useSeoMeta`/canonicals for the *marketing* pages → S02; JSON-LD → S03.
  Untouched. (The new legal pages carry their own minimal `useHead`.)
- Ongoing rank/AI tracking via DataForSEO → S10/S08.

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
  ADR 0002 for why hand-rolled over `@nuxt/scripts`), the two POPIA pages, a
  universal verification-meta plugin, and a node:test harness.
- Verified with `npm run build` (exit 0), `npm run generate` (exit 0, **72
  routes / 35 HTML pages** incl. `/privacy` + `/cookie-policy`), and **`npm test`
  (21/21, self-contained cold run)** in an **isolated git worktree outside
  OneDrive** (the shared checkout is thrashed by the other parallel-session
  agents). Evidence in `_evidence/09/`.

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
| ~~P1~~ | ~~No `/privacy` / cookie policy for the CMP to link.~~ **RESOLVED** | `/privacy` + `/cookie-policy` built + linked (done). |
| **P1** | GA4 ↔ GSC + GA4 ↔ Clarity links give cross-tool insight. | Link in GA4/Clarity UIs at launch (checklist). |
| **P2** | Estimated **lead value** (ZAR) for `generate_lead` ROI. | Agree a value; set in GA4 (checklist). |

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| R1 | P0 | Create GTM container + GA4 property (TZ Africa/Johannesburg, currency ZAR), set ids in env (`.env`). | User → env; `id-secret-registry.md` | — |
| R2 | P0 | Build GA4/Clarity tags + Consent Mode + the 6 key-event triggers inside GTM per the container spec. | `measurement-plan.md` §GTM | — |
| R3 | P0 | Verify **GSC Domain** property for `zabble.org` via DNS TXT; submit S01's sitemap once live. | User (DNS) → S01 sitemap | `measurement-plan.md` §Indexing |
| R4 | P0 | POPIA: opt-in CMP + `/privacy` + `/cookie-policy` shipped; mark non-essential tags consent-gated in GTM. | **done** (this session) | `[E: 09/test-harness-and-pages.note.md]` |
| R5 | P1 | Bing Webmaster Tools — import from GSC; confirm sitemap. (Or set `NUXT_PUBLIC_VERIFICATION_BING` for the meta-tag method.) | User | `measurement-plan.md` §Indexing |
| R6 | P1 | At each publish: `node scripts/indexnow-ping.mjs` after `nuxt generate` (prod host only). | `scripts/indexnow-ping.mjs` | `[E: 09/test-harness-and-pages.note.md]` |
| R7 | P1 | Link **GA4 ↔ GSC** and **GA4 ↔ Clarity** in the respective UIs. | User | `measurement-plan.md` |
| R8 | P1 | Verify GSC/Bing via DNS TXT (preferred) **or** the in-code meta tags (`NUXT_PUBLIC_VERIFICATION_*`). | User | `[E: 09/test-harness-and-pages.note.md]` |
| R9 | P2 | Configure AI-engine referral tracking (chatgpt/perplexity/gemini/copilot) as a GA4 channel group / exploration. | S10 | `measurement-plan.md` |

### Pre-launch → launch checklist (condensed; full version in `measurement-plan.md` §Checklist)

**Pre-launch (staging):**
- [ ] GA4 property created — TZ Africa/Johannesburg, currency ZAR; enhanced
      measurement on (incl. SPA history). _(user)_
- [ ] GTM container created; GA4 config + 6 key-event tags + Consent Mode built. _(user, per spec)_
- [ ] Clarity project created; default consent off; GA4 integration enabled. _(user)_
- [ ] ids placed in env (`NUXT_PUBLIC_ANALYTICS_*`); never in git. _(user)_
- [x] App code: consent-gated loader + CMP + key events implemented + build-clean. _(this session)_
- [x] POPIA `/privacy` + `/cookie-policy` pages built + linked from CMP + footer. _(this session)_
- [x] In-code GSC/Bing verification meta + IndexNow key + ping script + tests. _(this session)_
- [ ] GSC Domain property added; DNS TXT record published; verified _(user — DNS)_,
      **or** set `NUXT_PUBLIC_VERIFICATION_GOOGLE` for the HTML-tag fallback.
- [ ] Bing Webmaster Tools — import from GSC _(user)_, **or** set `NUXT_PUBLIC_VERIFICATION_BING`.
- [ ] Staging stays `noindex` (S01) — **never** submit staging URLs.

**At launch (production cutover):**
- [ ] Flip env to production ids; deploy.
- [ ] Tag Assistant / GA DebugView: confirm denied-by-default, then events fire
      only after "Accept". _(see measurement-plan §Verification)_
- [ ] GSC: **submit the sitemap** `https://zabble.org/sitemap.xml` (S01's); URL-inspect
      + request indexing for `/`, `/systems`, top money pages.
- [ ] `node scripts/indexnow-ping.mjs` (prod) after `nuxt generate`.
- [ ] Link GA4↔GSC and GA4↔Clarity. Mark the 6 events as **Key events** in GA4.
- [ ] Record the zero→first-data baseline in `_evidence/09/` + S10.

## 6. Cross-session asks

| Ask | Owner | Mirrored in |
|-----|-------|-------------|
| Confirm `site.url=https://zabble.org`, robots `Sitemap:` line, and **staging `noindex`** so IndexNow/GSC never see staging. Provide the generated `sitemap.xml` path. | **S01** | status.md S01 notes |
| Fold the 6 key events + AI-referral channel into the launch **KPI set**. | **S10** | status.md S10 notes |
| Provide GA4/GTM/Clarity ids + **DNS access** (or verification meta values) — see the owner list §8. | **User** | status.md blockers B4 |

> The earlier `/privacy` cross-session ask is **resolved** — both POPIA pages are
> now built and linked in-session.

## 7. Evidence index

- `_evidence/09/build-generate-verification.note.md` — `npm run build` + `generate`
  both exit 0; warnings are pre-existing framework noise.
- `_evidence/09/static-html-and-consent.note.md` — no analytics/dataLayer in static
  HTML (POPIA); key-event + consent logic in the client bundle; env→runtimeConfig→
  client id wiring (test id `GTM-TEST123`).
- `_evidence/09/test-harness-and-pages.note.md` — `npm test` 21/21 (cold,
  self-contained); verification meta renders from env; POPIA pages prerendered +
  linked; IndexNow dry-run payload + staging refusal.

## 8. Consolidated owner list — what the user must provide for launch

Everything below is the **only** remaining launch dependency. Drop the ids into
`.env` and publish one DNS record, and the stack goes live as documented. None of
these are committed to git.

| # | Item | Where it goes | Notes |
|---|------|---------------|-------|
| 1 | **GA4 Measurement ID** (`G-XXXXXXXXXX`) | `.env` → `NUXT_PUBLIC_ANALYTICS_GA4_ID` | Create GA4 property: **TZ Africa/Johannesburg, currency ZAR**, enhanced measurement on (incl. SPA history). Only needed directly if not using GTM. |
| 2 | **GTM container ID** (`GTM-XXXXXXX`) | `.env` → `NUXT_PUBLIC_ANALYTICS_GTM_ID` | Build the container per `measurement-plan.md` §3 (GA4 + 6 key-event tags + Consent Mode). Primary path. |
| 3 | **Clarity project ID** | `.env` → `NUXT_PUBLIC_ANALYTICS_CLARITY_ID` | Microsoft Clarity → enable the **GA4 integration**. |
| 4 | **GSC verification** | DNS **TXT** on `zabble.org` (preferred) **or** `.env` → `NUXT_PUBLIC_VERIFICATION_GOOGLE` | Domain property works pre-launch; the meta tag is the in-code fallback. |
| 5 | **Bing verification** | Import from GSC (carries it) **or** `.env` → `NUXT_PUBLIC_VERIFICATION_BING` | — |
| 6 | **Google Business Profile (GBP)** | Google Business Profile console | Local-SEO entity for "South Africa" + map pack; primarily **S10**'s, surfaced here so it isn't missed at launch. |
| 7 | **GA4↔GSC + GA4↔Clarity links** | GA4 Admin / Clarity Settings | One-time UI links at launch. |
| 8 | **Estimated lead value (ZAR)** _(optional)_ | GA4 key-event default value, or `value` in `diagnose.vue` | For ROI on `generate_lead`. Currently `0`. |
