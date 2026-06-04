/**
 * Zabble, search-engine site verification (S09 indexing).
 *
 * UNIVERSAL plugin (no .client/.server suffix) so the meta tags render into the
 * prerendered SSR HTML, which is what Google Search Console and Bing Webmaster
 * Tools read for the "HTML tag" verification method.
 *
 * DNS TXT is the preferred verification (covers the whole Domain property and
 * works pre-launch); these meta tags are the in-code fallback / belt-and-braces.
 * Values come from env only:
 *   NUXT_PUBLIC_VERIFICATION_GOOGLE → <meta name="google-site-verification">
 *   NUXT_PUBLIC_VERIFICATION_BING   → <meta name="msvalidate.01">
 * Empty ⇒ no tag rendered (correct pre-launch state). Not secrets.
 */
import { defineNuxtPlugin, useRuntimeConfig, useHead } from '#app'

export default defineNuxtPlugin(() => {
  const v = useRuntimeConfig().public.verification as
    | { google?: string; bing?: string }
    | undefined

  const meta: { name: string; content: string }[] = []
  if (v?.google) meta.push({ name: 'google-site-verification', content: v.google })
  if (v?.bing) meta.push({ name: 'msvalidate.01', content: v.bing })

  if (meta.length) useHead({ meta })
})
