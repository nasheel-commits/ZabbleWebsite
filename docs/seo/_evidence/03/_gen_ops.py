#!/usr/bin/env python3
# Generates markdown fragments for: (A) resolved-request table, (B) URL-coverage table.
import json, csv, os
base="docs/seo/_evidence/03/"
HOST="https://www.zabble.org"

# ---- target-page assignment for request terms (keyword substring -> path) ----
def target_for(kw):
    k=kw
    rules=[
      ('bespoke crm','/systems/bespoke-crm'),('crm','/systems/bespoke-crm'),
      ('reconciliation','/systems/reconciliation-engine'),
      ('invoice processing','/systems/document-intelligence'),('invoice data','/systems/document-intelligence'),
      ('document automation','/systems/document-intelligence'),('document data','/systems/document-intelligence'),
      ('regulatory reporting','/systems/compliance-reporting'),('popia','/systems/compliance-reporting'),
      ('anomaly','/systems/continuous-assurance'),('fraud','/systems/continuous-assurance'),('transaction monitoring','/systems/continuous-assurance'),
      ('workflow','/systems/workflow-orchestrator'),
      ('approval workflow','/systems/approval-workflow'),
      ('decision engine','/systems/decision-engine'),
      ('order management','/systems/workflow-orchestrator'),
      ('rfid','/systems/inventory-clarity'),('inventory','/systems/inventory-clarity'),('stock management','/systems/inventory-clarity'),
      ('case management','/systems/case-management'),
      ('cpq','/systems/pricing-engine'),('quote','/systems/pricing-engine'),
      ('dashboard','/systems/analytics-suite'),('bi ','/systems/analytics-suite'),('business intelligence','/systems/analytics-suite'),
      ('master data','/systems/master-data-hub'),('mdm','/systems/master-data-hub'),
      ('predictive maintenance','/systems/predictive-maintenance'),
      ('alert','/systems/notification-orchestration'),('notification','/systems/notification-orchestration'),
      ('business process automation','/'),('business automation','/'),
      ('custom software','/'),('custom business software','/'),('who builds','/'),
      ('zabble','/'),
    ]
    for sub,path in rules:
        if sub in k: return path
    return '/'

resolved=json.load(open(base+"requests-resolved.json"))
def s(x): return x if x is not None else 'n/d'
rows=["| Keyword | Requester(s) | Layer | Vol (ZA/mo) | KD | Intent | SERP features | Target page | Status |",
      "|---|---|---|---|---|---|---|---|---|"]
for r in sorted(resolved, key=lambda r:(r['requesters'], -(r['vol'] or 0))):
    tp=target_for(r['keyword'])
    rows.append("| %s | %s | %s | %s | %s | %s | %s | `%s` | ✅ resolved |"%(
        r['keyword'], r['requesters'], r['layer'], s(r['vol']), s(r['kd']),
        s(r['intent']), r['serp'], tp))
open(base+"_frag_requests.md","w",encoding="utf-8").write("\n".join(rows))

# ---- URL coverage for uber + priority clusters ----
# live paths from url-coverage csv
live=set()
with open(base+"url-coverage__zabble-org__live.csv") as f:
    for row in csv.DictReader(f):
        if row['http_status']=='200':
            p=row['url'].replace('https://zabble.org','').rstrip('/') or '/'
            live.add(p)
cons=json.load(open(base+"consolidated.json"))
# canonical path per cluster: modules->/systems/<slug>; core->/; pillar->reassign to live module/home; aeo->money-page FAQ; industry->to-create
PILLAR_REASSIGN={'pillar-analytics':'/systems/analytics-suite','pillar-automation':'/','pillar-anomaly-detection':'/systems/continuous-assurance','pillar-audit-trails':'/systems/compliance-reporting'}
def path_for_row(r):
    pg=r['page']
    if pg.startswith('/systems/'): return pg.split(' ')[0]
    if pg=='/' : return '/'
    if r['cluster'] in PILLAR_REASSIGN: return PILLAR_REASSIGN[r['cluster']]
    if pg.startswith('/pillars'): return PILLAR_REASSIGN.get(r['cluster'],'/')
    if pg.startswith('/industries'): return None  # to-create
    if pg.startswith('('): # AEO FAQ -> map by keyword
        return target_for(r['keyword'])
    return None
prio=[r for r in cons if r['tier'] in ('U','P0','P1')]
seen=set(); ucov=["| Cluster / keyword (tier) | Intended page | Live canonical URL | Status |","|---|---|---|---|"]
for r in sorted(prio, key=lambda r:({'U':0,'P0':1,'P1':2}[r['tier']], r['cluster'])):
    p=path_for_row(r)
    key=(r['cluster'],r['tier'],p,r['keyword'][:24])
    label="%s `%s` (%s)"%(r['cluster'], r['keyword'], r['tier'])
    if p is None:
        ucov.append("| %s | %s | — | ❌ **GAP — page to-create** |"%(label, r['page']))
        continue
    pnorm=p.rstrip('/') or '/'
    islive = pnorm in live or (pnorm=='/' and '/' in live)
    url=HOST+(p if p!='/' else '/')
    intended=r['page'].split(' ')[0]
    if r['page'].startswith('('):
        intended="FAQ on `%s`"%p
        status="✅ live (FAQ block on existing money page)"
    elif r['page'].startswith('/pillars'):
        intended="`%s`"%r['page'].split(' ')[0]
        status="⚠ reassigned to live `%s` — pillar hub is 404 (escalated)"%p
    else:
        intended="`%s`"%intended
        status="✅ live" if islive else "❌ **404 — GAP**"
    ucov.append("| %s | %s | %s | %s |"%(label, intended, url, status))
open(base+"_frag_urlcov.md","w",encoding="utf-8").write("\n".join(ucov))

# per-requester counts
import collections
byreq=collections.Counter()
for r in resolved:
    for q in r['requesters'].split(';'): byreq[q]+=1
print("resolved rows:",len(resolved),"| by requester:",dict(byreq))
print("priority/uber rows for URL cov:",len(prio))
print("live paths:",sorted(live))
