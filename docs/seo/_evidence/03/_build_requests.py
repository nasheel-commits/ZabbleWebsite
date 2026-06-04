#!/usr/bin/env python3
# Union of all open research requests harvested from sibling branches' keyword-map.md §4
# (S07-aeo, S07-geo, S06/S10-content), 2026-06-04. Each tagged with requester + layer.
import json, os
base="docs/seo/_evidence/03/"
os.makedirs(base, exist_ok=True)
# (keyword, requesters, layer, serp_check)
R = [
 # --- S07-aeo: AEO question set (volume + KD) ---
 ("what is a bespoke crm","S07-aeo","AEO",True),
 ("how much does a bespoke crm cost","S07-aeo","AEO",True),
 ("document automation south africa","S07-aeo","AEO/SEO",True),
 ("how to automate invoice processing","S07-aeo","AEO",True),
 ("how to automate bank reconciliation","S07-aeo","AEO",True),
 ("what is reconciliation in accounting","S07-aeo","AEO",False),
 ("what is anomaly detection","S07-aeo","AEO",False),
 ("what is workflow automation","S07-aeo","AEO",False),
 ("regulatory reporting software south africa","S07-aeo","SEO",True),
 ("who builds custom software in south africa","S07-aeo;S07-geo","GEO/SEO",True),
 ("custom software development south africa","S07-aeo","SEO",False),
 # --- S07-geo: GEO entity/question targets ---
 ("who builds custom business software in south africa","S07-geo","GEO/SEO",True),
 ("business process automation south africa","S07-geo","SEO/GEO",True),
 ("bespoke crm south africa","S07-geo","SEO",True),
 ("business automation company south africa","S07-geo","SEO/GEO",True),
 ("transaction fraud detection south africa","S07-geo","AEO/GEO",True),
 ("fraud detection south africa","S07-geo","SEO",True),
 ("zabble","S07-geo","GEO/brand",True),
 # --- S06/S10-content: Wave 2/3 verification ---
 ("approval workflow software","S06","SEO",True),
 ("decision engine software","S06","SEO",True),
 ("order management automation","S06","SEO",True),
 ("order management software","S06","SEO",False),
 ("rfid inventory tracking","S06","SEO",True),
 ("rfid inventory management","S06","SEO",False),
 ("case management software","S06","SEO",True),
 ("legal case management software south africa","S06","SEO",False),
 ("cpq software","S06","SEO",True),
 ("quote automation software","S06","SEO",True),
 ("quote automation","S06","SEO",False),
 ("role based dashboard","S06","SEO",False),
 ("bi dashboard south africa","S06","SEO",True),
 ("business intelligence dashboard south africa","S06","SEO",False),
 ("master data management","S06","SEO/AEO",True),
 ("master data management south africa","S06","SEO",False),
 ("predictive maintenance","S06","SEO/AEO",True),
 ("predictive maintenance software south africa","S06","SEO",False),
 ("alert management","S06","SEO",True),
 ("notification orchestration","S06","SEO",False),
 ("alert management software south africa","S06","SEO",False),
 ("invoice data extraction","S06","SEO",True),
 ("invoice data capture","S06","SEO",False),
 ("inventory management software south africa","S06","SEO",True),
 ("stock management software south africa","S06","SEO",False),
]
seen=set(); uniq=[]
for kw,req,layer,sc in R:
    k=kw.lower().strip()
    if k in seen: continue
    seen.add(k); uniq.append({"keyword":k,"requesters":req,"layer":layer,"serp":sc})
json.dump(uniq, open(base+"requests-keywords.json","w"), indent=2)
kws=[e["keyword"] for e in uniq]
json.dump([{"keywords":kws,"location_name":"South Africa","language_code":"en"}], open(base+"_rq_gads.json","w"))
json.dump([{"keywords":kws,"location_name":"South Africa","language_code":"en"}], open(base+"_rq_bkd.json","w"))
json.dump([{"keywords":kws,"language_code":"en"}], open(base+"_rq_si.json","w"))
print("request keywords (deduped):", len(kws))
print("serp-check terms:", sum(1 for e in uniq if e['serp']))
