/**
 * useAnalytics — typed, SSR-safe accessor for the Zabble measurement API.
 *
 * The real implementation is provided client-side by `1.analytics.client.ts`.
 * During SSR / prerender (or before the plugin runs) this returns a no-op stub
 * so call sites never need to guard `import.meta.client` themselves.
 *
 * Usage:
 *   const { trackEvent, grant, deny, openSettings, state } = useAnalytics()
 *   trackEvent('generate_lead', { currency: 'ZAR', value: 0 })
 */
import { reactive, readonly } from 'vue'
import { useNuxtApp } from '#app'
import type { ZabbleAnalytics } from '~/plugins/1.analytics.client'

const noopState = readonly(
  reactive({
    decisionMade: false,
    settingsOpen: false,
    choice: { analytics: false, ads: false },
  }),
)

const stub: ZabbleAnalytics = {
  state: noopState as ZabbleAnalytics['state'],
  enabled: false,
  grant: () => {},
  deny: () => {},
  openSettings: () => {},
  closeSettings: () => {},
  trackEvent: () => {},
}

export function useAnalytics(): ZabbleAnalytics {
  if (import.meta.server) return stub
  const api = useNuxtApp().$zabbleAnalytics as ZabbleAnalytics | undefined
  return api ?? stub
}
