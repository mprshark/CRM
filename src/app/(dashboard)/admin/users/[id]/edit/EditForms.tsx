'use client'

import { useActionState } from 'react'
import { updateUserAction, resetPasswordAction } from '@/app/actions/users'
import { Button } from '@/components/ui'

interface Campus { id: string; name: string }

export function EditUserForm({ user, campuses, isSuperAdmin }: { user: any; campuses: Campus[]; isSuperAdmin: boolean }) {
  const [state, formAction, pending] = useActionState(updateUserAction, { error: '' })

  return (
    <form action={formAction} className="border-2 border-[#0F1720] bg-white p-6 mb-8" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
      <h2 className="text-xl font-bold tracking-wide mb-6" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>PROFILE INFORMATION</h2>
      
      <input type="hidden" name="id" value={user.id} />

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="block text-[10px] tracking-widest mb-2 uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>FULL NAME</label>
          <input 
            name="name" 
            defaultValue={user.name}
            required
            className="w-full px-4 py-3 border-2 border-[#0F1720] bg-[#F5F0E8] focus:bg-white outline-none focus:shadow-[4px_4px_0_#0F1720] transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-widest mb-2 uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>EMAIL ADDRESS</label>
          <input 
            name="email" 
            type="email"
            defaultValue={user.email}
            required
            className="w-full px-4 py-3 border-2 border-[#0F1720] bg-[#F5F0E8] focus:bg-white outline-none focus:shadow-[4px_4px_0_#0F1720] transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-widest mb-2 uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>ROLE</label>
          <select 
            name="role" 
            defaultValue={user.role}
            className="w-full px-4 py-3 border-2 border-[#0F1720] bg-[#F5F0E8] focus:bg-white outline-none focus:shadow-[4px_4px_0_#0F1720] transition-all text-sm"
          >
            <option value="ambassador">Ambassador</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            {isSuperAdmin && <option value="super_admin">Super Admin</option>}
          </select>
        </div>

        <div>
          <label className="block text-[10px] tracking-widest mb-2 uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>CAMPUS</label>
          <select 
            name="campus_id" 
            defaultValue={user.campus_id ?? ''}
            className="w-full px-4 py-3 border-2 border-[#0F1720] bg-[#F5F0E8] focus:bg-white outline-none focus:shadow-[4px_4px_0_#0F1720] transition-all text-sm"
          >
            <option value="">— None (Global) —</option>
            {campuses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] tracking-widest mb-2 uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>STATUS</label>
          <select 
            name="status" 
            defaultValue={user.status ?? 'active'}
            className="w-full px-4 py-3 border-2 border-[#0F1720] bg-[#F5F0E8] focus:bg-white outline-none focus:shadow-[4px_4px_0_#0F1720] transition-all text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {state?.error && (
        <div className="mt-4 border-2 border-[#C43B45] bg-[#C43B45]/10 text-[#C43B45] p-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="mt-8">
        <Button variant="primary" type="submit" disabled={pending} className="max-w-xs">
          {pending ? 'SAVING...' : 'SAVE CHANGES →'}
        </Button>
      </div>
    </form>
  )
}

type ResetState = { error?: string; success?: string }

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(resetPasswordAction, {})

  return (
    <form action={formAction} className="border-2 border-[#0F1720] bg-[#0F1720] text-white p-6" style={{ boxShadow: '4px 4px 0 #CCFF00' }}>
      <h2 className="text-xl font-bold tracking-wide text-[#CCFF00] mb-2" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>SECURITY &amp; ACCESS</h2>
      <p className="text-sm opacity-70 mb-6 max-w-md">
        Due to hashing protocols, current passwords cannot be viewed. As a Super Admin, you may forcefully reset this user&apos;s password.
      </p>
      
      <input type="hidden" name="id" value={userId} />

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-[10px] tracking-widest mb-2 text-[#CCFF00] uppercase" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>NEW PASSWORD</label>
          <input 
            name="newPassword" 
            type="text"
            required
            minLength={6}
            placeholder="Enter new password..."
            className="w-full px-4 py-3 border-2 border-white/20 bg-white/5 outline-none focus:border-[#CCFF00] text-white transition-all text-sm"
          />
        </div>
      </div>

      {state?.error && (
        <div className="mt-4 border-2 border-[#C43B45] bg-[#C43B45]/20 text-white p-3 text-sm">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mt-4 border-2 border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00] p-3 text-sm font-bold tracking-wide">
          ✓ {state.success}
        </div>
      )}

      <div className="mt-8">
        <button 
          type="submit" 
          disabled={pending}
          className="px-6 py-3 border-2 border-[#CCFF00] bg-[#CCFF00] text-[#0F1720] tracking-widest text-sm hover:bg-transparent hover:text-[#CCFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}
        >
          {pending ? 'RESETTING...' : 'FORCE PASSWORD RESET'}
        </button>
      </div>
    </form>
  )
}
