# Zabble Brand & Style Reference

A project-agnostic style guide. Use this to keep any Zabble surface — marketing site, app, CRM, internal tools, decks — visually consistent.

Every value here is given as raw CSS / hex / pixels so it can be applied in any stack (plain CSS, Tailwind, CSS-in-JS, design tools, etc.). The Tailwind examples are illustrative; the principles are what carry over.

---

## 1. Brand personality

Zabble builds **bespoke operational systems** — automation, audit trails, anomaly detection, analytics. The visual system should feel:

- **Grounded** — calm, white-heavy, not flashy.
- **Considered** — generous whitespace, clear hierarchy, deliberate detail (subtle grids, soft halos, type detail).
- **Operational** — practical, structured, clearly labelled.
- **Confident** — large display serif headlines, restrained colour, no decorative noise.

What it is not: dark-mode-first, gradient-heavy, glassmorphic, "playful", or stock-SaaS-pastel.

---

## 2. Colour

### 2.1 Tokens

| Token              | Hex       | RGB                | Role                                             |
| ------------------ | --------- | ------------------ | ------------------------------------------------ |
| `cyan-brand`       | `#01DBF1` | `1, 219, 241`      | Primary accent. Underlines, highlights, halos.   |
| `cyan-brand-deep` | `#00B8CC` | `0, 184, 204`      | Accent text & icons (eyebrows, icon strokes).    |
| `ink`              | `#0A0F1A` | `10, 15, 26`       | Primary text, primary buttons, hard edges.       |
| `ink-soft`         | `#1F2937` | `31, 41, 55`       | Hover state for primary buttons; emphasised body.|
| `mute`             | `#475569` | `71, 85, 105`      | Secondary body copy.                             |
| `mute-2`           | `#64748B` | `100, 116, 139`    | Tertiary copy, captions, eyebrow labels (neutral).|
| `surface`          | `#FFFFFF` | `255, 255, 255`    | Base background.                                 |
| `surface-alt`      | `#F6F8FB` | `246, 248, 251`    | Alt surface (banded sections, icon chip bg).     |
| `line`             | `#E2E8F0` | `226, 232, 240`    | Borders, dividers, ring-1 around icon chips.     |

### 2.2 Warning red (use sparingly)

Used **only** to mark genuine warning content (e.g. cost-of-inaction sections, destructive actions). Never as decoration, never as a gradient.

| Token     | Hex       | Where                                       |
| --------- | --------- | ------------------------------------------- |
| `red-50`  | `#FEF2F2` | Icon-chip background tint                   |
| `red-100` | `#FEE2E2` | Icon-chip ring / border                     |
| `red-600` | `#DC2626` | Warning icon stroke, warning eyebrow label  |

### 2.3 Usage rules

- **One brand colour at a time** — `cyan-brand-deep` is the only accent on most surfaces. The deep variant is used for eyebrows, icons, and small accents. The lighter `cyan-brand` is reserved for the underline highlight, the dot accent, and ultra-soft halos (max 15% opacity).
- **No gradient backgrounds.** A single radial cyan blob (≤15% opacity, heavy blur) is OK as one tasteful accent per section. Never use full-bleed cyan washes or animated conic gradients.
- **Backgrounds stay light.** Default `surface` (#FFFFFF). Use `surface-alt` (#F6F8FB) to band a section. Never dark-mode panels in light-mode contexts.
- **Borders, not shadows, for separation.** Prefer `1px solid line` for card and field edges. Shadows are reserved for elevation cues on interactive elements (and are kept soft — see §6.3).
- **Red is content, not chrome.** If a card/page has no warning meaning, no red.

---

## 3. Typography

### 3.1 Fonts

| Stack     | Family                                                                                              | Weights used     | Where                                              |
| --------- | --------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------- |
| `sans`    | `Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans` | 400, 500, 600, 700, 800 | Body, UI, labels, buttons                          |
| `display` | `'Instrument Serif', 'Inter', serif`                                                                | 400 (regular)    | Hero / section / card display headings, large numbers |

Load both from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif&display=swap">
```

### 3.2 Body defaults

```css
body {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.65;
  color: #0A0F1A;            /* ink */
  background: #FFFFFF;        /* surface */
  letter-spacing: -0.005em;
  font-feature-settings: 'cv11', 'ss01', 'ss03', 'cv02';
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

- Always include the OpenType feature settings — they round Inter into its intended shapes.
- `text-wrap: balance` on headings (`h1`–`h4`).
- `text-wrap: pretty` on paragraphs.

### 3.3 Display heading details

```css
.font-display {
  font-family: 'Instrument Serif', 'Inter', serif;
  letter-spacing: -0.012em;
  font-feature-settings: 'liga', 'dlig';
}
```

Use `font-display` on:
- Page-level headlines (the big hero serif).
- Section h2's.
- Big numbers in dashboards / stat cards.
- Large CTA card prompts.

Do not use `font-display` on body, lists, form labels, navigation, or buttons.

### 3.4 Type scale

Mobile-first (rules state mobile size; `md:` is ≥ 768 px; `lg:` is ≥ 1024 px). Sizes given in `px`.

| Role                              | Mobile | sm   | md   | lg   | Notes                                       |
| --------------------------------- | -----: | ---: | ---: | ---: | ------------------------------------------- |
| Hero h1 (display)                 | 40     | 56   | 70   | 78   | line-height 1.06, tracking-tight            |
| Section h2 (display)              | 34     | 44   | 54–56 | 60   | line-height 1.07–1.08                       |
| Sub-headline (display, under h1)  | 22     | 30   | 36   | 40   | 55% of hero scale, line-height 1.2          |
| Card h3 (display)                 | 22     | —    | 28   | 30   | line-height 1.1                             |
| Card title (sans, semibold)       | 16.5   | —    | 17.5 | —    | line-height 1.45                            |
| Body copy                         | 16     | —    | 18–19 | —   | line-height 1.6–1.7                         |
| Card body / supporting copy       | 16     | —    | 15–15.5 | —  | Mobile bumps to 16 for readability          |
| Caption / impact lines            | 13.5–14.5 | — | 15  | —    | italic for emphasised captions              |
| Form labels                       | 13     | —    | 13   | —    | semibold, ink color, mb-2 to input          |
| Eyebrow (uppercase, tracked)      | 12.5   | —    | 13   | —    | tracking 0.22em–0.24em, semibold            |
| UI button text                    | 14.5–16 | —   | 14.5–16 | — | semibold, letter-spacing -0.005em           |
| Dashboard chrome (decorative)     | 12–13.5 | —   | 12–13.5 | — | small UI labels inside mockups              |

### 3.5 Voice guidelines for body copy

- **Declarative, short.** Avoid clauses-within-clauses.
- **Active voice.** "We build the system that solves it." not "A system can be built to solve it."
- **Specific over abstract.** "Three people fill in the same spreadsheet by hand" beats "Manual processes are inefficient."
- **No exclamation marks. No emoji. No all-caps for emphasis** (eyebrows excepted — they're a visual element, not shouting).

---

## 4. Spacing & layout

### 4.1 Scale

Use the standard 4 px scale (`0.25rem` increments). Mental model:

- **2 / 4 / 8 / 12 / 16** for compact UI internals (gaps inside cards, label-to-field).
- **20 / 24 / 32** for component-level breathing.
- **48 / 56 / 64 / 80** for between-component breathing.
- **96–160** for between-section rhythm.

### 4.2 Section rhythm

Sections share a vertical-padding pattern:

```css
/* mobile -> md -> lg */
padding-block: 5.5rem; /* py-22, 88px */
@media (min-width: 768px)  { padding-block: 8rem;  }  /* py-32, 128px */
@media (min-width: 1024px) { padding-block: 9rem;  }  /* py-36, 144px */
```

For lighter sections (final CTA, smaller utility):

```css
padding-block: 6rem;   /* py-24, 96px on mobile */
@media (min-width: 768px)  { padding-block: 8rem;  }
@media (min-width: 1024px) { padding-block: 9rem;  }
```

### 4.3 Container

- Page horizontal padding: `1.25rem` (20 px) on mobile, `2rem` (32 px) at `md`, `3rem` (48 px) at `lg`.
- Section content width: cap at one of these maxes depending on content density:
  - `max-w-7xl` (`80rem` / 1280 px) — most sections (default).
  - `max-w-6xl` (`72rem` / 1152 px) — utility / card lists.
  - `max-w-4xl` (`56rem` / 896 px) — text-heavy CTAs / contact card.
  - `max-w-3xl` (`48rem`) — long-form copy / lead-form wrapper.
  - `max-w-2xl` (`42rem`) — paragraphs under h1/h2.
  - `max-w-prose` (`65ch`) — utility class for narrative copy.

### 4.4 Grids

- Stack everything to a single column on mobile.
- Card grids: `grid-cols-1 md:grid-cols-2` (or `lg:grid-cols-3 / 4` as content allows). Gap is `1.25rem` (20 px) on mobile, `1.5rem`–`1.75rem` at md+.
- 12-col grids reserved for desktop layouts (`lg:grid-cols-12`).

### 4.5 Mobile rules (non-negotiable)

- No horizontal scroll at 375 / 390 / 414 px.
- All tap targets ≥ 44 × 44 px (icon-buttons must reach this with padding; bare text links wrap with `py-3` on touch surfaces).
- Form inputs render at `font-size: 16px` minimum (prevents iOS auto-zoom).
- Apply `overflow-x: hidden` on `html` and `body` as a final guard against decorative blobs / reveal-transform overshoots.

---

## 5. Border radius

| Radius     | px  | Where                                                    |
| ---------- | --: | -------------------------------------------------------- |
| `0.5rem`   | 8   | Small chips, kbd hints, image masks                      |
| `0.625rem` | 10  | Primary buttons (`rounded-lg`)                           |
| `0.75rem`  | 12  | Form fields, secondary buttons (`rounded-xl`)            |
| `1rem`     | 16  | Cards (`rounded-2xl`)                                    |
| `9999px`   | ∞   | Pills, chips, eyebrow dots, circular icon buttons        |

**Don't mix radii.** A card at `rounded-2xl` should host children at `rounded-xl` / `rounded-lg` — never reverse. Avoid `rounded-[26px]` and other custom radii unless every related component matches.

---

## 6. UI components

### 6.1 Eyebrow

The universal section-label / category marker. Used at the top of every section, every card group, and every callout.

```html
<div class="inline-flex items-center gap-2 text-[13px] uppercase
            tracking-[0.22em] text-cyan-brand-deep font-semibold">
  <span class="dot"></span>
  The Cost Of Waiting
</div>
```

```css
.dot {
  width: 6px; height: 6px;
  border-radius: 9999px;
  background: #01DBF1;
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.15);
  display: inline-block;
}
```

Variants:
- Standard: cyan-brand-deep text + cyan dot.
- Warning: red-600 text + red dot (only for genuine warning eyebrows, e.g. "The one that hurts most").
- Neutral: mute-2 text + no dot (form-field labels live here).

Always uppercase, `letter-spacing: 0.22em–0.24em`, `font-weight: 600`.

### 6.2 Buttons

| Variant     | Use                                  | Style                                                                                 |
| ----------- | ------------------------------------ | ------------------------------------------------------------------------------------- |
| Primary     | The main CTA per surface             | `background: #0A0F1A` (ink) · white text · `border-radius: 0.625rem` · `padding: 0.875rem 1.25rem` · `font-weight: 600` · hover lifts `translateY(-1px)` and shifts to `#1F2937` (ink-soft) |
| Secondary   | Adjacent to a primary, lower urgency | `background: #FFFFFF` · 1 px `#E2E8F0` border · ink text · same radius/padding as primary · hover darkens border to `rgba(15,23,42,0.3)` |
| Pill (legacy / hero) | Hero CTAs, in-page anchors  | Same as primary but `border-radius: 9999px` and `padding: 0.875rem 1.5rem` |
| Icon-only   | Burger, close, navigation chevrons   | 44 × 44 circular hit area, no chrome by default, `hover: background rgba(10,15,26,0.05)` |

**Inside buttons:** icon (16–17 px, stroke-width 1.75–2) gap-2 from text. Trailing arrows pick up a `group-hover:translate-x-0.5` motion.

### 6.3 Cards

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;     /* line */
  border-radius: 1rem;            /* 16 px */
  padding: 1.5rem;                /* 24 px on mobile */
}
@media (min-width: 768px) {
  .card { padding: 1.75rem; }     /* 28 px */
}
.card--hover {
  transition: transform 280ms cubic-bezier(0.22,1,0.36,1),
              border-color 280ms ease,
              box-shadow 280ms ease;
}
.card--hover:hover {
  transform: translateY(-2px);
  border-color: rgba(15,23,42,0.18);
  box-shadow:
    0 24px 50px -28px rgba(15,23,42,0.22),
    0 6px 14px -8px rgba(15,23,42,0.08);
}
```

Subtler card shadow for static cards:
```css
box-shadow: 0 24px 60px -36px rgba(15,23,42,0.18),
            0 6px 18px -10px rgba(15,23,42,0.06);
```

### 6.4 Icon chips

Small rounded square (or pill) holding a Lucide icon, used as a row leader inside cards.

```css
.icon-chip {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2.75rem; height: 2.75rem;          /* 44 × 44 */
  border-radius: 0.75rem;                    /* 12 px */
  background: #F6F8FB;                       /* surface-alt */
  color: #00B8CC;                            /* cyan-brand-deep */
  box-shadow: inset 0 0 0 1px rgba(1,219,241,0.18);
}
```

Variants:
- Cyan: cyan-brand-deep fg, cyan/8 bg, cyan/25 ring (positive accent — automation, audit, etc.).
- Warning red: red-600 fg, red-50 bg, red-100 ring (cost-of-waiting symptoms).
- Neutral: ink-soft fg, surface-alt bg, line ring.

### 6.5 Form fields

```css
.form-field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #E2E8F0;
  background: #FFFFFF;
  padding: 0.875rem 1rem;
  font-size: 16px;                /* ≥16 to suppress iOS auto-zoom */
  line-height: 1.4;
  color: #0A0F1A;
  font-family: var(--font-sans);
  transition: border-color 180ms, box-shadow 180ms, background-color 180ms;
}
.form-field::placeholder { color: #64748B; }
.form-field:hover       { border-color: rgba(1,219,241,0.4); }
.form-field:focus       {
  outline: none;
  border-color: #01DBF1;
  box-shadow: 0 0 0 3px rgba(1,219,241,0.22);
}
```

Label sits above field as a `13px` semibold ink span with `mb-2`. Optional indicator: `<span class="text-mute-2 font-normal">(optional)</span>` after the label.

### 6.6 Cyan underline

The signature highlight under the key phrase in a headline. Use **once** per headline (or page), only on the phrase that carries the promise.

```css
.cyan-underline {
  background-image: linear-gradient(
    transparent 62%,
    rgba(1, 219, 241, 0.35) 62%,
    rgba(1, 219, 241, 0.35) 92%,
    transparent 92%
  );
  background-repeat: no-repeat;
}
```

Wrap the phrase only — not the full sentence:

```html
<h1>We build the system that <span class="cyan-underline">solves it.</span></h1>
```

### 6.7 Pills & chips

```css
.pill {
  display: inline-flex; align-items: center;
  border-radius: 9999px;
  border: 1px solid #E2E8F0;
  background: #F6F8FB;
  padding: 0.375rem 0.875rem;       /* 6 × 14 */
  font-size: 13px;
  color: #0A0F1A;
}
```

Used for industry tags, feature lists, and small inline categories.

---

## 7. Iconography

- **Library:** [Lucide](https://lucide.dev) (or any equivalent stroke-icon set with the same visual weight).
- **Sizes:** 13 / 14 px in eyebrows; 16–18 px in buttons and inline UI; 20–24 px in icon chips; 28–32 px in finale / hero icons.
- **Stroke-width:** `1.75` (most contexts) or `2` (when the icon needs to read smaller). Avoid the default `1.5` — it disappears on light backgrounds.
- Use the same icon family across a surface. Don't mix Lucide with another set.

---

## 8. Surfaces & decorative patterns

### 8.1 Grid background (subtle)

For hero / atmospheric sections:

```css
.grid-bg {
  background-image:
    linear-gradient(to right,  rgba(15,23,42,0.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px);
  background-size: 56px 56px;
}
.fade-mask {
  -webkit-mask-image: radial-gradient(ellipse at center, black 55%, transparent 100%);
          mask-image: radial-gradient(ellipse at center, black 55%, transparent 100%);
}
```

Combine `.grid-bg.fade-mask` to get a soft, centre-weighted grid texture. Apply at `position: absolute; inset: 0; pointer-events: none; opacity: 0.4–0.5;` behind content.

### 8.2 Soft cyan halo

One at most per section. Heavy blur, low opacity.

```html
<div class="absolute -top-24 left-1/2 -translate-x-1/2
            h-[260px] w-[520px] rounded-full
            bg-cyan-brand/8 blur-[80px] pointer-events-none"></div>
```

Allowed values: `bg-cyan-brand/8` to `/15`, blur ≥ 80 px. Never higher opacity, never inside a button, never animated rotation.

### 8.3 Banded section background

For sections that need to stand apart from the white default:
```css
background: rgba(246, 248, 251, 0.6);      /* surface-alt at 60% */
border-block: 1px solid rgba(226,232,240,0.7);
```

---

## 9. Motion

### 9.1 Easing

One easing for everything:
```
cubic-bezier(0.22, 1, 0.36, 1)
```

Use it for transforms, opacity, color, shadow. It's "ease-out-expo-like" — fast start, soft landing.

### 9.2 Reveal-on-scroll

Default state:
```css
.reveal {
  opacity: 0;
  transform: translate3d(0, 28px, 0);
  transition:
    opacity   900ms cubic-bezier(0.22,1,0.36,1),
    transform 900ms cubic-bezier(0.22,1,0.36,1),
    filter    900ms cubic-bezier(0.22,1,0.36,1);
  will-change: opacity, transform;
}
.reveal.is-visible {
  opacity: 1;
  transform: translate3d(0,0,0);
  filter: none;
}
```

Variants (drop the Y-translate or add another axis):
- `.reveal-fade`     → no transform (just fade).
- `.reveal-scale`    → starts at `translate3d(0,18px,0) scale(0.965)`.
- `.reveal-left`     → starts at `translate3d(-28px, 0, 0)`.
- `.reveal-right`    → starts at `translate3d(28px, 0, 0)`.
- `.reveal-blur`     → adds `filter: blur(8px)` initially.

Trigger by adding `.is-visible` with an IntersectionObserver (threshold ~0.15). Optionally stagger via `transition-delay` in ms increments of ~70.

### 9.3 Hover transitions

Buttons / cards transition `200–280ms` with the same cubic-bezier. Transforms on hover are subtle — `translateY(-1px)` on buttons, `translateY(-2 to -3px)` on cards. No scale > 1.06.

### 9.4 Reduced motion

Always honour `prefers-reduced-motion: reduce`:
```css
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-fade, .reveal-scale, .reveal-left,
  .reveal-right, .reveal-blur {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    transition: none !important;
  }
  /* Also: disable any pulse, breathe, float, shimmer animation. */
}
```

---

## 10. Patterns / recipes

These are higher-level patterns the site repeats — copy them when a new project needs the same beat.

### 10.1 Section opening

```
<eyebrow>
<display h2>
<paragraph (max-w-2xl, text-mute)>
```

Order, spacing, and type-scale are consistent across `TheProblem`, `TheMeet`, `ThePlan`, `TheWhatWeBuild`, `TheDoNothing`, `TheWhenItWorks`, `TheFinalCta`.

### 10.2 Three-column "what we offer" cards

White card · line border · icon-chip top-left · h3 display title · paragraph body. On md+ goes 2-up; on lg+ 3- or 4-up.

### 10.3 Final CTA card

Single white card, line border, soft cyan halo at the top edge. Eyebrow → display h2 (with `cyan-underline` on the operative phrase) → paragraph → primary + secondary button row → small inline trust-marks (`Free consultation` + `30 min · 1:1`).

### 10.4 Form step / question

Display h1 → optional helper paragraph → vertical stack of option cards. Each option card: number / check chip (left) → label + sub (centre) → trailing arrow (right). Cards animate in with a 60 ms stagger.

### 10.5 Inline calendar + time picker

Two adjacent cards (`grid-cols-1 lg:grid-cols-2`):
- **Calendar:** month label + chevron nav, S M T W T F S header, day grid, past + weekend dates disabled, today gets a ring, selected day uses cyan-brand bg + cyan-brand-deep ring.
- **Time slots:** 30-min increments, 3-col on mobile / 4-col on sm / 3-col on lg, selected pill uses cyan-brand bg.

Both fields stay optional — the form behind them shouldn't depend on date being chosen.

---

## 11. Quick-start CSS variables

Drop this into the project's global stylesheet and most of the brand falls into place:

```css
:root {
  /* Colour */
  --color-cyan-brand: #01DBF1;
  --color-cyan-brand-deep: #00B8CC;
  --color-ink: #0A0F1A;
  --color-ink-soft: #1F2937;
  --color-mute: #475569;
  --color-mute-2: #64748B;
  --color-surface: #FFFFFF;
  --color-surface-alt: #F6F8FB;
  --color-line: #E2E8F0;

  /* Type */
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI',
               Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-display: 'Instrument Serif', 'Inter', serif;

  /* Motion */
  --ease-brand: cubic-bezier(0.22, 1, 0.36, 1);
}

html { overflow-x: hidden; }

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.65;
  color: var(--color-ink);
  background: var(--color-surface);
  letter-spacing: -0.005em;
  font-feature-settings: 'cv11', 'ss01', 'ss03', 'cv02';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}

h1, h2, h3, h4 { text-wrap: balance; }
p              { text-wrap: pretty; }
```

---

## 12. Checklist for "is this on-brand?"

Before shipping a new screen / view / component, run through:

- [ ] Surface is white (or `surface-alt`), not coloured.
- [ ] Exactly one accent colour in use (cyan-brand-deep) — red appears only on real warnings.
- [ ] No gradients on backgrounds, borders, or buttons. (Single radial halo at low opacity is the one exception.)
- [ ] At least one eyebrow + display heading sets up the section.
- [ ] Headings use `font-display` (Instrument Serif) at the section scale; body uses Inter.
- [ ] Body font-size ≥ 16 px on mobile (especially form fields).
- [ ] All interactive elements ≥ 44 × 44 px on mobile.
- [ ] Cards use `rounded-2xl`, buttons use `rounded-lg`, form fields use `rounded-xl`. No oddball custom radii.
- [ ] Hover and focus states defined; focus ring is `0 0 0 3px rgba(1,219,241,0.22)` on inputs and visible on every interactive control.
- [ ] Reveal transitions use the shared easing curve; reduced-motion is respected.
- [ ] Icons are Lucide (or equivalent), stroke-width 1.75–2, consistent across the surface.
- [ ] Copy is short, declarative, no exclamation marks, no emoji.

If all 12 read green, the surface will sit naturally alongside the rest of Zabble.
