/**
 * Section 9 validation baselines.
 *
 * "Your pipeline must reproduce these before you trust it."
 * "Do not skip step 2's validation. Every figure downstream inherits it."
 *
 * Every expected value here comes from section 9 of the brief. Every input comes
 * from a real Meta response captured on 26 August 2026. If this file fails, no
 * other number in the dashboard means anything.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normaliseResponse, totalRows, toWeeklyBuckets, parseResults } from '../src/lib/meta.mjs';
import { serialise } from '../src/lib/money.mjs';

const fx = JSON.parse(readFileSync(new URL('./fixtures/meta-aug-2026.json', import.meta.url), 'utf8'));
const dailyFx = JSON.parse(readFileSync(new URL('./fixtures/meta-daily-aug-2026.json', import.meta.url), 'utf8'));

const EXPECTED_SPEND = '656.01';
const EXPECTED_IMPRESSIONS = 39707;
const EXPECTED_LEADS = 63;

describe('Section 9, headline baselines, campaign 1 to 25 August 2026', () => {
  const [row] = normaliseResponse(fx.campaignTotal);

  test('Spend is NZ$656.01', () => assert.equal(serialise(row.spend), EXPECTED_SPEND));
  test('Impressions are 39,707', () => assert.equal(row.impressions, EXPECTED_IMPRESSIONS));
  test('Clicks are 884', () => assert.equal(row.clicks, 884));
  test('CTR is 2.23%', () => assert.equal(serialise(row.ctr), '2.23'));
  test('CPM is NZ$16.52', () => assert.equal(serialise(row.cpm), '16.52'));
  test('Form leads are 63', () => assert.equal(row.leads, EXPECTED_LEADS));
  test('CPL is NZ$10.41', () => assert.equal(serialise(row.cpl), '10.41'));

  test('CPL derived from spend over leads agrees with Meta to the cent', () => {
    assert.equal(serialise(row.spend.div(row.leads)), '10.41');
  });

  test('Frequency is above the 3.0 amber threshold', () => {
    // 3.885225 on the period. A live finding, not a synthetic assertion.
    assert.equal(serialise(row.frequency, 6), '3.885225');
    assert.ok(row.frequency.gt(3.0), 'period frequency should trip amber');
    assert.ok(row.frequency.lt(4.0), 'period frequency should not yet trip red');
  });
});

describe('Section 9, platform split must sum to NZ$656.01', () => {
  const rows = normaliseResponse(fx.byPlatform);
  const total = totalRows(rows);
  const fb = rows.find((r) => r.publisherPlatform === 'facebook');
  const ig = rows.find((r) => r.publisherPlatform === 'instagram');

  test('splits sum to the campaign spend', () => assert.equal(serialise(total.spend), EXPECTED_SPEND));
  test('splits sum to the campaign impressions', () => assert.equal(total.impressions, EXPECTED_IMPRESSIONS));
  test('splits sum to the campaign leads', () => assert.equal(total.leads, EXPECTED_LEADS));

  test('Facebook: $572.26 / 35,516 imp / 58 leads / CPL $9.87', () => {
    assert.equal(serialise(fb.spend), '572.26');
    assert.equal(fb.impressions, 35516);
    assert.equal(fb.leads, 58);
    assert.equal(serialise(fb.cpl), '9.87');
  });

  test('Instagram: $83.75 / 4,191 imp / 5 leads / CPL $16.75', () => {
    assert.equal(serialise(ig.spend), '83.75');
    assert.equal(ig.impressions, 4191);
    assert.equal(ig.leads, 5);
    assert.equal(serialise(ig.cpl), '16.75');
  });
});

describe('Section 9, region split must sum to NZ$656.01', () => {
  const rows = normaliseResponse(fx.byRegion);
  const total = totalRows(rows);

  test('splits sum to the campaign spend', () => assert.equal(serialise(total.spend), EXPECTED_SPEND));
  test('splits sum to the campaign impressions', () => assert.equal(total.impressions, EXPECTED_IMPRESSIONS));

  test('Auckland $654.49, Waikato $1.39, Northland $0.13', () => {
    const byName = Object.fromEntries(rows.map((r) => [r.region, serialise(r.spend)]));
    assert.equal(byName['Auckland Region'], '654.49');
    assert.equal(byName['Waikato'], '1.39');
    assert.equal(byName['Northland Region'], '0.13');
  });

  test('Auckland is 99.8% of spend', () => {
    const auck = rows.find((r) => r.region === 'Auckland Region');
    assert.equal(serialise(auck.spend.div(total.spend).times(100), 1), '99.8');
  });

  test('regions with no leads parse as zero, not as missing', () => {
    // "Not available" is the shape Meta returns for a zero. Treating it as null
    // would drop the row out of a sum and break the 656.01 check silently.
    const waikato = rows.find((r) => r.region === 'Waikato');
    assert.equal(waikato.leads, 0);
    assert.equal(typeof waikato.leads, 'number');
  });
});

describe('Section 9, weekly trend for the fatigue chart', () => {
  const rows = normaliseResponse(fx.weekly);
  // NOTE, one deliberate departure from section 9 of the brief.
  //
  // The brief gives Wk3 CPL as $10.34. That figure is wrong by a cent, and the
  // pipeline is not bent to match it.
  //
  //   $144.83 / 14 = exactly 10.345
  //   Meta's own cost_per_result for 15 to 21 August returns NZ$10.35
  //   Exact decimal arithmetic, rounded half up, gives 10.35
  //   Only banker's rounding or truncation gives 10.34, and Meta uses neither
  //
  // The inputs both reconcile exactly: spend $144.83 and 14 leads are confirmed
  // against the live API. Only the derived figure in the brief is off. Every
  // other baseline in section 9 reproduces to the cent.
  const expected = [
    { start: '2026-08-01', spend: '220.38', ctr: '2.71', leads: 24, cpl: '9.18' },
    { start: '2026-08-08', spend: '210.85', ctr: '2.17', leads: 16, cpl: '13.18' },
    { start: '2026-08-15', spend: '144.83', ctr: '1.79', leads: 14, cpl: '10.35' },
  ];

  for (const [i, e] of expected.entries()) {
    test(`Wk${i + 1} ${e.start}: $${e.spend}, CTR ${e.ctr}%, ${e.leads} leads, CPL $${e.cpl}`, () => {
      const r = rows[i];
      assert.equal(r.dateStart, e.start);
      assert.equal(serialise(r.spend), e.spend);
      assert.equal(serialise(r.ctr), e.ctr);
      assert.equal(r.leads, e.leads);
      assert.equal(serialise(r.spend.div(r.leads)), e.cpl);
    });
  }

  test('Wk3 CPL is exactly 10.345 before rounding, which is why the brief says 10.34', () => {
    const wk3 = rows[2];
    assert.equal(wk3.spend.div(wk3.leads).toString(), '10.345');
    // Confirmed against Meta cost_per_result for 15 to 21 August 2026: NZ$10.35.
    assert.equal(serialise(wk3.spend.div(wk3.leads)), '10.35');
  });

  test('CTR declines every week while spend falls, the fatigue signal', () => {
    const ctrs = rows.map((r) => Number(serialise(r.ctr)));
    assert.ok(ctrs[0] > ctrs[1] && ctrs[1] > ctrs[2], `expected monotonic decline, got ${ctrs.join(' -> ')}`);
  });
});

describe('Daily series reconciles to the same totals', () => {
  const rows = normaliseResponse(dailyFx.daily);
  const total = totalRows(rows);

  test('25 days present', () => assert.equal(rows.length, 25));
  test('daily spend sums to NZ$656.01', () => assert.equal(serialise(total.spend), EXPECTED_SPEND));
  test('daily impressions sum to 39,707', () => assert.equal(total.impressions, EXPECTED_IMPRESSIONS));
  test('daily leads sum to 63', () => assert.equal(total.leads, EXPECTED_LEADS));

  test('zero lead days parse as 0 and stay in the series', () => {
    const zeroDays = rows.filter((r) => r.leads === 0).map((r) => r.dateStart);
    assert.deepEqual(zeroDays, ['2026-08-13', '2026-08-17', '2026-08-22']);
  });

  test('weekly buckets rebuilt from daily match the weekly baselines', () => {
    const buckets = toWeeklyBuckets(rows);
    assert.equal(serialise(buckets[0].spend), '220.38');
    assert.equal(buckets[0].leads, 24);
    assert.equal(serialise(buckets[1].spend), '210.85');
    assert.equal(buckets[1].leads, 16);
    assert.equal(serialise(buckets[2].spend), '144.83');
    assert.equal(buckets[2].leads, 14);
  });

  test('weekly buckets do not carry a summed frequency', () => {
    // Frequency is reach based. Summing or averaging daily frequency would
    // overstate it, so the bucket reports null and the period figure is asked
    // of Meta separately.
    assert.equal(toWeeklyBuckets(rows)[0].frequency, null);
  });
});

describe('Age split must sum to NZ$656.01', () => {
  const total = totalRows(normaliseResponse(fx.byAge));
  test('sums to spend', () => assert.equal(serialise(total.spend), EXPECTED_SPEND));
  test('sums to impressions', () => assert.equal(total.impressions, EXPECTED_IMPRESSIONS));
  test('sums to leads', () => assert.equal(total.leads, EXPECTED_LEADS));
});

describe('Ad level must sum to NZ$656.01, for creative concentration', () => {
  const rows = normaliseResponse(fx.byAd);
  const total = totalRows(rows);

  test('sums to spend', () => assert.equal(serialise(total.spend), EXPECTED_SPEND));
  test('sums to leads', () => assert.equal(total.leads, EXPECTED_LEADS));

  test('one creative carries 74.6% of spend, a concentration risk', () => {
    const top = rows.slice().sort((a, b) => b.spend.comparedTo(a.spend))[0];
    assert.equal(top.name, 'Low Weekly Payment #3');
    assert.equal(serialise(top.spend.div(total.spend).times(100), 1), '74.6');
  });

  test('an ad with spend but no leads has a null CPL, not zero', () => {
    // Dividing by zero leads must not produce 0.00, which would read as
    // "free leads" on the dashboard. It must be [TBC].
    const noLeads = rows.find((r) => r.name === 'Quick Process' && r.impressions === 964);
    assert.equal(noLeads.leads, 0);
    assert.equal(noLeads.cpl, null);
  });

  test('an ad with zero impressions has a null CTR, not zero', () => {
    const noImpressions = rows.find((r) => r.impressions === 0);
    assert.equal(noImpressions.ctr, null);
  });
});

describe('results field, both shapes, because Meta returns both', () => {
  test('values array shape', () => {
    assert.equal(parseResults({ indicator: 'actions:leadgen.other', values: [{ attribution_windows: ['default'], value: '63' }] }), 63);
  });
  test('Not available scalar shape means zero', () => {
    assert.equal(parseResults({ indicator: 'actions:leadgen.other', value: 'Not available' }), 0);
  });
  test('Graph API actions array shape', () => {
    assert.equal(parseResults([{ action_type: 'leadgen.other', value: '63' }, { action_type: 'link_click', value: '884' }]), 63);
  });
  test('absent means zero', () => {
    assert.equal(parseResults(null), 0);
    assert.equal(parseResults(undefined), 0);
  });
  test('a different action type is not counted as a lead', () => {
    assert.equal(parseResults([{ action_type: 'link_click', value: '884' }]), 0);
  });
});
