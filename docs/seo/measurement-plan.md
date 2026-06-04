# Measurement Plan — Zabble (GA4 · GTM · Clarity · Consent · Indexing)

Owned by **S09 (analytics)**. How Zabble measures behaviour and gets indexed,
POPIA-first. Pairs with `reference/measurement-indexing.md` (the strategy) and
`id-secret-registry.md` (where every id/secret lives). Code lives in
`app/plugins/1.analytics.client.ts`, `app/plugins/2.analytics-events.client.ts`,
`app/components/ConsentBanner.vue`, `app/composables/useAnalytics.ts`.

---

## 0. Architecture in one paragraph

A client-only Nuxt plugin boots `dataLayer` + `gtag`, immediately pushes
**Consent Mode v2 defaults = denied** (region ZA + global) **before any tag
loads**, and then loads **nothing** until the visitor opts in via a first-party
CMP banner. On "Accept" it pushes `consent update` (granted) and injects **GTM**
(which carries GA4) and **Microsoft Clarity**. A second plugin auto-captures the
B2B key events by event delegation (so we don't touch 30 components) and pushes
them to the `dataLayer`. Real ids come only from env → `runtimeConfig`. With no
id, the whole layer is a safe no-op (the correct pre-launch state).

```
boot → consent default (DENIED, ZA+global) → CMP banner
        └─ Accept → consent update (GRANTED) → load GTM (+GA4) + Clarity
        └─ Reject → stays denied, nothing loads
events (delegated): mailto→email_click · tel→phone_call_click · download→file_download
                    /diagnose→schedule_click · 90% money-page→scroll · route→page_view
                    diagnose submit→generate_lead · book-call→schedule_call
```

---

## 1. GA4 property settings (in the GA4 UI — not code)

| Setting | Value |
|---------|-------|
| Reporting time zone | **(GMT+02:00) Johannesburg — Africa/Johannesburg** |
| Currency | **South African Rand (ZAR)** |
| Enhanced measurement | **On**, including **"Page changes based on browser history events"** (SPA page_views) |
| Data retention | 14 months (max) |
| Google signals | Off unless ads remarketing is needed (POPIA — keep minimal) |
| IP anonymisation | GA4 anonymises by default; in gtag-direct mode we also set `anonymize_ip:true` |
| GA4 ↔ GSC link | **Link** (Admin → Product links → Search Console) |
| GA4 ↔ Clarity link | Enable in **Clarity → Settings → Integrations → Google Analytics** |

Mark these as **Key events** (Admin → Events → mark as key event):
`generate_lead`, `schedule_call`, `schedule_click`, `phone_call_click`,
`email_click`, `file_download`. (`generate_lead` is the headline conversion.)

---

## 2. Key events (what the code emits)

All events are pushed to `dataLayer` as `{ event: '<name>', ...params }`; create
a matching **GTM trigger (Custom Event)** + **GA4 Event tag** for each. In
gtag-direct mode (no GTM container) they are also sent via `gtag('event', …)`.

| Event | Fires when | Key params | Money page? |
|-------|-----------|------------|-------------|
| `generate_lead` | Diagnose contact form submitted (name+email+company) | `currency:'ZAR'`, `value:0`, `lead_source`, `business_type`, `primary_pain`, `timeline` | conversion |
| `schedule_call` | "Book your 30-minute call" on the diagnose result | `lead_source:'diagnose_result'`, `link_url` | conversion |
| `schedule_click` | Any link to `/diagnose` ("Book a discovery call" etc.) | `link_url`, `link_text` | intent |
| `email_click` | Any `mailto:` (analytics@zabble.org) | `link_url`, `email_address` | intent |
| `phone_call_click` | Any `tel:` link (none today; future-proofed) | `link_url`, `phone_number` | intent |
| `file_download` | Link with `download` attr or a file extension (none today; future-proofed) | `file_name`, `file_extension`, `link_url` | intent |
| `scroll` | 90% depth reached on a money page | `percent_scrolled:90`, `page_path` | engagement |
| `page_view` | Every SPA route change (+ initial) | `page_path`, `page_location`, `page_title` | all |

**Money pages** = `/`, `/systems`, `/systems/*`. Any element can override
inference with `data-analytics-event="<name>"` + `data-analytics-*` params
(that's how the diagnose book-call CTA is tagged `schedule_call`).

GA4 lead value: `generate_lead` ships `currency:'ZAR', value:0`. Once an
estimated lead value is agreed, change `value` (in `diagnose.vue`) or set a
default value on the GA4 key event — gives ROI/value reporting in ZAR.

---

## 3. GTM container spec (build this in the GTM UI)

The code loads GTM and feeds it the dataLayer; the container does the routing.

**Variables**
- Built-in: *Click Element, Click URL, Page Path, Page Title*.
- **GA4 Configuration**/Measurement ID = `{{const - GA4 ID}}` (a Constant var).
- DLV variables for each key-event param above (e.g. `DLV - lead_source`).

**Consent (Container Settings → Consent Overview / built-in consent)**
- Enable **Consent Mode**. The page already pushes `consent default` (denied)
  and `consent update` (granted), so set every GA4/Clarity tag to **require**
  `analytics_storage` (GA4/Clarity) and ad tags to require `ad_storage` etc.
  ("Require additional consent" on each tag → the matching signal).

**Tags**
1. **GA4 Configuration** — Measurement ID `{{const - GA4 ID}}`; *Send a page view
   = off* (we send `page_view` explicitly for SPA control), Consent = `analytics_storage`.
   Trigger: *Initialization – All Pages*.
2. **GA4 Event – page_view** → trigger Custom Event `page_view`; params
   `page_path`, `page_location`, `page_title`.
3. **GA4 Event – generate_lead** → Custom Event `generate_lead`; params
   `currency, value, lead_source, business_type, primary_pain, timeline`.
4. **GA4 Event – schedule_call / schedule_click / email_click /
   phone_call_click / file_download / scroll** → one Custom Event trigger each,
   mapping the params in §2.
5. **Microsoft Clarity** — either the **Clarity GTM template** (project id
   `{{const - Clarity ID}}`, require `analytics_storage`) **or** rely on the
   first-party loader in `1.analytics.client.ts` (already consent-gated). Pick
   one to avoid double-loading (ADR 0002 default: first-party loader).

> If you prefer **no GTM** and only GA4: set `NUXT_PUBLIC_ANALYTICS_GA4_ID` and
> leave `GTM_ID` empty — the loader uses gtag directly and still fires every key
> event. GTM is recommended for flexibility (this is the documented default).

---

## 4. Consent Mode v2 / POPIA — how it behaves

- **Four signals** default **denied**: `ad_storage`, `ad_user_data`,
  `ad_personalization`, `analytics_storage` (+ `functionality_storage`,
  `personalization_storage` denied; `security_storage` granted).
- Pushed **twice**: region-scoped `region:['ZA']` and a global default, both
  denied, with `wait_for_update:500`. Plus `ads_data_redaction:true` and
  `url_passthrough:true`.
- **Opt-in (stricter than Google's modeling default):** we do **not** load GTM /
  GA4 / Clarity at all until the visitor clicks **Accept** (or a stored grant is
  found). On grant we push `consent update` (granted) **then** inject tags. So
  "no non-essential tag fires before consent" holds literally — no cookieless
  pings either. Reject → nothing loads; choice persisted (`localStorage`
  `zabble_consent_v1`), banner doesn't re-prompt; re-openable via the footer
  **"Cookie settings"** link.
- **CMP**: first-party `ConsentBanner.vue` (Accept / Reject equal weight +
  per-category Manage). Swappable for a managed CMP (CookieYes / Usercentrics) —
  see ADR 0002; the Consent Mode wiring is CMP-agnostic.

---

## 5. Microsoft Clarity

- Loaded first-party from `https://www.clarity.ms/tag/<id>` **only after**
  analytics consent; `clarity('consent')` is then called (Clarity v2 consent API).
- **Default consent off** (it never loads pre-consent).
- **Link to GA4**: Clarity → Settings → Integrations → Google Analytics (sends a
  `clarity` dimension/event into GA4 and lets you jump GA4 → Clarity session
  replays). Enable at launch.

---

## 6. Indexing

### IndexNow (done in-repo)
- Public key **`34cc0be3679dd090c399c3f817b64ee0`** hosted at
  `public/34cc0be3679dd090c399c3f817b64ee0.txt` → served at
  `https://zabble.org/34cc0be3679dd090c399c3f817b64ee0.txt`.
- Ping at publish time **after** `nuxt generate`:
  `node scripts/indexnow-ping.mjs` (add `--dry-run` to preview). It reads
  `.output/public/sitemap.xml` (S01's), falls back to walking the generated
  HTML, scopes to the prod host, and **refuses staging/preview/localhost** unless
  `--force`. Submits to `https://api.indexnow.org/indexnow` (Bing/Yandex/Seznam).

### Google Search Console (needs DNS access — user)
1. GSC → Add property → **Domain** → `zabble.org`.
2. Copy the `google-site-verification=…` **TXT** record Google shows.
3. Add it at the DNS host (a `TXT` on the apex `zabble.org`). Wait for propagation; **Verify**.
   (Domain property covers http/https + all subdomains and works **pre-launch**.)
4. After launch: **Sitemaps** → **submit** `https://zabble.org/sitemap.xml` (S01's).
   **URL Inspection** → request indexing for `/`, `/systems`, top money pages.
5. Watch **Pages**: "Discovered – not indexed" on system pages would confirm the
   thin/duplicate risk (S02/S06 copy work).

> **In-code fallback (no DNS):** GSC also offers an **HTML tag** method (URL-prefix
> property). Paste the tag's `content` value into `.env` →
> `NUXT_PUBLIC_VERIFICATION_GOOGLE`; `app/plugins/seo-verification.ts` renders
> `<meta name="google-site-verification" …>` into the prerendered HTML. DNS TXT is
> still preferred (covers the whole domain, pre-launch).

### Bing Webmaster Tools (user)
- bing.com/webmasters → Add site → **Import from Google Search Console** (fast
  path; carries verification + sitemap). Confirm the sitemap. Bing also feeds
  Copilot (a GEO signal).
- **In-code fallback:** Bing's "Add a meta tag" method → put the `msvalidate.01`
  content value in `.env` → `NUXT_PUBLIC_VERIFICATION_BING` (same plugin renders it).

---

## 7. Verification (at launch, with real ids + a URL)

1. Open the site with **Tag Assistant** (tagassistant.google.com) connected.
2. Before accepting: confirm `dataLayer` shows `consent default` with all four
   = **denied**, and **no** GA4/GTM/Clarity network requests.
3. Click **Accept**: confirm a `consent update` with `analytics_storage:granted`,
   then GTM/GA4 load and Clarity loads. **Reject** in a fresh session: confirm
   nothing loads.
4. **GA4 DebugView**: trigger each key event (submit diagnose → `generate_lead`;
   click a mailto → `email_click`; scroll a money page to 90% → `scroll`;
   navigate → `page_view`). Confirm params + ZAR currency on `generate_lead`.
5. Confirm `https://zabble.org/<key>.txt` returns the key (IndexNow), then run
   the ping and check Bing's IndexNow report.

### Automated regression guard — `npm test` (node:test, zero deps)

What a browser can't check pre-launch, the suite asserts on every run (21 checks,
self-contained — it regenerates the site with placeholder ids if needed):

- `tests/analytics-source.test.mjs` — Consent Mode v2 four signals **denied** by
  default, region **ZA**, opt-in gating (tags load only on grant), gtag pushes
  `arguments`, every key event wired, `generate_lead` (ZAR) + `schedule_call`.
- `tests/indexnow.test.mjs` — ping **refuses** staging/preview/localhost and emits
  a correct, host-scoped payload (`--force` overrides for the real cutover).
- `tests/static-html.test.mjs` — with placeholder ids set, prerendered HTML has
  **zero** tags/dataLayer yet the id reaches the client payload; verification meta
  render from env; `/privacy` + `/cookie-policy` prerendered + footer-linked.

`npm run test:source` runs the 15 build-free checks; `npm test` runs all 21.

---

## 9. POPIA pages

`/privacy` (privacy/POPIA notice — responsible party, info collected, lawful
bases, operators, cross-border, retention, **data-subject rights**, Information
Regulator) and `/cookie-policy` (categories table, opt-in explanation, a working
**Manage cookie settings** control that re-opens the CMP). Both are real,
prerendered pages, linked from the CMP banner/dialog and the footer.

---

## 10. Pre-launch → launch checklist

See `audits/09-analytics.md` §5 for the authoritative checklist, and §8 there for
the **consolidated owner list**. In short: **pre-launch** — create GA4 (TZ/ZAR) +
GTM + Clarity, set env ids, verify GSC (DNS TXT or meta) + Bing, keep staging
`noindex` ( `/privacy` + `/cookie-policy` are already built); **launch** — switch
to prod ids, verify with Tag Assistant/DebugView + `npm test`, **submit the
sitemap** + request indexing, run IndexNow, link GA4↔GSC + GA4↔Clarity, mark key
events, record the baseline.

## 11. Sources
- Consent Mode v2: https://developers.google.com/tag-platform/security/guides/consent
- GA4 SPA / history: https://support.google.com/analytics/answer/9216061
- GTM: https://support.google.com/tagmanager
- Microsoft Clarity: https://learn.microsoft.com/en-us/clarity/
- IndexNow: https://www.indexnow.org/documentation
- GSC domain property: https://support.google.com/webmasters/answer/9008080
- POPIA: https://popia.co.za
