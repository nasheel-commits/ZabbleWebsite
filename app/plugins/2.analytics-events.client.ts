/**
 * Zabble, automatic key-event instrumentation (B2B lead-gen).
 *
 * Zero-config capture so we don't have to touch all 30 system/demo components:
 *  - email_click       → any  mailto:  link
 *  - phone_call_click  → any  tel:     link
 *  - file_download     → links with a download attr or a file extension
 *  - schedule_click    → links/buttons that lead to /diagnose (book-a-call intent)
 *  - 90% scroll        → fired once per money page (/, /systems, /systems/*)
 *  - page_view         → on every SPA route change (history-based, GA4 SPA)
 *
 * generate_lead (the primary conversion) is fired explicitly from the diagnose
 * flow, it has no DOM anchor to delegate from.
 *
 * Any element can override inference with data-analytics-event="<name>" plus
 * optional data-analytics-* params (e.g. data-analytics-value="0").
 *
 * Events are pushed to the dataLayer via the core API. Before consent no tag is
 * loaded, so nothing is sent to the network, the dataLayer simply buffers.
 */
import { defineNuxtPlugin, useRouter } from '#app'
import type { ZabbleAnalytics } from './1.analytics.client'

const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|csv|zip|rar|7z|txt|rtf|dmg|pkg|exe|key|json|xml)$/i

function isMoneyPage(path: string): boolean {
  return path === '/' || path === '/systems' || path.startsWith('/systems/')
}

/** Collect data-analytics-* attributes into a params object. */
function datasetParams(el: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key in el.dataset) {
    if (key.startsWith('analytics') && key !== 'analyticsEvent') {
      // analyticsValue → value, analyticsLeadSource → lead_source
      const name = key
        .replace(/^analytics/, '')
        .replace(/^[A-Z]/, (c) => c.toLowerCase())
        .replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
      out[name] = el.dataset[key]!
    }
  }
  return out
}

export default defineNuxtPlugin((nuxtApp) => {
  const api = nuxtApp.$zabbleAnalytics as ZabbleAnalytics | undefined
  if (!api) return

  const router = useRouter()

  // ── Click delegation ───────────────────────────────────────────────────────
  function onClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null
    if (!target) return

    // Explicit override wins, on the nearest opted-in element.
    const tagged = target.closest<HTMLElement>('[data-analytics-event]')
    if (tagged) {
      api!.trackEvent(tagged.dataset.analyticsEvent!, datasetParams(tagged))
      return
    }

    const anchor = target.closest<HTMLAnchorElement>('a[href]')
    if (!anchor) return
    const href = anchor.getAttribute('href') || ''
    const text = (anchor.textContent || '').trim().slice(0, 120)

    if (href.startsWith('mailto:')) {
      const email = href.slice(7).split('?')[0]
      api!.trackEvent('email_click', { link_url: href, email_address: email })
      return
    }
    if (href.startsWith('tel:')) {
      api!.trackEvent('phone_call_click', { link_url: href, phone_number: href.slice(4) })
      return
    }

    // Resolve to a URL for extension / path checks (handles relative hrefs).
    let url: URL | null = null
    try {
      url = new URL(anchor.href, window.location.origin)
    } catch {
      url = null
    }

    if (anchor.hasAttribute('download') || (url && FILE_EXT.test(url.pathname))) {
      const file = url ? url.pathname.split('/').pop() || url.pathname : href
      const ext = file.includes('.') ? file.split('.').pop()!.toLowerCase() : ''
      api!.trackEvent('file_download', {
        link_url: anchor.href,
        file_name: file,
        file_extension: ext,
        link_text: text,
      })
      return
    }

    if ((url && url.pathname.startsWith('/diagnose')) || href.includes('/diagnose')) {
      api!.trackEvent('schedule_click', { link_url: anchor.href, link_text: text })
    }
  }

  document.addEventListener('click', onClick, { capture: true, passive: true })

  // ── 90% scroll on money pages (once per page) ──────────────────────────────
  let scrolled90 = false
  let ticking = false

  function checkScroll() {
    ticking = false
    if (scrolled90) return
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    if (max <= 0) return
    const pct = (window.scrollY || doc.scrollTop) / max
    if (pct >= 0.9) {
      scrolled90 = true
      api!.trackEvent('scroll', {
        percent_scrolled: 90,
        page_path: router.currentRoute.value.fullPath,
      })
    }
  }

  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(checkScroll)
  }

  function bindScrollForRoute(path: string) {
    window.removeEventListener('scroll', onScroll)
    scrolled90 = false
    if (isMoneyPage(path)) {
      window.addEventListener('scroll', onScroll, { passive: true })
    }
  }

  // ── SPA page_view + per-route scroll binding ───────────────────────────────
  router.afterEach((to) => {
    api!.trackEvent('page_view', {
      page_path: to.fullPath,
      page_location: window.location.origin + to.fullPath,
      page_title: typeof document !== 'undefined' ? document.title : '',
    })
    bindScrollForRoute(to.path)
  })

  // Initial page (afterEach doesn't fire for the first render).
  nuxtApp.hook('app:mounted', () => {
    bindScrollForRoute(router.currentRoute.value.path)
  })
})
