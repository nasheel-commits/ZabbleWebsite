<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight, Check, Mail, Sparkles, Zap } from '@lucide/vue'

const sectionRef = ref<HTMLElement | null>(null)
const pathRef = ref<SVGPathElement | null>(null)
const headRef = ref<SVGPathElement | null>(null)
const arrowVisible = ref(false)

let buttonEl: HTMLElement | null = null
let observer: IntersectionObserver | null = null
let rafId: number | null = null
let mediaQueries: { mq: MediaQueryList; handler: () => void }[] = []
let mouseX = 0
let mouseY = 0
let pointerX = 0
let pointerY = 0
let inSection = false
let hasMouse = false
let snapPending = false
let cleanup: (() => void) | null = null

const EASE = 0.18
const HIDE_NEAR = 78
const HIDE_FAR = 900

function onMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
  hasMouse = true
}

function distanceToRect(x: number, y: number, rect: DOMRect) {
  const cx = Math.max(rect.left, Math.min(x, rect.right))
  const cy = Math.max(rect.top, Math.min(y, rect.bottom))
  return Math.hypot(x - cx, y - cy)
}

function targetOnRectEdge(rect: DOMRect) {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const horiz = Math.min(Math.abs(mouseX - rect.left), Math.abs(mouseX - rect.right))
  const vert = Math.min(Math.abs(mouseY - rect.top), Math.abs(mouseY - rect.bottom))
  let tx: number, ty: number
  if (horiz < vert) {
    tx = mouseX < cx ? rect.left : rect.right
    ty = Math.max(rect.top + 6, Math.min(rect.bottom - 6, mouseY))
  } else {
    ty = mouseY < cy ? rect.top : rect.bottom
    tx = Math.max(rect.left + 6, Math.min(rect.right - 6, mouseX))
  }
  return { x: tx, y: ty }
}

function controlPoint(sx: number, sy: number, ex: number, ey: number) {
  const dx = ex - sx
  const dy = ey - sy
  const dist = Math.hypot(dx, dy)
  if (dist < 40) return null
  const factor = Math.min(dist * 0.22, 120)
  const ang = Math.atan2(dy, dx)
  const perp = ang + Math.PI / 2
  const dir = (dx > 0 && dy > 0) || (dx < 0 && dy < 0) ? -1 : 1
  const mx = sx + dx * 0.5
  const my = sy + dy * 0.5
  return {
    x: mx + factor * Math.cos(perp) * dir,
    y: my + factor * Math.sin(perp) * dir,
  }
}

function buildPath(sx: number, sy: number, ex: number, ey: number) {
  const cp = controlPoint(sx, sy, ex, ey)
  if (!cp) return `M${sx},${sy} L${ex},${ey}`
  return `M${sx},${sy} Q${cp.x},${cp.y} ${ex},${ey}`
}

function buildHead(x: number, y: number, angle: number) {
  const len = 13
  const wing = Math.PI / 5
  const x1 = x - len * Math.cos(angle - wing)
  const y1 = y - len * Math.sin(angle - wing)
  const x2 = x - len * Math.cos(angle + wing)
  const y2 = y - len * Math.sin(angle + wing)
  const back = len * 0.55
  const x3 = x - back * Math.cos(angle)
  const y3 = y - back * Math.sin(angle)
  return `M${x},${y} L${x1},${y1} L${x3},${y3} L${x2},${y2} Z`
}

function tick() {
  // Bail when off-screen: stop scheduling rAF entirely until we re-enter
  // the section. The intersection observer below resumes the loop.
  if (!inSection) {
    rafId = null
    arrowVisible.value = false
    return
  }
  if (!buttonEl || !pathRef.value || !headRef.value) {
    rafId = requestAnimationFrame(tick)
    return
  }
  const rect = buttonEl.getBoundingClientRect()
  const target = targetOnRectEdge(rect)
  // After (re)entering the section — e.g. a fast scroll or a button that jumps
  // straight here — snap the arrow head onto the target instead of easing in
  // from a stale position, so it points at the button the instant it appears.
  if (snapPending) {
    pointerX = target.x
    pointerY = target.y
    snapPending = false
  } else {
    pointerX += (target.x - pointerX) * EASE
    pointerY += (target.y - pointerY) * EASE
  }

  pathRef.value.setAttribute('d', buildPath(mouseX, mouseY, pointerX, pointerY))

  const cp = controlPoint(mouseX, mouseY, pointerX, pointerY)
  const angle = cp
    ? Math.atan2(pointerY - cp.y, pointerX - cp.x)
    : Math.atan2(pointerY - mouseY, pointerX - mouseX)
  headRef.value.setAttribute('d', buildHead(pointerX, pointerY, angle))

  // Don't draw until we've seen a real cursor position — otherwise the arrow
  // would render from the screen-center default before the first mousemove.
  const dist = distanceToRect(mouseX, mouseY, rect)
  const shouldShow = hasMouse && dist > HIDE_NEAR && dist < HIDE_FAR
  if (arrowVisible.value !== shouldShow) arrowVisible.value = shouldShow

  rafId = requestAnimationFrame(tick)
}

function start() {
  if (cleanup) return
  buttonEl = sectionRef.value?.querySelector('.cta-primary') as HTMLElement | null
  if (!buttonEl) return

  pointerX = window.innerWidth / 2
  pointerY = window.innerHeight / 2
  mouseX = pointerX
  mouseY = pointerY
  snapPending = true

  window.addEventListener('mousemove', onMove, { passive: true })

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const wasIn = inSection
        inSection = entry.isIntersecting
        // Resume the rAF loop only on re-entry; tick() returns early when
        // inSection flips false, so no extra work happens while scrolled away.
        if (inSection && !wasIn && rafId === null) {
          // Snap the head onto the button on the first frame after re-entry so
          // it never eases in from a stale, offset position.
          snapPending = true
          rafId = requestAnimationFrame(tick)
        }
      }
    },
    { threshold: 0.2 },
  )
  if (sectionRef.value) observer.observe(sectionRef.value)

  cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    window.removeEventListener('mousemove', onMove)
    observer?.disconnect()
    observer = null
    inSection = false
    arrowVisible.value = false
  }
}

function stop() {
  cleanup?.()
  cleanup = null
}

onMounted(() => {
  if (typeof window === 'undefined') return

  const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)')

  const evaluate = () => {
    if (hoverMq.matches && !reducedMq.matches) start()
    else stop()
  }

  const reducedHandler = () => evaluate()
  const hoverHandler = () => evaluate()
  reducedMq.addEventListener('change', reducedHandler)
  hoverMq.addEventListener('change', hoverHandler)
  mediaQueries.push({ mq: reducedMq, handler: reducedHandler })
  mediaQueries.push({ mq: hoverMq, handler: hoverHandler })

  evaluate()
})

onBeforeUnmount(() => {
  stop()
  for (const { mq, handler } of mediaQueries) mq.removeEventListener('change', handler)
  mediaQueries = []
})

</script>

<template>
  <section
    id="contact"
    ref="sectionRef"
    class="lazy-section relative py-24 md:py-32 lg:py-36 overflow-hidden"
  >
    <div
      class="absolute inset-0 grid-bg fade-mask opacity-40 pointer-events-none"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-4xl px-5 md:px-8 lg:px-12">
      <div v-reveal:scale class="relative">
        <div
          class="cta-card relative rounded-2xl border border-line bg-white px-6 sm:px-10 md:px-14 lg:px-20 py-12 md:py-16 lg:py-20 text-center overflow-hidden"
        >
          <div
            class="absolute -top-24 left-1/2 -translate-x-1/2 h-[260px] w-[520px] rounded-full bg-cyan-brand/8 blur-[80px] pointer-events-none"
            aria-hidden="true"
          />

          <div class="relative">
            <div
              class="inline-flex items-center gap-2 text-[12px] md:text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
            >
              <span class="dot" />
              First Step
            </div>

            <h2
              class="mt-5 md:mt-6 font-display text-[34px] sm:text-[44px] md:text-[56px] lg:text-[60px] leading-[1.05] tracking-tight text-ink"
            >
              Let's find the problem
              <span class="block sm:inline">
                <span class="cyan-underline">worth solving first.</span>
              </span>
            </h2>

            <p
              class="mx-auto mt-5 md:mt-7 max-w-2xl text-[16px] md:text-[18px] leading-[1.6] md:leading-[1.7] text-mute"
            >
              Every business has one. We'll help you name it, scope it, and decide what's worth
              building. The first conversation is free. And useful either way.
            </p>

            <div class="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <NuxtLink to="/diagnose" class="cta-primary group">
                <Sparkles :size="16" :stroke-width="1.9" />
                Start the 2-minute diagnostic
                <ArrowRight
                  :size="16"
                  class="transition group-hover:translate-x-0.5"
                />
              </NuxtLink>
              <a
                href="mailto:analytics@zabble.org"
                class="group inline-flex items-center justify-center gap-2 rounded-lg border border-line hover:border-ink/30 bg-white hover:bg-surface-alt text-ink text-[15px] font-medium px-5 py-3.5 transition"
              >
                <Mail :size="16" class="text-mute" />
                analytics@zabble.org
              </a>
            </div>

            <div class="mt-8 hidden md:flex items-center justify-center gap-6 text-[12.5px] text-mute-2">
              <span class="inline-flex items-center gap-1.5">
                <Check :size="13" :stroke-width="2.4" class="text-cyan-brand-deep" />
                Free consultation
              </span>
              <span class="h-3 w-px bg-line" aria-hidden="true" />
              <span class="inline-flex items-center gap-1.5">
                <Zap :size="13" :stroke-width="2.4" class="text-cyan-brand-deep" />
                30 min · 1:1
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--
      Teleport to <body> so the arrow's `position: fixed` is anchored to the
      viewport, not to this section. The section carries `content-visibility:
      auto` (.lazy-section), which implies `contain: layout paint` — that would
      otherwise make the section the containing block for the fixed arrow and
      clip it, shifting the whole arrow by the section's scroll offset.
    -->
    <Teleport to="body">
      <div
        class="cursor-arrow"
        :class="{ 'is-visible': arrowVisible }"
        aria-hidden="true"
      >
        <svg class="cursor-arrow__svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="zabbleArrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#01DBF1" />
              <stop offset="100%" stop-color="#00B8CC" />
            </linearGradient>
          </defs>
          <path ref="pathRef" class="cursor-arrow__path" d="M0,0" />
          <path ref="headRef" class="cursor-arrow__head" d="M0,0" />
        </svg>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.cta-card {
  box-shadow:
    0 24px 60px -36px rgba(15, 23, 42, 0.18),
    0 6px 18px -10px rgba(15, 23, 42, 0.06);
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.625rem;
  padding: 0.875rem 1.25rem;
  background: var(--color-ink);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  transition:
    background-color 200ms ease,
    transform 200ms ease;
}
.cta-primary:hover {
  background: var(--color-ink-soft);
  transform: translateY(-1px);
}

.cursor-arrow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 40;
  opacity: 0;
  transition: opacity 900ms ease-out;
}
.cursor-arrow__svg,
.cursor-arrow__path,
.cursor-arrow__head {
  pointer-events: none;
}
@media (hover: none) {
  .cursor-arrow {
    display: none !important;
  }
}
.cursor-arrow.is-visible {
  opacity: 0.55;
  animation: cursor-arrow-breathe 4.2s ease-in-out infinite;
}
.cursor-arrow__svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}
.cursor-arrow__path {
  fill: none;
  stroke: url(#zabbleArrowGradient);
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-dasharray: 5 6;
  filter: drop-shadow(0 0 4px rgba(1, 219, 241, 0.28));
  animation: cursor-arrow-dash 2.6s linear infinite;
}
.cursor-arrow__head {
  fill: url(#zabbleArrowGradient);
  opacity: 0.85;
  filter: drop-shadow(0 0 4px rgba(1, 219, 241, 0.3));
}
@keyframes cursor-arrow-dash {
  to {
    stroke-dashoffset: -22;
  }
}
@keyframes cursor-arrow-breathe {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cursor-arrow__path {
    animation: none !important;
  }
  .cursor-arrow {
    display: none !important;
  }
}
</style>
