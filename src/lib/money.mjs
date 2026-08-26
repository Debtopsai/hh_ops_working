/**
 * Currency and number handling.
 *
 * Every currency calculation in this dashboard uses Decimal. Floats are not used
 * anywhere in a money path. A contract at $115 a week over 156 weeks is the kind
 * of repeated multiply and add where binary floating point drifts, and this
 * dashboard's whole purpose is to be the number people trust.
 *
 * All figures are ex GST. Nothing here computes a GST inclusive figure. The
 * "+ GST" suffix is a label applied at display time, not a calculation.
 */
import Decimal from 'decimal.js';

// 20 significant digits is far more than money needs and keeps intermediate
// division (payback weeks, ratios) from rounding early.
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export const ZERO = new Decimal(0);

/**
 * Parse a money value from any shape the Meta surfaces return.
 *
 * Observed shapes, all real:
 *   "NZ$656.01 NZD"   Ads Manager style, non breaking space, currency suffix
 *   "656.01"               Graph API style
 *   656.01                 already a number
 *   null / undefined / ""  no spend
 *
 * Returns Decimal(0) for absent values rather than null, because spend of
 * nothing is genuinely zero. Returns null only when the input is a string that
 * contains no parseable number at all, which is a signal the caller should not
 * silently treat as zero.
 */
export function parseMoney(value) {
  if (value === null || value === undefined || value === '') return ZERO;
  if (value instanceof Decimal) return value;
  if (typeof value === 'number') return new Decimal(value);

  const cleaned = String(value)
    .replace(/ /g, ' ')           // non breaking space
    .replace(/[A-Za-z$]/g, '')          // NZ$ prefix and NZD suffix
    .replace(/,/g, '')                  // thousands separators
    .replace(/\(.*\)/g, '')             // trailing "(Leads (form))" annotations
    .trim();

  if (cleaned === '' || !/\d/.test(cleaned)) return null;
  try {
    return new Decimal(cleaned);
  } catch {
    return null;
  }
}

/** Parse a percentage. "2.23%" and "2.23" both give Decimal(2.23), not 0.0223. */
export function parsePercent(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Decimal) return value;
  if (typeof value === 'number') return new Decimal(value);
  const cleaned = String(value).replace(/ /g, ' ').replace(/%/g, '').trim();
  if (cleaned === '' || !/\d/.test(cleaned)) return null;
  try {
    return new Decimal(cleaned);
  } catch {
    return null;
  }
}

/** Parse an integer count. "Not available" and absent both give 0. */
export function parseCount(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Math.trunc(value);
  const s = String(value).trim();
  if (/^not available$/i.test(s)) return 0;
  const cleaned = s.replace(/,/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return 0;
  return Math.trunc(Number(cleaned));
}

/**
 * Safe division. Returns null rather than Infinity or NaN when the denominator
 * is zero, so the front end can render [TBC] instead of inventing a figure.
 * "Never invent a figure. If a value is unavailable, show [TBC]."
 */
export function divide(numerator, denominator) {
  if (numerator === null || denominator === null) return null;
  const n = numerator instanceof Decimal ? numerator : new Decimal(numerator);
  const d = denominator instanceof Decimal ? denominator : new Decimal(denominator);
  if (d.isZero()) return null;
  return n.div(d);
}

/** Round to cents for display. Half up, the convention for NZD invoicing. */
export function toCents(value) {
  if (value === null || value === undefined) return null;
  const d = value instanceof Decimal ? value : new Decimal(value);
  return d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** Serialise a Decimal for JSON transport. Strings, never floats, across the wire. */
export function serialise(value, places = 2) {
  if (value === null || value === undefined) return null;
  const d = value instanceof Decimal ? value : new Decimal(value);
  return d.toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toFixed(places);
}

/** Format for display: NZ$18,835.00 + GST */
export function formatNZD(value, { gst = true, places = 2 } = {}) {
  if (value === null || value === undefined) return '[TBC]';
  const d = value instanceof Decimal ? value : new Decimal(value);
  const fixed = d.toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toFixed(places);
  const [whole, frac] = fixed.split('.');
  const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const body = frac ? `${withSeparators}.${frac}` : withSeparators;
  return `NZ$${body}${gst ? ' + GST' : ''}`;
}
