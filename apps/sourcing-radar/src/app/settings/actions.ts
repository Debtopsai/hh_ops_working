'use server'

import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { browserSessionClient } from '@/lib/supabase/server'
import { hashToken } from '@/lib/hash'

export async function saveMyAlertSettings(formData: FormData) {
  const supabase = browserSessionClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return

  await supabase
    .from('app_users')
    .update({
      whatsapp_number: String(formData.get('whatsappNumber') ?? '').trim() || null,
      whatsapp_opt_in: formData.get('whatsappOptIn') === 'on',
      email_alerts: formData.get('emailAlerts') === 'on',
      quiet_hours_start: Number(formData.get('quietHoursStart') ?? 21),
      quiet_hours_end: Number(formData.get('quietHoursEnd') ?? 6),
      timezone: String(formData.get('timezone') ?? 'Pacific/Auckland'),
    })
    .eq('id', auth.user.id)

  revalidatePath('/settings')
}

export async function savePacingConfig(formData: FormData) {
  const supabase = browserSessionClient()
  await supabase
    .from('app_config')
    .update({
      home_region: String(formData.get('homeRegion') ?? 'Auckland'),
      facebook_adapter_enabled: formData.get('facebookAdapterEnabled') === 'on',
      fb_min_seconds_between_searches: Number(formData.get('fbMinSeconds') ?? 90),
      fb_max_seconds_between_searches: Number(formData.get('fbMaxSeconds') ?? 180),
      fb_max_searches_per_hour: Number(formData.get('fbMaxPerHour') ?? 20),
      alerts_per_recipient_per_hour: Number(formData.get('alertsPerHour') ?? 6),
      digest_threshold: Number(formData.get('digestThreshold') ?? 5),
      updated_at: new Date().toISOString(),
    })
    .eq('id', true)

  revalidatePath('/settings')
}

/**
 * Device tokens for the Chrome extension. Only the hash is stored, so the token
 * itself is shown exactly once and is revocable from this screen.
 *
 * The plain value is handed back through a cookie that expires in two minutes
 * rather than through the URL, so it never lands in browser history or a server
 * log.
 */
export async function createDeviceToken(formData: FormData) {
  const supabase = browserSessionClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return

  const token = randomBytes(24).toString('base64url')
  await supabase.from('device_tokens').insert({
    user_id: auth.user.id,
    label: String(formData.get('label') ?? 'Chrome extension'),
    token_hash: hashToken(token),
  })

  cookies().set('radar_new_device_token', token, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/settings',
    maxAge: 120,
  })

  revalidatePath('/settings')
}

export async function revokeDeviceToken(formData: FormData) {
  const supabase = browserSessionClient()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await supabase.from('device_tokens').update({ revoked_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/settings')
}
