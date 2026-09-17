/**
 * Image caching and perceptual hashing.
 *
 * Source image URLs expire, particularly on Facebook, and a feed of broken
 * images is a dead feed. So the first image of every new listing is copied into
 * Supabase storage on first sight and served from there.
 *
 * The same pass computes a difference hash, which is one of the three signals
 * in cross source duplicate detection. Doing it here means it costs one decode
 * that we were paying for anyway.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { politeFetch } from '@/lib/http'
import { dHashFromGreyscale9x8 } from '@/lib/hash'

export const LISTING_IMAGE_BUCKET = 'listing-images'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export interface CacheImageResult {
  cachedPath: string | null
  phash: string | null
  error: string | null
}

/**
 * Fetch, hash and store one image. Never throws: a listing with a broken image
 * is still a listing worth seeing, so failures are returned rather than raised.
 */
export async function cacheListingImage(
  db: SupabaseClient,
  listingId: string,
  imageUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<CacheImageResult> {
  try {
    const response = await politeFetch(imageUrl, { fetchImpl, retries: 1, timeoutMs: 15_000 })
    if (!response.ok) return { cachedPath: null, phash: null, error: `HTTP ${response.status}` }

    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.byteLength === 0) return { cachedPath: null, phash: null, error: 'empty body' }
    if (buffer.byteLength > MAX_IMAGE_BYTES) return { cachedPath: null, phash: null, error: 'image too large' }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const path = `${listingId}.${extension}`

    const { error: uploadError } = await db.storage
      .from(LISTING_IMAGE_BUCKET)
      .upload(path, buffer, { contentType, upsert: true })
    if (uploadError) return { cachedPath: null, phash: null, error: uploadError.message }

    const phash = await perceptualHash(buffer)

    await db.from('listings').update({ cached_image_path: path, image_phash: phash }).eq('id', listingId)
    return { cachedPath: path, phash, error: null }
  } catch (error) {
    return { cachedPath: null, phash: null, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Difference hash over a 9x8 greyscale thumbnail. sharp is imported lazily so
 * the pure modules stay importable in a test runner without a native build.
 */
export async function perceptualHash(buffer: Buffer): Promise<string | null> {
  try {
    const { default: sharp } = await import('sharp')
    const raw = await sharp(buffer).greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer()
    return dHashFromGreyscale9x8(new Uint8Array(raw))
  } catch {
    return null
  }
}
