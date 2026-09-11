import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader, Badge } from '@/components/ui'
import Link from 'next/link'
import { EditUserForm, ResetPasswordForm } from './EditForms'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', currentUser.id).single()
  
  if (!['admin', 'super_admin'].includes(me?.role)) {
    redirect('/admin/dashboard')
  }

  const [targetUserRes, campusesRes] = await Promise.all([
    supabase.from('users').select('*, campuses(name)').eq('id', id).single(),
    supabase.from('campuses').select('id, name').order('name'),
  ])

  const targetUser = targetUserRes.data
  if (!targetUser) return notFound()

  const isSuperAdmin = me?.role === 'super_admin'

  return (
    <div className="max-w-4xl">
      <Link href="/admin/users" className="text-xs tracking-widest text-[#0F1720]/50 hover:text-[#0F1720] mb-4 inline-block" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
        ← BACK TO USERS
      </Link>
      
      <PageHeader
        title="MANAGE USER"
        subtitle={`Editing profile for ${targetUser.name}`}
      />

      <div className="mt-8 space-y-8">
        <EditUserForm user={targetUser} campuses={campusesRes.data ?? []} isSuperAdmin={isSuperAdmin} />
        {isSuperAdmin && <ResetPasswordForm userId={targetUser.id} />}
      </div>
    </div>
  )
}
