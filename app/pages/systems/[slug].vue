<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@lucide/vue'

import { PILLARS, systemBySlug } from '~/data/systems'
import { isSystemPublished } from '~/utils/seo'

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

// OR-4 (S01): concept / in-progress systems are thin and de-indexed. They are
// excluded from prerender + sitemap and return **410 Gone** so search engines
// drop them, rather than serving a 200 page full of TODO placeholders.
// Promoting a system to status `'live'` re-activates its page automatically.
if (!isSystemPublished(system.value)) {
  throw createError({
    statusCode: 410,
    statusMessage: 'System not published',
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

// Breadcrumb spine: /systems is the canonical parent of every module page
// (site-architecture.md §2.2). The visible trail must stay 1:1 with the
// BreadcrumbList JSON-LD S03 emits.
const breadcrumbs = computed(() => [
  { label: 'Home', to: '/' },
  { label: 'Systems', to: '/systems' },
  { label: sys.value.name },
])

// GEO (S07-geo): label of the pillar the cited stat block links to.
const geoPillarLabel = computed(
  () => PILLARS.find((p) => p.slug === sys.value.geo?.pillar)?.label ?? '',
)

// Per-page SEO (S02 on-page, owner of per-page meta). Distinct title +
// description per module, derived from the data file: SEO-specific overrides
// (seoTitle/seoDescription from S06) when present, else name/tagline. ogType
// 'article' — a specific offering page; canonical to the clean slug URL. The
// global titleTemplate appends " · Zabble".
usePageSeo(() => ({
  title: sys.value.seoTitle ?? sys.value.name,
  description: sys.value.seoDescription ?? sys.value.tagline,
  path: `/systems/${sys.value.slug}`,
  ogType: 'article',
  primaryKeyword: sys.value.keywords?.[0],
}))

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
          // Byte-match the served <meta name="description"> (usePageSeo uses the
          // same seoDescription ?? tagline fallback), so the Service node and the
          // page agree exactly (validate-schema enforces this).
          description: s.seoDescription ?? s.tagline,
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
        <SeoBreadcrumb :items="breadcrumbs" />
      </div>

      <!-- Hero -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <SystemHero :system="sys" />
      </section>

      <!-- AEO answer-first block (S07, owner of AEO answers): "What is …?"
           answered in 40–60 words, placed high so the definition is the first
           prose an answer engine lifts. The exact strings come from
           app/data/aeo-content.ts and are mirrored 1:1 into JSON-LD by S08. -->
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

      <!-- GEO: question-shaped heading + one real, cited statistic.
           Only renders on flagship pages that define a `geo` block. -->
      <section
        v-if="sys.geo"
        class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24"
      >
        <div v-reveal class="max-w-3xl">
          <h2
            class="font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink"
          >
            {{ sys.geo.question }}
          </h2>
          <figure class="mt-6 rounded-2xl border border-line bg-surface-alt/60 p-6 md:p-7">
            <p class="text-[18px] md:text-[20px] leading-[1.5] text-ink font-display">
              {{ sys.geo.stat.text }}
            </p>
            <figcaption class="mt-3 text-[14px] text-mute">
              <a
                :href="sys.geo.stat.url"
                target="_blank"
                rel="noopener"
                class="text-cyan-brand-deep hover:text-ink underline underline-offset-2 transition"
              >{{ sys.geo.stat.source }}</a>
            </figcaption>
          </figure>
          <NuxtLink
            v-if="sys.geo.pillar"
            :to="`/what-we-build/${sys.geo.pillar}`"
            class="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-cyan-brand-deep hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
          >
            More on {{ geoPillarLabel.toLowerCase() }}
            <ArrowRight :size="15" :stroke-width="2" class="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </NuxtLink>
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
          <!-- Owned pillars link UP to their hub (module -> pillar, rules L2/L6);
               non-owned pillars render as dimmed, non-interactive cards. -->
          <component
            :is="sys.pillars.includes(p.slug) ? 'NuxtLink' : 'article'"
            v-for="(p, i) in PILLARS"
            :key="p.slug"
            :to="sys.pillars.includes(p.slug) ? `/what-we-build/${p.slug}` : undefined"
            v-reveal:scale="i * 60"
            :class="[
              'group relative block rounded-2xl border bg-white p-5 md:p-6 transition-colors',
              sys.pillars.includes(p.slug)
                ? 'border-cyan-brand/40 ring-1 ring-cyan-brand/20 hover:border-cyan-brand/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
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
            <span
              v-if="sys.pillars.includes(p.slug)"
              class="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-cyan-brand-deep"
            >
              Explore {{ p.label }}
              <ArrowRight :size="13" :stroke-width="2" class="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </component>
        </div>
      </section>

      <!-- AEO FAQ block (S07): question-shaped Q&A targeting People Also Ask.
           Server-rendered via FaqList; the same `sys.faqs` objects are exposed
           for S08 to attach byte-identical FAQPage JSON-LD. -->
      <section
        v-if="sys.faqs?.length"
        class="mx-auto max-w-4xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24"
      >
        <div v-reveal>
          <FaqList :items="sys.faqs" />
        </div>
      </section>

      <!-- Related systems: links each module to shared-pillar siblings so no
           page is a dead-end (internal-linking rule L5). -->
      <RelatedSystems :system="sys" />

      <CtaStrip
        eyebrow="Next Step"
        heading="Want one built for your business?"
        body="The first conversation is free. And useful either way."
      />
    </main>

    <TheFooter />
  </div>
</template>
