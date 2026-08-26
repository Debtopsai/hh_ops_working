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
import { buildClassifier } from '../src/lib/equipment.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const fx = read('../test/fixtures/meta-aug-2026.json');
const dailyFx = read('../test/fixtures/meta-daily-aug-2026.json');
const assumptions = read('../config/assumptions.json');
const equipmentCatalogue = read('../config/equipment-catalogue.json');
const { enquiries } = read('../test/fixtures/equipment-enquiries.json');

// The demand panel is real: 58 equipment enquiries retrieved from HubSpot on
// 26 August 2026, classified here. No names or contact details are involved.
const classifier = buildClassifier(equipmentCatalogue);
const demandClassifications = enquiries.map((e) => classifier.classify(e));

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
  // The one signed contract in section 9. CONFIRMED in HubSpot as the deal
  // "CIAO CUSINA LIMITED (9343046) Registered - Lease agreement", created
  // 19 August 2026: weekly_total_cost 115, rent_in_advance 6 weeks / $690,
  // security_deposit 6 weeks / $690.
  //
  // The 156 week term and the $895 delivery and install come from section 9 of
  // the brief, NOT from HubSpot: the term properties are empty on every deal
  // and there is no delivery charge property at all. Flagged rather than
  // presented as CRM data.
  representativeDeal: { weeklyPayment: '115', termWeeks: 156, deliveryAndInstall: '895', depositStructure: '6+6' },
  contractsSigned: 1,
  contractsFunded: null,
  fundingDataAvailable: false,
  demandClassifications,

  // The real state of portal 47462529 on 26 August 2026. HubSpot IS connected,
  // the campaign join matches 66 of 67 leads, and not one of those leads has an
  // associated deal. So the funnel past "lead" stays unavailable even though
  // the CRM is wired up. See docs/hubspot-schema.md.
  hubspotAvailable: false,
  hubspotConnected: true,
  cohortSize: 66,
  attribution: {
    mode: 'aggregate',
    campaignJoin: { ok: true, matched: 66, property: 'hs_analytics_source_data_2', matchValue: 'hh brochure campaign 01/08 2026' },
    dealJoin: { ok: false, cohortLeadsWithDeals: 0, dealsWithContacts: 1, totalDeals: 49 },
    reason: 'No lead in the campaign cohort has an associated deal, and deals arrive from a separate integration with no contact attached.',
  },
  dealQuality: {
    missingTerm: 49,
    missingWeekly: 0,
    withContacts: 1,
    withoutContacts: 48,
    contractRevenueComputable: false,
    note: 'Every one of the 49 deals has an empty term. The finance_term and finance_custom_term_weeks properties exist but are unpopulated.',
  },
  attributionMode: 'aggregate',
  meta: {
    expectedPixels: ['1677961872820124', '1336169581641781'],
    approvedDailyRateClaim: '$4.66/day',
  },
});

snapshot.__isSample = true;
snapshot.__sampleNote =
  'Real campaign data, 1 to 25 August 2026, verified against the section 9 validation baselines. ' +
  'The demand panel is real: 58 equipment enquiries from HubSpot, classified. ' +
  'The funnel past "lead" shows [TBC] because no lead in the campaign cohort has an associated deal, ' +
  'and contract revenue shows the section 9 figures because the term is empty on every deal in HubSpot. ' +
  'See docs/hubspot-schema.md.';
snapshot.__representativeDealSource =
  'Weekly payment and deposit confirmed in HubSpot (Ciao Cusina, 19 August 2026). Term and install charge from section 9 of the brief, not from the CRM.';

writeFileSync(new URL('../public/sample-snapshot.json', import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote public/sample-snapshot.json`);
console.log(`  spend ${snapshot.headline.spend}, leads ${snapshot.headline.leads}, CPL ${snapshot.headline.cpl}`);
console.log(`  contract revenue ${snapshot.unitEconomics.contractRevenue}, LTV:CAC ${snapshot.headline.ltvCac}`);
console.log(`  reconciles: ${snapshot.reconciliation.allReconcile}`);
console.log(`  health: ${snapshot.health.status}, ${snapshot.health.alerts.length} alerts`);
