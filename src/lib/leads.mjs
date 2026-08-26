/**
 * Lead record handling: personal information, deduplication and region.
 *
 * Section 3 of the brief: "Lead records contain names, emails, phone numbers
 * and business names of real customers. Treat them as personal information."
 *
 * The approach here is to strip rather than to guard. Personal information is
 * discarded at ingestion and never reaches the cache, so there is no lead level
 * record for an endpoint to leak, no PII in a blob, and nothing to redact in a
 * log. What survives is a salted hash used for deduplication and the non
 * identifying fields the dashboard actually needs.
 */
import { createHash, randomBytes } from 'node:crypto';

/**
 * Normalise a New Zealand phone number for comparison.
 *
 * The customer database already shows the problem: formats mixed across
 * "64...", "021...", "09..." and at least one concatenation typo. Meta Instant
 * Form numbers will not match without this.
 */
export function normalisePhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/[^\d]/g, '');
  if (!digits) return null;
  // International prefix, with or without a leading zero after it.
  if (digits.startsWith('0064')) digits = digits.slice(4);
  else if (digits.startsWith('64')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  // Anything implausibly short or long is not a usable key.
  if (digits.length < 7 || digits.length > 12) return null;
  return digits;
}

export function normaliseEmail(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s.includes('@') || s.length < 5) return null;
  return s;
}

/** A per refresh salt. Hashes are never compared across refreshes, so a fresh salt each time is both sufficient and safer. */
export function newSalt() {
  return randomBytes(32).toString('hex');
}

function hash(salt, value) {
  return createHash('sha256').update(`${salt}:${value}`).digest('hex').slice(0, 32);
}

/**
 * Strip a raw Meta lead record down to what the dashboard needs, replacing
 * identifiers with salted hashes.
 *
 * Everything dropped here is dropped permanently. full_name, email,
 * phone_number and company_name do not appear in the return value.
 */
export function stripLead(raw, { salt, classifier, servicedRegions = [] }) {
  const equipmentText = raw['what_type_of_equipment_are_you_after:'] ?? raw.what_type_of_equipment_are_you_after ?? raw.equipment ?? null;

  const phoneKey = normalisePhone(raw.phone_number);
  const emailKey = normaliseEmail(raw.email);

  const classification = classifier ? classifier.classify(equipmentText) : null;

  return {
    id: raw.id ?? null,
    createdTime: raw.created_time ?? null,
    adId: raw.ad_id ?? null,
    adName: raw.ad_name ?? null,
    adsetId: raw.adset_id ?? null,
    adsetName: raw.adset_name ?? null,
    campaignId: raw.campaign_id ?? null,
    campaignName: raw.campaign_name ?? null,
    formId: raw.form_id ?? null,
    formName: raw.form_name ?? null,
    isOrganic: raw.is_organic ?? null,
    platform: raw.platform ?? null,

    // Category only. The enquiry TEXT is not retained: a free text field is
    // where someone writes "call me on 021...", so it is personal information
    // until proven otherwise.
    equipmentCategory: classification?.category ?? null,
    equipmentLabel: classification?.label ?? null,
    inCatalogue: classification?.inCatalogue ?? null,

    // Deduplication keys only. Not reversible, not stored raw.
    phoneHash: phoneKey ? hash(salt, `p:${phoneKey}`) : null,
    emailHash: emailKey ? hash(salt, `e:${emailKey}`) : null,

    // Whether the lead carried contact details at all, which is a data quality
    // signal in its own right and does not require keeping the details.
    hasPhone: Boolean(phoneKey),
    hasEmail: Boolean(emailKey),
  };
}

/**
 * Deduplicate for funnel counts, section 8.5.
 *
 * "At least one person submitted the same form twice within an hour.
 * Deduplicate on phone or email for funnel counts, but keep the raw count
 * visible, since repeat submissions suggest the confirmation step is not
 * landing."
 *
 * Both the deduplicated and the raw count are returned. Neither replaces the
 * other on the dashboard.
 */
export function deduplicateLeads(strippedLeads) {
  const seen = new Map();       // key -> index of the first submission
  const unique = [];
  const duplicates = [];

  for (const lead of strippedLeads) {
    const keys = [lead.phoneHash && `p:${lead.phoneHash}`, lead.emailHash && `e:${lead.emailHash}`].filter(Boolean);

    // A lead with no usable contact key cannot be matched to anything, so it
    // counts as unique rather than being merged into an arbitrary bucket.
    const existingKey = keys.find((k) => seen.has(k));
    if (existingKey === undefined) {
      const idx = unique.length;
      unique.push(lead);
      for (const k of keys) seen.set(k, idx);
    } else {
      const firstIdx = seen.get(existingKey);
      // Link any further keys to the same lead, so a second submission that
      // shares a phone but supplies a new email still collapses correctly.
      for (const k of keys) if (!seen.has(k)) seen.set(k, firstIdx);
      duplicates.push({
        id: lead.id,
        createdTime: lead.createdTime,
        firstSubmissionAt: unique[firstIdx]?.createdTime ?? null,
        matchedOn: existingKey.startsWith('p:') ? 'phone' : 'email',
      });
    }
  }

  return {
    unique,
    rawCount: strippedLeads.length,
    uniqueCount: unique.length,
    duplicateCount: duplicates.length,
    duplicates,
    noContactKeyCount: strippedLeads.filter((l) => !l.phoneHash && !l.emailHash).length,
  };
}

/**
 * Median days from lead created_time to a closed won date.
 * Returns null on an empty set rather than 0, which would read as "same day".
 */
export function medianDays(pairs) {
  const spans = pairs
    .map(({ from, to }) => {
      if (!from || !to) return null;
      const a = Date.parse(from);
      const b = Date.parse(to);
      if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
      return (b - a) / 86400000;
    })
    .filter((v) => v !== null)
    .sort((a, b) => a - b);

  if (!spans.length) return null;
  const mid = Math.floor(spans.length / 2);
  const median = spans.length % 2 ? spans[mid] : (spans[mid - 1] + spans[mid]) / 2;
  return { medianDays: Math.round(median * 10) / 10, sampleSize: spans.length };
}
