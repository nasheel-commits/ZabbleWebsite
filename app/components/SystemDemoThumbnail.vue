<script setup lang="ts">
// Renders the live demo component for a system as a scaled, non-interactive
// snapshot, used as the thumbnail on /systems gallery cards.
//
// Behaviour:
//   - Mounts the demo lazily, only when the card scrolls into (or near) the
//     viewport, so /systems doesn't pay the cost of 30+ demos at once.
//   - Renders the demo at a fixed native width and applies `transform: scale`
//     so the same demo fills any card width consistently.
//   - Disables interaction (pointer-events: none, aria-hidden), it is a
//     visual snapshot, not a control surface. The whole-card NuxtLink wins.
//   - Falls back to a gradient + monogram for systems without a registered
//     demo (concept-stage entries), matching the previous look.

import { computed, onBeforeUnmount, onMounted, ref, shallowRef, type Component } from 'vue'
import { resolveDemoComponent } from '~/utils/demoRegistry'

const props = defineProps<{
  /** System slug, also the default registry key. */
  slug: string
  /** Optional registry override (System.demoComponent). */
  demoComponent?: string
  /** Used as the monogram fallback when no demo is registered. */
  name: string
}>()

const root = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const visible = ref(false)
const resolved = shallowRef<Component | null>(null)

// Native render size for the demo inside the snapshot. Picked to match the
// width the demos are designed against (≈ the /systems/[slug] detail page
// content column). Height clips via overflow-hidden, the snapshot shows the
// top portion of the demo, which is always the most visually distinctive.
const NATIVE_WIDTH = 1200

const scale = computed(() => {
  if (!containerWidth.value) return 0
  return containerWidth.value / NATIVE_WIDTH
})

const monogram = computed(() => {
  const parts = props.name
    .split(/[\s&]+/)
    .filter((w) => w && !/^(and|the|&)$/i.test(w))
  return parts.slice(0, 3).map((w) => w[0]?.toUpperCase()).join('')
})

const fallbackStyle = computed(() => {
  let h = 0
  for (const ch of props.slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const angle = h % 360
  const offset = 40 + (h % 30)
  return {
    backgroundImage: `linear-gradient(${angle}deg, rgba(1,219,241,0.18) 0%, rgba(246,248,251,1) ${offset}%, #ffffff 100%)`,
  }
})

let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null

onMounted(() => {
  if (!root.value) return

  // Track width for the scale transform.
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) containerWidth.value = entry.contentRect.width
    })
    ro.observe(root.value)
  } else {
    containerWidth.value = root.value.clientWidth
  }

  // Mount the demo only once the card nears the viewport.
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.value = true
            resolved.value = resolveDemoComponent(props.slug, props.demoComponent)
            io?.disconnect()
            io = null
            break
          }
        }
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(root.value)
  } else {
    visible.value = true
    resolved.value = resolveDemoComponent(props.slug, props.demoComponent)
  }
})

onBeforeUnmount(() => {
  io?.disconnect()
  io = null
  ro?.disconnect()
  ro = null
})

const hasDemo = computed(() => resolved.value !== null)
</script>

<template>
  <div
    ref="root"
    class="relative w-full aspect-[16/9] overflow-hidden bg-surface-alt"
    aria-hidden="true"
  >
    <!-- Snapshot of the actual demo, scaled to fit the card. -->
    <div
      v-if="hasDemo && visible && scale > 0"
      class="absolute top-0 left-0 origin-top-left pointer-events-none select-none"
      :style="{
        width: `${NATIVE_WIDTH}px`,
        transform: `scale(${scale})`,
      }"
    >
      <component :is="resolved" />
    </div>

    <!-- Fallback: gradient + monogram for systems with no registered demo. -->
    <div
      v-else-if="!hasDemo && visible"
      class="absolute inset-0 flex items-center justify-center"
      :style="fallbackStyle"
    >
      <span class="font-display text-[44px] leading-none tracking-tight text-ink/30">
        {{ monogram }}
      </span>
    </div>

    <!-- Loading state: same gradient surface so we don't flash a hard edge
         while the async demo chunk is in flight. -->
    <div
      v-else
      class="absolute inset-0"
      :style="fallbackStyle"
    />
  </div>
</template>
