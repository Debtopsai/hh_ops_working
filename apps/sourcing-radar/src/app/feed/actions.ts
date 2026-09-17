'use server'

import { revalidatePath } from 'next/cache'
import { browserSessionClient } from '@/lib/supabase/server'

/**
 * Triage. Every state change records who made it and when, and the other two
 * seats see it immediately. That shared triage is the reason the feed is multi
 * user at all: three people must not chase the same machine.
 */
export async function setListingState(formData: FormData) {
  const listingId = String(formData.get('listingId') ?? '')
  const state = String(formData.get('state') ?? '')
  const note = formData.get('note')

  if (!listingId || !['new', 'watching', 'dismissed', 'bought'].includes(state)) return

  const supabase = browserSessionClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return

  await supabase.from('listing_states').upsert(
    {
      listing_id: listingId,
      user_id: auth.user.id,
      state,
      ...(note === null ? {} : { note: String(note) }),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'listing_id,user_id' },
  )

  revalidatePath('/feed')
}
