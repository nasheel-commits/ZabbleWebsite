<script setup lang="ts">
import { computed } from 'vue'
import { industryBySlug } from '~/data/industries'
import { systemBySlug } from '~/data/systems'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const industry = computed(() => industryBySlug(slug.value))

if (!industry.value) {
  throw createError({ statusCode: 404, statusMessage: 'Industry not found', fatal: true })
}

const ind = computed(() => industry.value!)
// Resolve module slugs to live systems (drop any that aren't live/known).
const modules = computed(() =>
  ind.value.moduleSlugs
    .map((s) => systemBySlug(s))
    .filter((s): s is NonNullable<typeof s> => !!s && s.status === 'live'),
)

usePageSeo(() => ({
  title: ind.value.seoTitle,
  description: ind.value.seoDescription,
  path: `/industries/${ind.value.slug}`,
  ogType: 'article',
  primaryKeyword: ind.value.keywords[0],
}))

const triptych = computed(() => [
  { eyebrow: 'The Problem', body: ind.value.problem },
  { eyebrow: 'What We Build', body: ind.value.whatWeBuild },
  { eyebrow: 'What Changes', body: ind.value.whatChanges },
])
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <!-- Breadcrumb -->
      <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8 md:mb-10 text-[13.5px] font-medium text-mute">
          <NuxtLink to="/industries" class="hover:text-ink transition-colors">Industries</NuxtLink>
          <span class="mx-2 text-mute-2">/</span>
          <span class="text-ink">{{ ind.name }}</span>
        </nav>
      </div>

      <!-- Hero + answer-first -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Industry
          </div>
          <h1 class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.05] tracking-tight text-ink">
            {{ ind.h1 }}
          </h1>
          <p data-answer-first class="mt-6 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] text-ink">
            {{ ind.intro }}
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

      <!-- Triptych: problem -> build -> changes -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-14 md:mt-20">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <article
            v-for="(t, i) in triptych"
            :key="t.eyebrow"
            v-reveal:scale="i * 80"
            class="rounded-2xl border border-line bg-white p-6 md:p-7"
          >
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">{{ t.eyebrow }}</div>
            <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">{{ t.body }}</p>
          </article>
        </div>
      </section>

      <!-- Modules assembled for this industry -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-14 md:mt-20">
        <div v-reveal class="max-w-3xl">
          <h2 class="font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink">
            The systems we assemble for {{ ind.name.toLowerCase() }}
          </h2>
          <p class="mt-3 text-[14.5px] md:text-[15px] text-mute">
            No business gets all of them, it gets the handful that fix the problem costing it the most, wired into one system.
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
      </section>

      <CtaStrip eyebrow="Next Step" :heading="`Want a system built for your ${ind.name.toLowerCase()} operation?`" />
    </main>

    <TheFooter />
  </div>
</template>
