import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isAdmin(session: any): boolean {
  if (!session?.user) return false
  return (
    session.user.app_metadata?.role === 'admin' ||
    session.user.user_metadata?.role === 'admin'
  )
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  const isAuthPage   = pathname.startsWith('/auth')
  const isPublicPage = pathname === '/'
  const isAdminPage  = pathname.startsWith('/admin')
  const isResetPage  = pathname === '/auth/reset-password'

  // Not logged in → login
  if (!session && !isAuthPage && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Logged in → skip auth pages (except reset)
  if (session && isAuthPage && !isResetPage) {
    const url = request.nextUrl.clone()
    // Admin → admin dashboard, user → user dashboard
    url.pathname = isAdmin(session) ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // Admin pages → must be admin
  if (isAdminPage && session && !isAdmin(session)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
