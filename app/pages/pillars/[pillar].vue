<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@lucide/vue'

import { PILLARS, SYSTEMS, pillarBySlug, type PillarSlug } from '~/data/systems'
import { PILLAR_HUBS } from '~/data/pillar-content'

const route = useRoute()

const slug = computed(() => String(route.params.pillar ?? ''))
const isValid = computed(() => PILLARS.some((p) => p.slug === slug.value))

// 404 for any non-pillar slug. SSR-friendly: throws server-side too.
if (!isValid.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Pillar not found',
    fatal: true,
  })
}

const pillarSlug = computed(() => slug.value as PillarSlug)
const meta = computed(() => pillarBySlug(pillarSlug.value)!)
const hub = computed(() => PILLAR_HUBS[pillarSlug.value])

// Systems that deliver this pillar — only live ones are linked from the hub.
const memberSystems = computed(() =>
  SYSTEMS.filter((s) => s.status === 'live' && s.pillars.includes(pillarSlug.value)),
)

useHead({
  title: () => hub.value.metaTitle,
  meta: [{ name: 'description', content: () => hub.value.metaDescription }],
})
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
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span
              class="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
              aria-hidden="true"
            >
              <component :is="meta.icon" :size="15" :stroke-width="1.9" />
            </span>
            One of the four pillars
          </div>
          <h1
            class="mt-5 font-display text-[34px] sm:text-[46px] md:text-[56px] leading-[1.06] tracking-tight text-ink"
          >
            {{ hub.h1 }}
          </h1>
          <p class="mt-5 max-w-2xl text-[16px] md:text-[18.5px] leading-[1.6] text-mute">
            {{ hub.intro }}
          </p>
        </div>
      </section>

      <!-- Answer-first block -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-10 md:mt-14">
        <div v-reveal class="max-w-3xl">
          <AnswerBlock :question="hub.answer.question" :answer="hub.answer.answer" />
        </div>
      </section>

      <!-- Systems that deliver this pillar (internal linking) -->
      <section
        v-if="memberSystems.length"
        class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24"
      >
        <div v-reveal class="mb-7 md:mb-9 max-w-2xl">
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Systems that deliver {{ meta.label }}
          </div>
          <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">
            A given build leans on one pillar or weaves all four together. These
            Zabble systems carry the {{ meta.label }} pillar.
          </p>
        </div>
        <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <li v-for="s in memberSystems" :key="s.slug">
            <NuxtLink
              :to="`/systems/${s.slug}`"
              class="group block h-full rounded-2xl border border-line bg-white p-5 md:p-6 hover:border-cyan-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="font-display text-[18px] leading-[1.15] text-ink">{{ s.name }}</span>
                <ArrowRight :size="15" :stroke-width="2" class="text-mute-2 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
              <p class="mt-2 text-[14px] leading-[1.55] text-mute">{{ s.tagline }}</p>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <!-- FAQ -->
      <section class="mx-auto max-w-4xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal>
          <FaqList :items="hub.faqs" />
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
