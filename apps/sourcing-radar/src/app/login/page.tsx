'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

/**
 * Email magic link. There is no self registration: an address that the admin
 * has not invited gets a link that signs in to nothing, because every table is
 * behind RLS keyed on a row in app_users.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function signIn(event: React.FormEvent) {
    event.preventDefault()
    setState('sending')
    setError(null)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (signInError) {
      setError(signInError.message)
      setState('error')
      return
    }
    setState('sent')
  }

  return (
    <div className="panel" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h1>Sign in</h1>
      <p className="subtitle">Sourcing Radar is invite only. Three seats, no public access.</p>
      {state === 'sent' ? (
        <p>Check your inbox. The link signs you in on this device.</p>
      ) : (
        <form onSubmit={signIn} className="stack">
          <label className="field">
            Email
            <input
              type="email"
              value={email}
              required
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@washpro.co.nz"
            />
          </label>
          <button className="primary" type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending' : 'Email me a link'}
          </button>
          {error ? <p style={{ color: 'var(--bad)' }}>{error}</p> : null}
        </form>
      )}
    </div>
  )
}
