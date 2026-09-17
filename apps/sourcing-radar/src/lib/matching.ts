/**
 * Matching listings against the buying profile.
 *
 * The watchlist is configuration, not code. A listing matching any active term
 * is a hit; a listing matching a term whose maximum price sits above the
 * listing price is a stronger hit and ranks higher.
 *
 * Negative keywords are treated as required rather than optional, because noise
 * is the quiet failure mode of this whole product. Global negatives kill the
 * listing outright, term negatives kill only that term's match.
 */

import { containsPhrase, tokenise } from './text'
import type { Region } from './region'

export interface WatchTerm {
  id: string
  label: string
  keywords: string[]
  negativeKeywords: string[]
  category: string | null
  maxPriceExGst: number | null
  region: Region | null
  sourceSlugs: string[]
  active: boolean
}

export interface MatchableListing {
  title: string
  description?: string | null
  priceExGst?: number | null
  region?: Region | null
  sourceSlug: string
}

export interface TermMatch {
  watchTermId: string
  label: string
  score: number
  matchedKeywords: string[]
  underMaxPrice: boolean
}

export interface MatchResult {
  matches: TermMatch[]
  /** Set when a global negative keyword suppressed the listing entirely. */
  suppressedBy: string | null
}

const TITLE_WEIGHT = 2
const DESCRIPTION_WEIGHT = 1
/** A listing under a term's ceiling is a stronger hit, so it ranks above one without a ceiling. */
const UNDER_MAX_PRICE_MULTIPLIER = 1.5

function round3(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000
}

function findKeyword(keyword: string, titleTokens: string[], descriptionTokens: string[]) {
  const phrase = tokenise(keyword)
  if (phrase.length === 0) return null
  if (containsPhrase(titleTokens, phrase)) return { keyword, weight: TITLE_WEIGHT }
  if (containsPhrase(descriptionTokens, phrase)) return { keyword, weight: DESCRIPTION_WEIGHT }
  return null
}

export function matchListing(
  listing: MatchableListing,
  terms: WatchTerm[],
  globalNegativeKeywords: string[] = [],
): MatchResult {
  const titleTokens = tokenise(listing.title)
  const descriptionTokens = tokenise(listing.description)

  for (const negative of globalNegativeKeywords) {
    if (findKeyword(negative, titleTokens, descriptionTokens)) {
      return { matches: [], suppressedBy: negative }
    }
  }

  const matches: TermMatch[] = []

  for (const term of terms) {
    if (!term.active) continue
    if (term.sourceSlugs.length > 0 && !term.sourceSlugs.includes(listing.sourceSlug)) continue
    // A term scoped to a region only matches listings in it. An unknown region
    // is not excluded: we would rather show it and let the founder judge.
    if (term.region && listing.region && listing.region !== 'Unknown' && listing.region !== term.region) continue

    let killed = false
    for (const negative of term.negativeKeywords) {
      if (findKeyword(negative, titleTokens, descriptionTokens)) {
        killed = true
        break
      }
    }
    if (killed) continue

    const hits = term.keywords
      .map((keyword) => findKeyword(keyword, titleTokens, descriptionTokens))
      .filter((hit): hit is { keyword: string; weight: number } => hit !== null)

    if (hits.length === 0) continue

    const underMaxPrice =
      term.maxPriceExGst !== null &&
      listing.priceExGst !== null &&
      listing.priceExGst !== undefined &&
      listing.priceExGst <= term.maxPriceExGst

    let score = hits.reduce((total, hit) => total + hit.weight, 0)
    if (underMaxPrice) score *= UNDER_MAX_PRICE_MULTIPLIER

    matches.push({
      watchTermId: term.id,
      label: term.label,
      score: round3(score),
      matchedKeywords: hits.map((hit) => hit.keyword),
      underMaxPrice,
    })
  }

  matches.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
  return { matches, suppressedBy: null }
}

/** The single best term for a listing, used for the "matched term" line on the card. */
export function bestMatch(result: MatchResult): TermMatch | null {
  return result.matches[0] ?? null
}
