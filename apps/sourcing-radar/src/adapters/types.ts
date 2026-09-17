/**
 * The adapter contract.
 *
 * fetch() returns raw items, normalise() maps one to the listing shape, and the
 * runner owns dedupe, matching, persistence and alerting. Adding a source means
 * adding one adapter file and one `sources` row, and for a house on a platform
 * we already support it is the row alone.
 *
 * An adapter that breaks must degrade that source only. The runner catches
 * everything thrown here and records it against `ingestion_runs`, so a broken
 * adapter is visible on Source health rather than silent.
 */

import type { NormalisedListing, RawItem, SourceRow } from '@/lib/types'

export interface AdapterContext {
  source: SourceRow
  homeRegion: string
  /**
   * Keywords from the active watch terms, for sources that are driven by search
   * rather than by a catalogue. Turners is the case that forced this: its
   * obvious category is the wrong one, so the adapter searches all General
   * Goods and lets the watch terms do the filtering (see 6.1d).
   */
  searchQueries: string[]
  /** Injected so tests and the discovery harness can drive an adapter without the network. */
  fetchImpl: typeof fetch
  /** Injected so a test does not sit through the real rate limiter and backoff. */
  sleepImpl?: (ms: number) => Promise<void>
  now: () => Date
  log: (message: string, detail?: Record<string, unknown>) => void
}

export interface Adapter {
  readonly type: SourceRow['adapterType']
  fetch(ctx: AdapterContext): Promise<RawItem[]>
  normalise(item: RawItem, ctx: AdapterContext): NormalisedListing | null
}

/**
 * Thrown when a source row has no discovered endpoint or field mapping yet.
 *
 * The PRD is explicit that endpoints are discovered at build time and not
 * invented, so an unconfigured source fails loudly with the discovery steps in
 * the message rather than guessing a URL and reporting zero listings.
 */
export class AdapterNotConfiguredError extends Error {
  readonly missing: string[]

  constructor(sourceSlug: string, missing: string[]) {
    super(
      `Source "${sourceSlug}" has no discovered configuration yet. Missing: ${missing.join(', ')}. ` +
        'Follow docs/DISCOVERY.md, then write the result into the sources.config column.',
    )
    this.name = 'AdapterNotConfiguredError'
    this.missing = missing
  }
}

export class AdapterFetchError extends Error {
  constructor(sourceSlug: string, detail: string) {
    super(`Source "${sourceSlug}" fetch failed: ${detail}`)
    this.name = 'AdapterFetchError'
  }
}
