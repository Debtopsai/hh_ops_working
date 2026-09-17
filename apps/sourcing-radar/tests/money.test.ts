import { describe, expect, it } from 'vitest'
import { applyBuyersPremium, detectBasis, formatMoney, parsePrice, toExGst } from '@/lib/money'

describe('GST handling', () => {
  it('converts a GST inclusive figure to ex GST and keeps the original', () => {
    const price = toExGst(1150, 'inc_gst')
    expect(price.priceExGst).toBe(1000)
    expect(price.priceOriginal).toBe(1150)
    expect(price.basis).toBe('inc_gst')
  })

  it('leaves an ex GST figure alone', () => {
    expect(toExGst(1000, 'ex_gst').priceExGst).toBe(1000)
  })

  it('does not convert when the basis is unknown, because a guess is a 15 percent error', () => {
    const price = toExGst(1150, 'unknown')
    expect(price.priceExGst).toBe(1150)
    expect(price.basis).toBe('unknown')
  })

  it('reads the basis out of the surrounding text when the source says so', () => {
    expect(detectBasis('$1,150 incl GST')).toBe('inc_gst')
    expect(detectBasis('$1,000 + GST')).toBe('ex_gst')
    expect(detectBasis('$1,000')).toBe('unknown')
  })

  it('converts a GST inclusive buyer premium onto an ex GST base', () => {
    // All About Auctions publishes 17.25 percent GST inclusive, which is 15 percent ex GST.
    expect(applyBuyersPremium(1000, 17.25, 'inc_gst')).toBe(1150)
  })
})

describe('prices that are not there', () => {
  it('parses "Pricing coming soon" to null rather than zero', () => {
    expect(parsePrice('Pricing coming soon')).toBeNull()
    expect(parsePrice('POA')).toBeNull()
    expect(parsePrice('')).toBeNull()
    expect(parsePrice(null)).toBeNull()
  })

  it('parses ordinary NZ price strings', () => {
    expect(parsePrice('$1,234.56')).toBe(1234.56)
    expect(parsePrice('NZD 12,000')).toBe(12000)
    expect(parsePrice('Current bid: $850 incl GST')).toBe(850)
  })

  it('renders a null price as "price TBC", never as zero or blank', () => {
    expect(formatMoney(toExGst(null, 'inc_gst'))).toBe('price TBC')
    expect(formatMoney(null)).toBe('price TBC')
  })
})

describe('never show a GST inclusive figure unlabelled', () => {
  it('writes "+ GST" on every converted figure', () => {
    expect(formatMoney(toExGst(1150, 'inc_gst'))).toBe('$1,000 + GST')
    expect(formatMoney(toExGst(1000, 'ex_gst'))).toBe('$1,000 + GST')
  })

  it('labels a figure whose basis is unknown rather than claiming it is ex GST', () => {
    expect(formatMoney(toExGst(1000, 'unknown'))).toBe('$1,000 (GST basis unknown)')
  })
})
