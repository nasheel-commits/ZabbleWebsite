<script setup lang="ts">
// Hero for /systems/[slug]. Title + tagline + pillar chips + metadata strip.
// Matches the rhythm of TheFinalCta / TheProblem section openers (eyebrow +
// large display heading + body paragraph).

import { computed } from 'vue'
import { PILLARS, type System } from '~/data/systems'

const props = defineProps<{ system: System }>()

const pillarMetas = computed(() =>
  PILLARS.filter((p) => props.system.pillars.includes(p.slug)),
)

const statusLabel = computed(() => {
  switch (props.system.status) {
    case 'live':        return 'Live'
    case 'in-progress': return 'In progress'
    case 'concept':     return 'Concept'
  }
})
</script>

<template>
  <header class="relative">
    <div class="flex flex-wrap items-center gap-2">
      <span
        class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
      >
        <span class="dot" />
        Bespoke System
      </span>
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2"
      >
        <span
          :class="[
            'h-1.5 w-1.5 rounded-full',
            system.status === 'live'
              ? 'bg-cyan-brand'
              : system.status === 'in-progress'
              ? 'bg-cyan-brand-deep/60'
              : 'bg-mute-2/60',
          ]"
          aria-hidden="true"
        />
        {{ statusLabel }}
      </span>
    </div>

    <h1
      class="mt-5 font-display text-[36px] sm:text-[48px] md:text-[60px] lg:text-[64px] leading-[1.05] tracking-tight text-ink"
    >
      {{ system.name }}
    </h1>

    <p
      class="mt-5 max-w-2xl text-[17px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute"
    >
      {{ system.tagline }}
    </p>

    <div class="mt-6 flex flex-wrap gap-1.5">
      <PillarChip v-for="p in pillarMetas" :key="p.slug" :pillar="p" link />
    </div>

    <dl
      v-if="system.industry || system.bestFor"
      class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl border-t border-line pt-6"
    >
      <div v-if="system.industry">
        <dt class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
          Industry
        </dt>
        <dd class="mt-1.5 text-[15px] text-ink">{{ system.industry }}</dd>
      </div>
      <div v-if="system.bestFor">
        <dt class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
          Best for
        </dt>
        <dd class="mt-1.5 text-[15px] text-ink">{{ system.bestFor }}</dd>
      </div>
    </dl>
  </header>
</template>
