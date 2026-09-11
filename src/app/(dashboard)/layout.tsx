import { redirect } from 'next/navigation'
import { TopNav } from '@/components/TopNav'
import { getEffectiveRole } from '@/utils/getEffectiveRole'
import { createClient } from '@/utils/supabase/server'
import React from 'react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getEffectiveRole()
  if (!result) redirect('/login')

  const { role } = result

  // Get display info
  const { data: profile } = await supabase
    .from('users')
    .select('name, campus_id, campuses(name)')
    .eq('id', user.id)
    .single()

  const name   = profile?.name ?? user.email ?? 'User'
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
