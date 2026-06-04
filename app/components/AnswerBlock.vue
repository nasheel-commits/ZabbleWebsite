<script setup lang="ts">
// Reusable AEO answer-first block (S07).
//
// Renders a question-led heading followed by a single self-contained answer
// paragraph — the shape an answer engine (featured snippet, People Also Ask,
// AI Overview) lifts verbatim. Pure server-rendered semantic HTML: the heading
// and answer are present in the prerendered DOM with no client JS required to
// read them. See docs/seo/content/aeo-standard.md for the pattern.

withDefaults(
  defineProps<{
    /** The question, phrased as a user asks it. Rendered as the heading. */
    question: string
    /** Self-contained 40–60 word answer. Rendered first, before any detail. */
    answer: string
    /** Small eyebrow label above the question. */
    eyebrow?: string
    /**
     * Heading level for the question. The page's single h1 lives elsewhere
     * (the hero), so default to h2.
     */
    as?: 'h2' | 'h3'
  }>(),
  {
    eyebrow: 'In short',
    as: 'h2',
  },
)
</script>

<template>
  <section
    class="rounded-2xl border border-line bg-white p-6 md:p-8 ring-1 ring-cyan-brand/15"
  >
    <div
      v-if="eyebrow"
      class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
    >
      <span class="dot" />
      {{ eyebrow }}
    </div>
    <component
      :is="as"
      class="mt-3 font-display text-[22px] sm:text-[26px] md:text-[30px] leading-[1.15] tracking-tight text-ink"
    >
      {{ question }}
    </component>
    <p data-answer-first class="mt-3 max-w-2xl text-[15.5px] md:text-[16.5px] leading-[1.65] text-ink">
      {{ answer }}
    </p>
  </section>
</template>
