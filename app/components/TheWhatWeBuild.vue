<script setup lang="ts">
import { watch } from 'vue'
import { ArrowRight, BarChart3, Radar, ShieldCheck, Workflow } from '@lucide/vue'

const pillars = [
  {
    slug: 'automation',
    icon: Workflow,
    title: 'Automation',
    lede: 'Stop doing it by hand.',
    body: "Every business runs on workflows. The same spreadsheet, filled out every week. The same data, copied between two systems that don't talk. The same decisions, made on the same handful of inputs. We automate the parts of your business that shouldn't need a human anymore, so the people you have can focus on the work only people can do.",
  },
  {
    slug: 'audit-trails',
    icon: ShieldCheck,
    title: 'Audit Trails',
    lede: "You can't manage what you can't see.",
    body: 'We build visibility and governance into your operations, so you know who did what, when, and why. The result: faster reviews, cleaner audits, and confidence that what’s supposed to happen actually did.',
  },
  {
    slug: 'anomaly-detection',
    icon: Radar,
    title: 'Anomaly Detection',
    lede: "The risks that hurt most are the ones you don't see coming.",
    body: 'We build systems that watch your operations in the background and flag what’s unusual: the fraud, the error, the drift, the outlier. All before it becomes a problem. This is how you scale without losing control.',
  },
  {
    slug: 'analytics',
    icon: BarChart3,
    title: 'Analytics',
    lede: 'Every business has more data than it uses.',
    body: "We turn yours into a clear picture of what's happening and what matters, so you can stop making decisions on hunches and start making them on facts.",
  },
]

</script>

<template>
  <section id="what-we-build" class="relative py-28 md:py-36">
    <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
      <div v-reveal class="max-w-4xl">
        <div class="text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          What We Build
        </div>
        <h2
          class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.07] tracking-tight text-ink"
        >
          Four things every modern business needs.
          <span class="cyan-underline">We build them around yours.</span>
        </h2>
      </div>

      <div class="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
        <NuxtLink
          v-for="(p, i) in pillars"
          :key="p.title"
          :to="`/what-we-build/${p.slug}`"
          v-reveal:scale="i * 110"
          class="group relative block rounded-2xl border border-line bg-white p-8 md:p-9 transition hover:border-cyan-brand/50 hover:shadow-[0_24px_60px_-32px_rgba(1,219,241,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <div class="flex items-start justify-between gap-6">
            <div
              class="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
            >
              <component :is="p.icon" :size="22" />
            </div>
            <ArrowRight
              :size="18"
              class="mt-2 text-mute-2 transition group-hover:translate-x-0.5 group-hover:text-ink"
            />
          </div>
          <h3 class="mt-7 font-display text-[30px] leading-[1.1] text-ink">{{ p.title }}</h3>
          <p class="mt-3 text-[16px] font-medium text-ink/85 leading-[1.5]">{{ p.lede }}</p>
          <p class="mt-4 text-[16px] lg:text-[15.5px] leading-[1.7] text-mute">{{ p.body }}</p>
          <span class="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
            Explore {{ p.title }}
            <ArrowRight :size="15" class="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
