/**
 * Alert transports.
 *
 * WhatsApp is the primary channel and email is always sent as well, as the
 * audit trail and the fallback. Both are behind a small interface so a send can
 * be driven in a test and so swapping Meta direct for a business solution
 * provider such as Twilio does not reach any further than this file.
 */

import { politeFetch } from '@/lib/http'

export interface SendResult {
  delivered: boolean
  providerId: string | null
  error: string | null
}

export interface WhatsAppMessage {
  toNumber: string
  templateName: string
  languageCode: string
  bodyVariables: string[]
  buttonUrlSuffix?: string
}

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
}

export interface AlertTransports {
  sendWhatsApp(message: WhatsAppMessage): Promise<SendResult>
  sendEmail(message: EmailMessage): Promise<SendResult>
}

export interface WhatsAppEnv {
  phoneNumberId: string
  accessToken: string
  /** Graph API version, kept in config so a version bump is not a code change. */
  graphVersion: string
  apiBase?: string
}

/**
 * WhatsApp Business Platform Cloud API.
 *
 * A dedicated phone number is required, one not already registered to a
 * personal WhatsApp account. That number is an open item on the founder, and
 * until it is supplied WHATSAPP_PHONE_NUMBER_ID is unset and this transport
 * reports "not configured" rather than silently doing nothing.
 */
export function createWhatsAppTransport(env: Partial<WhatsAppEnv>, fetchImpl: typeof fetch = fetch) {
  return async function sendWhatsApp(message: WhatsAppMessage): Promise<SendResult> {
    if (!env.phoneNumberId || !env.accessToken) {
      return { delivered: false, providerId: null, error: 'WhatsApp is not configured: no dedicated number or access token yet' }
    }
    const base = env.apiBase ?? 'https://graph.facebook.com'
    const version = env.graphVersion ?? 'v21.0'
    const url = `${base}/${version}/${env.phoneNumberId}/messages`

    const components: Array<Record<string, unknown>> = [
      {
        type: 'body',
        parameters: message.bodyVariables.map((text) => ({ type: 'text', text })),
      },
    ]
    if (message.buttonUrlSuffix) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: message.buttonUrlSuffix }],
      })
    }

    try {
      const response = await politeFetch(url, {
        headers: { authorization: `Bearer ${env.accessToken}`, 'content-type': 'application/json' },
        fetchImpl: async (input, init) =>
          fetchImpl(input, {
            ...init,
            method: 'POST',
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: message.toNumber,
              type: 'template',
              template: {
                name: message.templateName,
                language: { code: message.languageCode },
                components,
              },
            }),
          }),
        retries: 1,
      })
      const payload = (await response.json().catch(() => ({}))) as Record<string, any>
      if (!response.ok) {
        return { delivered: false, providerId: null, error: payload?.error?.message ?? `HTTP ${response.status}` }
      }
      return { delivered: true, providerId: payload?.messages?.[0]?.id ?? null, error: null }
    } catch (error) {
      return { delivered: false, providerId: null, error: error instanceof Error ? error.message : String(error) }
    }
  }
}

export interface PostmarkEnv {
  serverToken: string
  fromAddress: string
  apiBase?: string
}

export function createPostmarkTransport(env: Partial<PostmarkEnv>, fetchImpl: typeof fetch = fetch) {
  return async function sendEmail(message: EmailMessage): Promise<SendResult> {
    if (!env.serverToken || !env.fromAddress) {
      return { delivered: false, providerId: null, error: 'Email is not configured: POSTMARK_SERVER_TOKEN or ALERT_FROM_EMAIL is unset' }
    }
    const url = `${env.apiBase ?? 'https://api.postmarkapp.com'}/email`
    try {
      const response = await politeFetch(url, {
        headers: {
          'X-Postmark-Server-Token': env.serverToken,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        fetchImpl: async (input, init) =>
          fetchImpl(input, {
            ...init,
            method: 'POST',
            body: JSON.stringify({
              From: env.fromAddress,
              To: message.to,
              Subject: message.subject,
              TextBody: message.text,
              HtmlBody: message.html,
              MessageStream: 'outbound',
            }),
          }),
        retries: 2,
      })
      const payload = (await response.json().catch(() => ({}))) as Record<string, any>
      if (!response.ok) {
        return { delivered: false, providerId: null, error: payload?.Message ?? `HTTP ${response.status}` }
      }
      return { delivered: true, providerId: payload?.MessageID ?? null, error: null }
    } catch (error) {
      return { delivered: false, providerId: null, error: error instanceof Error ? error.message : String(error) }
    }
  }
}
