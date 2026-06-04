<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from '@lucide/vue'

import { pillarHubBySlug, systemsForPillar, pillarIcon } from '~/data/pillars'

const route = useRoute()
const slug = computed(() => String(route.params.pillar ?? ''))
const hub = computed(() => pillarHubBySlug(slug.value))

// 404 if the pillar isn't one of the four. SSR-friendly.
if (!hub.value) {
  throw createError({ statusCode: 404, statusMessage: 'Pillar not found', fatal: true })
}

const pillar = computed(() => hub.value!)
const icon = computed(() => pillarIcon(pillar.value.slug))
const modules = computed(() => systemsForPillar(pillar.value.slug))

useHead({
  title: () => `${pillar.value.label} — ${pillar.value.question} · Zabble`,
  meta: [{ name: 'description', content: () => pillar.value.metaDescription }],
})
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <!-- Breadcrumb -->
        <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
          <NuxtLink
            to="/systems"
            class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
          >
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            All systems
          </NuxtLink>
        </nav>

        <!-- Hero: question H1 + liftable definition -->
        <header class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span
              class="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
            >
              <component :is="icon" :size="15" :stroke-width="1.9" aria-hidden="true" />
            </span>
            {{ pillar.label }} · Pillar
          </div>

          <h1
            class="mt-5 md:mt-6 font-display text-[34px] sm:text-[44px] md:text-[56px] leading-[1.06] tracking-tight text-ink"
          >
            {{ pillar.question }}
          </h1>

          <p class="mt-6 text-[18px] md:text-[20px] leading-[1.6] text-ink">
            {{ pillar.definition }}
          </p>

          <p class="mt-5 text-[16px] md:text-[17px] leading-[1.7] text-mute">
            {{ pillar.intro }}
          </p>
        </header>

        <!-- Cited statistic -->
        <figure class="mt-10 md:mt-12 max-w-3xl rounded-2xl border border-line bg-surface-alt/60 p-6 md:p-7">
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
        </figure>

        <!-- What Zabble builds -->
        <section class="mt-12 md:mt-14 max-w-3xl">
          <h2 class="font-display text-[26px] md:text-[32px] leading-[1.12] text-ink">
            What Zabble builds for {{ pillar.label.toLowerCase() }}
          </h2>
          <p class="mt-4 text-[16px] md:text-[17px] leading-[1.7] text-mute">
            {{ pillar.whatWeBuild }}
          </p>

          <blockquote
            v-if="pillar.quote"
            class="mt-7 border-l-2 border-cyan-brand pl-5 text-[18px] md:text-[19px] leading-[1.5] text-ink font-display"
          >
            “{{ pillar.quote.text }}”
            <cite class="mt-2 block not-italic text-[13.5px] font-sans text-mute">
              —
              <a
                :href="pillar.quote.url"
                target="_blank"
                rel="noopener"
                class="text-cyan-brand-deep hover:text-ink underline underline-offset-2 transition"
              >{{ pillar.quote.source }}</a>
            </cite>
          </blockquote>
        </section>

        <!-- Modules under this pillar -->
        <section class="mt-14 md:mt-16">
          <h2 class="font-display text-[26px] md:text-[32px] leading-[1.12] text-ink">
            {{ modules.length }} Zabble systems deliver {{ pillar.label.toLowerCase() }}
          </h2>
          <p class="mt-3 max-w-2xl text-[16px] leading-[1.6] text-mute">
            Each is a building block. In a discovery session we work out which ones a
            specific business needs, and assemble them into one operating system.
          </p>

          <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            <SystemCard v-for="s in modules" :key="s.slug" :system="s" />
          </div>
        </section>
      </div>

      <CtaStrip
        :eyebrow="'Next Step'"
        :heading="`Want ${pillar.label.toLowerCase()} built around your business?`"
        body="The first conversation is free. And useful either way."
      />
    </main>

    <TheFooter />
  </div>
</template>
