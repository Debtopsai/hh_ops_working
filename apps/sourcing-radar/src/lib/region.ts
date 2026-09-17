/**
 * Region.
 *
 * Adding Mainland (Christchurch) and Turners (nine branches) changed the
 * geography of this tool. South Island listings are not filtered out, because a
 * Rational combi at the right price in Christchurch is still worth buying with
 * freight included. But the founder must not have to open the listing to find
 * out where it is, so region is a first class field on every listing, shown on
 * the card face.
 *
 * Sources write location as free text, anything from "Timaru" to "Turners
 * Palmerston North Trucks and Machinery", so the raw string is kept in
 * `region_raw` and the normalised value comes from the controlled list below.
 */

export const NZ_REGIONS = [
  'Northland',
  'Auckland',
  'Waikato',
  'Bay of Plenty',
  'Gisborne',
  "Hawke's Bay",
  'Taranaki',
  'Manawatu-Whanganui',
  'Wellington',
  'Tasman',
  'Nelson',
  'Marlborough',
  'West Coast',
  'Canterbury',
  'Otago',
  'Southland',
  'Unknown',
] as const

export type Region = (typeof NZ_REGIONS)[number]

export const SOUTH_ISLAND_REGIONS: ReadonlySet<Region> = new Set<Region>([
  'Tasman', 'Nelson', 'Marlborough', 'West Coast', 'Canterbury', 'Otago', 'Southland',
])

/**
 * Place names seen on the sources, mapped to the controlled list. Add to this
 * as new branch and suburb names turn up rather than widening the region list.
 */
const PLACE_TO_REGION: ReadonlyArray<[RegExp, Region]> = [
  [/\b(whangarei|kerikeri|kaitaia|dargaville|northland)\b/, 'Northland'],
  [/\b(auckland|akl|manukau|penrose|albany|henderson|takanini|east tamaki|onehunga|papakura|north shore|waitakere|pukekohe)\b/, 'Auckland'],
  [/\b(hamilton|waikato|ngaruawahia|cambridge|te awamutu|tokoroa|thames|matamata|huntly|taupo)\b/, 'Waikato'],
  [/\b(tauranga|bay of plenty|rotorua|whakatane|mount maunganui|te puke|kawerau)\b/, 'Bay of Plenty'],
  [/\b(gisborne|tairawhiti)\b/, 'Gisborne'],
  [/\b(napier|hastings|hawke'?s bay|havelock north|wairoa)\b/, "Hawke's Bay"],
  [/\b(new plymouth|taranaki|hawera|stratford)\b/, 'Taranaki'],
  [/\b(palmerston north|manawatu|whanganui|wanganui|levin|feilding|dannevirke)\b/, 'Manawatu-Whanganui'],
  [/\b(wellington|lower hutt|upper hutt|porirua|petone|kapiti|paraparaumu|masterton|wairarapa|seaview)\b/, 'Wellington'],
  [/\b(nelson|stoke|richmond nelson)\b/, 'Nelson'],
  [/\b(tasman|motueka|takaka)\b/, 'Tasman'],
  [/\b(blenheim|marlborough|picton)\b/, 'Marlborough'],
  [/\b(greymouth|westport|hokitika|west coast)\b/, 'West Coast'],
  [/\b(christchurch|chch|canterbury|timaru|ashburton|rangiora|rolleston|kaiapoi|hornby|wigram|oamaru north)\b/, 'Canterbury'],
  [/\b(dunedin|otago|queenstown|wanaka|oamaru|balclutha|alexandra|cromwell)\b/, 'Otago'],
  [/\b(invercargill|southland|gore|te anau)\b/, 'Southland'],
]

const EXACT_REGIONS = new Map<string, Region>(NZ_REGIONS.map((r) => [r.toLowerCase(), r]))

/**
 * Normalise a free text location to the controlled list.
 *
 * Returns 'Unknown' when nothing matches. An unknown region is shown as unknown
 * in the feed rather than being quietly defaulted to Auckland, because a wrong
 * region badge is worse than an absent one.
 */
export function normaliseRegion(raw: string | null | undefined, fallback: Region = 'Unknown'): Region {
  if (!raw) return fallback
  const text = raw.toLowerCase().replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return fallback

  const exact = EXACT_REGIONS.get(text)
  if (exact) return exact

  for (const [pattern, region] of PLACE_TO_REGION) {
    if (pattern.test(text)) return region
  }
  return fallback
}

export function isSouthIsland(region: Region): boolean {
  return SOUTH_ISLAND_REGIONS.has(region)
}

/**
 * Out of region drives a visible badge on the card. The home region is
 * configurable and defaults to Auckland.
 *
 * An unknown region is not flagged out of region: we do not know that it is.
 */
export function isOutOfRegion(region: Region, homeRegion: Region): boolean {
  if (region === 'Unknown') return false
  return region !== homeRegion
}

/**
 * Indicative freight from the South Island to Auckland is a [TBC] on the
 * founder. Until it is answered there is no landed cost, and the feed says so
 * rather than showing a made up number.
 */
export const FREIGHT_ESTIMATE_AVAILABLE = false
