/**
 * Text normalisation shared by matching, hashing and duplicate detection.
 *
 * Matching is case insensitive with simple plural and hyphen normalisation, and
 * it works on whole tokens rather than substrings. Substring matching is the
 * obvious implementation and it is wrong here: the negative keyword "home"
 * would kill every listing containing "chrome", and "bratt pan" would match
 * "bratt pans" only by accident.
 */

const PUNCTUATION = /[^\p{L}\p{N}]+/gu

/** Lowercase, strip accents, turn hyphens and punctuation into spaces. */
export function normaliseText(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Crude singulariser. It only has to be good enough that "dishwashers" and
 * "dishwasher" are the same token, and it must never mangle a word that ends in
 * a double s, so "glass" stays "glass".
 */
export function singularise(token: string): string {
  if (token.length <= 3) return token
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`
  if (/(ss|sh|ch|x|z)es$/.test(token)) return token.slice(0, -2)
  if (token.endsWith('ss')) return token
  if (token.endsWith('s') && !token.endsWith('us') && !token.endsWith('is')) return token.slice(0, -1)
  return token
}

export function tokenise(input: string | null | undefined): string[] {
  const text = normaliseText(input)
  if (!text) return []
  return text.split(' ').map(singularise)
}

/** True when the keyword's token sequence appears in the haystack tokens. */
export function containsPhrase(haystack: string[], phraseTokens: string[]): boolean {
  if (phraseTokens.length === 0) return false
  if (phraseTokens.length > haystack.length) return false
  for (let i = 0; i <= haystack.length - phraseTokens.length; i += 1) {
    let hit = true
    for (let j = 0; j < phraseTokens.length; j += 1) {
      if (haystack[i + j] !== phraseTokens[j]) {
        hit = false
        break
      }
    }
    if (hit) return true
  }
  return false
}
