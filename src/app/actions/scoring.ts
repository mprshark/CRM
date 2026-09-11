'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const ACTIVITY_POINTS: Record<string, number> = {
  reached_student: 1,
  event:           20,
  workshop:        30,
  social_post:     5,
  referral:        10,
}

export async function logActivityAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const type  = formData.get('type')  as string
  const date  = formData.get('date')  as string
  const count = parseInt(formData.get('count') as string, 10)

  if (!type || !date || isNaN(count) || count < 1) {
    return { error: 'All fields are required and count must be ≥ 1.' }
  }

  const { error } = await supabase.from('activities').insert({
    ca_id: user.id,
    type,
    date,
    count,
    status: 'pending',
  })

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action:   'activity.log',
    entity:   'activities',
    after:    { type, date, count },
  })

  return { success: true }
}

export async function adjustScoreAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['manager', 'admin', 'super_admin'].includes(me?.role)) {
    return { error: 'Not authorised.' }
  }

  const subjectId   = formData.get('subject_id')   as string
  const subjectType = formData.get('subject_type')  as string
  const delta       = parseFloat(formData.get('delta') as string)
  const reason      = formData.get('reason')        as string

  if (!reason?.trim()) return { error: 'Reason is required.' }
  if (isNaN(delta))    return { error: 'Delta must be a number.' }

  const { error } = await supabase.from('score_adjustments').insert({
    subject_type: subjectType,
    subject_id:   subjectId,
    delta,
    reason:       reason.trim(),
    created_by:   user.id,
  })

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action:   'score.adjust',
    entity:   'score_adjustments',
    after:    { subject_id: subjectId, delta, reason },
  })

  return { success: true }
}
