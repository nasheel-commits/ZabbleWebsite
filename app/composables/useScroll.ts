import { ref, onMounted, onBeforeUnmount } from 'vue'

// Single passive scroll listener shared across the app. Components import
// `scrollY` as a reactive ref; one rAF-throttled handler updates it for
// everyone (TheNav, TheHero, TheScrollProgress).
const scrollY = ref(0)
const reduced = ref(false)
let listeners = 0
let ticking = false

function update() {
  scrollY.value = window.scrollY
  ticking = false
}

function onScroll() {
  if (ticking) return
  ticking = true
  window.requestAnimationFrame(update)
}

function attach() {
  if (typeof window === 'undefined') return
  reduced.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()
}

function detach() {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
}

export function useScroll() {
  onMounted(() => {
    if (listeners === 0) attach()
    listeners++
  })
  onBeforeUnmount(() => {
    listeners = Math.max(0, listeners - 1)
    if (listeners === 0) detach()
  })
  return { scrollY, reduced }
}
