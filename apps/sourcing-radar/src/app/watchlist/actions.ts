'use server'

import { revalidatePath } from 'next/cache'
import { browserSessionClient } from '@/lib/supabase/server'
import { isPreviewMode } from '@/lib/preview'

/**
 * The buying profile is configuration, not code, and the founder edits it
 * without a developer. RLS keeps these writes to the admin seat; the checks
 * here are for a clear message, not for security.
 */

function parseList(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export async function saveWatchTerm(formData: FormData) {
  if (isPreviewMode()) return
  const supabase = browserSessionClient()
  const id = String(formData.get('id') ?? '')
  const maxPrice = String(formData.get('maxPriceExGst') ?? '').trim()

  const payload = {
    label: String(formData.get('label') ?? '').trim(),
    keywords: parseList(formData.get('keywords')),
    negative_keywords: parseList(formData.get('negativeKeywords')),
    category: String(formData.get('category') ?? '').trim() || null,
    // Left null when blank. A guessed ceiling would silently downrank real machines.
    max_price_ex_gst: maxPrice ? Number(maxPrice) : null,
    region: String(formData.get('region') ?? '').trim() || null,
    source_slugs: formData.getAll('sourceSlugs').map(String),
    active: formData.get('active') === 'on',
    updated_at: new Date().toISOString(),
  }

  if (!payload.label || payload.keywords.length === 0) return

  if (id) await supabase.from('watch_terms').update(payload).eq('id', id)
  else await supabase.from('watch_terms').insert(payload)

  revalidatePath('/watchlist')
}

export async function toggleWatchTerm(formData: FormData) {
  if (isPreviewMode()) return
  const supabase = browserSessionClient()
  const id = String(formData.get('id') ?? '')
  const active = formData.get('active') === 'true'
  if (!id) return
  await supabase.from('watch_terms').update({ active, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/watchlist')
}

export async function addNegativeKeyword(formData: FormData) {
  if (isPreviewMode()) return
  const supabase = browserSessionClient()
  const keyword = String(formData.get('keyword') ?? '').trim().toLowerCase()
  if (!keyword) return
  await supabase.from('global_negative_keywords').insert({ keyword })
  revalidatePath('/watchlist')
}

export async function removeNegativeKeyword(formData: FormData) {
  if (isPreviewMode()) return
  const supabase = browserSessionClient()
  const keyword = String(formData.get('keyword') ?? '')
  if (!keyword) return
  await supabase.from('global_negative_keywords').delete().eq('keyword', keyword)
  revalidatePath('/watchlist')
}
