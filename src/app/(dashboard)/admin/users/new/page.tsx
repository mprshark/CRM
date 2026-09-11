import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, Button, Input } from '@/components/ui'

export default async function NewUserPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['admin', 'super_admin'].includes(me?.role)) redirect('/admin/dashboard')

  const { data: campuses } = await supabase.from('campuses').select('id, name')

  async function createUserAction(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const campus_id = formData.get('campus_id') as string

    // In a real app, you'd use supabase admin API to create the auth user
    // For this MVP UI we just demonstrate the form.
    redirect('/admin/users')
  }

  return (
    <div>
      <PageHeader
        title="ADD NEW USER"
        subtitle="Create an ambassador, manager, or admin."
      />

      <div className="border-2 border-[#0F1720] bg-white p-8 max-w-lg" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
        <form action={createUserAction} className="flex flex-col gap-5">
          <Input id="name" name="name" label="Full Name" placeholder="Jane Doe" required />
          <Input id="email" name="email" type="email" label="Email Address" placeholder="jane@college.edu" required />
          
          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-widest uppercase">Role</label>
            <select name="role" required className="w-full px-3 py-2.5 bg-white border-2 border-[#0F1720] text-sm outline-none focus:shadow-[3px_3px_0_#0F1720]">
              <option value="ambassador">Ambassador</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs tracking-widest uppercase">Assign Campus</label>
            <select name="campus_id" className="w-full px-3 py-2.5 bg-white border-2 border-[#0F1720] text-sm outline-none focus:shadow-[3px_3px_0_#0F1720]">
              <option value="">— None (Global) —</option>
              {campuses?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" className="mt-4">CREATE USER →</Button>
        </form>
      </div>
    </div>
  )
}
