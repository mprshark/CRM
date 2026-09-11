import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import React from 'react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('name, role, campus_id, campuses(name)')
    .eq('id', user.id)
    .single()

  const role   = profile?.role   ?? 'ambassador'
  const name   = profile?.name   ?? user.email ?? 'User'
  const campus = (profile?.campuses as { name?: string } | null)?.name

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden" style={{ background: 'var(--canvas)' }}>
      <Sidebar role={role} name={name} campus={campus} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="hidden md:flex items-center justify-between px-8 py-4 border-b-2 border-[#0F1720] flex-shrink-0"
          style={{ background: '#FFFFFF' }}
        >
          <div className="text-xs tracking-widest text-[#0F1720]/40 uppercase">
            HigenLabs Campus Ambassador CRM
          </div>
          <div className="flex items-center gap-4">
            <span
              className="text-xs tracking-widest px-2 py-1 border border-[#0F1720]"
              style={{ background: role === 'super_admin' ? '#CCFF00' : 'transparent' }}
            >
              {role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
