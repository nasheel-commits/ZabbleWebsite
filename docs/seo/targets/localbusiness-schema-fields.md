# LocalBusiness / Organization schema — field hand-off to S08

**From:** S04 (off-page/local). **To:** S08 (GEO/entity) — and S03 if it owns the
schema composable. S04 built the local/industry/entity pages with a clearly-marked
**`SCHEMA SLOT (S08)`** comment in each page's `<script setup>`, and put every data
field in one place so the schema agrees with the site, the GBP and the citations.
**S04 deliberately did not emit JSON-LD** (schema write-ownership is S03/S08).

This doc gives S08 the exact JSON-LD to emit and where each field comes from.

## Field sources (single source of truth)

| Field | Source |
|-------|--------|
| name, legalName, description, url, email, phone, address, geo, hours, areasServed, sameAs, partners | `app/data/nap.ts` (`NAP`) — address/phone/geo are `NAP_PENDING` until B6 |
| city pages: city, province, geo, nearbyAreas (areaServed), canonical | `app/data/locations.ts` (`locationBySlug`) |
| industry pages: name, description, canonical | `app/data/industries.ts` (`industryBySlug`) |
| systems (Service catalogue) | `app/data/systems.ts` (`SYSTEMS`, name + tagline) |
| landscape article: headline, about(ItemList) | `app/data/landscape.ts` |

`napReady()` / `napHasAddress()` guard whether to emit `telephone`/`address`/`geo`
(omit `NAP_PENDING` values — never emit the sentinel).

## 1. Organization — on every page (or at least /about, home, /press)

Site-wide entity. `/about` is the canonical Organization page.

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://zabble.org/#organization",
  "name": "Zabble",
  "legalName": "<NAP.legalName when B6 lands>",
  "url": "https://zabble.org",
  "description": "<NAP.description>",
  "email": "analytics@zabble.org",
  "areaServed": [ "Johannesburg", "Sandton", "Cape Town", "Pretoria", "Durban", "South Africa" ],
  "knowsAbout": [ "business automation", "custom software", "operational systems",
                  "compliance reporting", "reconciliation", "document automation" ],
  "sameAs": [ /* NAP.sameAs[].url where not PENDING — fill as profiles go live */ ]
  // add "telephone", "logo", "foundingDate" when available
}
```

## 2. LocalBusiness — on each `/locations/<city>` page

Emit a `LocalBusiness` (or `ProfessionalService`) scoped to the city. Use
`locationBySlug(slug)` for `areaServed` + `geo`; NAP for the rest. While the address
is PENDING (service-area business), emit `areaServed` + `geo` of the city and OMIT
`address`/`telephone` until B6.

```jsonc
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://zabble.org/locations/johannesburg/#business",
  "name": "Zabble — Johannesburg",
  "description": "<location.metaDescription>",
  "url": "https://zabble.org/locations/johannesburg",
  "parentOrganization": { "@id": "https://zabble.org/#organization" },
  "areaServed": [
    { "@type": "City", "name": "Johannesburg" },
    /* ...location.nearbyAreas as City */
  ],
  "geo": { "@type": "GeoCoordinates", "latitude": -26.2041, "longitude": 28.0473 }, // location.geo
  "knowsAbout": [ /* the systemRefs[].slug names for this city */ ]
  // add "address" (PostalAddress) + "telephone" once napHasAddress()
}
```

## 3. Service — on each `/industries/<industry>` page

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Custom software for <industry.name>",
  "provider": { "@id": "https://zabble.org/#organization" },
  "areaServed": { "@type": "Country", "name": "South Africa" },
  "description": "<industry.metaDescription>",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "<industry.name> systems",
    "itemListElement": [ /* industry.systemRefs → { "@type":"Offer","itemOffered":{"@type":"Service","name": system.name } } */ ]
  }
}
```

## 4. Article — on the landscape asset (`/insights/...landscape`)

The citation asset. Mark it free-to-read and describe the taxonomy as an ItemList.

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The South African Operations-Software Landscape",
  "author": { "@id": "https://zabble.org/#organization" },
  "publisher": { "@id": "https://zabble.org/#organization" },
  "isAccessibleForFree": true,
  "about": {
    "@type": "ItemList",
    "itemListElement": [ /* LANDSCAPE_CATEGORIES → ListItem { name, url: page#<id> } */ ]
  }
}
```

## 5. BreadcrumbList — on every detail page

`/locations/<city>`, `/industries/<industry>`, `/insights/<slug>` already render a
visible breadcrumb; mirror it as `BreadcrumbList` (Home → hub → page).

## 6. WebPage / ItemList — on hubs

`/locations` and `/industries` and `/insights` can emit an `ItemList` of their
children (helps entity + sitelinks).

## Implementation note for S08

Each target page has the slot marked. Recommended: a `useSchemaOrg`-style composable
(or `defineOrganization` / `defineLocalBusiness` from `nuxt-schema-org` if S01/S03
wire it) reading `NAP` + `locationBySlug`/`industryBySlug`. Keep `@id` references
consistent so the Organization node is shared across the graph. **Do not emit any
`NAP_PENDING` value** — guard with `napReady()`/`napHasAddress()`.

## Dependency
- **B6 (NAP)** unlocks `telephone`, `address`, `geo` of the registered office, and
  the GBP that becomes a `sameAs`.
- The `sameAs` array fills in as the profiles in `outreach/prospect-list.md` Type A
  and `local-kit/citation-checklist.csv` (sameas_for_s08 = yes) go live.
