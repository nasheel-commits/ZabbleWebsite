import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // `nuxt-schema-org` added by S03 (structured data). NOTE for S01: the
  // `@nuxtjs/seo` umbrella already bundles nuxt-schema-org — when it lands,
  // dedupe this entry on rebase and keep the `site` + `schemaOrg` blocks below.
  modules: ['@nuxt/fonts', 'nuxt-schema-org'],
  css: ['~/assets/css/main.css'],

  // ── Site identity (S03 provisional; S01 owns final site/SEO-module wiring) ──
  // `site.url` is the canonical absolute-URL source of truth for every JSON-LD
  // `@id` / `url`. Set once here so schema renders correct absolute IDs even
  // before S01 installs the full SEO suite. Coordinate via status.md (§2).
  // `description` = boilerplate "A" (micro) from the GEO entity standard
  // (docs/seo/audits/07-geo-entity-plan.md §1) — kept consistent with llms.txt
  // and the Organization description below so the entity reads as one thing.
  site: {
    url: 'https://zabble.org',
    name: 'Zabble',
    description:
      'Zabble is a South African firm that builds bespoke operational systems — ' +
      'automation, audit trails, anomaly detection, and analytics.',
  },

  // ── Structured data / Schema.org (S03) ─────────────────────────────────────
  // Site-wide identity. nuxt-schema-org turns this into the root `Organization`
  // node (@id …/#identity) and auto-creates the interlinked `WebSite` (publisher
  // → org) plus a per-route `WebPage` (isPartOf → WebSite, about → org).
  //
  // `description` + `knowsAbout` are byte-identical to the GEO entity standard
  // (07-geo-entity-plan.md §1–2, boilerplate "B") and public/llms.txt — one
  // entity, one description, everywhere (divergent descriptions split the
  // entity for generative engines).
  //
  // `disambiguatingDescription` is the entity-disambiguation lever (07-geo §2–3):
  // generative engines currently confuse this firm with the US "Zabble, Inc."
  // (zabbleinc.com) [E: 07/llm-response__pplx-sonarpro__brand-zabble.json]. This
  // is the schema.org-sanctioned "different from" available today; the Wikidata
  // `different from (P1889)` link is added to `sameAs` once S10 creates the item.
  //
  // `sameAs` is intentionally ABSENT: every owned profile (LinkedIn / Crunchbase
  // / Wikidata / Google Business Profile) is still PENDING (07-geo §2/§4, 04
  // local plan). A dead or wrong `sameAs` weakens the entity, so each URL is
  // added only once it is live (S07/S10). `logo` is wired-on-arrival — no
  // ≥112×112 brand asset exists in /public yet (only favicon.ico); see the LOGO
  // marker below + 04 GBP plan §2.5. NOT a `LocalBusiness`: no verified NAP
  // exists (04 local plan blocker B6 — name/address/phone pending). `areaServed`
  // carries the ZA local signal in the meantime.
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Zabble',
      url: 'https://zabble.org',
      description:
        'Zabble is a South African consulting firm that builds bespoke ' +
        'operational systems — automation, audit trails, anomaly detection, and ' +
        'analytics — shaped around the single problem slowing one specific ' +
        'business down.',
      disambiguatingDescription:
        'Zabble is the South African bespoke operational-systems consultancy at ' +
        'zabble.org; it is unrelated to Zabble, Inc., the United States ' +
        'waste-management software company.',
      slogan:
        'We don’t sell software. We build the system your business actually needs.',
      email: 'analytics@zabble.org',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ZA',
      },
      // Country-level certainty + the three metros S04's local plan designates
      // as service areas (04 local plan §2). No street address is claimed (none
      // verified — blocker B6).
      areaServed: [
        { '@type': 'Country', name: 'South Africa' },
        { '@type': 'City', name: 'Johannesburg' },
        { '@type': 'City', name: 'Cape Town' },
        { '@type': 'City', name: 'Pretoria' },
      ],
      knowsAbout: [
        'business process automation',
        'workflow automation',
        'audit trails',
        'anomaly detection',
        'business analytics',
        'bespoke software development',
        'document intelligence',
        'reconciliation automation',
        'regulatory reporting automation',
        'custom CRM',
      ],
      // LOGO (wire-on-arrival): uncomment once /public/zabble-logo.png (≥112×112,
      // on white) exists — schema then gains the logo enhancement. Tracked in
      // audits/08-schema.md (G2) + 04 GBP plan §2.5.
      // logo: 'https://zabble.org/zabble-logo.png',
      //
      // SAMEAS (wire-on-arrival): add each verified profile URL once it is live
      // (07-geo §2/§4). Keep absent until then — no fabricated/placeholder URLs.
      // sameAs: [
      //   'https://www.linkedin.com/company/<zabble>',
      //   'https://www.crunchbase.com/organization/<zabble>',
      //   'https://www.wikidata.org/wiki/<Qid>',
      // ],
    },
  },
  fonts: {
    families: [
      { name: 'Inter', weights: [400, 500, 600, 700, 800], styles: ['normal'] },
      { name: 'Instrument Serif', weights: [400], styles: ['normal'] },
    ],
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/systems', '/diagnose'],
    },
  },
  routeRules: {
    '/':           { prerender: true },
    '/systems':    { prerender: true },
    '/systems/**': { prerender: true },
    '/diagnose':   { prerender: true },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Zabble · Bespoke Digital Systems',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        {
          name: 'description',
          content:
            'Zabble designs bespoke operational systems: automation, audit trails, anomaly detection, and analytics. Built around the specific problem slowing your business down.',
        },
        { name: 'color-scheme', content: 'light only' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'supported-color-schemes', content: 'light' },
      ],
    },
  },
})
