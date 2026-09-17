/**
 * Scheduled work.
 *
 * Inngest owns the schedule, the retries and the backoff. Two crons and one fan
 * out function is the whole of it:
 *
 *   poll tick      every 5 minutes, asks which sources are due and emits one
 *                  event per source
 *   source run     one source, one run, concurrency of one per source so a slow
 *                  catalogue cannot overlap itself
 *   alert dispatch every 5 minutes, sends whatever the queue says is due
 *
 * A source that throws fails only its own run. The runner has already written
 * the failure to ingestion_runs by the time the error reaches Inngest.
 */

import { inngest } from './client'
import { serviceClient } from '@/lib/supabase/service'
import { SupabaseIngestStore } from '@/ingest/supabase-store'
import { runSource } from '@/ingest/runner'
import { dispatchPendingAlerts } from '@/alerts/dispatch'
import { createPostmarkTransport, createWhatsAppTransport } from '@/alerts/providers'

export const pollTick = inngest.createFunction(
  { id: 'poll-tick' },
  { cron: '*/5 * * * *' },
  async ({ step }) => {
    const due = await step.run('find-due-sources', async () => {
      const db = serviceClient()
      const { data: sources } = await db
        .from('sources')
        .select('slug, poll_interval_seconds')
        .eq('enabled', true)
        .gt('poll_interval_seconds', 0)

      const dueSlugs: string[] = []
      for (const source of sources ?? []) {
        const { data: lastRun } = await db
          .from('ingestion_runs')
          .select('started_at')
          .eq('source_slug', source.slug)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!lastRun) {
          dueSlugs.push(source.slug)
          continue
        }
        const elapsed = Date.now() - new Date(lastRun.started_at).getTime()
        if (elapsed >= source.poll_interval_seconds * 1000) dueSlugs.push(source.slug)
      }
      return dueSlugs
    })

    if (due.length > 0) {
      await step.sendEvent(
        'fan-out',
        due.map((sourceSlug) => ({ name: 'sourcing/source.run', data: { sourceSlug } })),
      )
    }
    return { due }
  },
)

export const sourceRun = inngest.createFunction(
  {
    id: 'source-run',
    // Per source concurrency of one. A run that is still going must not be
    // joined by the next tick's run of the same catalogue.
    concurrency: [{ key: 'event.data.sourceSlug', limit: 1 }],
    retries: 2,
  },
  { event: 'sourcing/source.run' },
  async ({ event, logger }) => {
    const store = new SupabaseIngestStore()
    return runSource({
      store,
      sourceSlug: event.data.sourceSlug,
      logger: (message, detail) => logger.info(message, detail ?? {}),
    })
  },
)

export const alertDispatch = inngest.createFunction(
  { id: 'alert-dispatch', concurrency: [{ limit: 1 }] },
  { cron: '*/5 * * * *' },
  async ({ logger }) => {
    const store = new SupabaseIngestStore()
    return dispatchPendingAlerts({
      store,
      transports: {
        sendWhatsApp: createWhatsAppTransport({
          phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
          accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
          graphVersion: process.env.WHATSAPP_GRAPH_VERSION ?? 'v21.0',
        }),
        sendEmail: createPostmarkTransport({
          serverToken: process.env.POSTMARK_SERVER_TOKEN,
          fromAddress: process.env.ALERT_FROM_EMAIL,
        }),
      },
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      logger: (message, detail) => logger.info(message, detail ?? {}),
    })
  },
)

export const functions = [pollTick, sourceRun, alertDispatch]
