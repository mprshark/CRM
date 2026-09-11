import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type Role = 'ambassador' | 'manager' | 'admin' | 'super_admin'

const ADMIN_ROLES: Role[] = ['admin', 'super_admin']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Public auth routes — allow unauthenticated
  const isLoginPage = path === '/login' || path.startsWith('/login/')
  const isAdminLoginPage = path === '/admin' && !path.startsWith('/admin/dashboard')

  if (!user) {
    if (isLoginPage || isAdminLoginPage) return supabaseResponse

    const url = request.nextUrl.clone()
    url.pathname = path.startsWith('/admin') ? '/admin' : '/login'
    return NextResponse.redirect(url)
  }

  // Fetch role for authenticated users
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role: Role = profile?.role ?? 'ambassador'
  const isAdminRole = ADMIN_ROLES.includes(role)

  // If logged in admin hits /login → send to their dashboard
  if (isAdminRole && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // If logged in ambassador/manager hits /admin login page → send to their dashboard
  if (!isAdminRole && isAdminLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = role === 'manager' ? '/manager' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // Non-admin trying to access /admin/* routes
  if (!isAdminRole && path.startsWith('/admin/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Manager trying to access ambassador-only /dashboard
  if (role === 'manager' && path === '/dashboard') {
    const url = request.nextUrl.clone()
    url.pathname = '/manager'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
