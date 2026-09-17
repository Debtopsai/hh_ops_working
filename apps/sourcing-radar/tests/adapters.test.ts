import { describe, expect, it } from 'vitest'
import { readPath, resolveField, resolveString, resolveStringArray } from '@/adapters/mapping'
import { htmlListingAdapter } from '@/adapters/html-listing'
import { jsonCatalogueAdapter, validateJsonCatalogueConfig } from '@/adapters/json-catalogue'
import { AdapterNotConfiguredError, type AdapterContext } from '@/adapters/types'
import { getAdapter, AdapterNotBuiltError } from '@/adapters/registry'
import type { SourceRow } from '@/lib/types'
import { noSleep, syntheticAuctionSource } from './support/fixtures'

describe('the mapping engine', () => {
  it('reads dotted and bracketed paths', () => {
    const payload = { lot: { images: [{ url: 'a.jpg' }, { url: 'b.jpg' }] } }
    expect(readPath(payload, 'lot.images[1].url')).toBe('b.jpg')
    expect(readPath(payload, 'lot.missing.url')).toBeUndefined()
  })

  it('tries fallback paths in order, which is how a platform rename stays a config change', () => {
    expect(resolveString({ heading: 'Rational' }, { paths: ['title', 'name', 'heading'] })).toBe('Rational')
  })

  it('applies transforms', () => {
    expect(resolveField({ body: '<p>Ex cafe &nbsp; unit</p>' }, { path: 'body', transforms: ['stripHtml'] })).toBe(
      'Ex cafe unit',
    )
    expect(resolveField({ when: '2026-09-24T19:00:00+12:00' }, { path: 'when', transforms: ['isoDate'] })).toBe(
      '2026-09-24T07:00:00.000Z',
    )
    expect(
      resolveField({ href: '/lot/1' }, { path: 'href', transforms: ['absoluteUrl'], baseUrl: 'https://x.test' }),
    ).toBe('https://x.test/lot/1')
  })

  it('absolutises every image in a list', () => {
    expect(
      resolveStringArray({ images: ['/a.jpg', 'https://cdn.test/b.jpg'] }, { path: 'images', baseUrl: 'https://x.test' }),
    ).toEqual(['https://x.test/a.jpg', 'https://cdn.test/b.jpg'])
  })
})

describe('an undiscovered config', () => {
  it('names every missing key rather than quietly fetching nothing', () => {
    const missing = validateJsonCatalogueConfig('all_about_auctions', {})
    expect(missing).toContain('config.endpoints')
    expect(missing).toContain('config.itemsPath')
    expect(missing).toContain('config.fields')
  })

  it('treats an unconfirmed config as missing, even when the values look complete', () => {
    const config = { ...(syntheticAuctionSource().config as any), discovered: false }
    expect(validateJsonCatalogueConfig('x', config)[0]).toContain('config.discovered')
  })

  it('throws AdapterNotConfiguredError with the discovery doc in the message', async () => {
    const ctx = context(syntheticAuctionSource({ config: {} }))
    await expect(jsonCatalogueAdapter.fetch(ctx)).rejects.toBeInstanceOf(AdapterNotConfiguredError)
    await expect(jsonCatalogueAdapter.fetch(ctx)).rejects.toThrow(/docs\/DISCOVERY\.md/)
  })
})

describe('the adapter registry', () => {
  it('reports Phase 2 and Phase 3 adapters as not built rather than as unknown', () => {
    expect(() => getAdapter('email_inbound')).toThrow(AdapterNotBuiltError)
    expect(() => getAdapter('extension')).toThrow(/Phase 3/)
  })
})

describe('the Turners style HTML adapter', () => {
  const html = `
    <ul>
      <li class="listing">
        <a class="title" href="/listing/9001">Irinox blast chiller</a>
        <img class="thumb" src="/img/9001.jpg">
        <span class="price">$4,600</span>
        <span class="location">Turners Palmerston North Trucks and Machinery</span>
      </li>
      <li class="listing">
        <a class="title" href="/listing/9002">Commercial kitchen shelving rack</a>
        <img class="thumb" src="/img/9002.jpg">
        <span class="price">Pricing coming soon</span>
        <span class="location">Timaru</span>
      </li>
    </ul>`

  const source: SourceRow = {
    slug: 'turners',
    name: 'Turners General Goods',
    adapterType: 'html_listing',
    enabled: true,
    pollIntervalSeconds: 3600,
    regionDefault: null,
    buyersPremiumPct: null,
    buyersPremiumBasis: null,
    config: {
      discovered: true,
      baseUrl: 'https://www.turners.test',
      searchUrlTemplate: 'https://www.turners.test/search?keyword={query}&page={page}',
      itemSelector: 'li.listing',
      fields: {
        title: { selector: 'a.title' },
        url: { selector: 'a.title', attr: 'href' },
        image: { selector: 'img.thumb', attr: 'src' },
        price: { selector: 'span.price' },
        region: { selector: 'span.location' },
        externalId: { selector: 'a.title', attr: 'href', regex: '/(\\d+)$' },
      },
    },
  }

  it('reads cards off a server rendered page and normalises them', async () => {
    const ctx = context(source, ['blast chiller'], html)
    const items = await htmlListingAdapter.fetch(ctx)
    expect(items).toHaveLength(2)

    const chiller = htmlListingAdapter.normalise(items[0], ctx)!
    expect(chiller.title).toBe('Irinox blast chiller')
    expect(chiller.url).toBe('https://www.turners.test/listing/9001')
    expect(chiller.priceExGst).toBe(4600)
    expect(chiller.region).toBe('Manawatu-Whanganui')
    expect(chiller.outOfRegion).toBe(true)
  })

  it('writes "Pricing coming soon" as a null price, never zero, so the lot still surfaces', async () => {
    const ctx = context(source, ['shelving'], html)
    const items = await htmlListingAdapter.fetch(ctx)
    const rack = htmlListingAdapter.normalise(items[1], ctx)!
    expect(rack.priceExGst).toBeNull()
    expect(rack.title).toBe('Commercial kitchen shelving rack')
    expect(rack.region).toBe('Canterbury')
  })

  it('searches nothing when no active watch term applies to it', async () => {
    const ctx = context(source, [], html)
    expect(await htmlListingAdapter.fetch(ctx)).toHaveLength(0)
  })
})

function context(source: SourceRow, searchQueries: string[] = [], body = '{}'): AdapterContext {
  return {
    source,
    homeRegion: 'Auckland',
    searchQueries,
    fetchImpl: (async () =>
      new Response(body, { status: 200, headers: { 'content-type': 'text/html' } })) as unknown as typeof fetch,
    sleepImpl: noSleep,
    now: () => new Date('2026-09-18T02:00:00Z'),
    log: () => {},
  }
}
