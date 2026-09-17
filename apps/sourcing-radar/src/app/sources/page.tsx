import { browserSessionClient } from '@/lib/supabase/server'
import {
  isPreviewMode,
  PREVIEW_HEALTH_ALERTS,
  PREVIEW_LISTINGS_LAST_24H,
  PREVIEW_RUNS,
  PREVIEW_SOURCES,
} from '@/lib/preview'

/**
 * Source health.
 *
 * This is where a silently broken adapter becomes visible, which is the whole
 * reason every run writes a row whether it succeeded or not. A source whose
 * endpoints have not been discovered yet shows as "not configured" with what is
 * missing, rather than looking like a source that found nothing.
 */

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  ok: 'ok',
  error: 'error',
  not_configured: 'not configured',
  running: 'running',
  skipped: 'skipped',
  no_runs_yet: 'no runs yet',
  not_built: 'not built yet',
}

/**
 * What is standing between a source and listings. The four cases need different
 * responses from whoever is looking at this screen, so they are not collapsed
 * into one "not configured".
 */
function setupState(source: any): { status: string; note: string | null } {
  if (source.adapter_type === 'manual_clip') {
    return { status: 'no_runs_yet', note: 'Clips are pushed in from the feed and from the extension. There is nothing to poll and nothing to configure.' }
  }
  if (source.adapter_type === 'email_inbound') {
    return { status: 'not_built', note: 'Phase 2 work. The inbound webhook and the alert email parser are not built yet.' }
  }
  if (source.adapter_type === 'extension') {
    return { status: 'not_built', note: 'Phase 3 work. The Chrome extension is not built yet, and the adapter stays off behind the kill switch in Settings until it is.' }
  }
  const configured = source.config?.discovered === true
  if (!configured) {
    return {
      status: 'not_configured',
      note: "Endpoints and field mappings have not been discovered yet. Follow docs/DISCOVERY.md and write the result into this source's config.",
    }
  }
  return { status: 'no_runs_yet', note: null }
}

export default async function SourcesPage() {
  if (isPreviewMode()) {
    return renderSourceHealth({
      sources: PREVIEW_SOURCES,
      runs: PREVIEW_RUNS,
      health: PREVIEW_HEALTH_ALERTS,
      listingsLast24h: PREVIEW_LISTINGS_LAST_24H,
    })
  }

  const supabase = browserSessionClient()
  const dayAgo = new Date(Date.now() - 86400_000).toISOString()

  const [{ data: sources }, { data: runs }, { data: health }, { data: recentListings }] = await Promise.all([
    supabase.from('sources').select('*').order('name'),
    supabase
      .from('ingestion_runs')
      .select('source_slug, started_at, finished_at, status, listings_seen, listings_new, error, detail')
      .order('started_at', { ascending: false })
      .limit(300),
    supabase.from('source_health_alerts').select('*').is('cleared_at', null).order('raised_at', { ascending: false }),
    supabase.from('listings').select('source_slug').gte('first_seen_at', dayAgo).limit(5000),
  ])

  const listingsLast24h: Record<string, number> = {}
  for (const row of recentListings ?? []) {
    listingsLast24h[row.source_slug] = (listingsLast24h[row.source_slug] ?? 0) + 1
  }

  return renderSourceHealth({
    sources: sources ?? [],
    runs: runs ?? [],
    health: health ?? [],
    listingsLast24h,
  })
}

interface SourceHealthView {
  sources: any[]
  runs: any[]
  health: any[]
  listingsLast24h: Record<string, number>
}

function renderSourceHealth({ sources, runs, health, listingsLast24h }: SourceHealthView) {
  const latestBySource = new Map<string, any>()
  const lastOkBySource = new Map<string, any>()
  for (const run of runs) {
    if (!latestBySource.has(run.source_slug)) latestBySource.set(run.source_slug, run)
    if (run.status === 'ok' && !lastOkBySource.has(run.source_slug)) lastOkBySource.set(run.source_slug, run)
  }
  const openHealth = health

  return (
    <>
      <h1>Source health</h1>
      <p className="subtitle">One row per channel. A blank last successful run is the thing to act on.</p>

      {openHealth.length > 0 ? (
        <div className="notice">
          {openHealth.length} open adapter health alert{openHealth.length === 1 ? '' : 's'}:{' '}
          {openHealth.map((alert: any) => `${alert.source_slug} (${alert.reason})`).join('; ')}
        </div>
      ) : null}

      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Enabled</th>
            <th>Status</th>
            <th>Last run</th>
            <th>Last successful run</th>
            <th>Listings, last 24 h</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source: any) => {
            const latest = latestBySource.get(source.slug)
            const lastOk = lastOkBySource.get(source.slug)
            const setup = setupState(source)
            const status = latest?.status ?? setup.status

            return (
              <tr key={source.slug}>
                <td>
                  <strong>{source.name}</strong>
                  <div className="footnote" style={{ marginTop: 2 }}>
                    {source.adapter_type}
                    {source.poll_interval_seconds > 0
                      ? `, every ${Math.round(source.poll_interval_seconds / 60)} min`
                      : ', pushed in'}
                  </div>
                </td>
                <td>{source.enabled ? 'yes' : 'no'}</td>
                <td>
                  <span
                    className={`badge ${status === 'ok' ? 'ok' : status === 'error' ? 'bad' : ''}`}
                  >
                    {STATUS_LABEL[status] ?? status}
                  </span>
                </td>
                <td>{latest ? formatWhen(latest.started_at) : 'never'}</td>
                <td>{lastOk ? formatWhen(lastOk.started_at) : 'never'}</td>
                <td>{listingsLast24h[source.slug] ?? 0}</td>
                <td style={{ maxWidth: 380 }}>
                  {latest?.error ? <span style={{ color: 'var(--bad)' }}>{latest.error}</span> : null}
                  {!latest?.error && latest ? (
                    <span className="footnote">
                      {latest.listings_seen} seen, {latest.listings_new} new
                    </span>
                  ) : null}
                  {setup.note ? <div className="footnote">{setup.note}</div> : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="footnote">
        The Facebook Marketplace extension reports its own check in here once Phase 3 ships. Until then it is off
        behind a flag, so the most fragile adapter cannot destabilise the launch.
      </p>
    </>
  )
}

function formatWhen(iso: string | null): string {
  if (!iso) return 'never'
  const date = new Date(iso)
  const minutes = Math.round((Date.now() - date.getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`
  return date.toLocaleDateString('en-NZ')
}
