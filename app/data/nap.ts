// Zabble — NAP (Name, Address, Phone) + entity facts. SINGLE SOURCE OF TRUTH.
//
// Off-page and local SEO depend on a byte-identical NAP everywhere Zabble appears:
// the site footer, the LocalBusiness/Organization schema (handed to S08), the
// Google Business Profile, and every directory citation. Inconsistent NAP is the
// #1 local-ranking and entity-confusion killer (and it hurts GEO — models trust
// facts that agree across sources). So every consumer reads from THIS file.
//
// Address, phone, and geo coordinates are PENDING the business owner (status.md
// blocker B6). They are sentinel placeholders here, never invented. Pages render
// gracefully without them (areas-served + email instead of a fake street address),
// and the GBP/citation kits and schema-field hand-off all read the same sentinels.
// The moment the real values land, edit ONLY this file and the whole system — site,
// schema fields, kits — updates in lockstep.
//
// Owner: S04 (off-page/local). Schema emission from these fields: S08 (see
// docs/seo/targets/localbusiness-schema-fields.md).

/** Sentinel for any NAP field still awaiting the business owner (blocker B6). */
export const NAP_PENDING = '__PENDING_OWNER_INPUT__'

export interface SameAsTarget {
  /** Human label for the profile/citation. */
  label: string
  /** Live URL once the profile exists, else NAP_PENDING. */
  url: string
  /** Why it matters for the entity (GEO corroboration / authority). */
  note: string
}

export interface Nap {
  /** Public brand name — exact string used everywhere. */
  name: string
  /** Registered legal/trading name (e.g. "Zabble (Pty) Ltd"). PENDING confirmation. */
  legalName: string
  /** One-sentence boilerplate. Reused verbatim in schema, GBP, directories. */
  description: string
  /** Longer entity description for About / Organization schema. */
  longDescription: string
  email: string
  url: string
  /** Canonical international-format phone, or NAP_PENDING. */
  phone: string
  /** Street line, or NAP_PENDING. */
  street: string
  /** Suburb / area, or NAP_PENDING. */
  suburb: string
  /** Primary city of registration / HQ, or NAP_PENDING. */
  city: string
  province: string
  /** Postal code, or NAP_PENDING. */
  postalCode: string
  country: string
  /** ISO 3166-1 alpha-2. */
  countryCode: string
  /** Service-area business: true if Zabble serves areas without a walk-in office. */
  serviceArea: boolean
  /** Cities/areas served — drives areaServed in schema and the local pages. */
  areasServed: string[]
  /** Opening hours in human form; schema form derived in the hand-off doc. */
  hours: string
  /** Geo coordinates of the registered address, or null while PENDING. */
  geo: { lat: number; lng: number } | null
  /** sameAs / brand-citation targets — the entity corroboration set for GEO (S08). */
  sameAs: SameAsTarget[]
  /** Partner/credit context (kept truthful; surfaced on About/Press). */
  partners: string[]
}

export const NAP: Nap = {
  name: 'Zabble',
  legalName: NAP_PENDING,
  description:
    'Zabble builds bespoke operational systems for South African businesses — automation, audit trails, anomaly detection, and analytics — delivered as custom software tailored to how each business actually runs.',
  longDescription:
    'Zabble is a South African software consultancy that builds bespoke operational systems — custom software designed around the specific problem slowing a business down. Every build rests on four pillars: automation that removes manual work, audit trails that make every decision replayable, anomaly detection that surfaces the costly few events inside the routine many, and analytics that turn operational data into decisions. Rather than forcing a business onto off-the-shelf software, Zabble sits with the team, finds the most expensive operational problem, and builds the system that fixes it.',
  email: 'analytics@zabble.org',
  url: 'https://zabble.org',
  phone: NAP_PENDING,
  street: NAP_PENDING,
  suburb: NAP_PENDING,
  city: NAP_PENDING,
  province: NAP_PENDING,
  postalCode: NAP_PENDING,
  country: 'South Africa',
  countryCode: 'ZA',
  serviceArea: true,
  areasServed: ['Johannesburg', 'Cape Town', 'Pretoria', 'Durban', 'Sandton', 'South Africa'],
  hours: 'Monday to Friday, 08:00–17:00 SAST',
  geo: null,
  sameAs: [
    { label: 'LinkedIn (company page)', url: NAP_PENDING, note: 'Highest-trust entity signal; feeds GEO + B2B credibility.' },
    { label: 'Google Business Profile', url: NAP_PENDING, note: 'Anchor local citation; Map Pack eligibility.' },
    { label: 'Crunchbase', url: NAP_PENDING, note: 'Company entity record; ingested by AI models.' },
    { label: 'Clutch.co', url: NAP_PENDING, note: 'B2B reviews; ranks for SA software queries.' },
    { label: 'GoodFirms', url: NAP_PENDING, note: 'B2B reviews; ranks for SA software queries.' },
    { label: 'X / Twitter', url: NAP_PENDING, note: 'Brand handle; entity corroboration.' },
  ],
  partners: ['KnvilLabs'],
}

/** True once the street + phone are real (blocker B6 resolved). */
export function napReady(): boolean {
  return NAP.phone !== NAP_PENDING && NAP.street !== NAP_PENDING
}

/** True once a full postal address is available. */
export function napHasAddress(): boolean {
  return (
    NAP.street !== NAP_PENDING &&
    NAP.city !== NAP_PENDING &&
    NAP.postalCode !== NAP_PENDING
  )
}

/** Single-line address for display, omitting PENDING parts. */
export function napAddressLine(): string {
  const parts = [NAP.street, NAP.suburb, NAP.city, NAP.province, NAP.postalCode]
    .filter((p) => p && p !== NAP_PENDING)
  parts.push(NAP.country)
  return parts.join(', ')
}
