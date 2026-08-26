/**
 * Read endpoint. Serves the cached document to the front end.
 *
 * Returns aggregates only. There is no lead level record in the cache to
 * return, so this endpoint cannot expose one even if it were asked to.
 *
 * This does NOT replace access control. The site itself must sit behind Netlify
 * password protection or SSO, per section 3 of the brief. See README.
 */
import { getStore } from '@netlify/blobs';

export default async function handler() {
  try {
    const store = getStore('acquisition-dashboard');
    const [snapshot, meta] = await Promise.all([store.get('latest', { type: 'json' }), store.get('meta', { type: 'json' })]);

    if (!snapshot) {
      return new Response(
        JSON.stringify({
          available: false,
          reason: 'The cache has not been written yet. The scheduled refresh may not have run.',
          refreshMeta: meta ?? null,
        }),
        { status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' } },
      );
    }

    return new Response(JSON.stringify({ available: true, ...snapshot, refreshMeta: meta ?? null }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ available: false, reason: err.message }), {
      status: 500,
      headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
    });
  }
}
