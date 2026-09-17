/**
 * Deduplication.
 *
 * Two different problems, handled differently (see 8).
 *
 * Same listing seen twice from one source is an identity problem, solved by the
 * unique index on (source_slug, external_id) with content_hash as the fallback.
 * That happens in the ingest runner.
 *
 * Same item on two sources is a judgement problem, and this module handles it.
 * Auction houses post their lots to Facebook and Turners runs some of its
 * auctions on Trade Me, so one machine can appear three times. We score the
 * pair, write a duplicate_candidates row above threshold and group the cards in
 * the feed under both source badges.
 *
 * We never auto merge and we never suppress the second listing. A wrong merge
 * hides a real machine, which is worse than showing a pair.
 */

import { hammingDistanceHex } from './hash'
import { normaliseText, tokenise } from './text'

export interface DedupeCandidate {
  id: string
  sourceSlug: string
  title: string
  priceExGst: number | null
  imagePhash: string | null
  closesAt?: string | null
}

export interface SimilarityResult {
  similarity: number
  reasons: string[]
}

export const DUPLICATE_THRESHOLD = 0.72

const WEIGHT_TITLE = 0.55
const WEIGHT_PRICE = 0.2
const WEIGHT_IMAGE = 0.25

function dice<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const entry of a) if (b.has(entry)) intersection += 1
  return (2 * intersection) / (a.size + b.size)
}

function trigrams(input: string): Set<string> {
  // Spaces removed, so "SCC 101" and "SCC101" collapse to the same characters.
  const compact = normaliseText(input).replace(/ /g, '')
  const grams = new Set<string>()
  for (let i = 0; i + 3 <= compact.length; i += 1) grams.add(compact.slice(i, i + 3))
  return grams
}

/**
 * Dice over singularised tokens, and again over character trigrams of the
 * despaced title, taking whichever is higher.
 *
 * The token pass alone scores "Rational SCC 101 combi oven" against "Rational
 * SCC101 Combi Oven 10 tray" at 0.55, because the model number is written two
 * ways. That is a real listing pair, and the trigram pass catches it. Two
 * genuinely different machines score low on both.
 */
export function titleSimilarity(a: string, b: string): number {
  const tokenScore = dice(
    new Set(tokenise(a).filter((token) => token.length > 1)),
    new Set(tokenise(b).filter((token) => token.length > 1)),
  )
  return Math.max(tokenScore, dice(trigrams(a), trigrams(b)))
}

/** 1.0 for identical prices, tapering to 0 at 30 percent apart. Unknown when either price is missing. */
export function priceProximity(a: number | null, b: number | null): number | null {
  if (a === null || b === null) return null
  if (a === 0 && b === 0) return 1
  const larger = Math.max(Math.abs(a), Math.abs(b))
  if (larger === 0) return 1
  const delta = Math.abs(a - b) / larger
  if (delta >= 0.3) return 0
  return 1 - delta / 0.3
}

/** 1.0 for an identical perceptual hash, 0 at 16 bits apart out of 64. */
export function imageSimilarity(a: string | null, b: string | null): number | null {
  if (!a || !b || a.length !== b.length) return null
  const distance = hammingDistanceHex(a, b)
  if (distance >= 16) return 0
  return 1 - distance / 16
}

/**
 * Weighted score over the signals that are actually available. A pair with no
 * image hash on either side is scored on title and price alone rather than
 * being penalised for missing data.
 */
export function scoreSimilarity(a: DedupeCandidate, b: DedupeCandidate): SimilarityResult {
  const reasons: string[] = []
  const signals: Array<[number, number]> = []

  const title = titleSimilarity(a.title, b.title)
  signals.push([title, WEIGHT_TITLE])
  if (title >= 0.8) reasons.push(`title ${Math.round(title * 100)} percent`)

  const price = priceProximity(a.priceExGst, b.priceExGst)
  if (price !== null) {
    signals.push([price, WEIGHT_PRICE])
    if (price >= 0.8) reasons.push('price within a few percent')
  }

  const image = imageSimilarity(a.imagePhash, b.imagePhash)
  if (image !== null) {
    signals.push([image, WEIGHT_IMAGE])
    if (image >= 0.8) reasons.push('near identical image')
  }

  const totalWeight = signals.reduce((sum, [, weight]) => sum + weight, 0)
  const weighted = signals.reduce((sum, [value, weight]) => sum + value * weight, 0)
  const similarity = totalWeight === 0 ? 0 : Math.round((weighted / totalWeight) * 1000) / 1000

  return { similarity, reasons }
}

/**
 * Compare one new listing against recent listings from other sources.
 * Same source pairs are skipped: those are handled by the unique index.
 */
export function findDuplicateCandidates(
  subject: DedupeCandidate,
  others: DedupeCandidate[],
  threshold: number = DUPLICATE_THRESHOLD,
): Array<{ other: DedupeCandidate } & SimilarityResult> {
  const found: Array<{ other: DedupeCandidate } & SimilarityResult> = []
  for (const other of others) {
    if (other.id === subject.id) continue
    if (other.sourceSlug === subject.sourceSlug) continue
    const result = scoreSimilarity(subject, other)
    if (result.similarity >= threshold) found.push({ other, ...result })
  }
  return found.sort((x, y) => y.similarity - x.similarity)
}
