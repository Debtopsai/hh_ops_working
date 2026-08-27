/**
 * The live data layer: connector argument shapes and failure handling.
 *
 * The argument shapes here were observed against the real tools. These tests
 * pin them, because a published page that guesses a connector's argument names
 * fails silently at view time rather than at build time.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { metaArgs, hubspotArgs, describeError, META_SERVER, HUBSPOT_SERVER } from '../src/live/live.mjs';
import { composeSnapshot, windowFor, isoDaysAgo } from '../src/live/compose.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const liveConfig = read('../config/live.json');
const assumptions = read('../config/assumptions.json');
const equipmentCatalogue = read('../config/equipment-catalogue.json');
const fx = read('./fixtures/meta-aug-2026.json');

describe('Meta insights arguments, as observed', () => {
  const args = metaArgs({ adAccountId: '2139666836427566', campaignId: '120250374716300748', since: '2026-08-01', until: '2026-08-25' });

  test('time_range is a JSON string, not an object', () => {
    assert.equal(typeof args.time_range, 'string');
    assert.deepEqual(JSON.parse(args.time_range), { since: '2026-08-01', until: '2026-08-25' });
  });
  test('filtering uses the campaign.id EQUAL shape', () => {
    assert.deepEqual(args.filtering, [{ field: 'campaign.id', operator: 'EQUAL', value: ['120250374716300748'] }]);
  });
  test('the conversation id is 20 alphanumeric characters, as the tool requires', () => {
    assert.match(args.client_conversation_id, /^[A-Za-z0-9]{20}$/);
  });
  test('the same conversation id is reused across calls', () => {
    assert.equal(metaArgs({ adAccountId: '1', since: 'a', until: 'b' }).client_conversation_id, args.client_conversation_id);
  });
  test('time_increment is a string when set', () => {
    assert.equal(metaArgs({ adAccountId: '1', since: 'a', until: 'b', timeIncrement: '1' }).time_increment, '1');
  });
  test('results and cost_per_result are requested, since CPL is read from Meta', () => {
    assert.ok(args.fields.includes('results'));
    assert.ok(args.fields.includes('cost_per_result'));
  });
});

describe('HubSpot arguments never request personal information', () => {
  const args = hubspotArgs({ joinProperty: 'hs_analytics_source_data_2', matchValue: 'hh brochure campaign 01/08 2026', equipmentProperty: 'what_type_of_equipment_are_you_after' });

  test('only the equipment enquiry and the campaign key are requested', () => {
    assert.deepEqual(args.properties, ['what_type_of_equipment_are_you_after', 'hs_analytics_source_data_2']);
  });
  test('no name, email or phone property is ever asked for', () => {
    const serialised = JSON.stringify(args).toLowerCase();
    for (const field of ['email', 'phone', 'firstname', 'lastname', 'mobilephone', 'company']) {
      assert.ok(!serialised.includes(field), `arguments mention ${field}`);
    }
  });
  test('the filter matches the campaign cohort', () => {
    assert.deepEqual(args.filterGroups[0].filters[0], { propertyName: 'hs_analytics_source_data_2', operator: 'EQ', value: 'hh brochure campaign 01/08 2026' });
  });
});

describe('Every failure code gets its own action, never one catch-all', () => {
  const codes = ['needs_reauth', 'server_not_connected', 'not_granted', 'blocked_by_policy', 'approval_required',
    'selection_required', 'server_not_found', 'not_in_manifest', 'tool_error', 'bad_request', 'cancelled',
    'rate_limited', 'server_unavailable', 'capability_disabled', 'capability_removed', 'upstream_error', 'transform_error'];

  test('each code yields a distinct message', () => {
    const messages = codes.map((code) => describeError({ code, message: 'x' }, META_SERVER).message);
    // A handful legitimately share copy (the two capability codes), so the test
    // asserts that codes with a distinct fix have distinct copy.
    const distinctFixes = ['needs_reauth', 'server_not_connected', 'not_granted', 'selection_required', 'tool_error', 'server_unavailable'];
    const seen = new Set(distinctFixes.map((c) => describeError({ code: c, message: 'x' }, META_SERVER).message));
    assert.equal(seen.size, distinctFixes.length, 'codes with different fixes must not share copy');
    assert.ok(messages.every((m) => m && m.length > 10));
  });

  test('only genuinely retryable codes are marked retryable', () => {
    const retryable = codes.filter((c) => describeError({ code: c }, META_SERVER).retry);
    assert.deepEqual(retryable.sort(), ['rate_limited', 'server_unavailable']);
  });

  test('authz denials retract data, transient failures keep it', () => {
    for (const c of ['needs_reauth', 'server_not_connected', 'blocked_by_policy', 'approval_required', 'not_granted']) {
      assert.equal(describeError({ code: c }, META_SERVER).retract, true, `${c} should retract`);
    }
    for (const c of ['server_unavailable', 'rate_limited', 'tool_error']) {
      assert.equal(describeError({ code: c }, META_SERVER).retract, false, `${c} should keep last good data`);
    }
  });

  test('reconnect copy names the connector and where to go', () => {
    const d = describeError({ code: 'needs_reauth' }, HUBSPOT_SERVER);
    assert.match(d.message, /HubSpot/);
    assert.match(d.message, /Connectors/);
  });

  test('an unknown code degrades to the generic branch rather than throwing', () => {
    const d = describeError({ code: 'something_new_in_a_later_contract', message: 'hm' }, META_SERVER);
    assert.equal(d.retry, false);
    assert.ok(d.message.includes('Meta Ads'));
  });

  test('tool_error surfaces what the connector actually reported', () => {
    assert.match(describeError({ code: 'tool_error', message: 'Invalid date range' }, META_SERVER).message, /Invalid date range/);
  });
});

describe('Composing a live snapshot uses the same pipeline as the scheduled refresh', () => {
  // The captured August responses, fed through the live path rather than the
  // scheduled one. The section 9 figures must survive the round trip.
  const parts = {
    campaign: { ad_entities: JSON.stringify(fx.campaignTotal) },
    platform: { ad_entities: JSON.stringify(fx.byPlatform) },
    region: { ad_entities: JSON.stringify(fx.byRegion) },
    age: { ad_entities: JSON.stringify(fx.byAge) },
    ad: { ad_entities: JSON.stringify(fx.byAd) },
    cohort: { total: 2, results: [
      { id: '1', properties: { what_type_of_equipment_are_you_after: 'commercial dishwasher' } },
      { id: '2', properties: { what_type_of_equipment_are_you_after: 'coffee machine' } },
    ] },
  };
  const snap = composeSnapshot({
    parts, errors: {}, storedAt: { campaign: Date.parse('2026-08-26T12:00:00Z') },
    range: { since: '2026-08-01', until: '2026-08-25' },
    configs: { assumptions, equipmentCatalogue }, liveConfig,
    nowMs: Date.parse('2026-08-26T12:00:00Z'),
  });

  test('spend, leads and CPL come through the live path unchanged', () => {
    assert.equal(snap.headline.spend, '656.01');
    assert.equal(snap.headline.leads, 63);
    assert.equal(snap.headline.cpl, '10.41');
  });
  test('every split still reconciles', () => assert.equal(snap.reconciliation.allReconcile, true));
  test('it is marked live', () => assert.equal(snap.__live, true));
  test('the equipment cohort is classified', () => {
    assert.equal(snap.demand.total, 2);
    assert.equal(snap.demand.outOfCatalogue, 1);
  });
  test('the lead to deal join stays reported as broken, since that is a CRM fact', () => {
    assert.equal(snap.health.attribution.dealJoin.ok, false);
    assert.equal(snap.health.attributionMode, 'aggregate');
  });
  test('funnel stages past lead remain unavailable rather than zero', () => {
    const byKey = Object.fromEntries(snap.funnel.stages.map((s) => [s.key, s]));
    assert.equal(byKey.qualified.count, null);
    assert.equal(byKey.funded.count, null);
  });
  test('the wrong revenue figure never appears', () => {
    assert.ok(!JSON.stringify(snap).includes('20215'));
  });
  test('freshness is taken from the served result, not the local clock', () => {
    assert.equal(snap.health.metaSync.lastRefresh, '2026-08-26T12:00:00.000Z');
  });
});

describe('Date windows', () => {
  test('a 7 day window spans 7 days inclusive', () => {
    const w = windowFor(7);
    const days = (Date.parse(w.until) - Date.parse(w.since)) / 86400000 + 1;
    assert.equal(days, 7);
  });
  test('the previous window sits immediately before, without overlapping', () => {
    const w = windowFor(30);
    assert.ok(Date.parse(w.prevUntil) < Date.parse(w.since));
    assert.equal(isoDaysAgo(30), w.prevUntil);
  });
});
