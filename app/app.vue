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

// Site-wide self-referencing canonical (S01).
//
// The Organization / WebSite entity is emitted ONCE, site-wide, by
// nuxt-schema-org from `schemaOrg.identity` in nuxt.config (S03, JSON-LD owner) —
// NOT here. A second hand-rolled Organization node (the earlier GEO app.vue
// block, @id …/#organization) would split the entity against nuxt-schema-org's
// @id …/#identity, so it was removed. `app/data/organization.ts` is retained for
// the on-page entity panel (TheEntity.vue) and its content is kept byte-identical
// to the schemaOrg identity. Per-page Service/FAQPage/Article nodes extend the
// same entity from their pages.
useHead({
  link: [{ rel: 'canonical', href: canonicalHref }],
})
</script>

<template>
  <NuxtPage />
  <!-- POPIA consent banner (S09 analytics). Renders only when an analytics id
       is configured; nothing loads until the visitor opts in. -->
  <ConsentBanner />
</template>
