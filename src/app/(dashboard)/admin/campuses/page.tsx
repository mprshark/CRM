import { getEffectiveRole } from '@/utils/getEffectiveRole'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, Button, EmptyState } from '@/components/ui'
import Link from 'next/link'

export default async function CampusesPage() {
  const supabase = await createClient()

  const result = await getEffectiveRole()
  if (!result || !['admin', 'super_admin'].includes(result.role)) redirect('/login')

  const { data: campuses } = await supabase
    .from('campuses')
    .select('id, name, city, manager_id, users(name)')
    .order('name')

  return (
    <div>
      <PageHeader
        title="CAMPUSES"
        subtitle="Manage campus locations and assigned managers."
        action={
          <Link href="/admin/campuses/new">
            <Button variant="primary">+ ADD CAMPUS</Button>
          </Link>
        }
      />

      {campuses?.length === 0 ? (
        <EmptyState
          title="NO CAMPUSES YET"
          description="Add your first campus to start assigning ambassadors."
          action={
            <Link href="/admin/campuses/new">
              <Button variant="primary">+ ADD CAMPUS</Button>
            </Link>
          }
        />
      ) : (
        <div className="border-2 border-[#0F1720] bg-white overflow-x-auto" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                {['#', 'CAMPUS NAME', 'CITY', 'MANAGER', 'ACTIONS'].map(h => (
                  <th key={h} className="text-left px-4 py-3 tracking-widest text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campuses?.map((c, i) => (
                <tr key={c.id} className="border-b border-[#0F1720]/10 hover:bg-[#F5F0E8]/40">
                  <td className="px-4 py-3 font-mono text-[#0F1720]/40">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-[#0F1720]/60">{c.city}</td>
                  <td className="px-4 py-3 text-xs">
                    {(c.users as { name?: string } | null)?.name ?? <span className="text-[#B26A00]">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/campuses/${c.id}/edit`}
                      className="text-xs tracking-widest underline underline-offset-2 text-[#0F1720]/60 hover:text-[#0F1720]"
                    >
                      EDIT →
                    </Link>
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
