import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Vitest config for the SEO-regression suite. Aliases mirror Nuxt 4's `~`/`@`
// (→ app/) so the tests import the exact modules the app + nuxt.config use.
export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url)),
      '@@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Unified suite across sessions: technical (tests/seo/*.test.ts),
    // content (tests/*.spec.ts), AEO (test/*.spec.ts). `.ts`-only by design so
    // the node:test `.mjs` suites (architecture, geo, analytics) are NOT picked
    // up here — those run via `npm run test:node`.
    include: ['tests/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**', '**/.nuxt/**', '**/.output/**', '**/dist/**'],
  },
})
