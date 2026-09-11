import { getEffectiveRole } from '@/utils/getEffectiveRole'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, EmptyState, Badge } from '@/components/ui'

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>
}) {
  const { entity = '' } = await searchParams

  const result = await getEffectiveRole()
  if (!result || result.role !== 'super_admin') redirect('/admin/dashboard')

  const supabase = await createClient()

  let query = supabase
    .from('audit_log')
    .select('id, action, entity, after, timestamp, users(name, role)')
    .order('timestamp', { ascending: false })
    .limit(100)

  if (entity) query = query.eq('entity', entity)

  const { data: logs } = await query

  return (
    <div>
      <PageHeader
        title="AUDIT LOG"
        subtitle="System-wide immutable ledger of all critical actions and score adjustments."
      />

      {/* Filters */}
      <form className="mb-6 flex gap-3">
        <select
          name="entity"
          defaultValue={entity}
          className="px-4 py-2.5 border-2 border-[#0F1720] bg-white text-sm outline-none focus:shadow-[3px_3px_0_#0F1720]"
        >
          <option value="">All Entities</option>
          <option value="uploads">Uploads</option>
          <option value="activities">Activities</option>
          <option value="score_adjustments">Score Adjustments</option>
          <option value="users">Users</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 border-2 border-[#0F1720] bg-[#CCFF00] text-sm tracking-widest"
        >
          FILTER LOGS
        </button>
      </form>

      {logs?.length === 0 ? (
        <EmptyState title="NO LOGS FOUND" />
      ) : (
        <div className="border-2 border-[#0F1720] bg-white overflow-x-auto" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                {['TIMESTAMP', 'ACTOR', 'ACTION', 'ENTITY', 'DETAILS'].map(h => (
                  <th key={h} className="text-left px-4 py-3 tracking-widest text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs?.map(log => (
                <tr key={log.id} className="border-b border-[#0F1720]/10 hover:bg-[#F5F0E8]/40">
                  <td className="px-4 py-3 text-xs text-[#0F1720]/60 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{(log.users as { name?: string } | null)?.name ?? 'System'}</span>
                    <br />
                    <span className="text-[10px] text-[#0F1720]/40 tracking-widest uppercase">
                      {(log.users as { role?: string } | null)?.role?.replace('_', ' ') ?? ''}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{log.entity}</td>
                  <td className="px-4 py-3">
                    <pre className="text-[10px] bg-[#F5F0E8] p-2 border border-[#0F1720]/20 max-w-xs overflow-x-auto">
                      {JSON.stringify(log.after, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
