<script setup lang="ts">
import { INSIGHTS } from '~/data/insights'

usePageSeo({
  title: 'Insights — Bespoke Systems & Automation',
  description:
    'Plain-English answers on bespoke systems, automation, POPIA, CRM and reconciliation — from Zabble, the South African firm that builds the systems behind them.',
  path: '/insights',
  ogType: 'website',
  primaryKeyword: 'business automation insights south africa',
})
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <section class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <div v-reveal class="max-w-3xl">
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Insights
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[64px] leading-[1.04] tracking-tight text-ink">
            Plain answers to the questions buyers actually ask.
          </h1>
          <p data-answer-first class="mt-6 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] text-ink">
            Short, plain-English explainers on the systems we build and the decisions behind them — what POPIA actually requires, what CRM software does, how to automate reconciliation, and when custom software beats off-the-shelf. Each one links to the system that puts the answer to work.
          </p>
        </div>

        <div class="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <NuxtLink
            v-for="(post, i) in INSIGHTS"
            :key="post.slug"
            v-reveal:scale="i * 60"
            :to="`/insights/${post.slug}`"
            class="group flex flex-col rounded-2xl border border-line bg-white p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-brand/40 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          >
            <h2 class="font-display text-[20px] md:text-[23px] leading-[1.2] text-ink">{{ post.title }}</h2>
            <p class="mt-3 text-[14.5px] md:text-[15px] leading-[1.6] text-mute flex-1">{{ post.seoDescription }}</p>
            <span class="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
              Read the answer
              <span class="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </NuxtLink>
        </div>
      </section>

      <CtaStrip eyebrow="Next Step" heading="Have a question we haven’t answered?" />
    </main>

    <TheFooter />
  </div>
</template>
