/**
 * Supabase implementation of the ingest and alert stores.
 *
 * Runs under the service role, so it is server side only. The identity rules
 * live in the database as unique indexes rather than here: (source_slug,
 * external_id) where an external id exists, and (source_slug, content_hash)
 * where it does not.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { serviceClient } from '@/lib/supabase/service'
import type { NormalisedListing, SourceRow } from '@/lib/types'
import type { WatchTerm, TermMatch } from '@/lib/matching'
import type { DedupeCandidate } from '@/lib/dedupe'
import type { AlertRecipient, IngestStore, StoredListing, UpsertResult } from './store'
import type { AlertRecord, AlertStore } from '@/alerts/dispatch'
import type { PendingAlert } from '@/alerts/planner'
import type { AlertListing } from '@/alerts/templates'
import type { Region } from '@/lib/region'

function toSourceRow(row: any): SourceRow {
  return {
    slug: row.slug,
    name: row.name,
    adapterType: row.adapter_type,
    enabled: row.enabled,
    pollIntervalSeconds: row.poll_interval_seconds,
    regionDefault: row.region_default,
    buyersPremiumPct: row.buyers_premium_pct === null ? null : Number(row.buyers_premium_pct),
    buyersPremiumBasis: row.buyers_premium_basis,
    config: row.config ?? {},
  }
}

function toStoredListing(row: any): StoredListing {
  return {
    id: row.id,
    sourceSlug: row.source_slug,
    externalId: row.external_id,
    title: row.title,
    description: row.description,
    priceExGst: row.price_ex_gst === null ? null : Number(row.price_ex_gst),
    priceOriginal: row.price_original === null ? null : Number(row.price_original),
    priceBasis: row.price_basis,
    currency: row.currency,
    url: row.url,
    imageUrls: row.image_urls ?? [],
    sellerName: row.seller_name,
    region: row.region as Region,
    regionRaw: row.region_raw,
    outOfRegion: row.out_of_region,
    lotNumber: row.lot_number,
    auctionName: row.auction_name,
    viewingDetails: row.viewing_details,
    listedAt: row.listed_at,
    closesAt: row.closes_at,
    soldPriceExGst: row.sold_price_ex_gst === null ? null : Number(row.sold_price_ex_gst),
    soldAt: row.sold_at,
    raw: row.raw ?? {},
    contentHash: row.content_hash,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
  }
}

export class SupabaseIngestStore implements IngestStore, AlertStore {
  constructor(private readonly db: SupabaseClient = serviceClient()) {}

  // -- sources and configuration -------------------------------------------

  async getSource(slug: string): Promise<SourceRow | null> {
    const { data, error } = await this.db.from('sources').select('*').eq('slug', slug).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? toSourceRow(data) : null
  }

  async listEnabledSources(): Promise<SourceRow[]> {
    const { data, error } = await this.db.from('sources').select('*').eq('enabled', true).order('slug')
    if (error) throw new Error(error.message)
    return (data ?? []).map(toSourceRow)
  }

  async getHomeRegion(): Promise<string> {
    const { data, error } = await this.db.from('app_config').select('home_region').maybeSingle()
    if (error) throw new Error(error.message)
    return data?.home_region ?? 'Auckland'
  }

  async getActiveWatchTerms(): Promise<WatchTerm[]> {
    const { data, error } = await this.db.from('watch_terms').select('*').eq('active', true)
    if (error) throw new Error(error.message)
    return (data ?? []).map((row: any) => ({
      id: row.id,
      label: row.label,
      keywords: row.keywords ?? [],
      negativeKeywords: row.negative_keywords ?? [],
      category: row.category,
      maxPriceExGst: row.max_price_ex_gst === null ? null : Number(row.max_price_ex_gst),
      region: row.region,
      sourceSlugs: row.source_slugs ?? [],
      active: row.active,
    }))
  }

  async getGlobalNegativeKeywords(): Promise<string[]> {
    const { data, error } = await this.db.from('global_negative_keywords').select('keyword')
    if (error) throw new Error(error.message)
    return (data ?? []).map((row: any) => row.keyword)
  }

  // -- run health -----------------------------------------------------------

  async startRun(sourceSlug: string): Promise<string> {
    const { data, error } = await this.db
      .from('ingestion_runs')
      .insert({ source_slug: sourceSlug, status: 'running' })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    return data.id
  }

  async finishRun(
    runId: string,
    update: {
      status: 'ok' | 'error' | 'not_configured' | 'skipped'
      listingsSeen: number
      listingsNew: number
      error?: string | null
      detail?: Record<string, unknown>
    },
  ): Promise<void> {
    const { error } = await this.db
      .from('ingestion_runs')
      .update({
        finished_at: new Date().toISOString(),
        status: update.status,
        listings_seen: update.listingsSeen,
        listings_new: update.listingsNew,
        error: update.error ?? null,
        detail: update.detail ?? {},
      })
      .eq('id', runId)
    if (error) throw new Error(error.message)
  }

  async countConsecutiveEmptyRuns(sourceSlug: string, limit: number): Promise<number> {
    const { data, error } = await this.db
      .from('ingestion_runs')
      .select('listings_seen, status')
      .eq('source_slug', sourceSlug)
      .not('finished_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(limit)
    if (error) throw new Error(error.message)
    let streak = 0
    for (const row of data ?? []) {
      if (row.status === 'ok' && row.listings_seen === 0) streak += 1
      else break
    }
    return streak
  }

  async raiseSourceHealthAlert(sourceSlug: string, reason: string, detail: string): Promise<void> {
    // One open alert per source per reason. Re raising a cleared alert is fine,
    // re raising an open one just adds noise to the screen meant to reduce it.
    const { data } = await this.db
      .from('source_health_alerts')
      .select('id')
      .eq('source_slug', sourceSlug)
      .eq('reason', reason)
      .is('cleared_at', null)
      .maybeSingle()
    if (data) return
    await this.db.from('source_health_alerts').insert({ source_slug: sourceSlug, reason, detail })
  }

  // -- listings -------------------------------------------------------------

  async upsertListing(listing: NormalisedListing): Promise<UpsertResult> {
    const existingQuery = this.db.from('listings').select('*').eq('source_slug', listing.sourceSlug)
    const { data: existing, error: findError } = listing.externalId
      ? await existingQuery.eq('external_id', listing.externalId).maybeSingle()
      : await existingQuery.eq('content_hash', listing.contentHash).is('external_id', null).maybeSingle()
    if (findError) throw new Error(findError.message)

    if (existing) {
      // Re seeing a listing updates last_seen_at and the current bid. It does
      // not re alert and it does not create a second row.
      const { data, error } = await this.db
        .from('listings')
        .update({
          last_seen_at: new Date().toISOString(),
          price_ex_gst: listing.priceExGst,
          price_original: listing.priceOriginal,
          price_basis: listing.priceBasis,
          closes_at: listing.closesAt,
          sold_price_ex_gst: listing.soldPriceExGst,
          sold_at: listing.soldAt,
          content_hash: listing.contentHash,
          raw: listing.raw,
        })
        .eq('id', existing.id)
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      return { listing: toStoredListing(data), isNew: false }
    }

    const { data, error } = await this.db
      .from('listings')
      .insert({
        source_slug: listing.sourceSlug,
        external_id: listing.externalId,
        title: listing.title,
        description: listing.description,
        price_ex_gst: listing.priceExGst,
        price_original: listing.priceOriginal,
        price_basis: listing.priceBasis,
        currency: listing.currency,
        url: listing.url,
        image_urls: listing.imageUrls,
        seller_name: listing.sellerName,
        region: listing.region,
        region_raw: listing.regionRaw,
        out_of_region: listing.outOfRegion,
        lot_number: listing.lotNumber,
        auction_name: listing.auctionName,
        viewing_details: listing.viewingDetails,
        listed_at: listing.listedAt,
        closes_at: listing.closesAt,
        sold_price_ex_gst: listing.soldPriceExGst,
        sold_at: listing.soldAt,
        raw: listing.raw,
        content_hash: listing.contentHash,
      })
      .select('*')
      .single()

    if (error) {
      // Lost a race with a concurrent run. The unique index did its job; read
      // the winning row back and treat this as a re sighting.
      if (error.code === '23505') {
        const retry = this.db.from('listings').select('*').eq('source_slug', listing.sourceSlug)
        const { data: winner } = listing.externalId
          ? await retry.eq('external_id', listing.externalId).maybeSingle()
          : await retry.eq('content_hash', listing.contentHash).maybeSingle()
        if (winner) return { listing: toStoredListing(winner), isNew: false }
      }
      throw new Error(error.message)
    }
    return { listing: toStoredListing(data), isNew: true }
  }

  async replaceMatches(listingId: string, matches: TermMatch[]): Promise<void> {
    await this.db.from('listing_matches').delete().eq('listing_id', listingId)
    if (matches.length === 0) return
    const { error } = await this.db.from('listing_matches').insert(
      matches.map((match) => ({
        listing_id: listingId,
        watch_term_id: match.watchTermId,
        score: match.score,
        matched_keywords: match.matchedKeywords,
        under_max_price: match.underMaxPrice,
      })),
    )
    if (error) throw new Error(error.message)
  }

  async recentListingsForDedupe(sinceIso: string, excludeSourceSlug: string): Promise<DedupeCandidate[]> {
    const { data, error } = await this.db
      .from('listings')
      .select('id, source_slug, title, price_ex_gst, image_phash, closes_at')
      .gte('first_seen_at', sinceIso)
      .neq('source_slug', excludeSourceSlug)
      .limit(2000)
    if (error) throw new Error(error.message)
    return (data ?? []).map((row: any) => ({
      id: row.id,
      sourceSlug: row.source_slug,
      title: row.title,
      priceExGst: row.price_ex_gst === null ? null : Number(row.price_ex_gst),
      imagePhash: row.image_phash,
      closesAt: row.closes_at,
    }))
  }

  async recordDuplicateCandidate(a: string, b: string, similarity: number, reasons: string[]): Promise<void> {
    const [first, second] = [a, b].sort()
    await this.db
      .from('duplicate_candidates')
      .upsert({ listing_a: first, listing_b: second, similarity, reasons }, { onConflict: 'listing_a,listing_b', ignoreDuplicates: true })
  }

  async cacheImage(listingId: string, imageUrl: string): Promise<void> {
    const { cacheListingImage } = await import('./images')
    await cacheListingImage(this.db, listingId, imageUrl)
  }

  // -- alert queue ----------------------------------------------------------

  async listAlertRecipients(): Promise<AlertRecipient[]> {
    const { data, error } = await this.db
      .from('app_users')
      .select('id, email, display_name, whatsapp_number, whatsapp_opt_in, email_alerts, quiet_hours_start, quiet_hours_end, timezone')
    if (error) throw new Error(error.message)
    return (data ?? []).map((row: any) => ({
      userId: row.id,
      email: row.email,
      displayName: row.display_name,
      whatsappNumber: row.whatsapp_number,
      whatsappOptIn: row.whatsapp_opt_in,
      emailAlerts: row.email_alerts,
      quietHoursStart: row.quiet_hours_start,
      quietHoursEnd: row.quiet_hours_end,
      timezone: row.timezone,
    }))
  }

  async claimAlert(
    listingId: string,
    userId: string,
    runId: string,
    deliverAfterIso: string,
    reason: string,
  ): Promise<boolean> {
    const { data, error } = await this.db
      .from('alert_queue')
      .upsert(
        { listing_id: listingId, user_id: userId, run_id: runId, deliver_after: deliverAfterIso, reason },
        { onConflict: 'listing_id,user_id', ignoreDuplicates: true },
      )
      .select('id')
    if (error) throw new Error(error.message)
    return (data ?? []).length > 0
  }

  // -- dispatch -------------------------------------------------------------

  async getDispatchConfig(): Promise<{ digestThreshold: number; alertsPerRecipientPerHour: number }> {
    const { data, error } = await this.db
      .from('app_config')
      .select('digest_threshold, alerts_per_recipient_per_hour')
      .maybeSingle()
    if (error) throw new Error(error.message)
    return {
      digestThreshold: data?.digest_threshold ?? 5,
      alertsPerRecipientPerHour: data?.alerts_per_recipient_per_hour ?? 6,
    }
  }

  async listPendingAlerts(nowIso: string): Promise<PendingAlert[]> {
    const { data, error } = await this.db
      .from('alert_queue')
      .select('id, listing_id, user_id, run_id, reason')
      .is('dispatched_at', null)
      .lte('deliver_after', nowIso)
      .order('queued_at')
      .limit(500)
    if (error) throw new Error(error.message)
    return (data ?? []).map((row: any) => ({
      id: row.id,
      listingId: row.listing_id,
      userId: row.user_id,
      runId: row.run_id,
      reason: row.reason,
    }))
  }

  async countAlertsSentInLastHour(nowIso: string): Promise<Record<string, number>> {
    const since = new Date(new Date(nowIso).getTime() - 3600_000).toISOString()
    const { data, error } = await this.db
      .from('alerts')
      .select('user_id')
      .gte('sent_at', since)
      .eq('channel', 'whatsapp')
    if (error) throw new Error(error.message)
    const counts: Record<string, number> = {}
    for (const row of data ?? []) counts[row.user_id] = (counts[row.user_id] ?? 0) + 1
    return counts
  }

  async getRecipients(userIds: string[]): Promise<AlertRecipient[]> {
    if (userIds.length === 0) return []
    const all = await this.listAlertRecipients()
    return all.filter((r) => userIds.includes(r.userId))
  }

  async getAlertListings(listingIds: string[]): Promise<AlertListing[]> {
    if (listingIds.length === 0) return []
    const { data, error } = await this.db
      .from('listings')
      .select(
        'id, title, price_ex_gst, price_basis, source_slug, region, out_of_region, closes_at, url, image_urls, cached_image_path, sources(name), listing_matches(score, watch_terms(label))',
      )
      .in('id', listingIds)
    if (error) throw new Error(error.message)

    return (data ?? []).map((row: any) => {
      const matches = (row.listing_matches ?? []).slice().sort((a: any, b: any) => Number(b.score) - Number(a.score))
      return {
        id: row.id,
        title: row.title,
        priceExGst: row.price_ex_gst === null ? null : Number(row.price_ex_gst),
        priceBasis: row.price_basis,
        sourceName: row.sources?.name ?? row.source_slug,
        region: row.region ?? 'Unknown',
        outOfRegion: row.out_of_region,
        matchedTerm: matches[0]?.watch_terms?.label ?? null,
        closesAt: row.closes_at,
        url: row.url,
        imageUrl: row.image_urls?.[0] ?? null,
      }
    })
  }

  async markQueueDispatched(queueIds: string[], nowIso: string): Promise<void> {
    if (queueIds.length === 0) return
    await this.db.from('alert_queue').update({ dispatched_at: nowIso }).in('id', queueIds)
  }

  async deferQueueItems(queueIds: string[], deliverAfterIso: string): Promise<void> {
    if (queueIds.length === 0) return
    await this.db.from('alert_queue').update({ deliver_after: deliverAfterIso }).in('id', queueIds)
  }

  async recordAlert(record: AlertRecord): Promise<void> {
    await this.db.from('alerts').insert({
      listing_id: record.listingId,
      user_id: record.userId,
      channel: record.channel,
      kind: record.kind,
      listing_ids: record.listingIds,
      template: record.template,
      sent_at: record.sentAt,
      delivered: record.delivered,
      provider_id: record.providerId,
      error: record.error,
    })
  }
}
