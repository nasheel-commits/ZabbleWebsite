// Canonical Zabble organization entity, single source of truth.
//
// Used by: the site-wide Organization JSON-LD (app.vue), the on-site entity
// facts in the Meet Zabble section (TheMeet.vue), llms.txt generation, and the
// GEO test suite. S03/S08
// (schema) and S10 (off-page profiles) should CONSUME this object rather than
// re-declaring the entity, so every surface tells generative engines the same
// thing.
//
// GEO purpose: make "Zabble" an unambiguous entity, a South African
// operations-systems consultancy, via strong positive identity signals
// (country, metros, sector, knowsAbout). The site names no homonym; positive
// disambiguation carries the distinction (see audits/07-geo.md finding F2).

export interface OrgEntity {
  name: string
  alternateName: string
  legalName: string | null
  url: string
  email: string
  /** Authoritative one-paragraph description, kept byte-identical across surfaces. */
  description: string
  /** Schema.org disambiguatingDescription, the positive on-site identity signal. */
  disambiguatingDescription: string
  slogan: string
  areaServed: string
  /** ISO 3166-1 alpha-2 country code. */
  addressCountry: string
  foundingLocation: string
  knowsAbout: string[]
  /** Live, verified profile URLs only. Promote PENDING targets here as they go live. */
  sameAs: string[]
  /** Planned profiles S10 must create, then move into `sameAs`. */
  sameAsTargets: string[]
}

export const ORGANIZATION: OrgEntity = {
  name: 'Zabble',
  alternateName: 'Zabble (South Africa)',
  legalName: null, // set to the registered entity name once confirmed (S10).
  url: 'https://zabble.org',
  email: 'sales@zabble.org',
  description:
    'Zabble is a South African consulting firm that builds bespoke operational systems, automation, audit trails, anomaly detection, and analytics, shaped around the single problem slowing one specific business down.',
  disambiguatingDescription:
    'Zabble is the South African bespoke operational-systems consultancy at zabble.org, serving Johannesburg, Cape Town and Pretoria.',
  slogan: "We don't sell software. We build the system your business actually needs.",
  areaServed: 'South Africa',
  addressCountry: 'ZA',
  foundingLocation: 'South Africa',
  knowsAbout: [
    'business process automation',
    'workflow automation',
    'audit trails',
    'anomaly detection',
    'business analytics',
    'bespoke software development',
    'document intelligence',
    'reconciliation automation',
    'regulatory reporting automation',
    'custom CRM',
  ],
  sameAs: [
    // Only live, verified profiles belong here. None confirmed live yet (pre-launch).
    // S10 promotes each sameAsTarget here once the profile exists and is verified.
  ],
  sameAsTargets: [
    'https://www.linkedin.com/company/zabble',
    'https://www.crunchbase.com/organization/zabble',
    'https://www.wikidata.org/wiki/SPECIAL:NewItem', // create the Zabble (SA) item → replace with QID
  ],
}

/**
 * Build the schema.org Organization JSON-LD node from the canonical entity.
 * Emits only valid schema.org fields; `sameAs` is included only when non-empty.
 * `disambiguatingDescription` is the on-site machine-readable disambiguation signal.
 */
export function organizationJsonLd(): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${ORGANIZATION.url}/#organization`,
    name: ORGANIZATION.name,
    alternateName: ORGANIZATION.alternateName,
    url: ORGANIZATION.url,
    email: ORGANIZATION.email,
    description: ORGANIZATION.description,
    disambiguatingDescription: ORGANIZATION.disambiguatingDescription,
    slogan: ORGANIZATION.slogan,
    areaServed: { '@type': 'Country', name: ORGANIZATION.areaServed },
    address: { '@type': 'PostalAddress', addressCountry: ORGANIZATION.addressCountry },
    knowsAbout: ORGANIZATION.knowsAbout,
  }
  if (ORGANIZATION.legalName) node.legalName = ORGANIZATION.legalName
  if (ORGANIZATION.sameAs.length) node.sameAs = ORGANIZATION.sameAs
  return node
}
