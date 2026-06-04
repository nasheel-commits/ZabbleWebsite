<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, ArrowLeft } from '@lucide/vue'

import { CLUSTER_ARTICLES, MARKET_LABEL, SITE_URL } from '~/data/articles'

const posts = computed(() =>
  [...CLUSTER_ARTICLES].sort((a, b) => (a.publishedISO < b.publishedISO ? 1 : -1)),
)

useHead({
  title: 'Insights · Zabble',
  link: [{ rel: 'canonical', href: `${SITE_URL}/blog` }],
  meta: [
    {
      name: 'description',
      content:
        'Practical, South-Africa-first guides on automation, audit trails, anomaly detection and analytics — how to fix the operational problem costing your business the most.',
    },
    { property: 'og:title', content: 'Insights · Zabble' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `${SITE_URL}/blog` },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />
    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-24">
      <div class="mx-auto max-w-5xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8">
          <NuxtLink to="/#home" class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors">
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            Home
          </NuxtLink>
        </nav>

        <header class="max-w-2xl">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Insights
          </div>
          <h1 class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[54px] leading-[1.07] tracking-tight text-ink">
            How to fix the problem <span class="cyan-underline">costing you the most</span>.
          </h1>
          <p class="mt-5 text-[16.5px] md:text-[17px] leading-[1.6] text-mute">
            Practical guides for South African operators — written around real problems, not products.
            Start with <NuxtLink to="/what-we-build" class="text-cyan-brand-deep underline decoration-cyan-brand/40 underline-offset-2 hover:decoration-cyan-brand">what we build</NuxtLink>,
            or dig into a use case below.
          </p>
        </header>

        <ul class="mt-12 grid gap-5 sm:grid-cols-2">
          <li v-for="p in posts" :key="p.slug">
            <NuxtLink
              :to="p.canonicalPath"
              class="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-cyan-brand/50 hover:shadow-[0_24px_60px_-32px_rgba(1,219,241,0.5)]"
            >
              <div class="flex items-center gap-x-3 text-[11px] uppercase tracking-[0.16em] font-semibold text-mute-2">
                <span class="text-cyan-brand-deep">{{ p.cluster.replace(/-/g, ' ') }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ MARKET_LABEL[p.market] }}</span>
              </div>
              <h2 class="mt-3 font-display text-[22px] leading-[1.15] text-ink">{{ p.title }}</h2>
              <p class="mt-2.5 flex-1 text-[14.5px] leading-[1.55] text-mute line-clamp-3">{{ p.dek }}</p>
              <span class="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                Read
                <ArrowRight :size="15" class="text-cyan-brand-deep transition group-hover:translate-x-0.5" />
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </main>
    <TheFooter />
  </div>
</template>
