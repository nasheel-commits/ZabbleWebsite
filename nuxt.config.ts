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
  site: {
    url: 'https://zabble.org',
    name: 'Zabble',
    description:
      'Zabble designs bespoke operational systems — automation, audit trails, ' +
      'anomaly detection, and analytics — built around the specific problem ' +
      'slowing your business down.',
  },

  // ── Structured data / Schema.org (S03) ─────────────────────────────────────
  // The site-wide identity. nuxt-schema-org turns this into the root
  // `Organization` node and auto-creates the interlinked `WebSite` (publisher →
  // this org) plus a per-route `WebPage` (isPartOf → WebSite, about → org).
  // The description is kept consistent with the site meta description, the home
  // page copy, and the business reference doc — corroboration matters for GEO.
  //
  // `sameAs` is intentionally absent: NO verified Zabble social/authoritative
  // profiles exist yet. Do not invent URLs — markup must match reality. Populate
  // from S07/S10's verified-profile list (see audits/08-schema.md cross-asks).
  // `logo` is likewise deferred until a ≥112×112 brand asset exists in /public.
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Zabble',
      url: 'https://zabble.org',
      description:
        'Zabble is a bespoke consulting firm based in South Africa. It designs ' +
        'and builds operational systems — automation, audit trails, anomaly ' +
        'detection, and analytics — shaped around the single problem slowing a ' +
        'specific business down.',
      slogan:
        'We don’t sell software. We build the system your business actually needs.',
      email: 'analytics@zabble.org',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ZA',
      },
      areaServed: {
        '@type': 'Country',
        name: 'South Africa',
      },
      knowsAbout: [
        'Business process automation',
        'Audit trails and operational governance',
        'Anomaly detection',
        'Business analytics and decision support',
        'Bespoke operational software systems',
      ],
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
