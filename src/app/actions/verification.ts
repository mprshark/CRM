'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function verifyUploadAction(uploadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['manager', 'admin', 'super_admin'].includes(me?.role)) return { error: 'Not authorised.' }

  const { error } = await supabase
    .from('uploads')
    .update({ status: 'verified', reviewed_by: user.id })
    .eq('id', uploadId)

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'upload.verify',
    entity: 'uploads',
    after: { upload_id: uploadId, status: 'verified' },
  })

  return { success: true }
}

export async function rejectUploadAction(uploadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['manager', 'admin', 'super_admin'].includes(me?.role)) return { error: 'Not authorised.' }

  const { error } = await supabase
    .from('uploads')
    .update({ status: 'rejected', reviewed_by: user.id })
    .eq('id', uploadId)

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'upload.reject',
    entity: 'uploads',
    after: { upload_id: uploadId, status: 'rejected' },
  })

  return { success: true }
}

export async function verifyActivityAction(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('activities').update({ status: 'verified' }).eq('id', activityId)
  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'activity.verify',
    entity: 'activities',
    after: { activity_id: activityId },
  })

  return { success: true }
}

export async function rejectActivityAction(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('activities').update({ status: 'rejected' }).eq('id', activityId)
  if (error) return { error: error.message }

  return { success: true }
}
