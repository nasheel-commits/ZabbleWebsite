<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight, ArrowUpRight } from '@lucide/vue'

import type { Article } from '~/data/articles'
import { MARKET_LABEL, articleBySlug } from '~/data/articles'
import { systemBySlug } from '~/data/systems'

const props = defineProps<{
  article: Article
  /** Breadcrumb: label + path of the parent listing. */
  backTo: { label: string; href: string }
}>()

const a = computed(() => props.article)

const relatedArticleLinks = computed(() =>
  a.value.relatedArticles
    .map((slug) => articleBySlug(slug))
    .filter((x): x is Article => Boolean(x))
    .map((x) => ({ href: x.canonicalPath, title: x.title })),
)

const relatedModuleLinks = computed(() =>
  a.value.relatedModules
    .map((slug) => systemBySlug(slug))
    .filter((x): x is NonNullable<ReturnType<typeof systemBySlug>> => Boolean(x))
    .map((x) => ({ href: `/systems/${x.slug}`, name: x.name, tagline: x.tagline })),
)

const dateLabel = computed(() =>
  new Date(a.value.publishedISO).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)
</script>

<template>
  <article class="mx-auto max-w-3xl px-5 md:px-8">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
      <NuxtLink
        :to="backTo.href"
        class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors"
      >
        <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
        {{ backTo.label }}
      </NuxtLink>
    </nav>

    <!-- Eyebrow -->
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] uppercase tracking-[0.18em] font-semibold">
      <span class="inline-flex items-center gap-2 text-cyan-brand-deep">
        <span class="dot" />
        {{ a.cluster.replace(/-/g, ' ') }}
      </span>
      <span class="text-mute-2">{{ MARKET_LABEL[a.market] }}</span>
      <span class="text-mute-2">{{ a.readMinutes }} min read</span>
    </div>

    <!-- Title + dek -->
    <h1 class="mt-5 font-display text-[32px] sm:text-[40px] md:text-[48px] leading-[1.08] tracking-tight text-ink">
      {{ a.title }}
    </h1>
    <p class="mt-4 text-[17px] md:text-[18px] leading-[1.6] text-mute">{{ a.dek }}</p>
    <p class="mt-4 text-[13px] text-mute-2">
      <time :datetime="a.publishedISO">{{ dateLabel }}</time>
    </p>

    <!-- Answer-first lead (AEO) -->
    <div
      class="mt-8 rounded-2xl border border-cyan-brand/30 bg-cyan-brand/[0.04] p-5 md:p-6"
      data-answer-first
    >
      <div class="text-[11px] uppercase tracking-[0.2em] text-cyan-brand-deep font-semibold">
        In short
      </div>
      <p class="mt-2.5 text-[16.5px] md:text-[17px] leading-[1.6] text-ink font-medium">
        {{ a.answer }}
      </p>
    </div>

    <!-- Body -->
    <div class="article-prose mt-10" v-html="a.bodyHtml" />

    <!-- FAQ (AEO; mirrors FAQPage schema handed to S08) -->
    <section v-if="a.faq.length" class="mt-14 pt-10 border-t border-line" aria-labelledby="faq-heading">
      <h2 id="faq-heading" class="font-display text-[26px] md:text-[30px] leading-tight text-ink">
        Frequently asked questions
      </h2>
      <dl class="mt-6 divide-y divide-line">
        <div v-for="(f, i) in a.faq" :key="i" class="py-5">
          <dt class="text-[16.5px] font-semibold text-ink leading-snug">{{ f.q }}</dt>
          <dd class="mt-2 text-[15.5px] leading-[1.65] text-mute">{{ f.a }}</dd>
        </div>
      </dl>
    </section>

    <!-- Sources (GEO: real, verifiable citations) -->
    <section v-if="a.sources.length" class="mt-12 pt-8 border-t border-line" aria-labelledby="sources-heading">
      <h2 id="sources-heading" class="text-[12px] uppercase tracking-[0.2em] text-cyan-brand-deep font-semibold">
        Sources
      </h2>
      <ol class="mt-4 space-y-3 text-[13.5px] leading-[1.55] text-mute">
        <li v-for="s in a.sources" :id="s.id" :key="s.id" class="scroll-mt-28">
          <span class="text-ink font-medium">{{ s.publisher }}</span> -
          <a
            :href="s.url"
            target="_blank"
            rel="noopener nofollow"
            class="text-cyan-brand-deep underline decoration-cyan-brand/40 underline-offset-2 hover:decoration-cyan-brand break-words"
          >{{ s.title }}</a>
          <span class="text-mute-2"> ({{ s.year }}).</span>
          <span class="block text-mute-2">{{ s.claim }}</span>
        </li>
      </ol>
    </section>

    <!-- Keep reading -->
    <section
      v-if="relatedModuleLinks.length || relatedArticleLinks.length"
      class="mt-14 pt-10 border-t border-line"
      aria-labelledby="related-heading"
    >
      <h2 id="related-heading" class="font-display text-[24px] md:text-[28px] leading-tight text-ink">
        Keep reading
      </h2>

      <div v-if="relatedModuleLinks.length" class="mt-6 grid gap-3 sm:grid-cols-2">
        <NuxtLink
          v-for="m in relatedModuleLinks"
          :key="m.href"
          :to="m.href"
          class="group rounded-xl border border-line bg-white p-4 transition hover:border-cyan-brand/50"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="font-display text-[18px] leading-tight text-ink">{{ m.name }}</span>
            <ArrowRight :size="16" class="text-mute-2 transition group-hover:translate-x-0.5 group-hover:text-ink shrink-0" />
          </div>
          <p class="mt-1.5 text-[13.5px] leading-[1.5] text-mute line-clamp-2">{{ m.tagline }}</p>
        </NuxtLink>
      </div>

      <ul v-if="relatedArticleLinks.length" class="mt-4 space-y-2">
        <li v-for="r in relatedArticleLinks" :key="r.href">
          <NuxtLink
            :to="r.href"
            class="group inline-flex items-start gap-2 text-[15px] font-medium text-ink hover:text-cyan-brand-deep transition-colors"
          >
            <ArrowUpRight :size="16" class="mt-1 text-cyan-brand-deep shrink-0" />
            {{ r.title }}
          </NuxtLink>
        </li>
      </ul>
    </section>
  </article>
</template>
