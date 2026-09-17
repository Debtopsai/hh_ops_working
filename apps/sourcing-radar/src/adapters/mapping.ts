/**
 * The declarative field mapping engine.
 *
 * Several NZ auction houses run on the same white label platform. Writing the
 * adapter against the platform rather than against one customer means Mainland,
 * Thorntons and the next house are a configuration row instead of new code, and
 * that is the whole payoff of this file.
 *
 * A mapping lives in `sources.config` and is filled in from the discovery
 * worksheet. Nothing in here contains a real endpoint or a real field name,
 * because those are discovered against the live sites and not guessed.
 */

export type TransformName =
  | 'trim'
  | 'lower'
  | 'upper'
  | 'string'
  | 'number'
  | 'stripHtml'
  | 'isoDate'
  | 'absoluteUrl'
  | 'array'

export interface FieldSpec {
  /** Dot and bracket path into the raw item, for example "lot.images[0].url". */
  path?: string
  /** Tried in order, first non empty wins. Useful where a platform renamed a field. */
  paths?: string[]
  /** Literal value, for sources where a field is constant (an auction house name, say). */
  const?: string | number | null
  /** "{title} lot {lotNumber}" style interpolation over other resolved paths. */
  template?: string
  transforms?: TransformName[]
  /** Base for 'absoluteUrl'. Usually the source's origin. */
  baseUrl?: string
}

export type FieldMap = Record<string, FieldSpec>

/** Read a dotted or bracketed path out of an arbitrary payload. */
export function readPath(source: unknown, path: string): unknown {
  if (!path) return undefined
  const segments = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)

  let current: unknown = source
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    if (Array.isArray(current)) {
      const index = Number.parseInt(segment, 10)
      if (Number.isNaN(index)) return undefined
      current = current[index]
      continue
    }
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function applyTransform(value: unknown, transform: TransformName, spec: FieldSpec): unknown {
  if (value === null || value === undefined) return value
  switch (transform) {
    case 'trim':
      return typeof value === 'string' ? value.trim() : value
    case 'lower':
      return typeof value === 'string' ? value.toLowerCase() : value
    case 'upper':
      return typeof value === 'string' ? value.toUpperCase() : value
    case 'string':
      return Array.isArray(value) ? value.join(' ') : String(value)
    case 'number': {
      if (typeof value === 'number') return Number.isFinite(value) ? value : null
      const cleaned = String(value).replace(/[^0-9.-]/g, '')
      const parsed = Number.parseFloat(cleaned)
      return Number.isFinite(parsed) ? parsed : null
    }
    case 'stripHtml':
      return typeof value === 'string'
        ? value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
        : value
    case 'isoDate': {
      const date = value instanceof Date ? value : new Date(String(value))
      return Number.isNaN(date.getTime()) ? null : date.toISOString()
    }
    case 'absoluteUrl': {
      const raw = String(value)
      if (/^https?:\/\//i.test(raw)) return raw
      if (!spec.baseUrl) return raw
      try {
        return new URL(raw, spec.baseUrl).toString()
      } catch {
        return raw
      }
    }
    case 'array':
      return Array.isArray(value) ? value : [value]
    default:
      return value
  }
}

export function resolveField(item: unknown, spec: FieldSpec | undefined): unknown {
  if (!spec) return undefined

  let value: unknown

  if (spec.template) {
    value = spec.template.replace(/\{([^}]+)\}/g, (_, path: string) => {
      const resolved = readPath(item, path.trim())
      return resolved === null || resolved === undefined ? '' : String(resolved)
    })
  } else if (spec.const !== undefined) {
    value = spec.const
  } else if (spec.paths?.length) {
    for (const path of spec.paths) {
      const candidate = readPath(item, path)
      if (!isEmpty(candidate)) {
        value = candidate
        break
      }
    }
  } else if (spec.path) {
    value = readPath(item, spec.path)
  }

  for (const transform of spec.transforms ?? []) {
    value = applyTransform(value, transform, spec)
  }
  return value
}

export function resolveString(item: unknown, spec: FieldSpec | undefined): string | null {
  const value = resolveField(item, spec)
  if (isEmpty(value)) return null
  return typeof value === 'string' ? value : String(value)
}

export function resolveNumber(item: unknown, spec: FieldSpec | undefined): number | null {
  const value = resolveField(item, spec)
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (isEmpty(value)) return null
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

export function resolveStringArray(item: unknown, spec: FieldSpec | undefined): string[] {
  const value = resolveField(item, spec)
  if (isEmpty(value)) return []
  const list = Array.isArray(value) ? value : [value]
  return list
    .flatMap((entry) => {
      if (typeof entry === 'string') return [entry]
      if (entry && typeof entry === 'object' && spec?.path) return []
      return entry === null || entry === undefined ? [] : [String(entry)]
    })
    .map((entry) => applyTransform(entry, 'absoluteUrl', spec ?? {}) as string)
    .filter((entry) => entry.length > 0)
}
