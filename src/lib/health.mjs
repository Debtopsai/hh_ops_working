/**
 * Data health, panel 7. "This panel is not optional. Every number above it
 * depends on it."
 *
 * Covers section 8.1 (duplicate pixels), 8.2 (unmapped stages) and 8.3 (the
 * sync gap), plus freshness of the Meta pull itself.
 */

const EPOCH_SENTINEL_MS = 24 * 60 * 60 * 1000; // anything before 2 January 1970

/**
 * Parse a timestamp that might be a null sentinel.
 *
 * The Meta datasets endpoint returns last_fired_time as "1969-12-31T16:00:00-0800"
 * (unix zero) when it does not know, on some rows. Observed live on
 * 26 August 2026. Treated naively this reports a pixel as 56 years stale, which
 * would either be dismissed as a bug or trigger a false alarm. Either way the
 * real alarm stops being believed.
 */
export function parseTimestamp(value) {
  if (!value) return null;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return null;
  if (ms <= EPOCH_SENTINEL_MS) return null; // sentinel, not a real time
  return ms;
}

export function hoursSince(timestampMs, nowMs) {
  if (timestampMs === null || timestampMs === undefined) return null;
  return Math.round(((nowMs - timestampMs) / 3600000) * 10) / 10;
}

/**
 * Pixel health, section 8.1.
 *
 * Deduplicates the dataset list by id, because the endpoint returns the same
 * pixel more than once with different creation times, and takes the most recent
 * real fire time across a pixel's duplicate rows.
 */
export function pixelHealth(datasets, { nowMs, expectedPixels = [] }) {
  const byId = new Map();

  for (const d of datasets ?? []) {
    const id = String(d.dataset_id ?? d.id);
    const fired = Math.max(
      parseTimestamp(d.last_fired_time) ?? 0,
      parseTimestamp(d.server_last_fired_time) ?? 0,
    ) || null;

    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, { id, name: d.name ?? null, isActive: Boolean(d.is_active), lastFiredMs: fired, rowCount: 1 });
    } else {
      existing.rowCount += 1;
      existing.isActive = existing.isActive || Boolean(d.is_active);
      if (fired && (!existing.lastFiredMs || fired > existing.lastFiredMs)) existing.lastFiredMs = fired;
    }
  }

  const pixels = [...byId.values()]
    .map((p) => ({ ...p, hoursSinceLastFired: hoursSince(p.lastFiredMs, nowMs), lastFired: p.lastFiredMs ? new Date(p.lastFiredMs).toISOString() : null }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const active = pixels.filter((p) => p.isActive);
  const duplicateActive = active.length > 1;

  return {
    pixels,
    distinctCount: pixels.length,
    activeCount: active.length,
    // "Consolidating to one is a prerequisite, not a nice-to-have."
    duplicatePixelWarning: duplicateActive,
    warningText: duplicateActive
      ? `${active.length} pixels are live on one property (${active.map((p) => p.id).join(' and ')}). Conversion data is fragmented across them. The dashboard reads both and deduplicates, but consolidating to one pixel is a prerequisite, not a nice to have.`
      : null,
    expectedButMissing: expectedPixels.filter((id) => !byId.has(String(id))),
    unexpected: pixels.filter((p) => expectedPixels.length && !expectedPixels.map(String).includes(p.id)).map((p) => p.id),
  };
}

/**
 * Stage event freshness, section 8.3.
 *
 * "No stage events reached Meta between 20 and 26 August, although leads
 * arrived and follow-up was happening. Add a freshness indicator: show time
 * since last stage event, and alert if it exceeds 48 hours. This is a genuine
 * operational alarm, not a cosmetic touch."
 */
export function stageEventFreshness(lastStageEventAt, { nowMs, thresholdHours = 48 }) {
  const ms = parseTimestamp(lastStageEventAt);
  const hours = hoursSince(ms, nowMs);

  if (hours === null) {
    return {
      lastStageEvent: null,
      hoursSince: null,
      status: 'unknown',
      alert: true,
      message: 'No stage event timestamp is available. The CRM to Meta sync cannot be confirmed as working. Treat every funnel figure past "lead" as unverified.',
    };
  }

  const breached = hours > thresholdHours;
  return {
    lastStageEvent: new Date(ms).toISOString(),
    hoursSince: hours,
    thresholdHours,
    status: breached ? 'stale' : 'ok',
    alert: breached,
    message: breached
      ? `No stage event has reached Meta for ${hours} hours, past the ${thresholdHours} hour threshold. Either the CRM sync has broken or contacting a lead is not triggering a stage change. Funnel counts past "lead" are understated until this is resolved.`
      : null,
  };
}

/** Freshness of our own Meta pull. A stale cache is its own failure mode. */
export function metaSyncFreshness(lastRefreshAt, { nowMs, thresholdHours = 6 }) {
  const ms = parseTimestamp(lastRefreshAt);
  const hours = hoursSince(ms, nowMs);
  if (hours === null) {
    return { lastRefresh: null, hoursSince: null, status: 'unknown', alert: true, message: 'The cache has never been written. The dashboard is showing nothing, not zero.' };
  }
  const breached = hours > thresholdHours;
  return {
    lastRefresh: new Date(ms).toISOString(),
    hoursSince: hours,
    thresholdHours,
    status: breached ? 'stale' : 'ok',
    alert: breached,
    message: breached ? `The Meta data was last refreshed ${hours} hours ago. The scheduled function may have stopped running.` : null,
  };
}

/** Roll the whole panel up, with one overall status so a banner can be driven from it. */
export function buildHealthPanel({
  datasets,
  lastStageEventAt,
  lastRefreshAt,
  stageClassification,
  leadDedupe,
  hubspotAvailable,
  hubspotConnected = null,
  attribution = null,
  dealQuality = null,
  cohortSize = null,
  nowMs = Date.now(),
  thresholds = {},
  expectedPixels = [],
}) {
  const pixels = pixelHealth(datasets, { nowMs, expectedPixels });
  const stageEvents = stageEventFreshness(lastStageEventAt, { nowMs, thresholdHours: thresholds.staleStageEventHours ?? 48 });
  const metaSync = metaSyncFreshness(lastRefreshAt, { nowMs, thresholdHours: thresholds.staleMetaSyncHours ?? 6 });

  const attributionMode = attribution?.mode ?? 'aggregate';
  const connected = hubspotConnected ?? hubspotAvailable;
  const unmappedCount = stageClassification?.unmapped ?? null;
  const unmappedAlert = unmappedCount !== null && unmappedCount > 0;

  const alerts = [];
  if (pixels.duplicatePixelWarning) alerts.push({ level: 'warning', code: 'duplicate_pixels', message: pixels.warningText });
  if (stageEvents.alert) alerts.push({ level: stageEvents.status === 'unknown' ? 'warning' : 'critical', code: 'stage_events_stale', message: stageEvents.message });
  if (metaSync.alert) alerts.push({ level: 'critical', code: 'meta_sync_stale', message: metaSync.message });
  if (unmappedAlert) {
    alerts.push({
      level: 'critical',
      code: 'unmapped_stages',
      message: `${unmappedCount} stage event${unmappedCount === 1 ? '' : 's'} did not match the stage map: ${(stageClassification.unmappedLabels ?? []).map((u) => `"${u.label}" (${u.count})`).join(', ')}. A stage name has changed and the funnel is silently wrong. Correct config/stage-map.json.`,
    });
  }
  if (!connected) {
    alerts.push({
      level: 'critical',
      code: 'hubspot_unavailable',
      message: 'HubSpot is not connected. Every funnel figure past "lead" is unavailable. See docs/hubspot-schema.md.',
    });
  } else if (attribution && !attribution.dealJoin.ok) {
    // Connected, and the join is still dead. This is a different and more
    // useful statement than "not connected", and it names the number that
    // proves it.
    // The deal side counts are only known when deals were actually fetched. The
    // live path does not fetch them, so the sentence is omitted rather than
    // rendered as "null of null".
    const dealCounts = Number.isFinite(attribution.dealJoin.dealsWithContacts) && Number.isFinite(attribution.dealJoin.totalDeals)
      ? `${attribution.dealJoin.dealsWithContacts} of ${attribution.dealJoin.totalDeals} deals in the pipeline have any contact at all. `
      : '';
    alerts.push({
      level: 'critical',
      code: 'lead_to_deal_join_broken',
      message:
        `HubSpot is connected and the campaign join works (${attribution.campaignJoin.matched} leads matched), but not one of them has an associated deal. ` +
        dealCounts +
        'Qualified, quoted, signed and funded cannot be attributed to this campaign and are shown as [TBC]. See docs/hubspot-schema.md.',
    });
  }

  if (dealQuality && dealQuality.contractRevenueComputable === false) {
    alerts.push({
      level: 'critical',
      code: 'no_deal_term',
      message: `${dealQuality.note} Contract revenue, LTV and LTV:CAC cannot be computed from live deals until finance_term or finance_custom_term_weeks is populated.`,
    });
  }

  if (connected && attribution?.dealJoin.ok === false && attribution.campaignJoin.ok) {
    alerts.push({
      level: 'warning',
      code: 'aggregate_attribution',
      message: 'Attribution is campaign level, not lead level. Stage counts are period totals rather than traced cohorts, and sales cycle, lead to close rate and quote to close rate are unavailable.',
    });
  }

  const worst = alerts.some((a) => a.level === 'critical') ? 'critical' : alerts.length ? 'warning' : 'ok';

  return {
    status: worst,
    alerts,
    pixels,
    stageEvents,
    metaSync,
    stageMapping: {
      unmapped: unmappedCount,
      unmappedLabels: stageClassification?.unmappedLabels ?? [],
      alert: unmappedAlert,
    },
    leads: leadDedupe
      ? {
          rawCount: leadDedupe.rawCount,
          uniqueCount: leadDedupe.uniqueCount,
          duplicateCount: leadDedupe.duplicateCount,
          noContactKeyCount: leadDedupe.noContactKeyCount,
          note: 'Funnel counts use the deduplicated figure. The raw count is shown because repeat submissions suggest the confirmation step is not landing.',
        }
      : null,
    hubspotAvailable,
    hubspotConnected: connected,
    attribution,
    attributionMode,
    dealQuality,
    cohortSize,
    generatedAt: new Date(nowMs).toISOString(),
  };
}
