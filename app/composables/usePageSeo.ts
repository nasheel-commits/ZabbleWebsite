// usePageSeo — centralised per-page SEO wiring (owned by S02, On-Page & Metadata).
//
// One call per page sets a unique, server-rendered: <title> (via the global
// `%s · Zabble` titleTemplate in nuxt.config), meta description, canonical link,
// and Open Graph + Twitter cards. Keeping it here means the 30+ system pages and
// the static pages stay consistent and DRY, and there is a single place to swap
// in the Nuxt SEO suite once S01 installs it.
//
// COORDINATION (see docs/seo/00-conventions.md §2 + audits/05-onpage.md):
//   - S01 owns nuxt.config SEO-module wiring + `site.url`. Until that lands, the
//     canonical/OG absolute URLs are derived from SITE_ORIGIN below. When
//     `@nuxtjs/seo` is installed and `site.url` is set, replace SITE_ORIGIN with
//     useSiteConfig().url and the module will own canonical resolution — this
//     composable can then drop the manual `link: [{ rel: 'canonical' }]`.
//   - S01 also owns the pre-launch `noindex` guard (staging). This composable does
//     NOT set robots; indexability is decided globally by S01's env-conditioned
//     robots config so we never accidentally index staging.
//   - DEFAULT_OG_IMAGE points at an asset that must be generated (nuxt-og-image,
//     S09) or dropped into /public. Cross-session ask logged in status.md.

import { useRoute } from '#imports'

/** Production origin. Single source of truth for absolute URLs until S01 sets site.url. */
export const SITE_ORIGIN = 'https://zabble.org'
export const SITE_NAME = 'Zabble'
/** Social share image. TODO(S09/og-image): generate per-page; placeholder asset for now. */
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-default.png`

/** Resolve a site-relative path (or pass-through absolute URL) to an absolute URL. */
export function absoluteUrl(path?: string): string {
  if (!path) return SITE_ORIGIN
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

export interface PageSeoInput {
  /** Distinct, intent-bearing part of the title. The global titleTemplate appends ` · Zabble`. */
  title: string
  /** Meta description — aim 150–160 chars, answer-first, one clear CTA-bearing benefit. */
  description: string
  /**
   * Canonical path, e.g. '/systems/bespoke-crm'. Defaults to the current route
   * path WITHOUT query — so filtered variants like /systems?pillar=automation
   * canonicalise to /systems and never cannibalise it.
   */
  path?: string
  /** og:type — 'website' for hubs/home, 'article' for a specific system/answer page. */
  ogType?: 'website' | 'article'
  /** Absolute or site-relative social image. Falls back to DEFAULT_OG_IMAGE. */
  image?: string
  /**
   * The single primary keyword/intent this page owns. Emitted as a
   * `<meta name="zabble:primary-kw">` so the metadata regression test can assert
   * **no two pages share a primary intent** (the cannibalisation guard) straight
   * from the prerendered HTML. Sourced from targets/keyword-map.md (S03). Omit on
   * pure index/utility pages that don't own a commercial head term.
   */
  primaryKeyword?: string
}

/**
 * Wire a page's SEO meta. Pass a plain object for static pages, or a getter
 * function for dynamic routes (e.g. /systems/[slug]) so the tags stay reactive
 * to the resolved data.
 */
export function usePageSeo(input: PageSeoInput | (() => PageSeoInput)): void {
  const route = useRoute()
  const get = typeof input === 'function' ? input : () => input

  const canonical = () => absoluteUrl(get().path ?? route.path)
  const ogTitle = () => `${get().title} · ${SITE_NAME}`
  const image = () => absoluteUrl(get().image ?? DEFAULT_OG_IMAGE)

  useSeoMeta({
    title: () => get().title,
    description: () => get().description,
    ogTitle,
    ogDescription: () => get().description,
    ogType: () => get().ogType ?? 'website',
    ogUrl: canonical,
    ogSiteName: SITE_NAME,
    ogLocale: 'en_ZA',
    ogImage: image,
    twitterCard: 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription: () => get().description,
    twitterImage: image,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      // QA signal for the cannibalisation guard — see PageSeoInput.primaryKeyword.
      // Rendered only when a primary keyword is declared.
      { name: 'zabble:primary-kw', content: () => get().primaryKeyword ?? '' },
    ],
  })
}
