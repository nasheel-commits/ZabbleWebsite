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
