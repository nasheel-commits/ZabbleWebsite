import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
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
