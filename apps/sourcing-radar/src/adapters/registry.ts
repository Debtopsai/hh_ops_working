/**
 * Adapter registry.
 *
 * Adding a source is one `sources` row. Adding a source on a platform we do not
 * support yet is one adapter file plus one row.
 *
 * Phase 2 (email_inbound) and Phase 3 (extension) are registered as explicitly
 * unimplemented rather than silently missing, so an operator who enables one
 * early sees why nothing arrived on Source health.
 */

import type { Adapter } from './types'
import { jsonCatalogueAdapter } from './json-catalogue'
import { htmlListingAdapter } from './html-listing'
import { manualClipAdapter } from './manual-clip'
import type { SourceRow } from '@/lib/types'

export class AdapterNotBuiltError extends Error {
  constructor(adapterType: string, phase: string) {
    super(`The "${adapterType}" adapter is ${phase} work and is not built yet.`)
    this.name = 'AdapterNotBuiltError'
  }
}

const REGISTRY: Partial<Record<SourceRow['adapterType'], Adapter>> = {
  json_catalogue: jsonCatalogueAdapter,
  html_listing: htmlListingAdapter,
  manual_clip: manualClipAdapter,
}

const NOT_BUILT: Partial<Record<SourceRow['adapterType'], string>> = {
  email_inbound: 'Phase 2',
  extension: 'Phase 3',
}

export function getAdapter(adapterType: SourceRow['adapterType']): Adapter {
  const adapter = REGISTRY[adapterType]
  if (adapter) return adapter
  const phase = NOT_BUILT[adapterType]
  if (phase) throw new AdapterNotBuiltError(adapterType, phase)
  throw new Error(`Unknown adapter type "${adapterType}"`)
}

export function isAdapterBuilt(adapterType: SourceRow['adapterType']): boolean {
  return Boolean(REGISTRY[adapterType])
}
