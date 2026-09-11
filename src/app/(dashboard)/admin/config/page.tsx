import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, Button, Input } from '@/components/ui'

export default async function ConfigPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (me?.role !== 'super_admin') {
    // Only super admin can access scoring config
    redirect('/admin/dashboard')
  }

  // Fetch current scoring config (mocking config from db for now as we hardcoded it in actions)
  // In a real app, we'd fetch this from a `scoring_config` table
  const config = [
    { type: 'reached_student', points: 1 },
    { type: 'event', points: 20 },
    { type: 'workshop', points: 30 },
    { type: 'social_post', points: 5 },
    { type: 'referral', points: 10 },
  ]

  return (
    <div>
      <PageHeader
        title="SCORING CONFIGURATION"
        subtitle="Manage point values for ambassador activities. Changes apply to all new points calculated."
      />

      <div className="border-2 border-[#0F1720] bg-white p-8 max-w-2xl" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
        <h2 className="text-lg tracking-widest mb-6 border-b-2 border-[#0F1720] pb-2">GLOBAL WEIGHTS</h2>

        <form className="flex flex-col gap-6">
          {config.map(item => (
            <div key={item.type} className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm tracking-widest uppercase block mb-1">
                  {item.type.replace(/_/g, ' ')}
                </label>
                <p className="text-xs text-[#0F1720]/50 tracking-wide">Points awarded per unit.</p>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  defaultValue={item.points}
                  min="0"
                />
              </div>
            </div>
          ))}

          <div className="mt-4 pt-6 border-t-2 border-[#0F1720] flex justify-end">
            <Button type="button" variant="primary">SAVE CONFIGURATION →</Button>
          </div>
        </form>
      </div>

      <p className="mt-6 text-xs text-[#0F1720]/50 tracking-wide max-w-2xl border-l-4 border-[#CCFF00] pl-4">
        Note: Modifying these values will immediately affect all leaderboard calculations that rely on dynamic pointing. Existing manual adjustments are unaffected.
      </p>
    </div>
  )
}
