/**
 * Per lead profiling, against the real HubSpot contact search response shape.
 *
 * The records below reproduce what the connector actually returned on
 * 26 August 2026, including the fields it omits: hs_lead_status and
 * num_associated_deals came back absent on every contact, which is not "no
 * status" but "nobody has set one".
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { profileLead, summariseLeads, enquiryDepth, leadStatus, timeOfDay } from '../src/lib/lead-profile.mjs';
import { buildClassifier } from '../src/lib/equipment.mjs';

const equipmentCatalogue = JSON.parse(readFileSync(new URL('../config/equipment-catalogue.json', import.meta.url), 'utf8'));
const classifier = buildClassifier(equipmentCatalogue);
const EQUIP = 'what_type_of_equipment_are_you_after';
const NOW = Date.parse('2026-08-26T12:00:00Z');
const opts = { classifier, equipmentProperty: EQUIP, nowMs: NOW };

// Verbatim response shape. Note the ABSENT hs_lead_status and num_associated_deals.
const RECORD = {
  id: '244363722338',
  properties: {
    [EQUIP]: 'Ice machine',
    hs_analytics_source: 'PAID_SOCIAL',
    hs_analytics_source_data_1: 'Facebook',
    hs_analytics_source_data_2: 'hh brochure campaign 01/08 2026',
    hs_full_name_or_email: 'A Person',
    company: 'A Cafe Limited',
    createdate: '2026-08-20T23:56:37Z',
    lifecyclestage: 'lead',
  },
};

describe('One lead, profiled', () => {
  const p = profileLead(RECORD, opts);

  test('the submitted date, day and age all come through', () => {
    assert.equal(p.submittedAt, '2026-08-20T23:56:37.000Z');
    assert.ok(p.dayOfWeek, 'a day of week should be derived');
    assert.equal(p.ageDays, 5);
  });
  test('platform and company survive', () => {
    assert.equal(p.platform, 'Facebook');
    assert.equal(p.company, 'A Cafe Limited');
  });
  test('the enquiry is classified', () => {
    assert.equal(p.equipmentCategory, 'ice');
    assert.equal(p.inCatalogue, false);
  });
  test('an absent lead status reads as "Not set", never as a blank', () => {
    assert.equal(p.status.key, 'unset');
    assert.equal(p.status.label, 'Not set');
    assert.equal(p.status.tone, 'warn');
  });
  test('no deal means no deal', () => assert.equal(p.hasDeal, false));

  test('there is no age band field, because Meta never provides one per lead', () => {
    assert.equal(p.ageBand, undefined);
    assert.equal(p.gender, undefined);
    // ageDays is how OLD THE LEAD IS, not how old the person is. The two must
    // never be confused in the UI.
    assert.equal(typeof p.ageDays, 'number');
  });
});

describe('Lead status reflects what the CRM actually says', () => {
  test('an associated deal outranks everything', () => {
    assert.equal(leadStatus({ lifecycleStage: 'lead', leadStatus: 'NEW', associatedDeals: '2' }).key, 'deal');
  });
  test('a set lead status is shown as set', () => {
    assert.equal(leadStatus({ lifecycleStage: 'lead', leadStatus: 'IN_PROGRESS' }).label, 'In progress');
  });
  test('a lifecycle stage past lead is shown when no lead status exists', () => {
    assert.equal(leadStatus({ lifecycleStage: 'opportunity' }).label, 'Opportunity');
  });
  test('nothing set is reported as unset and flagged', () => {
    const s = leadStatus({ lifecycleStage: 'lead' });
    assert.equal(s.key, 'unset');
    assert.equal(s.tone, 'warn');
  });
});

describe('Enquiry depth, the psychographic read', () => {
  const depth = (t) => enquiryDepth(classifier.classify(t));

  test('a single item is a replacement', () => assert.equal(depth('Deep fryer').specificity, 'single'));
  test('two categories', () => assert.equal(depth('griddle and a dishwasher').specificity, 'pair'));
  test('many categories is a venue fitout', () => {
    const d = depth('commercial freezer, fryer, hotplate, double door fridge, food warmer, range hood');
    assert.equal(d.specificity, 'fitout');
    assert.ok(d.breadth >= 3);
  });
  test('a general enquiry is its own thing, not a single item', () => {
    assert.equal(depth('Kitchen').specificity, 'vague');
  });
  test('no answer is distinguished from a vague answer', () => {
    assert.equal(depth('').specificity, 'unstated');
  });
});

describe('Time of day buckets', () => {
  for (const [hour, expected] of [[2, 'Overnight'], [9, 'Morning'], [14, 'Afternoon'], [19, 'Evening'], [22, 'Late evening']]) {
    test(`${hour}:00 is ${expected}`, () => assert.equal(timeOfDay(hour), expected));
  }
});

describe('The summary surfaces the operational problem', () => {
  // The real cohort: every lead at lifecyclestage "lead", no lead status set,
  // no associated deal.
  const rows = Array.from({ length: 10 }, (_, i) => profileLead({
    id: String(i),
    properties: { ...RECORD.properties, createdate: `2026-08-${String(10 + i).padStart(2, '0')}T09:00:00Z` },
  }, opts));
  const sum = summariseLeads(rows, { nowMs: NOW });

  test('it counts how many have never been marked', () => {
    assert.equal(sum.unset, 10);
    assert.equal(sum.withStatus, 0);
  });
  test('it counts untouched leads older than a week, which is the actionable number', () => {
    // Leads from 10 to 18 August are more than 7 days before 26 August.
    assert.equal(sum.stale, 9);
  });
  test('none reached a deal', () => assert.equal(sum.withDeal, 0));
  test('it reports the busiest day and time', () => {
    assert.ok(sum.busiestDay.count > 0);
    assert.equal(sum.busiestTime.key, 'Morning');
  });
  test('the age band limitation is stated rather than omitted', () => {
    assert.match(sum.ageBandNote, /not available per lead/);
    assert.match(sum.ageBandNote, /aggregate/);
  });
});

describe('Bad data does not break a row', () => {
  test('a missing created date yields nulls, not a wrong date', () => {
    const p = profileLead({ id: '1', properties: { [EQUIP]: 'oven' } }, opts);
    assert.equal(p.submittedAt, null);
    assert.equal(p.dayOfWeek, null);
    assert.equal(p.ageDays, null);
  });
  test('an unparseable created date is treated as missing', () => {
    const p = profileLead({ id: '1', properties: { createdate: 'not a date' } }, opts);
    assert.equal(p.submittedAt, null);
  });
  test('an empty record does not throw', () => {
    assert.doesNotThrow(() => profileLead({}, opts));
    assert.doesNotThrow(() => profileLead(null, opts));
  });
  test('an empty set summarises to zeroes rather than NaN', () => {
    const sum = summariseLeads([], { nowMs: NOW });
    assert.equal(sum.total, 0);
    assert.equal(sum.medianAgeDays, null);
    assert.equal(sum.busiestDay, null);
  });
});
