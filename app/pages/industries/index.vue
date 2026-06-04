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

// The six cards above are our deepest verticals, not the limit of who we build
// for. These illustrate the broader range the same approach fits.
const moreSectors = [
  'Marketing agencies',
  'Parts & equipment suppliers',
  'Professional services',
  'Retail & trade',
  'Field services',
  'Property & estates',
  'Education & training',
  'Small & medium businesses',
]
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
            Zabble has built for NGOs, banks, hotels, law firms, manufacturers and marketing agencies, as well as growing small and mid-sized businesses across many other sectors. We build bespoke systems shaped around your business, not your industry. The sectors differ; the pattern doesn’t, every business has one operational problem that costs more than the rest combined. The six below are where our playbooks run deepest.
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

        <div v-reveal class="mt-14 md:mt-20 rounded-2xl border border-line bg-surface-alt/60 p-7 md:p-9 lg:p-10">
          <h2 class="font-display text-[24px] md:text-[30px] leading-[1.18] tracking-tight text-ink">
            Built around your business, not your industry
          </h2>
          <p class="mt-3 max-w-2xl text-[15px] md:text-[16.5px] leading-[1.6] text-mute">
            The six above are where our playbooks run deepest, not the limit of what we build. The work is industry-agnostic. We’ve shaped systems for marketing agencies, parts suppliers, professional-services firms and growing small and mid-sized businesses across many other sectors. If your team runs on hand-filled spreadsheets and tools that don’t talk to each other, we can build the system that fixes it.
          </p>
          <div class="mt-6 text-[12px] uppercase tracking-[0.2em] text-mute-2 font-semibold">
            A fit for sectors like
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="sector in moreSectors"
              :key="sector"
              class="inline-flex items-center rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] text-ink"
            >
              {{ sector }}
            </span>
          </div>
        </div>
      </section>

      <CtaStrip eyebrow="Next Step" heading="Don’t see your industry?" body="We work across all of them. The first conversation is free." />
    </main>

    <TheFooter />
  </div>
</template>
