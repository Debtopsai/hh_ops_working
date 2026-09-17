/**
 * Verify a discovered source config against the live site.
 *
 * Run this before enabling a source, and again whenever a source starts
 * reporting zero listings on Source health.
 *
 *   npx tsx scripts/validate-source-config.ts all_about_auctions
 *
 * It runs the real adapter, prints the first few normalised listings and fails
 * on the mistakes that are easy to make and expensive to miss: a field path
 * that resolves to nothing, and a "Pricing coming soon" listing that parsed to
 * zero instead of to a null price.
 */

import { createClient } from '@supabase/supabase-js'
import { getAdapter } from '../src/adapters/registry'
import type { AdapterContext } from '../src/adapters/types'
import type { SourceRow } from '../src/lib/types'
import { searchQueriesForSource } from '../src/ingest/runner'

async function main() {
  const slug = process.argv[2]
  if (!slug) throw new Error('usage: tsx scripts/validate-source-config.ts <source-slug>')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  const db = createClient(url, key, { auth: { persistSession: false } })

  const { data: row, error } = await db.from('sources').select('*').eq('slug', slug).maybeSingle()
  if (error) throw new Error(error.message)
  if (!row) throw new Error(`no source with slug "${slug}"`)

  const source: SourceRow = {
    slug: row.slug,
    name: row.name,
    adapterType: row.adapter_type,
    enabled: row.enabled,
    pollIntervalSeconds: row.poll_interval_seconds,
    regionDefault: row.region_default,
    buyersPremiumPct: row.buyers_premium_pct,
    buyersPremiumBasis: row.buyers_premium_basis,
    config: row.config ?? {},
  }

  const { data: terms } = await db.from('watch_terms').select('*').eq('active', true)
  const watchTerms = (terms ?? []).map((term: any) => ({
    id: term.id,
    label: term.label,
    keywords: term.keywords ?? [],
    negativeKeywords: term.negative_keywords ?? [],
    category: term.category,
    maxPriceExGst: term.max_price_ex_gst,
    region: term.region,
    sourceSlugs: term.source_slugs ?? [],
    active: term.active,
  }))

  const ctx: AdapterContext = {
    source,
    homeRegion: 'Auckland',
    searchQueries: searchQueriesForSource(watchTerms, slug).slice(0, 3),
    fetchImpl: fetch,
    now: () => new Date(),
    log: (message) => console.log(`  ${message}`),
  }

  const adapter = getAdapter(source.adapterType)
  console.log(`Fetching ${source.name} ...`)
  const items = await adapter.fetch(ctx)
  console.log(`${items.length} raw items\n`)

  const problems: string[] = []
  let normalisedCount = 0

  for (const [index, item] of items.entries()) {
    const listing = adapter.normalise(item, ctx)
    if (!listing) {
      problems.push(`item ${index} normalised to null, so it has no title or no URL`)
      continue
    }
    normalisedCount += 1

    if (index < 3) {
      console.log(JSON.stringify({ ...listing, raw: '(omitted)' }, null, 2))
      console.log('')
    }

    if (!listing.externalId) problems.push(`item ${index} has no external id, so identity falls back to a content hash`)
    if (listing.imageUrls.length === 0) problems.push(`item ${index} has no image`)
    if (listing.priceExGst === 0) {
      problems.push(
        `item ${index} parsed to a price of zero. If the page says "Pricing coming soon" this must be null, not zero.`,
      )
    }
    if (listing.region === 'Unknown') problems.push(`item ${index} has an unknown region, raw value "${listing.regionRaw}"`)
  }

  console.log(`${normalisedCount} of ${items.length} items normalised.`)
  if (problems.length === 0) {
    console.log('No problems found. Safe to enable this source.')
    return
  }

  const summary = new Map<string, number>()
  for (const problem of problems) {
    const kind = problem.replace(/item \d+ /, '')
    summary.set(kind, (summary.get(kind) ?? 0) + 1)
  }
  console.log('\nProblems:')
  for (const [kind, count] of summary) console.log(`  ${count}x ${kind}`)
  process.exitCode = 1
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
