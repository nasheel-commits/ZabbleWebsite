import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Nuxt 4 srcDir is app/, and `~` / `@` alias to it. Mirror that for vitest so
// the data modules (which import from `~/data/...`) resolve in a plain node run.
// Use regex finds anchored to `~/` and `@/` so bare `@scope/pkg` imports
// (e.g. `@lucide/vue`) are left untouched.
const appDir = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^~\//, replacement: appDir + '/' },
      { find: /^@\//, replacement: appDir + '/' },
    ],
  },
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
  },
})
