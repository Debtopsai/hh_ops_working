#!/usr/bin/env node
/**
 * HubSpot schema discovery, build step 1 of the acquisition dashboard brief.
 *
 * Read only. Calls no write endpoint. Reports property names, types and fill
 * rates. Never prints contact names, emails or phone numbers: the whole point
 * of the exercise is to learn the shape of the data, not to extract it.
 *
 * Usage:
 *   HUBSPOT_ACCESS_TOKEN=... node scripts/discover-hubspot.mjs
 *   HUBSPOT_ACCESS_TOKEN=... node scripts/discover-hubspot.mjs --json
 */

const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const BASE = 'https://api.hubapi.com';
const SAMPLE_SIZE = 200;

// Candidate join keys, in the order of preference set out in docs/hubspot-schema.md.
const JOIN_KEY_CANDIDATES = [
  { name: 'meta lead id (named property)', match: /(meta|facebook|fb)[_ ]?(lead)?[_ ]?id/i, strength: 'strong' },
  { name: 'hs_analytics_source', match: /^hs_analytics_source(_data_[12])?$/i, strength: 'channel only' },
  { name: 'form submission association', match: /^hs_form_submissions?$/i, strength: 'good' },
  { name: 'hs_object_source', match: /^hs_object_source(_detail_[123]|_id|_label)?$/i, strength: 'origin hint' },
  { name: 'email', match: /^email$/i, strength: 'fallback, fragile' },
  { name: 'phone', match: /^(phone|mobilephone|hs_whatsapp_phone_number)$/i, strength: 'fallback, fragile' },
];

// Concepts the brief asks us to locate. Patterns are search hints only: the
// script reports what it finds and never asserts a mapping.
const WANTED_DEAL_CONCEPTS = [
  ['contract value', /(contract|total)[_ ]?(value|amount|price)|^amount$/i],
  ['weekly payment', /week/i],
  ['term length', /term|duration|weeks|months/i],
  ['product type', /(product|finance|agreement)[_ ]?type|rent|lease/i],
  ['deposit structure', /deposit|advance|bond|security/i],
  ['deposit cleared date', /deposit.*(clear|paid|receiv)|(clear|paid|receiv).*deposit/i],
  ['delivery date', /deliver/i],
  ['delivery and install charge', /(deliver|install|freight)/i],
  ['closed won date', /closed?[_ ]?won|closedate/i],
];

const WANTED_CONTACT_CONCEPTS = [
  ['equipment enquiry text', /equipment|enquiry|inquiry|what_type/i],
  ['company name', /company/i],
  ['region or address', /region|address|city|suburb|postcode|state/i],
];

function die(msg) {
  console.error(`\nBLOCKED: ${msg}\n`);
  process.exit(1);
}

async function hs(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  });
  if (res.status === 401 || res.status === 403) {
    die(`HubSpot rejected the token on ${path} with ${res.status}. Check the private app scopes listed in docs/hubspot-schema.md.`);
  }
  if (!res.ok) throw new Error(`${path} returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

/** Fill rate over a sample, so a property that exists but is rarely populated is not mistaken for a usable key. */
function fillRates(records, propertyNames) {
  const counts = Object.fromEntries(propertyNames.map((p) => [p, 0]));
  for (const rec of records) {
    for (const p of propertyNames) {
      const v = rec.properties?.[p];
      if (v !== null && v !== undefined && v !== '') counts[p] += 1;
    }
  }
  const total = records.length || 1;
  return Object.fromEntries(
    Object.entries(counts).map(([p, n]) => [p, { filled: n, of: records.length, pct: Math.round((n / total) * 1000) / 10 }]),
  );
}

function matchConcepts(properties, concepts) {
  return concepts.map(([concept, pattern]) => ({
    concept,
    candidates: properties
      .filter((p) => pattern.test(p.name) || pattern.test(p.label ?? ''))
      .map((p) => ({ name: p.name, label: p.label, type: p.type, fieldType: p.fieldType }))
      .slice(0, 8),
  }));
}

async function main() {
  if (!TOKEN) {
    die(
      'HUBSPOT_ACCESS_TOKEN is not set. Discovery cannot run.\n' +
        '  This is the documented blocker in docs/hubspot-schema.md section 1.\n' +
        '  Nothing downstream of the funnel can be trusted until this runs.',
    );
  }

  const report = { generatedAt: new Date().toISOString(), pipelines: [], deal: {}, contact: {}, joinKeys: [] };

  // 1. Pipelines and stages.
  const pipelines = await hs('/crm/v3/pipelines/deals');
  report.pipelines = (pipelines.results ?? []).map((p) => ({
    id: p.id,
    label: p.label,
    stages: (p.stages ?? []).map((s) => ({ id: s.id, label: s.label, closedWon: s.metadata?.isClosed === 'true' && s.metadata?.probability === '1.0', displayOrder: s.displayOrder })),
  }));

  // 2 and 4. Property schemas.
  const [dealProps, contactProps] = await Promise.all([
    hs('/crm/v3/properties/deals'),
    hs('/crm/v3/properties/contacts'),
  ]);
  const dealPropList = dealProps.results ?? [];
  const contactPropList = contactProps.results ?? [];

  report.deal.propertyCount = dealPropList.length;
  report.contact.propertyCount = contactPropList.length;
  report.deal.concepts = matchConcepts(dealPropList, WANTED_DEAL_CONCEPTS);
  report.contact.concepts = matchConcepts(contactPropList, WANTED_CONTACT_CONCEPTS);

  // 3. Join key candidates, with fill rates measured over a real sample.
  const candidateProps = new Set();
  for (const cand of JOIN_KEY_CANDIDATES) {
    for (const p of [...dealPropList, ...contactPropList]) {
      if (cand.match.test(p.name)) candidateProps.add(p.name);
    }
  }
  const candidateList = [...candidateProps];

  let sample = [];
  if (candidateList.length) {
    const dealCandidates = candidateList.filter((n) => dealPropList.some((p) => p.name === n));
    if (dealCandidates.length) {
      const deals = await hs('/crm/v3/objects/deals', { limit: Math.min(SAMPLE_SIZE, 100), properties: dealCandidates.join(',') });
      sample = deals.results ?? [];
      report.deal.sampleSize = sample.length;
      report.deal.joinKeyFillRates = fillRates(sample, dealCandidates);
    }
  }

  report.joinKeys = JOIN_KEY_CANDIDATES.map((cand) => {
    const found = candidateList.filter((n) => cand.match.test(n));
    return {
      candidate: cand.name,
      strength: cand.strength,
      propertiesFound: found,
      present: found.length > 0,
      fillRates: found.map((n) => report.deal.joinKeyFillRates?.[n]).filter(Boolean),
    };
  });

  // The verdict the brief asks us to escalate.
  const strong = report.joinKeys.find((k) => k.strength === 'strong' && k.present);
  const strongFill = strong?.fillRates?.[0]?.pct ?? 0;
  const usableForm = report.joinKeys.find((k) => k.strength === 'good' && k.present);
  report.verdict = strong && strongFill >= 90
    ? { reliable: true, mode: 'traced', via: strong.propertiesFound.join(', '), fillPct: strongFill }
    : strong
      ? { reliable: false, mode: 'aggregate', reason: `a Meta lead id property exists (${strong.propertiesFound.join(', ')}) but is populated on only ${strongFill}% of sampled deals` }
      : usableForm
        ? { reliable: 'maybe', mode: 'aggregate', reason: 'no direct Meta lead id property. A form submission association exists and should be inspected by hand before being trusted.' }
        : { reliable: false, mode: 'aggregate', reason: 'no Meta lead id property and no form submission association found. Attribution beyond aggregate counts is not possible.' };

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('\nHubSpot schema discovery');
  console.log('========================\n');
  console.log(`Pipelines: ${report.pipelines.length}`);
  for (const p of report.pipelines) {
    console.log(`  ${p.label}  (id ${p.id})`);
    for (const s of p.stages) console.log(`    ${String(s.displayOrder).padStart(2)}  ${s.id}  ${s.label}${s.closedWon ? '   <- closed won' : ''}`);
  }
  console.log(`\nDeal properties: ${report.deal.propertyCount}. Contact properties: ${report.contact.propertyCount}.\n`);
  console.log('Deal concept candidates');
  for (const c of report.deal.concepts) {
    console.log(`  ${c.concept}:`);
    if (!c.candidates.length) console.log('    none found');
    for (const cand of c.candidates) console.log(`    ${cand.name}  (${cand.type}/${cand.fieldType})  "${cand.label}"`);
  }
  console.log('\nContact concept candidates');
  for (const c of report.contact.concepts) {
    console.log(`  ${c.concept}:`);
    if (!c.candidates.length) console.log('    none found');
    for (const cand of c.candidates) console.log(`    ${cand.name}  (${cand.type}/${cand.fieldType})  "${cand.label}"`);
  }
  console.log('\nJoin key candidates');
  for (const k of report.joinKeys) {
    const fill = k.fillRates?.length ? k.fillRates.map((f) => `${f.pct}% of ${f.of}`).join(', ') : 'not sampled';
    console.log(`  ${k.present ? 'FOUND  ' : 'absent '} ${k.candidate}  [${k.strength}]  ${k.propertiesFound.join(', ') || ''}  ${k.present ? `fill ${fill}` : ''}`);
  }
  console.log('\n----------------------------------------------------------------');
  console.log('VERDICT');
  console.log(`  Attribution mode: ${report.verdict.mode}`);
  console.log(`  Reliable join key: ${report.verdict.reliable}`);
  if (report.verdict.via) console.log(`  Via: ${report.verdict.via} (${report.verdict.fillPct}% fill)`);
  if (report.verdict.reason) console.log(`  Reason: ${report.verdict.reason}`);
  if (report.verdict.mode === 'aggregate') {
    console.log('\n  ACTION: flag to Raj. Per section 5 of the brief this is the single');
    console.log('  biggest finding. Sales cycle median, lead to close rate and quote to');
    console.log('  close rate cannot be computed at lead level. Set attributionMode to');
    console.log('  "aggregate" in config/hubspot-mapping.json so the dashboard labels them.');
  }
  console.log('----------------------------------------------------------------\n');
  console.log('Next: record the property names in docs/hubspot-schema.md sections 4 to 7,');
  console.log('then fill config/hubspot-mapping.json. No transformation code needs changing.\n');
}

main().catch((err) => {
  console.error(`\nDiscovery failed: ${err.message}\n`);
  process.exit(1);
});
