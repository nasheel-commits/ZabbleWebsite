<script setup lang="ts">
import { ArrowRight, ArrowLeft } from '@lucide/vue'
import { PILLAR_HUBS, systemsForPillar, pillarIcon } from '~/data/pillars'

useHead({
  title: 'The four pillars — Automation, Audit Trails, Anomaly Detection, Analytics · Zabble',
  meta: [
    {
      name: 'description',
      content:
        'The four pillars Zabble builds around every business: automation, audit trails, anomaly detection, and analytics. What each one is, and the South African systems that deliver it.',
    },
  ],
})

const hubs = PILLAR_HUBS.map((h) => ({
  ...h,
  icon: pillarIcon(h.slug),
  count: systemsForPillar(h.slug).length,
}))
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors rounded"
          >
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            Home
          </NuxtLink>
        </nav>

        <header class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            The Four Pillars
          </div>
          <h1
            class="mt-5 md:mt-6 font-display text-[34px] sm:text-[44px] md:text-[56px] leading-[1.06] tracking-tight text-ink"
          >
            Four things every modern business needs.
            <span class="cyan-underline">We build them around yours.</span>
          </h1>
          <p class="mt-6 text-[17px] md:text-[19px] leading-[1.7] text-mute">
            The pillars are the objective; our 30 modules are how we get there. A given
            build might lean on one pillar or weave all four together.
          </p>
        </header>

        <div class="mt-12 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
          <NuxtLink
            v-for="h in hubs"
            :key="h.slug"
            :to="`/pillars/${h.slug}`"
            class="group relative rounded-2xl border border-line bg-white p-8 md:p-9 transition hover:border-cyan-brand/50 hover:shadow-[0_24px_60px_-32px_rgba(1,219,241,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <div class="flex items-start justify-between gap-6">
              <div class="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25">
                <component :is="h.icon" :size="22" aria-hidden="true" />
              </div>
              <ArrowRight :size="18" class="mt-2 text-mute-2 transition group-hover:translate-x-0.5 group-hover:text-ink" />
            </div>
            <h2 class="mt-7 font-display text-[28px] md:text-[30px] leading-[1.1] text-ink">{{ h.label }}</h2>
            <p class="mt-3 text-[16px] leading-[1.6] text-mute">{{ h.definition }}</p>
            <p class="mt-4 text-[13px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
              {{ h.count }} systems
            </p>
          </NuxtLink>
        </div>
      </div>

      <CtaStrip />
    </main>

    <TheFooter />
  </div>
</template>
