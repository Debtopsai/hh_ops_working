/**
 * Outbound fetch with rate limiting and backoff.
 *
 * Per source concurrency is one, and every adapter goes through here. These
 * sites are small New Zealand businesses, and a sourcing tool that hammers a
 * catalogue is both rude and the fastest way to get blocked.
 */

export interface FetchOptions {
  headers?: Record<string, string>
  timeoutMs?: number
  retries?: number
  /** Minimum gap between requests to the same host, in milliseconds. */
  minIntervalMs?: number
  fetchImpl?: typeof fetch
  sleepImpl?: (ms: number) => Promise<void>
}

const DEFAULTS = {
  timeoutMs: 20_000,
  retries: 3,
  minIntervalMs: 1_000,
}

const lastRequestByHost = new Map<string, number>()

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function politeFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const {
    headers = {},
    timeoutMs = DEFAULTS.timeoutMs,
    retries = DEFAULTS.retries,
    minIntervalMs = DEFAULTS.minIntervalMs,
    fetchImpl = fetch,
    sleepImpl = defaultSleep,
  } = options

  const host = new URL(url).host
  const since = Date.now() - (lastRequestByHost.get(host) ?? 0)
  if (since < minIntervalMs) await sleepImpl(minIntervalMs - since)

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      lastRequestByHost.set(host, Date.now())
      const response = await fetchImpl(url, { headers, signal: controller.signal })
      clearTimeout(timer)

      // 429 and 5xx are worth backing off for. A 4xx other than 429 is a
      // configuration problem and retrying it just adds load.
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`)
        if (attempt < retries) {
          await sleepImpl(backoffMs(attempt, response.headers.get('retry-after')))
          continue
        }
      }
      return response
    } catch (error) {
      clearTimeout(timer)
      lastError = error
      if (attempt < retries) {
        await sleepImpl(backoffMs(attempt, null))
        continue
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

export function backoffMs(attempt: number, retryAfterHeader: string | null): number {
  if (retryAfterHeader) {
    const seconds = Number.parseInt(retryAfterHeader, 10)
    if (Number.isFinite(seconds) && seconds > 0) return Math.min(seconds * 1000, 60_000)
  }
  const base = 2 ** attempt * 1000
  const jitter = Math.random() * 500
  return Math.min(base + jitter, 30_000)
}

export function resetRateLimiterForTests(): void {
  lastRequestByHost.clear()
}
