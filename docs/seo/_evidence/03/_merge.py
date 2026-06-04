#!/usr/bin/env python3
import json, math
base="docs/seo/_evidence/03/"
curated=json.load(open(base+"curated-keywords.json"))
meta={e["keyword"]:e for e in curated}
g=json.load(open(base+"gads-search-volume__curated__za.json"))
vol={it['keyword']:{"vol":it.get('search_volume'),"cpc":it.get('cpc'),"comp":it.get('competition'),"comp_idx":it.get('competition_index')} for it in g['tasks'][0]['result']}
b=json.load(open(base+"labs-bulk-kd__curated__za.json"))
kd={it['keyword']:it.get('keyword_difficulty') for it in b['tasks'][0]['result'][0]['items']}
s=json.load(open(base+"labs-search-intent__curated__za.json"))
intent={it['keyword']:((it.get('keyword_intent') or {}).get('label')) for it in s['tasks'][0]['result'][0]['items']}

def funnel(r):
    it=(r.get('intent') or '').lower(); t=r['type']
    if r['owner']=='brand': return 'bottom (brand)'
    if t=='question' or it=='informational': return 'top (awareness)'
    if it=='commercial': return 'middle (consideration)'
    if it in ('transactional','navigational'): return 'bottom (decision)'
    return 'middle (consideration)'

def score(r):
    vol=r['vol'] or 0
    v=min(math.log10(vol+1)/math.log10(1000),1.2)
    it=(r.get('intent') or '').lower()
    intent_fit={'commercial':1.0,'transactional':1.0,'navigational':0.6,'informational':0.55}.get(it,0.6)
    kd=r['kd'] if r['kd'] is not None else 35
    diff=1-(kd/100.0)
    grp=r['owner'] if r['owner'] in ('core','brand') else r['cluster'].split('-')[0]
    bf={'core':1.0,'module':0.95,'brand':1.0,'pillar':0.8,'industry':0.85,'aeo':0.7}.get(grp,0.8)
    return round(100*v*intent_fit*diff*bf,1)

rows=[]
for kw,m in meta.items():
    v=vol.get(kw,{})
    r={**m,"vol":v.get('vol'),"cpc":v.get('cpc'),"comp":v.get('comp'),"comp_idx":v.get('comp_idx'),"kd":kd.get(kw),"intent":intent.get(kw)}
    r['funnel']=funnel(r); r['score']=score(r); rows.append(r)
rows.sort(key=lambda r:(-(r['score']),-(r['vol'] or 0)))
json.dump(rows, open(base+"consolidated.json","w"), indent=2)
nz=sum(1 for r in rows if (r['vol'] or 0)>0)
print("rows",len(rows),"measurable vol",nz,"zero/none",len(rows)-nz)
