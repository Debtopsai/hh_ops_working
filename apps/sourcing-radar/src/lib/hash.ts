/**
 * Hashing.
 *
 * `contentHash` is the fallback identity for a listing when a source does not
 * expose a stable id of its own. It covers normalised title, price and seller,
 * so re seeing the same listing updates last_seen_at instead of creating a
 * second row and a second alert.
 *
 * `dHash` is a difference hash over a 9x8 greyscale thumbnail. It is used only
 * as one signal in cross source duplicate detection, never to merge anything on
 * its own.
 */

import { createHash } from 'node:crypto'
import { normaliseText } from './text'

export function contentHash(input: {
  title: string
  priceExGst?: number | null
  sellerName?: string | null
}): string {
  const parts = [
    normaliseText(input.title),
    input.priceExGst === null || input.priceExGst === undefined ? 'noprice' : input.priceExGst.toFixed(2),
    normaliseText(input.sellerName) || 'noseller',
  ]
  return createHash('sha256').update(parts.join('|')).digest('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Difference hash from a greyscale 9x8 pixel buffer (9 wide, 8 tall, one byte
 * per pixel, row major). Produces 64 bits as 16 hex characters.
 */
export function dHashFromGreyscale9x8(pixels: Uint8Array | number[]): string {
  const width = 9
  const height = 8
  if (pixels.length !== width * height) {
    throw new Error(`dHash expects ${width * height} greyscale pixels, received ${pixels.length}`)
  }
  let bits = ''
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      bits += pixels[y * width + x] > pixels[y * width + x + 1] ? '1' : '0'
    }
  }
  let hex = ''
  for (let i = 0; i < bits.length; i += 4) {
    hex += Number.parseInt(bits.slice(i, i + 4), 2).toString(16)
  }
  return hex
}

const HEX_BIT_COUNT = Array.from({ length: 16 }, (_, value) => value.toString(2).split('1').length - 1)

/** Hamming distance between two equal length hex hashes, in bits. */
export function hammingDistanceHex(a: string, b: string): number {
  if (a.length !== b.length) throw new Error('hash lengths differ')
  let distance = 0
  for (let i = 0; i < a.length; i += 1) {
    const xor = Number.parseInt(a[i], 16) ^ Number.parseInt(b[i], 16)
    distance += HEX_BIT_COUNT[xor]
  }
  return distance
}
