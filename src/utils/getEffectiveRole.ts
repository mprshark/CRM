import { createClient } from '@/utils/supabase/server'

export type AppRole = 'ambassador' | 'manager' | 'admin' | 'super_admin'

/**
 * Returns the effective role for the current user.
 * Always treats @higenlabs.in emails as super_admin regardless of DB row.
 */
export async function getEffectiveRole(): Promise<{ role: AppRole; userId: string; email: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // @higenlabs.in emails are always super_admin
  if (user.email === 'superadmin@higenlabs.in' || user.email?.endsWith('@higenlabs.in')) {
    return { role: 'super_admin', userId: user.id, email: user.email ?? '' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role: AppRole = (profile?.role as AppRole) ?? 'ambassador'
  return { role, userId: user.id, email: user.email ?? '' }
}
