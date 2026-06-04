import type { Article } from '~/data/articles'
import { SITE_URL } from '~/data/articles'

/** Strip a trailing brand suffix ("… | Zabble" / "… · Zabble") so the global
 *  titleTemplate ('%s · Zabble') brands the title exactly once (no double). */
function bareTitle(t: string): string {
  return t.replace(/\s*[|·–-]\s*Zabble\s*$/i, '').trim()
}

/** SERP meta descriptions cap at ~160 chars; trim on a word boundary + ellipsis
 *  so an editorial description that runs long never ships truncated mid-word. */
function clampDescription(d: string, max = 160): string {
  if (d.length <= max) return d
  return d.slice(0, max - 1).replace(/\s+\S*$/, '').trimEnd() + '…'
}

/**
 * Sets title / meta description / canonical / Open Graph + Twitter for an
 * article page. Title is de-branded then re-branded once by the global
 * titleTemplate. Canonical is the absolute production URL so syndicated or
 * query-stringed variants never compete (cannibalisation guard). og:image is
 * handed off to S09 (per-article images); see status.md.
 */
export function useArticleHead(article: Article) {
  const canonical = `${SITE_URL}${article.canonicalPath}`
  const title = bareTitle(article.metaTitle)
  const description = clampDescription(article.metaDescription)

  useHead({
    title,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { name: 'description', content: description },
      { property: 'og:type', content: article.kind === 'cluster' ? 'article' : 'website' },
      // og:title carries the fully-branded title (matches what the browser tab
      // shows once titleTemplate has applied).
      { property: 'og:title', content: `${title} · Zabble` },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:site_name', content: 'Zabble' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${title} · Zabble` },
      { name: 'twitter:description', content: description },
    ],
  })
}
