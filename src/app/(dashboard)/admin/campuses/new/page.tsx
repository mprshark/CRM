import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import Link from 'next/link'
import { NewCampusForm } from './NewCampusForm'

export default async function NewCampusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['admin', 'super_admin'].includes(me?.role)) redirect('/admin/dashboard')

  // Get managers to assign
  const { data: managers } = await supabase
    .from('users')
    .select('id, name')
    .eq('role', 'manager')
    .eq('status', 'active')
    .order('name')

  return (
    <div>
      <Link href="/admin/campuses" className="text-xs tracking-widest text-[#0F1720]/50 hover:text-[#0F1720] mb-4 inline-block" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
        ← BACK TO CAMPUSES
      </Link>

      <PageHeader title="ADD CAMPUS" subtitle="Create a new campus location and assign a manager." />

      <NewCampusForm managers={managers ?? []} />
    </div>
  )
}
