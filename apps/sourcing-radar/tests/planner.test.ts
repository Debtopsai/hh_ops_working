import { describe, expect, it } from 'vitest'
import { planDispatch, type PendingAlert } from '@/alerts/planner'

const CONFIG = { digestThreshold: 5, alertsPerRecipientPerHour: 6 }

/** `prefix` keeps queue and listing ids unique across the groups in one test. */
function pending(count: number, overrides: Partial<PendingAlert> = {}, prefix = 'a'): PendingAlert[] {
  return Array.from({ length: count }, (_, index) => ({
    listingId: `${prefix}-l${index}`,
    userId: 'u1',
    runId: 'run1',
    reason: 'immediate',
    ...overrides,
    id: `${prefix}-q${index}`,
  }))
}

describe('digest discipline', () => {
  it('sends six matches from one run as one digest, not six messages', () => {
    const plan = planDispatch(pending(6), {}, CONFIG)
    expect(plan.messages).toHaveLength(1)
    expect(plan.messages[0].kind).toBe('digest')
    expect(plan.messages[0].listingIds).toHaveLength(6)
  })

  it('sends five matches from one run as five single alerts', () => {
    const plan = planDispatch(pending(5), {}, CONFIG)
    expect(plan.messages).toHaveLength(5)
    expect(plan.messages.every((message) => message.kind === 'single')).toBe(true)
  })

  it('keeps separate runs separate rather than merging unrelated batches', () => {
    const plan = planDispatch(
      [...pending(3), ...pending(3, { runId: 'run2' }, 'b')],
      {},
      CONFIG,
    )
    expect(plan.messages.every((message) => message.kind === 'single')).toBe(true)
  })
})

describe('quiet hours batching', () => {
  it('collapses an overnight batch into one delivery', () => {
    const plan = planDispatch(pending(3, { reason: 'quiet_hours' }), {}, CONFIG)
    expect(plan.messages).toHaveLength(1)
    expect(plan.messages[0].kind).toBe('digest')
    expect(plan.messages[0].trigger).toBe('quiet_hours')
  })

  it('sends a lone overnight listing as a single alert, so the title price and link survive', () => {
    const plan = planDispatch(pending(1, { reason: 'quiet_hours' }), {}, CONFIG)
    expect(plan.messages).toHaveLength(1)
    expect(plan.messages[0].kind).toBe('single')
    expect(plan.messages[0].trigger).toBe('quiet_hours')
  })

  it('puts the overnight queue ahead of anything raised since', () => {
    const plan = planDispatch(
      [...pending(2, { runId: 'run2' }, 'b'), ...pending(2, { reason: 'quiet_hours' })],
      {},
      CONFIG,
    )
    expect(plan.messages[0].trigger).toBe('quiet_hours')
  })
})

describe('the hourly cap', () => {
  it('rolls anything over the cap into the next digest rather than dropping it', () => {
    const plan = planDispatch(pending(5), { u1: 4 }, CONFIG)
    expect(plan.messages).toHaveLength(2)
    expect(plan.rolledOver).toHaveLength(3)
  })

  it('sends nothing and rolls everything over when the cap is already spent', () => {
    const plan = planDispatch(pending(3), { u1: 6 }, CONFIG)
    expect(plan.messages).toHaveLength(0)
    expect(plan.rolledOver).toHaveLength(3)
  })

  it('applies the cap per recipient, not across the three of them', () => {
    const plan = planDispatch(
      [...pending(2), ...pending(2, { userId: 'u2' }, 'b')],
      { u1: 6 },
      CONFIG,
    )
    expect(plan.messages.every((message) => message.userId === 'u2')).toBe(true)
    expect(plan.rolledOver.every((item) => item.userId === 'u1')).toBe(true)
  })
})
