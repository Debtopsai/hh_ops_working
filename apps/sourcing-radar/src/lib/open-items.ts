/**
 * The open items register.
 *
 * Every [TBC] in the PRD, surfaced in Settings rather than filled with a
 * plausible default. Anything in here that is answered should be removed from
 * this list in the same change that implements the answer.
 */

export interface OpenItem {
  item: string
  neededFor: string
  owner: string
}

export const OPEN_ITEMS: OpenItem[] = [
  { item: 'Dedicated phone number for WhatsApp, not a personal one', neededFor: 'Phase 1 alerting', owner: 'Founder' },
  { item: 'Mobile numbers and opt in for all three recipients', neededFor: 'Phase 1 alerting', owner: 'Founder' },
  { item: 'Meta Business account access for WhatsApp onboarding', neededFor: 'Phase 1 alerting', owner: 'Raj' },
  { item: 'Current NZ utility template rate on WhatsApp', neededFor: 'Cost expectation', owner: 'Build, verify at Meta' },
  { item: 'Trade Me API application outcome', neededFor: 'Phase 2 routing', owner: 'Trade Me, applied for by founder' },
  { item: 'Indicative South Island to Auckland freight by equipment size', neededFor: 'Region badging, later landed cost', owner: 'Founder' },
  { item: 'Whether to buy out of region at all, or badge only', neededFor: 'Phase 1 feed behaviour', owner: 'Founder' },
  { item: 'Additional negative keywords beyond the seed list', neededFor: 'Phase 1 matching quality', owner: 'Founder' },
  { item: 'Current baseline, listings found and machines bought per week', neededFor: 'Success measurement', owner: 'Founder' },
  { item: 'Any other auction houses worth adding, for example Thorntons', neededFor: 'Adapter prioritisation', owner: 'Founder' },
  {
    item: 'Live endpoints, JSON field paths and Turners selectors for every source',
    neededFor: 'Any adapter running at all',
    owner: 'Build, see docs/DISCOVERY.md',
  },
  {
    item: 'Authoritative brand list from the Shopify vendor field on washpro.co.nz',
    neededFor: 'Seeding the watchlist',
    owner: 'Build, run npm run seed:brands',
  },
]
