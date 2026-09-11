import { StatCard, PageHeader, Badge } from '@/components/ui'
import Link from 'next/link'
import { getEffectiveRole } from '@/utils/getEffectiveRole'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const result = await getEffectiveRole()
  if (!result || !['admin', 'super_admin'].includes(result.role)) redirect('/login')

  const supabase = await createClient()

  const [campusesRes, usersRes, uploadsRes] = await Promise.all([
    supabase.from('campuses').select('id, name, city', { count: 'exact' }),
    supabase.from('users').select('id, role, status', { count: 'exact' }),
    supabase.from('uploads').select('id, status', { count: 'exact' }).eq('status', 'pending'),
  ])

  const campusCount    = campusesRes.count ?? 0
  const userCount      = usersRes.count    ?? 0
  const pendingUploads = uploadsRes.count  ?? 0
  const ambassadors    = usersRes.data?.filter(u => u.role === 'ambassador').length ?? 0

  return (
    <div>
      <PageHeader
        title="ADMIN DASHBOARD"
        subtitle="Global view of all campuses, users, and pending work."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="Campuses"        value={campusCount}    accent />
        <StatCard label="Total Users"     value={userCount}      />
        <StatCard label="Ambassadors"     value={ambassadors}    />
        <StatCard label="Pending Reviews" value={pendingUploads} accent />
      </div>

      {/* Campus list */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 border-b-2 border-[#0F1720] pb-2">
          <h2 className="text-lg tracking-widest text-[#0F1720]">ALL CAMPUSES</h2>
          <Link
            href="/admin/campuses"
            className="text-xs tracking-widest underline underline-offset-2 text-[#0F1720]/60 hover:text-[#0F1720]"
          >
            MANAGE →
          </Link>
        </div>

        <div className="border-2 border-[#0F1720] bg-white overflow-x-auto">
          {campusesRes.data?.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#0F1720]/40 tracking-widest">
              NO CAMPUSES ADDED YET
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                  <th className="text-left px-4 py-3 tracking-widest text-xs">#</th>
                  <th className="text-left px-4 py-3 tracking-widest text-xs">CAMPUS</th>
                  <th className="text-left px-4 py-3 tracking-widest text-xs">CITY</th>
                </tr>
              </thead>
              <tbody>
                {campusesRes.data?.map((c, i) => (
                  <tr key={c.id} className="border-b border-[#0F1720]/10 hover:bg-[#F5F0E8]/50">
                    <td className="px-4 py-3 font-mono text-[#0F1720]/40">{i + 1}</td>
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3 text-[#0F1720]/60">{c.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'MANAGE USERS',    href: '/admin/users' },
          { label: 'MANAGE CAMPUSES', href: '/admin/campuses' },
          { label: 'SCORING CONFIG',  href: '/admin/config' },
          { label: 'AUDIT LOG',       href: '/admin/audit' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="border-2 border-[#0F1720] bg-white p-4 text-xs tracking-widest hover:bg-[#CCFF00] transition-colors"
            style={{ boxShadow: '3px 3px 0 #0F1720' }}
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  )
}
