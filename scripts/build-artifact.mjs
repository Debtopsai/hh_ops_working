#!/usr/bin/env node
/**
 * Builds a single self-contained HTML file from the dashboard front end, with
 * the snapshot inlined, for publishing as a shareable preview.
 *
 * The real dashboard is the Netlify deployment, which refreshes hourly. This
 * is a frozen copy of one snapshot: same code paths, same figures, no network.
 * It exists so the dashboard can be reviewed and the sliders driven before the
 * API tokens are in place.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

const css = read('public/styles.css');
const js = read('public/app.js');
const html = read('public/index.html');
const snapshot = JSON.parse(read('public/sample-snapshot.json'));

// Pull the page body out of index.html, between <div class="wrap"> and </div>
// before the script tag. Simpler and less brittle: take everything between the
// body tags and drop the script include.
const bodyMatch = html.match(/<body>([\s\S]*?)<script src="\/app\.js"[^>]*><\/script>\s*<\/body>/);
if (!bodyMatch) throw new Error('Could not extract the page body from index.html');
let body = bodyMatch[1].trim();

// The frozen preview has no server to re-query, so the "Source" field states
// what it is rather than implying a live refresh.
body = body.replace(
  /<div class="field"><label>Source<\/label><div class="value-box" id="range-source"><\/div><\/div>/,
  '<div class="field"><label>Source</label><div class="value-box" id="range-source"></div></div>',
);

// The artifact has no server, so the fetch and fallback are replaced by a
// direct read of the inlined snapshot. Everything downstream is untouched.
const inlinedJs = js
  .replace(
    /async function load\(\) \{[\s\S]*?\n\}\n/,
    `async function load() {
  // Inlined snapshot. No network: this is a frozen copy of one refresh.
  SNAPSHOT = JSON.parse(document.getElementById('snapshot-data').textContent);
  SNAPSHOT.__isSample = true;
  SNAPSHOT.__sampleReason = 'Frozen preview of one refresh, not the live hourly data';
  render();
}
`,
  )
  .replace(/async function fallbackToSample\([\s\S]*?\n\}\n/, '');

const out = `<title>HireHospo Acquisition Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
${css}
</style>
${body}
<script type="application/json" id="snapshot-data">${JSON.stringify(snapshot).replace(/</g, '\\u003c')}</script>
<script type="module">
${inlinedJs}
</script>
`;

const target = new URL('public/dashboard-artifact.html', root);
writeFileSync(target, out);
const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
console.log(`Wrote public/dashboard-artifact.html (${kb} KB)`);
console.log(`  spend ${snapshot.headline.spend}, leads ${snapshot.headline.leads}, CPL ${snapshot.headline.cpl}`);
console.log(`  health ${snapshot.health.status}, ${snapshot.health.alerts.length} alerts`);
