# Reference — SEO implementation in this Nuxt 4 codebase

How to actually ship SEO/AEO/GEO foundations in *this* repo. Grounded in the real
current state — verify against the files before you change them; this doc is a
guide, not a substitute for reading `nuxt.config.ts`.

---

## 1. What we're working with (current state, 2026-06-04)

From `nuxt.config.ts`, `package.json`, `app/`:

- **Nuxt `^4.4.6`**, Vue `^3.5`, Tailwind v4 (`@tailwindcss/vite`), `@nuxt/fonts`.
- **Statically prerendered** via Nitro: `nitro.prerender.routes` + `routeRules`
  prerender `/`, `/systems`, `/systems/**`, `/diagnose`. `crawlLinks: true`.
  → Crawlers receive **full HTML** at request time. This is the single best thing
  about our SEO baseline — keep it.
- **Global head** set in `app.head` (`nuxt.config.ts`): a default title, one meta
  description, `htmlAttrs.lang = 'en'`, color-scheme metas. That's the *entirety*
  of current SEO markup.
- **Routes / page files:**
  - `app/pages/index.vue` — home (`/`)
  - `app/pages/systems/index.vue` — systems index (`/systems`)
  - `app/pages/systems/[slug].vue` — 30 system detail pages (`/systems/<slug>`)
  - `app/pages/diagnose.vue` — `/diagnose`
- **Data:** `app/data/systems.ts` is the single source of truth for systems
  (slug, name, tagline, pillars, problem/whatWeBuilt/whatChanged, status). SEO
  copy for system pages should derive from here, not be hand-duplicated.
- **`public/robots.txt`:** permissive but bare — `User-Agent: *` / `Disallow:`
  with **no `Sitemap:` line and no host**. Needs work (S01).

**What's missing** (the foundation work): per-page titles/descriptions, canonical
URLs, Open Graph / Twitter cards, a real `sitemap.xml`, a sitemap reference in
robots, `hreflang`/locale signal for `en-ZA`, and **all** structured data
(`Organization`, `Service`/`Product`, `BreadcrumbList`, `FAQPage`).

---

## 2. Recommended approach: the Nuxt SEO suite

Rather than hand-roll, adopt the maintained Nuxt SEO modules. The umbrella module
`@nuxtjs/seo` bundles the pieces we need:

- **Sitemap** (`@nuxtjs/sitemap`) — generates `sitemap.xml`, integrates with
  prerendered routes including dynamic `/systems/[slug]`.
- **Robots** (`@nuxtjs/robots`) — manages `robots.txt` + per-route indexing,
  adds the `Sitemap:` line automatically.
- **Schema.org** (`nuxt-schema-org`) — typed JSON-LD (`defineOrganization`,
  `defineWebSite`, `defineWebPage`, `defineBreadcrumb`, etc.).
- **OG Image** (`nuxt-og-image`) — generated social images per page.
- **Link Checker** + **SEO utils** — broken-link detection, `useSeoMeta`
  ergonomics, canonical/`site.url` handling.

> **Version caution (do not hard-code).** Confirm the current `@nuxtjs/seo` major
> that supports **Nuxt 4.4** before installing — pin the version that the module's
> compatibility matrix lists for Nuxt 4, and record the chosen version + date in
> the S01 audit. Don't paste a version number from memory. If a sub-module lags
> Nuxt 4 support, install the individually-maintained ones that do.

Decision to record as an ADR (S01): adopt `@nuxtjs/seo` umbrella vs. cherry-pick
sub-modules. Default recommendation: umbrella, unless a compat gap forces
cherry-picking.

The one config every SEO module needs:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  site: {
    url: 'https://zabble.org',
    name: 'Zabble',
    defaultLocale: 'en',   // en-ZA market; 'en' is the language code
  },
  // ...existing config
})
```
`site.url` is the canonical/absolute-URL source of truth for sitemap, OG images,
canonicals, and schema. Set it once.

---

## 3. Per-page metadata — `useSeoMeta` (S02)

Move from the single global description to **per-page** titles and descriptions.
Use `useSeoMeta` (handles OG/Twitter in one call).

**Static page (`app/pages/systems/index.vue`):**
```vue
<script setup lang="ts">
useSeoMeta({
  title: 'Operational systems we build — Zabble',
  description:
    'Browse the building blocks Zabble assembles into bespoke operating systems ' +
    'for South African businesses: automation, audit trails, anomaly detection, analytics.',
  ogTitle: 'Operational systems we build — Zabble',
  ogDescription: 'Bespoke operational systems for South African businesses.',
  ogType: 'website',
})
</script>
```

**Dynamic system page (`app/pages/systems/[slug].vue`) — derive from `systems.ts`:**
```vue
<script setup lang="ts">
import { systemBySlug } from '~/data/systems' // confirm the actual export name
const route = useRoute()
const system = systemBySlug(route.params.slug as string)

useSeoMeta({
  title: () => `${system.name} — Zabble`,
  description: () => system.tagline,            // or a dedicated seoDescription field
  ogTitle: () => `${system.name} — Zabble`,
  ogDescription: () => system.tagline,
  ogType: 'article',
})
</script>
```
> **Content risk (see AEO/GEO principles §2):** 30 pages sharing structure will
> produce thin/duplicate meta if `tagline` is generic. S05/S06 should give each
> system a **distinct, intent-bearing** title + description. Consider adding
> `seoTitle` / `seoDescription` / `faq` fields to the `System` interface in
> `systems.ts` so SEO copy lives with the data (coordinate: S02 proposes the
> field, owner of `systems.ts` adds it).

**Canonical:** with `site.url` set, the SEO module derives canonicals
automatically. For any page reachable by multiple paths, set canonical explicitly
via `useHead({ link: [{ rel: 'canonical', href }] })`.

---

## 4. Structured data / JSON-LD (S03)

Two tiers:

**Site-wide (in `app/app.vue` or a plugin):**
```ts
useSchemaOrg([
  defineOrganization({
    name: 'Zabble',
    description:
      'Zabble builds bespoke operational systems — automation, audit trails, ' +
      'anomaly detection, and analytics — for South African businesses.',
    url: 'https://zabble.org',
    email: 'sales@zabble.org',
    sameAs: [/* LinkedIn, directories — fill from S10 */],
    address: { '@type': 'PostalAddress', addressCountry: 'ZA' },
  }),
  defineWebSite({ name: 'Zabble' }),
])
```
This `Organization` block is **GEO infrastructure** — it's how the "Zabble"
entity gets defined for AI engines. Keep the description identical to the
boilerplate used elsewhere (corroboration).

**Per system page:** a `Service` (or `Product`) entity + `BreadcrumbList`:
```ts
useSchemaOrg([
  defineWebPage(),
  defineBreadcrumb({ itemListElement: [
    { name: 'Systems', item: '/systems' },
    { name: system.name, item: `/systems/${system.slug}` },
  ]}),
  // a Service node describing the module as an entity (good for GEO extraction)
])
```

**FAQ (AEO, S07):** add `defineFaqPage`/`FAQPage` where a page carries a real
Q&A block. Tie the visible FAQ copy to the schema 1:1 (don't schema-markup
questions that aren't on the page).

Implementation note: prerendering means JSON-LD is baked into static HTML —
exactly what crawlers and AI engines want. Verify the rendered `<script
type="application/ld+json">` appears in the generated `.output/public/**` HTML
(S03 evidence).

---

## 5. Sitemap & robots (S01)

- With `@nuxtjs/sitemap` + `site.url`, dynamic routes (`/systems/[slug]`) must be
  enumerated for the sitemap. Source them from `systems.ts` (the module already
  integrates with prerender `crawlLinks`, but provide an explicit URL list for
  reliability).
- `@nuxtjs/robots` should emit a `robots.txt` that allows crawling **and** adds
  `Sitemap: https://zabble.org/sitemap.xml`. Replace the bare `public/robots.txt`
  (or let the module own it — decide in S01, record as ADR; don't have both a
  static file and the module fighting).
- **Pre-launch guard:** while the site is on a staging URL, ensure staging is
  `noindex` (env-conditioned robots) so we don't index the staging domain. Flip
  to indexable only on `zabble.org` at launch. This is a P0 for S01.

---

## 6. Performance (S09) — already has a head start

- `@nuxt/fonts` is in use (Inter, Instrument Serif) — good (self-hosts, avoids
  layout shift). S09 confirms `font-display` and preloading.
- Static prerender = fast TTFB. S09 focuses on CWV: LCP image handling, CLS from
  fonts/animations (there's a `reveal` plugin + scroll components — check for
  CLS), JS payload from the 30 demo components.
- Cross-reference the existing `speed_audit.md` at repo root — S09 should
  reconcile its findings with that doc rather than start cold.

---

## 7. Implementation order (dependency-aware)

1. **S01** sets `site.url`, installs/【version-confirms】the SEO suite, fixes
   robots + sitemap + staging noindex. *Everything else depends on `site.url`.*
2. **S03** adds site-wide `Organization`/`WebSite` schema (entity foundation).
3. **S05** delivers the keyword map → unblocks distinct copy.
4. **S02** wires per-page `useSeoMeta` using S05's targets.
5. **S06** writes distinct per-module copy + FAQ blocks (kills duplication risk).
6. **S03 + S07** add per-page `Service`/`FAQPage` schema for AEO.
7. **S08** hardens entities + quotable claims for GEO.
8. **S09** tunes CWV. **S10** handles off-page + measurement wiring.

Keep changes additive and announce file touches in `status.md` (conventions §2).

## 8. Sources
- Nuxt SEO: https://nuxtseo.com
- `useSeoMeta`: https://nuxt.com/docs/api/composables/use-seo-meta
- Nuxt Schema.org: https://nuxtseo.com/schema-org
- Nitro prerendering: https://nuxt.com/docs/getting-started/deployment#static-hosting
