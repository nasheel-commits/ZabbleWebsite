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

  modules: [
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-link-checker',
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
