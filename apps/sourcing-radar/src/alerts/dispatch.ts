/**
 * Sending the alerts.
 *
 * WhatsApp is primary, email is always sent as well. A WhatsApp failure is
 * never swallowed: it is written to `alerts` with the provider's error, and if
 * the recipient had email alerts switched off it is sent to them anyway as the
 * fallback, labelled as such.
 *
 * Every send is recorded per recipient per channel, so "the send outcome is
 * recorded per recipient" is a query rather than a belief.
 */

import type { AlertRecipient } from '@/ingest/store'
import { planDispatch, type PendingAlert, type PlannedMessage } from './planner'
import type { AlertTransports } from './providers'
import {
  WHATSAPP_TEMPLATES,
  digestTemplateVariables,
  emailBody,
  emailSubject,
  singleTemplateVariables,
  type AlertListing,
} from './templates'

export interface AlertRecord {
  listingId: string | null
  userId: string
  channel: 'whatsapp' | 'email' | 'web_push'
  kind: 'single' | 'digest'
  listingIds: string[]
  template: string | null
  sentAt: string
  delivered: boolean
  providerId: string | null
  error: string | null
}

export interface AlertStore {
  getDispatchConfig(): Promise<{ digestThreshold: number; alertsPerRecipientPerHour: number }>
  listPendingAlerts(nowIso: string): Promise<PendingAlert[]>
  countAlertsSentInLastHour(nowIso: string): Promise<Record<string, number>>
  getRecipients(userIds: string[]): Promise<AlertRecipient[]>
  getAlertListings(listingIds: string[]): Promise<AlertListing[]>
  markQueueDispatched(queueIds: string[], nowIso: string): Promise<void>
  deferQueueItems(queueIds: string[], deliverAfterIso: string): Promise<void>
  recordAlert(record: AlertRecord): Promise<void>
}

export interface DispatchOptions {
  store: AlertStore
  transports: AlertTransports
  appUrl: string
  now?: () => Date
  logger?: (message: string, detail?: Record<string, unknown>) => void
}

export interface DispatchSummary {
  messagesPlanned: number
  whatsappSent: number
  whatsappFailed: number
  emailsSent: number
  emailsFailed: number
  rolledOver: number
}

const ROLLOVER_MINUTES = 60

export async function dispatchPendingAlerts(options: DispatchOptions): Promise<DispatchSummary> {
  const { store, transports, appUrl, now = () => new Date(), logger = () => {} } = options
  const at = now()
  const nowIso = at.toISOString()

  const summary: DispatchSummary = {
    messagesPlanned: 0,
    whatsappSent: 0,
    whatsappFailed: 0,
    emailsSent: 0,
    emailsFailed: 0,
    rolledOver: 0,
  }

  const pending = await store.listPendingAlerts(nowIso)
  if (pending.length === 0) return summary

  const [config, sentInLastHour] = await Promise.all([
    store.getDispatchConfig(),
    store.countAlertsSentInLastHour(nowIso),
  ])

  const plan = planDispatch(pending, sentInLastHour, config)
  summary.messagesPlanned = plan.messages.length
  summary.rolledOver = plan.rolledOver.length

  if (plan.rolledOver.length > 0) {
    // Over the hourly cap. Rolled into the next digest, never dropped.
    await store.deferQueueItems(
      plan.rolledOver.map((item) => item.id),
      new Date(at.getTime() + ROLLOVER_MINUTES * 60_000).toISOString(),
    )
  }

  const recipients = await store.getRecipients([...new Set(plan.messages.map((m) => m.userId))])
  const recipientById = new Map(recipients.map((r) => [r.userId, r]))

  const allListingIds = [...new Set(plan.messages.flatMap((m) => m.listingIds))]
  const listings = await store.getAlertListings(allListingIds)
  const listingById = new Map(listings.map((l) => [l.id, l]))

  for (const message of plan.messages) {
    const recipient = recipientById.get(message.userId)
    if (!recipient) continue

    const messageListings = message.listingIds
      .map((id) => listingById.get(id))
      .filter((l): l is AlertListing => Boolean(l))
    if (messageListings.length === 0) {
      await store.markQueueDispatched(message.queueIds, nowIso)
      continue
    }

    const whatsappResult = await sendWhatsApp(message, messageListings, recipient, transports, at, appUrl)
    if (whatsappResult) {
      if (whatsappResult.delivered) summary.whatsappSent += 1
      else summary.whatsappFailed += 1

      await store.recordAlert({
        listingId: message.kind === 'single' ? messageListings[0].id : null,
        userId: recipient.userId,
        channel: 'whatsapp',
        kind: message.kind,
        listingIds: message.listingIds,
        template: message.kind === 'single' ? WHATSAPP_TEMPLATES.single.name : WHATSAPP_TEMPLATES.digest.name,
        sentAt: nowIso,
        delivered: whatsappResult.delivered,
        providerId: whatsappResult.providerId,
        error: whatsappResult.error,
      })
    }

    // Email is always sent as well. When WhatsApp failed and this recipient had
    // email switched off, it goes anyway as the fallback.
    const whatsappFailed = whatsappResult !== null && !whatsappResult.delivered
    const shouldEmail = recipient.emailAlerts || whatsappFailed
    if (shouldEmail) {
      const body = emailBody(messageListings, at, `${appUrl}/feed`)
      const emailResult = await transports.sendEmail({
        to: recipient.email,
        subject: whatsappFailed && !recipient.emailAlerts
          ? `[WhatsApp fallback] ${emailSubject(messageListings)}`
          : emailSubject(messageListings),
        text: body.text,
        html: body.html,
      })
      if (emailResult.delivered) summary.emailsSent += 1
      else summary.emailsFailed += 1

      await store.recordAlert({
        listingId: message.kind === 'single' ? messageListings[0].id : null,
        userId: recipient.userId,
        channel: 'email',
        kind: message.kind,
        listingIds: message.listingIds,
        template: null,
        sentAt: nowIso,
        delivered: emailResult.delivered,
        providerId: emailResult.providerId,
        error: emailResult.error,
      })
      if (!emailResult.delivered) {
        logger('email send failed', { userId: recipient.userId, error: emailResult.error })
      }
    }

    // The queue row is closed once the send has been attempted and recorded.
    // Retrying a send is a decision for a person looking at Source health, not
    // an automatic loop that could bill for the same template twice.
    await store.markQueueDispatched(message.queueIds, nowIso)
  }

  return summary
}

async function sendWhatsApp(
  message: PlannedMessage,
  listings: AlertListing[],
  recipient: AlertRecipient,
  transports: AlertTransports,
  at: Date,
  appUrl: string,
) {
  if (!recipient.whatsappOptIn || !recipient.whatsappNumber) return null

  if (message.kind === 'single') {
    const listing = listings[0]
    return transports.sendWhatsApp({
      toNumber: recipient.whatsappNumber,
      templateName: WHATSAPP_TEMPLATES.single.name,
      languageCode: WHATSAPP_TEMPLATES.single.language,
      bodyVariables: singleTemplateVariables(listing, at),
      // The button URL variable is the suffix Meta appends to the approved
      // template's base URL. The link goes to the source, not the dashboard.
      buttonUrlSuffix: listing.url,
    })
  }

  return transports.sendWhatsApp({
    toNumber: recipient.whatsappNumber,
    templateName: WHATSAPP_TEMPLATES.digest.name,
    languageCode: WHATSAPP_TEMPLATES.digest.language,
    bodyVariables: digestTemplateVariables(listings),
    buttonUrlSuffix: `${appUrl}/feed`,
  })
}
