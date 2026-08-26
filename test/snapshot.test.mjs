/**
 * End to end: real captured Meta responses in, cached dashboard document out.
 *
 * This is the test that proves the whole chain, not just its parts. If the
 * section 9 figures survive normalisation, aggregation, the metric definitions
 * and serialisation, the dashboard is showing the right numbers.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normaliseResponse } from '../src/lib/meta.mjs';
import { buildSnapshot, dailyRateClaims } from '../src/lib/snapshot.mjs';
import { buildClassifier } from '../src/lib/equipment.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const fx = read('./fixtures/meta-aug-2026.json');
const dailyFx = read('./fixtures/meta-daily-aug-2026.json');
const assumptions = read('../config/assumptions.json');
const equipConfig = read('../config/equipment-catalogue.json');

const NOW = Date.parse('2026-08-26T12:00:00Z');

function build(overrides = {}) {
  return buildSnapshot({
    campaignTotal: normaliseResponse(fx.campaignTotal)[0],
    daily: normaliseResponse(dailyFx.daily),
    weekly: normaliseResponse(fx.weekly),
    byPlatform: normaliseResponse(fx.byPlatform),
    byRegion: normaliseResponse(fx.byRegion),
    byAge: normaliseResponse(fx.byAge),
    byAd: normaliseResponse(fx.byAd),
    datasets: fx.datasets,
    assumptions,
    dateRange: { since: '2026-08-01', until: '2026-08-25' },
    nowMs: NOW,
    lastRefreshAt: '2026-08-26T11:30:00Z',
    lastStageEventAt: '2026-08-20T10:00:00Z',
    // The one signed contract from section 9.
    representativeDeal: { weeklyPayment: '115', termWeeks: 156, deliveryAndInstall: '895', depositStructure: '6+6' },
    contractsSigned: 1,
    contractsFunded: null,
    fundingDataAvailable: false,
    hubspotAvailable: false,
    attributionMode: 'aggregate',
    meta: { expectedPixels: ['1677961872820124', '1336169581641781'], approvedDailyRateClaim: '$4.66/day' },
    ...overrides,
  });
}

describe('Panel 1, headline', () => {
  const snap = build();
  test('spend NZ$656.01', () => assert.equal(snap.headline.spend, '656.01'));
  test('63 leads', () => assert.equal(snap.headline.leads, 63));
  test('CPL NZ$10.41', () => assert.equal(snap.headline.cpl, '10.41'));
  test('CTR 2.23%', () => assert.equal(snap.headline.ctr, '2.23'));
  test('CPM NZ$16.52', () => assert.equal(snap.headline.cpm, '16.52'));
  test('CAC NZ$656.01 on the signed fallback', () => {
    assert.equal(snap.headline.cac, '656.01');
    assert.equal(snap.headline.cacBasis, 'signed, funding unconfirmed');
  });
  test('LTV:CAC 7.18 : 1 at the default 25% margin', () => assert.equal(snap.headline.ltvCac, '7.18'));
  test('contracts funded is null, not zero, while GoCardless is absent', () => {
    assert.equal(snap.headline.contractsFunded, null);
    assert.equal(snap.headline.contractsSigned, 1);
  });
  test('frequency 3.885 trips amber', () => {
    assert.equal(snap.headline.frequency, '3.8852');
    assert.equal(snap.headline.frequencyStatus, 'amber');
  });
});

describe('Panel 3, unit economics and the revenue rule', () => {
  const snap = build();
  const ue = snap.unitEconomics;

  test('contract revenue NZ$18,835', () => assert.equal(ue.contractRevenue, '18835.00'));
  test('the working is shown', () => {
    assert.equal(ue.revenueWorking.weeklyPaymentsTotal, '17940.00');
    assert.equal(ue.revenueWorking.deliveryAndInstall, '895.00');
    assert.equal(ue.revenueWorking.termWeeks, 156);
  });
  test('cash upfront is present, separate, and marked not revenue', () => {
    assert.equal(ue.revenueWorking.cashUpfront.total, '1380.00');
    assert.equal(ue.revenueWorking.cashUpfront.rentInAdvance, '690.00');
    assert.equal(ue.revenueWorking.cashUpfront.securityBond, '690.00');
    assert.equal(ue.revenueWorking.cashUpfront.isRevenue, false);
  });
  test('THE WRONG FIGURE $20,215 appears nowhere in the whole document', () => {
    assert.ok(!JSON.stringify(snap).includes('20215'), 'the double counted revenue figure leaked into the payload');
  });
  test('payback 22.8 weeks', () => assert.equal(ue.paybackWeeks, '22.8'));
  test('risk adjusted revenue discounts only the weekly stream', () => {
    assert.equal(ue.riskAdjustedRevenue, '16951.30');
    assert.equal(ue.failureRate, '0.1050');
  });
  test('the margin is carried as unconfirmed with its note', () => {
    assert.equal(ue.marginConfirmed, false);
    assert.match(ue.marginNote, /Awaiting Raj/);
  });
  test('a sensitivity range is provided because the margin is not settled', () => {
    assert.deepEqual(ue.sensitivity.map((x) => x.grossMargin), [0.2, 0.25, 0.3]);
    assert.equal(ue.sensitivity.find((x) => x.grossMargin === 0.25).ltvCac, '7.18');
  });
  test('the media only caveat is in the payload, not left to the front end', () => {
    assert.match(ue.caveat, /Sales time, credit assessment fees and equipment cost are not included/);
  });
  test('every money figure is a string, never a float', () => {
    for (const k of ['contractRevenue', 'ltv', 'riskAdjustedRevenue', 'paybackWeeks']) {
      assert.equal(typeof ue[k], 'string', `${k} should be a string`);
    }
  });
});

describe('Panel 4, fatigue and creative concentration', () => {
  const snap = build();
  test('25 daily points', () => assert.equal(snap.fatigue.daily.length, 25));
  test('weekly buckets carry the baseline spends', () => {
    assert.deepEqual(snap.fatigue.weekly.slice(0, 3).map((w) => w.spend), ['220.38', '210.85', '144.83']);
  });
  test('one creative at 74.6% is flagged as concentration risk', () => {
    assert.equal(snap.fatigue.topShare, '74.6');
    assert.equal(snap.fatigue.concentrationRisk, true);
    assert.match(snap.fatigue.note, /Low Weekly Payment #3/);
  });
  test('the top creative frequency 3.38 is marked amber', () => {
    assert.equal(snap.fatigue.creatives[0].frequencyStatus, 'amber');
  });
  test('period frequency is not aggregated from daily', () => {
    assert.match(snap.fatigue.periodFrequencyNote, /does not sum across days/);
  });
});

describe('Panel 6, segments', () => {
  const snap = build();
  test('platform split', () => {
    const fb = snap.segments.platform.find((p) => p.key === 'facebook');
    assert.equal(fb.spend, '572.26');
    assert.equal(fb.leads, 58);
    assert.equal(fb.cpl, '9.87');
  });
  test('age split: 45-54 delivers the most leads on the most spend', () => {
    const byVolume = [...snap.segments.age].sort((a, b) => b.leads - a.leads)[0];
    assert.equal(byVolume.key, '45-54');
    assert.equal(byVolume.leads, 22);
    assert.equal(byVolume.spend, '212.06');
  });

  test('but 65+ has the lowest CPL, at less than half the campaign average', () => {
    // A real finding, not a synthetic assertion. 65+ returns leads at $4.53
    // against a campaign average of $10.41, on 4.1% of the budget.
    const cheapest = [...snap.segments.age].filter((a) => a.leads > 0).sort((a, b) => Number(a.cpl) - Number(b.cpl))[0];
    assert.equal(cheapest.key, '65+');
    assert.equal(cheapest.cpl, '4.53');
    assert.ok(Number(cheapest.cpl) < Number(snap.headline.cpl) / 2);
  });
  test('day of week is derived from the daily series and covers seven days', () => {
    assert.equal(snap.segments.dayOfWeek.length, 7);
    const sum = snap.segments.dayOfWeek.reduce((a, d) => a + d.leads, 0);
    assert.equal(sum, 63);
  });
  test('out of region spend is flagged, not silently counted', () => {
    assert.equal(snap.segments.outOfRegion.hasOutOfRegion, true);
    const regions = snap.segments.outOfRegion.rows.map((r) => r.region).sort();
    assert.deepEqual(regions, ['Northland Region', 'Waikato']);
  });
});

describe('Reconciliation, computed live on every refresh', () => {
  const snap = build();
  test('every split sums to campaign spend', () => {
    assert.equal(snap.reconciliation.platformSum, '656.01');
    assert.equal(snap.reconciliation.regionSum, '656.01');
    assert.equal(snap.reconciliation.ageSum, '656.01');
    assert.equal(snap.reconciliation.adSum, '656.01');
    assert.equal(snap.reconciliation.dailySum, '656.01');
    assert.equal(snap.reconciliation.allReconcile, true);
  });
  test('a broken split is caught rather than displayed', () => {
    const broken = build({ byPlatform: normaliseResponse([fx.byPlatform[0]]) }); // drop Instagram
    assert.equal(broken.reconciliation.allReconcile, false);
    assert.equal(broken.reconciliation.platformSum, '572.26');
  });
});

describe('Section 11 item 2, the daily rate claim', () => {
  const snap = build();
  test('the live claim is $3.99/day, taken from what is actually spending', () => {
    assert.equal(snap.compliance.liveClaim, '$3.99/day');
  });
  test('it does not match the approved $4.66/day', () => {
    assert.equal(snap.compliance.approvedClaim, '$4.66/day');
    assert.equal(snap.compliance.mismatch, true);
  });
  test('the $6.99/day variant is listed but not treated as live', () => {
    const six = snap.compliance.claims.find((c) => c.claim === '$6.99/day');
    assert.ok(six, '$6.99/day should still be listed');
    assert.equal(six.spend, '0.14');
    assert.notEqual(snap.compliance.liveClaim, '$6.99/day');
  });
  test('the source caveat is explicit, because ad names are not creative copy', () => {
    assert.match(snap.compliance.sourceCaveat, /not from creative body text/);
  });
  test('no approved claim configured means no false mismatch', () => {
    const claims = dailyRateClaims(normaliseResponse(fx.byAd), {});
    assert.equal(claims.mismatch, false);
    assert.equal(claims.liveClaim, '$3.99/day');
  });
});

describe('Panel 7 and the honesty rules', () => {
  const snap = build();
  test('health is critical: HubSpot absent, stage events stale, two pixels live', () => {
    assert.equal(snap.health.status, 'critical');
    const codes = snap.health.alerts.map((a) => a.code);
    for (const c of ['hubspot_unavailable', 'stage_events_stale', 'duplicate_pixels']) {
      assert.ok(codes.includes(c), `missing ${c}`);
    }
  });
  test('funnel stages past lead are null while HubSpot is absent', () => {
    const byKey = Object.fromEntries(snap.funnel.stages.map((s) => [s.key, s]));
    assert.equal(byKey.lead.count, 63);
    assert.equal(byKey.qualified.count, null);
    assert.equal(byKey.quoted.count, null);
    assert.equal(byKey.funded.count, null);
  });
  test('demand reports unavailable rather than an empty chart', () => {
    assert.equal(snap.demand.available, false);
    assert.match(snap.demand.reason, /Lead records were not retrieved/);
  });
});

describe('No personal information reaches the cached document', () => {
  const classifier = buildClassifier(equipConfig);
  const snap = build({
    demandClassifications: [
      classifier.classify('commercial dishwasher'),
      classifier.classify('coffee machine'),
    ],
    leadDedupe: { rawCount: 67, uniqueCount: 63, duplicateCount: 4, noContactKeyCount: 0, unique: [], duplicates: [] },
  });
  const payload = JSON.stringify(snap);

  test('the document carries counts, not lead records', () => {
    assert.equal(snap.demand.total, 2);
    assert.equal(snap.demand.outOfCatalogue, 1);
    assert.ok(!payload.includes('phoneHash'), 'even hashes should not reach the cached document');
    assert.ok(!payload.includes('emailHash'));
  });

  test('no field name that could carry PII appears anywhere', () => {
    for (const field of ['full_name', 'phone_number', 'company_name', '"email"']) {
      assert.ok(!payload.includes(field), `payload contains ${field}`);
    }
  });

  test('raw and deduplicated lead counts both survive', () => {
    assert.equal(snap.health.leads.rawCount, 67);
    assert.equal(snap.health.leads.uniqueCount, 63);
  });
});

describe('Period comparison', () => {
  test('previous period change percentages compute', () => {
    const snap = build({ previousPeriodTotal: normaliseResponse(fx.weekly)[0] });
    assert.equal(snap.headline.comparison.spend, '220.38');
    assert.equal(snap.headline.comparison.leads, 24);
    assert.ok(Number(snap.headline.comparison.spendChangePct) > 0);
  });
  test('no previous period gives null, not a fabricated zero', () => {
    assert.equal(build().headline.comparison, null);
  });
});
