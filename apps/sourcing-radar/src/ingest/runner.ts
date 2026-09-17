/**
 * The ingest runner.
 *
 * One pass over one source: fetch, normalise, dedupe, match, persist, queue
 * alerts. Everything an adapter can throw is caught here and written to
 * `ingestion_runs`, because adapter isolation is the central non functional
 * requirement: a broken source degrades that source and nothing else.
 */

import { getAdapter, AdapterNotBuiltError } from '@/adapters/registry'
import { AdapterNotConfiguredError, type AdapterContext } from '@/adapters/types'
import { DUPLICATE_THRESHOLD, findDuplicateCandidates } from '@/lib/dedupe'
import { matchListing, type WatchTerm } from '@/lib/matching'
import type { NormalisedListing, SourceRow } from '@/lib/types'
import type { IngestStore, StoredListing } from './store'
import { nextDeliveryTime } from '@/alerts/quiet-hours'

export interface RunSourceOptions {
  store: IngestStore
  sourceSlug: string
  fetchImpl?: typeof fetch
  sleepImpl?: (ms: number) => Promise<void>
  now?: () => Date
  /** Items pushed in rather than polled: manual clips and extension posts. */
  pushedItems?: Array<Record<string, unknown>>
  /** How far back to look for a cross source duplicate. */
  dedupeWindowHours?: number
  logger?: (message: string, detail?: Record<string, unknown>) => void
}

export interface RunSourceResult {
  runId: string | null
  status: 'ok' | 'error' | 'not_configured' | 'skipped'
  listingsSeen: number
  listingsNew: number
  matched: number
  queuedAlerts: number
  duplicateCandidates: number
  error?: string
}

const EMPTY_RUN_STREAK_BEFORE_ALERT = 3

/** Keywords a search driven source should query, taken from the active terms. */
export function searchQueriesForSource(terms: WatchTerm[], sourceSlug: string): string[] {
  const queries = new Set<string>()
  for (const term of terms) {
    if (!term.active) continue
    if (term.sourceSlugs.length > 0 && !term.sourceSlugs.includes(sourceSlug)) continue
    for (const keyword of term.keywords) {
      const trimmed = keyword.trim()
      if (trimmed) queries.add(trimmed)
    }
  }
  return [...queries]
}

export async function runSource(options: RunSourceOptions): Promise<RunSourceResult> {
  const {
    store,
    sourceSlug,
    fetchImpl = fetch,
    sleepImpl,
    now = () => new Date(),
    pushedItems,
    dedupeWindowHours = 72,
    logger = () => {},
  } = options

  const source = await store.getSource(sourceSlug)
  if (!source) {
    return { runId: null, status: 'error', listingsSeen: 0, listingsNew: 0, matched: 0, queuedAlerts: 0, duplicateCandidates: 0, error: `unknown source "${sourceSlug}"` }
  }

  const runId = await store.startRun(sourceSlug)
  const result: RunSourceResult = {
    runId,
    status: 'ok',
    listingsSeen: 0,
    listingsNew: 0,
    matched: 0,
    queuedAlerts: 0,
    duplicateCandidates: 0,
  }

  try {
    const [terms, globalNegatives, homeRegion] = await Promise.all([
      store.getActiveWatchTerms(),
      store.getGlobalNegativeKeywords(),
      store.getHomeRegion(),
    ])

    const adapter = getAdapter(source.adapterType)
    const ctx: AdapterContext = {
      source,
      homeRegion,
      searchQueries: searchQueriesForSource(terms, source.slug),
      fetchImpl,
      sleepImpl,
      now,
      log: (message, detail) => logger(`[${source.slug}] ${message}`, detail),
    }

    const rawItems = pushedItems
      ? pushedItems.map((raw) => ({ sourceSlug: source.slug, raw }))
      : await adapter.fetch(ctx)

    result.listingsSeen = rawItems.length

    const normalised: NormalisedListing[] = []
    for (const item of rawItems) {
      try {
        const listing = adapter.normalise(item, ctx)
        if (listing) normalised.push(listing)
      } catch (error) {
        // One malformed lot must not lose the rest of the catalogue.
        logger(`[${source.slug}] normalise failed for one item`, { error: String(error) })
      }
    }

    const newListings: StoredListing[] = []
    for (const listing of normalised) {
      const { listing: stored, isNew } = await store.upsertListing(listing)
      if (isNew) {
        result.listingsNew += 1
        newListings.push(stored)

        // Source image URLs expire, so the first image is copied into our own
        // storage on first sight. A failure here is logged, never fatal.
        if (store.cacheImage && stored.imageUrls.length > 0) {
          try {
            await store.cacheImage(stored.id, stored.imageUrls[0])
          } catch (error) {
            logger(`[${source.slug}] image cache failed`, { listingId: stored.id, error: String(error) })
          }
        }
      }
    }

    // Matching and alerting apply to new listings only. A re seen listing
    // updates its price and last_seen_at and does not re alert.
    const alertable: StoredListing[] = []
    for (const listing of newListings) {
      const match = matchListing(
        {
          title: listing.title,
          description: listing.description,
          priceExGst: listing.priceExGst,
          region: listing.region,
          sourceSlug: listing.sourceSlug,
        },
        terms,
        globalNegatives,
      )
      if (match.suppressedBy) {
        logger(`[${source.slug}] suppressed by global negative "${match.suppressedBy}"`, { title: listing.title })
        continue
      }
      if (match.matches.length === 0) continue

      await store.replaceMatches(listing.id, match.matches)
      result.matched += 1
      alertable.push(listing)
    }

    // Cross source duplicates. These group cards in the feed under both source
    // badges. Nothing is merged and nothing is suppressed.
    if (newListings.length > 0) {
      const sinceIso = new Date(now().getTime() - dedupeWindowHours * 3600_000).toISOString()
      const others = await store.recentListingsForDedupe(sinceIso, source.slug)
      for (const listing of newListings) {
        const candidates = findDuplicateCandidates(
          {
            id: listing.id,
            sourceSlug: listing.sourceSlug,
            title: listing.title,
            priceExGst: listing.priceExGst,
            imagePhash: null,
          },
          others,
          DUPLICATE_THRESHOLD,
        )
        for (const candidate of candidates) {
          const [a, b] = [listing.id, candidate.other.id].sort()
          await store.recordDuplicateCandidate(a, b, candidate.similarity, candidate.reasons)
          result.duplicateCandidates += 1
        }
      }
    }

    // Queue one alert per listing per recipient. Claiming the pair before any
    // send is what makes "no alert fires twice for the same listing" hold even
    // if two runs overlap.
    if (alertable.length > 0) {
      const recipients = await store.listAlertRecipients()
      for (const recipient of recipients) {
        for (const listing of alertable) {
          const { deliverAt, reason } = nextDeliveryTime(now(), recipient)
          const claimed = await store.claimAlert(listing.id, recipient.userId, runId, deliverAt.toISOString(), reason)
          if (claimed) result.queuedAlerts += 1
        }
      }
    }

    // Three consecutive empty runs means the page shape probably changed.
    if (result.listingsSeen === 0) {
      const streak = await store.countConsecutiveEmptyRuns(source.slug, EMPTY_RUN_STREAK_BEFORE_ALERT)
      if (streak + 1 >= EMPTY_RUN_STREAK_BEFORE_ALERT) {
        await store.raiseSourceHealthAlert(
          source.slug,
          'zero listings on three consecutive runs',
          'The endpoint or the selectors have most likely changed. Re run the discovery steps in docs/DISCOVERY.md.',
        )
      }
    }

    await store.finishRun(runId, {
      status: 'ok',
      listingsSeen: result.listingsSeen,
      listingsNew: result.listingsNew,
      detail: {
        matched: result.matched,
        queuedAlerts: result.queuedAlerts,
        duplicateCandidates: result.duplicateCandidates,
      },
    })
    return result
  } catch (error) {
    const notConfigured = error instanceof AdapterNotConfiguredError || error instanceof AdapterNotBuiltError
    const message = error instanceof Error ? error.message : String(error)

    await store.finishRun(runId, {
      status: notConfigured ? 'not_configured' : 'error',
      listingsSeen: result.listingsSeen,
      listingsNew: result.listingsNew,
      error: message,
      detail: notConfigured && error instanceof AdapterNotConfiguredError ? { missing: error.missing } : {},
    })

    if (!notConfigured) {
      await store.raiseSourceHealthAlert(source.slug, 'adapter threw', message)
    }

    return {
      ...result,
      status: notConfigured ? 'not_configured' : 'error',
      error: message,
    }
  }
}

/**
 * Run every enabled source in series. One failing adapter is recorded and the
 * loop carries on, which is the isolation requirement made concrete.
 */
export async function runAllSources(options: Omit<RunSourceOptions, 'sourceSlug'>): Promise<RunSourceResult[]> {
  const sources = await options.store.listEnabledSources()
  const results: RunSourceResult[] = []
  for (const source of sources) {
    results.push(await runSource({ ...options, sourceSlug: source.slug }))
  }
  return results
}

export type { SourceRow }
