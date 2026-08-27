#!/usr/bin/env node
/**
 * Builds a single self-contained HTML file for publishing as an Artifact.
 *
 * The published page is LIVE where it can be: it asks the viewer's own Meta Ads
 * and HubSpot connectors for data through the artifact `mcp` capability, using
 * the viewer's credentials. No token is in this file.
 *
 * The frozen snapshot is inlined as the fallback, so the page still shows real,
 * validated figures when the capability is unavailable, a connector is not
 * connected, or permission is declined. It is labelled FROZEN when that
 * happens, never presented as current.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

const css = read('public/styles.css');
const bundle = read('public/app.bundle.js');
const html = read('public/index.html');
const snapshot = JSON.parse(read('public/sample-snapshot.json'));

const bodyMatch = html.match(/<body>([\s\S]*?)<script src="\/app\.bundle\.js"[^>]*><\/script>\s*<\/body>/);
if (!bodyMatch) throw new Error('Could not extract the page body from index.html');
const body = bodyMatch[1].trim();

// JSON embedded in a script tag must not be able to close it.
const safeJson = (v) => JSON.stringify(v)
  .replace(/</g, '\\u003c')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

const out = `<title>HireHospo Acquisition Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
${css}
</style>
${body}
<script>
/* Fallback only. Real campaign data, 1 to 25 August 2026, verified against the
   section 9 validation baselines. Used when live connector data is not
   available, and labelled FROZEN when it is. */
globalThis.__HH_SNAPSHOT__ = ${safeJson(snapshot)};
</script>
<script type="module">
${bundle}
</script>
`;

const target = new URL('public/dashboard-artifact.html', root);
writeFileSync(target, out);
console.log(`Wrote public/dashboard-artifact.html (${(Buffer.byteLength(out) / 1024).toFixed(0)} KB)`);
console.log(`  fallback: spend ${snapshot.headline.spend}, leads ${snapshot.headline.leads}, CPL ${snapshot.headline.cpl}`);
console.log(`  live path: Meta Ads + HubSpot via the mcp capability`);
