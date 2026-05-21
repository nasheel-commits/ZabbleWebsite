# Zabble Web App — Performance Audit

**Scope**: identify lightweight, low-risk changes that make the app feel snappier without altering visuals or animations.

**Methodology**: read every component / plugin / config, inspect `node_modules/@lucide/vue` shape, trace every long-running JS loop (RAF, setTimeout, IntersectionObserver), and every animated CSS layer (transform / filter / backdrop-filter). All recommendations preserve the current look and motion exactly.

**Verdict**: the site is structurally healthy — no images, no third-party scripts, no client-side data fetching, SSR is clean. The remaining cost is concentrated in: (a) the three independent scroll handlers + reactive `:style` updates that drive the hero parallax, (b) two GPU-heavy filter layers (`backdrop-blur-md` on the nav + `blur-3xl` on the hero blobs), and (c) two RAF loops (TextScramble + cursor-arrow) that run continuously without pause-when-offscreen.

Fix the items in §A and INP / scroll smoothness / first-load weight all improve materially with zero visual change.

---

## A. Quick wins (high impact, low risk, zero visual change)

### A1. Drop unused Inter weights from the font URL — saves ~80–120 KB on first load

**Where**: `nuxt.config.ts` line 31.

```
.../css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif&display=swap
```

Inter weights actually used in the codebase (grep on `font-bold|font-extrabold|font-black`): **none**. Only `font-medium` (500), `font-semibold` (600), and the default body weight (400) are referenced. Weights 700 and 800 are downloaded but never rendered.

**Recommendation**:

```ts
href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Instrument+Serif&display=swap'
```

**Impact**: 2 fewer font files. Each Inter weight is ~30–50 KB woff2; combined ~60–100 KB.
**Risk**: none — the weights aren't rendered anywhere.

---

### A2. Pause TextScramble + cursor-arrow RAF when off-screen — saves continuous main-thread + GPU work

**Where**:
- `TheHero.vue` lines 100–110 — `TextScramble` runs `setTimeout(tick, 2400)` forever, regardless of whether the hero is visible.
- `TheFinalCta.vue` lines 88–111 — `tick()` requests another frame at the end every frame; only `arrowVisible` is gated to "in section", but the RAF + `getBoundingClientRect()` + setAttribute calls keep happening even when the section is far off-screen.

Both fire even when the user has scrolled past or hasn't reached the section yet. On a typical visit, the TextScramble re-fires roughly every 2.4 seconds for the entire session, doing 600–1200 ms of RAF + `innerHTML` rewrites per cycle.

**Recommendation**:

Wrap each loop in the IntersectionObserver that the rest of the site already uses. Concretely:

In `TheHero.vue`, hold the IntersectionObserver from the reveal plugin's pattern; only call `tick()` while the section is intersecting; cancel `scrambleFrame` + `scrambleTimer` on `isIntersecting: false`, restart on `true`.

In `TheFinalCta.vue`, the existing `inSection` flag already exists — short-circuit `tick()` to not request the next frame when `!inSection`:

```ts
function tick() {
  if (!inSection) { rafId = null; return }
  // ...existing logic
  rafId = requestAnimationFrame(tick)
}
// Then in the observer callback, if it just turned true, call `tick()` to restart.
```

**Impact**: a constant 50–60 fps RAF loop with `getBoundingClientRect()` every frame is roughly 0.2–0.5 ms of main-thread work per frame on a fast device, 1–3 ms on a low-end phone. Removing it for the ~90 % of the session the section is off-screen is significant for steady-state battery + INP.

**Risk**: none — the visual is unchanged, just freezes when nobody is looking at it.

---

### A3. Cache the CTA button rect; only re-measure on scroll / resize — kills layout thrash

**Where**: `TheFinalCta.vue` line 93 — `const rect = buttonEl.getBoundingClientRect()` is called once per RAF.

`getBoundingClientRect()` forces a synchronous layout (style + layout flush) every frame. The button's position only changes when the page scrolls or the viewport resizes.

**Recommendation**: cache `rect` in a `let` and recompute only inside passive `scroll` and `resize` listeners (already listened for elsewhere). The RAF loop then uses the cached rect.

**Impact**: removes ~0.1–0.5 ms layout work per frame while the cursor-arrow loop is active. Combined with A2, the loop becomes effectively free when active.

**Risk**: none — same arrow, same target.

---

### A4. Animate `transform: scaleX()` instead of `width` on the scroll-progress bar — moves it off the layout thread

**Where**: `main.css` lines 214–220.

```css
.scroll-progress__bar { width: 0; transition: width 80ms linear; }
```

`width` is a layout property. Changing it on every scroll tick forces layout. The bar is purely cosmetic — a transform-based version is GPU-only.

**Recommendation**:

```css
.scroll-progress__bar {
  width: 100%;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform 80ms linear;
  /* keep the existing background + shadow */
}
```

Then in `TheScrollProgress.vue`:

```ts
progressEl.style.transform = `scaleX(${ratio})`
```

(use `progressEl.style.transform` directly inside the RAF rather than the reactive `:style="{ width }"` binding, so Vue doesn't diff on every frame).

**Impact**: the progress bar update no longer triggers layout. With three scroll listeners + parallax, every saved layout matters on mobile.

**Risk**: none — visually identical, including the soft cyan-glow shadow (`box-shadow` follows the element; with `transform-origin: 0 50%` the box stays the same shape, just scaled along X).

---

### A5. Drive hero parallax via `el.style.transform` instead of reactive `:style` — fewer Vue patches

**Where**: `TheHero.vue` lines 122–136 + 195–198. Four elements (grid-bg, two blobs, dashboard wrapper) are bound to `:style="{ transform: \`translate3d(0, ${scrollY * X}px, 0)\` }"`.

Each scroll RAF: `scrollY.value = window.scrollY` triggers a Vue reactivity update for every dependent template binding (four `:style` objects, each diffed and patched).

**Recommendation**: hold refs to the four DOM nodes (`ref="gridRef"`, `ref="blobARef"`, etc.) and inside `update()` write directly:

```ts
gridRef.value!.style.transform = `translate3d(0, ${y * 0.12}px, 0)`
blobARef.value!.style.transform = `translate3d(0, ${y * 0.25}px, 0)`
// ...
```

Remove the reactive `scrollY` ref entirely (or keep it private to the script for non-style uses).

**Impact**: cuts per-frame work to plain attribute writes — bypasses the Vue scheduler + virtual-DOM diff for these four bindings. Particularly noticeable on long scrolls / mobile.

**Risk**: none — same transforms, same elements.

---

### A6. Consolidate the three independent scroll listeners

**Where**:
- `TheNav.vue` line 17 — `window.addEventListener('scroll', onScroll, { passive: true })`
- `TheHero.vue` line 96 — same
- `TheScrollProgress.vue` line 21 — same

Each handler attaches its own RAF / setter. The browser still only fires one `scroll` event per frame, but the JS does three independent callbacks.

**Recommendation**: a single shared composable, e.g. `composables/useScroll.ts`:

```ts
import { onMounted, onBeforeUnmount, shallowRef } from 'vue'

const subscribers = new Set<(y: number) => void>()
let started = false
let rafPending = false
let lastY = 0

function tick() {
  rafPending = false
  for (const fn of subscribers) fn(lastY)
}
function onScroll() {
  lastY = window.scrollY
  if (rafPending) return
  rafPending = true
  requestAnimationFrame(tick)
}

export function useScroll(cb: (y: number) => void) {
  onMounted(() => {
    subscribers.add(cb)
    if (!started) {
      started = true
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    }
    cb(window.scrollY) // initial
  })
  onBeforeUnmount(() => { subscribers.delete(cb) })
}
```

Each consumer (nav, hero, progress) calls `useScroll(y => …)`. One event listener, one RAF, fan-out to three callbacks.

**Impact**: one event listener + one RAF schedule per scroll tick, instead of three. Smoother on low-end mobile.

**Risk**: none — same behaviour, fewer event-loop hops.

---

### A7. Use Lucide's per-icon subpath imports

**Where**: every `import { Icon } from '@lucide/vue'`.

The package is well-formed for tree-shaking (`sideEffects: false`, per-icon ESM files in `dist/esm/icons/*.mjs`), so Vite should already shake the unused icons. But the top-level barrel (`dist/esm/lucide-vue.mjs`) re-exports a `* as index` namespace, which some bundler/minifier combinations treat as a side-effecting reference and bail out of full shaking.

**Recommendation**: switch every import to the explicit subpath. The set of icons used across the site is small:

```ts
// Before
import { ArrowRight, PlayCircle } from '@lucide/vue'

// After
import ArrowRight from '@lucide/vue/icons/arrow-right'
import PlayCircle from '@lucide/vue/icons/play-circle'
```

Icons used by file:
- `TheNav` — Menu, X, ArrowRight, ArrowUpRight, Mail
- `TheHero` — ArrowRight, PlayCircle
- `TheProblem` — FileSpreadsheet, Plug, Gauge, AlertOctagon
- `TheMeet` — ArrowRight
- `ThePlan` — Search, Hammer, Activity
- `TheWhatWeBuild` — Workflow, ShieldCheck, Radar, BarChart3, ArrowRight
- `TheDoNothing` — TrendingDown, Flame, HelpCircle, BatteryLow, CloudLightning, ArrowRight, AlertTriangle
- `TheWhenItWorks` — Workflow, ShieldCheck, Radar, BarChart3, Sparkles
- `TheFinalCta` — ArrowRight, Mail, Sparkles, Check, Zap
- `diagnose` — ArrowRight, ArrowLeft, Check, X, Calendar, ChevronLeft, ChevronRight, Clock, Loader2, Workflow, ShieldCheck, Radar, BarChart3, Layers

Total unique: ~25 icons. Each is < 1 KB minified.

**Impact**: guarantees the icon barrel is excluded from the bundle. In the worst case it doesn't change anything; in the best case (some minifier inlining the barrel) it can shave double-digit KB from the JS bundle.
**Risk**: none — same components, different import path.

---

## B. Render performance (steady state — scroll, animations)

### B1. The hero parallax blobs are the most expensive layers on the page

**Where**: `TheHero.vue` lines 127–135 — two blobs with `blur-3xl` (`filter: blur(64px)`) sized `420×420` and `320×320`, plus a `grid-bg fade-mask` overlay above them. All four layers receive parallax transforms.

Filter blur is one of the most expensive operations the compositor can do; combined with continuous transform updates, the GPU is repainting a blurred-radial-gradient layer every frame the user scrolls.

**Cannot remove** (visual change). But two things help:

1. **Apply A5** so Vue isn't patching attributes on top of the GPU work.
2. **Add `contain: layout paint`** to each blob element. This tells the browser the blob doesn't affect layout or paint outside its box, so the compositor can skip checking surrounding regions when the blob moves.

```html
<div class="parallax-blob ..." style="contain: layout paint;"></div>
```

3. **Pause the parallax updates when the hero is fully off-screen.** An IntersectionObserver on the hero section that flips a `parallaxActive` flag; the RAF tick early-returns when `!parallaxActive`. This is symmetric with A2.

**Impact**: per-frame compositing work drops noticeably when the user has scrolled past the hero. Once below the hero, the blobs disappear from the viewport but the transforms keep updating — that's wasted work.

**Risk**: none — visually identical.

---

### B2. `.parallax-blob { will-change: transform; }` is always-on

**Where**: `main.css` line 225.

`will-change` is a hint to the browser to pre-promote the element to its own compositing layer. Three blobs always promoted = GPU memory always reserved. Cheap when needed, wasteful when not.

**Recommendation**: remove `will-change` from the static class. Apply it from JS only while the hero is in viewport AND the user is actively scrolling. Strip it after a debounced idle period (e.g. 200 ms after the last scroll).

Pattern (inside the unified scroll composable from A6):

```ts
let idleTimer: number
function onScroll(y: number) {
  blobs.forEach(b => b.style.willChange = 'transform')
  clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => {
    blobs.forEach(b => b.style.willChange = '')
  }, 200)
}
```

**Impact**: lower GPU memory pressure when the user is idle on the hero, or anywhere else on the page. Helps low-end Android most.

**Risk**: brief flicker possible if the user resumes scrolling after `will-change` was stripped — the browser may need to re-promote the layer. In practice imperceptible at 200 ms idle threshold.

---

### B3. `.reveal { will-change: opacity, transform; }` on every reveal element

**Where**: `main.css` lines 156–165. Every section / card / paragraph that uses `v-reveal` gets `will-change: opacity, transform` on mount — and **keeps it forever**, even after the animation finishes.

There are dozens of revealed elements across the page. Each one stays a promoted GPU layer for the rest of the session.

**Recommendation**: in the reveal plugin (`app/plugins/reveal.client.ts`), apply `will-change` from JS just before adding `is-visible`, then remove it after the animation completes:

```ts
el.style.willChange = 'opacity, transform'
el.classList.add('is-visible')
el.addEventListener('transitionend', () => {
  el.style.willChange = ''
}, { once: true })
```

And drop `will-change` from the static `.reveal` rule in CSS.

**Impact**: GPU memory used by reveal elements becomes proportional to "currently animating" rather than "ever-animated". On a long-scroll marketing page with 20+ reveal elements, this is the single biggest GPU memory win.

**Risk**: none — same animation, just doesn't keep the layer alive forever.

---

### B4. CpuArchitecture runs 8 infinite SVG motion-path animations even when off-screen

**Where**: `main.css` lines 102–149 — eight `.cpu-line-*` rules each with an infinite `animation-iteration-count` driving `offset-path` motion.

`offset-path` animations are GPU-friendly, but they consume style-recalc + compositing budget regardless of visibility.

**Recommendation**: wrap CpuArchitecture in a container with `content-visibility: auto` and a stable `contain-intrinsic-size`. When off-screen, the browser skips rendering and pauses animations inside.

```html
<div style="content-visibility: auto; contain-intrinsic-size: 200px;">
  <CpuArchitecture text="OPS" class="text-slate-400" />
</div>
```

Where to apply: the wrapping `<div class="mt-4 rounded-xl ...">` in `TheMeet.vue` line 74.

**Impact**: zero CPU/GPU work for the CPU lines while the user is anywhere else on the page.

**Risk**: `content-visibility: auto` can cause a tiny scroll-jump if `contain-intrinsic-size` is wrong. Test a sensible default (the CpuArchitecture aspect ratio is 200×100 SVG; the rendered container is ~200 px wide ⇒ ~100 px tall). Set `contain-intrinsic-size: auto 200px` so the browser uses the last-known rendered size after first paint.

---

### B5. ThePlan spinning badge — three continuously rotating conic-gradients

**Where**: `ThePlan.vue` `.plan-badge__ring { animation: plan-badge-spin 5s linear infinite; }` plus a conic-gradient + drop-shadow filter.

Conic-gradient + drop-shadow + rotation = the compositor repaints + re-filters each frame.

**Cannot stop** (visual change). But the same `content-visibility: auto` treatment can scope the cost to "while the plan section is in viewport":

```html
<section id="plan" style="content-visibility: auto; contain-intrinsic-size: auto 800px;">
```

**Impact**: animation budget freed when the user is outside the plan section.
**Risk**: as B4 — pick a sensible intrinsic size for the section so anchor links to `#plan` still scroll correctly. ~800px tall mobile / ~700px desktop.

---

### B6. `cursor-arrow-dash` animation runs continuously regardless of `is-visible`

**Where**: `TheFinalCta.vue` `.cursor-arrow__path { animation: cursor-arrow-dash 2.6s linear infinite; }`.

The dashed-stroke offset animates every frame even when `opacity: 0` (i.e. when the arrow isn't shown).

**Recommendation**: gate the animation to `is-visible`:

```css
.cursor-arrow__path { /* no animation here */ }
.cursor-arrow.is-visible .cursor-arrow__path {
  animation: cursor-arrow-dash 2.6s linear infinite;
}
```

**Impact**: tiny per frame, but multiplied across visit duration. Free.
**Risk**: none — the animation only matters while the arrow is visible anyway.

---

## C. JS bundle & first paint

### C1. Lazy-load below-the-fold sections

**Where**: `app/pages/index.vue` — all 9 marketing sections are imported and rendered eagerly.

The Hero, Problem, and Meet sections are above-the-fold (on most viewports the Hero alone is). The remaining 6 sections (Plan, WhatWeBuild, DoNothing, WhenItWorks, FinalCta, Footer) ship their JS in the initial bundle.

**Recommendation**: use Nuxt's `defineAsyncComponent` (or convert to dynamic imports) for below-the-fold sections:

```ts
const ThePlan = defineAsyncComponent(() => import('~/components/ThePlan.vue'))
const TheWhatWeBuild = defineAsyncComponent(() => import('~/components/TheWhatWeBuild.vue'))
// ...
```

Combine with `v-once`-style or `IntersectionObserver` mounting so the components only mount when their placeholder enters viewport. The simplest: wrap the page's lower sections in a small `<LazySection>` component using `useIntersectionObserver`.

Alternatively, Nuxt's built-in `<Lazy*>` component prefix (`<LazyThePlan />` etc.) defers hydration until the component is visible — minimal-effort version of the same idea.

**Impact**: significant reduction in initial JS execution + hydration time. Smaller TTI.
**Risk**: low — make sure scroll-anchor links (`#plan`, `#contact`, etc.) still work; they will, because the section's outer `<section id="...">` is rendered in the SSR HTML.

---

### C2. Self-host fonts (optional, slightly more involved)

**Where**: `nuxt.config.ts` lines 26–33.

Currently the page makes a request to `fonts.googleapis.com` to fetch a small CSS file that then references `fonts.gstatic.com` for the actual woff2 files. Two extra DNS lookups + two extra TLS handshakes on cold load, even with `preconnect`.

**Recommendation**: install `@nuxtjs/google-fonts` (with `download: true`) or manually download the woff2 files and host them under `/public/fonts/`. Replace the external `<link>` with a local `<link rel="stylesheet" href="/fonts/inter.css">` plus inline `@font-face` declarations.

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-400.woff2') format('woff2');
}
/* repeat for 500, 600, and Instrument Serif */
```

**Impact**: removes the two cross-origin font requests; fonts load from the same origin (same CDN as the HTML), benefit from HTTP/2 multiplexing, and can be aggressively cached by the CDN.

**Risk**: slightly more build/config work; fonts no longer benefit from cross-site Google CDN caching (but in practice that cross-site cache has been partitioned by browsers since 2020, so the win was already gone).

---

### C3. Add `<link rel="preload">` for the two critical font weights

**Where**: `nuxt.config.ts` head link array.

Inter 400 and Inter 600 are the first thing the user sees (body + heading text). Currently they're discovered by the browser only after CSS parses.

**Recommendation**: once C2 is done, preload the woff2 files:

```ts
link: [
  { rel: 'preload', as: 'font', type: 'font/woff2',
    href: '/fonts/inter-400.woff2', crossorigin: '' },
  { rel: 'preload', as: 'font', type: 'font/woff2',
    href: '/fonts/inter-600.woff2', crossorigin: '' },
  // ... existing stylesheet link
]
```

Don't preload 500 / Instrument Serif — they aren't needed for first paint of the body text.

**Impact**: fonts begin downloading in parallel with the HTML parse, not after the CSS arrives. Visible LCP improvement (text re-paints in the right font sooner).

**Risk**: none.

---

### C4. Disable devtools in production (verify)

**Where**: `nuxt.config.ts` line 5 — `devtools: { enabled: true }`.

Nuxt strips devtools in production builds by default, so this is almost certainly a no-op for prod. Worth verifying with a bundle analyser (`npx nuxi analyze`) that no devtools chunks are shipped.

**Impact**: 0 if it's already stripped; non-trivial if something leaks through.
**Risk**: none.

---

## D. Vue hydration & runtime cost

### D1. The TextScramble rewrites `innerHTML` every animation frame

**Where**: `TheHero.vue` line 79 — `this.el.innerHTML = output` inside `update()`.

Each frame, `innerHTML` rebuilds the entire DOM subtree (~25–30 `<span class="scramble-dud">X</span>` children), parses it, drops the old nodes for GC. Over a 1-second scramble that's ~60 full subtree replacements. GC pressure + parse overhead.

**Recommendation**: pre-create one `<span class="scramble-dud">` per character index when `setText` runs; reuse the same nodes by setting `node.textContent` and toggling between two CSS classes (`scramble-dud` vs the resolved style). After A2 (pause off-screen) this is much smaller, but worth pairing with it.

Concrete sketch:

```ts
setText(newText) {
  // Build queue as today.
  // Then: rebuild children once with placeholder spans.
  this.el.replaceChildren(...this.queue.map(() => document.createElement('span')))
  this.update()
}

update() {
  for (let i = 0, n = this.queue.length; i < n; i++) {
    const span = this.el.children[i]
    const q = this.queue[i]
    if (this.frame >= q.end) {
      span.className = ''
      span.textContent = q.to
    } else if (this.frame >= q.start) {
      if (!q.char || Math.random() < 0.28) q.char = this.randomChar()
      span.className = 'scramble-dud'
      span.textContent = q.char
    } else {
      span.className = ''
      span.textContent = q.from
    }
  }
  // ... same RAF gating as today
}
```

**Impact**: ~5–10× less per-frame DOM cost during the scramble. Frames stay below the 16 ms budget on mid-tier mobile.

**Risk**: none — same characters, same colours; just reusing DOM nodes.

---

### D2. Body-scroll lock via `document.body.style.overflow = 'hidden'` is fine, but verify on iOS

**Where**: `TheNav.vue` line 29.

iOS Safari occasionally still allows the underlying page to scroll when only `overflow: hidden` is applied to body (a long-standing Safari quirk). The visual effect is the menu drawer scrolls instead of locking.

**Recommendation** (only if you see the bug in the wild): switch to fixed-position locking with restored scroll position:

```ts
let savedY = 0
watch(open, (isOpen) => {
  if (isOpen) {
    savedY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedY}px`
    document.body.style.width = '100%'
  } else {
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, savedY)
  }
})
```

**Impact**: only matters if you see scroll-lock bleed on iOS.
**Risk**: low; well-known pattern.

---

## E. CSS / paint hygiene

### E1. `transition: all` is gone (good)

Already audited and removed earlier from `TheNav`. No remaining `transition: all` in the codebase.

### E2. Heavy shadows on hover-only states

Several cards use multi-layer box-shadows on hover, e.g.

```
hover:shadow-[0_24px_60px_-32px_rgba(1,219,241,0.55)]
```

These only paint on hover; on a touch device they trigger briefly on tap. Not a steady-state cost. **No action.**

### E3. `scroll-behavior: smooth` on `html`

`main.css` line 23. This is the native CSS smooth-scroll. On long pages with the parallax blobs + backdrop-blur header, native smooth-scroll can stutter on Safari. **No action** unless you observe the stutter — if you do, replace with a JS-based smooth-scroll for anchor links and remove the CSS rule.

---

## F. Build & deployment

### F1. Confirm static generation

This is a marketing site with two routes (`/`, `/diagnose`) and zero client-side data fetching. Use `nuxt generate` for deploy; ship pure static HTML with hydration.

```bash
npm run generate
# outputs to .output/public
```

Deploy that to any static host (Vercel does this automatically when no server routes are detected).

**Impact**: zero server roundtrip on cold load; HTML can be served from edge cache.

### F2. Run `nuxi analyze` to inspect the bundle

```
npx nuxi analyze
```

This produces a visualisation of the chunks. Use it to:
- Confirm `@lucide/vue` has tree-shaken to just the icons in use (after A7).
- Confirm `devtools` is not in the prod bundle (C4).
- Identify any unexpectedly large chunks.

### F3. Enable Brotli/gzip at the CDN

Vercel does this automatically. If hosting elsewhere, ensure `.woff2`, `.js`, `.css`, `.svg`, and `.html` are served with `Content-Encoding: br` (or `gzip` fallback). Already-compressed (`.woff2`, `.png`) gets ~0 savings; uncompressed (`.js`, `.css`, `.svg`, `.html`) gets 60–80 %.

---

## G. Misc / low priority

### G1. `transition: width 80ms linear` — see A4.

### G2. `text-rendering: optimizeLegibility` on html

`main.css` line 26 — instructs the browser to enable kerning and ligatures, which costs a bit on first paint of long text blocks. The benefit is real for display copy. Leave as-is.

### G3. `font-feature-settings: 'cv11', 'ss01', 'ss03', 'cv02'` on body

These are Inter stylistic alternates. They're picked up at glyph-shaping time — zero perf cost beyond Inter's normal rendering. Keep.

### G4. `.diagnose-quote` uses a system serif stack rather than a web font

`diagnose.vue` line 950. Wisely so — no extra font request. Keep.

### G5. SVG icons inline the same gradient defs across components

The CTA cursor-arrow defines `<linearGradient id="zabbleArrowGradient">` inside its SVG. Other SVGs (hero chart, etc.) define their own gradients. **No action** — each is small (< 200 bytes), and reusing across SVGs across components doesn't reliably work (the id has to live in the same document).

---

## Prioritised action list

In rough order of effort-adjusted impact:

| # | Item                                                              | Risk      | Visual change | Estimated effort | Estimated impact |
|---|-------------------------------------------------------------------|-----------|---------------|------------------|------------------|
| 1 | **A1** Drop Inter 700/800 from font URL                           | none      | none          | 1 line           | ~80–120 KB saved |
| 2 | **A2** Pause TextScramble + cursor-arrow RAF off-screen           | none      | none          | ~30 lines        | Significant idle CPU/battery |
| 3 | **A3** Cache the CTA-button rect; recompute on scroll/resize      | none      | none          | ~10 lines        | Removes layout thrash |
| 4 | **A4** scroll-progress bar: `width` → `transform: scaleX`         | none      | none          | ~5 lines         | One fewer layout per scroll tick |
| 5 | **A5** Hero parallax via `el.style.transform`, not reactive `:style` | none   | none          | ~15 lines        | Fewer Vue patches per scroll |
| 6 | **A6** Unified `useScroll` composable                             | none      | none          | ~40 lines        | One listener instead of three |
| 7 | **B3** Apply `will-change` only during reveal animation           | none      | none          | ~10 lines        | Frees GPU memory on long page |
| 8 | **A7** Lucide subpath imports                                     | none      | none          | trivial, repo-wide | Bundle-size guarantee |
| 9 | **C1** Lazy-load below-the-fold sections                          | low       | none          | ~20 lines        | Smaller initial JS + TTI |
| 10| **B1**+**B2** Parallax blob `contain: layout paint` + dynamic `will-change` | none | none | ~10 lines        | Steady-state GPU savings |
| 11| **B4** CpuArchitecture wrapped in `content-visibility: auto`      | low       | none          | 1 line           | Removes off-screen anim cost |
| 12| **B5** Plan section `content-visibility: auto`                    | low       | none          | 1 line           | Removes off-screen anim cost |
| 13| **B6** Gate `cursor-arrow-dash` animation to `.is-visible`        | none      | none          | 2 lines          | Tiny constant savings        |
| 14| **D1** Reuse DOM nodes in TextScramble                            | none      | none          | ~30 lines        | Smoother scramble frames     |
| 15| **C2**+**C3** Self-host fonts + preload Inter 400/600             | low       | none          | ~30 lines + 1 config | Faster LCP                  |
| 16| **F1**+**F2** `nuxt generate` + bundle analyze                    | none      | none          | run commands     | Verifies wins, no roundtrips |

Doing items 1–8 alone is a one-evening change with no behavioural risk and meaningfully better feel on mobile.

---

## What was deliberately left alone

These would all help perf but require visual / animation changes — explicitly out of scope per the brief.

- **`backdrop-blur-md` on the nav** — paints a blurred copy of the page behind the header on every scroll frame. Cheap to remove; would change the look.
- **`blur-3xl` on hero parallax blobs** — biggest GPU cost per frame on mobile. Reducing the blur radius (`blur-2xl`) would visibly tighten the halo.
- **8 infinite SVG motion-path animations in CpuArchitecture** — removing them would change the dashboard animation.
- **ThePlan badge `plan-badge-spin`** — continuous rotation of conic-gradient.
- **The dashboard mockup in the hero (md+)** — three stat cards + svg sparkline + two floating cards.

If perf budget ever needs to come further down, these are where to look — but only when you're willing to alter the look.
