import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { SourceRow } from '@/lib/types'
import type { WatchTerm } from '@/lib/matching'
import type { AlertRecipient } from '@/ingest/store'

export function loadFixture(name: string): string {
  return readFileSync(join(__dirname, '..', 'fixtures', name), 'utf8')
}

/**
 * A source configured against a made up endpoint and a made up payload shape.
 * The real values are discovered against the live sites, see docs/DISCOVERY.md.
 */
export function syntheticAuctionSource(overrides: Partial<SourceRow> = {}): SourceRow {
  return {
    slug: 'all_about_auctions',
    name: 'All About Auctions',
    adapterType: 'json_catalogue',
    enabled: true,
    pollIntervalSeconds: 1800,
    regionDefault: 'Auckland',
    buyersPremiumPct: 17.25,
    buyersPremiumBasis: 'inc_gst',
    config: {
      discovered: true,
      baseUrl: 'https://auctions.example.test',
      priceBasisDefault: 'inc_gst',
      itemsPath: 'result.lots',
      endpoints: [{ label: 'catering', url: 'https://auctions.example.test/api/catalogue' }],
      fields: {
        externalId: { path: 'lotId' },
        title: { path: 'name', transforms: ['trim'] },
        description: { path: 'details', transforms: ['stripHtml'] },
        price: { path: 'currentBid' },
        images: { path: 'images', transforms: ['array'], baseUrl: 'https://auctions.example.test' },
        url: { path: 'detailUrl', transforms: ['absoluteUrl'], baseUrl: 'https://auctions.example.test' },
        lotNumber: { path: 'lotNumber' },
        auctionName: { path: 'auction.title' },
        closesAt: { path: 'auction.closes', transforms: ['isoDate'] },
        viewingDetails: { path: 'viewing' },
        region: { path: 'location' },
      },
    },
    ...overrides,
  }
}

export function watchTerm(overrides: Partial<WatchTerm> & { id: string; label: string; keywords: string[] }): WatchTerm {
  return {
    negativeKeywords: [],
    category: null,
    maxPriceExGst: null,
    region: null,
    sourceSlugs: [],
    active: true,
    ...overrides,
  }
}

export function recipient(overrides: Partial<AlertRecipient> & { userId: string; email: string }): AlertRecipient {
  return {
    displayName: null,
    whatsappNumber: '+6421000000',
    whatsappOptIn: true,
    emailAlerts: true,
    quietHoursStart: 21,
    quietHoursEnd: 6,
    timezone: 'Pacific/Auckland',
    ...overrides,
  }
}

/** Skips the real rate limiter and backoff waits in a test. */
export const noSleep = async () => {}

/** A fetch stub that returns the same JSON body for every request. */
export function jsonFetch(body: string, status = 200): typeof fetch {
  return (async () =>
    new Response(body, { status, headers: { 'content-type': 'application/json' } })) as unknown as typeof fetch
}
