import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard, PageHeader, Badge, EmptyState } from '@/components/ui'
import Link from 'next/link'

export default async function ManagerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('campus_id')
    .eq('id', user.id)
    .single()

  const campusId = profile?.campus_id

  const [pendingUploadsRes, pendingActivitiesRes, ambassadorsRes] = await Promise.all([
    supabase
      .from('uploads')
      .select('id, ca_id, created_at, row_count', { count: 'exact' })
      .eq('status', 'pending')
      .limit(5),
    supabase
      .from('activities')
      .select('id, ca_id, type, count, created_at', { count: 'exact' })
      .eq('status', 'pending')
      .limit(5),
    supabase
      .from('users')
      .select('id, name', { count: 'exact' })
      .eq('campus_id', campusId)
      .eq('role', 'ambassador'),
  ])

  const pendingUploads    = pendingUploadsRes.count    ?? 0
  const pendingActivities = pendingActivitiesRes.count ?? 0
  const ambassadorCount   = ambassadorsRes.count       ?? 0

  return (
    <div>
      <PageHeader
        title="MANAGER OVERVIEW"
        subtitle="Pending verifications and campus performance."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard label="Pending Uploads"     value={pendingUploads}    accent />
        <StatCard label="Pending Activities"  value={pendingActivities} accent />
        <StatCard label="Ambassadors"         value={ambassadorCount}  />
      </div>

      {/* Pending uploads queue preview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 border-b-2 border-[#0F1720] pb-2">
          <h2 className="text-lg tracking-widest text-[#0F1720]">PENDING UPLOADS</h2>
          <Link
            href="/manager/verification"
            className="text-xs tracking-widest underline underline-offset-2 text-[#0F1720]/60 hover:text-[#0F1720]"
          >
            VIEW ALL →
          </Link>
        </div>

        {pendingUploadsRes.data?.length === 0 ? (
          <EmptyState title="ALL CLEAR" description="No pending uploads to review." />
        ) : (
          <div className="border-2 border-[#0F1720] bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                  <th className="text-left px-4 py-3 tracking-widest text-xs">UPLOAD ID</th>
                  <th className="text-left px-4 py-3 tracking-widest text-xs">ROWS</th>
                  <th className="text-left px-4 py-3 tracking-widest text-xs">SUBMITTED</th>
                  <th className="text-left px-4 py-3 tracking-widest text-xs">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {pendingUploadsRes.data?.map(u => (
                  <tr key={u.id} className="border-b border-[#0F1720]/10 hover:bg-[#F5F0E8]/50">
                    <td className="px-4 py-3 font-mono text-xs">{u.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-mono">{u.row_count ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#0F1720]/60">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3"><Badge variant="warn">PENDING</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
