/**
 * HubSpot ingestion.
 *
 * Server side only. The token never leaves the Netlify function.
 *
 * What this fetches and what it deliberately does not:
 *
 *   Lead cohort   Contacts carrying the Meta campaign name. Real and reliable,
 *                 66 of 67 records. Personal information is stripped here,
 *                 before anything is returned, so no caller can cache it.
 *
 *   Deals         Fetched, counted and stage mapped. NOT turned into contract
 *                 revenue, because the term is empty on every deal in the
 *                 portal and the brief says to read the term from the deal
 *                 rather than assume one.
 *
 * See docs/hubspot-schema.md for why the funnel between the two is unavailable.
 */
import { createHash } from 'node:crypto';
import { Decimal } from './money.mjs';

const BASE = 'https://api.hubapi.com';

async function hs(path, { token, method = 'GET', body = null, fetchImpl = fetch }) {
  const res = await fetchImpl(BASE + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    // Never include the token or the request body, which carries filter values.
    throw new Error(`HubSpot ${method} ${path} failed with ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

/** Page through a search endpoint. */
async function searchAll(objectType, body, { token, fetchImpl = fetch, maxPages = 50 }) {
  const out = [];
  let after;
  for (let page = 0; page < maxPages; page += 1) {
    const json = await hs(`/crm/v3/objects/${objectType}/search`, {
      token,
      method: 'POST',
      body: { ...body, limit: 100, ...(after ? { after } : {}) },
    });
    out.push(...(json.results ?? []));
    after = json.paging?.next?.after;
    if (!after) break;
  }
  return out;
}

function hash(salt, value) {
  return createHash('sha256').update(`${salt}:${value}`).digest('hex').slice(0, 32);
}

/**
 * Fetch the Meta lead cohort and strip it.
 *
 * Returns classification counts and hashed dedupe keys only. Names, emails,
 * phone numbers, company names and the raw enquiry text do not survive this
 * function. The enquiry text is dropped along with the obvious fields because
 * it is free text, and free text is where someone writes their phone number.
 */
export async function fetchLeadCohort({ token, mapping, classifier, salt, fetchImpl = fetch }) {
  const joinProperty = mapping.joinKey?.property;
  const matchValue = mapping.joinKey?.matchValue;
  if (!joinProperty || !matchValue) {
    return { available: false, reason: 'No campaign join key is configured. See config/hubspot-mapping.json.' };
  }

  const c = mapping.contact ?? {};
  const properties = [
    joinProperty, c.equipmentEnquiry, c.region, c.lifecycleStage, c.createdAt, c.numAssociatedDeals,
    'email', 'phone', 'mobilephone',
  ].filter(Boolean);

  const results = await searchAll('contacts', {
    filterGroups: [{ filters: [{ propertyName: joinProperty, operator: 'EQ', value: matchValue }] }],
    properties,
    sorts: [{ propertyName: c.createdAt ?? 'createdate', direction: 'DESCENDING' }],
  }, { token, fetchImpl });

  const stripped = results.map((rec) => {
    const p = rec.properties ?? {};
    const enquiry = c.equipmentEnquiry ? p[c.equipmentEnquiry] : null;
    const classification = classifier ? classifier.classify(enquiry) : null;

    const phoneRaw = p.phone ?? p.mobilephone ?? null;
    const phoneKey = phoneRaw ? String(phoneRaw).replace(/[^\d]/g, '').replace(/^0064|^64/, '').replace(/^0/, '') : null;
    const emailKey = p.email ? String(p.email).trim().toLowerCase() : null;

    return {
      id: rec.id,
      createdTime: c.createdAt ? p[c.createdAt] ?? null : null,
      lifecycleStage: c.lifecycleStage ? p[c.lifecycleStage] ?? null : null,
      region: c.region ? p[c.region] ?? null : null,
      associatedDeals: Number(p[c.numAssociatedDeals] ?? 0) || 0,
      // Category only. The enquiry text itself is not retained.
      outcome: classification?.outcome ?? null,
      equipmentCategory: classification?.category ?? null,
      equipmentLabel: classification?.label ?? null,
      inCatalogue: classification?.inCatalogue ?? null,
      phoneHash: phoneKey && phoneKey.length >= 7 ? hash(salt, `p:${phoneKey}`) : null,
      emailHash: emailKey && emailKey.includes('@') ? hash(salt, `e:${emailKey}`) : null,
    };
  });

  return {
    available: true,
    leads: stripped,
    count: stripped.length,
    // The number of cohort leads that reached a deal. Currently zero, and the
    // dashboard needs to say so rather than imply the funnel is merely empty.
    withDeals: stripped.filter((l) => l.associatedDeals > 0).length,
    joinProperty,
    matchValue,
  };
}

/**
 * Fetch deals and map their stages.
 *
 * Deliberately does not compute contract revenue. Every deal in the portal has
 * an empty term, and the brief is explicit that the term is read from the deal
 * rather than assumed. A deal with no term reports null and is counted in
 * `missingTerm` so the gap is visible.
 */
export async function fetchDeals({ token, mapping, stageMap, fetchImpl = fetch }) {
  const d = mapping.deal ?? {};
  const properties = [
    d.name, d.stageId, d.pipeline, d.weeklyPayment, d.termWeeks, d.termRaw, d.productType,
    d.rentInAdvanceWeeks, d.rentInAdvanceAmount, d.securityDepositWeeks, d.securityDepositAmount,
    d.closedWonDate, d.isClosedWon, d.createdAt, 'num_associated_contacts',
  ].filter(Boolean);

  const filterGroups = mapping.pipelineId
    ? [{ filters: [{ propertyName: d.pipeline ?? 'pipeline', operator: 'EQ', value: String(mapping.pipelineId) }] }]
    : [];

  const results = await searchAll('deals', { filterGroups, properties }, { token, fetchImpl });

  const counts = { inquiry: 0, qualified: 0, quoted: 0, won: 0, dead: 0, ignore: 0, unmapped: 0 };
  const unmappedIds = new Map();
  let missingTerm = 0;
  let missingWeekly = 0;
  let withContacts = 0;
  let weeklyBillingsTotal = new Decimal(0);

  for (const rec of results) {
    const p = rec.properties ?? {};
    const stageId = d.stageId ? p[d.stageId] : null;
    const { bucket } = stageMap.resolve({ stageId });
    counts[bucket] = (counts[bucket] ?? 0) + 1;
    if (bucket === 'unmapped') unmappedIds.set(String(stageId), (unmappedIds.get(String(stageId)) ?? 0) + 1);

    const termWeeks = d.termWeeks ? p[d.termWeeks] : null;
    const termRaw = d.termRaw ? p[d.termRaw] : null;
    if (!termWeeks && !termRaw) missingTerm += 1;

    const weekly = d.weeklyPayment ? p[d.weeklyPayment] : null;
    if (weekly === null || weekly === undefined || weekly === '') missingWeekly += 1;
    else {
      try { weeklyBillingsTotal = weeklyBillingsTotal.plus(new Decimal(String(weekly))); } catch { /* ignore unparseable */ }
    }

    if (Number(p.num_associated_contacts ?? 0) > 0) withContacts += 1;
  }

  return {
    available: true,
    total: results.length,
    counts,
    unmappedStageIds: [...unmappedIds.entries()].map(([stageId, count]) => ({ label: stageId, count })),
    // Why the funnel cannot be built from these deals.
    quality: {
      missingTerm,
      missingWeekly,
      withContacts,
      withoutContacts: results.length - withContacts,
      contractRevenueComputable: missingTerm < results.length,
      note:
        missingTerm === results.length
          ? 'Every deal has an empty term. Contract revenue cannot be computed and is reported as [TBC]. The finance_term and finance_custom_term_weeks properties exist but are unpopulated.'
          : `${missingTerm} of ${results.length} deals have no term. Contract revenue is only computable for the rest.`,
    },
    // A real, computable figure: the sum of weekly payments across deals. It is
    // NOT contract revenue and is labelled so it cannot be mistaken for it.
    weeklyBillingsTotal,
    weeklyBillingsNote: 'Sum of weekly payments across all deals in the pipeline, including test and duplicate records. Not contract revenue, and not filtered.',
  };
}

/**
 * Whether the lead to deal join is usable.
 * Split deliberately: the campaign join can be healthy while the deal join is
 * dead, which is exactly the situation in this portal.
 */
export function assessAttribution({ cohort, deals, mapping }) {
  const campaignJoinOk = Boolean(cohort?.available && cohort.count > 0);
  const dealJoinOk = Boolean(cohort?.available && cohort.withDeals > 0);
  return {
    mode: dealJoinOk ? 'traced' : 'aggregate',
    campaignJoin: {
      ok: campaignJoinOk,
      matched: cohort?.count ?? 0,
      property: mapping.joinKey?.property ?? null,
      matchValue: mapping.joinKey?.matchValue ?? null,
    },
    dealJoin: {
      ok: dealJoinOk,
      cohortLeadsWithDeals: cohort?.withDeals ?? 0,
      dealsWithContacts: deals?.quality?.withContacts ?? 0,
      totalDeals: deals?.total ?? 0,
    },
    reason: dealJoinOk
      ? null
      : 'No lead in the campaign cohort has an associated deal, and deals arrive from a separate integration with no contact attached. Stage counts past "lead" are unavailable, not merely approximate.',
  };
}
