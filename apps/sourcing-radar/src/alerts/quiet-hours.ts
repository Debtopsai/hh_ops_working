/**
 * Quiet hours.
 *
 * Configurable per user, defaulting to 9pm to 6am. Alerts raised inside them
 * queue and are delivered in a single digest at 6am. They are never dropped: a
 * listing that appeared overnight is still worth seeing at breakfast.
 *
 * Times are computed in the recipient's own timezone (Pacific/Auckland by
 * default) rather than in UTC, so daylight saving cannot quietly shift the
 * delivery window by an hour twice a year.
 */

export interface QuietHoursConfig {
  quietHoursStart: number
  quietHoursEnd: number
  timezone: string
}

/** Offset of a timezone from UTC at a given instant, in milliseconds. */
export function timezoneOffsetMs(instant: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]),
  ) as Record<string, string>

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return asUtc - instant.getTime()
}

export function localParts(instant: Date, timeZone: string): { year: number; month: number; day: number; hour: number; minute: number } {
  const offset = timezoneOffsetMs(instant, timeZone)
  const shifted = new Date(instant.getTime() + offset)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  }
}

/** The UTC instant matching a wall clock time in a timezone. Resolved twice so a DST boundary lands correctly. */
export function instantForLocalTime(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute)
  let guess = new Date(naive - timezoneOffsetMs(new Date(naive), timeZone))
  guess = new Date(naive - timezoneOffsetMs(guess, timeZone))
  return guess
}

export function isWithinQuietHours(instant: Date, config: QuietHoursConfig): boolean {
  const { hour } = localParts(instant, config.timezone)
  const { quietHoursStart: start, quietHoursEnd: end } = config
  if (start === end) return false
  if (start < end) return hour >= start && hour < end
  // Spans midnight, which is the normal case at 9pm to 6am.
  return hour >= start || hour < end
}

export interface DeliveryDecision {
  deliverAt: Date
  reason: 'immediate' | 'quiet_hours'
}

/**
 * When this alert should go out. Immediately, or at the end of the recipient's
 * quiet hours.
 */
export function nextDeliveryTime(now: Date, config: QuietHoursConfig): DeliveryDecision {
  if (!isWithinQuietHours(now, config)) return { deliverAt: now, reason: 'immediate' }

  const { year, month, day, hour } = localParts(now, config.timezone)
  // Before the end hour on the same local day, the digest is later today.
  // At or after the start hour, it is tomorrow morning.
  const sameDay = hour < config.quietHoursEnd
  const target = instantForLocalTime(config.timezone, year, month, day, config.quietHoursEnd)
  if (sameDay) return { deliverAt: target, reason: 'quiet_hours' }

  const tomorrow = new Date(target.getTime() + 24 * 3600_000)
  const parts = localParts(tomorrow, config.timezone)
  return {
    deliverAt: instantForLocalTime(config.timezone, parts.year, parts.month, parts.day, config.quietHoursEnd),
    reason: 'quiet_hours',
  }
}
