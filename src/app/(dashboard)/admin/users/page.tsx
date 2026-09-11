import { getEffectiveRole } from '@/utils/getEffectiveRole'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, Badge, Button, EmptyState } from '@/components/ui'
import Link from 'next/link'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>
}) {
  const { q = '', role = '' } = await searchParams
  const supabase = await createClient()

  const result = await getEffectiveRole()
  if (!result || !['admin', 'super_admin'].includes(result.role)) redirect('/login')

  let query = supabase
    .from('users')
    .select('id, name, email, role, status, campus_id, campuses(name)')
    .order('name')

  if (q)    query = query.ilike('name', `%${q}%`)
  if (role) query = query.eq('role', role)

  const { data: users } = await query

  const ROLE_COLORS: Record<string, 'ok' | 'warn' | 'accent' | 'neutral' | 'danger'> = {
    ambassador: 'neutral',
    manager:    'warn',
    admin:      'accent',
    super_admin: 'danger',
  }

  return (
    <div>
      <PageHeader
        title="USERS"
        subtitle="Manage ambassadors, managers, and admins."
        action={
          <Link href="/admin/users/new">
            <Button variant="primary">+ ADD USER</Button>
          </Link>
        }
      />

      {/* Filters */}
      <form className="mb-6 flex gap-3 flex-wrap">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="flex-1 min-w-48 px-4 py-2.5 border-2 border-[#0F1720] bg-white text-sm outline-none focus:shadow-[3px_3px_0_#0F1720] transition-shadow"
        />
        <select
          name="role"
          defaultValue={role}
          className="px-4 py-2.5 border-2 border-[#0F1720] bg-white text-sm outline-none focus:shadow-[3px_3px_0_#0F1720]"
        >
          <option value="">All Roles</option>
          <option value="ambassador">Ambassador</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 border-2 border-[#0F1720] bg-[#CCFF00] text-sm tracking-widest"
        >
          FILTER
        </button>
      </form>

      {users?.length === 0 ? (
        <EmptyState title="NO USERS FOUND" />
      ) : (
        <div className="border-2 border-[#0F1720] bg-white overflow-x-auto" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                {['NAME', 'EMAIL', 'ROLE', 'CAMPUS', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="text-left px-4 py-3 tracking-widest text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users?.map(u => (
                <tr key={u.id} className="border-b border-[#0F1720]/10 hover:bg-[#F5F0E8]/40">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-xs text-[#0F1720]/60">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_COLORS[u.role] ?? 'neutral'}>
                      {u.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {(u.campuses as { name?: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === 'active' ? 'ok' : 'danger'}>
                      {(u.status ?? 'active').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
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
