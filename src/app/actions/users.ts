'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// We need an admin client to bypass RLS and manage auth users
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function updateUserAction(prevState: any, formData: FormData) {
  const adminClient = getAdminClient()
  
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  
  if (!id || !name || !email || !role) {
    return { error: 'Missing required fields' }
  }

  // 1. Update Auth user (email)
  const { error: authError } = await adminClient.auth.admin.updateUserById(id, { email })
  if (authError) return { error: `Auth Error: ${authError.message}` }

  // 2. Update Public user (name, email, role)
  const { error: dbError } = await adminClient
    .from('users')
    .update({ name, email, role })
    .eq('id', id)
    
  if (dbError) return { error: `DB Error: ${dbError.message}` }

  revalidatePath('/admin/users')
  redirect('/admin/users')
}

export async function resetPasswordAction(_prevState: { error?: string; success?: string }, formData: FormData) {
  const adminClient = getAdminClient()
  
  const id = formData.get('id') as string
  const newPassword = formData.get('newPassword') as string
  
  if (!id || !newPassword) {
    return { error: 'Missing required fields' }
  }
  
  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const { error } = await adminClient.auth.admin.updateUserById(id, {
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password reset successfully!' }
}
