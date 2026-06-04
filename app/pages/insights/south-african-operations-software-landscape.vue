<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@lucide/vue'
import { LANDSCAPE_CATEGORIES, BUILD_VS_BUY } from '~/data/landscape'
import { systemBySlug } from '~/data/systems'
import { NAP } from '~/data/nap'

const PATH = '/insights/south-african-operations-software-landscape'

// Per-page SEO (S02 standard): bare title + canonical + OG/Twitter + primary
// intent (this linkbait asset owns "operations software south africa").
usePageSeo({
  title: 'The South African Operations-Software Landscape',
  description:
    'A reference map of how South African businesses run their operations: the categories of operational software, what each does, and where bespoke fits.',
  path: PATH,
  ogType: 'article',
  primaryKeyword: 'operations software south africa',
})

// SCHEMA SLOT (S08): emit `Article` (author = Organization, about = the categories
// as an ItemList, isAccessibleForFree true) + breadcrumb. See
// localbusiness-schema-fields.md. This page is the digital-PR / citation asset.

function systemsFor(slugs: string[]) {
  return slugs.map((s) => systemBySlug(s)).filter(Boolean)
}
const citation = `Zabble (2026). The South African Operations-Software Landscape. ${NAP.url}${PATH}`
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <!-- Breadcrumb -->
      <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
          <NuxtLink
            to="/insights"
            class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors rounded"
          >
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            Insights
          </NuxtLink>
        </nav>
      </div>

      <!-- Hero -->
      <article class="mx-auto max-w-3xl px-5 md:px-8 lg:px-12">
        <header v-reveal>
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Reference · Free to cite
          </div>
          <h1 class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.06] tracking-tight text-ink">
            The South African Operations-Software Landscape
          </h1>
          <p data-answer-first class="mt-6 text-[16px] md:text-[19px] leading-[1.65] text-mute">
            A plain map of how South African businesses run their operations: the categories of operational
            software, what each one does, and the point where off-the-shelf tools stop and bespoke earns its
            keep. Built as a reference — quote it, link it, use it.
          </p>
        </header>

        <!-- TOC -->
        <nav v-reveal aria-label="Contents" class="mt-10 rounded-2xl border border-line bg-surface-alt/50 p-5 md:p-6">
          <p class="text-[11.5px] uppercase tracking-[0.2em] text-mute-2 font-semibold">On this page</p>
          <ol class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[14.5px]">
            <li v-for="(c, i) in LANDSCAPE_CATEGORIES" :key="c.id">
              <a :href="`#${c.id}`" class="text-ink hover:text-cyan-brand-deep transition-colors">
                <span class="tabular-nums text-mute-2 mr-1.5">{{ String(i + 1).padStart(2, '0') }}</span>{{ c.name }}
              </a>
            </li>
            <li>
              <a href="#build-vs-buy" class="text-ink hover:text-cyan-brand-deep transition-colors">
                <span class="tabular-nums text-mute-2 mr-1.5">{{ String(LANDSCAPE_CATEGORIES.length + 1).padStart(2, '0') }}</span>Build vs buy
              </a>
            </li>
          </ol>
        </nav>

        <!-- Categories -->
        <section
          v-for="(c, i) in LANDSCAPE_CATEGORIES"
          :id="c.id"
          :key="c.id"
          class="mt-12 md:mt-16 scroll-mt-28"
        >
          <div v-reveal>
            <h2 class="font-display text-[26px] sm:text-[30px] md:text-[34px] leading-[1.15] tracking-tight text-ink">
              <span class="tabular-nums text-cyan-brand-deep mr-2 text-[20px]">{{ String(i + 1).padStart(2, '0') }}</span>
              {{ c.name }}
            </h2>
            <p class="mt-4 text-[15.5px] md:text-[16px] leading-[1.68] text-ink">{{ c.whatItIs }}</p>

            <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-xl border border-line bg-white p-4">
                <p class="text-[11px] uppercase tracking-[0.2em] text-mute-2 font-semibold">Off-the-shelf</p>
                <p class="mt-1.5 text-[14px] leading-[1.55] text-mute">{{ c.offTheShelf }}</p>
              </div>
              <div class="rounded-xl border border-cyan-brand/25 bg-white p-4">
                <p class="text-[11px] uppercase tracking-[0.2em] text-cyan-brand-deep font-semibold">Where bespoke fits</p>
                <p class="mt-1.5 text-[14px] leading-[1.55] text-ink">{{ c.whereBespokeFits }}</p>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span class="text-[12.5px] text-mute-2 font-medium mr-1">Zabble systems:</span>
              <NuxtLink
                v-for="s in systemsFor(c.systemSlugs)"
                :key="s!.slug"
                :to="`/systems/${s!.slug}`"
                class="inline-flex items-center gap-1 rounded-full border border-line hover:border-cyan-brand/40 bg-white px-3 py-1 text-[12.5px] font-medium text-ink transition-colors"
              >
                {{ s!.name }}
              </NuxtLink>
            </div>
          </div>
        </section>

        <!-- Build vs buy -->
        <section id="build-vs-buy" class="mt-14 md:mt-20 scroll-mt-28">
          <div v-reveal>
            <h2 class="font-display text-[26px] sm:text-[30px] md:text-[34px] leading-[1.15] tracking-tight text-ink">
              Build vs buy: five questions
            </h2>
            <p class="mt-4 text-[15.5px] leading-[1.68] text-ink">
              Most operational software should be bought. Bespoke earns its keep in specific places. These are
              the questions we ask before recommending a build.
            </p>
            <dl class="mt-6 space-y-4">
              <div v-for="(h, i) in BUILD_VS_BUY" :key="i" class="rounded-2xl border border-line bg-white p-5 md:p-6">
                <dt class="font-display text-[19px] md:text-[20px] leading-[1.25] text-ink">{{ h.q }}</dt>
                <dd class="mt-2 text-[14.5px] leading-[1.6] text-mute">{{ h.a }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <!-- Cite this -->
        <section class="mt-14 md:mt-16">
          <div v-reveal class="rounded-2xl border border-line bg-surface-alt/60 p-5 md:p-6">
            <p class="text-[11.5px] uppercase tracking-[0.2em] text-mute-2 font-semibold">Cite this reference</p>
            <p class="mt-2 font-mono text-[13px] leading-[1.55] text-ink break-words">{{ citation }}</p>
            <p class="mt-3 text-[13.5px] leading-[1.55] text-mute">
              Republishing a section? A link back to this page is all we ask. For data requests or commentary,
              reach us at <a :href="`mailto:${NAP.email}`" class="text-ink underline underline-offset-4">{{ NAP.email }}</a>.
            </p>
          </div>
        </section>

        <!-- Next -->
        <section class="mt-12">
          <div v-reveal class="flex flex-col sm:flex-row gap-3">
            <NuxtLink
              to="/industries"
              class="group inline-flex items-center justify-center gap-2 rounded-lg border border-line hover:border-ink/30 bg-white hover:bg-surface-alt text-ink text-[15px] font-medium px-5 py-3.5 transition-colors"
            >
              See it by industry
              <ArrowRight :size="15" class="text-mute group-hover:text-ink" />
            </NuxtLink>
            <NuxtLink
              to="/diagnose"
              class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[15px] font-semibold px-5 py-3.5 transition-colors"
            >
              Find your most expensive problem
              <ArrowRight :size="16" class="transition-transform duration-200 group-hover:translate-x-0.5" />
            </NuxtLink>
          </div>
        </section>
      </article>
    </main>

    <TheFooter />
  </div>
</template>
