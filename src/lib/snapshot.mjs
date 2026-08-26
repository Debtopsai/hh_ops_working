/**
 * Builds the cached dashboard document from ingested data.
 *
 * Pure: no network, no clock of its own, no environment. Everything it needs is
 * passed in, which is what makes it testable against the section 9 baselines.
 *
 * The output of this function is exactly what gets written to the cache and
 * exactly what the front end receives. Two consequences, both deliberate:
 *
 *   1. There is no lead level record anywhere in it. Personal information is
 *      stripped at ingestion, before this function ever sees a lead, so the
 *      public read endpoint cannot leak what the cache does not hold.
 *   2. Every Decimal is serialised as a STRING, not a float. A JSON float would
 *      undo the decimal arithmetic at the last step.
 */
import { serialise, divide, Decimal } from './money.mjs';
import { totalRows, toWeeklyBuckets } from './meta.mjs';
import { buildFunnel } from './funnel.mjs';
import { unitEconomics, contractRevenue } from './revenue.mjs';
import { summariseDemand } from './equipment.mjs';
import { buildHealthPanel } from './health.mjs';

const s = serialise;

/** Serialise one normalised Meta row for transport. */
function row(r) {
  return {
    id: r.id, name: r.name, dateStart: r.dateStart, dateStop: r.dateStop,
    spend: s(r.spend), impressions: r.impressions, reach: r.reach, clicks: r.clicks,
    leads: r.leads,
    frequency: r.frequency ? s(r.frequency, 4) : null,
    ctr: s(r.ctr), cpm: s(r.cpm), cpc: s(r.cpc), cpl: s(r.cpl),
    publisherPlatform: r.publisherPlatform, region: r.region, age: r.age,
  };
}

function segment(rows, dimension) {
  return rows.map((r) => ({
    key: r[dimension] ?? 'Unknown',
    spend: s(r.spend),
    impressions: r.impressions,
    clicks: r.clicks,
    leads: r.leads,
    cpl: s(r.cpl),
    ctr: s(r.ctr),
  }));
}

/** Day of week segment, derived from the daily series. */
function byDayOfWeek(dailyRows) {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const buckets = new Map();
  for (const r of dailyRows) {
    if (!r.dateStart) continue;
    // Parse as a plain date. The campaign runs in NZ and Meta reports in the ad
    // account timezone, so no timezone conversion is applied here: converting
    // would shift a day's spend into its neighbour.
    const [y, m, d] = r.dateStart.split('-').map(Number);
    const name = names[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
    const b = buckets.get(name) ?? { key: name, spend: new Decimal(0), impressions: 0, clicks: 0, leads: 0, days: 0 };
    b.spend = b.spend.plus(r.spend);
    b.impressions += r.impressions;
    b.clicks += r.clicks;
    b.leads += r.leads;
    b.days += 1;
    buckets.set(name, b);
  }
  return names
    .filter((n) => buckets.has(n))
    .map((n) => {
      const b = buckets.get(n);
      return {
        key: b.key, days: b.days, spend: s(b.spend), impressions: b.impressions, clicks: b.clicks, leads: b.leads,
        cpl: b.leads > 0 ? s(divide(b.spend, b.leads)) : null,
        ctr: b.impressions > 0 ? s(divide(new Decimal(b.clicks).times(100), b.impressions)) : null,
      };
    });
}

/** Creative concentration, panel 4. */
function creativeConcentration(adRows, totalSpend) {
  const sorted = [...adRows].sort((a, b) => b.spend.comparedTo(a.spend));
  const withShare = sorted.map((r) => ({
    id: r.id, name: r.name,
    spend: s(r.spend),
    sharePct: totalSpend.isZero() ? null : s(r.spend.div(totalSpend).times(100), 1),
    impressions: r.impressions, leads: r.leads,
    cpl: s(r.cpl), ctr: s(r.ctr),
    frequency: r.frequency ? s(r.frequency, 4) : null,
    frequencyStatus: r.frequency ? (r.frequency.gte(4) ? 'red' : r.frequency.gte(3) ? 'amber' : 'ok') : null,
  }));
  const top = withShare[0] ?? null;
  return {
    creatives: withShare,
    topShare: top?.sharePct ?? null,
    concentrationRisk: top && Number(top.sharePct) > 50,
    note: top && Number(top.sharePct) > 50
      ? `${top.name} carries ${top.sharePct}% of spend. Performance depends on one creative.`
      : null,
  };
}

/**
 * The live daily rate claim, section 11 item 2.
 *
 * "Live ads say From $3.99/day, a paused variant says $6.99/day, approved
 * marketing copy says $4.66/day. Three numbers in circulation, and the one
 * currently spending is not the approved one."
 *
 * Read from the ads that are ACTUALLY SPENDING, weighted by spend, so the
 * dashboard shows what is live rather than what is approved.
 */
export function dailyRateClaims(adRows, { approvedClaim = null } = {}) {
  const claims = new Map();
  for (const r of adRows) {
    const m = String(r.name ?? '').match(/\$\s*(\d+\.\d{2})\s*\/?\s*day/i);
    if (!m) continue;
    const claim = `$${m[1]}/day`;
    const existing = claims.get(claim) ?? { claim, spend: new Decimal(0), impressions: 0, ads: [] };
    existing.spend = existing.spend.plus(r.spend);
    existing.impressions += r.impressions;
    existing.ads.push(r.name);
    claims.set(claim, existing);
  }

  const list = [...claims.values()]
    .sort((a, b) => b.spend.comparedTo(a.spend))
    .map((c) => ({ claim: c.claim, spend: s(c.spend), impressions: c.impressions, adCount: c.ads.length, isDelivering: c.impressions > 0 }));

  const delivering = list.filter((c) => c.isDelivering && Number(c.spend) > 0);
  const live = delivering[0] ?? null;

  return {
    claims: list,
    liveClaim: live?.claim ?? null,
    approvedClaim,
    // Only a real mismatch, not merely "more than one string exists".
    mismatch: Boolean(live && approvedClaim && live.claim !== approvedClaim),
    distinctDeliveringClaims: delivering.length,
    note:
      live && approvedClaim && live.claim !== approvedClaim
        ? `The claim currently spending is ${live.claim}. The approved marketing claim is ${approvedClaim}. Source of the claim is the ad name, which is a proxy for the creative body text and should be confirmed against the creative itself before any external use.`
        : null,
    sourceCaveat: 'Derived from ad names, not from creative body text. Treat as an indicator, not as evidence of what the ad displays.',
  };
}

export function buildSnapshot({
  campaignTotal,
  previousPeriodTotal = null,
  daily = [],
  weekly = [],
  byPlatform = [],
  byRegion = [],
  byAge = [],
  byAd = [],
  datasets = [],
  leadDedupe = null,
  demandClassifications = null,
  equipmentCatalogue = null,
  stageClassification = null,
  cumulative = {},
  contractsSigned = null,
  contractsFunded = null,
  fundingDataAvailable = false,
  hubspotAvailable = false,
  attributionMode = 'aggregate',
  representativeDeal = null,
  assumptions,
  dateRange,
  nowMs = Date.now(),
  lastStageEventAt = null,
  lastRefreshAt = null,
  meta = {},
}) {
  const total = campaignTotal ?? totalRows(daily);
  const spend = total.spend;

  const grossMargin = new Decimal(String(assumptions.grossMargin.default));
  const failureRate = new Decimal(String(assumptions.paymentFailureRate.default));

  // Lead count for the funnel uses the deduplicated figure where lead records
  // were available, and Meta's own results count otherwise.
  const leadCount = leadDedupe?.uniqueCount ?? total.leads;
  const rawLeadCount = leadDedupe?.rawCount ?? null;

  const revenueResult = representativeDeal ? contractRevenue(representativeDeal) : null;

  const econ = unitEconomics({
    spend,
    contractsFunded: contractsFunded ?? 0,
    contractsSigned: contractsSigned ?? 0,
    fundingDataAvailable,
    revenueResult,
    grossMargin,
    failureRate,
    marginConfirmed: assumptions.grossMargin.confirmed,
  });

  const funnel = buildFunnel({
    spend, leadCount, rawLeadCount,
    stageCounts: stageClassification?.counts ?? {},
    cumulative,
    deadByReason: stageClassification?.deadByReason ?? [],
    contractsSigned, contractsFunded, fundingDataAvailable, attributionMode, hubspotAvailable,
  });

  const health = buildHealthPanel({
    datasets, lastStageEventAt, lastRefreshAt,
    stageClassification, leadDedupe, hubspotAvailable, attributionMode,
    nowMs, thresholds: assumptions.thresholds,
    expectedPixels: meta.expectedPixels ?? [],
  });

  const freq = total.frequency ?? campaignTotal?.frequency ?? null;

  // Sensitivity across the configured margin points, because the margin is not
  // confirmed and a single ratio would overstate what is known.
  const sensitivity = (assumptions.grossMargin.sensitivityPoints ?? []).map((m) => {
    const e = unitEconomics({
      spend, contractsFunded: contractsFunded ?? 0, contractsSigned: contractsSigned ?? 0,
      fundingDataAvailable, revenueResult, grossMargin: new Decimal(String(m)), failureRate,
    });
    return { grossMargin: m, ltv: s(e.ltv), ltvCac: s(e.ltvCac, 2), paybackWeeks: s(e.paybackWeeks, 1) };
  });

  const outOfRegion = byRegion
    .filter((r) => r.region && !(assumptions.region.serviced ?? []).includes(r.region))
    .map((r) => ({ region: r.region, spend: s(r.spend), impressions: r.impressions, leads: r.leads }));

  return {
    schemaVersion: 1,
    generatedAt: new Date(nowMs).toISOString(),
    dateRange,
    currency: assumptions.currency,

    // Panel 1
    headline: {
      spend: s(spend),
      leads: total.leads,
      leadsDeduplicated: leadCount,
      cpl: s(total.cpl ?? divide(spend, total.leads)),
      impressions: total.impressions,
      clicks: total.clicks,
      ctr: s(total.ctr),
      cpm: s(total.cpm),
      reach: campaignTotal?.reach ?? null,
      frequency: freq ? s(freq, 4) : null,
      frequencyStatus: freq ? (freq.gte(assumptions.thresholds.frequencyRed) ? 'red' : freq.gte(assumptions.thresholds.frequencyAmber) ? 'amber' : 'ok') : null,
      contractsSigned,
      contractsFunded: fundingDataAvailable ? contractsFunded : null,
      cac: s(econ.cac),
      cacBasis: econ.cacBasis,
      cacLabel: econ.cacLabel,
      ltvCac: s(econ.ltvCac, 2),
      comparison: previousPeriodTotal
        ? {
            spend: s(previousPeriodTotal.spend),
            leads: previousPeriodTotal.leads,
            cpl: s(previousPeriodTotal.cpl),
            ctr: s(previousPeriodTotal.ctr),
            spendChangePct: previousPeriodTotal.spend.isZero() ? null : s(spend.minus(previousPeriodTotal.spend).div(previousPeriodTotal.spend).times(100), 1),
            leadsChangePct: previousPeriodTotal.leads === 0 ? null : s(new Decimal(total.leads - previousPeriodTotal.leads).div(previousPeriodTotal.leads).times(100), 1),
          }
        : null,
    },

    // Panel 2
    funnel: {
      ...funnel,
      stages: funnel.stages.map((st) => ({
        ...st,
        costPerUnit: s(st.costPerUnit),
        rateFromLeads: st.rateFromLeads === null ? null : Math.round(st.rateFromLeads * 1000) / 10,
        rateFromPrevious: st.rateFromPrevious === null || st.rateFromPrevious === undefined ? null : Math.round(st.rateFromPrevious * 1000) / 10,
      })),
      leadToClose: funnel.leadToClose === null ? null : Math.round(funnel.leadToClose * 1000) / 10,
      quoteToClose: funnel.quoteToClose === null ? null : Math.round(funnel.quoteToClose * 1000) / 10,
      leadToCloseSignedBasis: funnel.leadToCloseSignedBasis === null ? null : Math.round(funnel.leadToCloseSignedBasis * 1000) / 10,
    },

    // Panel 3
    unitEconomics: {
      contractRevenue: s(econ.contractRevenue),
      revenueWorking: revenueResult
        ? {
            weeklyPayment: s(revenueResult.weeklyPayment),
            termWeeks: revenueResult.termWeeks,
            weeklyPaymentsTotal: s(revenueResult.weeklyPaymentsTotal),
            deliveryAndInstall: s(revenueResult.deliveryAndInstall),
            contractRevenue: s(revenueResult.contractRevenue),
            cashUpfront: revenueResult.cashUpfront
              ? {
                  structure: revenueResult.cashUpfront.structure,
                  rentInAdvance: s(revenueResult.cashUpfront.rentInAdvance),
                  securityBond: s(revenueResult.cashUpfront.securityBond),
                  total: s(revenueResult.cashUpfront.total),
                  isRevenue: false,
                  note: revenueResult.cashUpfront.note,
                }
              : null,
          }
        : null,
      ltv: s(econ.ltv),
      grossMargin: s(grossMargin, 4),
      marginConfirmed: econ.marginConfirmed,
      marginNote: assumptions.grossMargin.confirmationNote,
      ltvCac: s(econ.ltvCac, 2),
      ltvCacReference: assumptions.thresholds.ltvCacReference,
      paybackWeeks: s(econ.paybackWeeks, 1),
      weeklyContribution: s(econ.weeklyContribution),
      riskAdjustedRevenue: s(econ.riskAdjustedRevenue),
      riskAdjustedLtv: s(econ.riskAdjustedLtv),
      riskAdjustedLtvCac: s(econ.riskAdjustedLtvCac, 2),
      failureRate: s(failureRate, 4),
      failureRateOptions: assumptions.paymentFailureRate,
      sensitivity,
      caveat: econ.caveat,
    },

    // Panel 4
    fatigue: {
      daily: daily.map(row),
      weekly: (weekly.length ? weekly : toWeeklyBuckets(daily)).map(row),
      frequencyThresholds: { amber: assumptions.thresholds.frequencyAmber, red: assumptions.thresholds.frequencyRed },
      periodFrequency: freq ? s(freq, 4) : null,
      periodFrequencyNote: 'Frequency is reach based and does not sum across days. The period figure is asked of Meta directly rather than aggregated from the daily series.',
      ...creativeConcentration(byAd, spend),
    },

    // Panel 5
    demand: demandClassifications
      ? (() => {
          const d = summariseDemand(demandClassifications, { spend, cpl: total.cpl });
          return {
            ...d,
            // So the front end can label each category without hardcoding the
            // catalogue, which lives in config and can change.
            outCategories: Object.keys(equipmentCatalogue?.outOfCatalogue ?? {}).filter((k) => !k.startsWith('_')),
            categories: d.categories.map((c) => ({ ...c, label: (equipmentCatalogue?.categoryLabels ?? {})[c.category] ?? c.category })),
            outOfCatalogueShare: d.outOfCatalogueShare === null ? null : Math.round(d.outOfCatalogueShare * 1000) / 10,
            inCatalogueShare: d.inCatalogueShare === null ? null : Math.round(d.inCatalogueShare * 1000) / 10,
            estimatedWastedSpend: d.estimatedWastedSpend ? { value: s(d.estimatedWastedSpend.value), basis: d.estimatedWastedSpend.basis, isEstimate: true } : null,
            spendBasis: undefined,
          };
        })()
      : { available: false, reason: 'Lead records were not retrieved, so the equipment enquiry field could not be classified.' },

    // Panel 6
    segments: {
      platform: segment(byPlatform, 'publisherPlatform'),
      region: segment(byRegion, 'region'),
      age: segment(byAge, 'age'),
      dayOfWeek: byDayOfWeek(daily),
      outOfRegion: {
        rows: outOfRegion,
        hasOutOfRegion: outOfRegion.length > 0,
        note: 'Rent and Lease to Own are Auckland region only. Out of region spend is flagged, not silently counted.',
      },
    },

    // Panel 7
    health,

    compliance: dailyRateClaims(byAd, { approvedClaim: meta.approvedDailyRateClaim ?? null }),

    // Every sum check from section 9, computed live rather than asserted once at
    // build time. If a future date range or filter breaks a split, the dashboard
    // says so instead of quietly showing a wrong number.
    reconciliation: {
      campaignSpend: s(spend),
      platformSum: byPlatform.length ? s(totalRows(byPlatform).spend) : null,
      regionSum: byRegion.length ? s(totalRows(byRegion).spend) : null,
      ageSum: byAge.length ? s(totalRows(byAge).spend) : null,
      adSum: byAd.length ? s(totalRows(byAd).spend) : null,
      dailySum: daily.length ? s(totalRows(daily).spend) : null,
      allReconcile: [
        byPlatform.length ? s(totalRows(byPlatform).spend) : null,
        byRegion.length ? s(totalRows(byRegion).spend) : null,
        byAge.length ? s(totalRows(byAge).spend) : null,
        byAd.length ? s(totalRows(byAd).spend) : null,
        daily.length ? s(totalRows(daily).spend) : null,
      ].filter((v) => v !== null).every((v) => v === s(spend)),
      note: 'Platform and region splits must each independently sum to campaign spend. If they do not, the date range or filter is wrong.',
    },
  };
}
