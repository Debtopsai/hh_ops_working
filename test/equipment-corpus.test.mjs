/**
 * The equipment classifier against all 58 real enquiries, retrieved from
 * HubSpot on 26 August 2026.
 *
 * Section 8.4 of the brief estimated "roughly 19%" of leads request equipment
 * HireHospo does not finance. That estimate is the thing being checked here:
 * if the classifier reproduces it from real text, both are probably right.
 *
 * Every case below was verified by reading the actual enquiry. Where the brief
 * and the data disagreed, the data won and the disagreement is noted.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildClassifier, summariseDemand } from '../src/lib/equipment.mjs';
import { Decimal, serialise } from '../src/lib/money.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const config = read('../config/equipment-catalogue.json');
const { enquiries } = read('./fixtures/equipment-enquiries.json');

const classifier = buildClassifier(config);
const classified = enquiries.map((e) => classifier.classify(e));
const summary = summariseDemand(classified, { cpl: new Decimal('10.41') });

describe('The whole corpus classifies', () => {
  test('58 enquiries present', () => assert.equal(enquiries.length, 58));

  test('every single one is classified, none left unclassified', () => {
    const misses = enquiries.filter((e, i) => classified[i].outcome === 'unclassified');
    assert.deepEqual(misses, [], `unclassified: ${JSON.stringify(misses)}`);
  });

  test("the out of catalogue share reproduces the brief's roughly 19%", () => {
    assert.equal(Math.round(summary.outOfCatalogueShare * 1000) / 10, 19.6);
  });

  test('estimated wasted spend at the average CPL', () => {
    // 10 pure out of catalogue leads at NZ$10.41.
    assert.equal(summary.outOfCatalogue, 10);
    assert.equal(serialise(summary.estimatedWastedSpend.value), '104.10');
  });

  test('the counts add up to the total', () => {
    const { inCatalogue, mixed, outOfCatalogue, vague, unstated, unclassified, total } = summary;
    assert.equal(inCatalogue + mixed + outOfCatalogue + vague + unstated + unclassified, total);
  });
});

describe('Defects that only real text exposed', () => {
  const outcomeOf = (text) => classifier.classify(text).outcome;
  const categoryOf = (text) => classifier.classify(text).category;

  test('a bare "Oven" is in catalogue. Six leads said exactly that', () => {
    assert.equal(outcomeOf('Oven'), 'inCatalogue');
    assert.equal(categoryOf('Oven'), 'ovensUnspecified');
    assert.equal(outcomeOf('commercial oven'), 'inCatalogue');
  });

  test('"lpg griller" matches grill, because suffixes are tolerated', () => {
    assert.equal(categoryOf('lpg griller'), 'griddlesAndSalamanders');
  });

  test('but "sinking" still does not match "sink", because "ing" is not', () => {
    assert.notEqual(categoryOf('sinking fund advice'), 'plumbing');
    assert.equal(categoryOf('Kitchen sink'), 'plumbing');
    assert.equal(categoryOf('two sinks'), 'plumbing');
  });

  test('"filling  machine" matches despite the double space', () => {
    assert.equal(outcomeOf('filling  machine'), 'outOfCatalogue');
  });

  test('typos in real submissions are handled', () => {
    assert.equal(outcomeOf('speed owen'), 'inCatalogue');       // oven
    assert.equal(outcomeOf('Gas hop'), 'inCatalogue');          // hob
    assert.equal(categoryOf('comercial indin cooking cook top'), 'rangesAndCooktops');
  });

  test('"cafe mashin" is vague, not guessed into coffee', () => {
    // It probably means a coffee machine, which would be out of catalogue.
    // Guessing would move a lead across the in/out line on a hunch.
    assert.equal(outcomeOf('cafe mashin'), 'vague');
  });
});

describe('Longer keywords beat shorter ones', () => {
  test('"ice maker" is ice, not swept into refrigeration', () => {
    assert.equal(classifier.classify('ice maker').category, 'ice');
    assert.equal(classifier.classify('Ice machine').category, 'ice');
  });
  test('"pizza oven" is pizza, not ovensUnspecified', () => {
    assert.equal(classifier.classify('pizza oven').category, 'pizzaAndConveyorOvens');
  });
  test('"combination oven" is a combi oven, not ovensUnspecified', () => {
    assert.equal(classifier.classify('Buffet cold and a combination oven').category, 'combiOvens');
  });
  test('"oven with steam" is a combi oven', () => {
    assert.equal(classifier.classify('oven with steam').category, 'combiOvens');
  });
});

describe('The three genuinely mixed enquiries', () => {
  const mixed = enquiries.filter((e, i) => classified[i].outcome === 'mixed');

  test('exactly three enquiries name both financeable and non financeable kit', () => {
    assert.equal(mixed.length, 3);
  });

  test('the eleven item enquiry is mixed, not written off on one range hood', () => {
    const r = classifier.classify('Im after Range Hood, 6 Burner Gas Oven, Convention Oven, Grease Trap, Dishwasher, Hot Food Bain Marie, Cool Food Display, Milkshake Machine, ice Machine, Deep Fryer, Fridges,');
    assert.equal(r.outcome, 'mixed');
    assert.equal(r.inCatalogue, true);
    // The financeable interest is recorded rather than thrown away.
    for (const c of ['convectionOvens', 'dishwashers', 'fryers', 'refrigeration', 'holdingAndDisplay']) {
      assert.ok(r.inCategories.includes(c), `expected ${c} in inCategories, got ${r.inCategories.join(', ')}`);
    }
    assert.ok(r.outCategories.includes('ventilation'));
  });

  test('mixed leads do not inflate the wasted spend estimate', () => {
    // 10 pure out, not 13. Charging the three mixed leads to waste would
    // overstate it by 29% and argue for narrowing ad copy that is working.
    assert.equal(summary.outOfCatalogue, 10);
    assert.equal(summary.mixed, 3);
    assert.equal(summary.worthHaving, 41);
  });
});

describe('What people actually asked for', () => {
  test('ovens are the single largest category of demand', () => {
    const ovenish = summary.categories
      .filter((c) => ['ovensUnspecified', 'combiOvens', 'convectionOvens', 'pizzaAndConveyorOvens'].includes(c.category))
      .reduce((n, c) => n + c.count, 0);
    assert.ok(ovenish >= 9, `expected at least 9 oven enquiries, got ${ovenish}`);
  });

  test('ice is the largest single out of catalogue category', () => {
    // Four of the 58 mention ice. Section 8.4 says ice makers are not
    // financed, while the business overview lists "refrigeration & ice".
    // This is the conflict flagged in config/equipment-catalogue.json, and
    // it is worth roughly 4 leads a month either way.
    const ice = summary.categories.find((c) => c.category === 'ice');
    assert.equal(ice.count, 2);
    const iceMentions = enquiries.filter((e) => /ice/i.test(e)).length;
    assert.equal(iceMentions, 4);
  });

  test('seven leads answered but not specifically enough to classify', () => {
    assert.equal(summary.vague, 7);
  });
});
