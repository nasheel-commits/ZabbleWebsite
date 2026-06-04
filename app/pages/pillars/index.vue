<script setup lang="ts">
import { PILLARS, PILLAR_SEO } from '~/data/systems'

usePageSeo({
  title: 'The Four Pillars We Build',
  description:
    'Every Zabble system delivers on four pillars — automation, audit trails, anomaly detection and analytics. Explore each and the systems behind it.',
  path: '/pillars',
  ogType: 'website',
  primaryKeyword: 'business operations pillars',
})
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            What we build
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[64px] leading-[1.04] tracking-tight text-ink">
            Four things every modern business needs.
          </h1>
          <p data-answer-first class="mt-6 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] text-ink">
            Zabble builds on four pillars — automation, audit trails, anomaly detection and analytics. A given system might lean on one or weave all four together. They are the lens we bring to every build: stop doing it by hand, see who did what, catch what’s unusual, and decide on facts.
          </p>
        </div>

        <div class="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          <NuxtLink
            v-for="(p, i) in PILLARS"
            :key="p.slug"
            v-reveal:scale="i * 60"
            :to="`/pillars/${p.slug}`"
            class="group rounded-2xl border border-line bg-white p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-brand/40 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          >
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25">
                <component :is="p.icon" :size="20" :stroke-width="1.9" />
              </span>
              <span class="font-display text-[22px] md:text-[24px] leading-[1.1] text-ink">{{ PILLAR_SEO[p.slug].h1 }}</span>
            </div>
            <p class="mt-4 text-[14.5px] md:text-[15.5px] leading-[1.6] text-mute">
              {{ PILLAR_SEO[p.slug].definition }}
            </p>
            <span class="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
              Explore {{ p.label }}
              <span class="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </NuxtLink>
        </div>
      </section>

      <CtaStrip eyebrow="Next Step" heading="Not sure which pillar you need most?" body="The 2-minute diagnostic points you at the one costing you the most." />
    </main>

    <TheFooter />
  </div>
</template>
