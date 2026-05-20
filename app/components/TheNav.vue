<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Menu, X, ArrowRight, ArrowUpRight, Mail } from '@lucide/vue'

const open = ref(false)
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 12
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

watch(open, (isOpen) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

const tabs = [
  { label: 'Home', href: '#home' },
  { label: 'What We Build', href: '#what-we-build' },
  { label: 'Use Cases', href: '#meet' },
  { label: 'Contact', href: '#contact' },
]

function close() {
  open.value = false
}
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/85 backdrop-blur-md border-b border-line shadow-[0_1px_0_0_rgba(15,23,42,0.04)]'
        : 'bg-transparent',
    ]"
  >
    <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
      <nav class="flex items-center justify-between h-16 md:h-20">
        <a href="#home" class="group inline-flex items-center py-3 lg:py-0" aria-label="Zabble home">
          <span class="font-display text-ink text-[28px] md:text-[30px] leading-none tracking-[-0.02em] transition-colors group-hover:text-ink-soft">Zabble</span>
        </a>

        <ul class="hidden md:flex items-center gap-10">
          <li v-for="t in tabs" :key="t.href">
            <a
              :href="t.href"
              class="text-[15px] font-medium text-mute hover:text-ink transition-colors"
            >{{ t.label }}</a>
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
          class="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-lg border border-line bg-white/80 backdrop-blur-sm text-ink shadow-[0_1px_0_0_rgba(15,23,42,0.04)]"
          @click="open = true"
          aria-label="Open menu"
        >
          <Menu :size="20" />
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
        <div
          class="absolute -top-32 -right-24 h-[440px] w-[440px] rounded-full bg-cyan-brand/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          class="absolute top-[42%] -left-28 h-[320px] w-[320px] rounded-full bg-cyan-brand/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          class="absolute -bottom-24 right-[-20%] h-[300px] w-[300px] rounded-full bg-cyan-brand/8 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div class="relative h-full flex flex-col">
          <div class="flex items-center justify-between h-16 px-5 border-b border-line/70 bg-white/60 backdrop-blur-sm">
            <a
              href="#home"
              @click="close"
              class="inline-flex items-center py-3 -my-3"
              aria-label="Zabble home"
            >
              <span class="font-display text-ink text-[26px] leading-none tracking-[-0.02em]">Zabble</span>
            </a>
            <button
              class="inline-flex items-center justify-center h-11 w-11 rounded-lg border border-line bg-white text-ink shadow-[0_1px_0_0_rgba(15,23,42,0.04)]"
              @click="close"
              aria-label="Close menu"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="relative flex-1 overflow-y-auto">
            <nav aria-label="Mobile">
              <ul class="px-5 pt-3 pb-2">
                <li
                  v-for="(t, i) in tabs"
                  :key="t.href"
                  class="nav-row"
                  :style="{ '--i': i }"
                >
                  <a
                    :href="t.href"
                    @click="close"
                    class="group flex items-center justify-between gap-4 py-5 border-b border-line/70"
                  >
                    <span class="flex items-center gap-4 min-w-0">
                      <span
                        class="font-semibold text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep/80 tabular-nums shrink-0"
                      >
                        0{{ i + 1 }}
                      </span>
                      <span
                        class="font-display text-[32px] leading-[1.05] tracking-tight text-ink truncate"
                      >
                        {{ t.label }}
                      </span>
                    </span>
                    <span
                      class="nav-arrow shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full border border-line bg-white text-mute"
                    >
                      <ArrowUpRight :size="18" />
                    </span>
                  </a>
                </li>
              </ul>
            </nav>

            <div class="px-5 mt-6">
              <div
                class="cta-card relative rounded-2xl border border-cyan-brand/25 bg-white p-6 overflow-hidden"
              >
                <div
                  class="absolute -top-20 -right-16 h-[200px] w-[200px] rounded-full bg-cyan-brand/15 blur-3xl pointer-events-none"
                  aria-hidden="true"
                />
                <div class="relative">
                  <div
                    class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
                  >
                    <span class="dot" />
                    Start here
                  </div>
                  <p class="mt-4 font-display text-[22px] leading-[1.2] text-ink">
                    Find your most expensive operational problem in 2 minutes.
                  </p>
                  <NuxtLink
                    to="/diagnose"
                    @click="close"
                    class="mt-5 group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink hover:bg-ink-soft text-white text-[15.5px] font-semibold py-4 transition shadow-[0_18px_40px_-12px_rgba(1,219,241,0.45)]"
                  >
                    Book a discovery call
                    <ArrowRight :size="18" class="transition group-hover:translate-x-0.5" />
                  </NuxtLink>
                </div>
              </div>
            </div>

            <div class="h-8" aria-hidden="true" />
          </div>

          <div class="relative px-5 py-5 border-t border-line/70 bg-white/70 backdrop-blur-sm">
            <a
              href="mailto:analytics@zabble.org"
              @click="close"
              class="group flex items-center justify-between gap-3"
            >
              <span class="flex items-center gap-3 min-w-0">
                <span
                  class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0"
                >
                  <Mail :size="16" />
                </span>
                <span class="flex flex-col min-w-0">
                  <span class="text-[12px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    Get in touch
                  </span>
                  <span class="text-[15px] text-ink font-medium truncate">
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
