import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

// Shared IntersectionObserver pool, keyed by threshold+rootMargin combo.
// Components subscribe via useInView(elRef) and get back a reactive boolean
// + an `onEnter` callback that fires once when the element first intersects.

type ObserverKey = string

interface PoolEntry {
  observer: IntersectionObserver
  callbacks: Map<Element, (entry: IntersectionObserverEntry) => void>
}

const pool = new Map<ObserverKey, PoolEntry>()

function keyOf(threshold: number, rootMargin: string) {
  return `${threshold}|${rootMargin}`
}

function getEntry(threshold: number, rootMargin: string): PoolEntry | null {
  if (typeof IntersectionObserver === 'undefined') return null
  const key = keyOf(threshold, rootMargin)
  const existing = pool.get(key)
  if (existing) return existing
  const callbacks = new Map<Element, (entry: IntersectionObserverEntry) => void>()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const cb = callbacks.get(entry.target)
        cb?.(entry)
      }
    },
    { threshold, rootMargin },
  )
  const entry: PoolEntry = { observer, callbacks }
  pool.set(key, entry)
  return entry
}

export interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  /** When true, unobserve after the first intersecting entry. */
  once?: boolean
}

export function useInView(
  target: Ref<HTMLElement | null>,
  opts: UseInViewOptions = {},
) {
  const { threshold = 0.14, rootMargin = '0px 0px -6% 0px', once = false } = opts
  const visible = ref(false)
  let attached: { entry: PoolEntry; el: Element } | null = null

  function detach() {
    if (!attached) return
    attached.entry.callbacks.delete(attached.el)
    attached.entry.observer.unobserve(attached.el)
    attached = null
  }

  onMounted(() => {
    const el = target.value
    if (!el) return
    const entry = getEntry(threshold, rootMargin)
    if (!entry) {
      visible.value = true
      return
    }
    entry.callbacks.set(el, (iEntry) => {
      visible.value = iEntry.isIntersecting
      if (once && iEntry.isIntersecting) detach()
    })
    entry.observer.observe(el)
    attached = { entry, el }
  })

  onBeforeUnmount(detach)

  return { visible }
}
