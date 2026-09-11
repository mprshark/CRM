import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TopNav } from '@/components/TopNav'
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

  let role = profile?.role

  if (!role && user.email) {
    if (user.email === 'superadmin@higenlabs.in' || user.email.endsWith('@higenlabs.in')) {
      role = 'super_admin'
    } else {
      role = 'ambassador'
    }
  } else if (!role) {
    role = 'ambassador'
  }

  const name   = profile?.name   ?? user.email ?? 'User'
  const campus = (profile?.campuses as { name?: string } | null)?.name

  return (
    <div className="login-root dot-grid flex flex-col h-screen overflow-hidden">
      <TopNav role={role} name={name} campus={campus} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8" style={{ minHeight: 0 }}>
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>

      <div className="hidden lg:block pb-6 text-center" style={{ fontFamily: 'var(--font-anton), Anton, system-ui, sans-serif', fontSize: 10, letterSpacing: 2, color: 'rgba(15,23,32,0.4)', textTransform: 'uppercase' }}>
        COPYRIGHT RESERVED FOR HIGENLABS @ 2026
      </div>
    </div>
  )
}
