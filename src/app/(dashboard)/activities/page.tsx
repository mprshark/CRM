'use client'

import { useActionState } from 'react'
import { logActivityAction } from '@/app/actions/scoring'
import { Button, Input, PageHeader, Badge } from '@/components/ui'

const ACTIVITY_TYPES = [
  { value: 'reached_student', label: 'Reached Student (1 pt each)' },
  { value: 'event',           label: 'Event Organised (20 pts)' },
  { value: 'workshop',        label: 'Workshop Conducted (30 pts)' },
  { value: 'social_post',     label: 'Social Post (5 pts)' },
  { value: 'referral',        label: 'Referral (10 pts)' },
]

type ActivityState = { error: string; success?: never } | { success: boolean; error?: never }
const init: ActivityState = { error: '' }

export default function ActivitiesPage() {
  const [state, action, pending] = useActionState<ActivityState, FormData>(logActivityAction, init)

  return (
    <div>
      <PageHeader
        title="LOG ACTIVITY"
        subtitle="Record your on-ground activities. They go to your manager for verification."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Log form */}
        <div
          className="bg-white border-2 border-[#0F1720] p-6"
          style={{ boxShadow: '4px 4px 0 #0F1720' }}
        >
          <h2 className="text-lg tracking-widest mb-6 border-b-2 border-[#0F1720] pb-2">NEW ACTIVITY</h2>

          <form action={action} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs tracking-widest uppercase">Activity Type</label>
              <select
                name="type"
                required
                className="w-full px-3 py-2.5 bg-white border-2 border-[#0F1720] text-sm outline-none focus:shadow-[3px_3px_0_#0F1720] transition-shadow"
              >
                <option value="">— Select —</option>
                {ACTIVITY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <Input id="date"  name="date"  type="date" label="Date"  required />
            <Input id="count" name="count" type="number" label="Count / Units" placeholder="1" min="1" required />

            {state?.error && (
              <div className="border-2 border-[#C43B45] bg-[#C43B45]/10 p-3 text-sm text-[#C43B45]">
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="border-2 border-[#0E8F63] bg-[#0E8F63]/10 p-3 text-sm text-[#0E8F63]">
                ✓ Activity logged. Pending manager verification.
              </div>
            )}

            <Button type="submit" variant="primary" loading={pending} className="w-full py-3">
              LOG ACTIVITY →
            </Button>
          </form>
        </div>

        {/* Point guide */}
        <div
          className="bg-white border-2 border-[#0F1720] p-6"
          style={{ boxShadow: '4px 4px 0 #0F1720' }}
        >
          <h2 className="text-lg tracking-widest mb-6 border-b-2 border-[#0F1720] pb-2">POINT GUIDE</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#0F1720]">
                <th className="text-left py-2 text-xs tracking-widest">ACTIVITY</th>
                <th className="text-right py-2 text-xs tracking-widest">PTS / UNIT</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVITY_TYPES.map(t => (
                <tr key={t.value} className="border-b border-[#0F1720]/10">
                  <td className="py-3">{t.label.split('(')[0].trim()}</td>
                  <td className="py-3 text-right font-mono">
                    <Badge variant="accent">
                      {t.label.match(/\((\d+)/)?.[1] ?? '?'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 p-3 border-l-4 border-[#CCFF00] bg-[#F5F0E8] text-xs text-[#0F1720]/60 tracking-wide">
            Points are added to your score only after a manager verifies your activity.
          </div>
        </div>
      </div>
    </div>
  )
}
