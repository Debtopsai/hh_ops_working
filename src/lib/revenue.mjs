/**
 * THE REVENUE RULE. Section 7 of the brief.
 *
 * This was got wrong in the manual analysis and produced a 7% overstatement.
 * Everything in this file exists to stop that happening again.
 *
 * ---------------------------------------------------------------------------
 * For a deal at NZ$115 a week, 156 weeks, with a 6 + 6 deposit structure:
 *
 *   Weekly payments   156 x $115  =  $17,940   REVENUE
 *   Delivery/install                =     $895   REVENUE (largely pass through cost)
 *                                      --------
 *   Contract revenue                =  $18,835
 *
 *   Rent in advance     6 x $115  =     $690   NOT ADDITIONAL. Prepayment of
 *                                                weeks 1 to 6, already inside
 *                                                the 156 above.
 *   Security bond       6 x $115  =     $690   NOT REVENUE. Refundable.
 *                                                Balance sheet only.
 *
 * Adding the $1,380 deposit to the $18,835 gives $20,215, which is WRONG. It
 * double counts six weeks of rent and books a refundable bond as income.
 * ---------------------------------------------------------------------------
 *
 * The rule holds for every deposit structure, not just 6+6: advance is
 * prepayment, security is a bond, neither is incremental revenue. The deposit
 * varies by credit tier (10+10 standard, with 8+8, 6+6, 4+4 and 4+3 in defined
 * cases) and the rule does not change with it.
 *
 * Cash upfront is still worth showing. It is returned here as a separate cash
 * flow figure and must never be added into revenue by a caller.
 */
import { Decimal, divide } from './money.mjs';
import { cashUpfront as computeCashUpfront } from './deposit.mjs';

/**
 * Contract revenue for a single deal, ex GST.
 *
 *   contract revenue = (weekly payment x term weeks) + delivery and install
 *
 * Returns null for any input it cannot compute honestly, so the dashboard shows
 * [TBC] rather than a plausible invention.
 *
 * @param {object} deal
 * @param {string|number|Decimal} deal.weeklyPayment   ex GST
 * @param {number} deal.termWeeks                      read from the deal, never assumed
 * @param {string|number|Decimal} [deal.deliveryAndInstall=0]
 * @param {string} [deal.depositStructure]             for the separate cash figure
 */
export function contractRevenue(deal) {
  const { weeklyPayment, termWeeks, deliveryAndInstall = 0, depositStructure = null } = deal ?? {};

  if (weeklyPayment === null || weeklyPayment === undefined) return null;
  if (termWeeks === null || termWeeks === undefined || !Number.isFinite(Number(termWeeks)) || Number(termWeeks) <= 0) return null;

  const weekly = weeklyPayment instanceof Decimal ? weeklyPayment : new Decimal(String(weeklyPayment));
  const weeks = new Decimal(String(termWeeks));
  const install = deliveryAndInstall instanceof Decimal ? deliveryAndInstall : new Decimal(String(deliveryAndInstall ?? 0));

  const weeklyPaymentsTotal = weekly.times(weeks);
  const revenue = weeklyPaymentsTotal.plus(install);

  const cash = depositStructure ? computeCashUpfront(depositStructure, weekly) : null;

  return {
    // The revenue figure. This, and only this, is contract revenue.
    contractRevenue: revenue,

    // Its two components, so the dashboard can show the working.
    weeklyPaymentsTotal,
    deliveryAndInstall: install,

    // Cash flow, held deliberately OUTSIDE the revenue figure.
    // A caller that adds cashUpfront.total to contractRevenue has reintroduced
    // the 7% overstatement. There is a test asserting exactly that.
    cashUpfront: cash
      ? {
          rentInAdvance: cash.rentInAdvance,
          securityBond: cash.securityBond,
          total: cash.total,
          structure: cash.structure,
          recognised: cash.recognised,
          isRevenue: false,
          note: 'Rent in advance is prepayment of the first weeks, already inside the weekly payments total. The security bond is refundable and is balance sheet only. Neither is revenue.',
        }
      : null,

    weeklyPayment: weekly,
    termWeeks: Number(termWeeks),
  };
}

/**
 * Risk adjusted contract revenue.
 *
 * The WEEKLY STREAM is discounted by the payment failure rate. Delivery and
 * install are not discounted: they are collected once, up front, and are not
 * exposed to weekly direct debit failure.
 */
export function riskAdjustedRevenue(revenueResult, failureRate) {
  if (!revenueResult) return null;
  const rate = failureRate instanceof Decimal ? failureRate : new Decimal(String(failureRate));
  if (rate.lt(0) || rate.gte(1)) return null;
  const survivingWeekly = revenueResult.weeklyPaymentsTotal.times(new Decimal(1).minus(rate));
  return {
    riskAdjustedRevenue: survivingWeekly.plus(revenueResult.deliveryAndInstall),
    survivingWeeklyStream: survivingWeekly,
    failureRate: rate,
    deliveryAndInstall: revenueResult.deliveryAndInstall,
    note: 'The weekly stream is discounted by the payment failure rate. Delivery and install are collected up front and are not discounted.',
  };
}

/**
 * Lifetime value.
 *
 *   LTV = contract revenue x gross margin assumption
 *
 * The margin is a configurable input, default 25%, and is NOT confirmed. See
 * section 11 item 1. Callers must carry marginConfirmed through to the display
 * so the figure is never shown as settled when it is not.
 */
export function ltv(revenueResult, grossMargin, { marginConfirmed = false } = {}) {
  if (!revenueResult) return null;
  const margin = grossMargin instanceof Decimal ? grossMargin : new Decimal(String(grossMargin));
  if (margin.lte(0) || margin.gt(1)) return null;
  return {
    ltv: revenueResult.contractRevenue.times(margin),
    grossMargin: margin,
    marginConfirmed,
    basis: 'contract revenue x gross margin',
  };
}

/**
 * Unit economics for a cohort.
 *
 * CAC is media only. Sales time, credit assessment fees and equipment cost are
 * not included, and the caveat travels with the numbers rather than being left
 * to the front end to remember.
 */
export function unitEconomics({
  spend,
  contractsFunded,
  contractsSigned,
  fundingDataAvailable,
  revenueResult,
  grossMargin,
  failureRate,
  marginConfirmed = false,
}) {
  const spendD = spend instanceof Decimal ? spend : new Decimal(String(spend ?? 0));
  const margin = grossMargin instanceof Decimal ? grossMargin : new Decimal(String(grossMargin));

  // "CAC = Spend / Contracts funded. Fall back to signed only if funding data
  // unavailable, and label it."
  const usingSignedFallback = !fundingDataAvailable;
  const denominator = usingSignedFallback ? contractsSigned : contractsFunded;
  const cac = denominator > 0 ? divide(spendD, denominator) : null;

  const ltvResult = revenueResult ? ltv(revenueResult, margin, { marginConfirmed }) : null;
  const risk = revenueResult && failureRate !== undefined && failureRate !== null
    ? riskAdjustedRevenue(revenueResult, failureRate)
    : null;

  const ltvCac = ltvResult && cac ? divide(ltvResult.ltv, cac) : null;

  // "Payback weeks = CAC / (weekly payment x gross margin)"
  const weeklyContribution = revenueResult ? revenueResult.weeklyPayment.times(margin) : null;
  const paybackWeeks = cac && weeklyContribution && !weeklyContribution.isZero()
    ? divide(cac, weeklyContribution)
    : null;

  const riskAdjustedLtv = risk && ltvResult ? risk.riskAdjustedRevenue.times(margin) : null;
  const riskAdjustedLtvCac = riskAdjustedLtv && cac ? divide(riskAdjustedLtv, cac) : null;

  return {
    cac,
    cacBasis: usingSignedFallback ? 'signed, funding unconfirmed' : 'funded',
    cacLabel: usingSignedFallback
      ? 'CAC uses contracts signed because funding data is unavailable. A contract with no cleared deposit is not a deal.'
      : 'CAC uses contracts funded.',
    contractsFunded: fundingDataAvailable ? contractsFunded : null,
    contractsSigned,
    fundingDataAvailable,

    contractRevenue: revenueResult?.contractRevenue ?? null,
    ltv: ltvResult?.ltv ?? null,
    grossMargin: margin,
    marginConfirmed,
    ltvCac,
    paybackWeeks,
    weeklyContribution,

    riskAdjustedRevenue: risk?.riskAdjustedRevenue ?? null,
    riskAdjustedLtv,
    riskAdjustedLtvCac,
    failureRate: risk?.failureRate ?? null,

    caveat:
      'Gross revenue against media only CAC. Sales time, credit assessment fees and equipment cost are not included.',
  };
}
