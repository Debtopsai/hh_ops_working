import type { Metadata } from 'next'
import Link from 'next/link'
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
        <main>{children}</main>
      </body>
    </html>
  )
}
