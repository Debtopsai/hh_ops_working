import { beforeEach, describe, expect, it } from 'vitest'
import { runAllSources, runSource } from '@/ingest/runner'
import { resetRateLimiterForTests } from '@/lib/http'
import { MemoryStore } from './support/memory-store'
import { jsonFetch, loadFixture, noSleep, recipient, syntheticAuctionSource, watchTerm } from './support/fixtures'

const CATALOGUE = loadFixture('synthetic-catalogue.json')

function storeWithAuctionSource() {
  const store = new MemoryStore()
  store.sources = [syntheticAuctionSource()]
  store.terms = [
    watchTerm({ id: 'rational', label: 'Rational', keywords: ['rational'] }),
    watchTerm({ id: 'glasswasher', label: 'Glasswasher', keywords: ['glasswasher', 'glass washer'] }),
    watchTerm({ id: 'hobart', label: 'Hobart', keywords: ['hobart'] }),
  ]
  store.globalNegatives = ['domestic', 'kitchenaid']
  store.recipients = [
    recipient({ userId: 'founder', email: 'founder@washpro.co.nz' }),
    recipient({ userId: 'support1', email: 'one@washpro.co.nz' }),
    recipient({ userId: 'support2', email: 'two@washpro.co.nz' }),
  ]
  return store
}

/** 2pm on a weekday in Auckland, well outside anyone's quiet hours. */
const daytime = () => new Date('2026-09-18T02:00:00Z')

beforeEach(() => resetRateLimiterForTests())

describe('a new catering lot reaching the feed', () => {
  it('lands matched, priced ex GST and linked back to the lot', async () => {
    const store = storeWithAuctionSource()
    const result = await runSource({
      store,
      sourceSlug: 'all_about_auctions',
      fetchImpl: jsonFetch(CATALOGUE),
      now: daytime,
      sleepImpl: noSleep,
    })

    expect(result.status).toBe('ok')
    expect(result.listingsSeen).toBe(3)
    expect(result.listingsNew).toBe(3)

    const combi = store.listings.find((listing) => listing.title.includes('Rational'))!
    // $5,750 GST inclusive is $5,000 ex GST.
    expect(combi.priceExGst).toBe(5000)
    expect(combi.priceOriginal).toBe(5750)
    expect(combi.priceBasis).toBe('inc_gst')
    expect(combi.url).toBe('https://auctions.example.test/lot/10021')
    expect(combi.lotNumber).toBe('21')
    expect(combi.auctionName).toBe('Catering and Hospitality, September')
    expect(combi.viewingDetails).toBe('Thursday 9am to 4pm')
    expect(combi.region).toBe('Auckland')
    expect(combi.outOfRegion).toBe(false)
    expect(store.matches.get(combi.id)?.[0].label).toBe('Rational')
  })

  it('keeps a lot with no price as a null price, not zero', async () => {
    const store = storeWithAuctionSource()
    await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: jsonFetch(CATALOGUE), now: daytime, sleepImpl: noSleep })

    const glasswasher = store.listings.find((listing) => listing.title.includes('glasswasher'))!
    expect(glasswasher.priceExGst).toBeNull()
    expect(store.matches.get(glasswasher.id)?.[0].label).toBe('Glasswasher')
  })

  it('badges a South Island lot as out of region rather than dropping it', async () => {
    const store = storeWithAuctionSource()
    await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: jsonFetch(CATALOGUE), now: daytime, sleepImpl: noSleep })

    const glasswasher = store.listings.find((listing) => listing.title.includes('glasswasher'))!
    expect(glasswasher.region).toBe('Canterbury')
    expect(glasswasher.outOfRegion).toBe(true)
  })

  it('suppresses the domestic mixer that the brand search dragged in', async () => {
    const store = storeWithAuctionSource()
    await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: jsonFetch(CATALOGUE), now: daytime, sleepImpl: noSleep })

    const mixer = store.listings.find((listing) => listing.title.includes('stand mixer'))!
    expect(store.matches.get(mixer.id)).toBeUndefined()
    expect(store.queue.some((row) => row.listingId === mixer.id)).toBe(false)
  })

  it('queues one alert per matched listing per recipient and no more', async () => {
    const store = storeWithAuctionSource()
    await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: jsonFetch(CATALOGUE), now: daytime, sleepImpl: noSleep })

    // Two matched listings, three recipients.
    expect(store.queue).toHaveLength(6)
    expect(new Set(store.queue.map((row) => row.userId)).size).toBe(3)
  })
})

describe('the following poll', () => {
  it('produces no duplicate listing and no second alert', async () => {
    const store = storeWithAuctionSource()
    await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: jsonFetch(CATALOGUE), now: daytime, sleepImpl: noSleep })
    const second = await runSource({
      store,
      sourceSlug: 'all_about_auctions',
      fetchImpl: jsonFetch(CATALOGUE),
      now: daytime,
      sleepImpl: noSleep,
    })

    expect(second.listingsSeen).toBe(3)
    expect(second.listingsNew).toBe(0)
    expect(second.queuedAlerts).toBe(0)
    expect(store.listings).toHaveLength(3)
    expect(store.queue).toHaveLength(6)
  })

  it('updates the current bid on a re seen lot without re alerting', async () => {
    const store = storeWithAuctionSource()
    await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: jsonFetch(CATALOGUE), now: daytime, sleepImpl: noSleep })

    const raised = CATALOGUE.replace('$5,750.00 incl GST', '$6,900.00 incl GST')
    await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: jsonFetch(raised), now: daytime, sleepImpl: noSleep })

    const combi = store.listings.find((listing) => listing.title.includes('Rational'))!
    expect(combi.priceExGst).toBe(6000)
    expect(store.queue).toHaveLength(6)
  })
})

describe('adapter isolation', () => {
  it('records a source with no discovered config as not configured, naming what is missing', async () => {
    const store = storeWithAuctionSource()
    store.sources = [syntheticAuctionSource({ config: {} })]

    const result = await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: jsonFetch('{}'), now: daytime, sleepImpl: noSleep })

    expect(result.status).toBe('not_configured')
    expect(result.error).toContain('config.endpoints')
    expect(result.error).toContain('docs/DISCOVERY.md')
    expect(store.runs.at(-1)?.status).toBe('not_configured')
    // Not configured is not a health incident, it is unfinished setup.
    expect(store.healthAlerts).toHaveLength(0)
  })

  it('lets a broken source fail without touching the others', async () => {
    const store = storeWithAuctionSource()
    store.sources = [
      syntheticAuctionSource({ slug: 'broken', name: 'Broken house', config: {} }),
      syntheticAuctionSource(),
    ]

    const results = await runAllSources({ store, fetchImpl: jsonFetch(CATALOGUE), now: daytime, sleepImpl: noSleep })

    expect(results.find((run) => run.status === 'not_configured')).toBeTruthy()
    expect(results.find((run) => run.status === 'ok')?.listingsNew).toBe(3)
  })

  it('writes a thrown fetch error to the run and raises a health alert', async () => {
    const store = storeWithAuctionSource()
    const failing = (async () => {
      throw new Error('connection reset')
    }) as unknown as typeof fetch

    const result = await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: failing, now: daytime, sleepImpl: noSleep })

    expect(result.status).toBe('error')
    expect(store.runs.at(-1)?.error).toContain('connection reset')
    expect(store.healthAlerts[0].reason).toBe('adapter threw')
  })

  it('raises a health alert after three consecutive empty runs', async () => {
    const store = storeWithAuctionSource()
    const empty = jsonFetch(JSON.stringify({ result: { lots: [] } }))

    for (let run = 0; run < 3; run += 1) {
      await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: empty, now: daytime, sleepImpl: noSleep })
    }

    expect(store.healthAlerts).toHaveLength(1)
    expect(store.healthAlerts[0].reason).toBe('zero listings on three consecutive runs')
  })
})

describe('the same machine on two sources', () => {
  it('records a duplicate candidate and keeps both listings', async () => {
    const store = storeWithAuctionSource()
    store.sources = [
      syntheticAuctionSource(),
      syntheticAuctionSource({ slug: 'number8', name: 'No. 8 Solutions' }),
    ]

    await runSource({ store, sourceSlug: 'all_about_auctions', fetchImpl: jsonFetch(CATALOGUE), now: daytime, sleepImpl: noSleep })
    await runSource({ store, sourceSlug: 'number8', fetchImpl: jsonFetch(CATALOGUE), now: daytime, sleepImpl: noSleep })

    expect(store.listings).toHaveLength(6)
    expect(store.duplicates.length).toBeGreaterThanOrEqual(3)
    // Nothing merged, nothing suppressed.
    expect(store.listings.filter((listing) => listing.title.includes('Rational'))).toHaveLength(2)
  })
})
