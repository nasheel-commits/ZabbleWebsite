<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { PILLARS } from '~/data/systems'
import { NAP } from '~/data/nap'
import { LOCATIONS } from '~/data/locations'

// Per-page SEO (S02 standard): bare title (titleTemplate brands once), canonical,
// OG + Twitter. This is the canonical Organization page (schema slot below).
usePageSeo({
  title: 'About Zabble, Bespoke Operational Systems',
  description:
    'Zabble is a South African software consultancy building bespoke operational systems, automation, audit trails, anomaly detection and analytics.',
  path: '/about',
  ogType: 'website',
})

// SCHEMA SLOT (S08): this is the canonical `Organization` page. Emit Organization
// (name, url, description = NAP.description, areaServed, sameAs = NAP.sameAs, founder/
// partner context, contactPoint = NAP.email). Fields in localbusiness-schema-fields.md.

// Quotable, self-contained facts, written to be liftable verbatim by an AI engine
// (GEO). Each is a complete, attributable claim. Hand-off mirror in
// docs/seo/targets/localbusiness-schema-fields.md and S08's entity work.
const facts = [
  'Zabble is a South African software consultancy that builds bespoke operational systems.',
  'Zabble builds custom software around four pillars: automation, audit trails, anomaly detection, and analytics.',
  'Zabble serves businesses across South Africa, including Johannesburg, Sandton, Cape Town, Pretoria and Durban.',
  'Rather than fitting a business to off-the-shelf software, Zabble builds the system around the specific operational problem slowing the business down.',
]
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <!-- Hero -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            About Zabble
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] leading-[1.04] tracking-tight text-ink">
            We build the system <span class="cyan-underline">around the problem.</span>
          </h1>
          <p class="mt-6 max-w-2xl text-[16px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute">
            {{ NAP.longDescription }}
          </p>
        </div>
      </section>

      <!-- Fast facts (quotable / entity) -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-14 md:mt-20">
        <div v-reveal class="rounded-2xl border border-line bg-surface-alt/60 p-6 md:p-8">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            In one line
          </div>
          <p class="mt-3 max-w-3xl font-display text-[22px] sm:text-[26px] md:text-[30px] leading-[1.25] text-ink">
            {{ NAP.description }}
          </p>
        </div>
      </section>

      <!-- The four pillars -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            How we build
          </div>
          <h2 class="mt-4 font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink">
            Four pillars under every system.
          </h2>
        </div>
        <div class="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <article
            v-for="(p, i) in PILLARS"
            :key="p.slug"
            v-reveal:scale="i * 60"
            class="rounded-2xl border border-line bg-white p-5 md:p-6"
          >
            <span class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25" aria-hidden="true">
              <component :is="p.icon" :size="18" :stroke-width="1.9" />
            </span>
            <p class="mt-3 font-display text-[19px] leading-[1.15] text-ink">{{ p.label }}</p>
          </article>
        </div>
      </section>

      <!-- Quotable facts list (E-E-A-T / GEO) -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div v-reveal class="md:pr-6">
            <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <span class="dot" />
              The short version
            </div>
            <h2 class="mt-4 font-display text-[26px] sm:text-[30px] md:text-[34px] leading-[1.12] tracking-tight text-ink">
              What Zabble is, in plain terms.
            </h2>
            <p class="mt-4 text-[15px] leading-[1.65] text-mute">
              The facts beside this are written to be quoted as-is, by a person, a journalist, or an AI
              answer engine. They're consistent with how we describe ourselves everywhere.
            </p>
          </div>
          <ul v-reveal:scale="80" class="space-y-3">
            <li
              v-for="(f, i) in facts"
              :key="i"
              class="rounded-xl border border-line bg-white px-5 py-4 text-[15px] leading-[1.6] text-ink"
            >
              {{ f }}
            </li>
          </ul>
        </div>
      </section>

      <!-- Partner + reach -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <article v-reveal:scale class="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">Who we work with</div>
            <p class="mt-3 text-[15.5px] leading-[1.65] text-ink">
              We build with selected partners where it makes the work better -
              <span class="font-medium">{{ NAP.partners.join(', ') }}</span> among them, and directly
              with the operators whose problems we're solving.
            </p>
          </article>
          <article v-reveal:scale="80" class="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">Where we work</div>
            <p class="mt-3 text-[15.5px] leading-[1.65] text-ink">
              Across South Africa, with a focus on
              {{ LOCATIONS.map((l) => l.city).join(', ') }}.
            </p>
            <NuxtLink to="/locations" class="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink hover:text-ink-soft transition-colors">
              See where we build
              <ArrowRight :size="15" />
            </NuxtLink>
          </article>
        </div>
      </section>

      <CtaStrip
        eyebrow="Next Step"
        heading="Have a problem worth building for?"
        :body="`The first conversation is free. Or reach us directly at ${NAP.email}.`"
      />
    </main>

    <TheFooter />
  </div>
</template>
