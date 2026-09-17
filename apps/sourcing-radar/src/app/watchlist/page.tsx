import { browserSessionClient } from '@/lib/supabase/server'
import { NZ_REGIONS } from '@/lib/region'
import {
  isPreviewMode,
  PREVIEW_CATEGORIES,
  PREVIEW_MATCH_COUNTS,
  PREVIEW_NEGATIVES,
  PREVIEW_SOURCES,
  PREVIEW_TERMS,
} from '@/lib/preview'
import { addNegativeKeyword, removeNegativeKeyword, saveWatchTerm, toggleWatchTerm } from './actions'

/**
 * Watchlist.
 *
 * Match counts over 7 and 30 days sit next to each term so a dead term and a
 * noisy term are both obvious at a glance. Negative keyword editing lives here
 * too, because tuning the exclusions in the first fortnight matters more than
 * any feature in the product.
 */

export const dynamic = 'force-dynamic'

export default async function WatchlistPage() {
  if (isPreviewMode()) {
    return renderWatchlist({
      terms: PREVIEW_TERMS,
      negatives: PREVIEW_NEGATIVES.map((keyword) => ({ keyword })),
      sources: PREVIEW_SOURCES,
      categories: PREVIEW_CATEGORIES.map((name) => ({ name })),
      isAdmin: true,
      counts: PREVIEW_MATCH_COUNTS,
    })
  }

  const supabase = browserSessionClient()

  const [{ data: terms }, { data: negatives }, { data: sources }, { data: categories }, { data: user }] =
    await Promise.all([
      supabase.from('watch_terms').select('*').order('label'),
      supabase.from('global_negative_keywords').select('keyword').order('keyword'),
      supabase.from('sources').select('slug, name').order('name'),
      supabase.from('categories').select('name').order('name'),
      supabase.auth.getUser(),
    ])

  const { data: me } = user.user
    ? await supabase.from('app_users').select('role').eq('id', user.user.id).maybeSingle()
    : { data: null }
  const isAdmin = me?.role === 'admin'

  const counts = await loadMatchCounts(supabase)

  return renderWatchlist({
    terms: terms ?? [],
    negatives: negatives ?? [],
    sources: sources ?? [],
    categories: categories ?? [],
    isAdmin,
    counts,
  })
}

interface WatchlistView {
  terms: any[]
  negatives: Array<{ keyword: string }>
  sources: Array<{ slug: string; name: string }>
  categories: Array<{ name: string }>
  isAdmin: boolean
  counts: { sevenDay: Record<string, number>; thirtyDay: Record<string, number> }
}

function renderWatchlist({ terms, negatives, sources, categories, isAdmin, counts }: WatchlistView) {
  return (
    <>
      <h1>Watchlist</h1>
      <p className="subtitle">
        The buying profile. A term with no matches in 30 days is dead weight, a term with hundreds is noise.
      </p>

      {!isAdmin ? (
        <p className="notice">
          You have a viewer seat. You can read the buying profile and triage the feed, but only the admin seat edits
          watch terms and exclusions.
        </p>
      ) : null}

      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Keywords</th>
            <th>Excludes</th>
            <th>Max price</th>
            <th>Region</th>
            <th>7 days</th>
            <th>30 days</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((term: any) => (
            <tr key={term.id}>
              <td>{term.label}</td>
              <td>{(term.keywords ?? []).join(', ')}</td>
              <td>{(term.negative_keywords ?? []).join(', ') || '-'}</td>
              <td>{term.max_price_ex_gst === null ? 'not set' : `$${Number(term.max_price_ex_gst).toLocaleString('en-NZ')} + GST`}</td>
              <td>{term.region ?? 'all'}</td>
              <td>{counts.sevenDay[term.id] ?? 0}</td>
              <td>{counts.thirtyDay[term.id] ?? 0}</td>
              <td>
                {isAdmin ? (
                  <form action={toggleWatchTerm}>
                    <input type="hidden" name="id" value={term.id} />
                    <input type="hidden" name="active" value={term.active ? 'false' : 'true'} />
                    <button type="submit">{term.active ? 'Deactivate' : 'Activate'}</button>
                  </form>
                ) : (
                  <span className={`badge ${term.active ? 'ok' : ''}`}>{term.active ? 'active' : 'off'}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAdmin ? (
        <div className="panel" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 17, marginTop: 0 }}>Add a watch term</h2>
          <form action={saveWatchTerm} className="stack">
            <div className="row">
              <label className="field" style={{ flex: '1 1 200px' }}>
                Label
                <input name="label" required placeholder="Rational combi" />
              </label>
              <label className="field" style={{ flex: '2 1 320px' }}>
                Keywords, comma separated
                <input name="keywords" required placeholder="rational, scc, self cooking centre" />
              </label>
            </div>
            <div className="row">
              <label className="field" style={{ flex: '2 1 320px' }}>
                Exclude, comma separated
                <input name="negativeKeywords" placeholder="parts only, spares" />
              </label>
              <label className="field">
                Category
                <select name="category" defaultValue="">
                  <option value="">None</option>
                  {categories.map((category: any) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Max price ex GST
                <input name="maxPriceExGst" inputMode="decimal" placeholder="leave blank for none" />
              </label>
              <label className="field">
                Region
                <select name="region" defaultValue="">
                  <option value="">All regions</option>
                  {NZ_REGIONS.filter((region) => region !== 'Unknown').map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset style={{ border: '1px solid var(--line)', borderRadius: 8 }}>
              <legend style={{ fontSize: 13, color: 'var(--muted)' }}>Sources</legend>
              <div className="row">
                {sources.map((source: any) => (
                  <label key={source.slug} className="row" style={{ gap: 4 }}>
                    <input type="checkbox" name="sourceSlugs" value={source.slug} defaultChecked />
                    {source.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="row" style={{ gap: 6 }}>
              <input type="checkbox" name="active" defaultChecked />
              Active
            </label>
            <div>
              <button className="primary" type="submit">
                Save term
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="panel">
        <h2 style={{ fontSize: 17, marginTop: 0 }}>Global exclusions</h2>
        <p className="subtitle">
          Applied to every term. Searching a brand like Hobart returns domestic mixers, and a feed full of those is
          abandoned in week one.
        </p>
        <div className="row">
          {negatives.map((row: any) => (
            <form action={removeNegativeKeyword} key={row.keyword}>
              <input type="hidden" name="keyword" value={row.keyword} />
              <button type="submit" disabled={!isAdmin} title={isAdmin ? 'Remove' : 'Admin only'}>
                {row.keyword} {isAdmin ? '×' : ''}
              </button>
            </form>
          ))}
        </div>
        {isAdmin ? (
          <form action={addNegativeKeyword} className="row" style={{ marginTop: 12 }}>
            <input name="keyword" placeholder="add an exclusion" />
            <button className="primary" type="submit">
              Add
            </button>
          </form>
        ) : null}
      </div>
    </>
  )
}

async function loadMatchCounts(supabase: any) {
  const now = Date.now()
  const sevenDayIso = new Date(now - 7 * 86400_000).toISOString()
  const thirtyDayIso = new Date(now - 30 * 86400_000).toISOString()

  const [{ data: recent }, { data: month }] = await Promise.all([
    supabase.from('listing_matches').select('watch_term_id').gte('created_at', sevenDayIso),
    supabase.from('listing_matches').select('watch_term_id').gte('created_at', thirtyDayIso),
  ])

  const tally = (rows: any[] | null) => {
    const counts: Record<string, number> = {}
    for (const row of rows ?? []) counts[row.watch_term_id] = (counts[row.watch_term_id] ?? 0) + 1
    return counts
  }
  return { sevenDay: tally(recent), thirtyDay: tally(month) }
}
