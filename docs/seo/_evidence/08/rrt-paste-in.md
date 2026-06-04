# Google Rich Results Test — paste-in bundle (S03)

The site is pre-launch, so the live Rich Results Test (https://search.google.com/test/rich-results) cannot fetch a public URL yet. Each block below is the EXACT JSON-LD that will render server-side at launch. In RRT choose **Code** and paste the `<script>` block; or, post-launch, test the live URL directly.

Expected, per Google 2026: **Breadcrumb** and **Merchant/Organization** parse cleanly; **FAQ rich results** are no longer shown in Google Search results but the markup remains valid and is used by Bing + AI answer engines (the reason we keep it). Service/ItemList/WebPage validate as structured data with no errors.

## Home — Organization + WebSite + WebPage + FAQPage(5)
Source page: `home`. Paste-in file: `rrt-paste-in__home.html` (graph: `jsonld__home.json`).

## System (FAQ) — WebPage/ItemPage/FAQPage + Breadcrumb + Service + 4 Questions
Source page: `system-bespoke-crm`. Paste-in file: `rrt-paste-in__system-bespoke-crm.html` (graph: `jsonld__system-bespoke-crm.json`).

## System (no FAQ) — WebPage/ItemPage + Breadcrumb + Service
Source page: `system-integration-hub`. Paste-in file: `rrt-paste-in__system-integration-hub.html` (graph: `jsonld__system-integration-hub.json`).

## Systems index — CollectionPage + Breadcrumb + ItemList(30)
Source page: `systems-index`. Paste-in file: `rrt-paste-in__systems-index.html` (graph: `jsonld__systems-index.json`).

