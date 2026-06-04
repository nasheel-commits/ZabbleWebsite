<script setup lang="ts">
import { computed } from 'vue'

import { clusterArticleBySlug } from '~/data/articles'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const article = computed(() => clusterArticleBySlug(slug.value))

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const art = computed(() => article.value!)
useArticleHead(art.value)
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />
    <main class="pt-24 md:pt-28 lg:pt-32 pb-4">
      <ArticleView :article="art" :back-to="{ label: 'All insights', href: '/blog' }" />
    </main>
    <CtaStrip
      :eyebrow="'Next step'"
      heading="Want one built for your business?"
      :body="art.cta.text"
    />
    <TheFooter />
  </div>
</template>
