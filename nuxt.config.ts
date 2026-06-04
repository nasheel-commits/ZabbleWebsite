import tailwindcss from '@tailwindcss/vite'
import { liveSystemRoutes, goneSystemRoutes, computeIndexable } from './app/utils/seo'
import { REDIRECTS, buildRedirectRouteRules } from './app/data/redirects'

// ---------------------------------------------------------------------------
// SEO foundation wiring — owned by S01 (Technical SEO & Crawlability).
// See docs/seo/audits/01-technical.md and docs/seo/decisions/*
// ---------------------------------------------------------------------------

// System detail routes are sourced from the single source of truth
// (app/data/systems.ts) and split by publish status so prerender + sitemap never
// drift from the data:
//  • liveSystemRoutes — published money pages: prerendered, in sitemap, 200.
//  • goneSystemRoutes — concept/in-progress (thin/orphan): NOT prerendered, NOT
//    in sitemap, noindex, and served 410 by the [slug].vue gate (OR-4).
const priorityRoutes = [
  '/', '/systems', '/diagnose', '/contact',
  '/pillars', '/industries', '/insights',
  ...liveSystemRoutes,
]

// noindex + 410-defence routeRules for every un-published system page (OR-4).
// `prerender: false` overrides the '/systems/**' prerender glob so these are
// served on demand by Nitro (→ [slug].vue → createError 410) instead of baked
// as static 200s. `X-Robots-Tag` + meta-robots keep them out of the index even
// on the 410 response.
const goneRouteRules = Object.fromEntries(
  goneSystemRoutes.map((p) => [
    p,
    { prerender: false, robots: 'noindex, nofollow', headers: { 'X-Robots-Tag': 'noindex' } },
  ]),
)

// Pre-launch indexing guard (reference/measurement-indexing.md §1.3):
// FAIL-CLOSED. The build is NON-indexable unless explicitly flipped at launch.
// Production (Vercel `production` env) is indexable AUTOMATICALLY, so deploying
// this config to the live site can never accidentally noindex it. Preview/staging
// deploys (Vercel `preview`) — and any build lacking these signals — stay
// NON-indexable: `Disallow: /` + noindex, so a staging domain never indexes.
// Explicit override for non-Vercel hosts: NUXT_SITE_INDEXABLE=true.
const SITE_URL = process.env.NUXT_SITE_URL || 'https://zabble.org'
const INDEXABLE = computeIndexable(process.env)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // S01 wires the SEO sub-modules individually (the @nuxtjs/seo umbrella is a
  // dep but not registered as one module); S03's `nuxt-schema-org` is added to
  // the same list. `site` (incl. description) + `schemaOrg` live below.
  modules: [
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-link-checker',
    'nuxt-schema-org',
  ],

  // --- Broken-link detection (build-time report; never fails the build) -------
  linkChecker: {
    enabled: true,
    failOnError: false,
    report: { html: true, markdown: true },
    // Concept/410 pages are intentionally unreachable — don't flag them.
    excludeLinks: goneSystemRoutes,
  },

  css: ['~/assets/css/main.css'],

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

  // --- Site identity: single source of truth for absolute URLs ----------------
  // Used by @nuxtjs/sitemap (loc), @nuxtjs/robots (host + Sitemap line), and the
  // canonical <link> in app/app.vue.
  site: {
    url: SITE_URL,
    name: 'Zabble',
    // Micro boilerplate (GEO entity standard "A") — kept consistent with the
    // Organization description (schemaOrg below) + public/llms.txt so the entity
    // reads as one thing across SEO, schema and AI surfaces (S03/S07).
    description:
      'Zabble is a South African firm that builds bespoke operational systems — ' +
      'automation, audit trails, anomaly detection, and analytics.',
    // en-ZA market; 'en' is the language code. HTML lang is set to en-ZA below.
    defaultLocale: 'en',
    // Canonical URLs carry no trailing slash.
    trailingSlash: false,
    // Pre-launch guard (see above). Default false → staging never indexes.
    indexable: INDEXABLE,
  },

  // --- robots.txt — AI-crawler policy per ADR-0002 ----------------------------
  // When `site.indexable` is false (default / staging) the module emits a global
  // `Disallow: /` + noindex — the pre-launch guard. The groups below are the
  // LAUNCH policy, emitted once NUXT_SITE_INDEXABLE=true.
  robots: {
    // Do NOT block AI bots — GEO depends on being crawlable + citable.
    blockAiBots: false,
    blockNonSeoBots: false,
    // Baseline: everything may crawl everything at launch.
    allow: ['/'],
    // Explicit allow-list of AI search / answer / inference + reputable training
    // crawlers. Documentary + robust: if '*' is ever narrowed, these stay allowed.
    // Rationale + full list: docs/seo/decisions/0002-ai-crawler-policy.md
    groups: [
      {
        userAgent: [
          // OpenAI
          'OAI-SearchBot', 'ChatGPT-User', 'GPTBot',
          // Perplexity
          'PerplexityBot', 'Perplexity-User',
          // Google (AI Overviews / Gemini) + classic
          'Google-Extended', 'Googlebot',
          // Microsoft / Bing / Copilot
          'Bingbot',
          // Apple (Siri / Spotlight AI)
          'Applebot', 'Applebot-Extended',
          // Anthropic
          'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
          // Others that drive answers / corroboration
          'Amazonbot', 'DuckAssistBot', 'cohere-ai', 'CCBot', 'Meta-ExternalAgent',
        ],
        allow: ['/'],
      },
    ],
    // Emit the Sitemap: line (only when indexable).
    sitemap: '/sitemap.xml',
  },

  // --- sitemap.xml — dynamic source from SYSTEMS, with lastmod ----------------
  sitemap: {
    // Explicit URLs for reliability (in addition to prerender auto-discovery).
    urls: priorityRoutes,
    // Never expose internal/build/api routes — or the un-published system pages.
    exclude: ['/_**', '/api/**', '/200.html', '/404.html', ...goneSystemRoutes],
    autoLastmod: true,
    defaults: { changefreq: 'monthly', priority: 0.7 },
  },

  // --- Nitro: prerender every live priority route to full static HTML ---------
  nitro: {
    prerender: {
      crawlLinks: true,             // discover any linked routes automatically
      // priorityRoutes (top of file) now includes the S02 hub entry points
      // (/contact, /pillars, /industries, /insights) alongside the live system
      // money pages — so prerender + sitemap never miss a hub. crawlLinks then
      // discovers the dynamic children from those hubs + footer links.
      routes: priorityRoutes,       // belt-and-suspenders explicit list (live only)
      ignore: goneSystemRoutes,     // never prerender concept pages, even if linked
      // A single broken link should not fail the whole static build.
      failOnError: false,
    },
  },

  routeRules: {
    // Marketing / module / tool / hub pages → static HTML.
    '/':              { prerender: true },
    '/systems':       { prerender: true },
    '/systems/**':    { prerender: true },
    '/pillars':       { prerender: true },
    '/pillars/**':    { prerender: true },
    '/industries':    { prerender: true },
    '/industries/**': { prerender: true },
    '/insights':      { prerender: true },
    '/insights/**':   { prerender: true },
    '/diagnose':      { prerender: true },
    '/contact':       { prerender: true },

    // Un-published system pages → not prerendered, noindex, served 410 (OR-4).
    ...goneRouteRules,

    // 301 redirect map for retired/renamed paths (OR-2). Empty until a published
    // slug actually changes; the slug-immutability policy (ADR-0004) guarantees
    // these `from` paths never overlap a live page, so the stub-clobber hazard
    // (ADR-0003) does not apply.
    ...buildRedirectRouteRules(REDIRECTS),

    // NOTE: structural canonicalisation (trailing-slash, clean URLs, www→apex)
    // is handled at the host layer (vercel.json + Vercel domain settings), NOT
    // here — a `redirect` routeRule on a LIVE static path emits a meta-refresh
    // stub that clobbers the real page. See docs/seo/decisions/0003-redirect-map.md.
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      // Global title template (S02 / on-page). Pages set a bare, distinct `title`
      // via usePageSeo / useSeoMeta; this appends the brand → "<title> · Zabble".
      // The bare `title` below is only the fallback for a route that sets none.
      titleTemplate: '%s · Zabble',
      title: 'Bespoke Digital Systems',
      htmlAttrs: {
        // en-ZA: English, South Africa primary market (conventions §7).
        lang: 'en-ZA',
      },
      meta: [
        {
          // Fallback description only. Per-page descriptions come from usePageSeo.
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
