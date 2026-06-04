<script setup lang="ts">
// Cornerstone thesis hub — "Why bespoke beats off-the-shelf" (S10 content).
// A dedicated static route so it coexists with the four pillar hubs served by
// what-we-build/[pillar].vue (S04): a static page always wins over the dynamic
// segment, so /what-we-build/bespoke-systems renders this thesis while
// /what-we-build/<pillar> stays the structural pillar hub. Many articles link
// here with rel="up" (articles.ts), so it must resolve 200.
import { thesisArticle } from '~/data/articles'

const article = thesisArticle()
if (!article) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

useArticleHead(article)
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />
    <main class="pt-24 md:pt-28 lg:pt-32 pb-4">
      <ArticleView :article="article" :back-to="{ label: 'What we build', href: '/what-we-build' }" />
    </main>
    <CtaStrip
      eyebrow="Next step"
      heading="Want one built for your business?"
      :body="article.cta.text"
    />
    <TheFooter />
  </div>
</template>
