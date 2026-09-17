/**
 * Generic HTML listing adapter.
 *
 * Turners is the source this exists for. Its result pages are server rendered,
 * so a plain fetch works and there is no JSON endpoint to hunt for.
 *
 * Two findings from inspecting Turners shape this adapter (see 6.1d):
 *
 *   1. It is driven by keyword search across all General Goods, not by the
 *      Business and Industry category. That category returned 21 results of
 *      which two were relevant, and it misses hospitality equipment listed
 *      elsewhere. The watch terms do the filtering.
 *   2. Many listings have no price. Items awaiting valuation show "Pricing
 *      coming soon". Those are written with a null price, never skipped and
 *      never zero, and the feed renders them as "price TBC".
 *
 * As with the JSON adapter, the URL template and the selectors are discovered
 * against the live site and live in the source's config column.
 */

import * as cheerio from 'cheerio'
import type { Element } from 'domhandler'
import { politeFetch } from '@/lib/http'
import { contentHash } from '@/lib/hash'
import { detectBasis, parsePrice, toExGst, type PriceBasis } from '@/lib/money'
import { isOutOfRegion, normaliseRegion, type Region } from '@/lib/region'
import type { NormalisedListing, RawItem } from '@/lib/types'
import { AdapterFetchError, AdapterNotConfiguredError, type Adapter, type AdapterContext } from './types'

export interface HtmlFieldSpec {
  selector?: string
  /** 'text' (the default), or an attribute name such as 'href' or 'src'. */
  attr?: string
  /** Applied to the extracted string, first capture group wins. */
  regex?: string
  /** Used to absolutise hrefs and image sources. */
  baseUrl?: string
  const?: string
}

export interface HtmlListingConfig {
  discovered?: boolean
  discoveredAt?: string
  discoveredBy?: string
  notes?: string
  baseUrl?: string
  userAgent?: string
  /** "https://.../Search?keyword={query}&page={page}". {query} is required. */
  searchUrlTemplate?: string
  maxPages?: number
  /** Selector for one result card. */
  itemSelector?: string
  priceBasisDefault?: PriceBasis
  fields?: Record<string, HtmlFieldSpec>
}

export function validateHtmlListingConfig(config: HtmlListingConfig): string[] {
  const missing: string[] = []
  if (!config.discovered) missing.push('config.discovered (no one has confirmed these selectors against the live site)')
  if (!config.searchUrlTemplate) missing.push('config.searchUrlTemplate')
  else if (!config.searchUrlTemplate.includes('{query}')) missing.push('config.searchUrlTemplate must contain {query}')
  if (!config.itemSelector) missing.push('config.itemSelector')
  if (!config.fields?.title) missing.push('config.fields.title')
  if (!config.fields?.url) missing.push('config.fields.url')
  return missing
}

function extract(
  $: cheerio.CheerioAPI,
  element: Element,
  spec: HtmlFieldSpec | undefined,
  baseUrl: string | undefined,
): string | null {
  if (!spec) return null
  if (spec.const !== undefined) return spec.const
  if (!spec.selector) return null

  const node = spec.selector === ':self' ? $(element) : $(element).find(spec.selector).first()
  if (node.length === 0) return null

  let value = spec.attr && spec.attr !== 'text' ? node.attr(spec.attr) ?? null : node.text()
  if (value === null) return null
  value = value.replace(/\s+/g, ' ').trim()
  if (!value) return null

  if (spec.regex) {
    const match = new RegExp(spec.regex).exec(value)
    value = match ? (match[1] ?? match[0]) : ''
    if (!value) return null
  }

  const base = spec.baseUrl ?? baseUrl
  if (base && (spec.attr === 'href' || spec.attr === 'src' || spec.attr === 'data-src')) {
    try {
      return new URL(value, base).toString()
    } catch {
      return value
    }
  }
  return value
}

export const htmlListingAdapter: Adapter = {
  type: 'html_listing',

  async fetch(ctx: AdapterContext): Promise<RawItem[]> {
    const config = ctx.source.config as HtmlListingConfig
    const missing = validateHtmlListingConfig(config)
    if (missing.length > 0) throw new AdapterNotConfiguredError(ctx.source.slug, missing)

    const queries = ctx.searchQueries.length > 0 ? ctx.searchQueries : []
    if (queries.length === 0) {
      ctx.log('no active watch term keywords apply to this source, nothing to search')
      return []
    }

    const items: RawItem[] = []
    const maxPages = Math.max(1, config.maxPages ?? 1)

    for (const query of queries) {
      for (let page = 1; page <= maxPages; page += 1) {
        const url = config.searchUrlTemplate!
          .replace('{query}', encodeURIComponent(query))
          .replace('{page}', String(page))

        const response = await politeFetch(url, {
          headers: {
            accept: 'text/html,application/xhtml+xml',
            ...(config.userAgent ? { 'user-agent': config.userAgent } : {}),
          },
          fetchImpl: ctx.fetchImpl,
          sleepImpl: ctx.sleepImpl,
        })
        if (!response.ok) {
          throw new AdapterFetchError(ctx.source.slug, `search "${query}" returned HTTP ${response.status}`)
        }

        const html = await response.text()
        const $ = cheerio.load(html)
        const cards = $(config.itemSelector!).toArray()
        ctx.log(`search "${query}" page ${page}: ${cards.length} cards`)

        for (const card of cards) {
          const fields: Record<string, unknown> = { matchedQuery: query, sourceUrl: url }
          for (const [name, spec] of Object.entries(config.fields ?? {})) {
            fields[name] = extract($, card as Element, spec, config.baseUrl)
          }
          items.push({ sourceSlug: ctx.source.slug, raw: fields })
        }

        // Stop walking pages once a page comes back empty rather than
        // requesting every configured page every run.
        if (cards.length === 0) break
      }
    }
    return items
  },

  normalise(item: RawItem, ctx: AdapterContext): NormalisedListing | null {
    const config = ctx.source.config as HtmlListingConfig
    const raw = item.raw as Record<string, string | null>

    const title = raw.title
    const url = raw.url
    if (!title || !url) return null

    // "Pricing coming soon" parses to null, which is a real and useful value.
    const priceText = raw.price ?? null
    const basis = detectBasis(priceText) !== 'unknown' ? detectBasis(priceText) : config.priceBasisDefault ?? 'unknown'
    const price = toExGst(parsePrice(priceText), basis)

    const regionRaw = raw.region ?? null
    const region: Region = normaliseRegion(regionRaw, normaliseRegion(ctx.source.regionDefault, 'Unknown'))

    return {
      sourceSlug: ctx.source.slug,
      externalId: raw.externalId ?? null,
      title,
      description: raw.description ?? null,
      priceExGst: price.priceExGst,
      priceOriginal: price.priceOriginal,
      priceBasis: price.basis,
      currency: 'NZD',
      url,
      imageUrls: raw.image ? [raw.image] : [],
      sellerName: raw.sellerName ?? ctx.source.name,
      region,
      regionRaw,
      outOfRegion: isOutOfRegion(region, normaliseRegion(ctx.homeRegion, 'Auckland')),
      lotNumber: raw.lotNumber ?? null,
      auctionName: raw.auctionName ?? null,
      viewingDetails: raw.viewingDetails ?? null,
      listedAt: raw.listedAt ?? null,
      closesAt: raw.closesAt ?? null,
      soldPriceExGst: null,
      soldAt: null,
      raw: item.raw,
      contentHash: contentHash({ title, priceExGst: price.priceExGst, sellerName: raw.sellerName ?? null }),
    }
  },
}
