import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, Badge } from '@/components/ui'
import VerificationActions from './VerificationActions'

export default async function VerificationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [uploadsRes, activitiesRes] = await Promise.all([
    supabase
      .from('uploads')
      .select('id, ca_id, row_count, created_at, users(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('activities')
      .select('id, ca_id, type, count, date, users(name)')
      .eq('status', 'pending')
      .order('date', { ascending: true }),
  ])

  return (
    <div>
      <PageHeader
        title="VERIFICATION QUEUE"
        subtitle="Review and approve ambassador uploads and activities."
      />

      {/* Pending Uploads */}
      <section className="mb-10">
        <h2 className="text-lg tracking-widest mb-4 border-b-2 border-[#0F1720] pb-2">
          PENDING UPLOADS ({uploadsRes.data?.length ?? 0})
        </h2>

        {uploadsRes.data?.length === 0 ? (
          <div className="border-2 border-dashed border-[#0F1720]/30 p-10 text-center text-sm text-[#0F1720]/40 tracking-widest">
            ALL UPLOADS REVIEWED
          </div>
        ) : (
          <div className="border-2 border-[#0F1720] bg-white overflow-x-auto" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                  {['UPLOAD ID', 'AMBASSADOR', 'ROWS', 'SUBMITTED', 'ACTIONS'].map(h => (
                    <th key={h} className="text-left px-4 py-3 tracking-widest text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uploadsRes.data?.map(u => (
                  <tr key={u.id} className="border-b border-[#0F1720]/10">
                    <td className="px-4 py-3 font-mono text-xs">{u.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">{(u.users as { name?: string } | null)?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-mono">{u.row_count ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#0F1720]/60">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <VerificationActions id={u.id} type="upload" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pending Activities */}
      <section>
        <h2 className="text-lg tracking-widest mb-4 border-b-2 border-[#0F1720] pb-2">
          PENDING ACTIVITIES ({activitiesRes.data?.length ?? 0})
        </h2>

        {activitiesRes.data?.length === 0 ? (
          <div className="border-2 border-dashed border-[#0F1720]/30 p-10 text-center text-sm text-[#0F1720]/40 tracking-widest">
            ALL ACTIVITIES REVIEWED
          </div>
        ) : (
          <div className="border-2 border-[#0F1720] bg-white overflow-x-auto" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                  {['AMBASSADOR', 'TYPE', 'COUNT', 'DATE', 'ACTIONS'].map(h => (
                    <th key={h} className="text-left px-4 py-3 tracking-widest text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activitiesRes.data?.map(a => (
                  <tr key={a.id} className="border-b border-[#0F1720]/10">
                    <td className="px-4 py-3">{(a.users as { name?: string } | null)?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{a.type.replace(/_/g, ' ').toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">{a.count}</td>
                    <td className="px-4 py-3 text-xs text-[#0F1720]/60">{a.date}</td>
                    <td className="px-4 py-3">
                      <VerificationActions id={a.id} type="activity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
