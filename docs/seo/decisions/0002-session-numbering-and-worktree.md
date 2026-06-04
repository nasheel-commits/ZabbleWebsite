# 0002 — Keyword session numbering + isolated-worktree working model

- **Status:** accepted
- **Date:** 2026-06-04
- **Author:** S03 (Keyword & Market Research)
- **Affects:** keyword research deliverables; anyone reading `audits/`, `status.md`,
  branch names; all parallel SEO sessions sharing this repo.

## Context

Two facts on the ground diverged from `00-conventions.md`:

1. **Numbering.** The conventions table assigns Keyword & Market Research to **session 05 /
   `seo/05-keywords`**, and ships an `audits/05-keywords.md` skeleton + a `keyword-map.md`
   owned by "S05". This session was, however, commissioned as **session 03 on branch
   `seo/03-keywords`**, with deliverables `audits/03-keywords.md`. In practice the parallel
   run uses ad-hoc per-agent numbering anyway — live branches include `seo/05-onpage`,
   `seo/08-schema`, `seo/07-aeo`, `seo/07-geo`, `seo/09-analytics`, `seo/10-content` — so the
   original table is no longer the source of truth for session numbers.

2. **Shared checkout is unsafe.** Multiple agents operate in the **same working directory**
   and switch branches / run `git clean` in it. Mid-session this deleted a complete set of
   (uncommitted) DataForSEO evidence and moved HEAD onto another session's branch. The repo's
   auto-memory was independently updated to: *"shared checkout is thrashed by parallel
   agents, so use a git worktree."*

3. **Foundation location.** `docs/seo/` (the whole knowledge base) lives only on
   `seo/00-setup`, **not yet on `origin/main`**. Branching keyword work from `origin/main`
   (as conventions §1 says) would lose the foundation.

## Decision

- **Keep the commissioned identity:** this session is **03 / `seo/03-keywords`**; its audit
  is **`audits/03-keywords.md`**, which **supersedes the `audits/05-keywords.md` skeleton**
  for keyword research. The skeleton is left untouched (it is not this session's to edit per
  the write-ownership rule) but should be treated as deprecated.
- **Deliverables stay canonically named** — `targets/keyword-map.md` and
  `targets/intent-clusters.md` carry no session number, so S02/S06/S07/S08/S10 find them
  regardless of numbering. Ownership banner updated to **S03**.
- **Branch from `seo/00-setup`** (which has the foundation), not `origin/main`. Rebase onto
  `main` once S00 merges.
- **Work in an isolated git worktree** at `C:/Users/nashe/zabble-seo-03-keywords` (outside
  OneDrive, mirroring the other disciplined sessions' `C:/Users/nashe/zabble-seo-*`), and
  **commit early + often** so concurrent `git clean`/branch-switching cannot destroy work.

## Consequences

- Two keyword audit files now exist (`03-keywords.md` real, `05-keywords.md` skeleton). The
  real one cross-links and flags the supersession to avoid confusion.
- The `status.md` keyword-research row is updated to signal "ready" with the actual branch
  (`seo/03-keywords`) noted, rather than inventing a new row.
- Evidence and deliverables are safe from the shared-checkout thrash.
- A future cleanup (out of scope here) could reconcile the numbering across all sessions.

## Alternatives considered

- **Obey conventions literally (branch `seo/05-keywords` from `origin/main`):** rejected — it
  contradicts the explicit session goal, and branching from `main` would drop the `docs/seo/`
  foundation that only exists on `seo/00-setup`.
- **Work in the shared checkout:** rejected — demonstrably unsafe (lost evidence mid-run).
