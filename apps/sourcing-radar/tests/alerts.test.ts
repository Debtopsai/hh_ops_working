import { beforeEach, describe, expect, it } from 'vitest'
import { runSource } from '@/ingest/runner'
import { dispatchPendingAlerts } from '@/alerts/dispatch'
import type { AlertTransports, SendResult, WhatsAppMessage } from '@/alerts/providers'
import { localParts } from '@/alerts/quiet-hours'
import { resetRateLimiterForTests } from '@/lib/http'
import { WHATSAPP_TEMPLATES } from '@/alerts/templates'
import { MemoryStore } from './support/memory-store'
import { jsonFetch, noSleep, recipient, syntheticAuctionSource, watchTerm } from './support/fixtures'

const APP_URL = 'https://radar.washpro.co.nz'

function recordingTransports(overrides: Partial<AlertTransports> = {}) {
  const whatsapp: WhatsAppMessage[] = []
  const emails: Array<{ to: string; subject: string }> = []
  const transports: AlertTransports = {
    async sendWhatsApp(message) {
      whatsapp.push(message)
      return { delivered: true, providerId: `wamid.${whatsapp.length}`, error: null } satisfies SendResult
    },
    async sendEmail(message) {
      emails.push({ to: message.to, subject: message.subject })
      return { delivered: true, providerId: `pm.${emails.length}`, error: null } satisfies SendResult
    },
    ...overrides,
  }
  return { transports, whatsapp, emails }
}

/** A catalogue of `count` distinct catering lots, all matching the Rational term. */
function catalogueOf(count: number): string {
  return JSON.stringify({
    result: {
      lots: Array.from({ length: count }, (_, index) => ({
        lotId: `AAA-2${index}`,
        lotNumber: String(index),
        name: `Rational combi oven number ${index}`,
        details: 'Ex restaurant',
        currentBid: '$5,750.00 incl GST',
        images: [],
        auction: { title: 'Catering, September', closes: '2026-09-24T19:00:00+12:00' },
        location: 'Penrose, Auckland',
        viewing: 'Thursday',
        detailUrl: `/lot/2${index}`,
      })),
    },
  })
}

function storeWithRecipients() {
  const store = new MemoryStore()
  store.sources = [syntheticAuctionSource()]
  store.terms = [watchTerm({ id: 'rational', label: 'Rational', keywords: ['rational'] })]
  store.recipients = [
    recipient({ userId: 'founder', email: 'founder@washpro.co.nz', whatsappNumber: '+6421000001' }),
    recipient({ userId: 'support1', email: 'one@washpro.co.nz', whatsappNumber: '+6421000002' }),
    recipient({ userId: 'support2', email: 'two@washpro.co.nz', whatsappNumber: '+6421000003' }),
  ]
  return store
}

/** 2pm Auckland, outside quiet hours. */
const daytime = () => new Date('2026-09-18T02:00:00Z')
/** 10pm Auckland, inside quiet hours. */
const lateEvening = () => new Date('2026-09-18T10:00:00Z')

beforeEach(() => resetRateLimiterForTests())

describe('one lot, three recipients', () => {
  it('sends an approved WhatsApp template plus email to all three, and records each outcome', async () => {
    const store = storeWithRecipients()
    const { transports, whatsapp, emails } = recordingTransports()

    await runSource({
      store,
      sourceSlug: 'all_about_auctions',
      fetchImpl: jsonFetch(catalogueOf(1)),
      sleepImpl: noSleep,
      now: daytime,
    })
    const summary = await dispatchPendingAlerts({ store, transports, appUrl: APP_URL, now: daytime })

    expect(summary.whatsappSent).toBe(3)
    expect(summary.emailsSent).toBe(3)
    expect(whatsapp.every((message) => message.templateName === WHATSAPP_TEMPLATES.single.name)).toBe(true)
    expect(new Set(whatsapp.map((message) => message.toNumber)).size).toBe(3)
    expect(new Set(emails.map((email) => email.to)).size).toBe(3)

    // The link goes to the source, not to the dashboard.
    expect(whatsapp[0].buttonUrlSuffix).toBe('https://auctions.example.test/lot/20')

    // Price reaches the template ex GST and labelled.
    expect(whatsapp[0].bodyVariables[1]).toBe('$5,000 + GST')

    const perRecipient = store.alerts.filter((alert) => alert.userId === 'founder')
    expect(perRecipient.map((alert) => alert.channel).sort()).toEqual(['email', 'whatsapp'])
    expect(perRecipient.every((alert) => alert.delivered)).toBe(true)
  })

  it('fires once, even when the dispatcher runs again', async () => {
    const store = storeWithRecipients()
    const { transports, whatsapp } = recordingTransports()

    await runSource({
      store,
      sourceSlug: 'all_about_auctions',
      fetchImpl: jsonFetch(catalogueOf(1)),
      sleepImpl: noSleep,
      now: daytime,
    })
    await dispatchPendingAlerts({ store, transports, appUrl: APP_URL, now: daytime })
    await dispatchPendingAlerts({ store, transports, appUrl: APP_URL, now: daytime })

    expect(whatsapp).toHaveLength(3)
  })
})

describe('a WhatsApp failure', () => {
  it('falls back to email rather than being lost, and records the provider error', async () => {
    const store = storeWithRecipients()
    // This recipient has email alerts switched off, so the fallback is the only
    // thing that stops the alert disappearing.
    store.recipients = [
      recipient({ userId: 'founder', email: 'founder@washpro.co.nz', emailAlerts: false }),
    ]
    const { transports, emails } = recordingTransports({
      async sendWhatsApp() {
        return { delivered: false, providerId: null, error: 'template not approved' }
      },
    })

    await runSource({
      store,
      sourceSlug: 'all_about_auctions',
      fetchImpl: jsonFetch(catalogueOf(1)),
      sleepImpl: noSleep,
      now: daytime,
    })
    const summary = await dispatchPendingAlerts({ store, transports, appUrl: APP_URL, now: daytime })

    expect(summary.whatsappFailed).toBe(1)
    expect(summary.emailsSent).toBe(1)
    expect(emails[0].subject).toContain('WhatsApp fallback')

    const failed = store.alerts.find((alert) => alert.channel === 'whatsapp')!
    expect(failed.delivered).toBe(false)
    expect(failed.error).toBe('template not approved')
  })
})

describe('six matches from one run', () => {
  it('arrive as one digest each, not six messages', async () => {
    const store = storeWithRecipients()
    const { transports, whatsapp, emails } = recordingTransports()

    await runSource({
      store,
      sourceSlug: 'all_about_auctions',
      fetchImpl: jsonFetch(catalogueOf(6)),
      sleepImpl: noSleep,
      now: daytime,
    })
    await dispatchPendingAlerts({ store, transports, appUrl: APP_URL, now: daytime })

    expect(whatsapp).toHaveLength(3)
    expect(whatsapp.every((message) => message.templateName === WHATSAPP_TEMPLATES.digest.name)).toBe(true)
    expect(whatsapp[0].bodyVariables[0]).toBe('6')
    expect(emails).toHaveLength(3)
  })
})

describe('an alert raised inside quiet hours', () => {
  it('is held for the 6am delivery and not sent before it', async () => {
    const store = storeWithRecipients()
    const { transports, whatsapp } = recordingTransports()

    await runSource({
      store,
      sourceSlug: 'all_about_auctions',
      fetchImpl: jsonFetch(catalogueOf(2)),
      sleepImpl: noSleep,
      now: lateEvening,
    })

    expect(store.queue.every((row) => row.reason === 'quiet_hours')).toBe(true)
    expect(localParts(new Date(store.queue[0].deliverAfter), 'Pacific/Auckland').hour).toBe(6)

    // Midnight: nothing goes out.
    const midnight = new Date('2026-09-18T12:00:00Z')
    const held = await dispatchPendingAlerts({ store, transports, appUrl: APP_URL, now: () => midnight })
    expect(held.messagesPlanned).toBe(0)
    expect(whatsapp).toHaveLength(0)

    // 6am: the overnight queue arrives together.
    const sixAm = new Date('2026-09-18T18:00:00Z')
    expect(localParts(sixAm, 'Pacific/Auckland').hour).toBe(6)
    const delivered = await dispatchPendingAlerts({ store, transports, appUrl: APP_URL, now: () => sixAm })

    expect(delivered.whatsappSent).toBe(3)
    expect(whatsapp.every((message) => message.templateName === WHATSAPP_TEMPLATES.digest.name)).toBe(true)
  })
})

describe('the hourly cap', () => {
  it('rolls the excess into the next dispatch instead of dropping it', async () => {
    const store = storeWithRecipients()
    store.recipients = [recipient({ userId: 'founder', email: 'founder@washpro.co.nz' })]
    store.dispatchConfig = { digestThreshold: 5, alertsPerRecipientPerHour: 2 }
    const { transports, whatsapp } = recordingTransports()

    // Four separate runs, so each is its own batch of one and none of them digest.
    for (let index = 0; index < 4; index += 1) {
      await runSource({
        store,
        sourceSlug: 'all_about_auctions',
        fetchImpl: jsonFetch(
          JSON.stringify({
            result: {
              lots: [
                {
                  lotId: `AAA-3${index}`,
                  lotNumber: String(index),
                  name: `Rational combi ${index}`,
                  details: '',
                  currentBid: '$1,150.00 incl GST',
                  images: [],
                  auction: { title: 'Catering', closes: '2026-09-24T19:00:00+12:00' },
                  location: 'Auckland',
                  viewing: '',
                  detailUrl: `/lot/3${index}`,
                },
              ],
            },
          }),
        ),
        sleepImpl: noSleep,
        now: daytime,
      })
    }

    const summary = await dispatchPendingAlerts({ store, transports, appUrl: APP_URL, now: daytime })
    expect(whatsapp).toHaveLength(2)
    expect(summary.rolledOver).toBe(2)
    expect(store.queue.filter((row) => row.dispatchedAt === null)).toHaveLength(2)
  })
})
