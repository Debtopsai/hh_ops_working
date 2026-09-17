/**
 * Manual clip capture.
 *
 * Anything the founder finds by hand lands in the same feed, so it is matched,
 * deduped and triaged like everything else. In Phase 3 the extension's clip
 * button posts here too, authenticated with a device token.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { SupabaseIngestStore } from '@/ingest/supabase-store'
import { runSource } from '@/ingest/runner'
import { browserSessionClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = browserSessionClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'not signed in' }, { status: 401 })

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'expected a JSON body' }, { status: 400 })
  }

  if (!payload.url || !payload.title) {
    return NextResponse.json({ error: 'url and title are required' }, { status: 400 })
  }

  const result = await runSource({
    store: new SupabaseIngestStore(),
    sourceSlug: 'manual_clip',
    pushedItems: [payload],
  })

  return NextResponse.json(result, { status: result.status === 'ok' ? 200 : 500 })
}
