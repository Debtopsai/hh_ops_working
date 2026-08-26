/**
 * Scheduled refresh. Runs hourly, writes one JSON document to the cache.
 *
 * This is the only place a third party token is used. The front end never calls
 * a third party API and never sees a token.
 *
 * Personal information is stripped inside this function, before anything is
 * written. The cache therefore holds no lead level record, which is what makes
 * the read endpoint safe by construction rather than by discipline.
 */
import { getStore } from '@netlify/blobs';
import { readFile } from 'node:fs/promises';
import { fetchInsights, totalRows } from '../../src/lib/meta.mjs';
import { buildSnapshot } from '../../src/lib/snapshot.mjs';
import { buildClassifier } from '../../src/lib/equipment.mjs';
import { buildStageMap, classifyStages, cumulativeCounts } from '../../src/lib/stage-map.mjs';
import { stripLead, deduplicateLeads, newSalt } from '../../src/lib/leads.mjs';
import { GRAPH_VERSION } from '../../src/lib/meta.mjs';

export const config = { schedule: '@hourly' };

const CONFIG_FILES = ['assumptions', 'stage-map', 'equipment-catalogue', 'hubspot-mapping'];

async function loadConfig() {
  const entries = await Promise.all(
    CONFIG_FILES.map(async (name) => [name, JSON.parse(await readFile(new URL(`../../config/${name}.json`, import.meta.url), 'utf8'))]),
  );
  return Object.fromEntries(entries);
}

function isoDaysAgo(days, from = new Date()) {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Lead records come from the lead forms endpoint, not from insights.
 * Returns raw records. The caller strips them immediately.
 */
async function fetchLeadRecords({ accessToken, campaignId, since }) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${campaignId}/leads`);
  url.searchParams.set('fields', 'id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,form_name,is_organic,platform,field_data');
  url.searchParams.set('limit', '200');
  if (since) url.searchParams.set('filtering', JSON.stringify([{ field: 'time_created', operator: 'GREATER_THAN', value: Math.floor(Date.parse(since) / 1000) }]));

  const out = [];
  let next = url.toString();
  let guard = 0;
  while (next && guard < 50) {
    guard += 1;
    const res = await fetch(next, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) throw new Error(`Meta lead records request failed with ${res.status}`);
    const json = await res.json();
    for (const rec of json.data ?? []) {
      // field_data is an array of { name, values }. Flatten it to the shape the
      // export uses, including the trailing colon on the equipment field.
      const flat = { ...rec };
      for (const f of rec.field_data ?? []) flat[f.name] = (f.values ?? [])[0] ?? null;
      delete flat.field_data;
      out.push(flat);
    }
    next = json.paging?.next ?? null;
  }
  return out;
}

async function fetchDatasets({ accessToken, businessId }) {
  if (!businessId) return [];
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${businessId}/adspixels`);
  url.searchParams.set('fields', 'id,name,is_created_by_business,last_fired_time');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data ?? []).map((d) => ({ dataset_id: d.id, name: d.name, is_active: true, last_fired_time: d.last_fired_time }));
}

export default async function handler(req) {
  const startedAt = Date.now();
  const cfg = await loadConfig();

  const accessToken = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const campaignId = process.env.META_CAMPAIGN_ID;
  const businessId = process.env.META_BUSINESS_ID;
  const approvedClaim = process.env.APPROVED_DAILY_RATE_CLAIM ?? null;

  if (!accessToken || !adAccountId) {
    // Fail loudly into the cache rather than silently leaving stale data in
    // place looking fresh.
    const store = getStore('acquisition-dashboard');
    await store.setJSON('error', { at: new Date().toISOString(), error: 'META_ACCESS_TOKEN or META_AD_ACCOUNT_ID is not set' });
    return new Response(JSON.stringify({ ok: false, error: 'Meta credentials are not configured' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }

  const windowDays = Number(process.env.DASHBOARD_WINDOW_DAYS ?? 30);
  const until = new Date().toISOString().slice(0, 10);
  const since = isoDaysAgo(windowDays);
  const prevUntil = isoDaysAgo(windowDays + 1);
  const prevSince = isoDaysAgo(windowDays * 2 + 1);

  const base = { accessToken, adAccountId, campaignId, since, until };

  try {
    const [campaignRows, dailyRows, platformRows, regionRows, ageRows, adRows, prevRows] = await Promise.all([
      fetchInsights({ ...base, level: 'campaign' }),
      fetchInsights({ ...base, level: 'campaign', timeIncrement: '1' }),
      fetchInsights({ ...base, level: 'campaign', breakdowns: ['publisher_platform'] }),
      fetchInsights({ ...base, level: 'campaign', breakdowns: ['region'] }),
      fetchInsights({ ...base, level: 'campaign', breakdowns: ['age'] }),
      fetchInsights({ ...base, level: 'ad' }),
      fetchInsights({ ...base, level: 'campaign', since: prevSince, until: prevUntil }),
    ]);

    const datasets = await fetchDatasets({ accessToken, businessId });

    // Lead records: fetched, stripped, then the raw records are dropped. The
    // raw array never leaves this scope and is never logged.
    const classifier = buildClassifier(cfg['equipment-catalogue']);
    let leadDedupe = null;
    let demandClassifications = null;
    try {
      if (campaignId) {
        const salt = newSalt();
        const stripped = (await fetchLeadRecords({ accessToken, campaignId, since })).map((raw) =>
          stripLead(raw, { salt, classifier, servicedRegions: cfg.assumptions.region.serviced }),
        );
        leadDedupe = deduplicateLeads(stripped);
        demandClassifications = leadDedupe.unique.map((l) => ({
          inCatalogue: l.inCatalogue,
          category: l.equipmentCategory ?? 'unstated',
          label: l.equipmentLabel ?? 'Not stated',
        }));
      }
    } catch (leadErr) {
      // A lead fetch failure must not take the whole refresh down, but it must
      // not be silent either. No lead detail is included in the message.
      console.warn(`Lead records unavailable: ${leadErr.message}`);
    }

    // HubSpot: short circuited until the schema has been discovered. No guessed
    // property names, so no plausible but wrong funnel.
    const hubspotMapping = cfg['hubspot-mapping'];
    const hubspotAvailable = Boolean(hubspotMapping.discovered && process.env.HUBSPOT_ACCESS_TOKEN);
    const stageMap = buildStageMap(cfg['stage-map']);
    const stageClassification = hubspotAvailable ? classifyStages([], stageMap) : null;

    const snapshot = buildSnapshot({
      campaignTotal: campaignRows[0] ?? totalRows(dailyRows),
      previousPeriodTotal: prevRows[0] ?? null,
      daily: dailyRows,
      byPlatform: platformRows,
      byRegion: regionRows,
      byAge: ageRows,
      byAd: adRows,
      datasets,
      leadDedupe,
      demandClassifications,
      stageClassification,
      cumulative: stageClassification ? cumulativeCounts(stageClassification.counts, stageMap) : {},
      contractsSigned: null,
      contractsFunded: null,
      fundingDataAvailable: Boolean(process.env.GOCARDLESS_ACCESS_TOKEN) && hubspotAvailable,
      hubspotAvailable,
      attributionMode: hubspotMapping.attributionMode ?? 'aggregate',
      representativeDeal: null,
      assumptions: cfg.assumptions,
      dateRange: { since, until },
      lastRefreshAt: new Date().toISOString(),
      lastStageEventAt: null,
      meta: {
        expectedPixels: (process.env.META_PIXEL_IDS ?? '').split(',').map((x) => x.trim()).filter(Boolean),
        approvedDailyRateClaim: approvedClaim,
      },
    });

    const store = getStore('acquisition-dashboard');
    await store.setJSON('latest', snapshot);
    await store.setJSON('meta', { lastRefreshAt: snapshot.generatedAt, durationMs: Date.now() - startedAt, ok: true });

    return new Response(JSON.stringify({ ok: true, generatedAt: snapshot.generatedAt, durationMs: Date.now() - startedAt }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    const store = getStore('acquisition-dashboard');
    await store.setJSON('meta', { lastRefreshAt: null, ok: false, error: err.message, at: new Date().toISOString() });
    // The message may contain an API error body. It never contains a token,
    // because fetchInsights deliberately does not include the URL in its errors.
    console.error(`Refresh failed: ${err.message}`);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
