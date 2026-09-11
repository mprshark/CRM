import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import Link from 'next/link'
import { EditUserForm, ResetPasswordForm } from './EditForms'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', currentUser.id).single()
  
  // Only super_admin should really be accessing this deeply for passwords,
  // but we can allow admin to edit basic info if needed. We'll strict to super_admin for full control.
  if (me?.role !== 'super_admin') {
    redirect('/admin')
  }

  const { data: targetUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!targetUser) return notFound()

  return (
    <div className="max-w-4xl">
      <Link href="/admin/users" className="text-xs font-['Anton'] tracking-widest text-[#0F1720]/50 hover:text-[#0F1720] mb-4 inline-block">
        ← BACK TO USERS
      </Link>
      
      <PageHeader
        title="MANAGE USER"
        subtitle={`Editing profile for ${targetUser.name}`}
      />

      <div className="mt-8">
        <EditUserForm user={targetUser} />
        <ResetPasswordForm userId={targetUser.id} />
      </div>
    </div>
  )
}
