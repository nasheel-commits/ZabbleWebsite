import { CLUSTER_ARTICLES, SITE_URL } from '~/data/articles'

function xml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler((event) => {
  const items = [...CLUSTER_ARTICLES]
    .sort((a, b) => (a.publishedISO < b.publishedISO ? 1 : -1))
    .map((a) => {
      const url = `${SITE_URL}${a.canonicalPath}`
      const pub = new Date(a.publishedISO).toUTCString()
      return `    <item>
      <title>${xml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pub}</pubDate>
      <description>${xml(a.metaDescription)}</description>
    </item>`
    })
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Zabble · Insights</title>
    <link>${SITE_URL}/blog</link>
    <description>Practical, South-Africa-first guides on automation, audit trails, anomaly detection and analytics.</description>
    <language>en-za</language>
${items}
  </channel>
</rss>`

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return body
})
