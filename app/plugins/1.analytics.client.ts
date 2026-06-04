/**
 * Zabble, Analytics core (Consent Mode v2, POPIA opt-in).
 *
 * Session 09 (analytics + indexing). Owns the measurement stack.
 *
 * What this plugin does, in order, on the client only:
 *   1. Bootstraps `window.dataLayer` + the `gtag()` shim.
 *   2. Pushes Consent Mode v2 *defaults* with all four signals DENIED
 *      (ad_storage, ad_user_data, ad_personalization, analytics_storage) plus
 *      the storage signals, region-scoped to ZA *and* globally. This must run
 *      BEFORE any GTM/GA/Clarity tag loads, so Google honours the denied state.
 *   3. POPIA is opt-in: we do NOT load GTM / GA4 / Clarity until the visitor
 *      explicitly grants consent (or a stored grant is found). On grant we push
 *      a `consent` `update` and only then inject the tags.
 *
 * Real IDs are injected via env → runtimeConfig.public.analytics (see
 * nuxt.config.ts + .env.example). When an ID is absent the corresponding tag is
 * simply never loaded, the machinery degrades to a no-op, which is the correct
 * pre-launch state. See docs/seo/measurement-plan.md + id-secret-registry.md.
 */
import { reactive, readonly } from 'vue'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

// ── Types ────────────────────────────────────────────────────────────────────
type ConsentValue = 'granted' | 'denied'

/** The four Consent Mode v2 signals we toggle on opt-in, + storage signals. */
interface ConsentSignals {
  ad_storage: ConsentValue
  ad_user_data: ConsentValue
  ad_personalization: ConsentValue
  analytics_storage: ConsentValue
  functionality_storage: ConsentValue
  personalization_storage: ConsentValue
  security_storage: ConsentValue
}

interface ConsentChoice {
  /** Analytics category → GA4 + Clarity (analytics_storage). */
  analytics: boolean
  /** Marketing category → ad_storage / ad_user_data / ad_personalization. */
  ads: boolean
}

interface AnalyticsState {
  /** true once the visitor has accepted/rejected (banner stops showing). */
  decisionMade: boolean
  /** Whether the preferences dialog is open. */
  settingsOpen: boolean
  /** Current per-category consent. */
  choice: ConsentChoice
}

export interface ZabbleAnalytics {
  state: Readonly<AnalyticsState>
  /** Grant consent for the given categories (default: both). Persists + loads tags. */
  grant: (choice?: Partial<ConsentChoice>) => void
  /** Deny all non-essential consent. Persists; no tags load. */
  deny: () => void
  /** Re-open the preferences dialog (e.g. from a footer "Cookie settings" link). */
  openSettings: () => void
  closeSettings: () => void
  /** Push a GA4 event through the dataLayer (and gtag in direct mode). */
  trackEvent: (name: string, params?: Record<string, unknown>) => void
  /** True when at least one analytics tag is configured (id present). */
  readonly enabled: boolean
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clarity?: (...args: any[]) => void
  }
}

const STORAGE_KEY = 'zabble_consent_v1'

export default defineNuxtPlugin((nuxtApp) => {
  const cfg = useRuntimeConfig().public.analytics as {
    gtmId: string
    ga4Id: string
    clarityId: string
    consentRegions: string[]
    debug: boolean
  }

  const hasGtm = !!cfg.gtmId
  const hasGa4 = !!cfg.ga4Id
  const hasClarity = !!cfg.clarityId
  const enabled = hasGtm || hasGa4 || hasClarity

  const log = (...a: unknown[]) => {
    if (cfg.debug) console.info('[zabble:analytics]', ...a)
  }

  // ── 1. dataLayer + gtag shim ───────────────────────────────────────────────
  window.dataLayer = window.dataLayer || []
  // IMPORTANT: gtag must push the *arguments* object verbatim, Google's consent
  // parser depends on it. Do not refactor to push an array.
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag = window.gtag || (gtag as Window['gtag'])

  // ── 2. Consent Mode v2 defaults, DENIED, before any tag loads ─────────────
  const deniedSignals: ConsentSignals = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted', // strictly-necessary; always allowed
  }

  // Region-scoped default for ZA (POPIA market) so the intent is explicit and
  // tunable later, plus a global default so no region is left permissive.
  const regions = cfg.consentRegions?.length ? cfg.consentRegions : ['ZA']
  window.gtag('consent', 'default', { ...deniedSignals, region: regions, wait_for_update: 500 })
  window.gtag('consent', 'default', { ...deniedSignals, wait_for_update: 500 })

  // Privacy hardening: redact ad click ids while denied + pass through via URL
  // rather than cookies where possible.
  window.gtag('set', 'ads_data_redaction', true)
  window.gtag('set', 'url_passthrough', true)
  window.gtag('js', new Date())

  // ── Reactive state shared with the CMP banner / composable ─────────────────
  const state = reactive<AnalyticsState>({
    decisionMade: false,
    settingsOpen: false,
    choice: { analytics: false, ads: false },
  })

  let tagsLoaded = false

  // ── Tag loading (only after consent) ───────────────────────────────────────
  function injectScript(src: string, attrs: Record<string, string> = {}) {
    const s = document.createElement('script')
    s.async = true
    s.src = src
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
    document.head.appendChild(s)
    return s
  }

  function loadGtm() {
    if (!hasGtm) return
    window.dataLayer!.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
    injectScript(`https://www.googletagmanager.com/gtm.js?id=${cfg.gtmId}`)
    log('GTM loaded', cfg.gtmId)
  }

  function loadGtagDirect() {
    // Only used when there is NO GTM container but a GA4 id is present.
    if (hasGtm || !hasGa4) return
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${cfg.ga4Id}`)
    // GA4 config: SA market settings. NOTE: timezone (Africa/Johannesburg) and
    // currency (ZAR) are GA4 *property* settings (UI), not config params.
    window.gtag('config', cfg.ga4Id, {
      anonymize_ip: true,
      send_page_view: true, // SPA page_views also pushed by 2.analytics-events
    })
    log('gtag direct loaded', cfg.ga4Id)
  }

  function loadClarity() {
    if (!hasClarity) return
    ;(function (c: Window, l: Document, a: string, r: string, i: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(c as any)[a] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c as any)[a] ||
        function () {
          // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-explicit-any
          ;((c as any)[a].q = (c as any)[a].q || []).push(arguments)
        }
      const t = l.createElement(r) as HTMLScriptElement
      t.async = true
      t.src = 'https://www.clarity.ms/tag/' + i
      const y = l.getElementsByTagName(r)[0]
      y.parentNode!.insertBefore(t, y)
    })(window, document, 'clarity', 'script', cfg.clarityId)
    // Signal Clarity that cookie consent was granted (Clarity v2 consent API).
    window.clarity?.('consent')
    log('Clarity loaded', cfg.clarityId)
  }

  function loadTags() {
    if (tagsLoaded || !enabled) return
    tagsLoaded = true
    loadGtm()
    loadGtagDirect()
    if (state.choice.analytics) loadClarity()
  }

  // ── Apply a consent decision ───────────────────────────────────────────────
  function applyConsent(choice: ConsentChoice, persist: boolean) {
    state.choice = choice
    state.decisionMade = true
    state.settingsOpen = false

    const analytics: ConsentValue = choice.analytics ? 'granted' : 'denied'
    const ads: ConsentValue = choice.ads ? 'granted' : 'denied'

    window.gtag('consent', 'update', {
      analytics_storage: analytics,
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads,
    })
    log('consent update', { analytics, ads })

    if (choice.analytics || choice.ads) loadTags()

    if (persist) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...choice, ts: new Date().toISOString() }),
        )
      } catch {
        /* storage blocked, session-only consent */
      }
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  const api: ZabbleAnalytics = {
    state: readonly(state) as Readonly<AnalyticsState>,
    enabled,
    grant(choice) {
      applyConsent({ analytics: true, ads: true, ...choice }, true)
    },
    deny() {
      applyConsent({ analytics: false, ads: false }, true)
    },
    openSettings() {
      state.settingsOpen = true
    },
    closeSettings() {
      state.settingsOpen = false
    },
    trackEvent(name, params = {}) {
      if (!enabled) {
        log('trackEvent (no-op, no id)', name, params)
        return
      }
      window.dataLayer!.push({ event: name, ...params })
      // In gtag-direct mode (no GTM container) also fire via gtag so the event
      // reaches GA4 without a container trigger.
      if (!hasGtm && hasGa4) window.gtag('event', name, params)
      log('event', name, params)
    },
  }

  // ── Restore a prior decision (opt-in persists; no banner re-prompt) ─────────
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<ConsentChoice>
      applyConsent({ analytics: !!saved.analytics, ads: !!saved.ads }, false)
    }
  } catch {
    /* ignore corrupt storage */
  }

  nuxtApp.provide('zabbleAnalytics', api)
})
