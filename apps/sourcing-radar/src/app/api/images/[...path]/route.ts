/**
 * Serves a cached listing image out of Supabase storage.
 *
 * Source URLs expire, so the feed never points at them directly once an image
 * has been cached.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { serviceClient } from '@/lib/supabase/service'
import { LISTING_IMAGE_BUCKET } from '@/ingest/images'

export async function GET(_request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/')
  if (!path || path.includes('..')) return new NextResponse('not found', { status: 404 })

  const { data, error } = await serviceClient().storage.from(LISTING_IMAGE_BUCKET).download(path)
  if (error || !data) return new NextResponse('not found', { status: 404 })

  return new NextResponse(data, {
    headers: {
      'content-type': data.type || 'image/jpeg',
      'cache-control': 'public, max-age=86400, immutable',
    },
  })
}
