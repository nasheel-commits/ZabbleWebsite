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
    include: ['tests/**/*.test.ts'],
  },
})
