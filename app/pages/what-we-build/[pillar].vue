<script setup lang="ts">
// Pillar hub page, /what-we-build/<pillar> (SEO S04).
//
// A real, server-rendered hub that introduces one of Zabble's four pillars and
// links to EVERY live module that delivers on it (hub -> member). Member pages
// link back up via their "How it fits the pillars" section (member -> hub), so
// the cluster is bidirectional (rule L6). Replaces the faceted /systems?pillar=
// views as the canonical, indexable pillar entity (audit A3/A5).

import { computed } from 'vue'
import { ArrowRight } from '@lucide/vue'

import { systemBySlug } from '~/data/systems'
import {
  pillarHubBySlug,
  membersForPillar,
  pillarMetaForHub,
  otherPillarHubs,
} from '~/data/pillars'

const route = useRoute()
const slug = computed(() => String(route.params.pillar ?? ''))
const hub = computed(() => pillarHubBySlug(slug.value))

// 404 on an unknown pillar slug (SSR-friendly: throws server-side too).
if (!hub.value) {
  throw createError({ statusCode: 404, statusMessage: 'Pillar not found', fatal: true })
}

const pillar = computed(() => hub.value!)
const meta = computed(() => pillarMetaForHub(pillar.value.slug))
const members = computed(() => membersForPillar(pillar.value.slug))
const others = computed(() => otherPillarHubs(pillar.value.slug))

// Flagship modules to name in the contextual prose (descriptive in-body anchors,
// rule L11). Resolved + filtered so a bad slug never renders a dead link.
const flagship = computed(() =>
  pillar.value.flagship.map(systemBySlug).filter((s): s is NonNullable<typeof s> => !!s),
)

const breadcrumbs = computed(() => [
  { label: 'Home', to: '/' },
  { label: 'Systems', to: '/systems' },
  { label: pillar.value.label },
])

// Per-page SEO (S02 standard): full title/description/canonical/OG/Twitter via
// usePageSeo, so the pillar hubs carry the same complete metadata as every other
// indexable page. ogType 'website', a hub/section, not an article.
usePageSeo(() => ({
  title: pillar.value.seoTitle,
  description: pillar.value.seoDescription,
  path: `/what-we-build/${pillar.value.slug}`,
  ogType: 'website',
  primaryKeyword: pillar.value.headTerm,
}))
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
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span
              class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
            >
              <component :is="meta?.icon" :size="16" :stroke-width="1.9" aria-hidden="true" />
            </span>
            {{ pillar.eyebrow }}
          </div>
          <h1
            class="mt-5 font-display text-[38px] sm:text-[50px] md:text-[60px] lg:text-[68px] leading-[1.05] tracking-tight text-ink"
          >
            {{ pillar.heading }}
          </h1>
          <p class="mt-6 max-w-2xl text-[17px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-ink/85 font-medium">
            {{ pillar.tagline }}
          </p>
          <div class="mt-6 space-y-4 max-w-2xl">
            <p
              v-for="(para, i) in pillar.intro"
              :key="i"
              class="text-[15.5px] md:text-[16.5px] leading-[1.7] text-mute"
            >
              {{ para }}
            </p>
          </div>

          <!-- Contextual flagship links (descriptive in-body anchors, rule L11). -->
          <p v-if="flagship.length" class="mt-6 max-w-2xl text-[15.5px] md:text-[16.5px] leading-[1.7] text-mute">
            Most {{ pillar.label.toLowerCase() }} builds lead with one or two modules and grow from there. Common starting points:
            <template v-for="(s, i) in flagship" :key="s.slug">
              <NuxtLink
                :to="`/systems/${s.slug}`"
                class="font-semibold text-ink underline decoration-cyan-brand/40 underline-offset-4 hover:decoration-cyan-brand transition"
              >{{ s.name }}</NuxtLink><span v-if="i < flagship.length - 2">, </span><span v-else-if="i === flagship.length - 2"> and </span>
            </template>
           , each one assembled into a single system shaped to your business.
          </p>

          <div class="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <NuxtLink
              to="/diagnose"
              class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[15px] font-semibold px-5 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Book a discovery call
              <ArrowRight :size="16" :stroke-width="2" class="transition-transform duration-200 group-hover:translate-x-0.5" />
            </NuxtLink>
            <NuxtLink
              to="/systems"
              class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white hover:border-cyan-brand/40 text-ink text-[15px] font-semibold px-5 py-3.5 transition-colors"
            >
              Browse all systems
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- AEO answer-first block (S07): question-led, liftable ≤40-word definition
           of the pillar, placed high for featured-snippet / AI-overview lift. -->
      <section
        v-if="pillar.question && pillar.definition"
        class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-12 md:mt-16"
      >
        <div v-reveal class="max-w-3xl">
          <AnswerBlock :question="pillar.question" :answer="pillar.definition" />
        </div>
      </section>

      <!-- GEO: one real, cited statistic + optional attributed quote (S07-geo),
           so generative engines can lift an authoritative, attributed figure. -->
      <section
        v-if="pillar.stat"
        class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-12 md:mt-16"
      >
        <figure v-reveal class="max-w-3xl rounded-2xl border border-line bg-surface-alt/60 p-6 md:p-7">
          <p class="text-[18px] md:text-[20px] leading-[1.5] text-ink font-display">
            {{ pillar.stat.text }}
          </p>
          <figcaption class="mt-3 text-[14px] text-mute">
            <a
              :href="pillar.stat.url"
              target="_blank"
              rel="noopener"
              class="text-cyan-brand-deep hover:text-ink underline underline-offset-2 transition"
            >{{ pillar.stat.source }}</a>
          </figcaption>
          <blockquote
            v-if="pillar.quote"
            class="mt-5 border-l-2 border-cyan-brand/40 pl-4 text-[15.5px] italic text-mute"
          >
            “{{ pillar.quote.text }}” -
            <a
              :href="pillar.quote.url"
              target="_blank"
              rel="noopener"
              class="not-italic text-cyan-brand-deep hover:text-ink"
            >{{ pillar.quote.source }}</a>
          </blockquote>
        </figure>
      </section>

      <!-- Member modules (hub -> every member, rule L6) -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-20" aria-labelledby="members-heading">
        <div v-reveal class="mb-7 md:mb-9 max-w-2xl">
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            {{ members.length }} systems
          </div>
          <h2
            id="members-heading"
            class="mt-3 font-display text-[26px] sm:text-[32px] md:text-[38px] leading-[1.1] tracking-tight text-ink"
          >
            Systems that deliver {{ pillar.label }}.
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <SystemCard
            v-for="(s, i) in members"
            :key="s.slug"
            v-reveal:scale="i * 40"
            :system="s"
          />
        </div>
      </section>

      <!-- Outcomes -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal class="rounded-2xl border border-line bg-white p-7 md:p-9">
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            What changes
          </div>
          <ul class="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <li
              v-for="(o, i) in pillar.outcomes"
              :key="i"
              class="text-[15.5px] md:text-[16px] leading-[1.6] text-ink"
            >
              {{ o }}
            </li>
          </ul>
        </div>
      </section>

      <!-- The four pillars: cluster cross-links (hub -> other hubs, rule L6) -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24" aria-labelledby="pillars-heading">
        <div v-reveal class="mb-7 md:mb-9 max-w-2xl">
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            The four pillars
          </div>
          <h2
            id="pillars-heading"
            class="mt-3 font-display text-[24px] sm:text-[28px] md:text-[32px] leading-[1.12] tracking-tight text-ink"
          >
            {{ pillar.label }} is one of four. Explore the rest.
          </h2>
        </div>

        <ul class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          <li v-for="(o, i) in others" :key="o.slug" v-reveal:scale="i * 60">
            <NuxtLink
              :to="`/what-we-build/${o.slug}`"
              class="group flex flex-col h-full rounded-2xl border border-line bg-white p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-brand/40 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span class="flex items-center gap-2.5">
                <span class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25">
                  <component :is="pillarMetaForHub(o.slug)?.icon" :size="17" :stroke-width="1.9" aria-hidden="true" />
                </span>
                <span class="font-display text-[19px] md:text-[20px] leading-[1.15] text-ink">{{ o.label }}</span>
              </span>
              <span class="mt-3 text-[14px] leading-[1.55] text-mute">{{ o.tagline }}</span>
            </NuxtLink>
          </li>
        </ul>
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
