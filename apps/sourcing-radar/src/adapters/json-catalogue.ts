/**
 * Generic JSON catalogue adapter.
 *
 * Drives any source whose listing pages are backed by a JSON endpoint: the
 * white label auction platform behind All About Auctions and Mainland, and
 * No. 8 Solutions, whose item grid is client rendered so a plain HTML fetch
 * returns page chrome and no lots.
 *
 * The endpoint and the field paths are not in this file on purpose. They are
 * discovered against the live site (see docs/DISCOVERY.md) and written into the
 * source's config column. Until that has happened the adapter refuses to run
 * and says exactly what is missing.
 */

import { politeFetch } from '@/lib/http'
import { contentHash } from '@/lib/hash'
import { detectBasis, parsePrice, toExGst, type PriceBasis } from '@/lib/money'
import { isOutOfRegion, normaliseRegion, type Region } from '@/lib/region'
import type { NormalisedListing, RawItem } from '@/lib/types'
import { resolveNumber, resolveString, resolveStringArray, type FieldMap } from './mapping'
import { AdapterFetchError, AdapterNotConfiguredError, type Adapter, type AdapterContext } from './types'

export interface JsonEndpointSpec {
  label: string
  url: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: unknown
  /** Path to the array of items inside the response. */
  itemsPath?: string
  /** Optional page walk: `url` gets `{page}` substituted from `from` to `to`. */
  pages?: { from: number; to: number }
}

export interface JsonCatalogueConfig {
  /** Set to true only once a person has confirmed these values against the live site. */
  discovered?: boolean
  discoveredAt?: string
  discoveredBy?: string
  notes?: string
  baseUrl?: string
  userAgent?: string
  itemsPath?: string
  /** The basis this house quotes in. Auction houses generally quote GST inclusive. */
  priceBasisDefault?: PriceBasis
  endpoints?: JsonEndpointSpec[]
  fields?: FieldMap
}

/** Field names the runner needs to have any chance of producing a usable listing. */
const REQUIRED_FIELDS = ['title', 'url'] as const

export function validateJsonCatalogueConfig(slug: string, config: JsonCatalogueConfig): string[] {
  const missing: string[] = []
  if (!config.discovered) missing.push('config.discovered (no one has confirmed these values against the live site)')
  if (!config.endpoints?.length) missing.push('config.endpoints')
  if (!config.itemsPath && !config.endpoints?.some((e) => e.itemsPath)) missing.push('config.itemsPath')
  if (!config.fields) {
    missing.push('config.fields')
  } else {
    for (const field of REQUIRED_FIELDS) {
      if (!config.fields[field]) missing.push(`config.fields.${field}`)
    }
  }
  return missing
}

function readItems(payload: unknown, itemsPath: string): unknown[] {
  const segments = itemsPath.split('.').filter(Boolean)
  let current: unknown = payload
  for (const segment of segments) {
    if (current === null || typeof current !== 'object') return []
    current = (current as Record<string, unknown>)[segment]
  }
  return Array.isArray(current) ? current : []
}

export const jsonCatalogueAdapter: Adapter = {
  type: 'json_catalogue',

  async fetch(ctx: AdapterContext): Promise<RawItem[]> {
    const config = ctx.source.config as JsonCatalogueConfig
    const missing = validateJsonCatalogueConfig(ctx.source.slug, config)
    if (missing.length > 0) throw new AdapterNotConfiguredError(ctx.source.slug, missing)

    const items: RawItem[] = []
    const headers: Record<string, string> = {
      accept: 'application/json',
      ...(config.userAgent ? { 'user-agent': config.userAgent } : {}),
    }

    // Per source concurrency is one: endpoints are walked in series, not raced.
    for (const endpoint of config.endpoints ?? []) {
      const pages = endpoint.pages
        ? Array.from({ length: endpoint.pages.to - endpoint.pages.from + 1 }, (_, i) => endpoint.pages!.from + i)
        : [null]

      for (const page of pages) {
        const url = page === null ? endpoint.url : endpoint.url.replace('{page}', String(page))
        const response = await politeFetch(url, {
          headers: { ...headers, ...(endpoint.headers ?? {}) },
          fetchImpl: ctx.fetchImpl,
          sleepImpl: ctx.sleepImpl,
        })
        if (!response.ok) {
          throw new AdapterFetchError(ctx.source.slug, `${endpoint.label} returned HTTP ${response.status}`)
        }
        let payload: unknown
        try {
          payload = await response.json()
        } catch (error) {
          throw new AdapterFetchError(
            ctx.source.slug,
            `${endpoint.label} did not return JSON. If the grid is client rendered, the endpoint in config may be the page rather than the data call.`,
          )
        }
        const path = endpoint.itemsPath ?? config.itemsPath ?? ''
        const found = readItems(payload, path)
        ctx.log(`${endpoint.label}${page === null ? '' : ` page ${page}`}: ${found.length} items`)
        for (const item of found) {
          items.push({ sourceSlug: ctx.source.slug, raw: item as Record<string, unknown> })
        }
      }
    }
    return items
  },

  normalise(item: RawItem, ctx: AdapterContext): NormalisedListing | null {
    const config = ctx.source.config as JsonCatalogueConfig
    const fields = config.fields ?? {}
    const raw = item.raw

    const title = resolveString(raw, fields.title)
    const url = resolveString(raw, fields.url)
    // A lot with no title or no link is not actionable, so it is dropped rather
    // than written as a blank card. The count difference shows on Source health.
    if (!title || !url) return null

    const priceRaw = resolveString(raw, fields.price)
    const priceNumeric = resolveNumber(raw, fields.price) ?? parsePrice(priceRaw)
    const basis = detectBasis(priceRaw) !== 'unknown'
      ? detectBasis(priceRaw)
      : config.priceBasisDefault ?? 'unknown'
    const price = toExGst(priceNumeric, basis)

    const soldRaw = resolveNumber(raw, fields.soldPrice) ?? parsePrice(resolveString(raw, fields.soldPrice))
    const sold = toExGst(soldRaw, basis)

    const regionRaw = resolveString(raw, fields.region)
    const region: Region = normaliseRegion(
      regionRaw,
      normaliseRegion(ctx.source.regionDefault, 'Unknown'),
    )

    return {
      sourceSlug: ctx.source.slug,
      externalId: resolveString(raw, fields.externalId),
      title,
      description: resolveString(raw, fields.description),
      priceExGst: price.priceExGst,
      priceOriginal: price.priceOriginal,
      priceBasis: price.basis,
      currency: 'NZD',
      url,
      imageUrls: resolveStringArray(raw, fields.images),
      sellerName: resolveString(raw, fields.sellerName) ?? ctx.source.name,
      region,
      regionRaw,
      outOfRegion: isOutOfRegion(region, normaliseRegion(ctx.homeRegion, 'Auckland')),
      lotNumber: resolveString(raw, fields.lotNumber),
      auctionName: resolveString(raw, fields.auctionName),
      viewingDetails: resolveString(raw, fields.viewingDetails),
      listedAt: resolveString(raw, fields.listedAt),
      closesAt: resolveString(raw, fields.closesAt),
      soldPriceExGst: sold.priceExGst,
      soldAt: resolveString(raw, fields.soldAt),
      raw,
      contentHash: contentHash({
        title,
        priceExGst: price.priceExGst,
        sellerName: resolveString(raw, fields.sellerName),
      }),
    }
  },
}
