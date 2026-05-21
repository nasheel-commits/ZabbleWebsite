<script setup lang="ts">
// Placeholder slot for a system's interactive demo on /systems/[slug].
//
// =============================================================================
// Demo registration contract
// =============================================================================
//
// 1. Create the demo component at:
//      app/components/demos/<slug>.vue
//
//    e.g. for the "legal-intake-automation" system:
//      app/components/demos/legal-intake-automation.vue
//
// 2. Add an entry to the `demoRegistry` map below:
//
//      'legal-intake-automation': defineAsyncComponent(
//        () => import('~/components/demos/legal-intake-automation.vue'),
//      ),
//
// 3. The demo component will be lazy-loaded only when its detail page renders
//    — it is NOT shipped in the initial bundle for /systems or any other page.
//
// 4. Demo components should:
//    - Be self-contained (no required props).
//    - Use the same design tokens / class strings as the rest of the site
//      (see brand.md).
//    - Stay light: this slot reserves full-width space; the demo fills it
//      and is responsible for its own internal layout.
//
// 5. If two systems share a demo, set `demoComponent: 'shared-key'` on the
//    second system entry in data/systems.ts. DemoSlot will look up by that
//    override key first, falling back to `systemSlug`.
//
// =============================================================================

import { defineAsyncComponent, computed, shallowRef, watch, type Component } from 'vue'
import { Sparkles } from '@lucide/vue'
import { systemBySlug } from '~/data/systems'

const props = defineProps<{ systemSlug: string }>()

// Add real demos here as they're built. Empty registry = "Interactive demo
// coming soon" placeholder for every system, which is the scaffolding state.
const demoRegistry: Record<string, Component> = {
  // 'legal-intake-automation': defineAsyncComponent(
  //   () => import('~/components/demos/legal-intake-automation.vue'),
  // ),
}

const resolved = shallowRef<Component | null>(null)

watch(
  () => props.systemSlug,
  (slug) => {
    const sys = systemBySlug(slug)
    const key = sys?.demoComponent ?? slug
    resolved.value = demoRegistry[key] ?? null
  },
  { immediate: true },
)

const hasDemo = computed(() => resolved.value !== null)
</script>

<template>
  <section
    :aria-label="hasDemo ? 'Interactive demo' : 'Interactive demo placeholder'"
    class="relative"
  >
    <div
      v-if="hasDemo"
      class="rounded-2xl border border-line bg-white overflow-hidden"
    >
      <component :is="resolved" />
    </div>

    <div
      v-else
      class="rounded-2xl border border-dashed border-line bg-surface-alt/60 px-6 py-14 md:py-20 text-center"
    >
      <span
        class="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white border border-line text-cyan-brand-deep mb-4"
        aria-hidden="true"
      >
        <Sparkles :size="20" :stroke-width="1.8" />
      </span>
      <p class="font-display text-[22px] md:text-[26px] text-ink leading-[1.2]">
        Interactive demo coming soon.
      </p>
      <p class="mt-2 text-[14.5px] text-mute max-w-md mx-auto">
        We'll wire a live, runnable preview of this system here. In the meantime,
        the story is above and the pillars are below.
      </p>
    </div>
  </section>
</template>
