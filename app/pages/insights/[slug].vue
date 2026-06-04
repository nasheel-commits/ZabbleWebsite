<script setup lang="ts">
import { computed } from 'vue'
import { insightBySlug } from '~/data/insights'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const insight = computed(() => insightBySlug(slug.value))

if (!insight.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const post = computed(() => insight.value!)

usePageSeo(() => ({
  title: post.value.seoTitle,
  description: post.value.seoDescription,
  path: `/insights/${post.value.slug}`,
  ogType: 'article',
  primaryKeyword: post.value.keywords[0],
}))
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <!-- Breadcrumb -->
      <div class="mx-auto max-w-3xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8 md:mb-10 text-[13.5px] font-medium text-mute">
          <NuxtLink to="/insights" class="hover:text-ink transition-colors">Insights</NuxtLink>
          <span class="mx-2 text-mute-2">/</span>
          <span class="text-ink">{{ post.title }}</span>
        </nav>
      </div>

      <article class="mx-auto max-w-3xl px-5 md:px-8 lg:px-12">
        <header v-reveal>
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Insight
          </div>
          <h1 class="mt-5 font-display text-[34px] sm:text-[42px] md:text-[48px] leading-[1.08] tracking-tight text-ink">
            {{ post.title }}
          </h1>
        </header>

        <!-- Answer-first: the extractable answer, before anything else -->
        <p
          data-answer-first
          class="mt-7 text-[17px] md:text-[19px] leading-[1.6] text-ink font-medium border-l-2 border-cyan-brand pl-5"
        >
          {{ post.answerFirst }}
        </p>

        <!-- Heading structure (body copy by S10) -->
        <div class="mt-10 space-y-8">
          <section v-for="(sec, i) in post.sections" :key="i">
            <h2 class="font-display text-[24px] md:text-[28px] leading-[1.2] tracking-tight text-ink">
              {{ sec.h2 }}
            </h2>
            <p v-if="sec.body" class="mt-3 text-[15.5px] md:text-[16.5px] leading-[1.7] text-mute">
              {{ sec.body }}
            </p>
          </section>
        </div>

        <!-- Internal link to the money page this explainer supports -->
        <div class="mt-12 rounded-2xl border border-line bg-white px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p class="text-[15px] text-ink font-medium">Put this to work in your business.</p>
          <NuxtLink
            :to="post.relatedHref"
            class="group inline-flex items-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[14px] font-semibold px-4 py-2.5 transition-colors shrink-0"
          >
            {{ post.relatedLabel }}
            <span class="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </NuxtLink>
        </div>
      </article>

      <CtaStrip eyebrow="Next Step" heading="Want one built for your business?" />
    </main>

    <TheFooter />
  </div>
</template>
