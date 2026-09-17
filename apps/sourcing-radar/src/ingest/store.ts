/**
 * Persistence seam for the ingest runner.
 *
 * The runner owns the rules (dedupe, matching, alert queueing) and this
 * interface owns the rows. Keeping them apart means the rules are tested
 * against an in memory store, which is what makes "no duplicate on the
 * following poll" and "no alert fires twice" testable rather than hoped for.
 */

import type { NormalisedListing, SourceRow } from '@/lib/types'
import type { WatchTerm } from '@/lib/matching'
import type { TermMatch } from '@/lib/matching'
import type { DedupeCandidate } from '@/lib/dedupe'

export interface StoredListing extends NormalisedListing {
  id: string
  firstSeenAt: string
  lastSeenAt: string
}

export interface UpsertResult {
  listing: StoredListing
  isNew: boolean
}

export interface AlertRecipient {
  userId: string
  email: string
  displayName: string | null
  whatsappNumber: string | null
  whatsappOptIn: boolean
  emailAlerts: boolean
  quietHoursStart: number
  quietHoursEnd: number
  timezone: string
}

export interface IngestStore {
  getSource(slug: string): Promise<SourceRow | null>
  listEnabledSources(): Promise<SourceRow[]>
  getHomeRegion(): Promise<string>
  getActiveWatchTerms(): Promise<WatchTerm[]>
  getGlobalNegativeKeywords(): Promise<string[]>

  startRun(sourceSlug: string): Promise<string>
  finishRun(
    runId: string,
    update: {
      status: 'ok' | 'error' | 'not_configured' | 'skipped'
      listingsSeen: number
      listingsNew: number
      error?: string | null
      detail?: Record<string, unknown>
    },
  ): Promise<void>
  countConsecutiveEmptyRuns(sourceSlug: string, limit: number): Promise<number>
  raiseSourceHealthAlert(sourceSlug: string, reason: string, detail: string): Promise<void>

  upsertListing(listing: NormalisedListing): Promise<UpsertResult>
  replaceMatches(listingId: string, matches: TermMatch[]): Promise<void>
  recentListingsForDedupe(sinceIso: string, excludeSourceSlug: string): Promise<DedupeCandidate[]>
  recordDuplicateCandidate(a: string, b: string, similarity: number, reasons: string[]): Promise<void>

  /**
   * Copy a listing's first image into our own storage and hash it. Optional so
   * an in memory store used in a test does not have to care, and best effort so
   * a broken image never costs us the listing.
   */
  cacheImage?(listingId: string, imageUrl: string): Promise<void>

  listAlertRecipients(): Promise<AlertRecipient[]>
  /**
   * Claims the (listing, recipient) pair. Returns false when the pair already
   * exists, which is how a listing re seen on the next poll, or two overlapping
   * runs, cannot produce a second alert.
   */
  claimAlert(listingId: string, userId: string, runId: string, deliverAfterIso: string, reason: string): Promise<boolean>
}
