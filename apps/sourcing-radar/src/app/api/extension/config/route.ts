/**
 * Pacing and kill switch for the Chrome extension.
 *
 * The extension reads this on every cycle, so pacing can be dialled back and
 * the Facebook adapter can be switched off remotely without a re release. The
 * extension itself is Phase 3 work and ships behind this flag.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { serviceClient } from '@/lib/supabase/service'
import { hashToken } from '@/lib/hash'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'device token required' }, { status: 401 })

  const db = serviceClient()
  const { data: device } = await db
    .from('device_tokens')
    .select('id, user_id, revoked_at')
    .eq('token_hash', hashToken(token))
    .maybeSingle()

  if (!device || device.revoked_at) {
    return NextResponse.json({ error: 'device token is not valid' }, { status: 401 })
  }

  await db.from('device_tokens').update({ last_seen_at: new Date().toISOString() }).eq('id', device.id)

  const [{ data: config }, { data: terms }] = await Promise.all([
    db.from('app_config').select('*').maybeSingle(),
    db.from('watch_terms').select('label, keywords, negative_keywords, region').eq('active', true),
  ])

  return NextResponse.json({
    enabled: config?.facebook_adapter_enabled ?? false,
    pacing: {
      minSecondsBetweenSearches: config?.fb_min_seconds_between_searches ?? 90,
      maxSecondsBetweenSearches: config?.fb_max_seconds_between_searches ?? 180,
      maxSearchesPerHour: config?.fb_max_searches_per_hour ?? 20,
      parallelTabs: 1,
    },
    // Read only. The extension never messages a seller and never bids.
    permittedActions: ['read', 'clip'],
    watchTerms: (terms ?? []).map((term: any) => ({
      label: term.label,
      keywords: term.keywords ?? [],
      negativeKeywords: term.negative_keywords ?? [],
      region: term.region,
    })),
  })
}
