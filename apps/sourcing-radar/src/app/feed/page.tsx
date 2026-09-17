import { cookies } from 'next/headers'
import Link from 'next/link'
import { browserSessionClient } from '@/lib/supabase/server'
import { isPreviewMode, PREVIEW_LISTINGS, PREVIEW_SOURCES, PREVIEW_TERMS } from '@/lib/preview'
import { NZ_REGIONS } from '@/lib/region'
import { FeedCard, type FeedCardListing } from './FeedCard'
import { ClipForm } from './ClipForm'

/**
 * The feed. The default view and the only screen that matters day to day.
 *
 * Reverse chronological, paginated rather than loaded whole, and usable on a
 * phone. A listing with no price renders as "price TBC", never as zero.
 */

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 24
const LAST_VISIT_COOKIE = 'radar_last_visit'

const PRICE_BANDS: Record<string, [number | null, number | null]> = {
  'under-1k': [null, 1000],
  '1k-5k': [1000, 5000],
  '5k-15k': [5000, 15000],
  'over-15k': [15000, null],
}

interface SearchParams {
  source?: string
  region?: string
  state?: string
  band?: string
  term?: string
  q?: string
  page?: string
}

export default async function FeedPage({ searchParams }: { searchParams: SearchParams }) {
  if (isPreviewMode()) return <PreviewFeed searchParams={searchParams} />

  const supabase = browserSessionClient()
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id ?? null

  const cookieStore = cookies()
  const lastVisitRaw = cookieStore.get(LAST_VISIT_COOKIE)?.value
  const lastVisit = lastVisitRaw ? new Date(lastVisitRaw) : null

  const page = Math.max(1, Number.parseInt(searchParams.page ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE

  const [{ data: sources }, { data: terms }] = await Promise.all([
    supabase.from('sources').select('slug, name').order('name'),
    supabase.from('watch_terms').select('id, label').eq('active', true).order('label'),
  ])

  let query = supabase
    .from('listings')
    .select(
      'id, title, url, price_ex_gst, price_basis, image_urls, cached_image_path, source_slug, region, out_of_region, closes_at, first_seen_at, lot_number, sources(name), listing_matches(score, watch_term_id, watch_terms(label)), listing_states(state, note, user_id, updated_at)',
      { count: 'exact' },
    )
    .order('first_seen_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (searchParams.source) query = query.eq('source_slug', searchParams.source)
  if (searchParams.region) query = query.eq('region', searchParams.region)
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)
  if (searchParams.band && PRICE_BANDS[searchParams.band]) {
    const [min, max] = PRICE_BANDS[searchParams.band]
    if (min !== null) query = query.gte('price_ex_gst', min)
    if (max !== null) query = query.lt('price_ex_gst', max)
  }

  const { data: rows, count, error } = await query

  const listingIds = (rows ?? []).map((row: any) => row.id)
  const duplicatesBySubject = await loadDuplicateSources(supabase, listingIds)
  const userNames = await loadUserNames(supabase)

  const now = new Date()

  let listings: FeedCardListing[] = (rows ?? []).map((row: any) => {
    const matches = (row.listing_matches ?? [])
      .slice()
      .sort((a: any, b: any) => Number(b.score) - Number(a.score))
    const ownState = (row.listing_states ?? []).find((s: any) => s.user_id === userId)
    const anyState = ownState ?? (row.listing_states ?? [])[0] ?? null

    return {
      id: row.id,
      title: row.title,
      url: row.url,
      priceExGst: row.price_ex_gst === null ? null : Number(row.price_ex_gst),
      priceBasis: row.price_basis,
      imageUrl: row.cached_image_path
        ? `/api/images/${row.cached_image_path}`
        : row.image_urls?.[0] ?? null,
      sourceName: row.sources?.name ?? row.source_slug,
      region: row.region ?? 'Unknown',
      outOfRegion: row.out_of_region,
      matchedTerms: matches.map((m: any) => m.watch_terms?.label).filter(Boolean),
      closesAt: row.closes_at,
      firstSeenAt: row.first_seen_at,
      lotNumber: row.lot_number,
      state: anyState?.state ?? null,
      stateBy: anyState ? userNames[anyState.user_id] ?? null : null,
      stateNote: anyState?.note ?? null,
      duplicateSources: duplicatesBySubject[row.id] ?? [],
      isNewSinceLastVisit: lastVisit ? new Date(row.first_seen_at) > lastVisit : true,
    }
  })

  // The term and state filters read from the joined rows rather than from a
  // second round trip.
  if (searchParams.term) {
    const label = (terms ?? []).find((t: any) => t.id === searchParams.term)?.label
    if (label) listings = listings.filter((listing) => listing.matchedTerms.includes(label))
  }
  if (searchParams.state) {
    listings = listings.filter((listing) =>
      searchParams.state === 'new' ? !listing.state || listing.state === 'new' : listing.state === searchParams.state,
    )
  }

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1

  return (
    <>
      <h1>Feed</h1>
      <p className="subtitle">
        All prices ex GST unless a card says otherwise. {count ?? 0} listings match these filters.
      </p>

      {error ? <p className="notice">Could not load the feed: {error.message}</p> : null}

      <ClipForm />

      <form className="filters" method="get">
        <label className="field">
          Source
          <select name="source" defaultValue={searchParams.source ?? ''}>
            <option value="">All</option>
            {(sources ?? []).map((source: any) => (
              <option key={source.slug} value={source.slug}>
                {source.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Region
          <select name="region" defaultValue={searchParams.region ?? ''}>
            <option value="">All</option>
            {NZ_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Watch term
          <select name="term" defaultValue={searchParams.term ?? ''}>
            <option value="">All</option>
            {(terms ?? []).map((term: any) => (
              <option key={term.id} value={term.id}>
                {term.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Price band
          <select name="band" defaultValue={searchParams.band ?? ''}>
            <option value="">Any</option>
            <option value="under-1k">Under $1,000</option>
            <option value="1k-5k">$1,000 to $5,000</option>
            <option value="5k-15k">$5,000 to $15,000</option>
            <option value="over-15k">Over $15,000</option>
          </select>
        </label>
        <label className="field">
          State
          <select name="state" defaultValue={searchParams.state ?? ''}>
            <option value="">Any</option>
            <option value="new">New</option>
            <option value="watching">Watching</option>
            <option value="dismissed">Dismissed</option>
            <option value="bought">Bought</option>
          </select>
        </label>
        <label className="field">
          Search
          <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Rational, combi" />
        </label>
        <button className="primary" type="submit">
          Apply
        </button>
        <Link className="button" href="/feed">
          Clear
        </Link>
      </form>

      {listings.length === 0 ? (
        <p className="empty">Nothing matches these filters yet.</p>
      ) : (
        <div className="cards">
          {listings.map((listing) => (
            <FeedCard key={listing.id} listing={listing} now={now} />
          ))}
        </div>
      )}

      <div className="pagination">
        {page > 1 ? (
          <Link className="button" href={{ pathname: '/feed', query: { ...searchParams, page: page - 1 } }}>
            Previous
          </Link>
        ) : null}
        <span className="footnote">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link className="button" href={{ pathname: '/feed', query: { ...searchParams, page: page + 1 } }}>
            Next
          </Link>
        ) : null}
      </div>

      <p className="footnote">
        Listings are grouped, never merged. Where the same machine appears on two sources both cards stay in the
        feed and carry each other's source badge.
      </p>
    </>
  )
}

async function loadDuplicateSources(supabase: any, listingIds: string[]): Promise<Record<string, string[]>> {
  if (listingIds.length === 0) return {}
  const { data } = await supabase
    .from('duplicate_candidates')
    .select('listing_a, listing_b')
    .or(`listing_a.in.(${listingIds.join(',')}),listing_b.in.(${listingIds.join(',')})`)

  const partnerIds = new Set<string>()
  for (const row of data ?? []) {
    partnerIds.add(row.listing_a)
    partnerIds.add(row.listing_b)
  }
  if (partnerIds.size === 0) return {}

  const { data: partners } = await supabase
    .from('listings')
    .select('id, source_slug, sources(name)')
    .in('id', [...partnerIds])

  const nameById = new Map<string, string>(
    (partners ?? []).map((row: any) => [row.id, row.sources?.name ?? row.source_slug]),
  )

  const result: Record<string, string[]> = {}
  for (const row of data ?? []) {
    for (const [subject, partner] of [
      [row.listing_a, row.listing_b],
      [row.listing_b, row.listing_a],
    ]) {
      if (!listingIds.includes(subject)) continue
      const name = nameById.get(partner)
      if (!name) continue
      result[subject] = [...new Set([...(result[subject] ?? []), name])]
    }
  }
  return result
}

async function loadUserNames(supabase: any): Promise<Record<string, string>> {
  const { data } = await supabase.from('app_users').select('id, display_name, email')
  const names: Record<string, string> = {}
  for (const row of data ?? []) names[row.id] = row.display_name ?? row.email
  return names
}


/**
 * The same screen driven by sample data, for looking at the interface before
 * any credentials exist. The filters below run over the sample array so the
 * controls behave, rather than being decoration.
 */
function PreviewFeed({ searchParams }: { searchParams: SearchParams }) {
  const now = new Date()
  const sourceNameBySlug = new Map(PREVIEW_SOURCES.map((source) => [source.slug, source.name]))

  let listings = [...PREVIEW_LISTINGS]
  if (searchParams.source) {
    const name = sourceNameBySlug.get(searchParams.source)
    listings = listings.filter((listing) => listing.sourceName === name)
  }
  if (searchParams.region) listings = listings.filter((listing) => listing.region === searchParams.region)
  if (searchParams.q) {
    const needle = searchParams.q.toLowerCase()
    listings = listings.filter((listing) => listing.title.toLowerCase().includes(needle))
  }
  if (searchParams.band && PRICE_BANDS[searchParams.band]) {
    const [min, max] = PRICE_BANDS[searchParams.band]
    listings = listings.filter(
      (listing) =>
        listing.priceExGst !== null &&
        (min === null || listing.priceExGst >= min) &&
        (max === null || listing.priceExGst < max),
    )
  }
  if (searchParams.term) {
    const label = PREVIEW_TERMS.find((term) => term.id === searchParams.term)?.label
    if (label) listings = listings.filter((listing) => listing.matchedTerms.includes(label))
  }
  if (searchParams.state) {
    listings = listings.filter((listing) =>
      searchParams.state === 'new' ? !listing.state || listing.state === 'new' : listing.state === searchParams.state,
    )
  }

  return (
    <>
      <h1>Feed</h1>
      <p className="subtitle">
        All prices ex GST unless a card says otherwise. {listings.length} listings match these filters.
      </p>

      <ClipForm />

      <form className="filters" method="get">
        <label className="field">
          Source
          <select name="source" defaultValue={searchParams.source ?? ''}>
            <option value="">All</option>
            {PREVIEW_SOURCES.map((source) => (
              <option key={source.slug} value={source.slug}>
                {source.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Region
          <select name="region" defaultValue={searchParams.region ?? ''}>
            <option value="">All</option>
            {NZ_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Watch term
          <select name="term" defaultValue={searchParams.term ?? ''}>
            <option value="">All</option>
            {PREVIEW_TERMS.map((term) => (
              <option key={term.id} value={term.id}>
                {term.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Price band
          <select name="band" defaultValue={searchParams.band ?? ''}>
            <option value="">Any</option>
            <option value="under-1k">Under $1,000</option>
            <option value="1k-5k">$1,000 to $5,000</option>
            <option value="5k-15k">$5,000 to $15,000</option>
            <option value="over-15k">Over $15,000</option>
          </select>
        </label>
        <label className="field">
          State
          <select name="state" defaultValue={searchParams.state ?? ''}>
            <option value="">Any</option>
            <option value="new">New</option>
            <option value="watching">Watching</option>
            <option value="dismissed">Dismissed</option>
            <option value="bought">Bought</option>
          </select>
        </label>
        <label className="field">
          Search
          <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Rational, combi" />
        </label>
        <button className="primary" type="submit">
          Apply
        </button>
        <Link className="button" href="/feed">
          Clear
        </Link>
      </form>

      {listings.length === 0 ? (
        <p className="empty">Nothing matches these filters yet.</p>
      ) : (
        <div className="cards">
          {listings.map((listing) => (
            <FeedCard key={listing.id} listing={listing} now={now} />
          ))}
        </div>
      )}

      <p className="footnote">
        Listings are grouped, never merged. Where the same machine appears on two sources both cards stay in the
        feed and carry each other's source badge.
      </p>
    </>
  )
}
