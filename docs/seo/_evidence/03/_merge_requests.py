#!/usr/bin/env python3
import json, glob, re, os
base="docs/seo/_evidence/03/"
R=json.load(open(base+"requests-keywords.json"))
meta={e["keyword"]:e for e in R}
g=json.load(open(base+"gads-search-volume__requests__za.json"))
vol={it['keyword']:{"vol":it.get('search_volume'),"cpc":it.get('cpc'),"comp":it.get('competition'),"ci":it.get('competition_index')} for it in g['tasks'][0]['result']}
b=json.load(open(base+"labs-bulk-kd__requests__za.json"))
kd={it['keyword']:it.get('keyword_difficulty') for it in b['tasks'][0]['result'][0]['items']}
s=json.load(open(base+"labs-search-intent__requests__za.json"))
intent={it['keyword']:((it.get('keyword_intent') or {}).get('label')) for it in s['tasks'][0]['result'][0]['items']}

# SERP features per request term
def slugify(k): return re.sub(r'[^a-z0-9]+','-',k).strip('-')[:48]
serpfeat={}; paa={}
for e in R:
    if not e['serp']: continue
    f=base+"serp-advanced__req-%s__za.json"%slugify(e['keyword'])
    if not os.path.exists(f): continue
    d=json.load(open(f)); r=(d['tasks'][0].get('result') or [{}])[0]; items=r.get('items') or []
    types={}
    qs=[]
    for it in items:
        types[it.get('type')]=types.get(it.get('type'),0)+1
        if it.get('type')=='people_also_ask':
            for el in (it.get('items') or []):
                q=el.get('title') or el.get('question')
                if q: qs.append(q)
    feat=[]
    if 'ai_overview' in types: feat.append('AIO')
    if 'people_also_ask' in types: feat.append('PAA')
    if 'featured_snippet' in types: feat.append('FeatSnip')
    if 'local_pack' in types: feat.append('LocalPack')
    if 'video' in types: feat.append('Video')
    serpfeat[e['keyword']]=', '.join(feat) or '(none)'
    paa[e['keyword']]=qs

rows=[]
for kw,m in meta.items():
    v=vol.get(kw,{})
    rows.append({"keyword":kw,"requesters":m['requesters'],"layer":m['layer'],
        "vol":v.get('vol'),"cpc":v.get('cpc'),"comp":v.get('comp'),"kd":kd.get(kw),
        "intent":intent.get(kw),"serp":serpfeat.get(kw,'—'),"paa":paa.get(kw,[])})
json.dump(rows, open(base+"requests-resolved.json","w"), indent=2)

def s(x): return x if x is not None else 'n/d'
print("%-46s %-10s %5s %4s %-13s %s"%("keyword","req","vol","kd","intent","serp"))
for r in sorted(rows, key=lambda r:-(r['vol'] or 0)):
    print("%-46s %-10s %5s %4s %-13s %s"%(r['keyword'][:46], r['requesters'][:10], s(r['vol']), s(r['kd']), s(r['intent'])[:13], r['serp']))
print("\nTotal requests resolved:", len(rows))
