#!/usr/bin/env python3
import json, collections
base="docs/seo/_evidence/03/"
rows=json.load(open(base+"consolidated.json"))
serp={
 "crm software south africa":"AIO, PAA",
 "custom software development south africa":"AIO, LocalPack",
 "business process automation":"AIO, PAA",
 "what is popia":"AIO, PAA, Video",
 "what is crm software":"AIO, PAA, Video",
 "inventory management software":"PAA, Video",
 "accounting software south africa":"AIO, PAA, Video",
 "fraud detection software":"AIO, PAA",
 "who builds custom software in south africa":"AIO, PAA, LocalPack",
 "popia compliance":"AIO, PAA",
}
UBER=["crm software south africa","inventory management software","accounting software south africa",
 "popia compliance","software development company south africa","custom software development south africa",
 "business process automation","fraud detection software",
 "who builds custom software in south africa","what is popia"]
def tier(r):
    if r['keyword'] in UBER: return "U"
    if r['owner']=='brand': return "Brand"
    if r['cluster']=='aeo-questions' or r['type']=='question': return "AEO"
    sc=r['score']
    if sc>=38: return "P0"
    if sc>=24: return "P1"
    if (r['vol'] or 0)>0: return "P2"
    return "P3"
for r in rows: r['tier']=tier(r)
def fmt(r):
    vol=r['vol'] if r['vol'] is not None else "n/d"
    kd=r['kd'] if r['kd'] is not None else "n/d"
    cpc=("$%.2f"%r['cpc']) if r['cpc'] is not None else "-"
    sf=serp.get(r['keyword'],"—")
    return "| %s | %s | %s | %s | %s | %s | %s | %s | %s | **%s** |"%(
        r['keyword'], r['cluster'], r['intent'] or '-', r['funnel'], vol, kd, cpc, sf, r['page'], r['tier'])
HDR="| Keyword | Cluster | Intent | Funnel | Vol (ZA/mo) | KD | CPC | SERP features | Target page | Tier |\n|---|---|---|---|---|---|---|---|---|---|"
groups=[("Brand / entity (navigational → GEO)","brand"),("Core offering / homepage","core"),
        ("Pillar hubs","pillar"),("Module money pages (`/systems/<slug>`)","module"),
        ("Industry use-case pages","industry"),("AEO / GEO question intent","aeo")]
frag=[]
for title,key in groups:
    if key=="module":
        sub=[r for r in rows if r['cluster'].startswith('module-')]; sub.sort(key=lambda r:(r['owner'],-(r['score'])))
    elif key in ("pillar","industry","aeo"):
        sub=[r for r in rows if r['cluster'].startswith(key) or (key=='aeo' and r['cluster']=='aeo-questions')]; sub.sort(key=lambda r:-(r['score']))
    else:
        sub=[r for r in rows if r['owner']==key or r['cluster']==key]; sub.sort(key=lambda r:-(r['score']))
    frag.append("\n### "+title+" — %d keywords\n"%len(sub)); frag.append(HDR)
    for r in sub: frag.append(fmt(r))
open(base+"_map_table.md","w",encoding="utf-8").write("\n".join(frag))
json.dump(rows, open(base+"consolidated.json","w"), indent=2)
tc=collections.Counter(r['tier'] for r in rows)
print("tiers:",dict(tc))
print("\nUBER:")
for kw in UBER:
    r=next(x for x in rows if x['keyword']==kw)
    print("  %-44s vol=%-5s kd=%-5s cpc=%-6s %-13s score=%s"%(kw,r['vol'],r['kd'],r['cpc'],r['intent'],r['score']))
