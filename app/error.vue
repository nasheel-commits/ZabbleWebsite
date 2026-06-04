<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'
import { ArrowRight } from '@lucide/vue'

// Custom error page (S01 — indexability). Renders full HTML with site chrome,
// sets the correct status code, and is never indexed.
const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error?.statusCode === 404)
const heading = computed(() => (is404.value ? 'Page not found' : 'Something went wrong'))
const code = computed(() => props.error?.statusCode ?? 500)
const message = computed(() =>
  is404.value
    ? "That page doesn't exist — it may have moved, or the link was mistyped."
    : "An unexpected error occurred on our side. Try again, or head back to safe ground.",
)

useHead({
  title: () => `${code.value} · ${heading.value} · Zabble`,
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased flex flex-col">
    <TheNav />

    <main class="flex-1 flex items-center">
      <section class="mx-auto max-w-3xl px-5 md:px-8 lg:px-12 py-24 md:py-32 text-center">
        <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          <span class="dot" />
          Error {{ code }}
        </div>

        <h1 class="mt-5 font-display text-[34px] sm:text-[44px] md:text-[52px] leading-[1.05] tracking-tight text-ink">
          {{ heading }}
        </h1>

        <p class="mt-5 mx-auto max-w-xl text-[15.5px] md:text-[16.5px] leading-[1.65] text-mute">
          {{ message }}
        </p>

        <div class="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[14px] font-semibold px-5 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            @click="goHome"
          >
            Back to home
            <ArrowRight :size="15" :stroke-width="2" class="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
          <NuxtLink
            to="/systems"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white hover:bg-surface-alt text-ink text-[14px] font-semibold px-5 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Browse systems
          </NuxtLink>
        </div>
      </section>
    </main>

    <TheFooter />
  </div>
</template>
