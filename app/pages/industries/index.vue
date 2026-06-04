<script setup lang="ts">
import { INDUSTRIES } from '~/data/industries'

usePageSeo({
  title: 'Industries We Build For',
  description:
    'Law firms, hospitality, logistics, manufacturing, banks and NGOs, see the bespoke systems Zabble assembles for each South African industry.',
  path: '/industries',
  ogType: 'website',
  primaryKeyword: 'business software by industry south africa',
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
            Industries
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[64px] leading-[1.04] tracking-tight text-ink">
            Built for your industry. Shaped to your business.
          </h1>
          <p data-answer-first class="mt-6 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] text-ink">
            Zabble has built for NGOs, banks, hotels, law firms, parts suppliers and manufacturers. The industries differ; the pattern doesn’t, every business has one operational problem that costs more than the rest combined. These pages show the systems we typically assemble for each.
          </p>
        </div>

        <div class="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <NuxtLink
            v-for="(ind, i) in INDUSTRIES"
            :key="ind.slug"
            v-reveal:scale="i * 60"
            :to="`/industries/${ind.slug}`"
            class="group flex flex-col rounded-2xl border border-line bg-white p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-brand/40 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          >
            <h2 class="font-display text-[22px] md:text-[24px] leading-[1.15] text-ink">{{ ind.name }}</h2>
            <p class="mt-2 text-[14.5px] md:text-[15px] leading-[1.55] text-mute flex-1">{{ ind.seoDescription }}</p>
            <span class="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
              See the systems
              <span class="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </NuxtLink>
        </div>
      </section>

      <CtaStrip eyebrow="Next Step" heading="Don’t see your industry?" body="We work across all of them. The first conversation is free." />
    </main>

    <TheFooter />
  </div>
</template>
