<script setup lang="ts">
// Multi-select filter bar for the systems gallery.
//
// State is owned by /systems and synced to ?pillar= in the URL (comma list).
// Emits "update:active" so the parent can both run the filter and update the URL.

import { computed } from 'vue'
import { PILLARS, type PillarSlug } from '~/data/systems'

const props = defineProps<{ active: PillarSlug[] }>()
const emit = defineEmits<{ (e: 'update:active', value: PillarSlug[]): void }>()

const allActive = computed(() => props.active.length === 0)

function toggle(slug: PillarSlug) {
  const set = new Set(props.active)
  if (set.has(slug)) set.delete(slug)
  else set.add(slug)
  emit('update:active', Array.from(set))
}

function clearAll() {
  emit('update:active', [])
}

const baseChip =
  'inline-flex items-center gap-1.5 rounded-full border text-[13px] font-semibold transition-colors px-3.5 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white touch-manipulation'
</script>

<template>
  <div
    role="group"
    aria-label="Filter systems by pillar"
    class="flex flex-wrap items-center gap-2"
  >
    <button
      type="button"
      :class="[
        baseChip,
        allActive
          ? 'border-ink bg-ink text-white hover:bg-ink-soft'
          : 'border-line bg-white text-mute hover:text-ink hover:border-ink/30',
      ]"
      :aria-pressed="allActive"
      @click="clearAll"
    >
      All
    </button>

    <button
      v-for="p in PILLARS"
      :key="p.slug"
      type="button"
      :class="[
        baseChip,
        active.includes(p.slug)
          ? 'border-cyan-brand bg-cyan-brand/15 text-ink ring-1 ring-cyan-brand/40 hover:bg-cyan-brand/20'
          : 'border-line bg-white text-mute hover:text-ink hover:border-cyan-brand/40 hover:bg-cyan-brand/[0.04]',
      ]"
      :aria-pressed="active.includes(p.slug)"
      @click="toggle(p.slug)"
    >
      <component :is="p.icon" :size="14" :stroke-width="2" aria-hidden="true" />
      {{ p.label }}
    </button>
  </div>
</template>
