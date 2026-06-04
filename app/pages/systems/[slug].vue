<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@lucide/vue'

import { PILLARS, systemBySlug } from '~/data/systems'

const route = useRoute()

const slug = computed(() => String(route.params.slug ?? ''))
const system = computed(() => systemBySlug(slug.value))

// 404 if the slug isn't in the data file. SSR-friendly: throws server-side too.
if (!system.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'System not found',
    fatal: true,
  })
}

const sys = computed(() => system.value!)

const pillarMetas = computed(() =>
  PILLARS.filter((p) => sys.value.pillars.includes(p.slug)),
)

const PILLAR_WORDS = ['no', 'one', 'two', 'three', 'four']
const pillarJobsWord = computed(
  () => PILLAR_WORDS[pillarMetas.value.length] ?? 'four',
)

// Per-page SEO (S02 on-page). Distinct title + description per module, derived
// from the data file: SEO-specific overrides (seoTitle/seoDescription from S06)
// when present, else name/tagline. ogType 'article' — a specific offering page;
// canonical to the clean slug URL. The global titleTemplate appends " · Zabble".
usePageSeo(() => ({
  title: sys.value.seoTitle ?? sys.value.name,
  description: sys.value.seoDescription ?? sys.value.tagline,
  path: `/systems/${sys.value.slug}`,
  ogType: 'article',
}))

</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <!-- Breadcrumb -->
      <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
          <NuxtLink
            to="/systems"
            class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
          >
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            All systems
          </NuxtLink>
        </nav>
      </div>

      <!-- Hero -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <SystemHero :system="sys" />
      </section>

      <!-- AEO: answer-first definition. Renders only when content (S06/S07) supplies
           `definition`. Question-led H2 + a 40–60 word liftable answer (featured-snippet
           / AI-overview shape). Placed high on the page so the answer sits in the first
           screenful. Mirrored into schema by S08. See audits/05-onpage.md. -->
      <section
        v-if="sys.definition"
        class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-12 md:mt-16"
      >
        <div v-reveal class="max-w-3xl">
          <h2 class="font-display text-[26px] sm:text-[32px] md:text-[38px] leading-[1.12] tracking-tight text-ink">
            What is {{ sys.name }}?
          </h2>
          <p class="mt-4 text-[16px] md:text-[17px] leading-[1.65] text-ink">
            {{ sys.definition }}
          </p>
        </div>
      </section>

      <!-- Triptych -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal class="mb-7 md:mb-9 max-w-2xl">
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            How we work
          </div>
          <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">
            We sit with your business. We find the operational problem costing you the most. We build the system that fixes it.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <article
            v-reveal:scale
            class="rounded-2xl border border-line bg-white p-6 md:p-7"
          >
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              The Problem
            </div>
            <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">
              {{ sys.problem }}
            </p>
          </article>

          <article
            v-reveal:scale="80"
            class="rounded-2xl border border-line bg-white p-6 md:p-7"
          >
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              What We Built
            </div>
            <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">
              {{ sys.whatWeBuilt }}
            </p>
          </article>

          <article
            v-reveal:scale="160"
            class="rounded-2xl border border-line bg-white p-6 md:p-7"
          >
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              What Changed
            </div>
            <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">
              {{ sys.whatChanged }}
            </p>
          </article>
        </div>
      </section>

      <!-- Interactive demo placeholder -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal class="mb-5 md:mb-6 max-w-2xl">
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Example deployment
          </div>
          <p class="mt-2 text-[14.5px] md:text-[15px] leading-[1.55] text-mute">
            {{ sys.demoFraming ?? "One example of how we'd wire this capability. We'd shape it to your business." }}
          </p>
        </div>
        <DemoSlot :system-slug="sys.slug" />

        <!-- Mid-page conversion exit after the demo. -->
        <div
          v-reveal
          class="mt-6 md:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-line bg-white px-5 md:px-6 py-4 md:py-5"
        >
          <p class="text-[14.5px] md:text-[15px] leading-snug text-ink">
            <span class="font-semibold">Want one built for your business?</span>
            <span class="text-mute"> The first conversation is free.</span>
          </p>
          <NuxtLink
            to="/diagnose"
            class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[14px] font-semibold px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white shrink-0"
          >
            Book a discovery call
            <ArrowRight :size="15" :stroke-width="2" class="transition-transform duration-200 group-hover:translate-x-0.5" />
          </NuxtLink>
        </div>
      </section>

      <!-- How it fits the four pillars -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            How it fits the {{ pillarJobsWord }} pillar{{ pillarMetas.length === 1 ? '' : 's' }}
          </div>
          <h2
            class="mt-4 font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink"
          >
            {{ sys.pillarHeading ?? `One system, ${pillarJobsWord} job${pillarMetas.length === 1 ? '' : 's'}.` }}
          </h2>
        </div>

        <div class="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <article
            v-for="(p, i) in PILLARS"
            :key="p.slug"
            v-reveal:scale="i * 60"
            :class="[
              'relative rounded-2xl border bg-white p-5 md:p-6 transition-colors',
              sys.pillars.includes(p.slug)
                ? 'border-cyan-brand/40 ring-1 ring-cyan-brand/20'
                : 'border-line opacity-60',
            ]"
            :aria-disabled="!sys.pillars.includes(p.slug)"
          >
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'inline-flex items-center justify-center h-9 w-9 rounded-lg ring-1',
                  sys.pillars.includes(p.slug)
                    ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                    : 'bg-surface-alt text-mute-2 ring-line',
                ]"
                aria-hidden="true"
              >
                <component :is="p.icon" :size="18" :stroke-width="1.9" />
              </span>
              <span class="font-display text-[19px] leading-[1.1] text-ink">{{ p.label }}</span>
            </div>
            <p class="mt-3 text-[14.5px] leading-[1.55] text-mute">
              {{
                sys.pillarNotes?.[p.slug]
                  ?? (sys.pillars.includes(p.slug)
                    ? 'TODO — how this system delivers on this pillar.'
                    : 'Not the primary focus for this system.')
              }}
            </p>
          </article>
        </div>
      </section>

      <!-- AEO: FAQ block. Renders only when content (S06/S07) supplies `faqs`.
           The visible Q&A here is mirrored 1:1 into FAQPage JSON-LD by S08 (schema) —
           never mark up a question that isn't on the page. Question text should match
           real PAA / SERP phrasing from S05. See audits/05-onpage.md. -->
      <section
        v-if="sys.faqs?.length"
        class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24"
      >
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Questions
          </div>
          <h2 class="mt-4 font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink">
            Frequently asked questions
          </h2>
        </div>
        <dl class="mt-8 md:mt-10 max-w-3xl divide-y divide-line border-t border-line">
          <div v-for="(item, i) in sys.faqs" :key="i" class="py-5 md:py-6">
            <dt class="font-display text-[18px] md:text-[20px] leading-snug text-ink">
              {{ item.q }}
            </dt>
            <dd class="mt-2 text-[15.5px] md:text-[16px] leading-[1.65] text-mute">
              {{ item.a }}
            </dd>
          </div>
        </dl>
      </section>

      <CtaStrip
        eyebrow="Next Step"
        heading="Want one built for your business?"
        body="The first conversation is free. And useful either way."
      />
    </main>

    <TheFooter />
  </div>
</template>
