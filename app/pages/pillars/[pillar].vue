<script setup lang="ts">
import { computed } from 'vue'
import {
  PILLARS,
  PILLAR_SEO,
  SYSTEMS,
  pillarBySlug,
  type PillarSlug,
} from '~/data/systems'

const route = useRoute()
const slug = computed(() => String(route.params.pillar ?? ''))

const validSlugs = new Set(PILLARS.map((p) => p.slug))
if (!validSlugs.has(slug.value as PillarSlug)) {
  throw createError({ statusCode: 404, statusMessage: 'Pillar not found', fatal: true })
}

const pillarSlug = computed(() => slug.value as PillarSlug)
const pillar = computed(() => pillarBySlug(pillarSlug.value)!)
const seo = computed(() => PILLAR_SEO[pillarSlug.value])

// Live modules that deliver on this pillar.
const modules = computed(() =>
  SYSTEMS.filter((s) => s.status === 'live' && s.pillars.includes(pillarSlug.value)),
)

usePageSeo(() => ({
  title: seo.value.seoTitle,
  description: seo.value.seoDescription,
  path: `/pillars/${pillarSlug.value}`,
  ogType: 'website',
  primaryKeyword: seo.value.keywords[0],
}))
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <!-- Breadcrumb -->
      <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8 md:mb-10 text-[13.5px] font-medium text-mute">
          <NuxtLink to="/systems" class="hover:text-ink transition-colors">Systems</NuxtLink>
          <span class="mx-2 text-mute-2">/</span>
          <span class="text-ink">{{ pillar.label }}</span>
        </nav>
      </div>

      <!-- Hero + answer-first definition -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Pillar
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[60px] leading-[1.05] tracking-tight text-ink">
            {{ seo.h1 }}
          </h1>
          <p data-answer-first class="mt-6 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] text-ink">
            {{ seo.definition }}
          </p>
          <p class="mt-4 max-w-2xl text-[15.5px] md:text-[16.5px] leading-[1.65] text-mute">
            {{ seo.blurb }}
          </p>
          <div class="mt-7 md:mt-8">
            <NuxtLink
              to="/diagnose"
              class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[15px] font-semibold px-5 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Book a discovery call
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Modules delivering this pillar -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-14 md:mt-20">
        <div v-reveal class="max-w-3xl">
          <h2 class="font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink">
            Systems that deliver {{ pillar.label.toLowerCase() }}
          </h2>
          <p class="mt-3 text-[14.5px] md:text-[15px] text-mute">
            {{ modules.length }} {{ modules.length === 1 ? 'system' : 'systems' }} in the library lead on this pillar. Each is built bespoke — this is the shape, not a product off a shelf.
          </p>
        </div>
        <div class="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <SystemCard
            v-for="(s, i) in modules"
            :key="s.slug"
            v-reveal:scale="i * 60"
            :system="s"
          />
        </div>
        <div class="mt-8">
          <NuxtLink
            :to="`/systems?pillar=${pillarSlug}`"
            class="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-ink hover:text-ink-soft transition-colors"
          >
            Filter the full library by {{ pillar.label }} →
          </NuxtLink>
        </div>
      </section>

      <CtaStrip
        eyebrow="Next Step"
        :heading="`Want ${pillar.label.toLowerCase()} built into your operation?`"
      />
    </main>

    <TheFooter />
  </div>
</template>
