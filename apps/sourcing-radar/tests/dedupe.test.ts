import { describe, expect, it } from 'vitest'
import { contentHash, dHashFromGreyscale9x8, hammingDistanceHex } from '@/lib/hash'
import { findDuplicateCandidates, imageSimilarity, priceProximity, scoreSimilarity, titleSimilarity } from '@/lib/dedupe'

describe('content hash, the fallback identity', () => {
  it('is stable across whitespace and case', () => {
    expect(contentHash({ title: 'Rational  SCC 101', priceExGst: 5000, sellerName: 'AAA' })).toBe(
      contentHash({ title: 'rational scc 101', priceExGst: 5000, sellerName: 'aaa' }),
    )
  })

  it('changes when the price changes, so a re listing at a new price is a new item', () => {
    expect(contentHash({ title: 'Rational SCC', priceExGst: 5000 })).not.toBe(
      contentHash({ title: 'Rational SCC', priceExGst: 6000 })
    )
  })

  it('distinguishes a missing price from a zero price', () => {
    expect(contentHash({ title: 'x', priceExGst: null })).not.toBe(contentHash({ title: 'x', priceExGst: 0 }))
  })
})

describe('perceptual hashing', () => {
  it('produces 16 hex characters from a 9x8 greyscale thumbnail', () => {
    const ramp = Array.from({ length: 72 }, (_, index) => index * 3)
    expect(dHashFromGreyscale9x8(ramp)).toHaveLength(16)
  })

  it('measures distance in bits', () => {
    expect(hammingDistanceHex('0000000000000000', '0000000000000000')).toBe(0)
    expect(hammingDistanceHex('0000000000000000', 'f000000000000000')).toBe(4)
  })

  it('refuses a buffer that is not 9x8', () => {
    expect(() => dHashFromGreyscale9x8([1, 2, 3])).toThrow()
  })
})

describe('cross source similarity', () => {
  it('scores the same machine described two ways as similar, model number spacing and all', () => {
    expect(titleSimilarity('Rational SCC 101 combi oven', 'Rational SCC101 Combi Oven 10 tray')).toBeGreaterThan(0.75)
  })

  it('flags that pair as a duplicate candidate once price agrees', () => {
    const found = findDuplicateCandidates(
      { id: 'a', sourceSlug: 'all_about_auctions', title: 'Rational SCC 101 combi oven', priceExGst: 5000, imagePhash: null },
      [{ id: 'b', sourceSlug: 'number8', title: 'Rational SCC101 Combi Oven 10 tray', priceExGst: 5100, imagePhash: null }],
    )
    expect(found).toHaveLength(1)
  })

  it('scores two different machines as not similar', () => {
    expect(titleSimilarity('Rational combi oven', 'Starline undercounter glasswasher')).toBeLessThan(0.2)
  })

  it('treats prices within a few percent as close and 30 percent apart as unrelated', () => {
    expect(priceProximity(5000, 5100)).toBeGreaterThan(0.9)
    expect(priceProximity(5000, 3000)).toBe(0)
    expect(priceProximity(5000, null)).toBeNull()
  })

  it('ignores an image signal that is not available rather than penalising the pair', () => {
    expect(imageSimilarity(null, 'abcd')).toBeNull()
    const withoutImages = scoreSimilarity(
      { id: 'a', sourceSlug: 's1', title: 'Rational SCC 101 combi oven', priceExGst: 5000, imagePhash: null },
      { id: 'b', sourceSlug: 's2', title: 'Rational SCC 101 combi oven', priceExGst: 5000, imagePhash: null },
    )
    expect(withoutImages.similarity).toBeGreaterThan(0.9)
  })

  it('pairs listings across sources only, because one source is handled by the unique index', () => {
    const subject = { id: 'a', sourceSlug: 's1', title: 'Rational SCC 101 combi oven', priceExGst: 5000, imagePhash: null }
    const sameSource = { ...subject, id: 'b' }
    const otherSource = { ...subject, id: 'c', sourceSlug: 's2' }

    const found = findDuplicateCandidates(subject, [sameSource, otherSource])
    expect(found.map((match) => match.other.id)).toEqual(['c'])
  })
})
