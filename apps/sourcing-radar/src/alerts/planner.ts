/**
 * Alert batching.
 *
 * Auction catalogues drop dozens of lots at once. A tool that produces
 * notification fatigue in week two has failed, and on WhatsApp it also bills
 * you per message for the privilege, so batching is a cost control as well as a
 * courtesy.
 *
 * Three rules, all of them server side config:
 *
 *   1. More than `digestThreshold` matches from a single ingestion run go out
 *      as one digest rather than as separate notifications.
 *   2. Alerts raised in quiet hours collapse into the one 6am delivery. A lone
 *      overnight listing is sent as a single alert at 6am rather than as a
 *      digest of one, because the single template carries the title, price and
 *      link and a digest of one carries none of that. The timing is identical.
 *   3. Anything over the per recipient hourly cap rolls into the next digest
 *      instead of being dropped.
 *
 * This module is pure. It decides what to send; sending happens in dispatch.ts.
 */

export interface PendingAlert {
  id: string
  listingId: string
  userId: string
  runId: string | null
  reason: 'immediate' | 'quiet_hours' | string
}

export interface PlannerConfig {
  digestThreshold: number
  alertsPerRecipientPerHour: number
}

export interface PlannedMessage {
  userId: string
  kind: 'single' | 'digest'
  queueIds: string[]
  listingIds: string[]
  /** Which ingestion run this came from, where a batch has one. */
  runId: string | null
  trigger: 'immediate' | 'quiet_hours'
}

export interface DispatchPlan {
  messages: PlannedMessage[]
  /** Queue rows left undelivered because the hourly cap was reached. */
  rolledOver: PendingAlert[]
}

const QUIET_HOURS_GROUP = '__quiet_hours__'

export function planDispatch(
  pending: PendingAlert[],
  sentInLastHourByUser: Record<string, number>,
  config: PlannerConfig,
): DispatchPlan {
  const messages: PlannedMessage[] = []
  const rolledOver: PendingAlert[] = []

  const byUser = new Map<string, PendingAlert[]>()
  for (const item of pending) {
    const list = byUser.get(item.userId) ?? []
    list.push(item)
    byUser.set(item.userId, list)
  }

  for (const [userId, items] of byUser) {
    // Quiet hours items collapse into one group. Everything else groups by run.
    const groups = new Map<string, PendingAlert[]>()
    for (const item of items) {
      const key = item.reason === 'quiet_hours' ? QUIET_HOURS_GROUP : item.runId ?? `single:${item.id}`
      const list = groups.get(key) ?? []
      list.push(item)
      groups.set(key, list)
    }

    // Quiet hours first: it is the oldest work in the queue.
    const ordered = [...groups.entries()].sort(([a], [b]) =>
      a === QUIET_HOURS_GROUP ? -1 : b === QUIET_HOURS_GROUP ? 1 : 0,
    )

    const candidates: PlannedMessage[] = []
    for (const [key, group] of ordered) {
      const trigger: 'immediate' | 'quiet_hours' = key === QUIET_HOURS_GROUP ? 'quiet_hours' : 'immediate'
      const asDigest = group.length > config.digestThreshold || (trigger === 'quiet_hours' && group.length > 1)

      if (asDigest) {
        candidates.push({
          userId,
          kind: 'digest',
          queueIds: group.map((g) => g.id),
          listingIds: group.map((g) => g.listingId),
          runId: trigger === 'quiet_hours' ? null : group[0].runId,
          trigger,
        })
      } else {
        for (const item of group) {
          candidates.push({
            userId,
            kind: 'single',
            queueIds: [item.id],
            listingIds: [item.listingId],
            runId: item.runId,
            trigger,
          })
        }
      }
    }

    let budget = Math.max(0, config.alertsPerRecipientPerHour - (sentInLastHourByUser[userId] ?? 0))
    for (const candidate of candidates) {
      if (budget > 0) {
        messages.push(candidate)
        budget -= 1
      } else {
        for (const item of items.filter((i) => candidate.queueIds.includes(i.id))) rolledOver.push(item)
      }
    }
  }

  return { messages, rolledOver }
}
