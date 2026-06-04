<script setup lang="ts">
import { ArrowRight, Mail, Copy } from '@lucide/vue'
import { NAP, napHasAddress, napAddressLine } from '~/data/nap'
import { SYSTEMS } from '~/data/systems'
import { LOCATIONS } from '~/data/locations'

const liveCount = SYSTEMS.filter((s) => s.status === 'live').length

// Per-page SEO (S02 standard): bare title (titleTemplate brands once), canonical,
// OG + Twitter. Organization/press schema slot below.
usePageSeo({
  title: 'Press & Media Kit',
  description:
    'Press resources for Zabble: boilerplate, fast facts, brand basics and media contact. Zabble builds bespoke operational systems for South African businesses.',
  path: '/press',
  ogType: 'website',
})

// SCHEMA SLOT (S08): `Organization` with contactPoint (contactType "press"),
// logo, sameAs = NAP.sameAs. See localbusiness-schema-fields.md.

const facts: Array<{ k: string; v: string }> = [
  { k: 'What it is', v: 'A South African software consultancy building bespoke operational systems.' },
  { k: 'What it builds', v: `Custom software across four pillars — automation, audit trails, anomaly detection, analytics — with ${liveCount}+ documented system patterns.` },
  { k: 'Where', v: `South Africa — ${LOCATIONS.map((l) => l.city).join(', ')}.` },
  { k: 'Founded with', v: `Selected build partners, including ${NAP.partners.join(', ')}.` },
  { k: 'Website', v: NAP.url.replace('https://', '') },
  { k: 'Contact', v: NAP.email },
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
            Press &amp; Media
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] leading-[1.04] tracking-tight text-ink">
            Everything you need to <span class="cyan-underline">write about Zabble.</span>
          </h1>
          <p class="mt-6 max-w-2xl text-[16px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute">
            Boilerplate, fast facts and brand basics — ready to quote. For interviews, commentary on
            business automation in South Africa, or anything else, reach us at
            <a :href="`mailto:${NAP.email}`" class="text-ink underline underline-offset-4 hover:text-ink-soft">{{ NAP.email }}</a>.
          </p>
        </div>
      </section>

      <!-- Boilerplate -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-14 md:mt-20">
        <div v-reveal class="rounded-2xl border border-line bg-white p-6 md:p-8">
          <div class="flex items-center justify-between gap-3">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">Boilerplate — short</div>
            <span class="inline-flex items-center gap-1 text-[11.5px] text-mute-2"><Copy :size="12" /> quote as-is</span>
          </div>
          <p class="mt-3 text-[16px] md:text-[17px] leading-[1.65] text-ink">{{ NAP.description }}</p>

          <div class="mt-6 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">Boilerplate — long</div>
          <p class="mt-3 text-[15.5px] leading-[1.65] text-ink">{{ NAP.longDescription }}</p>
        </div>
      </section>

      <!-- Fast facts -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-12 md:mt-16">
        <div v-reveal class="max-w-3xl mb-6">
          <h2 class="font-display text-[26px] sm:text-[30px] md:text-[34px] leading-[1.12] tracking-tight text-ink">Fast facts</h2>
        </div>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          <div
            v-for="(f, i) in facts"
            :key="f.k"
            v-reveal:scale="i * 40"
            class="rounded-2xl border border-line bg-white p-5 md:p-6"
          >
            <dt class="text-[11.5px] uppercase tracking-[0.2em] text-mute-2 font-semibold">{{ f.k }}</dt>
            <dd class="mt-2 text-[15px] leading-[1.55] text-ink">{{ f.v }}</dd>
          </div>
          <div
            v-if="napHasAddress()"
            v-reveal:scale="240"
            class="rounded-2xl border border-line bg-white p-5 md:p-6"
          >
            <dt class="text-[11.5px] uppercase tracking-[0.2em] text-mute-2 font-semibold">Address</dt>
            <dd class="mt-2 text-[15px] leading-[1.55] text-ink">{{ napAddressLine() }}</dd>
          </div>
        </dl>
      </section>

      <!-- Brand basics -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-12 md:mt-16">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <article v-reveal:scale class="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">Naming</div>
            <p class="mt-3 text-[15px] leading-[1.6] text-ink">
              Always written <span class="font-semibold">Zabble</span> — one word, capital Z. Not "Zabble Inc",
              "Zable", or "Zabble Systems".
            </p>
          </article>
          <article v-reveal:scale="80" class="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">Brand</div>
            <div class="mt-3 flex items-center gap-3">
              <span class="inline-block h-7 w-7 rounded-md ring-1 ring-line" style="background:#01DBF1" aria-hidden="true" />
              <p class="text-[15px] leading-[1.6] text-ink">Accent <span class="font-mono text-[14px]">#01DBF1</span>, on white. Wordmark set in a serif display face.</p>
            </div>
          </article>
        </div>
      </section>

      <!-- Story angles / link to landscape asset -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-12 md:mt-16">
        <div v-reveal class="rounded-2xl border border-cyan-brand/25 bg-white p-6 md:p-8">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">For journalists &amp; analysts</div>
          <p class="mt-3 max-w-2xl text-[15.5px] leading-[1.65] text-ink">
            We publish a reference map of how South African businesses run their operations — the categories of
            operational software, what each does, and where bespoke fits. Useful background, free to cite.
          </p>
          <NuxtLink
            to="/insights/south-african-operations-software-landscape"
            class="mt-5 group inline-flex items-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[14.5px] font-semibold px-5 py-3 transition-colors"
          >
            Read the SA operations-software landscape
            <ArrowRight :size="15" class="transition-transform duration-200 group-hover:translate-x-0.5" />
          </NuxtLink>
        </div>
      </section>

      <!-- Media contact -->
      <section class="mx-auto max-w-3xl px-5 md:px-8 lg:px-12 mt-16 md:mt-20">
        <div v-reveal class="rounded-2xl border border-line bg-surface-alt/60 px-6 md:px-10 py-8 md:py-10 text-center">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Media contact
          </div>
          <p class="mt-4 font-display text-[24px] md:text-[28px] leading-[1.2] text-ink">Talk to a human.</p>
          <a
            :href="`mailto:${NAP.email}`"
            class="mt-5 group inline-flex items-center justify-center gap-2 rounded-lg border border-line hover:border-ink/30 bg-white hover:bg-surface-alt text-ink text-[15px] font-medium px-5 py-3.5 transition-colors"
          >
            <Mail :size="16" class="text-mute" />
            {{ NAP.email }}
          </a>
        </div>
      </section>
    </main>

    <TheFooter />
  </div>
</template>
