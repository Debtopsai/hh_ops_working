/**
 * In memory store used to drive the ingest runner and the alert dispatcher end
 * to end without a database. The identity rules it enforces mirror the unique
 * indexes in 0001_init.sql.
 */

import type { AlertRecipient, IngestStore, StoredListing, UpsertResult } from '@/ingest/store'
import type { AlertRecord, AlertStore } from '@/alerts/dispatch'
import type { PendingAlert } from '@/alerts/planner'
import type { AlertListing } from '@/alerts/templates'
import type { NormalisedListing, SourceRow } from '@/lib/types'
import type { WatchTerm, TermMatch } from '@/lib/matching'
import type { DedupeCandidate } from '@/lib/dedupe'

export interface MemoryRun {
  id: string
  sourceSlug: string
  startedAt: string
  finishedAt: string | null
  status: string
  listingsSeen: number
  listingsNew: number
  error: string | null
  detail: Record<string, unknown>
}

export interface QueueRow extends PendingAlert {
  deliverAfter: string
  dispatchedAt: string | null
}

export class MemoryStore implements IngestStore, AlertStore {
  sources: SourceRow[] = []
  terms: WatchTerm[] = []
  globalNegatives: string[] = []
  homeRegion = 'Auckland'
  listings: StoredListing[] = []
  matches = new Map<string, TermMatch[]>()
  runs: MemoryRun[] = []
  duplicates: Array<{ a: string; b: string; similarity: number; reasons: string[] }> = []
  healthAlerts: Array<{ sourceSlug: string; reason: string; detail: string }> = []
  recipients: AlertRecipient[] = []
  queue: QueueRow[] = []
  alerts: AlertRecord[] = []
  cachedImages: Array<{ listingId: string; imageUrl: string }> = []
  dispatchConfig = { digestThreshold: 5, alertsPerRecipientPerHour: 6 }

  private nextId = 1
  private id(prefix: string) {
    return `${prefix}-${this.nextId++}`
  }

  async getSource(slug: string) {
    return this.sources.find((source) => source.slug === slug) ?? null
  }
  async listEnabledSources() {
    return this.sources.filter((source) => source.enabled)
  }
  async getHomeRegion() {
    return this.homeRegion
  }
  async getActiveWatchTerms() {
    return this.terms.filter((term) => term.active)
  }
  async getGlobalNegativeKeywords() {
    return this.globalNegatives
  }

  async startRun(sourceSlug: string) {
    const run: MemoryRun = {
      id: this.id('run'),
      sourceSlug,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      status: 'running',
      listingsSeen: 0,
      listingsNew: 0,
      error: null,
      detail: {},
    }
    this.runs.push(run)
    return run.id
  }

  async finishRun(runId: string, update: any) {
    const run = this.runs.find((candidate) => candidate.id === runId)
    if (!run) return
    Object.assign(run, {
      finishedAt: new Date().toISOString(),
      status: update.status,
      listingsSeen: update.listingsSeen,
      listingsNew: update.listingsNew,
      error: update.error ?? null,
      detail: update.detail ?? {},
    })
  }

  async countConsecutiveEmptyRuns(sourceSlug: string, limit: number) {
    const finished = this.runs
      .filter((run) => run.sourceSlug === sourceSlug && run.finishedAt)
      .slice()
      .reverse()
      .slice(0, limit)
    let streak = 0
    for (const run of finished) {
      if (run.status === 'ok' && run.listingsSeen === 0) streak += 1
      else break
    }
    return streak
  }

  async raiseSourceHealthAlert(sourceSlug: string, reason: string, detail: string) {
    if (this.healthAlerts.some((alert) => alert.sourceSlug === sourceSlug && alert.reason === reason)) return
    this.healthAlerts.push({ sourceSlug, reason, detail })
  }

  async upsertListing(listing: NormalisedListing): Promise<UpsertResult> {
    const existing = this.listings.find((candidate) =>
      candidate.sourceSlug === listing.sourceSlug &&
      (listing.externalId
        ? candidate.externalId === listing.externalId
        : candidate.externalId === null && candidate.contentHash === listing.contentHash),
    )
    if (existing) {
      existing.lastSeenAt = new Date().toISOString()
      existing.priceExGst = listing.priceExGst
      existing.closesAt = listing.closesAt
      return { listing: existing, isNew: false }
    }
    const stored: StoredListing = {
      ...listing,
      id: this.id('listing'),
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    }
    this.listings.push(stored)
    return { listing: stored, isNew: true }
  }

  async replaceMatches(listingId: string, matches: TermMatch[]) {
    this.matches.set(listingId, matches)
  }

  async recentListingsForDedupe(_sinceIso: string, excludeSourceSlug: string): Promise<DedupeCandidate[]> {
    return this.listings
      .filter((listing) => listing.sourceSlug !== excludeSourceSlug)
      .map((listing) => ({
        id: listing.id,
        sourceSlug: listing.sourceSlug,
        title: listing.title,
        priceExGst: listing.priceExGst,
        imagePhash: null,
      }))
  }

  async recordDuplicateCandidate(a: string, b: string, similarity: number, reasons: string[]) {
    if (this.duplicates.some((pair) => pair.a === a && pair.b === b)) return
    this.duplicates.push({ a, b, similarity, reasons })
  }

  async cacheImage(listingId: string, imageUrl: string) {
    this.cachedImages.push({ listingId, imageUrl })
  }

  async listAlertRecipients() {
    return this.recipients
  }

  async claimAlert(listingId: string, userId: string, runId: string, deliverAfterIso: string, reason: string) {
    if (this.queue.some((row) => row.listingId === listingId && row.userId === userId)) return false
    this.queue.push({
      id: this.id('queue'),
      listingId,
      userId,
      runId,
      reason,
      deliverAfter: deliverAfterIso,
      dispatchedAt: null,
    })
    return true
  }

  async getDispatchConfig() {
    return this.dispatchConfig
  }

  async listPendingAlerts(nowIso: string) {
    return this.queue
      .filter((row) => row.dispatchedAt === null && row.deliverAfter <= nowIso)
      .map(({ id, listingId, userId, runId, reason }) => ({ id, listingId, userId, runId, reason }))
  }

  async countAlertsSentInLastHour(nowIso: string) {
    const since = new Date(new Date(nowIso).getTime() - 3600_000).toISOString()
    const counts: Record<string, number> = {}
    for (const alert of this.alerts) {
      if (alert.channel !== 'whatsapp') continue
      if (alert.sentAt < since) continue
      counts[alert.userId] = (counts[alert.userId] ?? 0) + 1
    }
    return counts
  }

  async getRecipients(userIds: string[]) {
    return this.recipients.filter((recipient) => userIds.includes(recipient.userId))
  }

  async getAlertListings(listingIds: string[]): Promise<AlertListing[]> {
    return this.listings
      .filter((listing) => listingIds.includes(listing.id))
      .map((listing) => ({
        id: listing.id,
        title: listing.title,
        priceExGst: listing.priceExGst,
        priceBasis: listing.priceBasis,
        sourceName: this.sources.find((source) => source.slug === listing.sourceSlug)?.name ?? listing.sourceSlug,
        region: listing.region,
        outOfRegion: listing.outOfRegion,
        matchedTerm: this.matches.get(listing.id)?.[0]?.label ?? null,
        closesAt: listing.closesAt,
        url: listing.url,
        imageUrl: listing.imageUrls[0] ?? null,
      }))
  }

  async markQueueDispatched(queueIds: string[], nowIso: string) {
    for (const row of this.queue) if (queueIds.includes(row.id)) row.dispatchedAt = nowIso
  }

  async deferQueueItems(queueIds: string[], deliverAfterIso: string) {
    for (const row of this.queue) if (queueIds.includes(row.id)) row.deliverAfter = deliverAfterIso
  }

  async recordAlert(record: AlertRecord) {
    this.alerts.push(record)
  }
}
