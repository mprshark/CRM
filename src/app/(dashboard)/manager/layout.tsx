import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  let role = profile?.role

  if (!role && user.email) {
    if (user.email === 'superadmin@higenlabs.in' || user.email.endsWith('@higenlabs.in')) {
      role = 'super_admin'
    }
  }

  // Allow admins and super_admins to access manager pages if needed, otherwise restrict to manager
  if (role !== 'manager' && role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard') // kick non-managers out
  }

  return <>{children}</>
}
