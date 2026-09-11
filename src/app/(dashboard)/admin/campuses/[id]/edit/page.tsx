import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import Link from 'next/link'
import { EditCampusForm } from './EditCampusForm'

export default async function EditCampusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['admin', 'super_admin'].includes(me?.role)) redirect('/admin/dashboard')

  const [campusRes, managersRes] = await Promise.all([
    supabase.from('campuses').select('*').eq('id', id).single(),
    supabase.from('users').select('id, name').eq('role', 'manager').eq('status', 'active').order('name'),
  ])

  if (!campusRes.data) return notFound()
  const campus = campusRes.data

  return (
    <div>
      <Link href="/admin/campuses" className="text-xs tracking-widest text-[#0F1720]/50 hover:text-[#0F1720] mb-4 inline-block" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
        ← BACK TO CAMPUSES
      </Link>

      <PageHeader title="EDIT CAMPUS" subtitle={`Editing ${campus.name}`} />

      <EditCampusForm campus={campus} managers={managersRes.data ?? []} />
    </div>
  )
}
