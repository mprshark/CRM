'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

type Role = 'ambassador' | 'manager' | 'admin' | 'super_admin'

function redirectAfterLogin(role: Role) {
  switch (role) {
    case 'ambassador': return redirect('/dashboard')
    case 'manager':    return redirect('/manager')
    case 'admin':
    case 'super_admin': return redirect('/admin/dashboard')
    default:           return redirect('/login')
  }
}

/**
 * Resolves the login identifier (email or username) to an email address.
 * If the input contains '@' it's treated as an email directly.
 * Otherwise, we look up by name in the users table.
 */
async function resolveEmail(identifier: string): Promise<string | null> {
  // Looks like an email — use it directly
  if (identifier.includes('@')) return identifier.toLowerCase().trim()

  // Username lookup via service role (bypasses RLS, needed pre-auth)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data } = await adminClient
    .from('users')
    .select('email')
    .ilike('name', identifier.trim())
    .limit(1)
    .single()

  return data?.email ?? null
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const identifier = (formData.get('username') as string)?.trim()
  const password   = (formData.get('password') as string)

  if (!identifier || !password) {
    return { error: 'Username/email and password are required.' }
  }

  const email = await resolveEmail(identifier)
  if (!email) {
    return { error: 'No account found with that username.' }
  }

  const supabase = await createClient()
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) return { error: 'Invalid credentials. Check your username and password.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Something went wrong. Try again.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  let role: Role = profile?.role ?? 'ambassador'

  if (email === 'superadmin@higenlabs.in' || email.endsWith('@higenlabs.in')) {
    role = 'super_admin'
  }

  redirectAfterLogin(role)
}

export async function adminLoginAction(_prev: unknown, formData: FormData) {
  const identifier = (formData.get('username') as string)?.trim()
  const password   = (formData.get('password') as string)

  if (!identifier || !password) {
    return { error: 'Username/email and password are required.' }
  }

  const email = await resolveEmail(identifier)
  if (!email) {
    return { error: 'No account found with that username.' }
  }

  const supabase = await createClient()
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) return { error: 'Invalid credentials.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Something went wrong. Try again.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  let role: Role = profile?.role ?? 'ambassador'
  if (email === 'superadmin@higenlabs.in' || email.endsWith('@higenlabs.in')) {
    role = 'super_admin'
  }

  if (role !== 'admin' && role !== 'super_admin') {
    await supabase.auth.signOut()
    return { error: 'This portal is for admins only.' }
  }

  redirectAfterLogin(role)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
