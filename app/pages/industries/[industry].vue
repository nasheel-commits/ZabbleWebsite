<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight, Layers } from '@lucide/vue'

import { industryBySlug } from '~/data/industries'
import { systemBySlug } from '~/data/systems'
import { NAP } from '~/data/nap'

const route = useRoute()
const slug = computed(() => String(route.params.industry ?? ''))
const industry = computed(() => industryBySlug(slug.value))

if (!industry.value) {
  throw createError({ statusCode: 404, statusMessage: 'Industry not found', fatal: true })
}

const ind = computed(() => industry.value!)
const systems = computed(() =>
  ind.value.systemRefs
    .map((ref) => ({ ref, system: systemBySlug(ref.slug) }))
    .filter((x) => x.system),
)

useSeoMeta({
  title: ind.value.metaTitle,
  description: ind.value.metaDescription,
  ogTitle: ind.value.metaTitle,
  ogDescription: ind.value.metaDescription,
  ogType: 'website',
  ogUrl: () => `${NAP.url}/industries/${ind.value.slug}`,
})
useHead({
  link: [{ rel: 'canonical', href: `${NAP.url}/industries/${ind.value.slug}` }],
})

// SCHEMA SLOT (S08): emit `Service` (+ breadcrumb) for this industry — provider =
// Organization (NAP), areaServed = South Africa. See localbusiness-schema-fields.md.
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <!-- Breadcrumb -->
      <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
          <NuxtLink
            to="/industries"
            class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
          >
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            All industries
          </NuxtLink>
        </nav>
      </div>

      <!-- Hero -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <Layers :size="14" :stroke-width="2" aria-hidden="true" />
            {{ ind.kicker }}
          </div>
          <h1 class="mt-5 font-display text-[36px] sm:text-[48px] md:text-[58px] lg:text-[64px] leading-[1.05] tracking-tight text-ink">
            {{ ind.h1 }}
          </h1>
          <p class="mt-6 max-w-2xl text-[16px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute">
            {{ ind.intro }}
          </p>
          <div class="mt-7 md:mt-8">
            <NuxtLink
              to="/diagnose"
              class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[15px] font-semibold px-5 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Book a discovery call
              <ArrowRight :size="16" class="transition-transform duration-200 group-hover:translate-x-0.5" />
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Pain + outcome -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <article v-reveal:scale class="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              The operational reality
            </div>
            <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">{{ ind.pain }}</p>
          </article>
          <article v-reveal:scale="80" class="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              What changes
            </div>
            <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">{{ ind.outcome }}</p>
          </article>
        </div>
      </section>

      <!-- Systems for this industry -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            {{ ind.name }}
          </div>
          <h2 class="mt-4 font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink">
            The systems we build for this work.
          </h2>
        </div>

        <div class="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <NuxtLink
            v-for="({ ref, system }, i) in systems"
            :key="ref.slug"
            v-reveal:scale="i * 60"
            :to="`/systems/${ref.slug}`"
            class="group block rounded-2xl border border-line hover:border-cyan-brand/40 bg-white p-6 md:p-7 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="font-display text-[20px] leading-[1.15] text-ink">{{ system!.name }}</span>
              <ArrowRight :size="16" class="shrink-0 text-mute group-hover:text-ink transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
            <p class="mt-3 text-[14.5px] leading-[1.55] text-mute">{{ ref.angle }}</p>
          </NuxtLink>
        </div>
      </section>

      <CtaStrip
        eyebrow="Next Step"
        :heading="`Building for ${ind.name.toLowerCase()}?`"
        body="Tell us the operational problem costing you the most. The first conversation is free, and useful either way."
      />
    </main>

    <TheFooter />
  </div>
</template>
