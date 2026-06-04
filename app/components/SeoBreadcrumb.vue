<script setup lang="ts">
// Accessible breadcrumb trail (SEO session 04, internal-linking rule L4).
//
// Replaces the single "<- All systems" back-link on module pages with a real
// Home > Systems > <Name> trail. Two wins:
//   1. internal linking, every page links up its canonical spine (/systems is
//      the canonical parent of all module pages, per site-architecture.md §2.2);
//   2. it is the visible counterpart to the BreadcrumbList JSON-LD that S03 adds
//      (keep the visible trail and the schema itemListElement 1:1).
//
// Pure presentational: pass the crumbs in. The LAST crumb is the current page -
// rendered as plain text with aria-current, not a link.
//
// Usage (module page):
//   <SeoBreadcrumb :items="[
//     { label: 'Home', to: '/' },
//     { label: 'Systems', to: '/systems' },
//     { label: system.name },           // current page, no `to`
//   ]" />

import { ChevronRight } from '@lucide/vue'

export interface Crumb {
  label: string
  /** Omit on the final (current) crumb. */
  to?: string
}

defineProps<{ items: Crumb[] }>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
    <ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13.5px] font-medium text-mute">
      <li
        v-for="(item, i) in items"
        :key="item.label"
        class="inline-flex items-center gap-x-1.5"
      >
        <NuxtLink
          v-if="item.to && i < items.length - 1"
          :to="item.to"
          class="hover:text-ink transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >{{ item.label }}</NuxtLink>
        <span
          v-else
          class="text-ink"
          aria-current="page"
        >{{ item.label }}</span>

        <ChevronRight
          v-if="i < items.length - 1"
          :size="14"
          :stroke-width="2"
          class="text-mute-2 shrink-0"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>
