<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from '@lucide/vue'
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

useHead({
  title: () => `${sys.value.name} · Zabble`,
  meta: [
    {
      name: 'description',
      content: () => sys.value.tagline,
    },
  ],
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
        <SystemHero :system="sys" />
      </section>

      <!-- Triptych -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <article
            v-reveal:scale
            class="rounded-2xl border border-line bg-white p-6 md:p-7"
          >
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              The Problem
            </div>
            <p class="mt-3 text-[15.5px] md:text-[16px] leading-[1.65] text-ink">
              <!-- TODO: replace with sys.problem once content is written. -->
              {{ sys.problem ?? 'TODO — Describe the operational problem the client was living with.' }}
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
              <!-- TODO: replace with sys.whatWeBuilt. -->
              {{ sys.whatWeBuilt ?? 'TODO — Describe the system we built, in plain language.' }}
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
              <!-- TODO: replace with sys.whatChanged. -->
              {{ sys.whatChanged ?? 'TODO — What changed for the business after we shipped.' }}
            </p>
          </article>
        </div>
      </section>

      <!-- Interactive demo placeholder -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <DemoSlot :system-slug="sys.slug" />
      </section>

      <!-- How it fits the four pillars -->
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 mt-16 md:mt-24">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            How it fits the four pillars
          </div>
          <h2
            class="mt-4 font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink"
          >
            <!-- TODO: signed-off lede. -->
            One system, four jobs.
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
              <!-- TODO: replace with sys.pillarNotes[p.slug] once content is written. -->
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

      <CtaStrip
        eyebrow="Next Step"
        heading="Want one built for your business?"
        body="The first conversation is free. And useful either way."
      />
    </main>

    <TheFooter />
  </div>
</template>
