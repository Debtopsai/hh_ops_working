/**
 * Per lead profiling for the lead level view.
 *
 * What is genuinely available per lead, and what is not:
 *
 *   AVAILABLE   submitted date and time, day of week, hour of day, platform,
 *               region, company, the equipment enquiry, and the CRM status
 *               (lifecycle stage, lead status, whether a deal exists).
 *
 *   NOT AVAILABLE   age band and gender. Meta reports these ONLY as aggregate
 *               breakdowns of spend, impressions and results. They are never
 *               attached to an individual lead, by design, and HubSpot carries
 *               no age property either. The age distribution therefore appears
 *               under Segments as a cohort figure, and any per lead age column
 *               would be an invention.
 *
 * The "psychographic" read is the enquiry itself: what someone asked for, how
 * specifically they asked for it, and how broad the request was. A lead naming
 * eleven items is fitting out a venue; a lead naming one is replacing a
 * machine. That distinction is real, derived, and useful.
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Rough time of day, in the viewer's local zone, from an ISO timestamp. */
export function timeOfDay(hour) {
  if (hour === null || hour === undefined) return null;
  if (hour < 6) return 'Overnight';
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Late evening';
}

/**
 * How much a lead told us. A lead that names specific equipment is further
 * along than one that says "kitchen", and worth a different first call.
 */
export function enquiryDepth(classification) {
  if (!classification) return { specificity: 'unknown', breadth: null, label: 'Unknown' };
  const categories = [...new Set([...(classification.inCategories ?? []), ...(classification.outCategories ?? [])])];
  const breadth = categories.length;
  if (classification.outcome === 'unstated') return { specificity: 'unstated', breadth: 0, label: 'Did not say' };
  if (classification.outcome === 'vague') return { specificity: 'vague', breadth: 0, label: 'General enquiry' };
  if (classification.outcome === 'unclassified') return { specificity: 'unclassified', breadth: 0, label: 'Unrecognised' };
  if (breadth >= 3) return { specificity: 'fitout', breadth, label: `Multi item, ${breadth} categories` };
  if (breadth === 2) return { specificity: 'pair', breadth, label: 'Two categories' };
  return { specificity: 'single', breadth: 1, label: 'Single item' };
}

/**
 * Where a lead has actually got to.
 *
 * An empty lead status is not "no status": it means nobody has set one. That
 * is an operational fact worth showing, so it is reported as "Not set" rather
 * than as a blank cell.
 */
export function leadStatus({ lifecycleStage, leadStatus: raw, associatedDeals }) {
  // HubSpot stores these as SCREAMING_SNAKE. Read them back as sentences.
  const humanise = (v) => {
    const t = String(v).replace(/_/g, ' ').trim().toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  const deals = Number(associatedDeals ?? 0) || 0;
  if (deals > 0) return { key: 'deal', label: 'Has a deal', tone: 'ok' };
  if (raw) return { key: String(raw).toLowerCase(), label: humanise(raw), tone: 'neutral' };
  if (lifecycleStage && lifecycleStage !== 'lead') return { key: lifecycleStage, label: humanise(lifecycleStage), tone: 'neutral' };
  return { key: 'unset', label: 'Not set', tone: 'warn' };
}

/** Build one profiled lead row. `nowMs` is passed so age is testable. */
export function profileLead(raw, { classifier, equipmentProperty, nowMs = Date.now() }) {
  const p = raw?.properties ?? {};
  const created = p.createdate ?? null;
  const ms = created ? Date.parse(created) : NaN;
  const valid = Number.isFinite(ms);
  const d = valid ? new Date(ms) : null;

  const classification = classifier ? classifier.classify(p[equipmentProperty]) : null;
  const depth = enquiryDepth(classification);
  const status = leadStatus({
    lifecycleStage: p.lifecyclestage,
    leadStatus: p.hs_lead_status,
    associatedDeals: p.num_associated_deals,
  });

  return {
    id: raw?.id ?? null,
    // HubSpot returns this on every search whether or not it is requested.
    name: raw?.properties?.hs_full_name_or_email ?? null,
    company: p.company ?? null,
    submittedAt: valid ? d.toISOString() : null,
    dayOfWeek: valid ? DAYS[d.getDay()] : null,
    hour: valid ? d.getHours() : null,
    timeOfDay: valid ? timeOfDay(d.getHours()) : null,
    ageDays: valid ? Math.floor((nowMs - ms) / 86400000) : null,
    platform: p.hs_analytics_source_data_1 ?? null,
    region: p.state ?? null,
    equipmentCategory: classification?.category ?? null,
    equipmentLabel: classification?.label ?? null,
    inCatalogue: classification?.inCatalogue ?? null,
    outcome: classification?.outcome ?? null,
    depth,
    status,
    hasDeal: (Number(p.num_associated_deals ?? 0) || 0) > 0,
  };
}

/** Roll a set of profiled leads up, for the tiles above the table. */
export function summariseLeads(leads, { nowMs = Date.now() } = {}) {
  const total = leads.length;
  const byStatus = new Map();
  const byDay = new Map();
  const byTime = new Map();
  let unset = 0;
  let withDeal = 0;
  let stale = 0;      // no status set and older than a week
  let ageSum = 0;
  let aged = 0;

  for (const l of leads) {
    byStatus.set(l.status.label, (byStatus.get(l.status.label) ?? 0) + 1);
    if (l.dayOfWeek) byDay.set(l.dayOfWeek, (byDay.get(l.dayOfWeek) ?? 0) + 1);
    if (l.timeOfDay) byTime.set(l.timeOfDay, (byTime.get(l.timeOfDay) ?? 0) + 1);
    if (l.status.key === 'unset') unset += 1;
    if (l.hasDeal) withDeal += 1;
    if (l.status.key === 'unset' && (l.ageDays ?? 0) > 7) stale += 1;
    if (l.ageDays !== null) { ageSum += l.ageDays; aged += 1; }
  }

  const rank = (m) => [...m.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
  const busiestDay = rank(byDay)[0] ?? null;
  const busiestTime = rank(byTime)[0] ?? null;

  return {
    total,
    withStatus: total - unset,
    unset,
    withDeal,
    stale,
    medianAgeDays: aged ? Math.round((ageSum / aged) * 10) / 10 : null,
    byStatus: rank(byStatus),
    byDay: rank(byDay),
    byTime: rank(byTime),
    busiestDay,
    busiestTime,
    // The one thing a per lead table cannot carry, stated rather than omitted.
    ageBandNote: 'Age band is not available per lead. Meta reports age only as an aggregate breakdown of spend and results, so it appears under Segments and cannot be attached to a person.',
  };
}
