/**
 * The funnel, panel 2: leads to qualified to quoted to signed to funded.
 * Count, conversion rate and cost per stage, with dead leads as a separate
 * branch broken down by reason.
 *
 * The attribution mode matters more than anything else here. See
 * docs/hubspot-schema.md section 2.
 *
 *   traced     a reliable lead level join key exists. A stage count is a
 *              cohort: these specific leads reached this stage.
 *   aggregate  no reliable join key. A stage count is a period total. Leads
 *              and the deals they became sit in different windows because the
 *              sales cycle is 16 to 18 days, so cost per stage is an
 *              approximation and the rates are not true cohort rates.
 *
 * The distinction is carried on every stage rather than mentioned once, so a
 * caller cannot render a traced looking funnel from aggregate data.
 */
import { divide, Decimal } from './money.mjs';

export function buildFunnel({
  spend,
  leadCount,
  rawLeadCount = null,
  stageCounts = {},
  cumulative = {},
  deadByReason = [],
  contractsSigned = null,
  contractsFunded = null,
  fundingDataAvailable = false,
  attributionMode = 'aggregate',
  hubspotAvailable = false,
}) {
  const spendD = spend instanceof Decimal ? spend : new Decimal(String(spend ?? 0));

  // Every stage past "lead" depends on HubSpot. When HubSpot is unavailable the
  // honest answer is null, which renders as [TBC], not zero. A zero would read
  // as "nobody qualified", which is a different and false statement.
  const qualified = hubspotAvailable ? (cumulative.qualified ?? stageCounts.qualified ?? null) : null;
  const quoted = hubspotAvailable ? (cumulative.quoted ?? stageCounts.quoted ?? null) : null;
  const signed = hubspotAvailable ? (contractsSigned ?? cumulative.won ?? stageCounts.won ?? null) : contractsSigned;
  const funded = fundingDataAvailable ? contractsFunded : null;

  const stage = (key, label, count, { costable = true } = {}) => ({
    key,
    label,
    count,
    // Conversion from the top of the funnel.
    rateFromLeads: count !== null && leadCount > 0 ? count / leadCount : null,
    costPerUnit: costable && count !== null && count > 0 ? divide(spendD, count) : null,
    available: count !== null,
    attributionMode,
  });

  const stages = [
    stage('lead', 'Leads', leadCount),
    stage('qualified', 'Qualified', qualified),
    stage('quoted', 'Quotes issued', quoted),
    stage('signed', 'Contracts signed', signed),
    stage('funded', 'Contracts funded', funded),
  ];

  // Step to step conversion, which is what actually shows where the funnel leaks.
  for (let i = 1; i < stages.length; i += 1) {
    const prev = stages[i - 1];
    const cur = stages[i];
    cur.rateFromPrevious = cur.count !== null && prev.count !== null && prev.count > 0 ? cur.count / prev.count : null;
  }

  const deadTotal = deadByReason.reduce((sum, d) => sum + d.count, 0);

  return {
    stages,
    attributionMode,
    attributionNote:
      attributionMode === 'traced'
        ? 'Stage counts are traced cohorts: these leads reached these stages.'
        : 'Stage counts are period totals, not traced cohorts. With a 16 to 18 day sales cycle, a lead and the deal it became can fall in different windows. Cost per stage is an approximation.',

    // "Dead leads shown as a separate branch with reason breakdown."
    dead: {
      total: hubspotAvailable ? deadTotal : null,
      rateFromLeads: hubspotAvailable && leadCount > 0 ? deadTotal / leadCount : null,
      byReason: hubspotAvailable ? deadByReason : [],
    },

    leads: {
      deduplicated: leadCount,
      raw: rawLeadCount,
      duplicatesRemoved: rawLeadCount !== null ? rawLeadCount - leadCount : null,
    },

    // The single most important distinction in this dashboard.
    fundingNote: fundingDataAvailable
      ? 'Contracts funded is closed won with a cleared deposit.'
      : 'Signed, funding unconfirmed. A contract with no cleared deposit is not a deal. GoCardless is not yet connected, so funded cannot be confirmed and is shown as [TBC].',
    fundingDataAvailable,

    // Rates the brief defines against FUNDED contracts. They stay null while
    // funding is unconfirmed rather than silently falling back to signed.
    leadToClose: funded !== null && leadCount > 0 ? funded / leadCount : null,
    quoteToClose: funded !== null && quoted !== null && quoted > 0 ? funded / quoted : null,
    leadToCloseSignedBasis: signed !== null && leadCount > 0 ? signed / leadCount : null,
  };
}
