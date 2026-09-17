import { describe, expect, it } from 'vitest'
import { isOutOfRegion, isSouthIsland, normaliseRegion } from '@/lib/region'

describe('region normalisation', () => {
  it('pulls a region out of the free text Turners writes', () => {
    expect(normaliseRegion('Turners Palmerston North Trucks and Machinery')).toBe('Manawatu-Whanganui')
    expect(normaliseRegion('Timaru')).toBe('Canterbury')
    expect(normaliseRegion('Lower Hutt')).toBe('Wellington')
    expect(normaliseRegion('Napier')).toBe("Hawke's Bay")
    expect(normaliseRegion('Turners Penrose, Auckland')).toBe('Auckland')
  })

  it('falls back rather than guessing when nothing matches', () => {
    expect(normaliseRegion('Somewhere nobody has heard of')).toBe('Unknown')
    expect(normaliseRegion(null, 'Auckland')).toBe('Auckland')
  })

  it('knows which island a region is on, for the freight question', () => {
    expect(isSouthIsland('Canterbury')).toBe(true)
    expect(isSouthIsland('Auckland')).toBe(false)
  })
})

describe('out of region badging', () => {
  it('flags anything outside the home region', () => {
    expect(isOutOfRegion('Canterbury', 'Auckland')).toBe(true)
    expect(isOutOfRegion('Auckland', 'Auckland')).toBe(false)
  })

  it('does not flag an unknown region, because we do not know that it is out of region', () => {
    expect(isOutOfRegion('Unknown', 'Auckland')).toBe(false)
  })

  it('does not filter South Island listings out at all', () => {
    // The rule is badge, not exclude: a Rational combi in Christchurch at the
    // right price is still worth buying with freight included.
    expect(isOutOfRegion('Canterbury', 'Auckland')).toBe(true)
  })
})
