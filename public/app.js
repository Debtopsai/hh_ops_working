/**
 * HireHospo acquisition dashboard, front end.
 *
 * Reads the cached document from /api/dashboard. Never calls a third party API
 * and never sees a token.
 *
 * House rules applied throughout: every price shows "+ GST", every unavailable
 * value shows [TBC] rather than a plausible invention, dates are NZ format, and
 * NZ English is used in all copy.
 */

const TBC = '[TBC]';

/* ---------------------------------------------------------------------------
 * Money. Integer cents, never floats.
 * The payload carries money as fixed decimal STRINGS, so parsing to cents is
 * exact. All slider arithmetic is done in integers and only formatted at the
 * very end, so dragging the margin slider cannot drift a figure.
 * ------------------------------------------------------------------------- */
const toCents = (s) => (s === null || s === undefined ? null : Math.round(Number(s) * 100));
const fromCents = (c) => (c === null || c === undefined ? null : (c / 100).toFixed(2));

/** basis points, so 25% is 2500 and no fractional multiplier is needed. */
const applyBp = (cents, bp) => (cents === null ? null : Math.round((cents * bp) / 10000));

function money(value, { gst = true } = {}) {
  if (value === null || value === undefined || value === '') return `<span class="tbc">${TBC}</span>`;
  const n = Number(value);
  if (!Number.isFinite(n)) return `<span class="tbc">${TBC}</span>`;
  const formatted = n.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `NZ$${formatted}${gst ? '<span class="gst">+ GST</span>' : ''}`;
}

function num(value, dp = 0) {
  if (value === null || value === undefined || value === '') return `<span class="tbc">${TBC}</span>`;
  const n = Number(value);
  if (!Number.isFinite(n)) return `<span class="tbc">${TBC}</span>`;
  return n.toLocaleString('en-NZ', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

function pct(value, dp = 1) {
  if (value === null || value === undefined || value === '') return `<span class="tbc">${TBC}</span>`;
  const n = Number(value);
  if (!Number.isFinite(n)) return `<span class="tbc">${TBC}</span>`;
  return `${n.toFixed(dp)}%`;
}

const NZ_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** NZ date format: 26 August 2026. */
function nzDate(iso) {
  if (!iso) return TBC;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return TBC;
  return `${d.getUTCDate()} ${NZ_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function nzDateTime(iso) {
  if (!iso) return TBC;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return TBC;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${nzDate(iso)}, ${hh}:${mm}`;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const el = (id) => document.getElementById(id);

/* ------------------------------------------------------------------------- */

let SNAPSHOT = null;

async function load() {
  el('loading').hidden = false;
  el('dashboard').hidden = true;
  try {
    const res = await fetch('/api/dashboard', { headers: { accept: 'application/json' } });
    if (!res.ok && res.status === 404) return fallbackToSample('the refresh endpoint is not deployed yet');
    let json;
    try {
      json = await res.json();
    } catch {
      // A non JSON response means the function is missing or erroring. Say that
      // plainly rather than surfacing a parser message the reader cannot act on.
      return fallbackToSample('the refresh endpoint did not return dashboard data');
    }
    if (json.available === false) return fallbackToSample(json.reason ?? 'the cache has not been written');
    SNAPSHOT = json;
    render();
  } catch {
    fallbackToSample('the dashboard data endpoint could not be reached');
  }
}

/**
 * When the live cache is unavailable, fall back to the validated sample so the
 * dashboard can be reviewed before credentials are in place. The sample is
 * REAL data (campaign 120250374716300748, 1 to 25 August 2026, verified against
 * the section 9 baselines), not invented figures, and it is labelled as a
 * sample everywhere it appears.
 */
async function fallbackToSample(reason) {
  try {
    const res = await fetch('/sample-snapshot.json');
    if (!res.ok) throw new Error('no sample available');
    SNAPSHOT = await res.json();
    SNAPSHOT.__isSample = true;
    SNAPSHOT.__sampleReason = reason;
    render();
  } catch {
    el('loading').innerHTML = `<p>The dashboard data is unavailable.</p><p class="sub">${esc(reason ?? 'Unknown error')}</p>`;
  }
}

function render() {
  const s = SNAPSHOT;
  el('loading').hidden = true;
  el('dashboard').hidden = false;

  const range = s.dateRange ? `${nzDate(s.dateRange.since)} to ${nzDate(s.dateRange.until)}` : TBC;
  el('subtitle').innerHTML = s.__isSample
    ? `Validated sample data, ${range}. Live cache unavailable.`
    : `${range}. Refreshed ${nzDateTime(s.generatedAt)}.`;

  renderBanners(s);
  renderHeadline(s);
  renderFunnel(s);
  renderEconomics(s);
  renderFatigue(s);
  renderDemand(s);
  renderSegments(s);
  renderHealth(s);

  el('footer-text').innerHTML =
    `All figures ex GST, NZD. Rent is 52 weeks, Lease to Own is 156 weeks. ` +
    `Dashboard generated ${nzDateTime(s.generatedAt)}. ` +
    (s.__isSample ? 'Showing validated sample data from 1 to 25 August 2026.' : '');
}

function renderBanners(s) {
  const alerts = s.health?.alerts ?? [];
  const extra = [];

  if (s.__isSample) {
    extra.push({
      level: 'warning',
      message: `Showing validated sample data from 1 to 25 August 2026, not a live refresh. Reason: ${s.__sampleReason ?? 'the cache has not been written'}. These figures are real and reconcile to the campaign, but they are not current.`,
    });
  }
  if (s.compliance?.mismatch) {
    extra.push({
      level: 'warning',
      message: `Daily rate claim. The ad currently spending claims ${esc(s.compliance.liveClaim)}, the approved marketing claim is ${esc(s.compliance.approvedClaim)}. ${esc(s.compliance.sourceCaveat)}`,
    });
  }
  if (s.reconciliation && s.reconciliation.allReconcile === false) {
    extra.push({
      level: 'critical',
      message: 'A breakdown does not sum to campaign spend. The date range or filter is wrong, and every split below is suspect. See the data health panel.',
    });
  }

  el('banners').innerHTML = [...extra, ...alerts]
    .map((a) => `<div class="banner ${a.level === 'critical' ? 'critical' : 'warning'}"><span class="dot"></span><div>${esc(a.message)}</div></div>`)
    .join('');
}

function tile({ label, value, foot, delta, status }) {
  const cls = status === 'red' ? ' red' : status === 'amber' ? ' amber' : '';
  const isTbc = String(value).includes(TBC);
  return `<div class="tile${cls}">
    <div class="label">${esc(label)}</div>
    <div class="value${isTbc ? ' tbc' : ''}">${value}</div>
    ${delta ? `<div class="delta ${delta.dir}">${esc(delta.text)}</div>` : ''}
    ${foot ? `<div class="foot">${esc(foot)}</div>` : ''}
  </div>`;
}

function renderHeadline(s) {
  const h = s.headline;
  const c = h.comparison;
  const deltaOf = (v, invert = false) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    const good = invert ? n < 0 : n > 0;
    return { dir: n === 0 ? '' : good ? 'up' : 'down', text: `${n > 0 ? '+' : ''}${n.toFixed(1)}% on previous period` };
  };

  el('headline-tiles').innerHTML = [
    tile({ label: 'Spend', value: money(h.spend), delta: c ? deltaOf(c.spendChangePct) : null }),
    tile({ label: 'Leads', value: num(h.leads), foot: h.leadsDeduplicated !== h.leads ? `${h.leadsDeduplicated} after deduplication` : null, delta: c ? deltaOf(c.leadsChangePct) : null }),
    tile({ label: 'Cost per lead', value: money(h.cpl) }),
    tile({
      label: 'Contracts funded',
      value: h.contractsFunded === null ? `<span class="tbc">${TBC}</span>` : num(h.contractsFunded),
      foot: h.contractsFunded === null ? 'Signed, funding unconfirmed' : null,
    }),
    tile({ label: 'CAC', value: money(h.cac), foot: h.cacBasis === 'funded' ? 'Per funded contract' : 'Per signed contract, funding unconfirmed' }),
    tile({ label: 'LTV : CAC', value: h.ltvCac ? `${Number(h.ltvCac).toFixed(2)} : 1` : `<span class="tbc">${TBC}</span>`, foot: 'At the margin set in panel 3' }),
    tile({ label: 'Frequency', value: h.frequency ? Number(h.frequency).toFixed(2) : `<span class="tbc">${TBC}</span>`, status: h.frequencyStatus, foot: h.frequencyStatus === 'amber' ? 'Above the 3.0 amber threshold' : h.frequencyStatus === 'red' ? 'Above the 4.0 red threshold' : null }),
    tile({ label: 'CTR', value: pct(h.ctr, 2) }),
  ].join('');

  el('headline-note').textContent = `All figures ex GST, NZD. ${h.cacLabel ?? ''}`;
}

function renderFunnel(s) {
  const f = s.funnel;
  el('funnel-note').textContent = f.attributionNote ?? '';

  const maxCount = Math.max(...f.stages.map((st) => st.count ?? 0), 1);

  const head = `<div class="funnel-row funnel-head">
    <div>Stage</div><div></div>
    <div class="num">Count</div>
    <div class="num col-rate">Of leads</div>
    <div class="num">Cost each</div>
  </div>`;

  const rows = f.stages.map((st) => {
    const available = st.count !== null && st.count !== undefined;
    const width = available ? Math.max((st.count / maxCount) * 100, st.count > 0 ? 2 : 0) : 100;
    return `<div class="funnel-row">
      <div class="name">${esc(st.label)}</div>
      <div class="funnel-bar"><div class="fill${available ? '' : ' unavailable'}" style="width:${width}%"></div></div>
      <div class="num${available ? '' : ' tbc'}">${available ? num(st.count) : TBC}</div>
      <div class="num col-rate${st.rateFromLeads === null ? ' tbc' : ''}">${st.rateFromLeads === null ? TBC : pct(st.rateFromLeads)}</div>
      <div class="num${st.costPerUnit === null ? ' tbc' : ''}">${st.costPerUnit === null ? TBC : money(st.costPerUnit, { gst: false })}</div>
    </div>`;
  }).join('');

  el('funnel').innerHTML = head + rows;

  const dead = f.dead ?? {};
  el('dead-branch').innerHTML = `<h3>Dead leads</h3>` + (
    dead.total === null || dead.total === undefined
      ? `<p class="panel-note">${TBC}. Dead lead reasons come from HubSpot, which is not connected.</p>`
      : `<table><thead><tr><th>Reason</th><th class="num">Count</th></tr></thead><tbody>` +
        (dead.byReason ?? []).map((d) => `<tr><td>${esc(d.reason)}</td><td class="num">${num(d.count)}</td></tr>`).join('') +
        `<tr><td><strong>Total</strong></td><td class="num"><strong>${num(dead.total)}</strong></td></tr></tbody></table>`
  ) + `<p class="panel-note" style="margin-top:10px">${esc(f.fundingNote ?? '')}</p>`;
}

function renderEconomics(s) {
  const ue = s.unitEconomics;

  el('margin-unconfirmed').textContent = ue.marginConfirmed ? '' : 'Not confirmed. This is a sensitivity input, not a finding.';
  el('failure-note').textContent = `Portfolio ${(Number(ue.failureRateOptions?.portfolio ?? 0.105) * 100).toFixed(1)}%, or ${(Number(ue.failureRateOptions?.excludingChronicAccounts ?? 0.037) * 100).toFixed(1)}% excluding chronic accounts.`;

  const marginInput = el('margin');
  const failureInput = el('failure');
  marginInput.value = String(Math.round(Number(ue.grossMargin ?? 0.25) * 100));
  failureInput.value = String(Math.round(Number(ue.failureRate ?? 0.105) * 1000));

  const recompute = () => {
    const marginPct = Number(marginInput.value);
    const marginBp = marginPct * 100;                      // 25% -> 2500 bp
    const failureBp = Number(failureInput.value) * 10;     // 105 (=10.5%) -> 1050 bp
    el('margin-value').textContent = `${marginPct}%`;
    el('failure-value').textContent = `${(Number(failureInput.value) / 10).toFixed(1)}%`;

    const revenueCents = toCents(ue.contractRevenue);
    const cacCents = toCents(s.headline.cac);
    const weeklyCents = ue.revenueWorking ? toCents(ue.revenueWorking.weeklyPayment) : null;
    const weeklyTotalCents = ue.revenueWorking ? toCents(ue.revenueWorking.weeklyPaymentsTotal) : null;
    const installCents = ue.revenueWorking ? toCents(ue.revenueWorking.deliveryAndInstall) : null;

    const ltvCents = applyBp(revenueCents, marginBp);
    const ltvCac = ltvCents !== null && cacCents ? ltvCents / cacCents : null;

    // Payback weeks = CAC / (weekly payment x gross margin)
    const weeklyContributionCents = applyBp(weeklyCents, marginBp);
    const payback = weeklyContributionCents ? cacCents / weeklyContributionCents : null;

    // Risk adjusted: the weekly stream is discounted, delivery and install is not.
    const survivingCents = weeklyTotalCents === null ? null : applyBp(weeklyTotalCents, 10000 - failureBp);
    const riskRevenueCents = survivingCents === null ? null : survivingCents + (installCents ?? 0);
    const riskLtvCents = applyBp(riskRevenueCents, marginBp);
    const riskLtvCac = riskLtvCents !== null && cacCents ? riskLtvCents / cacCents : null;

    const ratioStatus = (r) => (r === null ? '' : r >= (ue.ltvCacReference ?? 3) ? 'ok' : 'red');

    el('econ-tiles').innerHTML = [
      tile({ label: 'Contract revenue', value: money(ue.contractRevenue) }),
      tile({ label: 'LTV', value: money(fromCents(ltvCents)), foot: `At ${marginPct}% gross margin` }),
      tile({ label: 'CAC, media only', value: money(s.headline.cac) }),
      tile({
        label: 'LTV : CAC',
        value: ltvCac === null ? `<span class="tbc">${TBC}</span>` : `${ltvCac.toFixed(2)} : 1`,
        foot: `Reference line ${ue.ltvCacReference ?? 3}.0 : 1`,
        status: ratioStatus(ltvCac) === 'ok' ? null : 'red',
      }),
      tile({ label: 'Payback', value: payback === null ? `<span class="tbc">${TBC}</span>` : `${payback.toFixed(1)} wks`, foot: 'Weeks of contribution' }),
      tile({ label: 'Risk adjusted revenue', value: money(fromCents(riskRevenueCents)), foot: `Weekly stream discounted ${(failureBp / 100).toFixed(1)}%` }),
      tile({
        label: 'Risk adjusted LTV : CAC',
        value: riskLtvCac === null ? `<span class="tbc">${TBC}</span>` : `${riskLtvCac.toFixed(2)} : 1`,
        status: ratioStatus(riskLtvCac) === 'ok' ? null : 'red',
      }),
    ].join('');

    // The revenue rule, shown as working so the exclusions are visible.
    const w = ue.revenueWorking;
    el('revenue-working').innerHTML = w
      ? `<h3>Contract revenue, how it is built</h3>
         <dl>
           <dt>Weekly payments, ${num(w.termWeeks)} x ${money(w.weeklyPayment, { gst: false })}</dt><dd>${money(w.weeklyPaymentsTotal, { gst: false })}</dd>
           <dt>Delivery and install</dt><dd>${money(w.deliveryAndInstall, { gst: false })}</dd>
           <dt class="total">Contract revenue</dt><dd class="total">${money(w.contractRevenue, { gst: false })}</dd>
         </dl>
         ${w.cashUpfront ? `
         <h3 style="margin-top:16px">Cash upfront, ${esc(w.cashUpfront.structure)}, NOT revenue</h3>
         <dl class="excluded">
           <dt>Rent in advance, prepayment of the first weeks</dt><dd>${money(w.cashUpfront.rentInAdvance, { gst: false })}</dd>
           <dt>Security bond, refundable, balance sheet only</dt><dd>${money(w.cashUpfront.securityBond, { gst: false })}</dd>
           <dt class="total">Cash collected upfront</dt><dd class="total">${money(w.cashUpfront.total, { gst: false })}</dd>
         </dl>
         <p class="panel-note" style="margin:10px 0 0">${esc(w.cashUpfront.note)}</p>` : ''}`
      : `<h3>Contract revenue</h3><p class="panel-note">${TBC}. No contract data is available. Contract values come from HubSpot, which is not connected.</p>`;

    el('sensitivity-working').innerHTML =
      `<h3>Margin sensitivity</h3>
       <p class="panel-note" style="margin:0 0 10px">${esc(ue.marginNote ?? '')}</p>
       <table><thead><tr><th>Margin</th><th class="num">LTV</th><th class="num">LTV : CAC</th><th class="num">Payback</th></tr></thead><tbody>` +
      (ue.sensitivity ?? []).map((row) => {
        const isCurrent = Math.round(row.grossMargin * 100) === marginPct;
        return `<tr${isCurrent ? ' style="background:rgba(78,163,255,0.07)"' : ''}>
          <td>${(row.grossMargin * 100).toFixed(0)}%</td>
          <td class="num">${money(row.ltv, { gst: false })}</td>
          <td class="num">${row.ltvCac ? `${Number(row.ltvCac).toFixed(2)} : 1` : TBC}</td>
          <td class="num">${row.paybackWeeks ? `${row.paybackWeeks} wks` : TBC}</td>
        </tr>`;
      }).join('') + `</tbody></table>`;
  };

  marginInput.oninput = recompute;
  failureInput.oninput = recompute;
  recompute();

  el('econ-caveat').textContent = ue.caveat ?? '';
}

/** Inline SVG line chart. No external library, which the CSP would block anyway. */
function renderFatigue(s) {
  const f = s.fatigue;
  const series = (f.daily ?? []).filter((d) => d.dateStart);
  el('fatigue-note').textContent = `${f.periodFrequencyNote ?? ''} ${f.note ?? ''}`.trim();

  const svg = el('fatigue-chart');
  if (!series.length) { svg.innerHTML = ''; return; }

  const W = 1000, H = 220, padL = 40, padR = 40, padT = 14, padB = 28;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const ctrs = series.map((d) => Number(d.ctr ?? 0));
  const freqs = series.map((d) => Number(d.frequency ?? 0));
  const spends = series.map((d) => Number(d.spend ?? 0));
  const maxCtr = Math.max(...ctrs, 1) * 1.15;
  const maxFreq = Math.max(...freqs, Number(f.frequencyThresholds?.red ?? 4)) * 1.15;
  const maxSpend = Math.max(...spends, 1);

  const x = (i) => padL + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const yCtr = (v) => padT + innerH - (v / maxCtr) * innerH;
  const yFreq = (v) => padT + innerH - (v / maxFreq) * innerH;

  const bars = series.map((d, i) => {
    const bw = Math.max(innerW / series.length - 2, 2);
    const h = (Number(d.spend) / maxSpend) * innerH * 0.32;
    return `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${(padT + innerH - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="#3a4150" rx="1"/>`;
  }).join('');

  const path = (vals, yFn) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${yFn(v).toFixed(1)}`).join(' ');

  const amber = Number(f.frequencyThresholds?.amber ?? 3);
  const red = Number(f.frequencyThresholds?.red ?? 4);
  const thresholdLine = (v, colour, label) => `
    <line x1="${padL}" y1="${yFreq(v).toFixed(1)}" x2="${W - padR}" y2="${yFreq(v).toFixed(1)}" stroke="${colour}" stroke-width="1" stroke-dasharray="4 4" opacity="0.55"/>
    <text x="${W - padR + 4}" y="${(yFreq(v) + 3).toFixed(1)}" fill="${colour}" font-size="10" font-family="monospace">${label}</text>`;

  const ticks = series.map((d, i) => (i % Math.ceil(series.length / 7) === 0
    ? `<text x="${x(i).toFixed(1)}" y="${H - 8}" fill="#6b7484" font-size="10" text-anchor="middle" font-family="monospace">${d.dateStart.slice(8)}/${d.dateStart.slice(5, 7)}</text>`
    : '')).join('');

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.innerHTML = `
    ${bars}
    ${thresholdLine(amber, '#f5a524', `${amber.toFixed(1)}`)}
    ${thresholdLine(red, '#f2545b', `${red.toFixed(1)}`)}
    <path d="${path(ctrs, yCtr)}" fill="none" stroke="#4ea3ff" stroke-width="2" stroke-linejoin="round"/>
    <path d="${path(freqs, yFreq)}" fill="none" stroke="#f5a524" stroke-width="1.6" stroke-linejoin="round" opacity="0.9"/>
    ${ticks}
    <text x="${padL - 6}" y="${padT + 8}" fill="#4ea3ff" font-size="10" text-anchor="end" font-family="monospace">${maxCtr.toFixed(1)}%</text>
    <text x="${W - padR + 4}" y="${padT + 8}" fill="#f5a524" font-size="10" font-family="monospace">${maxFreq.toFixed(1)}</text>`;

  const creatives = f.creatives ?? [];
  el('creative-table').innerHTML =
    `<thead><tr><th>Creative</th><th class="num">Spend</th><th class="num">Share</th><th class="num">Leads</th><th class="num">CPL</th><th class="num">CTR</th><th class="num">Frequency</th></tr></thead><tbody>` +
    creatives.map((c) => `<tr>
      <td>${esc(c.name ?? TBC)}</td>
      <td class="num">${money(c.spend, { gst: false })}</td>
      <td class="num">${c.sharePct === null ? TBC : `${c.sharePct}%`}</td>
      <td class="num">${num(c.leads)}</td>
      <td class="num">${c.cpl === null ? `<span class="tbc">${TBC}</span>` : money(c.cpl, { gst: false })}</td>
      <td class="num">${c.ctr === null ? `<span class="tbc">${TBC}</span>` : pct(c.ctr, 2)}</td>
      <td class="num">${c.frequency === null ? `<span class="tbc">${TBC}</span>` : `<span class="pill ${c.frequencyStatus ?? ''}">${Number(c.frequency).toFixed(2)}</span>`}</td>
    </tr>`).join('') + `</tbody>`;
}

function renderDemand(s) {
  const d = s.demand;
  if (!d || d.available === false) {
    el('demand').innerHTML = `<p class="panel-note">${TBC}. ${esc(d?.reason ?? 'No lead records available.')}</p>`;
    return;
  }
  el('demand').innerHTML = `
    <div class="tiles" style="margin-bottom:16px">
      ${tile({ label: 'Worth having', value: `${num(d.worthHaving ?? d.inCatalogue)}`, foot: d.inCatalogueShare === null ? null : `${d.inCatalogueShare}% of classified` })}
      ${tile({ label: 'Out of catalogue', value: `${num(d.outOfCatalogue)}`, foot: d.outOfCatalogueShare === null ? null : `${d.outOfCatalogueShare}% of classified`, status: (d.outOfCatalogueShare ?? 0) > 15 ? 'amber' : null })}
      ${tile({ label: 'Estimated wasted spend', value: d.estimatedWastedSpend ? money(d.estimatedWastedSpend.value) : `<span class="tbc">${TBC}</span>`, foot: d.estimatedWastedSpend ? 'Estimate, at average CPL' : null })}
      ${tile({ label: 'Mixed enquiries', value: num(d.mixed ?? 0), foot: 'Named financeable and non financeable kit. Counted as worth having' })}
      ${tile({ label: 'Stated but not specific', value: num(d.vague ?? 0), foot: 'Excluded from the share' })}
      ${tile({ label: 'Unclassified', value: num((d.unstated ?? 0) + (d.unclassified ?? 0)), status: (d.unclassified ?? 0) > 0 ? 'amber' : null, foot: (d.unclassified ?? 0) > 0 ? 'A rising count means the keyword list needs extending' : null })}
    </div>
    <table><thead><tr><th>Category</th><th class="num">Leads</th><th>In catalogue</th></tr></thead><tbody>
      ${(d.categories ?? []).map((c) => `<tr>
        <td>${esc(c.label ?? c.category)}</td>
        <td class="num">${num(c.count)}</td>
        <td>${['unstated', 'unclassified', 'vague'].includes(c.category) ? '<span class="pill">Neither</span>' : (d.outCategories ?? []).includes(c.category) ? '<span class="pill out">Out</span>' : '<span class="pill in">In</span>'}</td>
      </tr>`).join('')}
    </tbody></table>`;
}

function segmentTable(title, rows, keyLabel) {
  if (!rows || !rows.length) return `<div><h3 style="font-size:12.5px;color:var(--ink-dim);margin:0 0 8px">${esc(title)}</h3><p class="panel-note">${TBC}</p></div>`;
  return `<div>
    <h3 style="font-size:12.5px;color:var(--ink-dim);margin:0 0 8px;font-weight:600">${esc(title)}</h3>
    <table><thead><tr><th>${esc(keyLabel)}</th><th class="num">Spend</th><th class="num">Leads</th><th class="num">CPL</th></tr></thead><tbody>
      ${rows.map((r) => `<tr>
        <td>${esc(r.key)}</td>
        <td class="num">${money(r.spend, { gst: false })}</td>
        <td class="num">${num(r.leads)}</td>
        <td class="num">${r.cpl === null ? `<span class="tbc">${TBC}</span>` : money(r.cpl, { gst: false })}</td>
      </tr>`).join('')}
    </tbody></table>
  </div>`;
}

function renderSegments(s) {
  const seg = s.segments ?? {};
  const outOfRegion = seg.outOfRegion?.hasOutOfRegion
    ? `<p class="panel-note" style="margin-top:8px;color:var(--amber)">Out of region spend flagged: ${seg.outOfRegion.rows.map((r) => `${esc(r.region)} ${money(r.spend, { gst: false }).replace(/<[^>]+>/g, '')}`).join(', ')}. ${esc(seg.outOfRegion.note)}</p>`
    : '';

  el('segments').innerHTML =
    segmentTable('Platform', seg.platform, 'Platform') +
    (segmentTable('Region', seg.region, 'Region').replace('</div>', `${outOfRegion}</div>`)) +
    segmentTable('Age band', seg.age, 'Age') +
    segmentTable('Day of week', seg.dayOfWeek, 'Day');
}

function renderHealth(s) {
  const h = s.health ?? {};
  const item = (k, v, state) => `<div class="health-item ${state ?? ''}"><div class="k">${esc(k)}</div><div class="v">${v}</div></div>`;

  const pixels = h.pixels ?? {};
  const stage = h.stageEvents ?? {};
  const sync = h.metaSync ?? {};
  const mapping = h.stageMapping ?? {};
  const leads = h.leads;

  el('health').innerHTML = [
    item('Last Meta refresh', sync.hoursSince === null ? TBC : `${sync.hoursSince}h ago`, sync.alert ? 'alert' : ''),
    item('Last stage event', stage.hoursSince === null ? TBC : `${stage.hoursSince}h ago`, stage.alert ? 'alert' : ''),
    item('Unmapped stages', mapping.unmapped === null || mapping.unmapped === undefined ? TBC : num(mapping.unmapped), mapping.alert ? 'alert' : ''),
    item('Live pixels', num(pixels.activeCount), pixels.duplicatePixelWarning ? 'warn' : ''),
    item(
      'HubSpot',
      h.hubspotConnected === false ? 'Not connected' : h.attribution?.dealJoin?.ok ? 'Connected' : 'Join broken',
      h.hubspotConnected === false || h.attribution?.dealJoin?.ok === false ? 'alert' : '',
    ),
    item('Campaign cohort', h.cohortSize === null || h.cohortSize === undefined ? TBC : `${num(h.cohortSize)} leads`, ''),
    item(
      'Leads reaching a deal',
      h.attribution ? num(h.attribution.dealJoin.cohortLeadsWithDeals) : TBC,
      h.attribution && h.attribution.dealJoin.cohortLeadsWithDeals === 0 ? 'alert' : '',
    ),
    item('Attribution mode', esc(h.attributionMode ?? TBC), h.attributionMode === 'aggregate' ? 'warn' : ''),
    leads ? item('Lead submissions', `${num(leads.uniqueCount)} of ${num(leads.rawCount)}`, leads.duplicateCount > 0 ? 'warn' : '') : item('Lead submissions', TBC),
  ].join('');

  const r = s.reconciliation ?? {};
  const check = (label, value) => {
    const ok = value !== null && value === r.campaignSpend;
    return `<tr><td>${esc(label)}</td><td class="num">${value === null ? `<span class="tbc">${TBC}</span>` : money(value, { gst: false })}</td><td>${value === null ? '<span class="pill">Not fetched</span>' : ok ? '<span class="pill ok">Reconciles</span>' : '<span class="pill red">Does not sum</span>'}</td></tr>`;
  };

  el('reconciliation').innerHTML = `
    <h3 style="font-size:12.5px;color:var(--ink-dim);margin:0 0 8px;font-weight:600">Reconciliation</h3>
    <p class="panel-note" style="margin:0 0 8px">${esc(r.note ?? '')}</p>
    <table><thead><tr><th>Breakdown</th><th class="num">Sum</th><th>Status</th></tr></thead><tbody>
      <tr><td><strong>Campaign spend</strong></td><td class="num"><strong>${money(r.campaignSpend, { gst: false })}</strong></td><td></td></tr>
      ${check('Platform split', r.platformSum ?? null)}
      ${check('Region split', r.regionSum ?? null)}
      ${check('Age split', r.ageSum ?? null)}
      ${check('Ad level', r.adSum ?? null)}
      ${check('Daily series', r.dailySum ?? null)}
    </tbody></table>
    ${(pixels.pixels ?? []).length ? `
    <h3 style="font-size:12.5px;color:var(--ink-dim);margin:18px 0 8px;font-weight:600">Pixels</h3>
    <table><thead><tr><th>Pixel</th><th>Name</th><th class="num">Last fired</th></tr></thead><tbody>
      ${pixels.pixels.map((p) => `<tr><td>${esc(p.id)}</td><td>${esc(p.name ?? TBC)}</td><td class="num">${p.hoursSinceLastFired === null ? `<span class="tbc">${TBC}</span>` : `${p.hoursSinceLastFired}h ago`}</td></tr>`).join('')}
    </tbody></table>` : ''}`;
}

el('refresh').addEventListener('click', load);
el('range').addEventListener('change', () => {
  // The cached document covers a fixed window written by the scheduled refresh.
  // Changing the range here re-requests it; the server decides what it holds.
  load();
});

load();
