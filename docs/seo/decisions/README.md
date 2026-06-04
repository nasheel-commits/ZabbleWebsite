# decisions/ — Architecture/Approach Decision Records (ADRs)

Cross-cutting decisions that affect more than one session, recorded so the
reasoning survives and the 10 sessions stay aligned. If you make a choice another
session must live with (a module to adopt, a URL pattern, a schema convention,
the analytics tool), write an ADR.

## When to write one
- The decision affects ≥2 sessions or the shared foundation.
- You're overriding a convention, or resolving a conflict between sessions.
- Someone later will ask "why did we do it this way?".

Small, single-session choices stay in that session's audit — not here.

## Process
1. Copy the template below to `decisions/NNNN-short-slug.md` (next number).
2. Fill it in; set status `proposed`.
3. The **S00 owner reviews**; on agreement, status → `accepted` and it's binding.
4. Superseding a past decision: new ADR, link back, mark the old one `superseded`.

## Index
| # | Title | Status | Date |
|---|-------|--------|------|
| [0001](0001-mcp-transport-and-secrets.md) | DataForSEO MCP transport + secrets handling | accepted | 2026-06-04 |

---

## Template

```markdown
# NNNN — <Title>

- **Status:** proposed | accepted | superseded by [NNNN](...)
- **Date:** YYYY-MM-DD
- **Author:** <session/owner>
- **Affects:** <session numbers>

## Context
What's the situation and the forces at play? What constraint or conflict prompted this?

## Decision
What we're doing, stated plainly.

## Consequences
What this makes easy, what it makes harder, and what each affected session must do.

## Alternatives considered
What else we weighed and why we rejected it.
```
