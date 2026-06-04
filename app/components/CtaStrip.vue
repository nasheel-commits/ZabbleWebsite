<script setup lang="ts">

// Lightweight reusable bottom-of-page CTA. Lives at /systems and /systems/[slug].
// Matches the simpler "First Step" treatment from TheFinalCta but without the
// section-opener heavy heading scale — these are mid-page closers.


import { ArrowRight, Mail } from '@lucide/vue'

withDefaults(
  defineProps<{
    /** Eyebrow label shown above the heading. */
    eyebrow?: string
    /** Main heading. */
    heading?: string
    /** Optional supporting line under the heading. */
    body?: string
    /** Primary CTA copy. Default matches site-wide CTA. */
    primaryLabel?: string
    /** Primary CTA destination. Default goes to the diagnose flow. */
    primaryTo?: string
    /** When true, also shows the sales@zabble.org mailto secondary action. */
    showEmail?: boolean
  }>(),
  {
    eyebrow: 'Next Step',
    heading: "Want one built for your business?",
    body: 'The first conversation is free. And useful either way.',
    primaryLabel: 'Book a discovery call',
    primaryTo: '/diagnose',
    showEmail: true,
  },
)

</script>

<template>
  <section class="relative py-20 md:py-28 lg:py-32">
    <div class="mx-auto max-w-3xl px-5 md:px-8 lg:px-12">
      <div
        class="rounded-2xl border border-line bg-white px-6 sm:px-10 md:px-14 py-10 md:py-14 text-center"
      >
        <div
          class="inline-flex items-center gap-2 text-[12px] md:text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
        >
          <span class="dot" />
          {{ eyebrow }}
        </div>
        <h2
          class="mt-5 font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink"
        >
          {{ heading }}
        </h2>
        <p v-if="body" class="mx-auto mt-4 max-w-xl text-[15.5px] md:text-[17px] leading-[1.6] text-mute">
          {{ body }}
        </p>

        <div class="mt-7 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink
            :to="primaryTo"
            class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[15px] font-semibold px-5 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {{ primaryLabel }}
            <ArrowRight :size="16" class="transition-transform duration-200 group-hover:translate-x-0.5" />
          </NuxtLink>
          <a
            v-if="showEmail"
            href="mailto:sales@zabble.org"
            class="group inline-flex items-center justify-center gap-2 rounded-lg border border-line hover:border-ink/30 bg-white hover:bg-surface-alt text-ink text-[15px] font-medium px-5 py-3.5 transition-colors"
          >
            <Mail :size="16" class="text-mute" />
            sales@zabble.org
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
