import type { Metadata } from 'next'
import Link from 'next/link'
import { isPreviewMode } from '@/lib/preview'
import './globals.css'

export const metadata: Metadata = {
  title: 'Washpro Sourcing Radar',
  description: 'Every matching used commercial kitchen equipment listing, in one feed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <span className="brand">Sourcing Radar</span>
            <nav className="tabs">
              <Link href="/feed">Feed</Link>
              <Link href="/watchlist">Watchlist</Link>
              <Link href="/sources">Source health</Link>
              <Link href="/settings">Settings</Link>
            </nav>
          </div>
        </header>
        {isPreviewMode() ? (
          <div
            style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '8px 16px',
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            Preview mode. Every listing, run and seat on these screens is sample data, not a real listing from any
            source. No source endpoints have been discovered yet, see docs/DISCOVERY.md.
          </div>
        ) : null}
        <main>{children}</main>
      </body>
    </html>
  )
}
