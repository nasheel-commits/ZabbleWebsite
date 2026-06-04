<script setup lang="ts">
// Small chip representing a pillar. Two render modes:
//
//   <PillarChip :pillar="meta" />               -> <span>      (decorative, e.g. inside SystemHero)
//   <PillarChip :pillar="meta" link />          -> <NuxtLink>  (jumps to the pillar hub)
//
// In link mode the chip points at the canonical pillar hub
// /what-we-build/<slug> (NOT the old faceted /systems?pillar= view). This makes
// every pillar chip a module->pillar internal link (rules L2/L6) and removes the
// faceted URLs from the crawlable graph (audit A5; coordinate canonical with
// S01 OR-3).
//
// The visual style matches the site's eyebrow + chip language (cyan-tinted
// rounded-full pill, no new tokens). Icon is rendered at chip scale.

import type { PillarMeta } from '~/data/systems'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    pillar: PillarMeta
    /** When true, render as a link to the pillar hub. */
    link?: boolean
    /** Compact = no icon, tighter padding. Use inside dense card footers. */
    compact?: boolean
    /** When true, renders an inert pressed/selected look (used by the filter bar). */
    selected?: boolean
  }>(),
  { link: false, compact: false, selected: false },
)

const href = computed(() => `/what-we-build/${props.pillar.slug}`)

const baseClasses =
  'inline-flex items-center gap-1.5 rounded-full border text-[12px] font-semibold tracking-[0.04em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white'

const stateClasses = computed(() =>
  props.selected
    ? 'border-cyan-brand bg-cyan-brand/15 text-ink ring-1 ring-cyan-brand/40'
    : 'border-line bg-white/70 text-mute hover:text-ink hover:border-cyan-brand/40 hover:bg-cyan-brand/[0.06]',
)

const sizeClasses = computed(() =>
  props.compact ? 'px-2.5 py-1' : 'px-3 py-1.5',
)
</script>

<template>
  <NuxtLink
    v-if="link"
    :to="href"
    :aria-label="`${pillar.label} systems`"
    :class="[baseClasses, stateClasses, sizeClasses]"
  >
    <component
      v-if="!compact"
      :is="pillar.icon"
      :size="13"
      :stroke-width="2"
      aria-hidden="true"
    />
    <span>{{ pillar.short }}</span>
  </NuxtLink>
  <span v-else :class="[baseClasses, stateClasses, sizeClasses]">
    <component
      v-if="!compact"
      :is="pillar.icon"
      :size="13"
      :stroke-width="2"
      aria-hidden="true"
    />
    <span>{{ pillar.short }}</span>
  </span>
</template>
