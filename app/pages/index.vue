<script setup lang="ts">
import { HOME_FAQS } from '~/data/site-faqs'

// ── Structured data / JSON-LD (S03) ────────────────────────────────────────
// Home FAQPage. The page renders <TheFaq> → <FaqList :items="HOME_FAQS">; this
// emits the matching FAQPage Question nodes from the SAME HOME_FAQS array, so
// the JSON-LD Q&A is byte-identical to the on-page Q&A (the AnswerBlock "What
// does Zabble do?" lead is intentionally left out — FAQPage mirrors the FAQ
// list, not the page's primary heading). Site-wide Organization + WebSite +
// WebPage identity is injected globally in nuxt.config.
useFaqSchema(HOME_FAQS)
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheScrollProgress />
    <TheNav />
    <main>
      <TheHero />
      <TheProblem />
      <TheMeet />
      <ThePlan />
      <TheWhatWeBuild />
      <TheDoNothing />
      <TheFaq />
      <div class="cta-bleed-wrap">
        <div class="cta-bleed-overlay" aria-hidden="true" />
        <TheWhenItWorks />
        <TheFinalCta />
      </div>
    </main>
    <TheFooter />
  </div>
</template>

<style scoped>
.cta-bleed-wrap {
  position: relative;
  isolation: isolate;
}

.cta-bleed-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background: linear-gradient(
    to bottom,
    rgba(1, 219, 241, 0) 0%,
    rgba(1, 219, 241, 0) 30%,
    rgba(1, 219, 241, 0.025) 45%,
    rgba(1, 219, 241, 0.07) 60%,
    rgba(1, 219, 241, 0.1) 75%,
    rgba(1, 219, 241, 0.06) 90%,
    rgba(1, 219, 241, 0) 100%
  );
}
</style>
