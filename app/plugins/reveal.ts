import { defineNuxtPlugin } from '#app'

type RevealValue = number | { delay?: number; threshold?: number } | undefined

export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  const ensureObserver = () => {
    if (observer) return observer
    if (typeof IntersectionObserver === 'undefined') return null
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const delay = Number(el.dataset.revealDelay || 0)
          if (delay > 0) {
            window.setTimeout(() => el.classList.add('is-visible'), delay)
          } else {
            el.classList.add('is-visible')
          }
          observer!.unobserve(el)
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    )
    return observer
  }

  nuxtApp.vueApp.directive('reveal', {
    // SSR pass: emit the reveal classes so the server-rendered HTML matches
    // what the client directive will add on mount. Without this hook Vue's
    // server renderer crashes when it encounters v-reveal.
    getSSRProps(binding: { arg?: string }) {
      const cls = binding.arg ? `reveal reveal-${binding.arg}` : 'reveal'
      return { class: cls }
    },
    mounted(el: HTMLElement, binding: { value: RevealValue; arg?: string }) {
      if (typeof window === 'undefined') return
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      el.classList.add('reveal')
      if (binding.arg) el.classList.add(`reveal-${binding.arg}`)

      if (typeof binding.value === 'number') {
        el.dataset.revealDelay = String(binding.value)
      } else if (binding.value && typeof binding.value === 'object' && binding.value.delay != null) {
        el.dataset.revealDelay = String(binding.value.delay)
      }

      if (reduced) {
        el.classList.add('is-visible')
        return
      }

      const obs = ensureObserver()
      if (obs) obs.observe(el)
      else el.classList.add('is-visible')
    },
    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    },
  })
})
