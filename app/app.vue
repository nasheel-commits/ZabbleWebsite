<script setup lang="ts">
import { computed } from 'vue'

// Self-referencing canonical (S01 — indexability). Sourced from the canonical
// site URL (nuxt.config `site.url`). Policy: no trailing slash except the root.
// Prevents duplicate-content dilution across the 30+ near-structured system pages
// and pins the canonical host to the production domain.
const route = useRoute()
const site = useSiteConfig()

const canonicalHref = computed(() => {
  const base = (site.url || 'https://zabble.org').replace(/\/+$/, '')
  const path = route.path === '/' ? '' : route.path.replace(/\/+$/, '')
  return `${base}${path}` || `${base}/`
})

useHead({
  link: [{ rel: 'canonical', href: canonicalHref }],
})
</script>

<template>
  <NuxtPage />
</template>
