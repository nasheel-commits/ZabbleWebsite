# 0002 — AI crawler policy (search/inference vs training bots)

- **Status:** accepted
- **Date:** 2026-06-04
- **Author:** S07-geo (GEO)
- **Affects:** S01 (owns `public/robots.txt` + the pre-launch indexing guard), S10
  (measurement), and the whole GEO program.

## Context
Zabble's GEO goal is to be **cited and recommended by generative engines** (Google
AI Overviews / AI Mode, ChatGPT, Perplexity, Gemini, Copilot, Claude). A site can
only be cited by an engine it lets crawl. Three classes of automated agent matter,
and they are not the same decision:

1. **AI search / inference / retrieval bots** — fetch pages to ground a *live*
   answer and cite the source (OAI-SearchBot, ChatGPT-User, PerplexityBot,
   Perplexity-User, Claude-SearchBot, Claude-User, Applebot-Extended). Blocking
   these directly removes Zabble from the answers we are trying to win.
2. **AI training crawlers** — collect content that may be used to *train* future
   models (GPTBot, ClaudeBot, CCBot/Common Crawl, Google-Extended). They do not
   cite in real time; their payoff is that a future model "knows" the entity.
3. **General search crawlers** — Googlebot, Bingbot. Googlebot also renders
   **Google AI Overviews**; Bing's index feeds **Copilot**. These were never in
   question — allow.

Two facts from the baseline (`audits/07-geo.md`) sharpen the decision:
- Generative engines currently **do not cite Zabble at all** (share-of-voice 0%),
  and **conflate the "Zabble" entity with a US company** (Zabble, Inc., zero-waste
  SaaS). Zabble is an *unknown* entity, not an over-exposed one.
- The current `public/robots.txt` is `User-agent: * / Disallow:` — i.e. it already
  allows everything, including every AI bot. The risk is **regression**, not the
  status quo: a careless future edit (or a blanket pre-launch `Disallow: /`) would
  silently cut off the engines.

## Decision
1. **ALLOW all AI search / inference / retrieval bots** (class 1). Non-negotiable —
   these are the GEO surface.
2. **ALLOW AI training crawlers** (class 2) — a *deliberate* choice. For an unknown,
   pre-launch entity whose entire objective is awareness and citability, presence
   in training corpora is corroboration, not leakage. The marketing site contains
   no proprietary or sensitive content; there is nothing to protect and everything
   to gain from models learning "Zabble = South African bespoke-systems firm". We
   revisit this only if/when (a) the entity is well-established and (b) there is a
   concrete reason to withhold training access. Default until then: **allow**.
3. **ALLOW Googlebot/Bingbot** (class 3). Note: AI Overviews cannot be opted out of
   separately from Google Search (same Googlebot); `Google-Extended` controls only
   Gemini/Vertex grounding+training, which we also allow.
4. **Make the policy explicit in `robots.txt`**, not merely implicit in
   `Disallow:`. List the key AI user-agents with `Allow: /` so the intent survives
   future edits, and so the pre-launch indexing guard (S01, blocker B3) is written
   to **exclude production AI bots from any `noindex`/`Disallow`**.
5. **Pre-launch caveat:** if S01 keeps a `noindex` until launch, that is a Search
   decision; it does not require blocking AI crawlers in `robots.txt`. Keep
   `robots.txt` welcoming; gate indexing via the meta-robots/staging guard instead,
   so the AI-crawler posture is decoupled from the launch flag.

## Recommended `robots.txt` (handed to S01 — S01 owns the file)
```
# Zabble robots policy — GEO-aligned. AI search, inference, and training crawlers
# are explicitly welcome (we want to be cited by generative engines).
# Rationale: docs/seo/decisions/0002-ai-crawler-policy.md  ·  Owner: S01

User-agent: *
Allow: /

# AI search / inference / retrieval (ALLOW — these drive GEO citations)
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

# AI training crawlers (ALLOW — deliberate; see ADR-0002)
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: CCBot
Allow: /

Sitemap: https://zabble.org/sitemap.xml
```
(The `Allow: /` stanzas are declarative — they encode the deliberate decision and
guard against a future blanket block. `Sitemap:` depends on S01's sitemap wiring;
drop the line until the sitemap exists. `/llms.txt` and `/llms-full.txt` are public
and covered by the default allow.)

## Consequences
- **Easy:** every engine we measure can reach every page; `robots.txt` documents a
  deliberate, defensible posture rather than an accidental allow.
- **Watch:** if Zabble ever publishes gated/sensitive content, class 2 (training)
  should be re-decided per-path, not globally. Re-open this ADR rather than editing
  `robots.txt` ad hoc.
- **Dependency:** S01 must ensure the pre-launch indexing guard does not regress
  this (mirror logged in `status.md`).
