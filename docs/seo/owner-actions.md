# Owner Actions — Zabble SEO/AEO/GEO launch

Everything below requires a **human with account/DNS/registrar access** — the
integration is code-complete and merged to `main`, but these steps live outside
the repo. Ordered by priority. Items marked ✅ are already done (recorded for
completeness).

> Context: site is LIVE on Vercel at https://zabble.org (non-www canonical).
> The build ships a **fail-closed indexing guard**: production indexes
> automatically; preview/staging never indexes. Real measurement IDs come from
> env vars only — none are committed.

---

## P0 — flip the site to its launch state

1. **Vercel → set the apex as Primary Domain (B5).**
   Project → Settings → Domains → make `zabble.org` the **Primary Domain** so
   `www` 308-redirects to the apex. The whole site canonicalises non-www; if
   Vercel serves `www` as primary, the served host fights the canonical. (No code
   change — this is the one structural redirect handled at the host layer, like
   the `/pillars → /what-we-build` redirect already in `vercel.json`.)

2. **Vercel → Project → Settings → Environment Variables (Production), then redeploy.**
   Accounts are provisioned + verified live (analytics agent):
   ```
   NUXT_PUBLIC_ANALYTICS_GTM_ID=GTM-MCVWLFV8
   NUXT_PUBLIC_ANALYTICS_GA4_ID=G-3KGPF6HDT2
   NUXT_PUBLIC_ANALYTICS_CLARITY_ID=x1tgkds45o
   NUXT_PUBLIC_SITE_URL=https://zabble.org
   ```
   With these set + a production deploy, `site.indexable` is already true on
   Vercel production (no extra flag needed). An empty/absent id = that tag never
   loads (correct pre-launch state), so deploying before setting them is safe.
   GSC is verified via **DNS** — no verification-meta env vars are required.

---

## P1 — indexing + measurement bring-up (post-deploy)

3. **Submit `sitemap.xml` to Google Search Console + Bing Webmaster Tools.**
   Both properties are verified and already prompting for it. URL:
   `https://zabble.org/sitemap.xml`.

4. **Initial IndexNow bulk ping.** From the repo (or CI): `node scripts/indexnow-ping.mjs`.
   The IndexNow key file is already served at
   `/34cc0be3679dd090c399c3f817b64ee0.txt`. The script **refuses to ping a
   staging/preview host** (verified in tests), so run it against production.

5. **GA4 key events.** Mark `generate_lead` as a **Key event** once it surfaces
   in GA4 (<24h after first lead). Unstar the `close_convert_lead` /
   `qualify_lead` placeholders. `generate_lead` + `schedule_call` are already
   wired into `/diagnose` (lead capture + the book-the-call CTA).

---

## P2 — entity, authority + measurement cadence

6. **Entity `sameAs` / disambiguation (GEO F2).** Generative engines currently
   confuse Zabble with the US "Zabble, Inc." The schema is **wired to accept**
   these the moment they exist (`schemaOrg.identity` in `nuxt.config.ts`, and
   `app/data/organization.ts`):
   - Create + verify owned profiles: LinkedIn company page, Crunchbase, a
     **Wikidata item** (set `different from (P1889)` → Zabble, Inc.).
   - Add each live URL to `schemaOrg.identity.sameAs` (commented placeholders are
     in `nuxt.config.ts`) and to `ORGANIZATION.sameAs` (`app/data/organization.ts`).
7. **Brand logo asset.** Drop a ≥112×112 logo at `/public/zabble-logo.png` and
   uncomment the `logo:` line in `schemaOrg.identity` for the logo rich-result.
8. **Per-page OG image.** Ship `/public/og-default.png` (referenced by
   `usePageSeo`) or wire `nuxt-og-image` for per-page social cards.
9. **Google Business Profile + NAP.** GBP submitted, **pending Google
   verification (≤4 days)**. Once verified, populate the real NAP
   (`app/data/nap.ts` — name/address/phone) to promote the entity to
   `LocalBusiness` (blocker B6: no verified street address yet).
10. **DataForSEO Backlinks subscription** for off-page monitoring (S10/offpage
    kit assumes it).
11. **Run the live Google Rich Results Test** on a representative set after
    deploy: home (Organization/WebSite + FAQPage), a system page
    (Service + FAQPage + Breadcrumb), a `/blog` article (Article), a pillar hub.
12. **Measurement cadence:** monthly AI-visibility (the fixed GEO prompt set in
    `_evidence/07/`) + rank tracking; re-run `validate-schema.mjs` + the SEO
    regression suite (`npm test`) in CI on every deploy.

---

## ✅ Already done (recorded)

- GTM container, GA4 property (Clarity linked), Microsoft Clarity project — created.
- Google Search Console — **Domain property verified via DNS**.
- Bing Webmaster Tools — property imported/verified.
- Google Business Profile — submitted (pending verification, ≤4 days).
- DataForSEO account — verified + funded ($50.998).
