/**
 * Meta Marketing API ingestion.
 *
 * Two response shapes are handled, because two surfaces return this data and
 * they do not agree:
 *
 *   Ads Manager style   amount_spent: "NZ$656.01 NZD", results: { indicator, values: [...] }
 *   Graph API style     spend: "656.01",                   actions: [{ action_type, value }]
 *
 * Both are normalised to one canonical row. The parsers are tolerant on input
 * and strict on output.
 *
 * Traps encoded here, every one of them observed in live responses on
 * 26 August 2026 and covered by tests:
 *
 *   1. results arrives as EITHER { values: [{ value: "63" }] } on days with leads
 *      OR { value: "Not available" } on days with none. Same field, two shapes.
 *      A parser that only handles the first silently drops every zero day, which
 *      makes a fatigue chart look like it has gaps rather than zeroes.
 *   2. ctr is null, not "0.00%", when impressions are zero.
 *   3. cost_per_result carries a trailing annotation: "NZ$10.41 NZD (Leads (form))".
 *   4. Currency strings use a non breaking space before the currency code.
 */
import { parseMoney, parsePercent, parseCount, divide, Decimal } from './money.mjs';

export const GRAPH_VERSION = 'v21.0';
export const LEAD_RESULT_INDICATOR = 'leadgen.other';

/**
 * Pull the lead count out of a results field, whichever shape it arrived in.
 * Returns 0 for "Not available", which genuinely means no leads that period.
 */
export function parseResults(results, { indicator = LEAD_RESULT_INDICATOR } = {}) {
  if (results === null || results === undefined) return 0;

  // Graph API: an actions array.
  if (Array.isArray(results)) {
    const hit = results.find((a) => a.action_type === indicator || a.action_type === `actions:${indicator}`);
    return hit ? parseCount(hit.value) : 0;
  }

  if (typeof results === 'object') {
    // Ads Manager, leads present: { indicator, values: [{ attribution_windows, value }] }
    if (Array.isArray(results.values)) {
      const preferred = results.values.find((v) => (v.attribution_windows ?? []).includes('default')) ?? results.values[0];
      return preferred ? parseCount(preferred.value) : 0;
    }
    // Ads Manager, no leads: { indicator, value: "Not available" }
    if ('value' in results) return parseCount(results.value);
    return 0;
  }

  return parseCount(results);
}

/** cost_per_result arrives as { value: "NZ$10.41 NZD (Leads (form))" }. */
export function parseCostPerResult(costPerResult) {
  if (costPerResult === null || costPerResult === undefined) return null;
  if (typeof costPerResult === 'object' && 'value' in costPerResult) {
    if (/not available/i.test(String(costPerResult.value))) return null;
    return parseMoney(costPerResult.value);
  }
  return parseMoney(costPerResult);
}

/**
 * Normalise one insights row from either surface into a canonical shape.
 * Money values are Decimal. Counts are integers. Absent means zero for counts
 * and null for rates, so a null rate can render as [TBC] rather than as 0.00%.
 */
export function normaliseRow(row) {
  const spend = parseMoney(row.amount_spent ?? row.spend);
  const impressions = parseCount(row.impressions);
  const clicks = parseCount(row.clicks);
  const leads = parseResults(row.results ?? row.actions);

  // Prefer Meta's own ctr and cpm where present. Where absent, derive them,
  // but only when the denominator is non zero.
  const ctr = parsePercent(row.ctr) ?? (impressions > 0 ? divide(new Decimal(clicks).times(100), impressions) : null);
  const cpm = parseMoney(row.cpm) ?? (impressions > 0 ? divide(spend.times(1000), impressions) : null);
  const cpc = parseMoney(row.cpc) ?? (clicks > 0 ? divide(spend, clicks) : null);
  const cpl = parseCostPerResult(row.cost_per_result) ?? (leads > 0 ? divide(spend, leads) : null);

  return {
    id: row.id ?? null,
    name: row.name ?? null,
    dateStart: row.date_start ?? null,
    dateStop: row.date_stop ?? null,
    spend: spend ?? new Decimal(0),
    impressions,
    reach: parseCount(row.reach),
    frequency: row.frequency !== undefined && row.frequency !== null ? new Decimal(String(row.frequency)) : null,
    clicks,
    outboundClicks: parseCount(row.outbound_clicks),
    leads,
    ctr,
    cpm,
    cpc,
    cpl,
    // Breakdown dimensions, present only when requested.
    publisherPlatform: row.publisher_platform ?? null,
    region: row.region ?? null,
    age: row.age ?? null,
  };
}

/** Normalise a whole response, tolerating the double encoded ad_entities string. */
export function normaliseResponse(payload) {
  let rows = payload;
  if (payload && typeof payload === 'object' && 'ad_entities' in payload) {
    rows = typeof payload.ad_entities === 'string' ? JSON.parse(payload.ad_entities) : payload.ad_entities;
  } else if (payload && typeof payload === 'object' && 'data' in payload) {
    rows = payload.data;
  }
  if (!Array.isArray(rows)) return [];
  return rows.map(normaliseRow);
}

/** Sum a set of normalised rows into one total. Used for the sum checks in section 9. */
export function totalRows(rows) {
  const spend = rows.reduce((acc, r) => acc.plus(r.spend), new Decimal(0));
  const impressions = rows.reduce((acc, r) => acc + r.impressions, 0);
  const clicks = rows.reduce((acc, r) => acc + r.clicks, 0);
  const leads = rows.reduce((acc, r) => acc + r.leads, 0);
  return {
    spend,
    impressions,
    clicks,
    leads,
    ctr: impressions > 0 ? divide(new Decimal(clicks).times(100), impressions) : null,
    cpm: impressions > 0 ? divide(spend.times(1000), impressions) : null,
    cpl: leads > 0 ? divide(spend, leads) : null,
  };
}

/**
 * Weekly buckets from a daily series, anchored on the first date rather than on
 * an ISO week boundary. The brief's weekly trend runs 1 to 7 August, 8 to 14,
 * 15 to 21, which is day one anchored, not Monday anchored.
 */
export function toWeeklyBuckets(dailyRows) {
  const sorted = [...dailyRows].filter((r) => r.dateStart).sort((a, b) => a.dateStart.localeCompare(b.dateStart));
  const buckets = [];
  for (let i = 0; i < sorted.length; i += 7) {
    const slice = sorted.slice(i, i + 7);
    if (!slice.length) continue;
    const totals = totalRows(slice);
    buckets.push({
      weekNumber: Math.floor(i / 7) + 1,
      dateStart: slice[0].dateStart,
      dateStop: slice[slice.length - 1].dateStop ?? slice[slice.length - 1].dateStart,
      days: slice.length,
      ...totals,
      // Frequency does not sum across days: the same person seen on two days is
      // one reached person, not two. Meta must be asked for the period figure.
      frequency: null,
    });
  }
  return buckets;
}

const FIELD_SET = [
  'spend', 'impressions', 'reach', 'frequency', 'clicks', 'cpc', 'cpm', 'ctr',
  'actions', 'cost_per_action_type', 'outbound_clicks',
];

/**
 * Fetch insights from the Graph API.
 *
 * Server side only. The token never leaves the Netlify function.
 * Not exercised against live credentials in the build session: there was no
 * token available. The response parsing IS validated, against real captured
 * responses. See test/fixtures and docs/validation-baselines.md.
 */
export async function fetchInsights({
  accessToken,
  adAccountId,
  campaignId = null,
  level = 'campaign',
  since,
  until,
  timeIncrement = null,
  breakdowns = null,
  fetchImpl = fetch,
}) {
  if (!accessToken) throw new Error('META_ACCESS_TOKEN is not set');
  if (!adAccountId) throw new Error('META_AD_ACCOUNT_ID is not set');

  const account = String(adAccountId).startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${account}/insights`);
  url.searchParams.set('level', level);
  url.searchParams.set('fields', FIELD_SET.join(','));
  url.searchParams.set('time_range', JSON.stringify({ since, until }));
  url.searchParams.set('limit', '500');
  if (timeIncrement) url.searchParams.set('time_increment', String(timeIncrement));
  if (breakdowns) url.searchParams.set('breakdowns', Array.isArray(breakdowns) ? breakdowns.join(',') : breakdowns);
  if (campaignId) {
    url.searchParams.set('filtering', JSON.stringify([{ field: 'campaign.id', operator: 'EQUAL', value: [String(campaignId)] }]));
  }

  const rows = [];
  let next = url.toString();
  let guard = 0;
  while (next && guard < 50) {
    guard += 1;
    const res = await fetchImpl(next, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) {
      const body = await res.text();
      // Never log the token or the full URL, which carries query parameters.
      throw new Error(`Meta insights ${level} request failed with ${res.status}: ${body.slice(0, 300)}`);
    }
    const json = await res.json();
    rows.push(...(json.data ?? []));
    next = json.paging?.next ?? null;
  }
  return rows.map(normaliseRow);
}
