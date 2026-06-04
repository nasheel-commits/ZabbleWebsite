<script setup lang="ts">

// Card for a system in the gallery grid.
// The whole card is one keyboard-accessible link to /systems/[slug].
// Pillar chips inside the card are <a> links to the filtered gallery -
// they intercept clicks so the chip link wins over the card link.


import { computed } from 'vue'
import { ArrowRight } from '@lucide/vue'

import { pillarMetasForSystem, type System } from '~/data/systems'

const props = defineProps<{ system: System }>()

const cardHref = computed(() => `/systems/${props.system.slug}`)

const pillarChipsForCard = computed(() => pillarMetasForSystem(props.system))

const statusLabel = computed(() => {
  switch (props.system.status) {
    case 'live':        return 'Live'
    case 'in-progress': return 'In progress'
    case 'concept':     return 'Concept'
  }
})

</script>

<template>
  <article
    class="group relative flex flex-col h-full rounded-2xl border border-line bg-white overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:border-cyan-brand/40 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] focus-within:-translate-y-1 focus-within:border-cyan-brand/40 focus-within:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)]"
  >
    <!-- Whole-card link sits underneath; it captures clicks anywhere except
         on the pillar chip <a> tags, which are layered above via z-10. -->
    <NuxtLink
      :to="cardHref"
      :aria-label="`View ${system.name}`"
      class="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    />

    <!-- Thumbnail: live snapshot of the demo, scaled to fit. Falls back to a
         gradient + monogram for systems without a registered demo. -->
    <div class="relative border-b border-line">
      <SystemDemoThumbnail
        :slug="system.slug"
        :demo-component="system.demoComponent"
        :name="system.name"
      />
      <div
        class="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 backdrop-blur-sm border border-line px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2 z-10"
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
      </div>
    </div>

    <!-- Body -->
    <div class="relative z-10 flex flex-col flex-1 p-5 md:p-6 pointer-events-none">
      <h3 class="font-display text-[22px] md:text-[24px] leading-[1.15] text-ink">
        {{ system.name }}
      </h3>
      <p class="mt-2 text-[15px] leading-[1.55] text-mute">
        {{ system.tagline }}
      </p>

      <div class="mt-4 flex flex-wrap gap-1.5 pointer-events-auto relative z-10">
        <PillarChip
          v-for="p in pillarChipsForCard"
          :key="p.slug"
          :pillar="p"
          link
          compact
        />
      </div>

      <div class="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
        View system
        <ArrowRight
          :size="15"
          class="transition-transform duration-200 group-hover:translate-x-0.5 group-focus-within:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </div>
  </article>
</template>
