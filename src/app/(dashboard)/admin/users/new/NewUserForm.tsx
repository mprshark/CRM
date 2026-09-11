'use client'

import { useActionState } from 'react'
import { createUserAction } from '@/app/actions/users'
import { Button, Input } from '@/components/ui'

export function NewUserForm({ campuses, isSuperAdmin }: { campuses: any[], isSuperAdmin: boolean }) {
  const [state, formAction, pending] = useActionState(createUserAction, { error: '' })

  return (
    <div className="border-2 border-[#0F1720] bg-white p-8 max-w-lg" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
      <form action={formAction} className="flex flex-col gap-5">
        <Input id="name" name="name" label="Full Name" placeholder="Jane Doe" required />
        <Input id="email" name="email" type="email" label="Email Address" placeholder="jane@college.edu" required />
        <Input id="password" name="password" type="text" label="Initial Password" placeholder="Min. 6 characters" required />
        
        <div className="flex flex-col gap-1">
          <label className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>Role</label>
          <select name="role" required className="w-full px-3 py-2.5 bg-white border-2 border-[#0F1720] text-sm outline-none focus:shadow-[3px_3px_0_#0F1720]">
            <option value="ambassador">Ambassador</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            {isSuperAdmin && <option value="super_admin">Super Admin</option>}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>Assign Campus</label>
          <select name="campus_id" className="w-full px-3 py-2.5 bg-white border-2 border-[#0F1720] text-sm outline-none focus:shadow-[3px_3px_0_#0F1720]">
            <option value="">— None (Global) —</option>
            {campuses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {state?.error && <div className="p-3 bg-[#C43B45]/10 border-2 border-[#C43B45] text-[#C43B45] text-sm">{state.error}</div>}

        <Button type="submit" variant="primary" loading={pending} className="mt-4">CREATE USER →</Button>
      </form>
    </div>
  )
}
