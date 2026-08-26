/**
 * Stage mapping, section 8.2 of the brief.
 *
 * The CRM feed sends both QUALIFIED and QualifiedLead, and both "Quote Sent"
 * and "Send Quote". Twenty quote stage leads were split across two event names,
 * neither with enough volume to be useful. There is also a stray LEADS which is
 * not a stage at all.
 *
 * The map is configuration, not code, so a stage name change can be corrected
 * without a redeploy. Anything unrecognised lands in `unmapped` and is surfaced
 * on the data health panel: a non zero unmapped count means a stage name has
 * changed and the funnel is silently wrong.
 */

/** Normalise for comparison. Case and whitespace insensitive, punctuation kept. */
function norm(label) {
  return String(label ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function buildStageMap(config) {
  const byLabel = new Map();
  const byStageId = new Map();

  for (const [bucket, labels] of Object.entries(config.byLabel ?? {})) {
    if (bucket.startsWith('_')) continue;
    for (const label of labels) byLabel.set(norm(label), bucket);
  }
  for (const [stageId, bucket] of Object.entries(config.byStageId ?? {})) {
    if (stageId.startsWith('_')) continue;
    byStageId.set(String(stageId), bucket);
  }

  return {
    byLabel,
    byStageId,
    funnelOrder: config.funnelOrder ?? ['lead', 'qualified', 'quoted', 'won'],
    cumulative: config.cumulative ?? {},
    deadReasons: config.deadReasons ?? {},

    /**
     * Resolve one stage to a bucket.
     * Stage id wins over label: a label is a display string any CRM user can
     * rename, an id is stable.
     */
    resolve({ stageId = null, label = null } = {}) {
      if (stageId !== null && stageId !== undefined && byStageId.has(String(stageId))) {
        return { bucket: byStageId.get(String(stageId)), matchedOn: 'stageId' };
      }
      const n = norm(label);
      if (n && byLabel.has(n)) return { bucket: byLabel.get(n), matchedOn: 'label' };
      return { bucket: 'unmapped', matchedOn: null };
    },
  };
}

/**
 * Classify a set of stage events or deals into buckets.
 *
 * Returns counts per bucket plus the distinct unmapped labels, which is what
 * actually helps someone fix the problem: knowing the count is 7 is much less
 * useful than knowing the label is "Quote  Sent" with a double space.
 */
export function classifyStages(items, stageMap) {
  const counts = { qualified: 0, quoted: 0, dead: 0, won: 0, ignore: 0, unmapped: 0 };
  const unmappedLabels = new Map();
  const deadByReason = new Map();

  for (const item of items ?? []) {
    const { bucket } = stageMap.resolve({ stageId: item.stageId, label: item.stageLabel ?? item.label });
    counts[bucket] = (counts[bucket] ?? 0) + 1;

    if (bucket === 'unmapped') {
      const raw = String(item.stageLabel ?? item.label ?? '(no label)');
      unmappedLabels.set(raw, (unmappedLabels.get(raw) ?? 0) + 1);
    }
    if (bucket === 'dead') {
      const raw = String(item.stageLabel ?? item.label ?? 'Unknown');
      const reason = stageMap.deadReasons[raw] ?? raw;
      deadByReason.set(reason, (deadByReason.get(reason) ?? 0) + 1);
    }
  }

  return {
    counts,
    // "Surface unmapped count on the dashboard. If it is non-zero, a stage name
    // has changed and the funnel is silently wrong."
    unmapped: counts.unmapped,
    unmappedLabels: [...unmappedLabels.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    deadByReason: [...deadByReason.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
  };
}

/**
 * Cumulative funnel counts.
 * "Quotes issued: count of deals at quote stage or beyond." A deal that reached
 * won also counts as quoted and as qualified.
 */
export function cumulativeCounts(bucketCounts, stageMap) {
  const out = {};
  for (const [stage, includes] of Object.entries(stageMap.cumulative)) {
    if (stage.startsWith('_')) continue;
    out[stage] = includes.reduce((sum, b) => sum + (bucketCounts[b] ?? 0), 0);
  }
  return out;
}
