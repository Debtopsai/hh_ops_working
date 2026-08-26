/**
 * Equipment enquiry classifier, section 8.4 of the brief.
 *
 * "Roughly 19% of leads request equipment HireHospo does not finance."
 * This is a live measure of whether the ad copy is filtering properly, so it
 * needs to be right rather than approximately right.
 *
 * Tuned against all 58 real enquiries (test/fixtures/equipment-enquiries.json).
 * Real text is messy: 'speed owen', 'Gas hop', 'lpg griller', 'comercial indin
 * cooking cook top'. The matching rules below exist because of specific misses
 * on that corpus, not because they seemed sensible in the abstract.
 *
 * Five outcomes, not two:
 *   inCatalogue    financeable equipment named
 *   mixed          both financeable and non financeable named. Counts as worth
 *                  having: a lead asking for eleven in catalogue items plus one
 *                  range hood is a good lead, not wasted spend
 *   outOfCatalogue ONLY non financeable equipment named. This is the wasted one
 *   vague          a real answer, too general to classify ('Kitchen', 'Various')
 *   unstated       no answer at all
 */

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build one matcher per keyword.
 *
 * Leading boundary is strict, so 'arrangement' does not match 'range'.
 * Trailing boundary tolerates plural and agent suffixes, so 'griller' matches
 * 'grill' and 'sinks' matches 'sink'. It deliberately does NOT tolerate 'ing',
 * which would make 'sinking' match 'sink'.
 */
function buildMatchers(groups, allowedSuffixes) {
  const suffix = allowedSuffixes?.length ? `(?:${allowedSuffixes.map(escapeRe).join('|')})?` : '';
  const out = [];
  for (const [category, keywords] of Object.entries(groups)) {
    if (category.startsWith('_')) continue;
    for (const kw of keywords) {
      out.push({
        category,
        keyword: kw,
        re: new RegExp(`(?:^|[^a-z0-9])${escapeRe(kw.toLowerCase())}${suffix}(?:[^a-z0-9]|$)`, 'i'),
      });
    }
  }
  // Longest keyword first, so 'pizza oven' wins over 'oven' and 'ice maker'
  // over 'ice'. Sorting here rather than per group means the precedence holds
  // across categories too.
  return out.sort((a, b) => b.keyword.length - a.keyword.length);
}

export function buildClassifier(config) {
  const suffixes = config.matching?.allowedSuffixes ?? [];
  // Out of catalogue is built first and tested first.
  const outMatchers = buildMatchers(config.outOfCatalogue ?? {}, suffixes);
  const inMatchers = buildMatchers(config.inCatalogue ?? {}, suffixes);
  const vagueMatchers = buildMatchers(config.vague ?? {}, suffixes);
  const labels = config.categoryLabels ?? {};
  const label = (c) => labels[c] ?? c;

  return {
    labels,

    classify(text) {
      const s = String(text ?? '').trim();
      if (!s) {
        return { outcome: 'unstated', inCatalogue: null, category: 'unstated', label: label('unstated'), matchedKeyword: null, inCategories: [], outCategories: [] };
      }
      // Collapse internal whitespace before matching. Real submissions contain
      // double spaces ('filling  machine'), which a literal keyword with one
      // space silently fails to match.
      const padded = ` ${s.toLowerCase().replace(/\s+/g, ' ')} `;

      const outHits = outMatchers.filter((m) => m.re.test(padded));
      const inHits = inMatchers.filter((m) => m.re.test(padded));

      const inCategories = [...new Set(inHits.map((m) => m.category))];
      const outCategories = [...new Set(outHits.map((m) => m.category))];

      // Both present: a mixed enquiry. Worth having, so it is NOT wasted spend.
      if (inHits.length && outHits.length) {
        return {
          outcome: 'mixed',
          inCatalogue: true,
          category: inHits[0].category,
          label: label(inHits[0].category),
          matchedKeyword: inHits[0].keyword,
          inCategories,
          outCategories,
          note: 'Named both financeable and non financeable equipment.',
        };
      }

      if (outHits.length) {
        return {
          outcome: 'outOfCatalogue',
          inCatalogue: false,
          category: outHits[0].category,
          label: label(outHits[0].category),
          matchedKeyword: outHits[0].keyword,
          inCategories: [],
          outCategories,
        };
      }

      if (inHits.length) {
        return {
          outcome: 'inCatalogue',
          inCatalogue: true,
          category: inHits[0].category,
          label: label(inHits[0].category),
          matchedKeyword: inHits[0].keyword,
          inCategories,
          outCategories: [],
        };
      }

      const vagueHit = vagueMatchers.find((m) => m.re.test(padded));
      if (vagueHit) {
        return { outcome: 'vague', inCatalogue: null, category: 'vague', label: label('vague'), matchedKeyword: vagueHit.keyword, inCategories: [], outCategories: [] };
      }

      // No match. NOT assumed in catalogue. A rising unclassified share is
      // itself the signal that the keyword list needs extending.
      return { outcome: 'unclassified', inCatalogue: null, category: 'unclassified', label: label('unclassified'), matchedKeyword: null, inCategories: [], outCategories: [] };
    },
  };
}

/**
 * Summarise classified leads, with the wasted spend estimate.
 *
 * Wasted spend counts ONLY pure out of catalogue leads. A mixed enquiry is a
 * lead worth having, so charging it to wasted spend would overstate the waste
 * and argue for narrowing ad copy that is in fact working.
 *
 * The estimate is apportioned at the average CPL and labelled an estimate:
 * Meta does not report what was spent to acquire any individual lead.
 */
export function summariseDemand(classifications, { spend = null, cpl = null } = {}) {
  const byCategory = new Map();
  const counts = { inCatalogue: 0, mixed: 0, outOfCatalogue: 0, vague: 0, unstated: 0, unclassified: 0 };

  for (const c of classifications) {
    counts[c.outcome] = (counts[c.outcome] ?? 0) + 1;
    byCategory.set(c.category, (byCategory.get(c.category) ?? 0) + 1);
  }

  const total = classifications.length;
  // The share denominator is leads we could actually classify as one or the
  // other. Vague, unstated and unclassified are excluded so that a rise in
  // vague answers does not silently deflate the out of catalogue share.
  const classified = counts.inCatalogue + counts.mixed + counts.outOfCatalogue;
  const worthHaving = counts.inCatalogue + counts.mixed;

  return {
    total,
    inCatalogue: counts.inCatalogue,
    mixed: counts.mixed,
    worthHaving,
    outOfCatalogue: counts.outOfCatalogue,
    vague: counts.vague,
    unstated: counts.unstated,
    unclassified: counts.unclassified,
    classified,
    outOfCatalogueShare: classified > 0 ? counts.outOfCatalogue / classified : null,
    inCatalogueShare: classified > 0 ? worthHaving / classified : null,
    categories: [...byCategory.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
    estimatedWastedSpend:
      cpl !== null && cpl !== undefined && counts.outOfCatalogue > 0
        ? {
            value: cpl.times(counts.outOfCatalogue),
            basis: 'out of catalogue leads charged at the average CPL. Mixed enquiries are excluded: they named financeable equipment too.',
            isEstimate: true,
          }
        : null,
    spendBasis: spend ?? null,
  };
}
