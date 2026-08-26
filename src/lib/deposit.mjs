/**
 * Deposit structure parsing.
 *
 * A deposit is written as "advance+security", for example "10+10" or "6+6".
 * The first number is weeks of rent PAID IN ADVANCE. The second is weeks of
 * rent held as a SECURITY BOND.
 *
 * Neither is incremental revenue. See revenue.mjs. This module only works out
 * how many weeks of each there are, and refuses to guess when it cannot tell.
 */
import { Decimal } from './money.mjs';

const RECOGNISED = new Set(['10+10', '8+8', '6+6', '4+4', '4+3']);

/**
 * Parse a deposit structure into weeks.
 *
 * Returns { advanceWeeks, securityWeeks, recognised, raw } or null when the
 * input cannot be understood. Null is deliberate: a silently assumed 10+10 on
 * a deal that is actually 4+3 would misstate the cash upfront figure, and the
 * dashboard would rather show [TBC].
 */
export function parseDepositStructure(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const s = String(raw).trim().replace(/\s+/g, '');

  // "10+10", "10 + 10", "10/10", "10-10" all mean the same thing.
  const m = s.match(/^(\d{1,2})\s*[+/\-]\s*(\d{1,2})$/);
  if (!m) return null;

  const advanceWeeks = Number(m[1]);
  const securityWeeks = Number(m[2]);
  if (!Number.isFinite(advanceWeeks) || !Number.isFinite(securityWeeks)) return null;

  const canonical = `${advanceWeeks}+${securityWeeks}`;
  return {
    raw: String(raw),
    canonical,
    advanceWeeks,
    securityWeeks,
    totalWeeks: advanceWeeks + securityWeeks,
    // An unrecognised but well formed structure is still usable. It is flagged
    // rather than rejected, because credit tiers change and the brief lists the
    // structures "in defined cases", not exhaustively.
    recognised: RECOGNISED.has(canonical),
  };
}

/**
 * Cash collected upfront, in dollars. This is a real and useful figure. It is
 * NEVER part of contract revenue.
 */
export function cashUpfront(depositStructure, weeklyPayment) {
  const parsed = typeof depositStructure === 'string' ? parseDepositStructure(depositStructure) : depositStructure;
  if (!parsed || weeklyPayment === null || weeklyPayment === undefined) return null;
  const weekly = weeklyPayment instanceof Decimal ? weeklyPayment : new Decimal(weeklyPayment);
  const rentInAdvance = weekly.times(parsed.advanceWeeks);
  const securityBond = weekly.times(parsed.securityWeeks);
  return {
    rentInAdvance,
    securityBond,
    total: rentInAdvance.plus(securityBond),
    advanceWeeks: parsed.advanceWeeks,
    securityWeeks: parsed.securityWeeks,
    structure: parsed.canonical,
    recognised: parsed.recognised,
  };
}

export const RECOGNISED_STRUCTURES = [...RECOGNISED];
