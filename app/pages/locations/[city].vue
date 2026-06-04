<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight, MapPin } from '@lucide/vue'

import { locationBySlug } from '~/data/locations'
import { systemBySlug } from '~/data/systems'
import { industryBySlug } from '~/data/industries'
import { NAP } from '~/data/nap'

const route = useRoute()
const slug = computed(() => String(route.params.city ?? ''))
const location = computed(() => locationBySlug(slug.value))

// 404 (SSR-friendly) if the city isn't in the data file.
if (!location.value) {
  throw createError({ statusCode: 404, statusMessage: 'Location not found', fatal: true })
}

const loc = computed(() => location.value!)

// Resolve the system + industry references to their full records for linking.
const systems = computed(() =>
  loc.value.systemRefs
    .map((ref) => ({ ref, system: systemBySlug(ref.slug) }))
    .filter((x) => x.system),
)
const industries = computed(() =>
  loc.value.industrySlugs.map((s) => industryBySlug(s)).filter(Boolean),
)

// Per-page SEO (S02 standard): bare title (titleTemplate brands once), canonical,
// OG + Twitter. metaTitle is de-branded so the global template doesn't double it.
usePageSeo(() => ({
  title: loc.value.metaTitle.replace(/\s*[|·–-]\s*Zabble\s*$/i, '').trim(),
  description: loc.value.metaDescription,
  path: `/locations/${loc.value.slug}`,
  ogType: 'website',
}))

// SCHEMA SLOT (S08): emit a `LocalBusiness` (areaServed = this city + nearbyAreas,
// geo = loc.geo, NAP from data/nap.ts) and breadcrumb here. Fields + exact JSON-LD
// are specified in docs/seo/targets/localbusiness-schema-fields.md. Kept out of this
// file to respect schema write-ownership (S03/S08).
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <!-- Breadcrumb -->
      <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
          <NuxtLink
            to="/locations"
            class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
          >
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            All locations
          </NuxtLink>
        </nav>
      </div>

      <!-- Hero -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <MapPin :size="14" :stroke-width="2" aria-hidden="true" />
            {{ loc.kicker }}
          </div>
          <h1 class="mt-5 font-display text-[36px] sm:text-[48px] md:text-[58px] lg:text-[64px] leading-[1.05] tracking-tight text-ink">
            {{ loc.h1 }}
          </h1>
          <p class="mt-6 max-w-2xl text-[16px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute">
            {{ loc.intro }}
          </p>
          <div class="mt-7 md:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <NuxtLink
              to="/diagnose"
              class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[15px] font-semibold px-5 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Book a discovery call
              <ArrowRight :size="16" class="transition-transform duration-200 group-hover:translate-x-0.5" />
            </NuxtLink>
            <NuxtLink
              to="/systems"
              class="inline-flex items-center justify-center gap-2 rounded-lg border border-line hover:border-ink/30 bg-white hover:bg-surface-alt text-ink text-[15px] font-medium px-5 py-3.5 transition-colors"
            >
              Browse the systems
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Local context: economy + why local -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <article v-reveal:scale class="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              What {{ loc.city }} runs on
            </div>
            <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">{{ loc.economy }}</p>
            <ul class="mt-5 flex flex-wrap gap-2">
              <li
                v-for="s in loc.sectors"
                :key="s"
                class="inline-flex items-center rounded-full border border-line bg-surface-alt px-3 py-1 text-[12.5px] font-medium text-mute"
              >
                {{ s }}
              </li>
            </ul>
          </article>

          <article v-reveal:scale="80" class="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              Why a local partner
            </div>
            <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">{{ loc.whyLocal }}</p>
            <p class="mt-5 text-[13.5px] leading-[1.55] text-mute-2">
              We work with operators across {{ loc.city }} and the wider {{ loc.region }} —
              including
              <span class="text-mute">{{ loc.nearbyAreas.slice(0, 4).join(', ') }}</span>
              and beyond.
            </p>
          </article>
        </div>
      </section>

      <!-- Systems that fit this city -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Built for {{ loc.city }}
          </div>
          <h2 class="mt-4 font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink">
            The systems that fit how {{ loc.city }} operates.
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

      <!-- Industries -->
      <section v-if="industries.length" class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            By industry
          </div>
          <h2 class="mt-4 font-display text-[26px] sm:text-[30px] md:text-[34px] leading-[1.12] tracking-tight text-ink">
            Where we go deep in {{ loc.region }}.
          </h2>
        </div>
        <div class="mt-7 flex flex-wrap gap-3">
          <NuxtLink
            v-for="ind in industries"
            :key="ind!.slug"
            :to="`/industries/${ind!.slug}`"
            class="group inline-flex items-center gap-2 rounded-full border border-line hover:border-cyan-brand/40 bg-white px-4 py-2.5 text-[14px] font-medium text-ink transition-colors"
          >
            {{ ind!.name }}
            <ArrowRight :size="14" class="text-mute group-hover:text-ink transition-transform duration-200 group-hover:translate-x-0.5" />
          </NuxtLink>
        </div>
      </section>

      <CtaStrip
        eyebrow="Next Step"
        :heading="`Have a problem worth solving in ${loc.city}?`"
        body="The first conversation is free. We find the most expensive operational problem in your business — and tell you whether it's worth building for."
      />
    </main>

    <TheFooter />
  </div>
</template>
