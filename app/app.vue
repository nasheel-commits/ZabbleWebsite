<script setup lang="ts">
import { organizationJsonLd } from '~/data/organization'

// Site-wide Organization entity (GEO). Canonical node — S03/S08 should extend this
// (e.g. per-page Service/Product nodes) rather than redeclare the Organization.
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(organizationJsonLd()),
    },
  ],
})
</script>

<template>
  <NuxtPage />
</template>
