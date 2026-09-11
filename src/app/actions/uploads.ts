'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

function makeDedupeHash(email: string, phone: string) {
  return crypto
    .createHash('sha256')
    .update((email + phone).toLowerCase().replace(/\s/g, ''))
    .digest('hex')
}

export interface StudentRow {
  name:     string
  email:    string
  phone:    string
  year:     string
  course:   string
  interest: string
}

export async function commitUploadAction(rows: StudentRow[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (rows.length > 2000) {
    return { error: 'Maximum 2,000 rows per upload.' }
  }

  // Create upload record
  const { data: upload, error: uploadErr } = await supabase
    .from('uploads')
    .insert({ ca_id: user.id, row_count: rows.length, status: 'pending' })
    .select('id')
    .single()

  if (uploadErr || !upload) return { error: uploadErr?.message ?? 'Failed to create upload.' }

  const uploadId = upload.id

  // Prepare student records with dedupe hashes
  const records = rows.map(r => ({
    upload_id:    uploadId,
    ca_id:        user.id,
    name:         r.name.trim(),
    email:        r.email.trim().toLowerCase(),
    phone:        r.phone.trim(),
    year:         r.year.trim(),
    course:       r.course.trim(),
    interest:     r.interest.trim(),
    dedupe_hash:  makeDedupeHash(r.email, r.phone),
  }))

  // Insert — on conflict with dedupe_hash within same ca_id, skip (merge silently)
  const { error: insertErr } = await supabase
    .from('student_records')
    .upsert(records, { onConflict: 'dedupe_hash,ca_id', ignoreDuplicates: true })

  if (insertErr) {
    // Rollback upload record
    await supabase.from('uploads').delete().eq('id', uploadId)
    return { error: insertErr.message }
  }

  // Log to audit
  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action:   'upload.commit',
    entity:   'uploads',
    after:    { upload_id: uploadId, row_count: rows.length },
  })

  return { success: true, uploadId }
}
