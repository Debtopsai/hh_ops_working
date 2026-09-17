/**
 * Preview mode.
 *
 * Runs the whole dashboard with sample data and no Supabase, so the interface
 * can be looked at and clicked through before any credentials exist or any
 * source endpoint has been discovered.
 *
 * Everything in here is invented sample data, clearly labelled as such in the
 * interface. It is for looking at the screens, not for judging what the sources
 * actually return.
 *
 * Switch it on with PREVIEW_MODE=1. It is off unless that is set, and it is
 * refused outright when real Supabase credentials are present, so it cannot be
 * left on by accident in front of live data.
 */

import type { FeedCardListing } from '@/app/feed/FeedCard'

export function isPreviewMode(): boolean {
  if (process.env.PREVIEW_MODE !== '1') return false
  // If a real project is configured, preview mode is a mistake. Fail closed.
  return !process.env.SUPABASE_SERVICE_ROLE_KEY
}

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString()
const daysFromNow = (days: number) => new Date(Date.now() + days * 86400_000).toISOString()

export const PREVIEW_SOURCES = [
  {
    slug: 'all_about_auctions',
    name: 'All About Auctions',
    adapter_type: 'json_catalogue',
    enabled: true,
    poll_interval_seconds: 1800,
    region_default: 'Auckland',
    config: { discovered: true },
  },
  {
    slug: 'number8',
    name: 'No. 8 Solutions',
    adapter_type: 'json_catalogue',
    enabled: true,
    poll_interval_seconds: 1800,
    region_default: 'Auckland',
    config: { discovered: true },
  },
  {
    slug: 'mainland',
    name: 'Mainland Auctions',
    adapter_type: 'json_catalogue',
    enabled: true,
    poll_interval_seconds: 1800,
    region_default: 'Christchurch',
    config: { discovered: true },
  },
  {
    slug: 'turners',
    name: 'Turners General Goods',
    adapter_type: 'html_listing',
    enabled: false,
    poll_interval_seconds: 3600,
    region_default: null,
    config: {},
  },
  {
    slug: 'trademe_email',
    name: 'Trade Me (saved search alerts)',
    adapter_type: 'email_inbound',
    enabled: false,
    poll_interval_seconds: 0,
    region_default: null,
    config: {},
  },
  {
    slug: 'facebook',
    name: 'Facebook Marketplace',
    adapter_type: 'extension',
    enabled: false,
    poll_interval_seconds: 0,
    region_default: 'Auckland',
    config: {},
  },
  {
    slug: 'manual_clip',
    name: 'Manual clip',
    adapter_type: 'manual_clip',
    enabled: true,
    poll_interval_seconds: 0,
    region_default: null,
    config: {},
  },
]

export const PREVIEW_TERMS = [
  { id: 'term-rational', label: 'Rational', keywords: ['rational', 'self cooking centre'], negative_keywords: ['parts only'], category: 'combi ovens', max_price_ex_gst: 12000, region: null, active: true, source_slugs: ['all_about_auctions', 'number8', 'mainland'] },
  { id: 'term-starline', label: 'Starline', keywords: ['starline'], negative_keywords: [], category: 'commercial dishwashers', max_price_ex_gst: null, region: null, active: true, source_slugs: [] },
  { id: 'term-hobart', label: 'Hobart', keywords: ['hobart'], negative_keywords: ['stand mixer'], category: null, max_price_ex_gst: null, region: null, active: true, source_slugs: [] },
  { id: 'term-glasswasher', label: 'Glasswasher', keywords: ['glasswasher', 'glass washer'], negative_keywords: [], category: 'glasswashers', max_price_ex_gst: 4000, region: null, active: true, source_slugs: [] },
  { id: 'term-fryer', label: 'Deep fryer', keywords: ['deep fryer', 'twin basket fryer'], negative_keywords: [], category: 'deep fryers', max_price_ex_gst: null, region: null, active: true, source_slugs: [] },
  { id: 'term-bratt', label: 'Bratt pan', keywords: ['bratt pan'], negative_keywords: [], category: 'bratt pans', max_price_ex_gst: null, region: null, active: false, source_slugs: [] },
]

export const PREVIEW_MATCH_COUNTS = {
  sevenDay: { 'term-rational': 4, 'term-starline': 7, 'term-hobart': 2, 'term-glasswasher': 3, 'term-fryer': 1, 'term-bratt': 0 } as Record<string, number>,
  thirtyDay: { 'term-rational': 17, 'term-starline': 31, 'term-hobart': 9, 'term-glasswasher': 12, 'term-fryer': 6, 'term-bratt': 0 } as Record<string, number>,
}

export const PREVIEW_NEGATIVES = [
  'domestic', 'home', 'kitchenaid', 'benchtop mixer', 'toy', 'parts only', 'for parts', 'not working',
]

export const PREVIEW_CATEGORIES = [
  'commercial dishwashers', 'glasswashers', 'combi ovens', 'convection ovens', 'pizza ovens',
  'deep fryers', 'gas burners and cooktops', 'chargrills', 'bratt pans', 'mixers',
  'refrigeration', 'holding and display cabinets', 'toasters', 'food prep',
]

export const PREVIEW_LISTINGS: FeedCardListing[] = [
  {
    id: 'p1',
    title: 'Rational SCC 101 combi oven, 10 tray, single phase',
    url: 'https://example.test/lot/10021',
    priceExGst: 5000,
    priceBasis: 'inc_gst',
    imageUrl: null,
    sourceName: 'All About Auctions',
    region: 'Auckland',
    outOfRegion: false,
    matchedTerms: ['Rational'],
    closesAt: daysFromNow(2),
    firstSeenAt: hoursAgo(1),
    lotNumber: '21',
    state: null,
    stateBy: null,
    stateNote: null,
    duplicateSources: ['No. 8 Solutions'],
    isNewSinceLastVisit: true,
  },
  {
    id: 'p2',
    title: 'Starline undercounter glasswasher, awaiting valuation',
    url: 'https://example.test/lot/10023',
    priceExGst: null,
    priceBasis: 'unknown',
    imageUrl: null,
    sourceName: 'Turners General Goods',
    region: 'Canterbury',
    outOfRegion: true,
    matchedTerms: ['Starline', 'Glasswasher'],
    closesAt: null,
    firstSeenAt: hoursAgo(3),
    lotNumber: null,
    state: null,
    stateBy: null,
    stateNote: null,
    duplicateSources: [],
    isNewSinceLastVisit: true,
  },
  {
    id: 'p3',
    title: 'Hobart AM900 passthrough dishwasher, ex restaurant',
    url: 'https://example.test/lot/10031',
    priceExGst: 3260.87,
    priceBasis: 'inc_gst',
    imageUrl: null,
    sourceName: 'No. 8 Solutions',
    region: 'Auckland',
    outOfRegion: false,
    matchedTerms: ['Hobart'],
    closesAt: daysFromNow(1),
    firstSeenAt: hoursAgo(6),
    lotNumber: '114',
    state: 'watching',
    stateBy: 'Sourcing support',
    stateNote: 'Ringing them about the wash arm before Thursday',
    duplicateSources: [],
    isNewSinceLastVisit: false,
  },
  {
    id: 'p4',
    title: 'Blue Seal twin basket deep fryer, gas',
    url: 'https://example.test/lot/10044',
    priceExGst: 1304.35,
    priceBasis: 'inc_gst',
    imageUrl: null,
    sourceName: 'Mainland Auctions',
    region: 'Canterbury',
    outOfRegion: true,
    matchedTerms: ['Deep fryer'],
    closesAt: daysFromNow(4),
    firstSeenAt: hoursAgo(9),
    lotNumber: '7',
    state: null,
    stateBy: null,
    stateNote: null,
    duplicateSources: [],
    isNewSinceLastVisit: false,
  },
  {
    id: 'p5',
    title: 'Moffat Turbofan E32D4 convection oven',
    url: 'https://example.test/lot/10052',
    priceExGst: 2173.91,
    priceBasis: 'inc_gst',
    imageUrl: null,
    sourceName: 'All About Auctions',
    region: 'Auckland',
    outOfRegion: false,
    matchedTerms: ['Moffat'],
    closesAt: daysFromNow(2),
    firstSeenAt: hoursAgo(20),
    lotNumber: '58',
    state: 'dismissed',
    stateBy: 'Founder',
    stateNote: 'Element gone, not worth the refurb',
    duplicateSources: [],
    isNewSinceLastVisit: false,
  },
  {
    id: 'p6',
    title: 'Winterhalter GS502 passthrough, spare parts machine',
    url: 'https://example.test/lot/10061',
    priceExGst: 600,
    priceBasis: 'ex_gst',
    imageUrl: null,
    sourceName: 'Manual clip',
    region: 'Waikato',
    outOfRegion: true,
    matchedTerms: ['Winterhalter'],
    closesAt: null,
    firstSeenAt: hoursAgo(26),
    lotNumber: null,
    state: 'bought',
    stateBy: 'Founder',
    stateNote: 'Picked up Tuesday',
    duplicateSources: [],
    isNewSinceLastVisit: false,
  },
]

export const PREVIEW_RUNS = [
  { source_slug: 'all_about_auctions', started_at: hoursAgo(0.3), finished_at: hoursAgo(0.29), status: 'ok', listings_seen: 42, listings_new: 3, error: null, detail: {} },
  { source_slug: 'number8', started_at: hoursAgo(0.4), finished_at: hoursAgo(0.39), status: 'ok', listings_seen: 88, listings_new: 1, error: null, detail: {} },
  { source_slug: 'mainland', started_at: hoursAgo(0.5), finished_at: hoursAgo(0.49), status: 'error', listings_seen: 0, listings_new: 0, error: 'Source "mainland" fetch failed: catering returned HTTP 503', detail: {} },
  { source_slug: 'turners', started_at: hoursAgo(1.1), finished_at: hoursAgo(1.09), status: 'not_configured', listings_seen: 0, listings_new: 0, error: 'Source "turners" has no discovered configuration yet. Missing: config.discovered, config.searchUrlTemplate, config.itemSelector. Follow docs/DISCOVERY.md, then write the result into the sources.config column.', detail: {} },
]

export const PREVIEW_HEALTH_ALERTS = [
  { source_slug: 'mainland', reason: 'adapter threw', detail: 'catering returned HTTP 503', raised_at: hoursAgo(0.5), cleared_at: null },
]

export const PREVIEW_LISTINGS_LAST_24H: Record<string, number> = {
  all_about_auctions: 3,
  number8: 1,
  mainland: 0,
  turners: 0,
  manual_clip: 1,
}

export const PREVIEW_ME = {
  id: 'preview-founder',
  email: 'founder@washpro.co.nz',
  display_name: 'Founder',
  role: 'admin',
  whatsapp_number: '',
  whatsapp_opt_in: false,
  email_alerts: true,
  quiet_hours_start: 21,
  quiet_hours_end: 6,
  timezone: 'Pacific/Auckland',
}

export const PREVIEW_USERS = [
  { id: 'preview-founder', email: 'founder@washpro.co.nz', display_name: 'Founder', role: 'admin', whatsapp_opt_in: false, email_alerts: true },
  { id: 'preview-support1', email: 'sourcing1@washpro.co.nz', display_name: 'Sourcing support', role: 'viewer', whatsapp_opt_in: false, email_alerts: true },
  { id: 'preview-support2', email: 'sourcing2@washpro.co.nz', display_name: 'Sourcing support', role: 'viewer', whatsapp_opt_in: false, email_alerts: true },
]

export const PREVIEW_CONFIG = {
  home_region: 'Auckland',
  facebook_adapter_enabled: false,
  fb_min_seconds_between_searches: 90,
  fb_max_seconds_between_searches: 180,
  fb_max_searches_per_hour: 20,
  alerts_per_recipient_per_hour: 6,
  digest_threshold: 5,
}

export const PREVIEW_DEVICE_TOKENS: Array<{ id: string; label: string; last_seen_at: string | null; created_at: string }> = []
