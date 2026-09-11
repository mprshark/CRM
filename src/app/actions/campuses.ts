'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['admin', 'super_admin'].includes(me?.role)) redirect('/admin/dashboard')
  return { supabase, user }
}

export async function createCampusAction(prevState: { error?: string }, formData: FormData) {
  const { supabase, user } = await assertAdmin()

  const name       = (formData.get('name')       as string)?.trim()
  const city       = (formData.get('city')       as string)?.trim()
  const manager_id = (formData.get('manager_id') as string)?.trim() || null

  if (!name || !city) return { error: 'Name and city are required.' }

  const { error } = await supabase.from('campuses').insert({ name, city, manager_id: manager_id || null })
  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'campus.create',
    entity: 'campuses',
    after: { name, city, manager_id },
  })

  revalidatePath('/admin/campuses')
  redirect('/admin/campuses')
}

export async function updateCampusAction(prevState: { error?: string }, formData: FormData) {
  const { supabase, user } = await assertAdmin()

  const id         = formData.get('id')         as string
  const name       = (formData.get('name')       as string)?.trim()
  const city       = (formData.get('city')       as string)?.trim()
  const manager_id = (formData.get('manager_id') as string)?.trim() || null

  if (!id || !name || !city) return { error: 'Name and city are required.' }

  const { error } = await supabase
    .from('campuses')
    .update({ name, city, manager_id: manager_id || null })
    .eq('id', id)

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'campus.update',
    entity: 'campuses',
    after: { id, name, city, manager_id },
  })

  revalidatePath('/admin/campuses')
  redirect('/admin/campuses')
}
