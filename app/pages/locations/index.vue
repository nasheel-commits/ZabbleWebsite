<script setup lang="ts">
import { ArrowRight, MapPin } from '@lucide/vue'
import { LOCATIONS } from '~/data/locations'
import { NAP } from '~/data/nap'

// Per-page SEO (S02 standard): bare title + canonical + OG/Twitter via usePageSeo.
usePageSeo({
  title: 'Custom Software Across South Africa',
  description:
    'Zabble builds bespoke operational systems for businesses across South Africa, Johannesburg, Sandton, Cape Town, Pretoria and Durban. Find your city.',
  path: '/locations',
  ogType: 'website',
})

// SCHEMA SLOT (S08): emit `Organization` + an `ItemList` of the location pages.
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <MapPin :size="14" :stroke-width="2" aria-hidden="true" />
            Across South Africa
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] leading-[1.04] tracking-tight text-ink">
            We build where <span class="cyan-underline">South Africa works.</span>
          </h1>
          <p class="mt-6 max-w-2xl text-[16px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute">
            Zabble builds bespoke operational systems for businesses across the country, shaped to the
            industries, scale and reality of each metro. Find your city, or
            <NuxtLink to="/diagnose" class="text-ink underline underline-offset-4 hover:text-ink-soft">book a discovery call</NuxtLink>
            wherever you are.
          </p>
        </div>

        <div class="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <NuxtLink
            v-for="(l, i) in LOCATIONS"
            :key="l.slug"
            v-reveal:scale="i * 60"
            :to="`/locations/${l.slug}`"
            class="group block rounded-2xl border border-line hover:border-cyan-brand/40 bg-white p-6 md:p-7 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="font-display text-[24px] leading-[1.1] text-ink">{{ l.city }}</span>
              <ArrowRight :size="17" class="shrink-0 text-mute group-hover:text-ink transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
            <p class="mt-1 text-[12.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">{{ l.province }}</p>
            <p class="mt-3 text-[14.5px] leading-[1.55] text-mute">{{ l.intro }}</p>
          </NuxtLink>
        </div>
      </section>

      <CtaStrip
        eyebrow="Next Step"
        heading="Wherever you operate, the first conversation is free."
      />
    </main>

    <TheFooter />
  </div>
</template>
