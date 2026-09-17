import { describe, expect, it } from 'vitest'
import { isWithinQuietHours, localParts, nextDeliveryTime } from '@/alerts/quiet-hours'

const founder = { quietHoursStart: 21, quietHoursEnd: 6, timezone: 'Pacific/Auckland' }

/** 10pm on 20 January 2026 in Auckland, which is UTC+13 in daylight saving. */
const lateEveningNzdt = new Date('2026-01-20T09:00:00Z')
/** 2pm on 20 January 2026 in Auckland. */
const afternoonNzdt = new Date('2026-01-20T01:00:00Z')
/** 3am on 21 January 2026 in Auckland. */
const smallHoursNzdt = new Date('2026-01-20T14:00:00Z')
/** 10pm on 20 June 2026 in Auckland, which is UTC+12 in standard time. */
const lateEveningNzst = new Date('2026-06-20T10:00:00Z')

describe('quiet hours', () => {
  it('reads the hour in the recipient timezone, not in UTC', () => {
    expect(localParts(lateEveningNzdt, 'Pacific/Auckland').hour).toBe(22)
    expect(localParts(lateEveningNzst, 'Pacific/Auckland').hour).toBe(22)
  })

  it('recognises a window that spans midnight', () => {
    expect(isWithinQuietHours(lateEveningNzdt, founder)).toBe(true)
    expect(isWithinQuietHours(smallHoursNzdt, founder)).toBe(true)
    expect(isWithinQuietHours(afternoonNzdt, founder)).toBe(false)
  })
})

describe('delivery time', () => {
  it('sends immediately outside quiet hours', () => {
    const decision = nextDeliveryTime(afternoonNzdt, founder)
    expect(decision.reason).toBe('immediate')
    expect(decision.deliverAt.getTime()).toBe(afternoonNzdt.getTime())
  })

  it('holds a 10pm alert until 6am the next morning', () => {
    const decision = nextDeliveryTime(lateEveningNzdt, founder)
    expect(decision.reason).toBe('quiet_hours')
    expect(localParts(decision.deliverAt, 'Pacific/Auckland').hour).toBe(6)
    expect(localParts(decision.deliverAt, 'Pacific/Auckland').day).toBe(21)
  })

  it('holds a 3am alert until 6am the same morning', () => {
    const decision = nextDeliveryTime(smallHoursNzdt, founder)
    expect(localParts(decision.deliverAt, 'Pacific/Auckland').hour).toBe(6)
    expect(localParts(decision.deliverAt, 'Pacific/Auckland').day).toBe(21)
    expect(decision.deliverAt.getTime()).toBeGreaterThan(smallHoursNzdt.getTime())
  })

  it('lands on 6am local across the daylight saving boundary too', () => {
    const decision = nextDeliveryTime(lateEveningNzst, founder)
    expect(localParts(decision.deliverAt, 'Pacific/Auckland').hour).toBe(6)
  })

  it('never drops an alert: every decision has a delivery time', () => {
    for (const at of [lateEveningNzdt, afternoonNzdt, smallHoursNzdt, lateEveningNzst]) {
      expect(Number.isNaN(nextDeliveryTime(at, founder).deliverAt.getTime())).toBe(false)
    }
  })
})
