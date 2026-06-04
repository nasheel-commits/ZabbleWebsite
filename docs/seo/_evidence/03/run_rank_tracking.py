#!/usr/bin/env python3
"""Monthly rank-tracking runner for zabble.org (South Africa).

Reads the tracked keyword set from ../../targets/rank-tracking.md (single source of truth),
calls DataForSEO (ranked_keywords + domain_rank_overview + a per-keyword SERP sweep), saves
raw responses under _evidence/03/rank-tracking/<YYYY-MM>/, and PRINTS the results-log row +
per-keyword positions for you to paste into rank-tracking.md §4. It does not commit.

Auth: reads DATAFORSEO_USERNAME / DATAFORSEO_PASSWORD from the environment (load .env first:
  set -a; . ./.env; set +a). No secret is stored in this file.

Usage (from worktree root):  python docs/seo/_evidence/03/run_rank_tracking.py 2026-07
"""
import os, sys, json, re, base64, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]          # worktree root
TRACK_MD = ROOT / "docs/seo/targets/rank-tracking.md"
EVID = ROOT / "docs/seo/_evidence/03"
TARGET = "zabble.org"; LOC = "South Africa"; LANG = "en"
API = "https://api.dataforseo.com"

def auth_header():
    u = os.environ.get("DATAFORSEO_USERNAME"); p = os.environ.get("DATAFORSEO_PASSWORD")
    if not u or not p:
        sys.exit("ERROR: load .env first (set -a; . ./.env; set +a) — DATAFORSEO_USERNAME/PASSWORD not in env.")
    return "Basic " + base64.b64encode(f"{u}:{p}".encode()).decode()

def post(path, body, hdr):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode(),
        headers={"Authorization": hdr, "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())

def get(path, hdr):
    req = urllib.request.Request(API + path, headers={"Authorization": hdr})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

def tracked_keywords():
    txt = TRACK_MD.read_text(encoding="utf-8")
    block = txt.split("<!-- TRACKED -->")[1].split("<!-- /TRACKED -->")[0]
    kws = []
    for line in block.splitlines():
        m = re.match(r"\|\s*\d+\s*\|\s*([^|]+?)\s*\|", line)
        if m: kws.append(m.group(1).strip())
    return kws

def slug(k): return re.sub(r"[^a-z0-9]+", "-", k.lower()).strip("-")[:48]

def main():
    month = sys.argv[1] if len(sys.argv) > 1 else time.strftime("%Y-%m")
    hdr = auth_header()
    outdir = EVID / "rank-tracking" / month; outdir.mkdir(parents=True, exist_ok=True)
    # A. balance
    bal = get("/v3/appendix/user_data", hdr)["tasks"][0]["result"][0]["money"]["balance"]
    print(f"[balance] ${bal}")
    # B. domain visibility
    rk = post("/v3/dataforseo_labs/google/ranked_keywords/live",
        [{"target": TARGET, "location_name": LOC, "language_code": LANG, "limit": 200,
          "order_by": ["ranked_serp_element.serp_item.rank_group,asc"]}], hdr)
    (outdir / "ranked-keywords__zabble-org__za.json").write_text(json.dumps(rk, indent=1))
    dro = post("/v3/dataforseo_labs/google/domain_rank_overview/live",
        [{"target": TARGET, "location_name": LOC, "language_code": LANG}], hdr)
    (outdir / "domain-rank-overview__zabble-org__za.json").write_text(json.dumps(dro, indent=1))
    r0 = (rk["tasks"][0].get("result") or [{}])[0]
    ranked = r0.get("items") or []
    n_ranked = r0.get("total_count") or len(ranked)
    def pos(it): return (((it.get("ranked_serp_element") or {}).get("serp_item") or {}).get("rank_group"))
    top10 = sum(1 for it in ranked if (pos(it) or 99) <= 10)
    top3 = sum(1 for it in ranked if (pos(it) or 99) <= 3)
    dro0 = (dro["tasks"][0].get("result") or [{}])[0]
    metrics = ((dro0.get("items") or [{}])[0].get("metrics") if dro0.get("items") else None) or {}
    etv = (metrics.get("organic") or {}).get("etv") if metrics else None
    # C. per-keyword SERP sweep
    positions = {}; features = {}; tracked_top10 = 0
    for kw in tracked_keywords():
        resp = post("/v3/serp/google/organic/live/advanced",
            [{"keyword": kw, "location_name": LOC, "language_code": LANG, "depth": 30}], hdr)
        (outdir / f"serp__{slug(kw)}__za.json").write_text(json.dumps(resp, indent=1))
        items = ((resp["tasks"][0].get("result") or [{}])[0].get("items")) or []
        rank = None; feats = []
        for it in items:
            t = it.get("type")
            if t == "ai_overview" and "AIO" not in feats: feats.append("AIO")
            if t == "people_also_ask" and "PAA" not in feats: feats.append("PAA")
            if t == "featured_snippet" and "FS" not in feats: feats.append("FS")
            if t == "local_pack" and "Local" not in feats: feats.append("Local")
            if t == "organic" and rank is None:
                dom = (it.get("domain") or "")
                if "zabble.org" in dom: rank = it.get("rank_group")
        positions[kw] = rank; features[kw] = ",".join(feats) or "-"
        if rank and rank <= 10: tracked_top10 += 1
    # print log row
    print("\n=== paste into rank-tracking.md §4 (results log) ===")
    print(f"| {month} | {n_ranked} | {etv if etv is not None else 0} | {top10} | {top3} | "
          f"{tracked_top10} / {len(positions)} | (see per-kw) | _evidence/03/rank-tracking/{month}/ |")
    print("\n=== per-keyword positions (— = not in top 30) ===")
    for kw, p in positions.items():
        print(f"  {p if p else '—':>3}  [{features[kw]:<12}]  {kw}")

if __name__ == "__main__":
    main()
