/**
 * Seed the brand list from the live Washpro catalogue.
 *
 * The PRD's brand list is a seed, not the authority. The authority is the
 * Shopify vendor field on washpro.co.nz, so this script reads it once at setup
 * and writes what it finds, rather than trusting a list in a document to stay
 * complete.
 *
 * It reads the standard Shopify storefront products feed. That path is a
 * Shopify platform convention rather than something observed on this store, so
 * the script checks it and fails with a clear message if the store does not
 * serve it, instead of writing nothing and looking like it worked.
 *
 *   npm run seed:brands
 */

import { createClient } from '@supabase/supabase-js'

const STORE = process.env.WASHPRO_STORE_URL ?? 'https://washpro.co.nz'
const PRODUCTS_PATH = '/products.json?limit=250&page='

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')

  const vendors = new Set<string>()
  for (let page = 1; page <= 20; page += 1) {
    const response = await fetch(`${STORE}${PRODUCTS_PATH}${page}`, {
      headers: { accept: 'application/json' },
    })
    if (!response.ok) {
      throw new Error(
        `${STORE}${PRODUCTS_PATH}${page} returned HTTP ${response.status}. ` +
          'If this store does not serve the standard Shopify products feed, export the vendor list from Shopify ' +
          'admin instead and load it with a one off insert. Do not fall back to the PRD list and call it authoritative.',
      )
    }
    const payload = (await response.json()) as { products?: Array<{ vendor?: string }> }
    const products = payload.products ?? []
    if (products.length === 0) break
    for (const product of products) {
      const vendor = product.vendor?.trim()
      if (vendor) vendors.add(vendor)
    }
  }

  if (vendors.size === 0) throw new Error('No vendors found. Nothing written.')

  const db = createClient(url, key, { auth: { persistSession: false } })
  const { error } = await db.from('brands').upsert(
    [...vendors].map((name) => ({
      name,
      source_note: `Shopify vendor field on ${STORE}, read ${new Date().toISOString().slice(0, 10)}`,
      active: true,
    })),
    { onConflict: 'name' },
  )
  if (error) throw new Error(error.message)

  console.log(`Wrote ${vendors.size} brands from the Shopify vendor field.`)
  console.log([...vendors].sort().join(', '))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
