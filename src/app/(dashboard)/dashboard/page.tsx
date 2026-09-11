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
      <div className="mb-12">
        <h2 className="text-2xl tracking-[2px] text-[#0F1720] mb-6 border-b-[3px] border-[#0F1720] pb-2 uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
          RECENT UPLOADS
        </h2>

        {recentUploads.length === 0 ? (
          <EmptyState
            title="NO UPLOADS YET"
            description="Head to My Uploads to upload your first outreach sheet."
          />
        ) : (
          <div className="border-2 border-[#0F1720] bg-white overflow-hidden shadow-[4px_4px_0_#0F1720]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b-[3px] border-[#0F1720] bg-[#CCFF00]">
                    <th className="px-6 py-4 text-[11px] tracking-[3px] font-[Anton] uppercase text-[#0F1720]" style={{ fontFamily: 'var(--font-anton)' }}>#</th>
                    <th className="px-6 py-4 text-[11px] tracking-[3px] font-[Anton] uppercase text-[#0F1720]" style={{ fontFamily: 'var(--font-anton)' }}>UPLOAD ID</th>
                    <th className="px-6 py-4 text-[11px] tracking-[3px] font-[Anton] uppercase text-[#0F1720]" style={{ fontFamily: 'var(--font-anton)' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {recentUploads.map((u, i) => (
                    <tr key={u.id} className="border-b-2 border-[#0F1720] last:border-0 hover:bg-[#F5F0E8] transition-colors">
                      <td className="px-6 py-5 font-mono text-[#0F1720]/40 text-xs">{i + 1}</td>
                      <td className="px-6 py-5 font-mono text-sm tracking-tight">{u.id.slice(0, 8)}…</td>
                      <td className="px-6 py-5">
                        <Badge variant={u.status === 'verified' ? 'ok' : u.status === 'rejected' ? 'danger' : 'warn'}>
                          {u.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
