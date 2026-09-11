'use client'

import { useActionState } from 'react'
import { createCampusAction } from '@/app/actions/campuses'
import { Button } from '@/components/ui'

export function NewCampusForm({ managers }: { managers: any[] }) {
  const [state, formAction, pending] = useActionState(createCampusAction, { error: '' })

  return (
    <div className="border-2 border-[#0F1720] bg-white p-8 max-w-lg" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>Campus Name</label>
          <input name="name" required placeholder="IIT Delhi" className="w-full px-3 py-2.5 bg-[#F5F0E8] border-2 border-[#0F1720] text-sm outline-none focus:shadow-[3px_3px_0_#0F1720] focus:bg-white transition-all" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>City</label>
          <input name="city" required placeholder="New Delhi" className="w-full px-3 py-2.5 bg-[#F5F0E8] border-2 border-[#0F1720] text-sm outline-none focus:shadow-[3px_3px_0_#0F1720] focus:bg-white transition-all" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>Assign Manager</label>
          <select name="manager_id" className="w-full px-3 py-2.5 bg-[#F5F0E8] border-2 border-[#0F1720] text-sm outline-none focus:shadow-[3px_3px_0_#0F1720]">
            <option value="">— Unassigned —</option>
            {managers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {state?.error && <div className="p-3 bg-[#C43B45]/10 border-2 border-[#C43B45] text-[#C43B45] text-sm">{state.error}</div>}

        <Button type="submit" variant="primary" loading={pending} className="mt-4">CREATE CAMPUS →</Button>
      </form>
    </div>
  )
}
