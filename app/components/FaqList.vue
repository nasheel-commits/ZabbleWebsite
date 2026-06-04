<script setup lang="ts">
// Reusable AEO FAQ list (S07).
//
// Renders a question-shaped Q&A set as plain semantic HTML — each question an
// <h3>, each answer a <p>, all answers visible (not collapsed) so answer
// engines can extract them and Google is eligible to show FAQ / People-Also-Ask
// results. Fully server-rendered: every question and answer is in the
// prerendered DOM with no client JS required.
//
// The same `items` array is exposed for S03 to attach FAQPage / QAPage JSON-LD
// — keep on-page text and schema sourced from one place to stay consistent.
// See docs/seo/content/aeo-standard.md.

import type { Faq } from '~/data/systems'

withDefaults(
  defineProps<{
    /** The Q&A pairs to render. */
    items: Faq[]
    /** Section heading. */
    heading?: string
    /** Small eyebrow label above the heading. */
    eyebrow?: string
  }>(),
  {
    heading: 'Frequently asked questions',
    eyebrow: 'FAQ',
  },
)
</script>

<template>
  <section v-if="items.length" :aria-label="heading">
    <div
      v-if="eyebrow"
      class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
    >
      <span class="dot" />
      {{ eyebrow }}
    </div>
    <h2
      class="mt-3 font-display text-[28px] sm:text-[34px] md:text-[40px] leading-[1.1] tracking-tight text-ink"
    >
      {{ heading }}
    </h2>

    <dl class="mt-8 md:mt-10 divide-y divide-line border-t border-line">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="py-6 md:py-7 grid grid-cols-1 md:grid-cols-[minmax(0,22rem)_1fr] gap-2 md:gap-8"
      >
        <dt class="font-display text-[17.5px] md:text-[19px] leading-[1.3] text-ink">
          {{ item.question }}
        </dt>
        <dd class="text-[15px] md:text-[15.5px] leading-[1.65] text-mute">
          {{ item.answer }}
        </dd>
      </div>
    </dl>
  </section>
</template>
