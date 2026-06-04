#!/usr/bin/env python3
# Generates the curated S03 keyword universe with cluster/page/owner tags,
# and emits request bodies for google_ads search_volume, bulk_keyword_difficulty,
# and search_intent. Keyword list itself is preserved as evidence.
import json, os
base="docs/seo/_evidence/03/"
os.makedirs(base, exist_ok=True)
K = []
def add(kw, cluster, page, owner, t, scope='za'):
    K.append({"keyword": kw.lower().strip(), "cluster": cluster, "page": page, "owner": owner, "type": t, "scope": scope})

for kw,t in [("zabble","head"),("zabble south africa","mid"),("zabble.org","longtail"),("kairos voice agent","longtail"),("zabble systems","longtail")]:
    add(kw,"brand","/","brand",t)

core_terms = [
 ("custom software development south africa","mid"),("custom software development","head","global"),
 ("software development company south africa","mid"),("software development company cape town","longtail"),
 ("software development company johannesburg","longtail"),("software development company durban","longtail"),
 ("bespoke software development","head"),("bespoke software development south africa","mid"),
 ("bespoke software south africa","mid"),("custom software development company","mid"),
 ("custom business software","mid"),("business process automation south africa","mid"),
 ("business process automation","head"),("business process automation consultant","mid"),
 ("workflow automation south africa","mid"),("workflow automation","head"),("business automation","head"),
 ("business automation south africa","mid"),("business automation consultant","mid"),
 ("automation of business processes","head"),("digital transformation south africa","mid"),
 ("operational systems","longtail"),("custom software development cape town","longtail"),
 ("custom software development johannesburg","longtail"),
]
for tup in core_terms:
    kw,t = tup[0],tup[1]; sc = tup[2] if len(tup)>2 else 'za'
    add(kw,"core","/","core",t,sc)

pillars = {
 "automation": ["business process automation","workflow automation","robotic process automation","intelligent automation","what is business process automation","how to automate business processes"],
 "audit-trails": ["audit trail software","audit management software","compliance audit software","what is an audit trail"],
 "anomaly-detection": ["anomaly detection software","anomaly detection","fraud detection software","what is anomaly detection"],
 "analytics": ["business intelligence software","data analytics software","operational analytics","analytics dashboard software","decision support system"],
}
for p,kws in pillars.items():
    for kw in kws:
        t = "question" if kw.startswith(("what","how","why")) else ("head" if len(kw.split())<=3 else "mid")
        add(kw,"pillar-"+p,"/pillars/"+p+" (to-create)",p,t)

modules = {
 "kairos": ["ai receptionist","ai voice agent","virtual receptionist software","ai phone answering service","event management software"],
 "approval-workflow": ["approval workflow software","approval management software","loan approval workflow","sign off workflow software"],
 "multi-channel-inbox": ["omnichannel inbox","shared inbox software","unified inbox software","multichannel customer support software"],
 "workflow-orchestrator": ["workflow orchestration software","workflow automation software","event driven automation","business workflow software"],
 "decision-engine": ["decision engine software","decision management software","automated decision making","rules engine software","loan decisioning software"],
 "document-intelligence": ["intelligent document processing","document data extraction","ocr automation software","invoice data capture software","document automation"],
 "document-assembly": ["document assembly software","document generation software","contract generation software","proposal automation software"],
 "bespoke-crm": ["custom crm","bespoke crm","crm software south africa","custom crm development","crm software in south africa","crm development"],
 "customer-360": ["customer 360 software","single customer view","unified customer view","customer data platform"],
 "knowledge-assistant": ["internal knowledge base software","ai knowledge assistant","sop software","company wiki software"],
 "lead-qualifier": ["lead qualification software","lead qualification automation","automated lead qualification","lead scoring software"],
 "legacy-bridge": ["legacy system integration","legacy system modernization","legacy modernization","erp integration software"],
 "inventory-clarity": ["rfid inventory system","inventory management software","stock management software","rfid asset tracking","warehouse inventory system"],
 "client-onboarding": ["client onboarding software","customer onboarding software","kyc onboarding software","digital onboarding software"],
 "case-management": ["case management software","case management system","legal case management software","matter management software"],
 "task-management": ["task management software","workflow task management","conveyancing software"],
 "field-ops-app": ["field service management software","field service app","field operations software","offline data collection app"],
 "analytics-suite": ["business intelligence dashboard","decision support software","operational analytics software","business analytics software"],
 "accounting-engine": ["accounting automation software","automated accounting software","accounting software south africa","event driven accounting"],
 "compliance-reporting": ["regulatory reporting software","regulatory reporting automation","compliance reporting software","popia compliance","ba900 reporting","tax reporting automation"],
 "continuous-assurance": ["transaction monitoring software","fraud detection software","continuous monitoring software","anomaly detection software","aml transaction monitoring"],
 "pricing-engine": ["cpq software","pricing engine software","quote management software","quoting software","price configuration software"],
 "reconciliation-engine": ["reconciliation software","automated bank reconciliation","account reconciliation software","bank reconciliation software","pos reconciliation software"],
 "data-routing": ["data pipeline software","data integration platform","automated reporting software","regulatory reporting pipeline"],
 "integration-hub": ["integration platform","ipaas","system integration software","api integration platform","business systems integration"],
 "cross-system-sync": ["data synchronization software","system sync software","two way data sync","real time data sync"],
 "forecasting": ["demand forecasting software","demand planning software","sales forecasting software","inventory forecasting software"],
 "predictive-maintenance": ["predictive maintenance software","condition monitoring software","predictive maintenance system","machine failure prediction"],
 "master-data-hub": ["master data management","mdm software","master data management software","golden record software"],
 "notification-orchestration": ["alert management software","notification management software","incident alerting software","alert orchestration software"],
}
for slug,kws in modules.items():
    for kw in kws:
        t = "head" if len(kw.split())<=2 else "mid"
        add(kw,"module-"+slug,"/systems/"+slug,slug,t)

industry = [
 ("software for law firms south africa","legal"),("legal practice management software south africa","legal"),
 ("banking software development south africa","banking"),("fintech software development south africa","banking"),
 ("ngo management software","ngo"),("donor reporting software","ngo"),
 ("hospitality management software","hospitality"),("restaurant management software south africa","hospitality"),
 ("logistics software south africa","logistics"),("manufacturing software south africa","manufacturing"),
 ("warehouse management system south africa","logistics"),
]
for kw,ind in industry:
    add(kw,"industry-"+ind,"/industries/"+ind+" (to-create)","industry","mid")

questions = [
 "what is bespoke software","what is custom software development","what is workflow automation",
 "how much does custom software cost in south africa","custom software vs off the shelf",
 "bespoke software vs off the shelf software","who builds custom software in south africa",
 "what is a crm system","what is crm software","best crm for small business south africa",
 "what is intelligent document processing","how to automate document processing",
 "what is master data management","what is a decision engine","what is cpq",
 "what is reconciliation in accounting","how to automate bank reconciliation",
 "what is regulatory reporting","what is popia","popia compliance requirements",
 "what is demand forecasting","what is predictive maintenance","what is field service management",
 "how to integrate business systems","best accounting software for small business south africa",
 "what is a case management system","how to automate lead qualification",
]
for kw in questions:
    add(kw,"aeo-questions","(FAQ on money page / blog)","aeo","question")

seen=set(); uniq=[]
for e in K:
    if e["keyword"] in seen: continue
    seen.add(e["keyword"]); uniq.append(e)
json.dump(uniq, open(base+"curated-keywords.json","w"), indent=2)
kws=[e["keyword"] for e in uniq]
json.dump([{"keywords":kws,"location_name":"South Africa","language_code":"en"}], open(base+"_body_gads.json","w"))
json.dump([{"keywords":kws,"location_name":"South Africa","language_code":"en"}], open(base+"_body_bkd.json","w"))
json.dump([{"keywords":kws,"language_code":"en"}], open(base+"_body_si.json","w"))
print("unique keywords:", len(kws))
