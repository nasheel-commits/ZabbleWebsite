#!/usr/bin/env python3
"""Validator for targets/keyword-map.md  (S03 keyword research, Zabble).

Asserts the map is a complete, sourced, operational source of truth:
  1. all required sections present (uber, scoring, full map, resolved requests, URL coverage, baseline);
  2. the §4 full-map table has the exact expected column schema, and every row is well-formed;
  3. every PRIORITY row (tier U/P0/P1) has a target page (URL/path) + a populated, sourced metric
     (volume or KD, numeric or the explicit sourced value `n/d`) — no blanks/TBD;
  4. the document is dated and names its metric sources (google_ads + bulk_keyword_difficulty
     + search_intent), so every metric is attributable;
  5. §6.1 resolved-request rows are all marked resolved;
  6. priority rows whose target is a /systems/* or / page resolve to a URL confirmed LIVE (200)
     in _evidence/03/url-coverage__zabble-org__live.csv (pillar/industry/FAQ targets are allowed
     as escalated gaps).
Exit 0 = pass, 1 = fail (problems listed). Run: python docs/seo/_evidence/03/validate_keyword_map.py
"""
import re, sys, csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
MAP = ROOT / "docs/seo/targets/keyword-map.md"
CSV = ROOT / "docs/seo/_evidence/03/url-coverage__zabble-org__live.csv"
EXPECT_COLS = ["Keyword","Cluster","Intent","Funnel","Vol (ZA/mo)","KD","CPC","SERP features","Target page","Tier"]
PRIORITY = {"U","P0","P1"}
VALID_TIERS = {"U","P0","P1","P2","P3","AEO","Brand"}
problems = []; checks = 0
def ok(cond, msg):
    global checks; checks += 1
    if not cond: problems.append(msg)

txt = MAP.read_text(encoding="utf-8")

# 1. required sections
for needle in ['## 2. The "uber" priority set', "## 3. Scoring method",
               "## 4. The full map", "## 6. Cross-session requests — RESOLVED",
               "### 6.1 Resolved-request detail", "## 7. URL coverage",
               "## 8. Live rank baseline"]:
    ok(needle in txt, f"MISSING SECTION: {needle!r}")

# 4. dated + metric sources
ok(re.search(r"2026-06-04", txt) is not None, "no capture/update date (2026-06-04) in doc")
for src in ["google_ads/search_volume", "bulk_keyword_difficulty", "search_intent"]:
    ok(src in txt, f"metric-source not documented: {src}")

# isolate §4 full-map block
def section(title_start, title_end):
    a = txt.index(title_start)
    b = txt.index(title_end, a)
    return txt[a:b]
full = section("## 4. The full map", "## 5. Coverage check")

# verify the column header schema appears and matches
hdr_line = "| " + " | ".join(EXPECT_COLS) + " |"
ok(hdr_line in full, "§4 table header does not match expected 10-column schema")

# parse data rows (lines with 10 pipe-delimited cells that are not header/separator)
rows = []
for line in full.splitlines():
    if not line.startswith("|"): continue
    if "---" in line: continue
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    if len(cells) != 10:
        # any 10-ish row that isn't 10 cols is a schema break (ignore the header rows)
        if line.strip().startswith("| Keyword |"): continue
        ok(False, f"§4 row has {len(cells)} cells (expected 10): {line[:60]}...")
        continue
    if cells[0] == "Keyword": continue   # repeated header
    rows.append(cells)

ok(len(rows) >= 200, f"§4 has only {len(rows)} data rows (expected ~213)")

# live URL set from coverage csv
live = set()
if CSV.exists():
    with open(CSV, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["http_status"] == "200":
                p = r["url"].replace("https://zabble.org","").rstrip("/") or "/"
                live.add(p)
else:
    ok(False, "url-coverage csv missing")

n_priority = 0
for cells in rows:
    kw, cluster, intent, funnel, vol, kd, cpc, serp, target, tier = cells
    tier = tier.replace("*","").strip()
    ok(kw != "", "row with empty keyword")
    ok(tier in VALID_TIERS, f"invalid tier {tier!r} for {kw!r}")
    if tier in PRIORITY:
        n_priority += 1
        # target present & path-like
        ok(target not in ("","—","-"), f"PRIORITY {kw!r} ({tier}) has no target page")
        ok(target.startswith("/") or target.startswith("("),
           f"PRIORITY {kw!r} target not a path: {target!r}")
        # sourced metric: vol or kd populated (numeric or explicit n/d), never blank/TBD
        def sourced(v): return v not in ("","TBD","?","—")
        ok(sourced(vol) and sourced(kd),
           f"PRIORITY {kw!r} missing sourced metric (vol={vol!r}, kd={kd!r})")
        ok(re.fullmatch(r"(\d+|n/d)", vol) is not None,
           f"PRIORITY {kw!r} vol not numeric/n-d: {vol!r}")
        # live-URL check for / and /systems targets
        path = target.split(" ")[0]
        if path == "/" or path.startswith("/systems/"):
            pn = path.rstrip("/") or "/"
            ok(pn in live, f"PRIORITY {kw!r} target {path} not LIVE (200) in coverage csv")

ok(n_priority >= 30, f"only {n_priority} priority rows found (expected 35+)")

# 5. resolved-request table: every row resolved
rq = section("### 6.1 Resolved-request detail", "### 6.2")
rq_rows = [l for l in rq.splitlines() if l.startswith("|") and "---" not in l and not l.startswith("| Keyword")]
ok(len(rq_rows) >= 40, f"§6.1 has {len(rq_rows)} rows (expected ~43)")
for l in rq_rows:
    ok("resolved" in l.lower(), f"§6.1 row not marked resolved: {l[:50]}...")

# report
print(f"keyword-map.md validator — {checks} checks, {len(rows)} map rows, {n_priority} priority rows, {len(rq_rows)} resolved-request rows")
if problems:
    print(f"\nFAIL — {len(problems)} problem(s):")
    for p in problems: print("  - " + p)
    sys.exit(1)
print("PASS ✓  all schema, priority-coverage, sourcing, date, and live-URL checks passed.")
sys.exit(0)
