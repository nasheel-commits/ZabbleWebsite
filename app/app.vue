<script setup lang="ts">
import { computed } from 'vue'
import { canonicalUrl, CANONICAL_SITE_URL } from '~/utils/seo'

// Self-referencing canonical (S01 — indexability). Non-www, no trailing slash
// (except root), query/hash stripped — so faceted `/systems?pillar=` collapses to
// `/systems` (OR-3). Pins the canonical host and prevents duplicate-content
// dilution across the 30+ near-structured system pages. Logic is shared with the
// SEO-regression tests via `canonicalUrl` (app/utils/seo.ts).
const route = useRoute()
const site = useSiteConfig()

const canonicalHref = computed(() =>
  canonicalUrl(route.path, site.url || CANONICAL_SITE_URL),
)

useHead({
  link: [{ rel: 'canonical', href: canonicalHref }],
})
</script>

<template>
  <NuxtPage />
</template>
