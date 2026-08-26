/**
 * Equipment enquiry classifier, section 8.4 of the brief.
 *
 * Roughly 19% of leads request equipment HireHospo does not finance: coffee
 * machines, ice makers, sinks, extract fans, and in one case earthmoving
 * equipment. This is a live measure of whether the ad copy is filtering
 * properly, so it needs to be right rather than approximately right.
 *
 * The Meta field is `what_type_of_equipment_are_you_after:` including the
 * trailing colon.
 */

/** Escape a keyword for use inside a regular expression. */
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a matcher. Keywords match on word boundaries so "sink" does not match
 * "sinking" and "range" does not match "arrangement". Longer keywords are tried
 * first so "ice maker" wins over a bare "ice" and "pizza oven" over "pizza".
 */
function buildMatchers(groups) {
  const out = [];
  for (const [category, keywords] of Object.entries(groups)) {
    if (category.startsWith('_')) continue;
    for (const kw of [...keywords].sort((a, b) => b.length - a.length)) {
      out.push({ category, keyword: kw, re: new RegExp(`(?:^|[^a-z0-9])${escapeRe(kw.toLowerCase())}(?:[^a-z0-9]|$)`, 'i') });
    }
  }
  return out;
}

export function buildClassifier(config) {
  // Out of catalogue is evaluated FIRST. If "ice maker" were checked after the
  // refrigeration keywords it could be swept into an in catalogue category and
  // the wasted spend measure would quietly report zero.
  const outMatchers = buildMatchers(config.outOfCatalogue ?? {});
  const inMatchers = buildMatchers(config.inCatalogue ?? {});
  const labels = config.categoryLabels ?? {};

  return {
    labels,

    /**
     * Classify one enquiry string.
     * Returns { inCatalogue, category, label, matchedKeyword, alsoMatched }.
     * An empty or absent enquiry returns category 'unstated', which is counted
     * separately rather than being guessed into a category.
     */
    classify(text) {
      const s = String(text ?? '').trim();
      if (!s) {
        return { inCatalogue: null, category: 'unstated', label: 'Not stated', matchedKeyword: null, alsoMatched: [] };
      }
      const padded = ` ${s.toLowerCase()} `;

      const outHits = outMatchers.filter((m) => m.re.test(padded));
      const inHits = inMatchers.filter((m) => m.re.test(padded));

      if (outHits.length) {
        const primary = outHits[0];
        return {
          inCatalogue: false,
          category: primary.category,
          label: labels[primary.category] ?? primary.category,
          matchedKeyword: primary.keyword,
          // A lead asking for "coffee machine and a dishwasher" is genuinely
          // mixed. It is counted out of catalogue but the in catalogue interest
          // is recorded rather than thrown away.
          alsoMatched: [...new Set(inHits.map((m) => m.category))],
        };
      }

      if (inHits.length) {
        const primary = inHits[0];
        return {
          inCatalogue: true,
          category: primary.category,
          label: labels[primary.category] ?? primary.category,
          matchedKeyword: primary.keyword,
          alsoMatched: [...new Set(inHits.map((m) => m.category))].filter((c) => c !== primary.category),
        };
      }

      // Unrecognised. NOT assumed in catalogue. An unclassified share that
      // creeps up is itself a signal the keyword list needs extending.
      return { inCatalogue: null, category: 'unclassified', label: 'Unclassified', matchedKeyword: null, alsoMatched: [] };
    },
  };
}

/**
 * Summarise a set of classified leads, with the wasted spend estimate.
 *
 * Wasted spend is apportioned by lead share, which is an estimate and is
 * labelled as one: Meta does not tell us what was spent to acquire any one
 * lead, so an out of catalogue lead is charged the average CPL.
 */
export function summariseDemand(classifications, { spend = null, cpl = null } = {}) {
  const byCategory = new Map();
  let inCount = 0;
  let outCount = 0;
  let unstated = 0;
  let unclassified = 0;

  for (const c of classifications) {
    byCategory.set(c.category, (byCategory.get(c.category) ?? 0) + 1);
    if (c.inCatalogue === true) inCount += 1;
    else if (c.inCatalogue === false) outCount += 1;
    else if (c.category === 'unstated') unstated += 1;
    else unclassified += 1;
  }

  const total = classifications.length;
  const classified = inCount + outCount;

  return {
    total,
    inCatalogue: inCount,
    outOfCatalogue: outCount,
    unstated,
    unclassified,
    // Share is of CLASSIFIED leads, not of all leads, so that a rise in
    // unclassified does not silently deflate the out of catalogue share.
    outOfCatalogueShare: classified > 0 ? outCount / classified : null,
    inCatalogueShare: classified > 0 ? inCount / classified : null,
    categories: [...byCategory.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    estimatedWastedSpend: cpl !== null && cpl !== undefined && outCount > 0 ? { value: cpl.times(outCount), basis: 'out of catalogue leads charged at the average CPL', isEstimate: true } : null,
    spendBasis: spend ?? null,
  };
}
