/**
 * Money. Everything in this application is stored and displayed ex GST in NZD.
 *
 * Auction houses quote GST inclusive, Trade Me listings vary and Turners often
 * has no price at all. On ingest we convert to ex GST, keep the original figure
 * and record which basis the source used, so the conversion is auditable.
 *
 * The one hard rule from the PRD: never display a GST inclusive figure without
 * labelling it. `formatMoney` is the only formatter the interface should use.
 */

export const NZ_GST_RATE = 0.15

export type PriceBasis = 'ex_gst' | 'inc_gst' | 'unknown'

export interface NormalisedPrice {
  /** Null when the source has no price yet, for example "Pricing coming soon". */
  priceExGst: number | null
  /** The figure exactly as the source gave it, before any conversion. */
  priceOriginal: number | null
  basis: PriceBasis
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Convert a source figure to ex GST.
 *
 * An unknown basis is not converted. Guessing would put a 15 percent error into
 * the only number the founder uses to decide, so an unknown basis stays as the
 * raw figure and is labelled "basis unknown" wherever it is shown.
 */
export function toExGst(amount: number | null | undefined, basis: PriceBasis): NormalisedPrice {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return { priceExGst: null, priceOriginal: null, basis }
  }
  if (basis === 'inc_gst') {
    return { priceExGst: round2(amount / (1 + NZ_GST_RATE)), priceOriginal: round2(amount), basis }
  }
  return { priceExGst: round2(amount), priceOriginal: round2(amount), basis }
}

/**
 * Parse a price out of whatever string a source gives us.
 *
 * Returns null for the many listings that genuinely have no price. Turners
 * shows "Pricing coming soon" on items awaiting valuation, and those lots are
 * still worth surfacing, so a null here must survive all the way to the feed
 * and render as "price TBC".
 */
export function parsePrice(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null

  const text = raw.trim()
  if (!text) return null
  // "Pricing coming soon", "POA", "No reserve", "TBC" and friends.
  if (!/\d/.test(text)) return null

  const cleaned = text.replace(/[^0-9.,]/g, '')
  if (!cleaned) return null

  // Every source here quotes NZD, where the comma is always a thousands
  // separator and the dot is always the decimal point. Do not add a continental
  // "1.234,56" fallback: it turns "NZD 12,000" into twelve dollars.
  const value = Number.parseFloat(cleaned.replace(/,/g, ''))
  return Number.isFinite(value) ? value : null
}

/**
 * Detect the GST basis from the surrounding text, when the source says so.
 * Returns 'unknown' rather than assuming, and the caller decides what the
 * source's documented default is.
 */
export function detectBasis(text: string | null | undefined): PriceBasis {
  if (!text) return 'unknown'
  const t = text.toLowerCase()
  if (/(incl?\.?\s*(of\s*)?gst|gst\s*incl|inc\s*gst|including\s*gst)/.test(t)) return 'inc_gst'
  if (/(excl?\.?\s*(of\s*)?gst|gst\s*excl|ex\s*gst|excluding\s*gst|plus\s*gst|\+\s*gst)/.test(t)) return 'ex_gst'
  return 'unknown'
}

const nzd = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * The only money formatter the interface uses.
 *
 * A null price is "price TBC", never zero and never blank. An ex GST figure is
 * always written "+ GST". A figure whose basis we could not establish says so
 * rather than claiming to be ex GST.
 */
export function formatMoney(price: NormalisedPrice | null | undefined): string {
  if (!price || price.priceExGst === null) return 'price TBC'
  if (price.basis === 'unknown') return `${nzd.format(price.priceExGst)} (GST basis unknown)`
  return `${nzd.format(price.priceExGst)} + GST`
}

/** Buyer's premium is stored against the auction house, never hardcoded. */
export function applyBuyersPremium(
  priceExGst: number | null,
  premiumPct: number | null | undefined,
  premiumBasis: PriceBasis | null | undefined,
): number | null {
  if (priceExGst === null || premiumPct === null || premiumPct === undefined) return priceExGst
  const pct = premiumBasis === 'inc_gst' ? premiumPct / (1 + NZ_GST_RATE) : premiumPct
  return round2(priceExGst * (1 + pct / 100))
}
