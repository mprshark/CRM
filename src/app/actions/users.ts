'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// We need an admin client to bypass RLS and manage auth users
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }
  
  return createAdminClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

async function getCallerRole(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  return data?.role ?? null
}

export async function createUserAction(prevState: { error?: string; success?: string }, formData: FormData) {
  const supabase = await createClient()
  const { data: { user: caller } } = await supabase.auth.getUser()
  if (!caller) return { error: 'Not authenticated.' }

  const callerRole = await getCallerRole(supabase, caller.id)
  if (!['admin', 'super_admin'].includes(callerRole)) return { error: 'Not authorised.' }

  const name      = (formData.get('name')      as string)?.trim()
  const email     = (formData.get('email')     as string)?.trim()
  const role      = (formData.get('role')      as string)?.trim()
  const campus_id = (formData.get('campus_id') as string)?.trim() || null
  const password  = (formData.get('password')  as string)?.trim()

  if (!name || !email || !role || !password) return { error: 'All fields are required.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const adminClient = getAdminClient()

  // 1. Create auth user
  const { data: newAuthUser, error: authErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authErr) return { error: `Auth Error: ${authErr.message}` }

  const newUserId = newAuthUser.user.id

  // 2. Create public user profile
  const { error: dbErr } = await adminClient.from('users').insert({
    id: newUserId,
    name,
    email,
    role,
    campus_id: campus_id || null,
    status: 'active',
  })

  if (dbErr) {
    // Rollback auth user
    await adminClient.auth.admin.deleteUser(newUserId)
    return { error: `DB Error: ${dbErr.message}` }
  }

  // 3. Audit log
  await supabase.from('audit_log').insert({
    actor_id: caller.id,
    action: 'user.create',
    entity: 'users',
    after: { id: newUserId, email, role, campus_id },
  })

  revalidatePath('/admin/users')
  redirect('/admin/users')
}

export async function updateUserAction(prevState: { error?: string }, formData: FormData) {
  const supabase = await createClient()
  const { data: { user: caller } } = await supabase.auth.getUser()
  if (!caller) return { error: 'Not authenticated.' }

  const callerRole = await getCallerRole(supabase, caller.id)
  if (!['admin', 'super_admin'].includes(callerRole)) return { error: 'Not authorised.' }

  const id        = formData.get('id')        as string
  const name      = (formData.get('name')     as string)?.trim()
  const email     = (formData.get('email')    as string)?.trim()
  const role      = formData.get('role')      as string
  const campus_id = (formData.get('campus_id') as string)?.trim() || null
  const status    = formData.get('status')    as string

  if (!id || !name || !email || !role) return { error: 'Missing required fields' }

  const adminClient = getAdminClient()

  // 1. Update Auth user (email)
  const { error: authError } = await adminClient.auth.admin.updateUserById(id, { email })
  if (authError) return { error: `Auth Error: ${authError.message}` }

  // 2. Update Public user (name, email, role, campus, status)
  const { error: dbError } = await adminClient
    .from('users')
    .update({ name, email, role, campus_id: campus_id || null, status: status || 'active' })
    .eq('id', id)
    
  if (dbError) return { error: `DB Error: ${dbError.message}` }

  // 3. Audit log
  await supabase.from('audit_log').insert({
    actor_id: caller.id,
    action: 'user.update',
    entity: 'users',
    after: { id, name, email, role, campus_id, status },
  })

  revalidatePath('/admin/users')
  redirect('/admin/users')
}

export async function resetPasswordAction(_prevState: { error?: string; success?: string }, formData: FormData) {
  const supabase = await createClient()
  const { data: { user: caller } } = await supabase.auth.getUser()
  if (!caller) return { error: 'Not authenticated.' }

  const callerRole = await getCallerRole(supabase, caller.id)
  if (callerRole !== 'super_admin') return { error: 'Only super admins can reset passwords.' }

  const id          = formData.get('id')          as string
  const newPassword = formData.get('newPassword') as string
  
  if (!id || !newPassword) return { error: 'Missing required fields' }
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters' }

  const adminClient = getAdminClient()
  const { error } = await adminClient.auth.admin.updateUserById(id, {
    password: newPassword
  })

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: caller.id,
    action: 'user.password_reset',
    entity: 'users',
    after: { target_user_id: id },
  })

  return { success: 'Password reset successfully!' }
}
