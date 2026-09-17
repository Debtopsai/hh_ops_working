/**
 * The shared listing shape.
 *
 * Every adapter normalises to this, and nothing downstream knows or cares which
 * source a listing came from. The Chrome extension package imports these same
 * types so the ingest endpoint and the extension cannot drift apart.
 */

import type { PriceBasis } from './money'
import type { Region } from './region'

export type { PriceBasis } from './money'
export type { Region } from './region'

export type SourceSlug = string

/** What an adapter's fetch() hands back: the untouched payload plus where it came from. */
export interface RawItem {
  sourceSlug: SourceSlug
  /** Untouched payload from the source. Everything else is derived from this. */
  raw: Record<string, unknown>
}

export interface NormalisedListing {
  sourceSlug: SourceSlug
  /** Stable id from the source when it has one. Null falls back to contentHash. */
  externalId: string | null
  title: string
  description: string | null
  priceExGst: number | null
  priceOriginal: number | null
  priceBasis: PriceBasis
  currency: string
  url: string
  imageUrls: string[]
  sellerName: string | null
  region: Region
  regionRaw: string | null
  outOfRegion: boolean
  lotNumber: string | null
  auctionName: string | null
  viewingDetails: string | null
  listedAt: string | null
  closesAt: string | null
  /** Realised price from an archive of past sales, where a source publishes one. */
  soldPriceExGst: number | null
  soldAt: string | null
  raw: Record<string, unknown>
  contentHash: string
}

export interface SourceRow {
  slug: SourceSlug
  name: string
  adapterType: 'json_catalogue' | 'html_listing' | 'email_inbound' | 'extension' | 'manual_clip'
  enabled: boolean
  pollIntervalSeconds: number
  regionDefault: string | null
  buyersPremiumPct: number | null
  buyersPremiumBasis: PriceBasis | null
  config: Record<string, unknown>
}
