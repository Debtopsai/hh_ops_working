/**
 * Manual clip capture.
 *
 * Anything the founder finds by hand lands in the same feed, so it is triaged,
 * deduped and counted like everything else. This adapter has no fetch: items
 * arrive by POST, from the dashboard's paste a link box now and from the
 * extension's clip button in Phase 3.
 */

import { contentHash } from '@/lib/hash'
import { detectBasis, parsePrice, toExGst } from '@/lib/money'
import { isOutOfRegion, normaliseRegion, type Region } from '@/lib/region'
import type { NormalisedListing, RawItem } from '@/lib/types'
import type { Adapter, AdapterContext } from './types'

export interface ClipPayload {
  url: string
  title: string
  description?: string | null
  price?: string | number | null
  priceBasis?: 'ex_gst' | 'inc_gst' | 'unknown'
  imageUrls?: string[]
  sellerName?: string | null
  region?: string | null
  closesAt?: string | null
  clippedFrom?: string | null
}

export const manualClipAdapter: Adapter = {
  type: 'manual_clip',

  async fetch(): Promise<RawItem[]> {
    // Nothing to poll. Clips are pushed in.
    return []
  },

  normalise(item: RawItem, ctx: AdapterContext): NormalisedListing | null {
    const payload = item.raw as unknown as ClipPayload
    if (!payload?.url || !payload?.title) return null

    const basis = payload.priceBasis ?? detectBasis(typeof payload.price === 'string' ? payload.price : null)
    const price = toExGst(parsePrice(payload.price ?? null), basis)
    const regionRaw = payload.region ?? null
    const region: Region = normaliseRegion(regionRaw, 'Unknown')

    return {
      sourceSlug: ctx.source.slug,
      externalId: payload.url,
      title: payload.title,
      description: payload.description ?? null,
      priceExGst: price.priceExGst,
      priceOriginal: price.priceOriginal,
      priceBasis: price.basis,
      currency: 'NZD',
      url: payload.url,
      imageUrls: payload.imageUrls ?? [],
      sellerName: payload.sellerName ?? null,
      region,
      regionRaw,
      outOfRegion: isOutOfRegion(region, normaliseRegion(ctx.homeRegion, 'Auckland')),
      lotNumber: null,
      auctionName: null,
      viewingDetails: null,
      listedAt: null,
      closesAt: payload.closesAt ?? null,
      soldPriceExGst: null,
      soldAt: null,
      raw: item.raw,
      contentHash: contentHash({ title: payload.title, priceExGst: price.priceExGst, sellerName: payload.sellerName }),
    }
  },
}
