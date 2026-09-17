'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Clip a listing by hand.
 *
 * Anything found outside the adapters lands in the same feed, so it is matched,
 * deduped and triaged like everything else. The extension's clip button posts
 * to the same endpoint in Phase 3.
 */
export function ClipForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function clip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setState('saving')
    setMessage(null)

    const response = await fetch('/api/clip', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        url: form.get('url'),
        title: form.get('title'),
        price: form.get('price'),
        priceBasis: form.get('priceBasis'),
        region: form.get('region'),
        description: form.get('description'),
      }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      setMessage(body.error ?? 'Could not save that clip.')
      setState('error')
      return
    }

    const result = await response.json()
    setMessage(result.listingsNew === 1 ? 'Clipped.' : 'Already in the feed.')
    setState('idle')
    router.refresh()
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        Clip a listing
      </button>
    )
  }

  return (
    <form onSubmit={clip} className="panel stack">
      <div className="row">
        <label className="field" style={{ flex: '2 1 320px' }}>
          Link
          <input name="url" type="url" required placeholder="https://" />
        </label>
        <label className="field" style={{ flex: '2 1 320px' }}>
          Title
          <input name="title" required placeholder="Rational SCC 101 combi oven" />
        </label>
      </div>
      <div className="row">
        <label className="field">
          Price
          <input name="price" placeholder="leave blank if there is none" />
        </label>
        <label className="field">
          Price basis
          <select name="priceBasis" defaultValue="unknown">
            <option value="unknown">Not stated</option>
            <option value="inc_gst">GST inclusive</option>
            <option value="ex_gst">Ex GST</option>
          </select>
        </label>
        <label className="field">
          Location
          <input name="region" placeholder="Penrose, Auckland" />
        </label>
      </div>
      <label className="field">
        Notes
        <input name="description" placeholder="anything worth recording" />
      </label>
      <div className="row">
        <button className="primary" type="submit" disabled={state === 'saving'}>
          {state === 'saving' ? 'Saving' : 'Save to feed'}
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
        {message ? <span className="footnote">{message}</span> : null}
      </div>
      <p className="footnote">
        A price left blank stays blank. It shows as "price TBC" in the feed rather than as zero.
      </p>
    </form>
  )
}
