import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, StatCard, Badge } from '@/components/ui'

const POINT_VALUES: Record<string, number> = {
  reached_student: 1,
  event:           20,
  workshop:        30,
  social_post:     5,
  referral:        10,
}

const TARGETS: Record<string, number> = {
  reached_student: 100,
  event:           5,
  workshop:        3,
  social_post:     20,
  referral:        10,
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [activitiesRes, adjustmentsRes, uploadsRes] = await Promise.all([
    supabase.from('activities').select('type, count, status').eq('ca_id', user.id),
    supabase.from('score_adjustments').select('delta, reason, created_at').eq('subject_id', user.id).eq('subject_type', 'ambassador').order('created_at', { ascending: false }),
    supabase.from('uploads').select('id, row_count, status').eq('ca_id', user.id),
  ])

  const verifiedActivities = activitiesRes.data?.filter(a => a.status === 'verified') ?? []
  const activityPoints = verifiedActivities.reduce((sum, a) => sum + (POINT_VALUES[a.type] ?? 0) * (a.count ?? 1), 0)
  const adjustmentTotal = adjustmentsRes.data?.reduce((sum, a) => sum + (a.delta ?? 0), 0) ?? 0
  const uploadPoints = (uploadsRes.data?.filter(u => u.status === 'verified').reduce((s, u) => s + (u.row_count ?? 0), 0) ?? 0) * 1
  const totalPoints = activityPoints + uploadPoints + adjustmentTotal

  // Aggregate by type
  const byType = verifiedActivities.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + a.count
    return acc
  }, {})

  return (
    <div>
      <PageHeader title="MY PROGRESS" subtitle="Targets vs actuals across all activity types." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="Total Points"     value={totalPoints}       accent />
        <StatCard label="Activity Points"  value={activityPoints}    />
        <StatCard label="Outreach Points"  value={uploadPoints}      />
        <StatCard label="Adjustments"      value={adjustmentTotal >= 0 ? `+${adjustmentTotal}` : adjustmentTotal} />
      </div>

      {/* Progress bars */}
      <div
        className="bg-white border-2 border-[#0F1720] p-6 mb-8"
        style={{ boxShadow: '4px 4px 0 #0F1720' }}
      >
        <h2 className="text-lg tracking-widest mb-6 border-b-2 border-[#0F1720] pb-2">TARGETS VS ACTUALS</h2>
        <div className="flex flex-col gap-5">
          {Object.entries(TARGETS).map(([type, target]) => {
            const actual  = byType[type] ?? 0
            const pct     = Math.min(100, Math.round((actual / target) * 100))
            const label   = type.replace(/_/g, ' ').toUpperCase()
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs tracking-widest">{label}</span>
                  <span className="font-mono text-sm">
                    {actual} <span className="text-[#0F1720]/40">/ {target}</span>
                  </span>
                </div>
                <div className="h-5 border-2 border-[#0F1720] bg-[#F5F0E8] relative">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 100 ? '#0E8F63' : pct >= 60 ? '#CCFF00' : '#0F1720',
                    }}
                  />
                  <span className="absolute right-2 top-0 bottom-0 flex items-center text-xs font-mono text-[#0F1720]/60">
                    {pct}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Adjustment log */}
      <div className="bg-white border-2 border-[#0F1720] p-6" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
        <h2 className="text-lg tracking-widest mb-6 border-b-2 border-[#0F1720] pb-2">SCORE ADJUSTMENTS</h2>
        {adjustmentsRes.data?.length === 0 ? (
          <p className="text-sm text-[#0F1720]/40 tracking-wide">No adjustments recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0F1720]">
                  <th className="text-left py-2 text-xs tracking-widest whitespace-nowrap">DATE</th>
                  <th className="text-right py-2 text-xs tracking-widest whitespace-nowrap">DELTA</th>
                  <th className="text-left py-2 pl-4 text-xs tracking-widest min-w-[200px]">REASON</th>
                </tr>
              </thead>
              <tbody>
                {adjustmentsRes.data?.map((a, i) => (
                  <tr key={i} className="border-b border-[#0F1720]/10">
                    <td className="py-2 text-xs text-[#0F1720]/60 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-right font-mono whitespace-nowrap">
                      <Badge variant={a.delta >= 0 ? 'ok' : 'danger'}>
                        {a.delta >= 0 ? '+' : ''}{a.delta}
                      </Badge>
                    </td>
                    <td className="py-2 pl-4 text-xs text-[#0F1720]/70">{a.reason}</td>
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
