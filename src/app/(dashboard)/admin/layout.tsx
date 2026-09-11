import { redirect } from 'next/navigation'
import { getEffectiveRole } from '@/utils/getEffectiveRole'
import React from 'react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const result = await getEffectiveRole()

  if (!result) redirect('/login')

  if (result.role !== 'admin' && result.role !== 'super_admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
