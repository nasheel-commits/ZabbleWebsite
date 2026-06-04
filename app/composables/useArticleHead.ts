import type { Article } from '~/data/articles'
import { SITE_URL } from '~/data/articles'

/**
 * Sets title / meta description / canonical / Open Graph for an article page.
 * Canonical is the absolute production URL so syndicated or query-stringed
 * variants never compete (cannibalisation guard). og:image is intentionally
 * omitted here — generating per-article OG images is handed off to S09
 * (performance/assets); see status.md.
 */
export function useArticleHead(article: Article) {
  const canonical = `${SITE_URL}${article.canonicalPath}`

  useHead({
    title: article.metaTitle,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { name: 'description', content: article.metaDescription },
      { property: 'og:type', content: article.kind === 'cluster' ? 'article' : 'website' },
      { property: 'og:title', content: article.metaTitle },
      { property: 'og:description', content: article.metaDescription },
      { property: 'og:url', content: canonical },
      { property: 'og:site_name', content: 'Zabble' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: article.metaTitle },
      { name: 'twitter:description', content: article.metaDescription },
    ],
  })
}
