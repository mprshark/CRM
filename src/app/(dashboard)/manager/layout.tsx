import { redirect } from 'next/navigation'
import { getEffectiveRole } from '@/utils/getEffectiveRole'
import React from 'react'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const result = await getEffectiveRole()

  if (!result) redirect('/login')

  const { role } = result

  // Allow admins and super_admins to access manager pages if needed, otherwise restrict to manager
  if (role !== 'manager' && role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
