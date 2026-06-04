<script setup lang="ts">
import { ArrowRight, Layers } from '@lucide/vue'
import { INDUSTRIES } from '~/data/industries'
import { NAP } from '~/data/nap'

useSeoMeta({
  title: 'Industries We Build For — Custom Operational Systems | Zabble',
  description:
    'Bespoke operational systems for financial services, legal, NGOs, logistics, hospitality, manufacturing, professional services and field services across South Africa.',
  ogTitle: 'Industries Zabble builds for',
  ogDescription:
    'Custom systems for financial services, legal, NGOs, logistics, hospitality, manufacturing, professional services and field services.',
  ogType: 'website',
})
useHead({ link: [{ rel: 'canonical', href: `${NAP.url}/industries` }] })

// SCHEMA SLOT (S08): `Organization` + `ItemList` of the industry pages.
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <Layers :size="14" :stroke-width="2" aria-hidden="true" />
            By industry
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] leading-[1.04] tracking-tight text-ink">
            The same four pillars, <span class="cyan-underline">shaped to your world.</span>
          </h1>
          <p class="mt-6 max-w-2xl text-[16px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute">
            Every Zabble system rests on automation, audit trails, anomaly detection and analytics — but the
            problem it solves looks different in a bank than in a warehouse. Here's where we go deep.
          </p>
        </div>

        <div class="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          <NuxtLink
            v-for="(ind, i) in INDUSTRIES"
            :key="ind.slug"
            v-reveal:scale="i * 50"
            :to="`/industries/${ind.slug}`"
            class="group block rounded-2xl border border-line hover:border-cyan-brand/40 bg-white p-6 md:p-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="font-display text-[24px] leading-[1.12] text-ink">{{ ind.name }}</span>
              <ArrowRight :size="17" class="shrink-0 text-mute group-hover:text-ink transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
            <p class="mt-3 text-[14.5px] md:text-[15px] leading-[1.6] text-mute">{{ ind.intro }}</p>
          </NuxtLink>
        </div>
      </section>

      <CtaStrip eyebrow="Next Step" heading="Don't see your industry? We've probably built for its problem." />
    </main>

    <TheFooter />
  </div>
</template>
