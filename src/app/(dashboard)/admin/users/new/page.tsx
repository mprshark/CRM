import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import Link from 'next/link'
import { NewUserForm } from './NewUserForm'

export default async function NewUserPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['admin', 'super_admin'].includes(me?.role)) redirect('/admin/dashboard')

  const { data: campuses } = await supabase.from('campuses').select('id, name').order('name')

  return (
    <div>
      <Link href="/admin/users" className="text-xs tracking-widest text-[#0F1720]/50 hover:text-[#0F1720] mb-4 inline-block" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
        ← BACK TO USERS
      </Link>

      <PageHeader
        title="ADD NEW USER"
        subtitle="Create an ambassador, manager, or admin. They can log in immediately with the password you set."
      />

      <NewUserForm campuses={campuses ?? []} isSuperAdmin={me?.role === 'super_admin'} />
    </div>
  )
}
