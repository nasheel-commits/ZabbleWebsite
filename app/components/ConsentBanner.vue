<script setup lang="ts">
/**
 * ConsentBanner — first-party POPIA-compliant CMP.
 *
 * Opt-in by design: Accept and Reject carry equal weight, and NO analytics tag
 * loads until the visitor chooses (the core plugin keeps Consent Mode defaults
 * denied until `grant()` runs). "Manage" exposes per-category toggles.
 *
 * Only renders when at least one analytics id is configured (api.enabled) — so
 * pre-launch, with no ids set, nothing is shown. Re-openable from anywhere via
 * `useAnalytics().openSettings()` (e.g. a footer "Cookie settings" link).
 *
 * This is a lightweight built-in CMP. For a managed CMP (CookieYes / Usercentrics)
 * see docs/seo/decisions/0002-analytics-stack-and-consent.md — the Consent Mode
 * wiring in 1.analytics.client.ts is CMP-agnostic.
 */
import { reactive, watch } from 'vue'
import { Check, ShieldCheck, X } from '@lucide/vue'
import { useAnalytics } from '~/composables/useAnalytics'

const analytics = useAnalytics()
const { state } = analytics

// Local working copy for the "Manage preferences" toggles.
const prefs = reactive({ analytics: true, ads: false })

// When the settings dialog opens, seed toggles from the current choice.
watch(
  () => state.settingsOpen,
  (open) => {
    if (open) {
      prefs.analytics = state.choice.analytics
      prefs.ads = state.choice.ads
    }
  },
)

function savePrefs() {
  analytics.grant({ analytics: prefs.analytics, ads: prefs.ads })
}
</script>

<template>
  <ClientOnly>
    <!-- Banner: shown only when ids are configured and no decision yet made. -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="analytics.enabled && !state.decisionMade && !state.settingsOpen"
        class="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
        role="region"
        aria-label="Cookie consent"
      >
        <div
          class="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-line bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.28)]"
        >
          <div class="flex items-start gap-3">
            <span
              class="hidden sm:inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
            >
              <ShieldCheck :size="18" />
            </span>
            <div class="min-w-0">
              <p class="text-[14px] font-semibold text-ink">We respect your privacy</p>
              <p class="mt-1 text-[13.5px] leading-[1.55] text-mute">
                We'd like to measure how this site performs so we can improve it. Under POPIA,
                nothing loads until you choose. You can change this anytime.
              </p>
              <div class="mt-4 flex flex-col sm:flex-row sm:items-center gap-2.5">
                <button
                  type="button"
                  class="order-1 sm:order-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[14px] font-semibold px-4 py-2.5 transition-colors"
                  @click="analytics.grant()"
                >
                  <Check :size="15" :stroke-width="2.4" />
                  Accept all
                </button>
                <button
                  type="button"
                  class="order-2 inline-flex items-center justify-center rounded-lg border border-line hover:border-ink/30 bg-white hover:bg-surface-alt text-ink text-[14px] font-medium px-4 py-2.5 transition-colors"
                  @click="analytics.deny()"
                >
                  Reject all
                </button>
                <button
                  type="button"
                  class="order-3 sm:order-1 inline-flex items-center justify-center rounded-lg text-mute hover:text-ink text-[14px] font-medium px-4 py-2.5 transition-colors"
                  @click="analytics.openSettings()"
                >
                  Manage preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Preferences dialog -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state.settingsOpen"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Cookie preferences"
      >
        <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="analytics.closeSettings()" />
        <div
          class="relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.4)]"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="font-display text-[22px] leading-tight text-ink">Cookie preferences</h2>
              <p class="mt-1 text-[13.5px] text-mute leading-[1.55]">
                Choose what you're comfortable with. Strictly-necessary cookies keep the site
                working and can't be switched off.
              </p>
            </div>
            <button
              type="button"
              class="-mr-1 -mt-1 inline-flex items-center justify-center h-9 w-9 rounded-full text-mute hover:text-ink hover:bg-surface-alt transition"
              aria-label="Close"
              @click="analytics.closeSettings()"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="mt-5 space-y-3">
            <!-- Strictly necessary (locked on) -->
            <div class="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-alt/50 px-4 py-3">
              <div>
                <p class="text-[14px] font-semibold text-ink">Strictly necessary</p>
                <p class="text-[12.5px] text-mute">Always on. Required for the site to function.</p>
              </div>
              <span class="text-[12px] font-semibold text-cyan-brand-deep uppercase tracking-[0.12em]">On</span>
            </div>

            <!-- Analytics -->
            <label class="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3 cursor-pointer">
              <div>
                <p class="text-[14px] font-semibold text-ink">Analytics</p>
                <p class="text-[12.5px] text-mute">GA4 + Microsoft Clarity — how the site is used.</p>
              </div>
              <input v-model="prefs.analytics" type="checkbox" class="consent-toggle" />
            </label>

            <!-- Marketing -->
            <label class="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3 cursor-pointer">
              <div>
                <p class="text-[14px] font-semibold text-ink">Marketing</p>
                <p class="text-[12.5px] text-mute">Ad measurement signals. Off by default.</p>
              </div>
              <input v-model="prefs.ads" type="checkbox" class="consent-toggle" />
            </label>
          </div>

          <div class="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              class="text-[13.5px] font-medium text-mute hover:text-ink transition"
              @click="analytics.deny()"
            >
              Reject all
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[14px] font-semibold px-5 py-2.5 transition-colors"
              @click="savePrefs"
            >
              Save preferences
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>

<style scoped>
.consent-toggle {
  appearance: none;
  position: relative;
  width: 42px;
  height: 24px;
  border-radius: 9999px;
  background: var(--color-line);
  cursor: pointer;
  transition: background-color 180ms ease;
  flex-shrink: 0;
}
.consent-toggle:checked {
  background: var(--color-cyan-brand-deep, #00b8cc);
}
.consent-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.3);
  transition: transform 180ms ease;
}
.consent-toggle:checked::after {
  transform: translateX(18px);
}
.consent-toggle:focus-visible {
  outline: 2px solid var(--color-cyan-brand);
  outline-offset: 2px;
}
</style>
