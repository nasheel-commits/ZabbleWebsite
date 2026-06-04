<script setup lang="ts">
import { AlertOctagon, FileSpreadsheet, Gauge, Plug } from '@lucide/vue'

const symptoms = [
  {
    icon: FileSpreadsheet,
    title: 'The spreadsheet three people fill in by hand',
    body: 'Every week. The same tab. Someone forgets. Someone else fixes it.',
  },
  {
    icon: Plug,
    title: 'Five tools that never talk to each other',
    body: 'Your data lives everywhere and nowhere. Nothing reconciles cleanly.',
  },
  {
    icon: Gauge,
    title: 'Decisions made on gut feel',
    body: "Because the dashboard you need doesn't exist. And reports come in too late.",
  },
  {
    icon: AlertOctagon,
    title: "Errors caught only when it's too late",
    body: 'You find out after the customer does. After the payment goes out. After the audit.',
  },
]

</script>

<template>
  <section class="relative bg-surface-alt/60 py-28 md:py-36 border-y border-line/70">
    <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div v-reveal:left class="lg:col-span-5">
          <div class="text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            The Problem
          </div>
          <h2
            class="mt-5 font-display text-[36px] sm:text-[44px] md:text-[54px] leading-[1.08] tracking-tight text-ink"
          >
            Something in your business is
            <span class="cyan-underline">costing you.</span>
            You can probably name it.
          </h2>
        </div>

        <div v-reveal:right="120" class="lg:col-span-7 space-y-6 text-[17px] md:text-[18px] leading-[1.7] text-mute">
          <p>
            Maybe it's the spreadsheet three people fill in by hand every week. The data trapped in
            five different tools that never talk to each other. The decisions made on gut feel because
            the dashboard you need doesn't exist. The errors that only get caught when it's already too late.
          </p>
          <p>
            Every business runs on workflows. The question is whether yours are quietly bleeding you of
            <span class="text-ink font-medium">time</span>,
            <span class="text-ink font-medium">money</span>, or
            <span class="text-ink font-medium">peace of mind</span>.
          </p>
        </div>
      </div>

      <div class="mt-20 hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="(s, i) in symptoms"
          :key="s.title"
          v-reveal:scale="i * 90"
          class="group rounded-2xl border border-line bg-white p-7 transition hover:border-cyan-brand/60 hover:shadow-[0_18px_50px_-30px_rgba(1,219,241,0.6)]"
        >
          <div
            class="inline-flex items-center justify-center h-11 w-11 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
          >
            <component :is="s.icon" :size="20" />
          </div>
          <p class="mt-6 text-[16.5px] font-semibold text-ink leading-[1.4]">{{ s.title }}</p>
          <p class="mt-3 text-[16px] lg:text-[15px] text-mute leading-[1.7]">{{ s.body }}</p>
        </div>
      </div>

      <!-- Cited evidence: quantifies the operational drag this section names.
           Moved here from Meet Zabble's #who-we-are block, where it sat beside
           the NAP facts and read as an aside rather than problem evidence. -->
      <figure
        v-reveal:fade="120"
        class="mt-16 md:mt-20 max-w-3xl rounded-2xl border border-line bg-white p-6 md:p-7"
      >
        <blockquote class="text-[18px] md:text-[20px] leading-[1.55] text-ink font-display">
          “More occupations will change than will be automated away.”
        </blockquote>
        <figcaption class="mt-3 text-[14.5px] text-mute leading-[1.6]">
          About <strong class="text-ink font-semibold">60% of all occupations</strong>
          have at least 30% of their activities that could be automated, which is
          exactly the operational drag we remove.
          <a
            href="https://www.mckinsey.com/featured-insights/future-of-work/jobs-lost-jobs-gained-what-the-future-of-work-will-mean-for-jobs-skills-and-wages"
            target="_blank"
            rel="noopener"
            class="text-cyan-brand-deep hover:text-ink underline underline-offset-2 transition"
          >McKinsey Global Institute, <em>A Future That Works</em>, 2017</a>.
        </figcaption>
      </figure>
    </div>
  </section>
</template>
