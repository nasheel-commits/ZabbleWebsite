<script setup lang="ts">
import { ArrowRight, BookOpen } from '@lucide/vue'
import { NAP } from '~/data/nap'

useSeoMeta({
  title: 'Insights — Operations & Automation in South Africa | Zabble',
  description:
    'Reference material and perspective on how South African businesses run their operations — built to be useful, and free to cite.',
  ogTitle: 'Zabble Insights',
  ogDescription: 'Reference material on operations and automation for South African businesses.',
  ogType: 'website',
})
useHead({ link: [{ rel: 'canonical', href: `${NAP.url}/insights` }] })

// SCHEMA SLOT (S08): `Organization` + `ItemList`/`Blog` of insight articles.

const articles = [
  {
    to: '/insights/south-african-operations-software-landscape',
    title: 'The South African Operations-Software Landscape',
    kind: 'Reference',
    blurb:
      'A map of the operational-software categories a South African business runs — what each does, and where bespoke fits. Free to cite.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <BookOpen :size="14" :stroke-width="2" aria-hidden="true" />
            Insights
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] leading-[1.04] tracking-tight text-ink">
            Useful by design.
          </h1>
          <p class="mt-6 max-w-2xl text-[16px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute">
            Reference material on how South African businesses run their operations — written to be quoted,
            linked and used, not gated.
          </p>
        </div>

        <div class="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          <NuxtLink
            v-for="(a, i) in articles"
            :key="a.to"
            v-reveal:scale="i * 60"
            :to="a.to"
            class="group block rounded-2xl border border-line hover:border-cyan-brand/40 bg-white p-6 md:p-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <p class="text-[11.5px] uppercase tracking-[0.2em] text-cyan-brand-deep font-semibold">{{ a.kind }}</p>
            <p class="mt-2 font-display text-[24px] md:text-[26px] leading-[1.18] text-ink">{{ a.title }}</p>
            <p class="mt-3 text-[14.5px] leading-[1.6] text-mute">{{ a.blurb }}</p>
            <span class="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink">
              Read <ArrowRight :size="15" class="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </NuxtLink>
        </div>
      </section>

      <CtaStrip eyebrow="Next Step" heading="Want the bespoke version for your business?" />
    </main>

    <TheFooter />
  </div>
</template>
