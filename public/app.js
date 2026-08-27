/**
 * HireHospo acquisition dashboard, front end.
 *
 * Three data paths, tried in order:
 *
 *   1. LIVE, through the viewer's own claude.ai connectors. The page holds no
 *      token: calls run on the viewer's credentials via the artifact `mcp`
 *      capability, and each section watches independently so one failing
 *      connector annotates its own section rather than blanking the page.
 *   2. The cached document from /api/dashboard, when this is served by Netlify.
 *   3. The frozen validated snapshot, so the dashboard can still be reviewed.
 *
 * Whichever path serves it, the figures are computed by the same libraries that
 * reproduce the section 9 validation baselines.
 */
import { composeSnapshot, windowFor } from '../src/live/compose.mjs';
import { startLiveFeed, describeError, META_SERVER, HUBSPOT_SERVER } from '../src/live/live.mjs';
import assumptions from '../config/assumptions.json';
import equipmentCatalogue from '../config/equipment-catalogue.json';
import liveConfig from '../config/live.json';

const CONFIGS = { assumptions, equipmentCatalogue };

/* House rules throughout: every price shows "+ GST", every unavailable value
 * shows [TBC] rather than a plausible invention, dates are NZ format, and NZ
 * English is used in all copy. */

const TBC = '[TBC]';

/* Money. Integer cents, never floats. The payload carries money as fixed
 * decimal STRINGS, so parsing to cents is exact and the sliders cannot drift. */
const toCents = (s) => (s === null || s === undefined ? null : Math.round(Number(s) * 100));
const fromCents = (c) => (c === null || c === undefined ? null : (c / 100).toFixed(2));
const applyBp = (cents, bp) => (cents === null ? null : Math.round((cents * bp) / 10000));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const el = (id) => document.getElementById(id);

function money(value, { gst = true, compact = false } = {}) {
  if (value === null || value === undefined || value === '') return `<span class="tbc">${TBC}</span>`;
  const n = Number(value);
  if (!Number.isFinite(n)) return `<span class="tbc">${TBC}</span>`;
  if (compact && Math.abs(n) >= 1000) {
    return `NZ$${(n / 1000).toFixed(1)}k${gst ? '<span class="gst">+ GST</span>' : ''}`;
  }
  const formatted = n.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `NZ$${formatted}${gst ? '<span class="gst">+ GST</span>' : ''}`;
}
const moneyPlain = (v) => (v === null || v === undefined || !Number.isFinite(Number(v))
  ? TBC
  : `NZ$${Number(v).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

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
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
  return `${nzDate(iso)}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function shortDate(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${Number(d)} ${SHORT_MONTHS[Number(m) - 1]}`;
}

/* Data mark colours, validated in OKLCH against both surfaces. */
const MARK = { blue: '#3F83F2', green: '#00AD6E', violet: '#9475E9', amber: '#C27F00' };
/* UI accents, brighter. These encode nothing. */
const UI = { blue: '#3B82F6', green: '#34D399', violet: '#A78BFA', amber: '#FBBF24', red: '#F2545B' };

/* ------------------------------------------------------------------------- */

let SNAPSHOT = null;
let MCP = null;
let stopFeed = null;
let windowDays = Number(liveConfig.defaultWindowDays ?? 30);
let liveState = null;
let connectorNotice = null;

/** Live first. The capability resolves later than the first script run, and
 *  null when this view cannot run it, so the page renders without it and lights
 *  live data up when it arrives. */
async function boot() {
  await loadFallback();                       // something on screen immediately
  try {
    MCP = await globalThis.claude?.use?.('mcp');
  } catch { MCP = null; }
  if (!MCP) return;                            // frozen snapshot stands
  await checkConnectors();
  startLive();
}

/**
 * The connector names this page declares are display names, and a display name
 * that does not match produces server_not_found, which reads like "you have not
 * connected Meta Ads" even when the viewer has. Asking the runtime which
 * connectors are actually present turns that dead end into a fixable message
 * that names the real ones.
 */
async function checkConnectors() {
  let available;
  try {
    const tools = await MCP.listTools?.();
    if (!Array.isArray(tools)) return;
    available = [...new Set(tools.map((t) => t?.server).filter(Boolean))];
  } catch {
    return;                                    // not diagnostic, so say nothing
  }
  if (!available.length) return;

  const missing = [META_SERVER, HUBSPOT_SERVER].filter((want) => !available.includes(want));
  if (!missing.length) return;

  connectorNotice = {
    level: missing.length === 2 ? 'critical' : 'warning',
    message:
      `This page asks for ${missing.join(' and ')}, which ${missing.length === 1 ? 'is' : 'are'} not among the connectors on this account. ` +
      `Available here: ${available.join(', ')}. ` +
      'If one of those is the right connector under a different name, say so and the page can be pointed at it.',
  };
}

function startLive() {
  if (!MCP) return;
  if (stopFeed) { stopFeed(); stopFeed = null; }
  el('dashboard').classList.add('refreshing');
  const range = windowFor(windowDays);
  try {
    stopFeed = startLiveFeed({
      mcp: MCP,
      meta: liveConfig.meta,
      hubspot: liveConfig.hubspot,
      range,
      onChange: (state) => {
        liveState = state;
        // Nothing usable arrived yet, so keep whatever is on screen.
        if (!state.parts.campaign) { renderLiveNotices(state); return; }
        SNAPSHOT = composeSnapshot({
          parts: state.parts, errors: state.errors, storedAt: state.storedAt,
          range, configs: CONFIGS, liveConfig,
        });
        el('dashboard').classList.remove('refreshing');
        render();
      },
    });
  } catch (err) {
    liveState = { parts: {}, errors: { page: describeError(err, META_SERVER) }, storedAt: {} };
    el('dashboard').classList.remove('refreshing');
    renderLiveNotices(liveState);
  }
}

/** The cached document, then the frozen snapshot. */
async function loadFallback() {
  try {
    const res = await fetch('/api/dashboard', { headers: { accept: 'application/json' } });
    if (res.ok) {
      const json = await res.json();
      if (json.available !== false) { SNAPSHOT = json; render(); return; }
      return fallbackToSample(json.reason ?? 'the cache has not been written');
    }
  } catch { /* no server: this is the published page */ }
  return fallbackToSample('this view has no scheduled refresh behind it');
}

/**
 * The frozen snapshot is REAL campaign data verified against the section 9
 * baselines, not invented figures, and it is labelled as frozen wherever it
 * appears.
 */
async function fallbackToSample(reason) {
  try {
    const res = await fetch('/sample-snapshot.json');
    if (!res.ok) throw new Error('no sample');
    SNAPSHOT = await res.json();
  } catch {
    // The published page inlines the frozen snapshot instead of fetching it.
    const inline = globalThis.__HH_SNAPSHOT__;
    if (!inline) {
      el('loading').innerHTML = `<p>The dashboard data is unavailable.</p><p style="color:var(--ink-3)">${esc(reason ?? 'Unknown error')}</p>`;
      return;
    }
    SNAPSHOT = inline;
  }
  SNAPSHOT.__isSample = true;
  SNAPSHOT.__sampleReason = reason;
  render();
}

/** Per section connector failures, each with the action that would fix it. */
function renderLiveNotices(state) {
  const host = el('live-notices');
  if (!host) return;
  const notice = connectorNotice
    ? `<div class="banner ${connectorNotice.level}"><span class="tag">Connector</span><div>${esc(connectorNotice.message)}</div></div>`
    : '';

  const errs = Object.entries(state?.errors ?? {});
  if (!errs.length) { host.innerHTML = notice; return; }

  // Some sections may still be live. The tag says which, so a page reading
  // real figures is never labelled as though nothing loaded.
  const anyLive = Object.keys(state?.parts ?? {}).length > 0;
  const tagFor = (e) => (!e.retract ? 'Stale' : anyLive ? 'Partial' : 'Live off');

  // When every failure shares a code it is one condition, so it is stated once
  // rather than repeated identically per section.
  const codes = new Set(errs.map(([, e]) => e.code));
  if (codes.size === 1 && errs.length > 1) {
    const [, first] = errs[0];
    const scope = anyLive ? ` ${errs.length} of the dashboard's sections could not be read.` : '';
    host.innerHTML = notice + `<div class="banner ${first.retract ? 'critical' : 'warning'}">
      <span class="tag">${tagFor(first)}</span>
      <div>${esc(first.message)}${esc(scope)}</div></div>`;
    return;
  }
  host.innerHTML = notice + errs.map(([key, e]) => `<div class="banner ${e.retract ? 'critical' : 'warning'}">
    <span class="tag">${tagFor(e)}</span><div>${esc(e.message)} (${esc(key)})</div></div>`).join('');
}

function render() {
  const s = SNAPSHOT;
  el('loading').hidden = true;
  el('dashboard').hidden = false;

  renderMasthead(s);
  renderBanners(s);
  renderContext(s);
  renderHeadline(s);
  renderPlatform(s);
  renderSegments(s);
  renderFunnel(s);
  renderEconomics(s);
  renderFatigue(s);
  renderDemand(s);
  renderHealth(s);
  renderLiveNotices(liveState);

  el('footer-text').innerHTML =
    `All figures ex GST, NZD. Rent is 52 weeks, Lease to Own is 156 weeks. ` +
    `Generated ${nzDateTime(s.generatedAt)}.` +
    (s.__isSample ? ' Showing validated data from 1 to 25 August 2026, not a live refresh.' : '');
}

function renderMasthead(s) {
  const h = s.headline;
  const status = s.health?.status ?? 'ok';
  const criticals = (s.health?.alerts ?? []).filter((a) => a.level === 'critical').length;

  const modeBadge = el('mode-badge');
  if (modeBadge) modeBadge.textContent = s.__live ? 'LIVE' : s.__isSample ? 'FROZEN' : 'CACHED';

  const badge = el('status-badge');
  badge.hidden = false;
  badge.className = `badge ${status}`;
  badge.textContent = status === 'critical' ? `${criticals} critical` : status === 'warning' ? 'Checks open' : 'Healthy';

  const count = el('health-count');
  if (criticals > 0) { count.hidden = false; count.textContent = String(criticals); } else { count.hidden = true; }

  // Dot separated stats, with the figure that matters in green.
  const parts = [
    `${num(h.leads)} leads`,
    `${moneyPlain(h.spend)} spend`,
    `<span class="pos">${moneyPlain(h.cpl)} cost per lead</span>`,
    h.contractsFunded === null
      ? `${num(h.contractsSigned)} signed, funding unconfirmed`
      : `${num(h.contractsFunded)} funded`,
  ];
  el('stat-line').innerHTML = parts.join('<span class="sep">&middot;</span>');
}

function renderContext(s) {
  el('range-from').textContent = s.dateRange ? nzDate(s.dateRange.since) : TBC;
  el('range-to').textContent = s.dateRange ? nzDate(s.dateRange.until) : TBC;

  const source = el('range-source');
  if (s.__live) {
    // Freshness comes from the served result, not the local clock.
    const stamp = s.__sections?.storedAt?.campaign;
    source.innerHTML = `<span class="live-dot"></span>Live, ${stamp ? nzDateTime(new Date(stamp).toISOString()) : 'just now'}`;
  } else if (s.__isSample) {
    source.innerHTML = '<span class="live-dot frozen"></span>Frozen preview';
  } else {
    source.innerHTML = `<span class="live-dot"></span>Cached, ${nzDateTime(s.generatedAt)}`;
  }

  const sel = el('range-select');
  if (sel) {
    sel.value = String(windowDays);
    sel.disabled = !MCP;
    sel.title = MCP ? 'Choose the reporting window' : 'Live data is unavailable, so the window is fixed to the frozen snapshot';
  }
  const btn = el('refresh');
  if (btn) { btn.disabled = !MCP; btn.title = MCP ? 'Re-read from the connectors' : 'Live data is unavailable'; }
}

function renderBanners(s) {
  const alerts = s.health?.alerts ?? [];
  const extra = [];

  if (s.__isSample) {
    extra.push({
      level: 'warning',
      message: `Showing validated data from 1 to 25 August 2026, not a live refresh. Reason: ${s.__sampleReason ?? 'the cache has not been written'}. These figures are real and reconcile to the campaign, but they are not current.`,
    });
  }
  if (s.compliance?.mismatch) {
    extra.push({
      level: 'warning',
      message: `Daily rate claim. The ad currently spending claims ${s.compliance.liveClaim}, the approved marketing claim is ${s.compliance.approvedClaim}. ${s.compliance.sourceCaveat}`,
    });
  }
  if (s.reconciliation && s.reconciliation.allReconcile === false) {
    extra.push({
      level: 'critical',
      message: 'A breakdown does not sum to campaign spend. The date range or filter is wrong, and every split below is suspect. See data health.',
    });
  }

  const all = [...extra, ...alerts];
  const bannerHtml = (a) => {
    const level = a.level === 'critical' ? 'critical' : 'warning';
    // The word carries the severity. Colour alone never does.
    return `<div class="banner ${level}"><span class="tag">${level === 'critical' ? 'Critical' : 'Check'}</span><div>${esc(a.message)}</div></div>`;
  };
  const critical = all.filter((a) => a.level === 'critical');
  const rest = all.filter((a) => a.level !== 'critical');

  el('banners').innerHTML =
    critical.map(bannerHtml).join('') +
    (rest.length
      ? `<details class="more-checks"><summary>${rest.length} further ${rest.length === 1 ? 'check' : 'checks'}</summary>${rest.map(bannerHtml).join('')}</details>`
      : '');
}

/* The signature card: coloured top rule, glyph, uppercase label, big value. */
function tile({ glyph = '', label, value, foot, delta, rule = 'blue' }) {
  const isTbc = String(value).includes(TBC);
  return `<div class="tile rule-${esc(rule)}">
    <div class="head">${glyph ? `<span class="glyph">${esc(glyph)}</span>` : ''}<span class="label">${esc(label)}</span></div>
    <div class="value${isTbc ? ' tbc' : ''}">${value}</div>
    ${delta ? `<div class="delta ${delta.dir}">${esc(delta.text)}</div>` : ''}
    ${foot ? `<div class="foot">${esc(foot)}</div>` : ''}
  </div>`;
}

function renderHeadline(s) {
  const h = s.headline;
  const c = h.comparison;
  const deltaOf = (v) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return { dir: n === 0 ? '' : n > 0 ? 'up' : 'down', text: `${n > 0 ? '+' : ''}${n.toFixed(1)}% on previous period` };
  };

  el('headline-tiles').innerHTML = [
    tile({ glyph: '$', label: 'Spend', value: money(h.spend), rule: 'blue', delta: c ? deltaOf(c.spendChangePct) : null }),
    tile({ glyph: '#', label: 'Leads', value: num(h.leads), rule: 'green', delta: c ? deltaOf(c.leadsChangePct) : null, foot: h.leadsDeduplicated !== h.leads ? `${h.leadsDeduplicated} after deduplication` : null }),
    tile({ glyph: '~', label: 'Cost per lead', value: money(h.cpl), rule: 'violet' }),
    tile({ glyph: '%', label: 'CTR', value: pct(h.ctr, 2), rule: 'amber', foot: `${num(h.clicks)} clicks from ${num(h.impressions)} impressions` }),
    tile({
      glyph: '*', label: 'Contracts funded', rule: h.contractsFunded === null ? 'muted' : 'green',
      value: h.contractsFunded === null ? `<span class="tbc">${TBC}</span>` : num(h.contractsFunded),
      foot: h.contractsFunded === null ? 'Signed, funding unconfirmed' : null,
    }),
    tile({ glyph: '$', label: 'CAC', value: money(h.cac), rule: 'blue', foot: h.cacBasis === 'funded' ? 'Per funded contract' : 'Per signed contract, funding unconfirmed' }),
    tile({ glyph: 'x', label: 'LTV : CAC', value: h.ltvCac ? `${Number(h.ltvCac).toFixed(2)} : 1` : `<span class="tbc">${TBC}</span>`, rule: 'violet', foot: 'At the margin set under Funnel and economics' }),
    tile({
      glyph: '^', label: 'Frequency', rule: h.frequencyStatus === 'red' ? 'red' : h.frequencyStatus === 'amber' ? 'amber' : 'green',
      value: h.frequency ? Number(h.frequency).toFixed(2) : `<span class="tbc">${TBC}</span>`,
      foot: h.frequencyStatus === 'amber' ? 'Above the 3.0 amber threshold' : h.frequencyStatus === 'red' ? 'Above the 4.0 red threshold' : null,
    }),
  ].join('');
}

/* Donut plus card legend. Part to whole at a glance, two segments. */
function renderPlatform(s) {
  const rows = (s.segments?.platform ?? []).filter((r) => Number(r.spend) > 0);
  const svg = el('platform-donut');
  if (!rows.length) { svg.innerHTML = ''; el('platform-legend').innerHTML = `<p class="panel-note">${TBC}</p>`; return; }

  const total = rows.reduce((n, r) => n + Number(r.spend), 0);
  const totalLeads = rows.reduce((n, r) => n + r.leads, 0);
  el('platform-note').textContent = `${moneyPlain(total)} of spend and ${totalLeads} leads across ${rows.length} ${rows.length === 1 ? 'platform' : 'platforms'}. Share is of spend.`;

  const palette = [MARK.blue, MARK.violet, MARK.green, MARK.amber];
  const uiPalette = [UI.blue, UI.violet, UI.green, UI.amber];
  const size = 220, cx = size / 2, cy = size / 2, rOuter = 82, rInner = 50;

  let angle = -Math.PI / 2;
  const arcs = [];
  const labels = [];
  rows.forEach((r, i) => {
    const frac = Number(r.spend) / total;
    const sweep = frac * Math.PI * 2;
    const end = angle + sweep;
    // A 2px surface gap between segments rather than a stroke around them.
    const gap = 0.018;
    const a0 = angle + gap / 2, a1 = end - gap / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (rad, a) => `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
    arcs.push(`<path d="M${p(rOuter, a0)} A${rOuter},${rOuter} 0 ${large} 1 ${p(rOuter, a1)} L${p(rInner, a1)} A${rInner},${rInner} 0 ${large} 0 ${p(rInner, a0)} Z" fill="${palette[i % palette.length]}"/>`);

    const mid = (a0 + a1) / 2;
    const lx = cx + (rOuter + 20) * Math.cos(mid);
    const ly = cy + (rOuter + 20) * Math.sin(mid);
    labels.push(`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="${uiPalette[i % uiPalette.length]}" font-size="15" font-weight="700" text-anchor="${Math.cos(mid) < -0.2 ? 'end' : Math.cos(mid) > 0.2 ? 'start' : 'middle'}" dominant-baseline="middle">${(frac * 100).toFixed(0)}%</text>`);
    angle = end;
  });

  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.innerHTML = arcs.join('') + labels.join('');

  el('platform-legend').innerHTML = rows.map((r, i) => `
    <div class="legend-card">
      <div class="lc-head"><span class="dot" style="background:${uiPalette[i % uiPalette.length]}"></span><span class="lc-name">${esc(r.key.charAt(0).toUpperCase() + r.key.slice(1))}</span></div>
      <div class="lc-stats">${moneyPlain(r.spend)} spend &middot; ${num(r.impressions)} impressions</div>
      <div class="lc-pos">${num(r.leads)} leads at ${r.cpl === null ? TBC : moneyPlain(r.cpl)} each</div>
    </div>`).join('');
}

function segmentTable(title, rows, keyLabel) {
  if (!rows || !rows.length) return `<div><h3 class="sub-head">${esc(title)}</h3><p class="panel-note">${TBC}</p></div>`;
  return `<div>
    <h3 class="sub-head">${esc(title)}</h3>
    <div class="table-scroll"><table><thead><tr><th>${esc(keyLabel)}</th><th class="num">Spend</th><th class="num">Leads</th><th class="num">CPL</th></tr></thead><tbody>
      ${rows.map((r) => `<tr>
        <td>${esc(r.key)}</td>
        <td class="num">${money(r.spend, { gst: false })}</td>
        <td class="num">${num(r.leads)}</td>
        <td class="num">${r.cpl === null ? `<span class="tbc">${TBC}</span>` : money(r.cpl, { gst: false })}</td>
      </tr>`).join('')}
    </tbody></table></div>
  </div>`;
}

function renderSegments(s) {
  const seg = s.segments ?? {};
  const outOfRegion = seg.outOfRegion?.hasOutOfRegion
    ? `<p class="region-flag">Out of region spend flagged: ${seg.outOfRegion.rows.map((r) => `${esc(r.region)} ${moneyPlain(r.spend)}`).join(', ')}. ${esc(seg.outOfRegion.note)}</p>`
    : '';
  el('segments').innerHTML =
    segmentTable('Region', seg.region, 'Region').replace('</div>\n  </div>', `</div>${outOfRegion}</div>`) +
    segmentTable('Age band', seg.age, 'Age') +
    segmentTable('Day of week', seg.dayOfWeek, 'Day');
}

function renderFunnel(s) {
  const f = s.funnel;
  el('funnel-note').textContent = f.attributionNote ?? '';
  const maxCount = Math.max(...f.stages.map((st) => st.count ?? 0), 1);

  const head = `<div class="funnel-row funnel-head">
    <div>Stage</div><div></div><div class="num">Count</div>
    <div class="num col-rate">Of leads</div><div class="num col-cost">Cost each</div>
  </div>`;

  const rows = f.stages.map((st) => {
    const available = st.count !== null && st.count !== undefined;
    const width = available ? Math.max((st.count / maxCount) * 100, st.count > 0 ? 1.5 : 0) : 0;
    return `<div class="funnel-row">
      <div class="name${available ? '' : ' off'}">${esc(st.label)}</div>
      <div class="funnel-bar">
        ${available ? `<div class="track"></div><div class="fill" style="width:${width}%"></div>` : '<div class="unavailable">not measurable</div>'}
      </div>
      <div class="num${available ? '' : ' tbc'}">${available ? num(st.count) : TBC}</div>
      <div class="num col-rate${st.rateFromLeads === null ? ' tbc' : ''}">${st.rateFromLeads === null ? TBC : pct(st.rateFromLeads)}</div>
      <div class="num col-cost${st.costPerUnit === null ? ' tbc' : ''}">${st.costPerUnit === null ? TBC : moneyPlain(st.costPerUnit)}</div>
    </div>`;
  }).join('');

  el('funnel').innerHTML = head + rows;

  const dead = f.dead ?? {};
  el('dead-branch').innerHTML = `<h3 class="sub-head">Dead leads</h3>` + (
    dead.total === null || dead.total === undefined
      ? `<p class="panel-note">${TBC}. Dead lead reasons come from HubSpot deal stages, which are not maintained.</p>`
      : `<div class="table-scroll"><table><thead><tr><th>Reason</th><th class="num">Count</th></tr></thead><tbody>` +
        (dead.byReason ?? []).map((d) => `<tr><td>${esc(d.reason)}</td><td class="num">${num(d.count)}</td></tr>`).join('') +
        `<tr><td><strong>Total</strong></td><td class="num"><strong>${num(dead.total)}</strong></td></tr></tbody></table></div>`
  ) + `<p class="panel-note" style="margin-top:12px">${esc(f.fundingNote ?? '')}</p>`;
}

function renderEconomics(s) {
  const ue = s.unitEconomics;
  el('margin-unconfirmed').textContent = ue.marginConfirmed ? '' : 'Not confirmed. A sensitivity input, not a finding.';
  el('failure-note').textContent = `Portfolio ${(Number(ue.failureRateOptions?.portfolio ?? 0.105) * 100).toFixed(1)}%, or ${(Number(ue.failureRateOptions?.excludingChronicAccounts ?? 0.037) * 100).toFixed(1)}% excluding chronic accounts.`;

  const marginInput = el('margin');
  const failureInput = el('failure');
  marginInput.value = String(Math.round(Number(ue.grossMargin ?? 0.25) * 100));
  failureInput.value = String(Math.round(Number(ue.failureRate ?? 0.105) * 1000));

  const recompute = () => {
    const marginPct = Number(marginInput.value);
    const marginBp = marginPct * 100;
    const failureBp = Number(failureInput.value) * 10;
    el('margin-value').textContent = `${marginPct}%`;
    el('failure-value').textContent = `${(Number(failureInput.value) / 10).toFixed(1)}%`;

    const revenueCents = toCents(ue.contractRevenue);
    const cacCents = toCents(s.headline.cac);
    const w = ue.revenueWorking;
    const weeklyCents = w ? toCents(w.weeklyPayment) : null;
    const weeklyTotalCents = w ? toCents(w.weeklyPaymentsTotal) : null;
    const installCents = w ? toCents(w.deliveryAndInstall) : null;

    const ltvCents = applyBp(revenueCents, marginBp);
    const ltvCac = ltvCents !== null && cacCents ? ltvCents / cacCents : null;
    const weeklyContribCents = applyBp(weeklyCents, marginBp);
    const payback = weeklyContribCents ? cacCents / weeklyContribCents : null;
    // The weekly stream is discounted. Delivery and install is collected once,
    // up front, so it is not exposed to weekly direct debit failure.
    const survivingCents = weeklyTotalCents === null ? null : applyBp(weeklyTotalCents, 10000 - failureBp);
    const riskRevenueCents = survivingCents === null ? null : survivingCents + (installCents ?? 0);
    const riskLtvCents = applyBp(riskRevenueCents, marginBp);
    const riskLtvCac = riskLtvCents !== null && cacCents ? riskLtvCents / cacCents : null;

    const ref = Number(ue.ltvCacReference ?? 3);
    const ruleFor = (r) => (r === null ? 'muted' : r >= ref ? 'green' : 'red');

    el('econ-tiles').innerHTML = [
      tile({ glyph: '$', label: 'Contract revenue', value: money(ue.contractRevenue), rule: 'blue' }),
      tile({ glyph: '$', label: 'LTV', value: money(fromCents(ltvCents)), rule: 'violet', foot: `At ${marginPct}% gross margin` }),
      tile({ glyph: '$', label: 'CAC, media only', value: money(s.headline.cac), rule: 'blue' }),
      tile({ glyph: 'x', label: 'LTV : CAC', value: ltvCac === null ? `<span class="tbc">${TBC}</span>` : `${ltvCac.toFixed(2)} : 1`, rule: ruleFor(ltvCac), foot: `Reference line ${ref.toFixed(1)} : 1` }),
      tile({ glyph: '~', label: 'Payback', value: payback === null ? `<span class="tbc">${TBC}</span>` : `${payback.toFixed(1)} wks`, rule: 'amber', foot: 'Weeks of contribution' }),
      tile({ glyph: '$', label: 'Risk adjusted revenue', value: money(fromCents(riskRevenueCents)), rule: 'violet', foot: `Weekly stream discounted ${(failureBp / 100).toFixed(1)}%` }),
      tile({ glyph: 'x', label: 'Risk adjusted LTV : CAC', value: riskLtvCac === null ? `<span class="tbc">${TBC}</span>` : `${riskLtvCac.toFixed(2)} : 1`, rule: ruleFor(riskLtvCac) }),
    ].join('');

    el('revenue-working').innerHTML = w
      ? `<h3>Contract revenue, how it is built</h3>
         <dl>
           <dt>Weekly payments, ${num(w.termWeeks)} x ${moneyPlain(w.weeklyPayment)}</dt><dd>${moneyPlain(w.weeklyPaymentsTotal)}</dd>
           <dt>Delivery and install</dt><dd>${moneyPlain(w.deliveryAndInstall)}</dd>
           <dt class="total">Contract revenue</dt><dd class="total">${moneyPlain(w.contractRevenue)}</dd>
         </dl>
         ${w.cashUpfront ? `
         <h3 style="margin-top:18px">Cash upfront, ${esc(w.cashUpfront.structure)}, NOT revenue</h3>
         <dl class="excluded">
           <dt>Rent in advance, prepayment of the first weeks</dt><dd>${moneyPlain(w.cashUpfront.rentInAdvance)}</dd>
           <dt>Security bond, refundable, balance sheet only</dt><dd>${moneyPlain(w.cashUpfront.securityBond)}</dd>
           <dt class="total">Cash collected upfront</dt><dd class="total">${moneyPlain(w.cashUpfront.total)}</dd>
         </dl>
         <p class="panel-note" style="margin:12px 0 0">${esc(w.cashUpfront.note)}</p>` : ''}`
      : `<h3>Contract revenue</h3><p class="panel-note">${TBC}. Contract values come from HubSpot, where the term is empty on every deal.</p>`;

    el('sensitivity-working').innerHTML =
      `<h3>Margin sensitivity</h3>
       <p class="panel-note" style="margin:0 0 12px">${esc(ue.marginNote ?? '')}</p>
       <div class="table-scroll"><table><thead><tr><th>Margin</th><th class="num">LTV</th><th class="num">LTV : CAC</th><th class="num">Payback</th></tr></thead><tbody>` +
      (ue.sensitivity ?? []).map((row) => {
        const isCurrent = Math.round(row.grossMargin * 100) === marginPct;
        return `<tr${isCurrent ? ' style="background:rgba(59,130,246,0.09)"' : ''}>
          <td>${(row.grossMargin * 100).toFixed(0)}%</td>
          <td class="num">${moneyPlain(row.ltv)}</td>
          <td class="num">${row.ltvCac ? `${Number(row.ltvCac).toFixed(2)} : 1` : TBC}</td>
          <td class="num">${row.paybackWeeks ? `${row.paybackWeeks} wks` : TBC}</td>
        </tr>`;
      }).join('') + `</tbody></table></div>`;
  };

  marginInput.oninput = recompute;
  failureInput.oninput = recompute;
  recompute();
  el('econ-caveat').textContent = ue.caveat ?? '';
}

/* ---------------------------------------------------------------------------
 * Charts. ONE MEASURE PER PLOT. Three measures means three plots sharing an
 * x-axis, never three y-scales on one plot: the alignment between such scales
 * is arbitrary and invents a correlation that is not in the data.
 * ------------------------------------------------------------------------- */

function niceMax(v) {
  if (!Number.isFinite(v) || v <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(v));
  const n = v / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}

function drawChart(container, { kind, title, unit, data, format, id, caption = null }) {
  const points = data.filter((d) => d.y !== null && Number.isFinite(d.y));
  if (!points.length) return;

  const block = document.createElement('div');
  block.className = 'chart-block';
  block.innerHTML = `<div class="chart-title"><span class="t">${esc(title)}</span><span class="u">${esc(unit)}</span></div>
    <svg class="chart" id="${id}" role="img" aria-label="${esc(title)} over time"></svg>
    <div class="chart-tip" id="${id}-tip"></div>
    ${caption ? `<div class="chart-caption">${esc(caption)}</div>` : ''}`;
  container.appendChild(block);

  const svg = block.querySelector('svg');
  const tip = block.querySelector('.chart-tip');
  const W = Math.max(svg.clientWidth || container.clientWidth || 900, 320);
  const H = 132, padL = 48, padR = 14, padT = 10, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const top = niceMax(Math.max(...points.map((d) => d.y)) * 1.08);
  const x = (i) => padL + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v) => padT + innerH - (v / top) * innerH;

  const parts = [];
  // Recessive grid. Solid hairlines, one shade off the surface, never dashed.
  for (const frac of [0, 0.5, 1]) {
    const v = top * frac;
    parts.push(`<line x1="${padL}" y1="${y(v).toFixed(1)}" x2="${W - padR}" y2="${y(v).toFixed(1)}" stroke="#252E3D" stroke-width="1"/>`);
    parts.push(`<text x="${padL - 9}" y="${(y(v) + 3.5).toFixed(1)}" fill="#5C6678" font-size="9.5" text-anchor="end">${format(v)}</text>`);
  }

  if (kind === 'bar') {
    const bw = Math.max(innerW / points.length - 3, 2);
    points.forEach((d, i) => {
      const h = Math.max((d.y / top) * innerH, d.y > 0 ? 2 : 0);
      parts.push(`<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${(padT + innerH - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${MARK.blue}" rx="3"/>`);
    });
  } else {
    const line = points.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.y).toFixed(1)}`).join(' ');
    const area = `${line} L${x(points.length - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L${padL.toFixed(1)},${(padT + innerH).toFixed(1)} Z`;
    parts.push(`<defs><linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${MARK.blue}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${MARK.blue}" stop-opacity="0"/></linearGradient></defs>`);
    parts.push(`<path d="${area}" fill="url(#${id}-g)"/>`);
    parts.push(`<path d="${line}" fill="none" stroke="${MARK.blue}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`);
    const last = points[points.length - 1];
    parts.push(`<circle cx="${x(points.length - 1).toFixed(1)}" cy="${y(last.y).toFixed(1)}" r="4.5" fill="${UI.blue}" stroke="#141B26" stroke-width="2"/>`);
  }

  const every = Math.max(1, Math.ceil(points.length / 7));
  points.forEach((d, i) => {
    if (i % every !== 0 && i !== points.length - 1) return;
    parts.push(`<text x="${x(i).toFixed(1)}" y="${H - 5}" fill="#5C6678" font-size="9.5" text-anchor="middle">${esc(shortDate(d.x))}</text>`);
  });

  parts.push(`<line class="crosshair" x1="0" y1="${padT}" x2="0" y2="${padT + innerH}" stroke="${UI.blue}" stroke-width="1" opacity="0"/>`);
  parts.push(`<circle class="cursor-dot" r="4.5" fill="${UI.blue}" stroke="#141B26" stroke-width="2" opacity="0"/>`);
  parts.push(`<rect x="${padL}" y="${padT}" width="${innerW}" height="${innerH}" fill="transparent" class="hit"/>`);

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', String(W));
  svg.setAttribute('height', String(H));
  svg.innerHTML = parts.join('');

  const crosshair = svg.querySelector('.crosshair');
  const dot = svg.querySelector('.cursor-dot');
  svg.querySelector('.hit').addEventListener('mousemove', (e) => {
    const box = svg.getBoundingClientRect();
    const scale = W / box.width;
    let idx = Math.round((((e.clientX - box.left) * scale - padL) / innerW) * (points.length - 1));
    idx = Math.max(0, Math.min(points.length - 1, idx));
    const d = points[idx];
    crosshair.setAttribute('x1', x(idx).toFixed(1));
    crosshair.setAttribute('x2', x(idx).toFixed(1));
    crosshair.setAttribute('opacity', '0.5');
    dot.setAttribute('cx', x(idx).toFixed(1));
    dot.setAttribute('cy', y(d.y).toFixed(1));
    dot.setAttribute('opacity', '1');
    tip.innerHTML = `<div class="d">${esc(shortDate(d.x))}</div><div class="v">${format(d.y)} ${esc(unit)}</div>`;
    tip.style.opacity = '1';
    tip.style.left = `${Math.max(0, Math.min((x(idx) / scale) - tip.offsetWidth / 2, box.width - tip.offsetWidth))}px`;
    tip.style.top = `${(y(d.y) / scale) + 8}px`;
  });
  svg.querySelector('.hit').addEventListener('mouseleave', () => {
    crosshair.setAttribute('opacity', '0');
    dot.setAttribute('opacity', '0');
    tip.style.opacity = '0';
  });
}

function renderFatigue(s) {
  const f = s.fatigue;
  const series = (f.daily ?? []).filter((d) => d.dateStart);
  el('fatigue-note').textContent = `${f.periodFrequencyNote ?? ''} ${f.note ?? ''}`.trim();

  const host = el('fatigue-charts');
  host.innerHTML = '';
  if (series.length) {
    const amber = Number(f.frequencyThresholds?.amber ?? 3);
    const red = Number(f.frequencyThresholds?.red ?? 4);
    const periodFreq = f.periodFrequency === null || f.periodFrequency === undefined ? null : Number(f.periodFrequency);
    const freqState = periodFreq === null ? null : periodFreq >= red ? 'above the 4.0 red threshold' : periodFreq >= amber ? 'above the 3.0 amber threshold' : 'below the 3.0 amber threshold';

    drawChart(host, {
      id: 'ch-ctr', kind: 'line', title: 'Click through rate', unit: '%',
      data: series.map((d) => ({ x: d.dateStart, y: d.ctr === null ? null : Number(d.ctr) })),
      format: (v) => v.toFixed(1),
    });
    // Frequency is reach based, so a daily figure and a period figure are
    // different measures. The 3.0 and 4.0 thresholds describe the PERIOD
    // figure, and drawing them on a daily axis would invite the reader to
    // conclude the campaign is nowhere near fatigue when the period figure is
    // already above amber.
    drawChart(host, {
      id: 'ch-freq', kind: 'line', title: 'Frequency, per day', unit: 'impressions per person',
      data: series.map((d) => ({ x: d.dateStart, y: d.frequency === null ? null : Number(d.frequency) })),
      format: (v) => v.toFixed(1),
      caption: periodFreq === null ? 'Period frequency is unavailable.'
        : `Over the whole period, frequency is ${periodFreq.toFixed(2)}, ${freqState}. A daily figure is not comparable to it: the same person seen on two days is one reached person, not two.`,
    });
    drawChart(host, {
      id: 'ch-spend', kind: 'bar', title: 'Daily spend', unit: 'NZ$ ex GST',
      data: series.map((d) => ({ x: d.dateStart, y: d.spend === null ? null : Number(d.spend) })),
      format: (v) => v.toFixed(0),
    });
  }

  el('creative-table').innerHTML =
    `<thead><tr><th>Creative</th><th class="num">Spend</th><th class="num">Share</th><th class="num">Leads</th><th class="num">CPL</th><th class="num">CTR</th><th>Frequency</th></tr></thead><tbody>` +
    (f.creatives ?? []).map((c) => `<tr>
      <td>${esc(c.name ?? TBC)}</td>
      <td class="num">${money(c.spend, { gst: false })}</td>
      <td class="num">${c.sharePct === null ? TBC : `${c.sharePct}%`}</td>
      <td class="num">${num(c.leads)}</td>
      <td class="num">${c.cpl === null ? `<span class="tbc">${TBC}</span>` : money(c.cpl, { gst: false })}</td>
      <td class="num">${c.ctr === null ? `<span class="tbc">${TBC}</span>` : pct(c.ctr, 2)}</td>
      <td>${c.frequency === null ? `<span class="tbc">${TBC}</span>` : `<span class="pill ${c.frequencyStatus ?? ''}">${Number(c.frequency).toFixed(2)}</span>`}</td>
    </tr>`).join('') + `</tbody>`;
}

function renderDemand(s) {
  const d = s.demand;
  if (!d || d.available === false) {
    el('demand').innerHTML = `<p class="panel-note">${TBC}. ${esc(d?.reason ?? 'No lead records available.')}</p>`;
    return;
  }
  const out = d.outCategories ?? [];
  const cats = (d.categories ?? []).filter((c) => c.count > 0);
  const maxCount = Math.max(...cats.map((c) => c.count), 1);

  el('demand').innerHTML = `
    <div class="tiles" style="margin-bottom:20px">
      ${tile({ glyph: '#', label: 'Worth having', value: num(d.worthHaving ?? d.inCatalogue), rule: 'green', foot: d.inCatalogueShare === null ? null : `${d.inCatalogueShare}% of classified` })}
      ${tile({ glyph: '!', label: 'Out of catalogue', value: num(d.outOfCatalogue), rule: 'amber', foot: d.outOfCatalogueShare === null ? null : `${d.outOfCatalogueShare}% of classified` })}
      ${tile({ glyph: '$', label: 'Estimated wasted spend', value: d.estimatedWastedSpend ? money(d.estimatedWastedSpend.value) : `<span class="tbc">${TBC}</span>`, rule: 'amber', foot: d.estimatedWastedSpend ? 'Estimate, at the average CPL' : null })}
      ${tile({ glyph: '~', label: 'Mixed enquiries', value: num(d.mixed ?? 0), rule: 'violet', foot: 'Named financeable and non financeable kit. Counted as worth having' })}
      ${tile({ glyph: '?', label: 'Stated but not specific', value: num(d.vague ?? 0), rule: 'muted', foot: 'Excluded from the share' })}
      ${tile({ glyph: '?', label: 'Unclassified', value: num((d.unstated ?? 0) + (d.unclassified ?? 0)), rule: (d.unclassified ?? 0) > 0 ? 'amber' : 'muted', foot: (d.unclassified ?? 0) > 0 ? 'A rising count means the keyword list needs extending' : null })}
    </div>
    <h3 class="sub-head">Enquiries by category</h3>
    <div class="table-scroll"><table><thead><tr><th>Category</th><th style="width:44%">Leads</th><th class="num">Count</th><th>In catalogue</th></tr></thead><tbody>
      ${cats.map((c) => {
        const isOut = out.includes(c.category);
        const neither = ['unstated', 'unclassified', 'vague'].includes(c.category);
        const colour = neither ? '#3A4457' : isOut ? MARK.amber : MARK.green;
        return `<tr>
          <td>${esc(c.label ?? c.category)}</td>
          <td><div style="background:${colour};height:9px;border-radius:3px;width:${Math.max((c.count / maxCount) * 100, 2)}%"></div></td>
          <td class="num">${num(c.count)}</td>
          <td>${neither ? '<span class="pill">Neither</span>' : isOut ? '<span class="pill out">Out</span>' : '<span class="pill in">In</span>'}</td>
        </tr>`;
      }).join('')}
    </tbody></table></div>`;
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
    item('HubSpot', h.hubspotConnected === false ? 'Not connected' : h.attribution?.dealJoin?.ok ? 'Connected' : 'Join broken',
      h.hubspotConnected === false || h.attribution?.dealJoin?.ok === false ? 'alert' : ''),
    item('Campaign cohort', h.cohortSize === null || h.cohortSize === undefined ? TBC : `${num(h.cohortSize)} leads`, ''),
    item('Leads reaching a deal', h.attribution ? num(h.attribution.dealJoin.cohortLeadsWithDeals) : TBC,
      h.attribution && h.attribution.dealJoin.cohortLeadsWithDeals === 0 ? 'alert' : ''),
    item('Attribution mode', esc(h.attributionMode ?? TBC), h.attributionMode === 'aggregate' ? 'warn' : ''),
    leads ? item('Lead submissions', `${num(leads.uniqueCount)} of ${num(leads.rawCount)}`, leads.duplicateCount > 0 ? 'warn' : '') : item('Lead submissions', TBC),
  ].join('');

  const r = s.reconciliation ?? {};
  const check = (label, value) => {
    const ok = value !== null && value === r.campaignSpend;
    return `<tr><td>${esc(label)}</td><td class="num">${value === null ? `<span class="tbc">${TBC}</span>` : moneyPlain(value)}</td><td>${value === null ? '<span class="pill">Not fetched</span>' : ok ? '<span class="pill ok">Reconciles</span>' : '<span class="pill red">Does not sum</span>'}</td></tr>`;
  };

  el('reconciliation').innerHTML = `
    <h3 class="sub-head">Reconciliation</h3>
    <p class="panel-note" style="margin:0 0 10px">${esc(r.note ?? '')}</p>
    <div class="table-scroll"><table><thead><tr><th>Breakdown</th><th class="num">Sum</th><th>Status</th></tr></thead><tbody>
      <tr><td><strong>Campaign spend</strong></td><td class="num"><strong>${moneyPlain(r.campaignSpend)}</strong></td><td></td></tr>
      ${check('Platform split', r.platformSum ?? null)}
      ${check('Region split', r.regionSum ?? null)}
      ${check('Age split', r.ageSum ?? null)}
      ${check('Ad level', r.adSum ?? null)}
      ${check('Daily series', r.dailySum ?? null)}
    </tbody></table></div>
    ${(pixels.pixels ?? []).length ? `
    <h3 class="sub-head" style="margin-top:24px">Pixels</h3>
    <div class="table-scroll"><table><thead><tr><th>Pixel</th><th>Name</th><th class="num">Last fired</th></tr></thead><tbody>
      ${pixels.pixels.map((p) => `<tr><td>${esc(p.id)}</td><td>${esc(p.name ?? TBC)}</td><td class="num">${p.hoursSinceLastFired === null ? `<span class="tbc">${TBC}</span>` : `${p.hoursSinceLastFired}h ago`}</td></tr>`).join('')}
    </tbody></table></div>` : ''}`;
}

/* ---------- Tabs ---------- */
const TABS = ['acquisition', 'funnel', 'creative', 'demand', 'health'];
function selectTab(name) {
  for (const t of TABS) {
    const tab = el(`tab-${t}`);
    const panel = el(`panel-${t}`);
    const on = t === name;
    tab.setAttribute('aria-selected', String(on));
    panel.hidden = !on;
  }
  // Charts measure their own width in pixels, so anything drawn while hidden
  // has no width to measure. Redraw on reveal.
  if (name === 'creative' && SNAPSHOT) renderFatigue(SNAPSHOT);
  if (name === 'acquisition' && SNAPSHOT) renderPlatform(SNAPSHOT);
}
for (const t of TABS) {
  el(`tab-${t}`).addEventListener('click', () => selectTab(t));
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!SNAPSHOT) return;
    if (!el('panel-creative').hidden) renderFatigue(SNAPSHOT);
  }, 180);
});

const rangeSel = el('range-select');
if (rangeSel) {
  rangeSel.addEventListener('change', () => {
    windowDays = Number(rangeSel.value);
    startLive();
  });
}
const refreshBtn = el('refresh');
if (refreshBtn) refreshBtn.addEventListener('click', () => startLive());

boot();
