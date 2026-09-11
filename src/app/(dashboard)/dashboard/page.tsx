import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard, PageHeader, Badge, EmptyState } from '@/components/ui'

export default async function AmbassadorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch stats in parallel
  const [uploadsRes, activitiesRes, rankRes] = await Promise.all([
    supabase.from('uploads').select('id, status', { count: 'exact' }).eq('ca_id', user.id),
    supabase.from('activities').select('id, status', { count: 'exact' }).eq('ca_id', user.id),
    supabase.rpc('get_ambassador_rank', { ca_id: user.id }).single(),
  ])

  const totalUploads = uploadsRes.count ?? 0
  const verifiedUploads = uploadsRes.data?.filter(u => u.status === 'verified').length ?? 0
  const totalActivities = activitiesRes.count ?? 0
  const rank = (rankRes.data as { rank?: number } | null)?.rank ?? '—'

  const recentUploads = uploadsRes.data?.slice(0, 5) ?? []

  return (
    <div>
      <PageHeader
        title="MY DASHBOARD"
        subtitle="Your outreach, activities, and rank at a glance."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="Total Uploads"      value={totalUploads}    accent />
        <StatCard label="Verified Uploads"   value={verifiedUploads} />
        <StatCard label="Activities Logged"  value={totalActivities} />
        <StatCard label="Current Rank"       value={`#${rank}`}      accent />
      </div>

      {/* Recent uploads */}
      <div className="mb-8">
        <h2 className="text-lg tracking-widest text-[#0F1720] mb-4 border-b-2 border-[#0F1720] pb-2">
          RECENT UPLOADS
        </h2>

        {recentUploads.length === 0 ? (
          <EmptyState
            title="NO UPLOADS YET"
            description="Head to My Uploads to upload your first outreach sheet."
          />
        ) : (
          <div className="border-2 border-[#0F1720] bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                  <th className="text-left px-4 py-3 tracking-widest text-xs">#</th>
                  <th className="text-left px-4 py-3 tracking-widest text-xs">UPLOAD ID</th>
                  <th className="text-left px-4 py-3 tracking-widest text-xs">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentUploads.map((u, i) => (
                  <tr key={u.id} className="border-b border-[#0F1720]/10 hover:bg-[#F5F0E8]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[#0F1720]/40">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs">{u.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.status === 'verified' ? 'ok' : u.status === 'rejected' ? 'danger' : 'warn'}>
                        {u.status.toUpperCase()}
                      </Badge>
                    </td>
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
