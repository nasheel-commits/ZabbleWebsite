# Anchor-Text Guidance (owned by S04)

For a **new domain**, over-optimised exact-match anchors are the main penalty risk.
Control the anchors you can influence (profiles, partners, guest posts, directory
listings) toward this distribution; let editorial links fall naturally. Re-balance
against real data once the Backlinks subscription (B5) is active.

## Target distribution

| Anchor type | Target share | Examples |
|-------------|-------------:|----------|
| Branded | ~50% | "Zabble", "Zabble.org", "Zabble (Pty) Ltd" |
| Naked URL | ~20% | "zabble.org", "https://zabble.org" |
| Generic | ~15% | "this reference", "here", "their platform", "read more" |
| Partial-match | ~10% | "bespoke operational systems", "Zabble's automation work" |
| Exact-match | **≤5%** | "custom software south africa" — sparingly, only on highly relevant editorial pages |

## Rules

1. **Default to branded.** When in doubt, anchor with the brand name.
2. **Never request exact-match** in outreach. If a journalist links naturally with a
   keyword anchor, that's fine — earned, not engineered.
3. **Match anchor to destination.** A link about the landscape asset anchors to the
   asset, not the homepage; a city mention anchors to the city page.
4. **One exact-match per ~20 links, maximum**, and only on a genuinely topical page.
5. **Directory/citation anchors are branded** by nature — keep them so (consistent
   NAP name string from `app/data/nap.ts`).
6. **Log the anchor in `tracker.csv` before sending**, so the running distribution
   stays visible and within target.

## Monitoring (once B5 is active)

Pull `backlinks/anchors` for zabble.org monthly; compare the live distribution to the
table above; if exact-match drifts above ~5%, pause keyword anchors and add branded/
naked links until it normalises.
