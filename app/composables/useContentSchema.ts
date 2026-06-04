// Reusable structured-data patterns (S03, Structured Data / Schema.org),
// driven by page data. These are the ready-to-wire builders for content types
// the site does not carry YET:
//
//   • useFaqSchema    , FAQPage, for when S06/S07 add a visible Q&A block.
//   • useArticleSchema, Article/BlogPosting, for when a blog ships (S06).
//
// They are intentionally NOT called anywhere today: there is no on-page FAQ or
// article/blog content to mark up, and JSON-LD must match visible content (no
// markup-only claims). Wire them from a page's <script setup> the moment the
// matching, signed-off copy exists on that page. See docs/seo/audits/08-schema.md
// (§FAQPage/QAPage and §Article/BlogPosting) and the cross-session asks to S06/S07.
//
// nuxt-schema-org auto-imports `useSchemaOrg` / `define*`; Vue auto-imports
// `toValue` / `MaybeRefOrGetter`, no explicit imports needed in Nuxt app code.

export interface FaqItem {
  /** The question exactly as it appears on the page. */
  question: string
  /** The answer exactly as it appears on the page. */
  answer: string
}

/**
 * Emit an FAQPage built from a page's visible Q&A block. Each item becomes a
 * Question with an acceptedAnswer; the WebPage is typed FAQPage and the
 * questions attach to it as mainEntity. Pass ONLY questions that are visibly
 * present on the page (1:1 with the rendered copy).
 */
export function useFaqSchema(faqs: MaybeRefOrGetter<FaqItem[]>) {
  const items = toValue(faqs)
  if (!items?.length) return
  useSchemaOrg([
    defineWebPage({ '@type': ['WebPage', 'FAQPage'] }),
    ...items.map((f) =>
      defineQuestion({ name: f.question, acceptedAnswer: f.answer }),
    ),
  ])
}

export interface ArticleInput {
  /** Falls back to the page title when omitted. */
  headline?: string
  /** Falls back to the page meta description when omitted. */
  description?: string
  /** Absolute URL of the lead image (≥1200px wide recommended for rich results). */
  image?: string
  /** ISO-8601 publish date, e.g. '2026-07-01'. Required for rich results. */
  datePublished: string
  /** ISO-8601 last-modified date; defaults to datePublished. */
  dateModified?: string
  /** Author display name (a real person or 'Zabble'). */
  authorName: string
  /** Optional author profile URL. */
  authorUrl?: string
}

/**
 * Emit an Article node for a blog/editorial page, with author + publish/modify
 * dates and publisher → the Zabble Organization (@id interlink). Switch the
 * WebPage/Article '@type' to BlogPosting if the page is a blog post proper.
 */
export function useArticleSchema(input: ArticleInput) {
  useSchemaOrg([
    defineWebPage({ '@type': ['WebPage', 'Article'] }),
    defineArticle({
      headline: input.headline,
      description: input.description,
      image: input.image,
      datePublished: input.datePublished,
      dateModified: input.dateModified ?? input.datePublished,
      author: definePerson({ name: input.authorName, url: input.authorUrl }),
      publisher: { '@id': 'https://zabble.org/#identity' },
    }),
  ])
}
