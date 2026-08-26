/**
 * Stage mapping, equipment classification, lead handling, data health and the
 * funnel. Sections 8.1 to 8.5 of the brief.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStageMap, classifyStages, cumulativeCounts } from '../src/lib/stage-map.mjs';
import { buildClassifier, summariseDemand } from '../src/lib/equipment.mjs';
import { stripLead, deduplicateLeads, normalisePhone, normaliseEmail, newSalt, medianDays } from '../src/lib/leads.mjs';
import { pixelHealth, stageEventFreshness, parseTimestamp, buildHealthPanel } from '../src/lib/health.mjs';
import { buildFunnel } from '../src/lib/funnel.mjs';
import { Decimal, serialise } from '../src/lib/money.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const stageConfig = read('../config/stage-map.json');
const equipConfig = read('../config/equipment-catalogue.json');
const fx = read('./fixtures/meta-aug-2026.json');

describe('Section 8.2, duplicated stage names', () => {
  const map = buildStageMap(stageConfig);

  test('QUALIFIED and QualifiedLead both map to qualified', () => {
    assert.equal(map.resolve({ label: 'QUALIFIED' }).bucket, 'qualified');
    assert.equal(map.resolve({ label: 'QualifiedLead' }).bucket, 'qualified');
  });

  test('Quote Sent and Send Quote both map to quoted', () => {
    assert.equal(map.resolve({ label: 'Quote Sent' }).bucket, 'quoted');
    assert.equal(map.resolve({ label: 'Send Quote' }).bucket, 'quoted');
  });

  test('the twenty split quote leads reconcile to one number', () => {
    // "Twenty quote-stage leads were split across two event names, neither with
    // enough volume to be useful."
    const events = [
      ...Array(11).fill({ stageLabel: 'Quote Sent' }),
      ...Array(9).fill({ stageLabel: 'Send Quote' }),
    ];
    assert.equal(classifyStages(events, map).counts.quoted, 20);
  });

  test('Unqualified, Blocked and BAD all map to dead', () => {
    for (const l of ['Unqualified', 'Blocked', 'BAD']) assert.equal(map.resolve({ label: l }).bucket, 'dead');
  });

  test('CONVERTED maps to won', () => assert.equal(map.resolve({ label: 'CONVERTED' }).bucket, 'won'));

  test('LEADS is ignored, not counted and not alarmed on', () => {
    // It is not a stage. It must not inflate the funnel and must not trip the
    // unmapped alarm, or the alarm stops being believed.
    const r = classifyStages([{ stageLabel: 'LEADS' }], map);
    assert.equal(r.counts.ignore, 1);
    assert.equal(r.unmapped, 0);
    assert.equal(r.counts.qualified, 0);
  });

  test('an unrecognised label lands in unmapped AND is named', () => {
    const r = classifyStages([{ stageLabel: 'Proposal Sent' }, { stageLabel: 'Proposal Sent' }], map);
    assert.equal(r.unmapped, 2);
    assert.deepEqual(r.unmappedLabels, [{ label: 'Proposal Sent', count: 2 }]);
  });

  test('matching is case and whitespace insensitive', () => {
    assert.equal(map.resolve({ label: '  quote   sent ' }).bucket, 'quoted');
    assert.equal(map.resolve({ label: 'converted' }).bucket, 'won');
  });

  test('a stage id beats a label, because labels get renamed', () => {
    const withIds = buildStageMap({ ...stageConfig, byStageId: { '12345': 'won' } });
    // Label says qualified, id says won. The id wins.
    assert.equal(withIds.resolve({ stageId: '12345', label: 'QUALIFIED' }).bucket, 'won');
    assert.equal(withIds.resolve({ stageId: '12345', label: 'QUALIFIED' }).matchedOn, 'stageId');
  });

  test('quotes issued counts quote stage or beyond', () => {
    const counts = { qualified: 5, quoted: 3, won: 2, dead: 4, ignore: 0, unmapped: 0 };
    const cum = cumulativeCounts(counts, buildStageMap(stageConfig));
    assert.equal(cum.quoted, 5);      // quoted + won
    assert.equal(cum.qualified, 10);  // qualified + quoted + won
    assert.equal(cum.won, 2);
  });

  test('dead leads break down by reason', () => {
    const r = classifyStages([{ stageLabel: 'Unqualified' }, { stageLabel: 'Unqualified' }, { stageLabel: 'BAD' }], buildStageMap(stageConfig));
    const reasons = Object.fromEntries(r.deadByReason.map((d) => [d.reason, d.count]));
    assert.equal(reasons['Did not meet credit or business criteria'], 2);
    assert.equal(reasons['Bad data or bad faith enquiry'], 1);
  });
});

describe('Section 8.4, out of catalogue leads', () => {
  const c = buildClassifier(equipConfig);

  test('an ice maker is out of catalogue, not swept into refrigeration', () => {
    // The ordering trap. "ice" must be tested before the refrigeration keywords.
    const r = c.classify('ice maker');
    assert.equal(r.inCatalogue, false);
    assert.equal(r.category, 'ice');
  });

  for (const [text, category] of [
    ['coffee machine', 'coffee'],
    ['espresso grinder', 'coffee'],
    ['a double sink', 'plumbing'],
    ['extract fan for the kitchen', 'ventilation'],
    ['earthmoving equipment', 'nonHospitality'],
  ]) {
    test(`"${text}" is out of catalogue (${category})`, () => {
      const r = c.classify(text);
      assert.equal(r.inCatalogue, false, `expected out of catalogue, got ${r.category}`);
      assert.equal(r.category, category);
    });
  }

  for (const [text, category] of [
    ['commercial dishwasher', 'dishwashers'],
    ['glasswasher for the bar', 'glasswashers'],
    ['combi oven', 'combiOvens'],
    ['deep fryer', 'fryers'],
    ['pizza oven', 'pizzaAndConveyorOvens'],
    ['under bench fridge', 'refrigeration'],
    ['planetary mixer', 'bakeryAndDough'],
    ['salamander grill', 'griddlesAndSalamanders'],
  ]) {
    test(`"${text}" is in catalogue (${category})`, () => {
      const r = c.classify(text);
      assert.equal(r.inCatalogue, true, `expected in catalogue, got ${r.category}`);
      assert.equal(r.category, category);
    });
  }

  test('word boundaries hold: "sinking fund" is not a sink', () => {
    assert.notEqual(c.classify('sinking fund advice').category, 'plumbing');
  });

  test('an empty enquiry is unstated, not guessed', () => {
    assert.equal(c.classify('').category, 'unstated');
    assert.equal(c.classify(null).category, 'unstated');
    assert.equal(c.classify('').inCatalogue, null);
  });

  test('an unrecognised enquiry is unclassified and NOT assumed in catalogue', () => {
    const r = c.classify('a widget thingamajig');
    assert.equal(r.outcome, 'unclassified');
    assert.equal(r.inCatalogue, null);
  });

  test('a vague but real answer is its own state, not an unclassified one', () => {
    // "Kitchen" and "Various" are answers. Treating them as no-answer, or as
    // in catalogue, would both be wrong.
    for (const v of ['Kitchen', 'Various', 'Catering equipment']) {
      assert.equal(c.classify(v).outcome, 'vague', `"${v}" should be vague`);
    }
  });

  test('a mixed enquiry counts as worth having, not as wasted spend', () => {
    // This test previously asserted the opposite, and the opposite was wrong.
    // Real data settled it: one lead named eleven financeable items plus a
    // range hood. Classifying that lead as out of catalogue would charge a
    // good lead to wasted spend and argue for narrowing ad copy that works.
    const r = c.classify('coffee machine and a dishwasher');
    assert.equal(r.outcome, 'mixed');
    assert.equal(r.inCatalogue, true);
    assert.ok(r.inCategories.includes('dishwashers'));
    assert.ok(r.outCategories.includes('coffee'));
  });

  test('mixed leads are excluded from the wasted spend estimate', () => {
    const summary = summariseDemand([
      c.classify('coffee machine'),                    // pure out, wasted
      c.classify('coffee machine and a dishwasher'),   // mixed, worth having
      c.classify('commercial dishwasher'),             // pure in
    ], { cpl: new Decimal('10.41') });
    assert.equal(summary.outOfCatalogue, 1);
    assert.equal(summary.mixed, 1);
    assert.equal(summary.worthHaving, 2);
    assert.equal(serialise(summary.estimatedWastedSpend.value), '10.41');
  });

  test('the share is of classified leads, so vague answers cannot deflate it', () => {
    const summary = summariseDemand([
      c.classify('coffee machine'),
      c.classify('commercial dishwasher'),
      c.classify('Various'),
      c.classify(''),
    ]);
    assert.equal(summary.outOfCatalogueShare, 0.5); // 1 of 2 classified, not 1 of 4
    assert.equal(summary.vague, 1);
    assert.equal(summary.unstated, 1);
  });
});

describe('Section 3, lead records are personal information', () => {
  const salt = newSalt();
  const c = buildClassifier(equipConfig);
  const rawLead = {
    id: 'l_1', created_time: '2026-08-12T09:00:00+1200', ad_id: 'a1', campaign_id: 'c1',
    'what_type_of_equipment_are_you_after:': 'commercial dishwasher',
    full_name: 'A Real Person', email: 'A.Person@Example.co.nz', phone_number: '021 234 5678',
    company_name: 'A Real Cafe Limited', platform: 'fb',
  };

  test('name, email, phone and company do not survive stripping', () => {
    const s = stripLead(rawLead, { salt, classifier: c });
    const serialised = JSON.stringify(s);
    for (const secret of ['A Real Person', 'A.Person@Example.co.nz', 'Person@Example', '021 234 5678', '0212345678', 'A Real Cafe Limited']) {
      assert.ok(!serialised.includes(secret), `stripped lead still contains "${secret}"`);
    }
    assert.equal(s.full_name, undefined);
    assert.equal(s.email, undefined);
    assert.equal(s.phone_number, undefined);
    assert.equal(s.company_name, undefined);
  });

  test('the free text enquiry is not retained, only its category', () => {
    const s = stripLead({ ...rawLead, 'what_type_of_equipment_are_you_after:': 'dishwasher, call me on 021 999 8888' }, { salt, classifier: c });
    assert.ok(!JSON.stringify(s).includes('021 999 8888'));
    assert.equal(s.equipmentCategory, 'dishwashers');
  });

  test('the equipment field is read despite its trailing colon', () => {
    assert.equal(stripLead(rawLead, { salt, classifier: c }).equipmentCategory, 'dishwashers');
  });

  test('hashes are stable within a refresh and differ across salts', () => {
    const a = stripLead(rawLead, { salt, classifier: c });
    const b = stripLead(rawLead, { salt, classifier: c });
    const other = stripLead(rawLead, { salt: newSalt(), classifier: c });
    assert.equal(a.phoneHash, b.phoneHash);
    assert.notEqual(a.phoneHash, other.phoneHash);
  });
});

describe('NZ phone normalisation, because the formats are a mess', () => {
  test('64, 021, 09 and +64 forms all normalise together', () => {
    const forms = ['6421234567', '021234567'.replace('021', '021'), '+64 21 234 567', '0064212345 67'];
    const normalised = forms.map(normalisePhone);
    assert.equal(normalised[0], '21234567');
    assert.equal(normalised[2], '21234567');
    assert.equal(normalised[3], '21234567');
  });
  test('a landline normalises consistently', () => {
    assert.equal(normalisePhone('09 123 4567'), '91234567');
    assert.equal(normalisePhone('6491234567'), '91234567');
  });
  test('#ERROR! and junk give null rather than a false key', () => {
    // Nine of these exist in the customer database already.
    assert.equal(normalisePhone('#ERROR!'), null);
    assert.equal(normalisePhone(''), null);
    assert.equal(normalisePhone('123'), null);
  });
  test('email normalisation is case insensitive', () => {
    assert.equal(normaliseEmail('  A.Person@Example.CO.NZ '), 'a.person@example.co.nz');
    assert.equal(normaliseEmail('not-an-email'), null);
  });
});

describe('Section 8.5, duplicate submissions', () => {
  const salt = newSalt();
  const c = buildClassifier(equipConfig);
  const mk = (id, phone, email, when) => stripLead(
    { id, created_time: when, phone_number: phone, email, 'what_type_of_equipment_are_you_after:': 'dishwasher' },
    { salt, classifier: c },
  );

  test('the same person twice within an hour collapses to one', () => {
    const r = deduplicateLeads([
      mk('l1', '021 234 5678', 'a@b.co.nz', '2026-08-12T09:00:00Z'),
      mk('l2', '+6421234567', 'a@b.co.nz', '2026-08-12T09:45:00Z'),
    ]);
    assert.equal(r.uniqueCount, 1);
    assert.equal(r.rawCount, 2);
    assert.equal(r.duplicateCount, 1);
  });

  test('both counts stay visible, neither replaces the other', () => {
    const r = deduplicateLeads([mk('l1', '021234567', 'a@b.co.nz'), mk('l2', '021234567', 'a@b.co.nz')]);
    assert.equal(r.rawCount, 2);
    assert.equal(r.uniqueCount, 1);
  });

  test('a match on phone alone is enough', () => {
    const r = deduplicateLeads([mk('l1', '021234567', 'first@b.co.nz'), mk('l2', '021234567', 'second@b.co.nz')]);
    assert.equal(r.uniqueCount, 1);
    assert.equal(r.duplicates[0].matchedOn, 'phone');
  });

  test('a match on email alone is enough', () => {
    const r = deduplicateLeads([mk('l1', '021111111', 'a@b.co.nz'), mk('l2', '022222222', 'a@b.co.nz')]);
    assert.equal(r.uniqueCount, 1);
    assert.equal(r.duplicates[0].matchedOn, 'email');
  });

  test('different people are not merged', () => {
    const r = deduplicateLeads([mk('l1', '021111111', 'a@b.co.nz'), mk('l2', '022222222', 'c@d.co.nz')]);
    assert.equal(r.uniqueCount, 2);
  });

  test('a lead with no usable contact key counts as unique, not merged', () => {
    const r = deduplicateLeads([mk('l1', '#ERROR!', null), mk('l2', '#ERROR!', null)]);
    assert.equal(r.uniqueCount, 2);
    assert.equal(r.noContactKeyCount, 2);
  });
});

describe('Section 8.1, two live pixels', () => {
  const nowMs = Date.parse('2026-08-26T12:00:00Z');

  test('the epoch sentinel is not a real timestamp', () => {
    // Observed live: last_fired_time "1969-12-31T16:00:00-0800". Naively this
    // reports 56 years stale and the freshness alarm becomes noise.
    assert.equal(parseTimestamp('1969-12-31T16:00:00-0800'), null);
    assert.equal(parseTimestamp(null), null);
    assert.ok(parseTimestamp('2026-08-26T01:26:34-0700') > 0);
  });

  test('four dataset rows collapse to two distinct pixels', () => {
    const h = pixelHealth(fx.datasets, { nowMs });
    assert.equal(h.distinctCount, 2);
    assert.deepEqual(h.pixels.map((p) => p.id).sort(), ['1336169581641781', '1677961872820124']);
  });

  test('a duplicated row does not clobber the real fire time with the sentinel', () => {
    const h = pixelHealth(fx.datasets, { nowMs });
    for (const p of h.pixels) {
      assert.ok(p.lastFiredMs, `pixel ${p.id} lost its fire time to the sentinel`);
      assert.ok(p.hoursSinceLastFired < 48, `pixel ${p.id} reported ${p.hoursSinceLastFired} hours stale`);
    }
  });

  test('both pixels being live raises the consolidation warning', () => {
    const h = pixelHealth(fx.datasets, { nowMs });
    assert.equal(h.activeCount, 2);
    assert.equal(h.duplicatePixelWarning, true);
    assert.match(h.warningText, /prerequisite, not a nice to have/);
  });

  test('one pixel raises no warning', () => {
    const h = pixelHealth([fx.datasets[1]], { nowMs });
    assert.equal(h.duplicatePixelWarning, false);
  });
});

describe('Section 8.3, the sync gap', () => {
  const nowMs = Date.parse('2026-08-26T12:00:00Z');

  test('the real 20 to 26 August gap trips the 48 hour alarm', () => {
    const f = stageEventFreshness('2026-08-20T10:00:00Z', { nowMs, thresholdHours: 48 });
    assert.equal(f.status, 'stale');
    assert.equal(f.alert, true);
    assert.ok(f.hoursSince > 48);
    assert.match(f.message, /CRM sync has broken or contacting a lead is not triggering a stage change/);
  });

  test('a recent event does not alarm', () => {
    const f = stageEventFreshness('2026-08-26T06:00:00Z', { nowMs, thresholdHours: 48 });
    assert.equal(f.status, 'ok');
    assert.equal(f.alert, false);
  });

  test('no timestamp at all alarms rather than passing silently', () => {
    const f = stageEventFreshness(null, { nowMs });
    assert.equal(f.status, 'unknown');
    assert.equal(f.alert, true);
  });
});

describe('Panel 7 rolls up, and is never optional', () => {
  const nowMs = Date.parse('2026-08-26T12:00:00Z');
  const panel = buildHealthPanel({
    datasets: fx.datasets,
    lastStageEventAt: '2026-08-20T10:00:00Z',
    lastRefreshAt: '2026-08-26T11:30:00Z',
    stageClassification: { unmapped: 3, unmappedLabels: [{ label: 'Proposal Sent', count: 3 }] },
    leadDedupe: { rawCount: 67, uniqueCount: 66, duplicateCount: 1, noContactKeyCount: 0 },
    hubspotAvailable: false,
    attributionMode: 'aggregate',
    nowMs,
    thresholds: { staleStageEventHours: 48, staleMetaSyncHours: 6 },
    expectedPixels: ['1677961872820124', '1336169581641781'],
  });

  test('overall status is critical when anything critical is open', () => assert.equal(panel.status, 'critical'));
  test('unmapped stages raise a named alarm', () => {
    const a = panel.alerts.find((x) => x.code === 'unmapped_stages');
    assert.ok(a);
    assert.match(a.message, /Proposal Sent/);
    assert.match(a.message, /silently wrong/);
  });
  test('duplicate pixels, stale stages and missing HubSpot all surface', () => {
    const codes = panel.alerts.map((a) => a.code);
    for (const c of ['duplicate_pixels', 'stage_events_stale', 'hubspot_unavailable']) {
      assert.ok(codes.includes(c), `missing alert ${c}`);
    }
  });

  test('a disconnected HubSpot does not ALSO raise the attribution warning', () => {
    // "Not connected" and "connected but the join is dead" are different
    // problems with different fixes. Raising both when only the first applies
    // makes the panel noisier and the real one harder to find.
    const codes = panel.alerts.map((a) => a.code);
    assert.ok(!codes.includes('aggregate_attribution'));
  });
  test('both expected pixels are present', () => assert.deepEqual(panel.pixels.expectedButMissing, []));
  test('the raw lead count stays visible next to the deduplicated one', () => {
    assert.equal(panel.leads.rawCount, 67);
    assert.equal(panel.leads.uniqueCount, 66);
  });
});

describe('The funnel shows [TBC], never a misleading zero', () => {
  const base = { spend: '656.01', leadCount: 63, rawLeadCount: 67 };

  test('with HubSpot unavailable, stages past lead are null not zero', () => {
    const f = buildFunnel({ ...base, hubspotAvailable: false, fundingDataAvailable: false, contractsSigned: 1 });
    const byKey = Object.fromEntries(f.stages.map((s) => [s.key, s]));
    assert.equal(byKey.lead.count, 63);
    assert.equal(byKey.qualified.count, null);   // not 0: "nobody qualified" is a different claim
    assert.equal(byKey.quoted.count, null);
    assert.equal(byKey.qualified.available, false);
  });

  test('funded stays null while GoCardless is not connected', () => {
    const f = buildFunnel({ ...base, hubspotAvailable: true, fundingDataAvailable: false, contractsSigned: 1, cumulative: { qualified: 20, quoted: 20, won: 1 } });
    const byKey = Object.fromEntries(f.stages.map((s) => [s.key, s]));
    assert.equal(byKey.signed.count, 1);
    assert.equal(byKey.funded.count, null);
    assert.match(f.fundingNote, /A contract with no cleared deposit is not a deal/);
  });

  test('lead to close is not silently computed from signed', () => {
    const f = buildFunnel({ ...base, hubspotAvailable: true, fundingDataAvailable: false, contractsSigned: 1, cumulative: { qualified: 20, quoted: 20, won: 1 } });
    assert.equal(f.leadToClose, null);              // funded basis, unavailable
    assert.ok(f.leadToCloseSignedBasis > 0);        // available, but separately named
  });

  test('cost per stage uses spend over the stage count', () => {
    const f = buildFunnel({ ...base, hubspotAvailable: true, fundingDataAvailable: false, cumulative: { qualified: 20, quoted: 20, won: 1 } });
    const qualified = f.stages.find((s) => s.key === 'qualified');
    assert.equal(serialise(qualified.costPerUnit), '32.80'); // 656.01 / 20
  });

  test('the aggregate attribution caveat is carried on every stage', () => {
    const f = buildFunnel({ ...base, hubspotAvailable: true, attributionMode: 'aggregate' });
    assert.ok(f.stages.every((s) => s.attributionMode === 'aggregate'));
    assert.match(f.attributionNote, /not traced cohorts/);
  });

  test('deduplicated and raw lead counts both travel', () => {
    const f = buildFunnel(base);
    assert.equal(f.leads.deduplicated, 63);
    assert.equal(f.leads.raw, 67);
    assert.equal(f.leads.duplicatesRemoved, 4);
  });
});

describe('Sales cycle median', () => {
  test('median days from lead to closed won', () => {
    const r = medianDays([
      { from: '2026-08-01T00:00:00Z', to: '2026-08-17T00:00:00Z' },
      { from: '2026-08-01T00:00:00Z', to: '2026-08-19T00:00:00Z' },
      { from: '2026-08-01T00:00:00Z', to: '2026-08-18T00:00:00Z' },
    ]);
    assert.equal(r.medianDays, 17);
    assert.equal(r.sampleSize, 3);
  });
  test('an empty set gives null, not zero', () => assert.equal(medianDays([]), null));
  test('incomplete pairs are excluded rather than counted as same day', () => {
    assert.equal(medianDays([{ from: '2026-08-01T00:00:00Z', to: null }]), null);
  });
});


describe('Connected HubSpot with a dead lead to deal join', () => {
  // The actual state of portal 47462529 on 26 August 2026: the campaign join
  // matches 66 leads, and not one of them reaches a deal.
  const nowMs = Date.parse('2026-08-26T12:00:00Z');
  const panel = buildHealthPanel({
    datasets: fx.datasets,
    lastStageEventAt: '2026-08-26T06:00:00Z',
    lastRefreshAt: '2026-08-26T11:30:00Z',
    stageClassification: { unmapped: 0, unmappedLabels: [] },
    leadDedupe: null,
    hubspotAvailable: false,
    hubspotConnected: true,
    attribution: {
      mode: 'aggregate',
      campaignJoin: { ok: true, matched: 66, property: 'hs_analytics_source_data_2' },
      dealJoin: { ok: false, cohortLeadsWithDeals: 0, dealsWithContacts: 1, totalDeals: 49 },
    },
    dealQuality: { missingTerm: 49, contractRevenueComputable: false, note: 'Every deal has an empty term.' },
    cohortSize: 66,
    nowMs,
  });

  test('says the join is broken, not that HubSpot is missing', () => {
    const codes = panel.alerts.map((a) => a.code);
    assert.ok(codes.includes('lead_to_deal_join_broken'));
    assert.ok(!codes.includes('hubspot_unavailable'), 'HubSpot IS connected, so that alert would be wrong');
  });

  test('the alert names the numbers that prove it', () => {
    const a = panel.alerts.find((x) => x.code === 'lead_to_deal_join_broken');
    assert.match(a.message, /66 leads matched/);
    assert.match(a.message, /1 of 49 deals/);
    assert.equal(a.level, 'critical');
  });

  test('the missing term blocks contract revenue and says so', () => {
    const a = panel.alerts.find((x) => x.code === 'no_deal_term');
    assert.ok(a);
    assert.match(a.message, /Contract revenue, LTV and LTV:CAC cannot be computed/);
  });

  test('attribution stays aggregate while the deal join is dead', () => {
    assert.equal(panel.attributionMode, 'aggregate');
    assert.ok(panel.alerts.some((x) => x.code === 'aggregate_attribution'));
  });
});
