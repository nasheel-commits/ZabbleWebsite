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

useHead({
  title: () => `${sys.value.name} · Zabble`,
  meta: [
    {
      name: 'description',
      content: () => sys.value.tagline,
    },
  ],
})

// ── Structured data / JSON-LD (S03) ────────────────────────────────────────
// Per-module markup: WebPage (ItemPage; also FAQPage when the page renders a
// FAQ block) + the breadcrumb trail + a Service node (provider → the Zabble
// Organization). Service — not Product/SoftwareApplication — because Zabble
// delivers a bespoke build/consulting engagement, not a priced, off-the-shelf
// product (audits/08-schema.md §type-choice). Service is emitted only for
// systems with real, signed-off copy; concept/TODO entries make no claims.
//
// FAQ: when `sys.faqs` exists the page renders <FaqList :items="sys.faqs"> (the
// AEO block above). The SAME array drives the FAQPage Question nodes here, so
// the JSON-LD Q&A is byte-identical to the visible Q&A by construction
// (asserted in scripts/validate-schema.mjs: schema text == rendered <dt>/<dd>).
const s = sys.value
const faqs = s.faqs ?? []
const webPageTypes = ['WebPage', 'ItemPage', ...(faqs.length ? ['FAQPage'] : [])]
useSchemaOrg([
  defineWebPage({ '@type': webPageTypes }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Systems', item: '/systems' },
      { name: s.name, item: `/systems/${s.slug}` },
    ],
  }),
  // Service emitted as a raw graph node: @unhead/schema-org's Vue build has no
  // `defineService` helper, but a typed Service node with an explicit,
  // page-unique @id resolves identically. provider → the Zabble Organization.
  ...(s.status !== 'concept'
    ? [
        {
          '@type': 'Service',
          '@id': `https://zabble.org/systems/${s.slug}#service`,
          name: s.name,
          description: s.tagline,
          serviceType: 'Bespoke operational system',
          provider: { '@id': 'https://zabble.org/#identity' },
          areaServed: { '@type': 'Country', name: 'South Africa' },
          category: pillarMetas.value.map((p) => p.label),
          url: `https://zabble.org/systems/${s.slug}`,
        },
      ]
    : []),
  // FAQPage Question nodes — 1:1, byte-identical to the rendered FaqList items.
  ...faqs.map((f) =>
    defineQuestion({ name: f.question, acceptedAnswer: f.answer }),
  ),
])

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

      <!-- AEO answer-first block: "What is …?" answered in 40–60 words, placed
           high so the definition is the first prose an answer engine lifts. -->
      <section
        v-if="sys.answer"
        class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-12 md:mt-16"
      >
        <div v-reveal class="max-w-3xl">
          <AnswerBlock :question="sys.answer.question" :answer="sys.answer.answer" />
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

      <!-- AEO FAQ block: question-shaped Q&A targeting People Also Ask. Server-
           rendered; the same data is exposed for S03 to attach FAQPage JSON-LD. -->
      <section
        v-if="sys.faqs?.length"
        class="mx-auto max-w-4xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24"
      >
        <div v-reveal>
          <FaqList :items="sys.faqs" />
        </div>
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
