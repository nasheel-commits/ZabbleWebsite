<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@lucide/vue'

import { pillarArticle, thesisArticle, SITE_URL } from '~/data/articles'
import { PILLARS, SYSTEMS, pillarBySlug } from '~/data/systems'
import type { PillarSlug } from '~/data/systems'

const route = useRoute()
const param = computed(() => String(route.params.pillar ?? ''))

const isThesis = computed(() => param.value === 'bespoke-systems')
const pillarMeta = computed(() => pillarBySlug(param.value as PillarSlug))

// Valid routes: the four pillar slugs + the thesis hub slug.
if (!isThesis.value && !pillarMeta.value) {
  throw createError({ statusCode: 404, statusMessage: 'Pillar not found', fatal: true })
}

const article = computed(() =>
  isThesis.value ? thesisArticle() : pillarArticle(param.value as PillarSlug),
)

// Module money pages this hub distributes to (the "down" spokes).
const modules = computed(() => {
  if (isThesis.value) return SYSTEMS.slice(0, 8)
  return SYSTEMS.filter((s) => s.pillars.includes(param.value as PillarSlug))
})

const heading = computed(() =>
  isThesis.value ? 'Bespoke business systems' : (pillarMeta.value?.label ?? ''),
)

// Head: prefer the article's; otherwise a sensible hub default (still SSR'd).
if (article.value) {
  useArticleHead(article.value)
} else {
  useHead({
    title: `${heading.value} · What We Build · Zabble`,
    link: [{ rel: 'canonical', href: `${SITE_URL}/what-we-build/${param.value}` }],
    meta: [
      {
        name: 'description',
        content: `${heading.value}: how Zabble builds bespoke ${heading.value.toLowerCase()} systems for South African businesses — shaped to the problem costing you the most.`,
      },
    ],
  })
}
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />
    <main class="pt-24 md:pt-28 lg:pt-32 pb-4">
      <!-- Full article when written -->
      <ArticleView
        v-if="article"
        :article="article"
        :back-to="{ label: 'What we build', href: '/what-we-build' }"
      />

      <!-- Hub shell (renders even before the pillar guide is written) -->
      <div v-else class="mx-auto max-w-3xl px-5 md:px-8">
        <nav aria-label="Breadcrumb" class="mb-8">
          <NuxtLink to="/what-we-build" class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors">
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            What we build
          </NuxtLink>
        </nav>
        <h1 class="font-display text-[34px] md:text-[44px] leading-[1.08] tracking-tight text-ink">{{ heading }}</h1>
        <p class="mt-4 text-[17px] leading-[1.6] text-mute">
          The systems below deliver on this pillar. Each is built bespoke to the business that runs it.
        </p>
      </div>

      <!-- Module spokes: present on every hub render -->
      <section v-if="modules.length" class="mx-auto max-w-3xl px-5 md:px-8 mt-12 pt-10 border-t border-line">
        <h2 class="font-display text-[24px] md:text-[28px] leading-tight text-ink">Systems in this pillar</h2>
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-for="m in modules"
            :key="m.slug"
            :to="`/systems/${m.slug}`"
            class="group rounded-xl border border-line bg-white p-4 transition hover:border-cyan-brand/50"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="font-display text-[18px] leading-tight text-ink">{{ m.name }}</span>
              <ArrowRight :size="16" class="text-mute-2 transition group-hover:translate-x-0.5 group-hover:text-ink shrink-0" />
            </div>
            <p class="mt-1.5 text-[13.5px] leading-[1.5] text-mute line-clamp-2">{{ m.tagline }}</p>
          </NuxtLink>
        </div>
      </section>
    </main>
    <CtaStrip eyebrow="Next step" heading="Want one built for your business?" />
    <TheFooter />
  </div>
</template>
