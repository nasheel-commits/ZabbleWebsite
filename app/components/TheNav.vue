<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ArrowRight, ArrowUpRight, Mail, Menu, X } from '@lucide/vue'

import { useScroll } from '~/composables/useScroll'

const open = ref(false)
const { scrollY } = useScroll()
const scrolled = computed(() => scrollY.value > 12)
const route = useRoute()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (typeof document !== 'undefined') document.body.classList.remove('nav-open')
})

watch(open, (isOpen) => {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('nav-open', isOpen)
})

// Close the mobile menu when the URL changes — covers route changes (/systems)
// and in-page hash changes (/#what-we-build). Doing it via a route watcher
// instead of @click="close" on every link avoids the race where setting
// open=false in the click handler tears the dialog down (v-if + Transition)
// in the same tick as NuxtLink's async router.push, which on iOS Safari can
// drop the navigation entirely.
watch(() => route.fullPath, () => {
  if (open.value) open.value = false
})

// All tabs render as <NuxtLink> so they work from any route. Hash tabs use
// `/#anchor` form so the router navigates to the home page and scrolls to the
// section even when the user is on /systems or another sub-route.
type NavTab = { label: string; to: string }

const tabs: NavTab[] = [
  { label: 'Home', to: '/#home' },
  { label: 'Systems', to: '/systems' },
  { label: 'What We Build', to: '/what-we-build' },
  { label: 'Industries', to: '/industries' },
  { label: 'Insights', to: '/blog' },
  { label: 'Use Cases', to: '/#meet' },
  { label: 'Contact', to: '/#contact' },
]

function close() {
  open.value = false
}

</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50">
    <div
      :class="[
        'absolute inset-0 -z-10 pointer-events-none transition-opacity duration-300',
        scrolled ? 'opacity-100' : 'opacity-0',
      ]"
      aria-hidden="true"
    >
      <div class="absolute inset-0 bg-white/85 backdrop-blur-md" />
      <div class="absolute inset-x-0 bottom-0 h-px bg-line" />
      <div class="absolute inset-x-0 -bottom-px h-px shadow-[0_1px_0_0_rgba(15,23,42,0.04)]" />
    </div>
    <div class="relative mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
      <nav class="flex items-center justify-between h-16 md:h-20">
        <NuxtLink to="/#home" class="group inline-flex items-center py-3 lg:py-0" aria-label="Zabble home">
          <span class="font-display text-ink text-[28px] md:text-[30px] leading-none tracking-[-0.02em] transition-colors group-hover:text-ink-soft">Zabble</span>
        </NuxtLink>

        <ul class="hidden md:flex items-center gap-10">
          <li v-for="t in tabs" :key="t.label">
            <NuxtLink
              :to="t.to"
              class="text-[15px] font-medium text-mute hover:text-ink transition-colors"
              active-class="text-ink"
            >{{ t.label }}</NuxtLink>
          </li>
        </ul>

        <div class="hidden md:flex items-center gap-2">
          <NuxtLink
            to="/diagnose"
            class="group inline-flex items-center gap-1.5 rounded-full bg-ink hover:bg-ink-soft text-white text-[14.5px] font-medium pl-5 pr-4 py-2.5 transition"
          >
            Book a discovery call
            <ArrowRight :size="16" class="transition group-hover:translate-x-0.5" />
          </NuxtLink>
        </div>

        <button
          type="button"
          class="md:hidden relative z-10 -mr-1.5 inline-flex items-center justify-center h-11 w-11 rounded-full text-ink hover:bg-ink/5 active:bg-ink/10 transition-colors touch-manipulation"
          @click="open = true"
          aria-label="Open menu"
        >
          <Menu :size="22" :stroke-width="1.75" />
        </button>
      </nav>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="md:hidden fixed inset-0 z-[60] bg-white overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div class="absolute inset-0 bg-white" aria-hidden="true" />
        <div
          class="absolute inset-0 grid-bg fade-mask opacity-50 pointer-events-none"
          aria-hidden="true"
        />

        <div class="relative h-full flex flex-col">
          <div class="flex items-center justify-between h-14 px-5 border-b border-line/70 bg-white/60 backdrop-blur-sm">
            <NuxtLink
              to="/#home"
              class="inline-flex items-center py-3 -my-3 touch-manipulation"
              aria-label="Zabble home"
            >
              <span class="font-display text-ink text-[24px] leading-none tracking-[-0.02em]">Zabble</span>
            </NuxtLink>
            <button
              type="button"
              class="-mr-1.5 inline-flex items-center justify-center h-11 w-11 rounded-full text-ink hover:bg-ink/5 active:bg-ink/10 transition-colors touch-manipulation"
              @click="close"
              aria-label="Close menu"
            >
              <X :size="22" :stroke-width="1.75" />
            </button>
          </div>

          <div class="relative flex-1 overflow-y-auto">
            <nav aria-label="Mobile">
              <ul class="px-5 pt-2 pb-1">
                <li
                  v-for="(t, i) in tabs"
                  :key="t.label"
                  class="nav-row"
                  :style="{ '--i': i }"
                >
                  <NuxtLink
                    :to="t.to"
                    class="group flex items-center justify-between gap-4 py-3.5 border-b border-line/70 touch-manipulation"
                  >
                    <span class="flex items-center gap-4 min-w-0">
                      <span
                        class="font-semibold text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep/80 tabular-nums shrink-0"
                      >
                        0{{ i + 1 }}
                      </span>
                      <span
                        class="font-display text-[26px] leading-[1.05] tracking-tight text-ink truncate"
                      >
                        {{ t.label }}
                      </span>
                    </span>
                    <span
                      class="nav-arrow shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-full border border-line bg-white text-mute"
                    >
                      <ArrowUpRight :size="16" />
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </nav>

            <div class="px-5 mt-5">
              <div
                class="cta-card relative rounded-2xl border border-cyan-brand/25 bg-white p-5 overflow-hidden"
              >
                <div
                  class="absolute -top-20 -right-16 h-[200px] w-[200px] rounded-full bg-cyan-brand/15 blur-3xl pointer-events-none"
                  aria-hidden="true"
                />
                <div class="relative">
                  <div
                    class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
                  >
                    <span class="dot" />
                    Start here
                  </div>
                  <p class="mt-3 font-display text-[19px] leading-[1.25] text-ink">
                    Find your most expensive operational problem in 2 minutes.
                  </p>
                  <NuxtLink
                    to="/diagnose"
                    class="mt-4 group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink hover:bg-ink-soft text-white text-[15px] font-semibold py-3.5 transition shadow-[0_18px_40px_-12px_rgba(1,219,241,0.45)] touch-manipulation"
                  >
                    Book a discovery call
                    <ArrowRight :size="17" class="transition group-hover:translate-x-0.5" />
                  </NuxtLink>
                </div>
              </div>
            </div>

            <div class="h-4" aria-hidden="true" />
          </div>

          <div class="relative px-5 py-3.5 border-t border-line/70 bg-white/70 backdrop-blur-sm">
            <a
              href="mailto:analytics@zabble.org"
              @click="close"
              class="group flex items-center justify-between gap-3 touch-manipulation"
            >
              <span class="flex items-center gap-3 min-w-0">
                <span
                  class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0"
                >
                  <Mail :size="15" />
                </span>
                <span class="flex flex-col min-w-0">
                  <span class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    Get in touch
                  </span>
                  <span class="text-[14px] text-ink font-medium truncate">
                    analytics@zabble.org
                  </span>
                </span>
              </span>
              <ArrowRight
                :size="16"
                class="text-mute group-hover:text-ink transition shrink-0"
              />
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.nav-row {
  opacity: 0;
  transform: translate3d(0, 12px, 0);
  animation: nav-row-in 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(120ms + var(--i, 0) * 70ms);
}

.cta-card {
  opacity: 0;
  transform: translate3d(0, 12px, 0);
  animation: nav-row-in 580ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: 460ms;
  box-shadow:
    0 30px 60px -28px rgba(1, 219, 241, 0.25),
    0 8px 18px -10px rgba(15, 23, 42, 0.06);
}

@keyframes nav-row-in {
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.group:hover .nav-arrow,
.group:focus-visible .nav-arrow {
  background-color: var(--color-ink);
  color: #fff;
  border-color: var(--color-ink);
}

@media (prefers-reduced-motion: reduce) {
  .nav-row,
  .cta-card {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
