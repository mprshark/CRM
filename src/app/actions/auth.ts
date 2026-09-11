'use server'

import { createClient } from '@/utils/supabase/server'
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

export async function loginAction(_prev: unknown, formData: FormData) {
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) return { error: authError.message }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Something went wrong. Try again.' }

  // Try to get role from public.users
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
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) return { error: authError.message }

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
    // sign them back out — wrong portal
    await supabase.auth.signOut()
    return { error: 'This portal is for admins only. Use /login instead.' }
  }

  redirectAfterLogin(role)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
