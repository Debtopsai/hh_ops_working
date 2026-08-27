/**
 * Turns live connector responses into the same snapshot shape the scheduled
 * refresh produces, using the same libraries.
 *
 * That matters: the figures a viewer sees are computed by the functions that
 * reproduce the section 9 validation baselines, not by a second, looser
 * implementation written for the browser.
 */
import { normaliseResponse } from '../lib/meta.mjs';
import { buildSnapshot } from '../lib/snapshot.mjs';
import { buildClassifier } from '../lib/equipment.mjs';

/** The Meta tool returns ad_entities as a JSON encoded string. normaliseResponse handles both. */
const rows = (payload) => (payload ? normaliseResponse(payload) : []);

/**
 * HubSpot contact search returns { results: [{ id, properties }], total }.
 * Only the equipment enquiry is read: no name, email or phone is requested.
 */
function classifyCohort(payload, classifier, equipmentProperty) {
  const results = payload?.results;
  if (!Array.isArray(results)) return null;
  return results.map((rec) => classifier.classify(rec?.properties?.[equipmentProperty]));
}

export function composeSnapshot({ parts, errors, storedAt, range, configs, liveConfig, nowMs = Date.now() }) {
  const classifier = buildClassifier(configs.equipmentCatalogue);

  const campaignRows = rows(parts.campaign);
  const dailyRows = rows(parts.daily);
  const previousRows = rows(parts.previous);

  const cohort = parts.cohort ? classifyCohort(parts.cohort, classifier, liveConfig.hubspot.equipmentProperty) : null;
  const cohortCount = parts.cohort?.total ?? (Array.isArray(parts.cohort?.results) ? parts.cohort.results.length : null);

  // The lead to deal join is a property of the CRM, not of this page. It stays
  // reported as broken until deals actually carry a contact.
  const attribution = {
    mode: 'aggregate',
    campaignJoin: { ok: Boolean(cohortCount), matched: cohortCount ?? 0, property: liveConfig.hubspot.joinProperty, matchValue: liveConfig.hubspot.matchValue },
    dealJoin: { ok: false, cohortLeadsWithDeals: 0, dealsWithContacts: null, totalDeals: null },
    reason: 'Deals arrive in HubSpot from a separate integration with no contact attached, so no lead can be traced to a deal.',
  };

  const snapshot = buildSnapshot({
    campaignTotal: campaignRows[0] ?? null,
    previousPeriodTotal: previousRows[0] ?? null,
    daily: dailyRows,
    byPlatform: rows(parts.platform),
    byRegion: rows(parts.region),
    byAge: rows(parts.age),
    byAd: rows(parts.ad),
    datasets: [],
    demandClassifications: cohort,
    equipmentCatalogue: configs.equipmentCatalogue,
    assumptions: configs.assumptions,
    dateRange: { since: range.since, until: range.until },
    nowMs,
    // Freshness is driven by the served result, never by the local clock.
    lastRefreshAt: storedAt?.campaign ? new Date(storedAt.campaign).toISOString() : new Date(nowMs).toISOString(),
    lastStageEventAt: null,
    representativeDeal: null,
    contractsSigned: null,
    contractsFunded: null,
    fundingDataAvailable: false,
    hubspotAvailable: false,
    hubspotConnected: Boolean(parts.cohort),
    attribution,
    cohortSize: cohortCount,
    dealQuality: null,
    attributionMode: 'aggregate',
    meta: {
      expectedPixels: liveConfig.meta.pixelIds,
      approvedDailyRateClaim: liveConfig.meta.approvedDailyRateClaim,
    },
  });

  snapshot.__live = true;
  snapshot.__sections = {
    // Which sections could not be read, so each one annotates itself rather
    // than the page showing a single catch-all failure.
    errors: errors ?? {},
    storedAt: storedAt ?? {},
  };
  return snapshot;
}

/** Date helpers for the range selector. */
export function isoDaysAgo(days, from = new Date()) {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
export function windowFor(days) {
  const until = new Date().toISOString().slice(0, 10);
  const since = isoDaysAgo(days - 1);
  return { since, until, prevSince: isoDaysAgo(days * 2 - 1), prevUntil: isoDaysAgo(days) };
}
