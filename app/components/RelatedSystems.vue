<script setup lang="ts">
// "Related systems" block for module detail pages (SEO session 04, rule L5).
//
// Turns each module page from an in-degree-1 dead-end into a node in a topical
// cluster: it links out to 3–6 sibling modules that share pillars, with the
// module NAME as the (descriptive) anchor text — not a generic "view system"
// (fixes audit issue A6). Equity flows module->module within a pillar, and the
// shared-pillar context tells crawlers/AI engines these entities are related.
//
// Anchor-text note: the visible link text is the module name; the adjacent
// tagline supplies the capability phrasing. Vary inbound anchors elsewhere
// (pillar hubs, use-cases) per internal-linking.md §2.

import { computed } from 'vue'
import { ArrowUpRight } from '@lucide/vue'

import type { System } from '~/data/systems'

const props = withDefaults(
  defineProps<{ system: System; limit?: number }>(),
  { limit: 4 },
)

const related = computed(() => relatedSystems(props.system, props.limit))
</script>

<template>
  <section
    v-if="related.length"
    class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24"
    aria-labelledby="related-systems-heading"
  >
    <div v-reveal class="mb-7 md:mb-9 max-w-2xl">
      <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
        <span class="dot" />
        Related systems
      </div>
      <h2
        id="related-systems-heading"
        class="mt-3 font-display text-[26px] sm:text-[30px] md:text-[34px] leading-[1.12] tracking-tight text-ink"
      >
        Systems we often build alongside this one.
      </h2>
    </div>

    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      <li
        v-for="(s, i) in related"
        :key="s.slug"
        v-reveal:scale="i * 60"
      >
        <NuxtLink
          :to="`/systems/${s.slug}`"
          class="group flex flex-col h-full rounded-2xl border border-line bg-white p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-brand/40 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <span class="flex items-start justify-between gap-3">
            <span class="font-display text-[19px] md:text-[20px] leading-[1.15] text-ink">
              {{ s.name }}
            </span>
            <ArrowUpRight
              :size="17"
              class="mt-0.5 shrink-0 text-mute-2 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
              aria-hidden="true"
            />
          </span>
          <span class="mt-2 text-[14px] leading-[1.55] text-mute line-clamp-3">
            {{ s.tagline }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
