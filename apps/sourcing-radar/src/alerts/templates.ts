/**
 * Alert content.
 *
 * Everything this tool sends is business initiated, so on WhatsApp every alert
 * goes out as a pre approved template with variables, never as free text. Free
 * form messages are only permitted inside the 24 hour window that opens when
 * the recipient replies, and nothing here is architected around that.
 *
 * The two templates below are the ones to submit to Meta for approval. Submit
 * them on day one of Phase 1: approval is a wait, not work, and it blocks
 * acceptance if it is left until the code is done.
 *
 * The link on a single listing alert goes to the source, not to the dashboard.
 * The point of the tool is to get the founder bidding in one click.
 */

import { formatMoney, type PriceBasis } from '@/lib/money'

export interface AlertListing {
  id: string
  title: string
  priceExGst: number | null
  priceBasis: PriceBasis
  sourceName: string
  region: string
  outOfRegion: boolean
  matchedTerm: string | null
  closesAt: string | null
  url: string
  imageUrl: string | null
}

export const WHATSAPP_TEMPLATES = {
  /**
   * Name:     sourcing_listing_alert
   * Category: Utility
   * Body:     New match on {{3}}: {{1}}, {{2}}. Region {{4}}. Matched {{5}}. {{6}}
   * Button:   Dynamic URL, one variable, the listing link.
   */
  single: {
    name: 'sourcing_listing_alert',
    language: 'en',
    bodyVariables: ['title', 'price', 'source', 'region', 'matchedTerm', 'timing'] as const,
    buttonUrlVariable: 'listingUrl',
  },
  /**
   * Name:     sourcing_digest_alert
   * Category: Utility
   * Body:     {{1}} new matches from {{2}}. Top match: {{3}}. Open the feed to triage.
   * Button:   Dynamic URL, one variable, the feed link.
   */
  digest: {
    name: 'sourcing_digest_alert',
    language: 'en',
    bodyVariables: ['count', 'source', 'topMatch'] as const,
    buttonUrlVariable: 'feedPath',
  },
} as const

/**
 * The NZ utility template rate is a [TBC] to verify against Meta's published
 * pricing at build time. It is deliberately not guessed here: a made up rate
 * would flow straight into a cost expectation.
 */
export const WHATSAPP_TEMPLATE_RATE_NZD: number | null = null

export function timeRemaining(closesAt: string | null, now: Date): string {
  if (!closesAt) return 'no closing time given'
  const closes = new Date(closesAt)
  if (Number.isNaN(closes.getTime())) return 'no closing time given'
  const ms = closes.getTime() - now.getTime()
  if (ms <= 0) return 'closed'
  const hours = Math.floor(ms / 3600_000)
  if (hours < 1) return `closes in ${Math.max(1, Math.round(ms / 60_000))} min`
  if (hours < 48) return `closes in ${hours} h`
  return `closes in ${Math.round(hours / 24)} days`
}

export function singleTemplateVariables(listing: AlertListing, now: Date): string[] {
  return [
    listing.title.slice(0, 120),
    formatMoney({ priceExGst: listing.priceExGst, priceOriginal: listing.priceExGst, basis: listing.priceBasis }),
    listing.sourceName,
    listing.outOfRegion ? `${listing.region} (out of region)` : listing.region,
    listing.matchedTerm ?? 'watchlist',
    timeRemaining(listing.closesAt, now),
  ]
}

export function digestTemplateVariables(listings: AlertListing[]): string[] {
  const sources = [...new Set(listings.map((l) => l.sourceName))]
  return [
    String(listings.length),
    sources.length === 1 ? sources[0] : `${sources.length} sources`,
    listings[0]?.title.slice(0, 120) ?? 'see the feed',
  ]
}

/**
 * Email is always sent as well as WhatsApp. It is the audit trail and the
 * fallback when a WhatsApp send fails, so it carries the full content rather
 * than a pointer to it.
 */
export function emailSubject(listings: AlertListing[]): string {
  if (listings.length === 1) return `Sourcing radar: ${listings[0].title.slice(0, 80)}`
  return `Sourcing radar: ${listings.length} new matches`
}

export function emailBody(listings: AlertListing[], now: Date, feedUrl: string): { text: string; html: string } {
  const lines = listings.map((listing) => {
    const price = formatMoney({
      priceExGst: listing.priceExGst,
      priceOriginal: listing.priceExGst,
      basis: listing.priceBasis,
    })
    const region = listing.outOfRegion ? `${listing.region} (out of region)` : listing.region
    return {
      listing,
      price,
      region,
      timing: timeRemaining(listing.closesAt, now),
    }
  })

  const text = lines
    .map(
      (l) =>
        `${l.listing.title}\n${l.price}\n${l.listing.sourceName}, ${l.region}\nMatched: ${l.listing.matchedTerm ?? 'watchlist'}\n${l.timing}\n${l.listing.url}\n`,
    )
    .join('\n')

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:640px">
${lines
  .map(
    (l) => `<div style="border:1px solid #e2e2e2;border-radius:8px;padding:12px;margin-bottom:12px">
  ${l.listing.imageUrl ? `<img src="${l.listing.imageUrl}" alt="" style="max-width:100%;border-radius:6px;margin-bottom:8px">` : ''}
  <div style="font-weight:600;font-size:16px">${escapeHtml(l.listing.title)}</div>
  <div style="font-size:15px;margin:4px 0">${escapeHtml(l.price)}</div>
  <div style="font-size:13px;color:#555">${escapeHtml(l.listing.sourceName)} &middot; ${escapeHtml(l.region)} &middot; ${escapeHtml(l.timing)}</div>
  <div style="font-size:13px;color:#555">Matched: ${escapeHtml(l.listing.matchedTerm ?? 'watchlist')}</div>
  <div style="margin-top:8px"><a href="${l.listing.url}">Open on ${escapeHtml(l.listing.sourceName)}</a></div>
</div>`,
  )
  .join('\n')}
<div style="font-size:12px;color:#777">Sourcing radar. All prices ex GST unless labelled otherwise. <a href="${feedUrl}">Open the feed</a></div>
</div>`

  return { text, html }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
