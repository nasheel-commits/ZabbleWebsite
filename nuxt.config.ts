import tailwindcss from '@tailwindcss/vite'
import { SYSTEMS } from './app/data/systems'

// ---------------------------------------------------------------------------
// SEO foundation wiring — owned by S01 (Technical SEO & Crawlability).
// See docs/seo/audits/01-technical.md and docs/seo/decisions/0002-ai-crawler-policy.md
// ---------------------------------------------------------------------------

// The 32 system detail routes, sourced from the single source of truth
// (app/data/systems.ts) so the prerender list + sitemap never drift from the data.
const systemRoutes = SYSTEMS.map((s) => `/systems/${s.slug}`)

// Every route that must emit full server-rendered HTML and appear in the sitemap.
const priorityRoutes = ['/', '/systems', '/diagnose', ...systemRoutes]

// Pre-launch indexing guard (reference/measurement-indexing.md §1.3):
// FAIL-CLOSED. The build is NON-indexable unless explicitly flipped at launch.
// Production (Vercel `production` env) is indexable AUTOMATICALLY, so deploying
// this config to the live site can never accidentally noindex it. Preview/staging
// deploys (Vercel `preview`) — and any build lacking these signals — stay
// NON-indexable: `Disallow: /` + noindex, so a staging domain never indexes.
// Explicit override for non-Vercel hosts: NUXT_SITE_INDEXABLE=true.
const SITE_URL = process.env.NUXT_SITE_URL || 'https://zabble.org'
const INDEXABLE =
  process.env.NUXT_SITE_INDEXABLE === 'true' ||
  process.env.VERCEL_ENV === 'production'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

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
    // Never expose internal/build/api routes.
    exclude: ['/_**', '/api/**', '/200.html', '/404.html'],
    autoLastmod: true,
    defaults: { changefreq: 'monthly', priority: 0.7 },
  },

  // --- Nitro: full static prerender of every priority route ------------------
  nitro: {
    prerender: {
      crawlLinks: true,           // discover any linked routes automatically
      routes: priorityRoutes,     // belt-and-suspenders explicit list
      // A single broken link should not fail the whole static build.
      failOnError: false,
    },
  },

  routeRules: {
    // Marketing / module / tool pages → static HTML.
    '/':           { prerender: true },
    '/systems':    { prerender: true },
    '/systems/**': { prerender: true },
    '/diagnose':   { prerender: true },

    // NOTE: structural canonicalisation (trailing-slash, clean URLs, www→apex)
    // is handled at the host layer (vercel.json + Vercel domain settings), NOT
    // here. A `redirect` routeRule on a static path emits a meta-refresh stub at
    // that path's index.html, which would CLOBBER the real prerendered page
    // (e.g. '/systems/' and '/systems' share systems/index.html). The redirect
    // map lives in docs/seo/decisions/0003-redirect-map.md.
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'Zabble · Bespoke Digital Systems',
      htmlAttrs: {
        // South-Africa market locale signal.
        lang: 'en-ZA',
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
