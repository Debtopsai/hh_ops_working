import { cookies } from 'next/headers'
import { browserSessionClient } from '@/lib/supabase/server'
import { NZ_REGIONS } from '@/lib/region'
import { WHATSAPP_TEMPLATES, WHATSAPP_TEMPLATE_RATE_NZD } from '@/alerts/templates'
import { OPEN_ITEMS } from '@/lib/open-items'
import {
  isPreviewMode,
  PREVIEW_CONFIG,
  PREVIEW_DEVICE_TOKENS,
  PREVIEW_ME,
  PREVIEW_USERS,
} from '@/lib/preview'
import { createDeviceToken, revokeDeviceToken, savePacingConfig, saveMyAlertSettings } from './actions'

export const dynamic = 'force-dynamic'

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

export default async function SettingsPage() {
  if (isPreviewMode()) {
    return renderSettings({
      me: PREVIEW_ME,
      config: PREVIEW_CONFIG,
      users: PREVIEW_USERS,
      tokens: PREVIEW_DEVICE_TOKENS,
      isAdmin: true,
      newDeviceToken: null,
    })
  }

  const supabase = browserSessionClient()
  const { data: auth } = await supabase.auth.getUser()

  const [{ data: me }, { data: config }, { data: users }, { data: tokens }] = await Promise.all([
    auth.user
      ? supabase.from('app_users').select('*').eq('id', auth.user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('app_config').select('*').maybeSingle(),
    supabase.from('app_users').select('id, email, display_name, role, whatsapp_opt_in, email_alerts').order('email'),
    supabase.from('device_tokens').select('*').is('revoked_at', null).order('created_at'),
  ])

  return renderSettings({
    me,
    config,
    users: users ?? [],
    tokens: tokens ?? [],
    isAdmin: me?.role === 'admin',
    newDeviceToken: cookies().get('radar_new_device_token')?.value ?? null,
  })
}

interface SettingsView {
  me: any
  config: any
  users: any[]
  tokens: any[]
  isAdmin: boolean
  newDeviceToken: string | null
}

function renderSettings({ me, config, users, tokens, isAdmin, newDeviceToken }: SettingsView) {
  return (
    <>
      <h1>Settings</h1>
      <p className="subtitle">Alert routing, quiet hours, seats, extension tokens and the server side pacing config.</p>

      <div className="panel">
        <h2 style={{ fontSize: 17, marginTop: 0 }}>My alerts</h2>
        <p className="subtitle">
          WhatsApp is the primary channel and email is always sent as well, as the audit trail and the fallback. The
          Cloud API cannot post to a group, so each recipient is their own thread with their own opt in.
        </p>
        <form action={saveMyAlertSettings} className="stack">
          <div className="row">
            <label className="field">
              WhatsApp number
              <input name="whatsappNumber" defaultValue={me?.whatsapp_number ?? ''} placeholder="+64..." />
            </label>
            <label className="row" style={{ gap: 6 }}>
              <input type="checkbox" name="whatsappOptIn" defaultChecked={me?.whatsapp_opt_in ?? false} />
              WhatsApp opt in
            </label>
            <label className="row" style={{ gap: 6 }}>
              <input type="checkbox" name="emailAlerts" defaultChecked={me?.email_alerts ?? true} />
              Email alerts
            </label>
          </div>
          <div className="row">
            <label className="field">
              Quiet hours start
              <select name="quietHoursStart" defaultValue={String(me?.quiet_hours_start ?? 21)}>
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>{`${String(hour).padStart(2, '0')}:00`}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Quiet hours end
              <select name="quietHoursEnd" defaultValue={String(me?.quiet_hours_end ?? 6)}>
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>{`${String(hour).padStart(2, '0')}:00`}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Timezone
              <input name="timezone" defaultValue={me?.timezone ?? 'Pacific/Auckland'} />
            </label>
          </div>
          <div>
            <button className="primary" type="submit">Save my alerts</button>
          </div>
        </form>
        <p className="footnote">
          Alerts raised inside quiet hours queue and arrive together at the end of them. They are never dropped.
        </p>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: 17, marginTop: 0 }}>WhatsApp templates</h2>
        <p className="subtitle">
          Every alert is business initiated, so each one goes out as a pre approved template. Submit both for
          approval on day one: it is a wait, not work, and it blocks acceptance if it is left until the code is done.
        </p>
        <table>
          <thead>
            <tr>
              <th>Template</th>
              <th>Variables</th>
              <th>Button</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{WHATSAPP_TEMPLATES.single.name}</td>
              <td>{WHATSAPP_TEMPLATES.single.bodyVariables.join(', ')}</td>
              <td>dynamic URL, the listing link</td>
            </tr>
            <tr>
              <td>{WHATSAPP_TEMPLATES.digest.name}</td>
              <td>{WHATSAPP_TEMPLATES.digest.bodyVariables.join(', ')}</td>
              <td>dynamic URL, the feed link</td>
            </tr>
          </tbody>
        </table>
        <p className="footnote">
          Per message cost:{' '}
          {WHATSAPP_TEMPLATE_RATE_NZD === null
            ? 'the NZ utility template rate is still to be verified against Meta published pricing. It is deliberately not estimated here.'
            : `$${WHATSAPP_TEMPLATE_RATE_NZD} per message`}
        </p>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: 17, marginTop: 0 }}>Seats</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>WhatsApp</th>
              <th>Email alerts</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.display_name ?? '-'}</td>
                <td>{user.role}</td>
                <td>{user.whatsapp_opt_in ? 'opted in' : 'off'}</td>
                <td>{user.email_alerts ? 'on' : 'off'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="footnote">
          Three seats, one admin and two viewers. Users are invited by the admin in Supabase Auth; there is no self
          registration.
        </p>
      </div>

      {isAdmin ? (
        <div className="panel">
          <h2 style={{ fontSize: 17, marginTop: 0 }}>Pacing and limits</h2>
          <p className="subtitle">
            Server controlled, so the extension can be dialled back or switched off without a re release. The
            extension reads these values on every cycle.
          </p>
          <form action={savePacingConfig} className="stack">
            <div className="row">
              <label className="field">
                Home region
                <select name="homeRegion" defaultValue={config?.home_region ?? 'Auckland'}>
                  {NZ_REGIONS.filter((region) => region !== 'Unknown').map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Digest threshold
                <input name="digestThreshold" type="number" min={1} defaultValue={config?.digest_threshold ?? 5} />
              </label>
              <label className="field">
                Alerts per recipient per hour
                <input name="alertsPerHour" type="number" min={1} defaultValue={config?.alerts_per_recipient_per_hour ?? 6} />
              </label>
            </div>
            <div className="row">
              <label className="row" style={{ gap: 6 }}>
                <input type="checkbox" name="facebookAdapterEnabled" defaultChecked={config?.facebook_adapter_enabled ?? false} />
                Facebook adapter enabled (kill switch)
              </label>
              <label className="field">
                Min seconds between searches
                <input name="fbMinSeconds" type="number" min={30} defaultValue={config?.fb_min_seconds_between_searches ?? 90} />
              </label>
              <label className="field">
                Max seconds between searches
                <input name="fbMaxSeconds" type="number" min={30} defaultValue={config?.fb_max_seconds_between_searches ?? 180} />
              </label>
              <label className="field">
                Max searches per hour
                <input name="fbMaxPerHour" type="number" min={1} defaultValue={config?.fb_max_searches_per_hour ?? 20} />
              </label>
            </div>
            <div>
              <button className="primary" type="submit">Save config</button>
            </div>
          </form>
          <p className="footnote">
            Facebook Marketplace collection covers only the hours the laptop is on and Chrome is open, so overnight
            listings arrive on the next morning's first run. Facebook changes its page structure without notice, and
            automated collection breaches its terms of service even in your own session. The pacing rules manage that
            exposure, they do not remove it.
          </p>
        </div>
      ) : null}

      {isAdmin ? (
        <div className="panel">
          <h2 style={{ fontSize: 17, marginTop: 0 }}>Extension device tokens</h2>
          <table>
            <thead>
              <tr>
                <th>Label</th>
                <th>Last check in</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tokens.map((token: any) => (
                <tr key={token.id}>
                  <td>{token.label}</td>
                  <td>{token.last_seen_at ? new Date(token.last_seen_at).toLocaleString('en-NZ') : 'never'}</td>
                  <td>{new Date(token.created_at).toLocaleDateString('en-NZ')}</td>
                  <td>
                    <form action={revokeDeviceToken}>
                      <input type="hidden" name="id" value={token.id} />
                      <button type="submit">Revoke</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {newDeviceToken ? (
            <p className="notice" style={{ marginTop: 12, wordBreak: 'break-all' }}>
              New token, copy it now: <strong>{newDeviceToken}</strong>. It is shown once and this message clears in
              two minutes.
            </p>
          ) : null}
          <form action={createDeviceToken} className="row" style={{ marginTop: 12 }}>
            <input name="label" placeholder="Founder laptop" />
            <button type="submit">Issue token</button>
          </form>
          <p className="footnote">Only the hash is stored. A token is shown once and is revocable from here.</p>
        </div>
      ) : null}

      <div className="panel">
        <h2 style={{ fontSize: 17, marginTop: 0 }}>Open items</h2>
        <p className="subtitle">
          Answers still needed. These are surfaced rather than filled with a plausible default, because a made up
          number here quietly becomes a decision later.
        </p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Needed for</th>
              <th>Who answers</th>
            </tr>
          </thead>
          <tbody>
            {OPEN_ITEMS.map((item) => (
              <tr key={item.item}>
                <td>{item.item}</td>
                <td>{item.neededFor}</td>
                <td>{item.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
