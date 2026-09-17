import { describe, expect, it } from 'vitest'
import { matchListing, type WatchTerm } from '@/lib/matching'

const ALL_SOURCES = ['all_about_auctions', 'number8', 'turners', 'facebook']

function term(overrides: Partial<WatchTerm> & { id: string; label: string; keywords: string[] }): WatchTerm {
  return {
    negativeKeywords: [],
    category: null,
    maxPriceExGst: null,
    region: null,
    sourceSlugs: ALL_SOURCES,
    active: true,
    ...overrides,
  }
}

const hobart = term({ id: 't1', label: 'Hobart', keywords: ['hobart'] })
const dishwasher = term({ id: 't2', label: 'Commercial dishwasher', keywords: ['commercial dishwasher', 'passthrough dishwasher'] })

describe('keyword matching', () => {
  it('is case insensitive and handles plurals and hyphens', () => {
    const result = matchListing(
      { title: 'Two Commercial Dishwashers, pass-through', sourceSlug: 'number8' },
      [dishwasher],
    )
    expect(result.matches.map((m) => m.label)).toEqual(['Commercial dishwasher'])
  })

  it('matches whole tokens, not substrings', () => {
    // "home" must not match "chrome", which is the failure mode that makes a
    // substring implementation quietly wrong.
    const result = matchListing({ title: 'Chrome shelving unit', sourceSlug: 'number8' }, [], ['home'])
    expect(result.suppressedBy).toBeNull()
  })

  it('weighs a title hit above a description only hit', () => {
    const inTitle = matchListing({ title: 'Hobart dishwasher', sourceSlug: 'number8' }, [hobart])
    const inDescription = matchListing(
      { title: 'Commercial dishwasher', description: 'Believed to be a Hobart', sourceSlug: 'number8' },
      [hobart],
    )
    expect(inTitle.matches[0].score).toBeGreaterThan(inDescription.matches[0].score)
  })
})

describe('negative keywords', () => {
  it('kills the listing outright on a global exclusion', () => {
    const result = matchListing(
      { title: 'Hobart domestic stand mixer', sourceSlug: 'facebook' },
      [hobart],
      ['domestic', 'kitchenaid'],
    )
    expect(result.matches).toHaveLength(0)
    expect(result.suppressedBy).toBe('domestic')
  })

  it('kills only that term on a term level exclusion', () => {
    const noParts = term({ id: 't3', label: 'Rational', keywords: ['rational'], negativeKeywords: ['parts only'] })
    const result = matchListing(
      { title: 'Rational combi oven, parts only', sourceSlug: 'number8' },
      [noParts, dishwasher],
    )
    expect(result.matches).toHaveLength(0)
    expect(result.suppressedBy).toBeNull()
  })
})

describe('ranking and scoping', () => {
  it('ranks a listing under a term max price above one with no ceiling', () => {
    const capped = term({ id: 't4', label: 'Hobart under 5k', keywords: ['hobart'], maxPriceExGst: 5000 })
    const uncapped = term({ id: 't5', label: 'Hobart', keywords: ['hobart'] })
    const result = matchListing({ title: 'Hobart dishwasher', priceExGst: 3000, sourceSlug: 'number8' }, [uncapped, capped])
    expect(result.matches[0].label).toBe('Hobart under 5k')
    expect(result.matches[0].underMaxPrice).toBe(true)
  })

  it('does not treat a listing above the ceiling as a stronger hit, but still matches it', () => {
    const capped = term({ id: 't6', label: 'Hobart under 5k', keywords: ['hobart'], maxPriceExGst: 5000 })
    const result = matchListing({ title: 'Hobart dishwasher', priceExGst: 9000, sourceSlug: 'number8' }, [capped])
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0].underMaxPrice).toBe(false)
  })

  it('respects the sources a term applies to', () => {
    const auctionOnly = term({ id: 't7', label: 'Hobart', keywords: ['hobart'], sourceSlugs: ['all_about_auctions'] })
    expect(matchListing({ title: 'Hobart', sourceSlug: 'facebook' }, [auctionOnly]).matches).toHaveLength(0)
    expect(matchListing({ title: 'Hobart', sourceSlug: 'all_about_auctions' }, [auctionOnly]).matches).toHaveLength(1)
  })

  it('does not exclude a listing whose region is unknown from a region scoped term', () => {
    const aucklandOnly = term({ id: 't8', label: 'Hobart Auckland', keywords: ['hobart'], region: 'Auckland' })
    expect(matchListing({ title: 'Hobart', region: 'Unknown', sourceSlug: 'turners' }, [aucklandOnly]).matches).toHaveLength(1)
    expect(matchListing({ title: 'Hobart', region: 'Canterbury', sourceSlug: 'turners' }, [aucklandOnly]).matches).toHaveLength(0)
  })

  it('ignores inactive terms', () => {
    const off = term({ id: 't9', label: 'Hobart', keywords: ['hobart'], active: false })
    expect(matchListing({ title: 'Hobart', sourceSlug: 'number8' }, [off]).matches).toHaveLength(0)
  })
})
