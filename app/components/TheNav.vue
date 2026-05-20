<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, ArrowRight } from '@lucide/vue'

const open = ref(false)
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 12
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

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
          class="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-lg border border-line text-ink"
          @click="open = true"
          aria-label="Open menu"
        >
          <Menu :size="20" />
        </button>
      </nav>
    </div>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="md:hidden fixed inset-0 z-[60] bg-white"
      >
        <div class="flex items-center justify-between h-16 px-5 border-b border-line">
          <span class="font-display text-ink text-[26px] leading-none tracking-[-0.02em]">Zabble</span>
          <button
            class="inline-flex items-center justify-center h-11 w-11 rounded-lg border border-line text-ink"
            @click="close"
            aria-label="Close menu"
          >
            <X :size="20" />
          </button>
        </div>
        <ul class="px-5 py-8 flex flex-col gap-2">
          <li v-for="t in tabs" :key="t.href">
            <a
              :href="t.href"
              @click="close"
              class="block py-3 text-2xl font-medium text-ink tracking-tight"
            >{{ t.label }}</a>
          </li>
        </ul>
        <div class="px-5">
          <NuxtLink
            to="/diagnose"
            class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink text-white text-[15.5px] font-medium py-4"
            @click="close"
          >
            Book a discovery call
            <ArrowRight :size="18" />
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>
