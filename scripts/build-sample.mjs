#!/usr/bin/env node
/**
 * Generates public/sample-snapshot.json from the captured Meta responses.
 *
 * Everything in the sample is REAL: campaign 120250374716300748, 1 to 25 August
 * 2026, verified against the section 9 baselines. Nothing is invented. Where
 * data genuinely was not available in the build session (HubSpot deals, lead
 * level records, GoCardless funding) the sample shows [TBC], which is the
 * honest state and also demonstrates how the dashboard behaves when a source is
 * missing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { normaliseResponse } from '../src/lib/meta.mjs';
import { buildSnapshot } from '../src/lib/snapshot.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const fx = read('../test/fixtures/meta-aug-2026.json');
const dailyFx = read('../test/fixtures/meta-daily-aug-2026.json');
const assumptions = read('../config/assumptions.json');
const equipmentCatalogue = read('../config/equipment-catalogue.json');

const snapshot = buildSnapshot({
  campaignTotal: normaliseResponse(fx.campaignTotal)[0],
  daily: normaliseResponse(dailyFx.daily),
  weekly: normaliseResponse(fx.weekly),
  byPlatform: normaliseResponse(fx.byPlatform),
  byRegion: normaliseResponse(fx.byRegion),
  byAge: normaliseResponse(fx.byAge),
  byAd: normaliseResponse(fx.byAd),
  datasets: fx.datasets,
  assumptions,
  equipmentCatalogue,
  dateRange: { since: '2026-08-01', until: '2026-08-25' },
  nowMs: Date.parse('2026-08-26T12:00:00Z'),
  lastRefreshAt: '2026-08-26T11:55:00Z',
  // Section 8.3: no stage events reached Meta between 20 and 26 August.
  lastStageEventAt: '2026-08-20T10:00:00Z',
  // The one signed contract in section 9: $115/wk, 156 weeks, $895 install, 6+6.
  representativeDeal: { weeklyPayment: '115', termWeeks: 156, deliveryAndInstall: '895', depositStructure: '6+6' },
  contractsSigned: 1,
  contractsFunded: null,
  fundingDataAvailable: false,
  hubspotAvailable: false,
  attributionMode: 'aggregate',
  meta: {
    expectedPixels: ['1677961872820124', '1336169581641781'],
    approvedDailyRateClaim: '$4.66/day',
  },
});

snapshot.__isSample = true;
snapshot.__sampleNote =
  'Real campaign data, 1 to 25 August 2026, verified against the section 9 validation baselines. ' +
  'HubSpot, lead level records and GoCardless were not reachable when this was generated, so the ' +
  'figures that depend on them show [TBC] rather than a plausible invention.';

writeFileSync(new URL('../public/sample-snapshot.json', import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote public/sample-snapshot.json`);
console.log(`  spend ${snapshot.headline.spend}, leads ${snapshot.headline.leads}, CPL ${snapshot.headline.cpl}`);
console.log(`  contract revenue ${snapshot.unitEconomics.contractRevenue}, LTV:CAC ${snapshot.headline.ltvCac}`);
console.log(`  reconciles: ${snapshot.reconciliation.allReconcile}`);
console.log(`  health: ${snapshot.health.status}, ${snapshot.health.alerts.length} alerts`);
