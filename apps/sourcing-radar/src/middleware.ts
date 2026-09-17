import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookiesToSet = Array<{ name: string; value: string; options?: CookieOptions }>

/**
 * Refreshes the Supabase session on every request and keeps the dashboard
 * closed to anyone who is not signed in. There is no public access to this
 * application at all.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookiesToSet) => {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
        },
      },
    },
  )

  const { data } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isPublic = path.startsWith('/login') || path.startsWith('/auth')

  if (!data.user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // "New since last visit" is stamped on the way out, so the page itself still
  // reads the previous visit while it renders this one.
  if (path === '/feed' && data.user) {
    response.cookies.set('radar_last_visit', new Date().toISOString(), {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 90,
    })
  }

  return response
}

export const config = {
  // The Inngest and ingest endpoints authenticate themselves and must not be
  // redirected to the login page.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
