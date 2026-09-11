'use client'

import { useActionState } from 'react'
import { updateUserAction, resetPasswordAction } from '@/app/actions/users'
import { Button } from '@/components/ui'

export function EditUserForm({ user }: { user: any }) {
  const [state, formAction, pending] = useActionState(updateUserAction, { error: '' })

  return (
    <form action={formAction} className="border-2 border-[#0F1720] bg-white p-6 mb-8" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
      <h2 className="text-xl font-bold font-['Anton'] tracking-wide mb-6">PROFILE INFORMATION</h2>
      
      <input type="hidden" name="id" value={user.id} />

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-[10px] tracking-widest font-['Anton'] mb-2">FULL NAME</label>
          <input 
            name="name" 
            defaultValue={user.name}
            required
            className="w-full px-4 py-3 border-2 border-[#0F1720] bg-[#F5F0E8] focus:bg-white outline-none focus:shadow-[4px_4px_0_#0F1720] transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-widest font-['Anton'] mb-2">EMAIL ADDRESS</label>
          <input 
            name="email" 
            type="email"
            defaultValue={user.email}
            required
            className="w-full px-4 py-3 border-2 border-[#0F1720] bg-[#F5F0E8] focus:bg-white outline-none focus:shadow-[4px_4px_0_#0F1720] transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-widest font-['Anton'] mb-2">ROLE</label>
          <select 
            name="role" 
            defaultValue={user.role}
            className="w-full px-4 py-3 border-2 border-[#0F1720] bg-[#F5F0E8] focus:bg-white outline-none focus:shadow-[4px_4px_0_#0F1720] transition-all"
          >
            <option value="ambassador">Ambassador</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {state?.error && (
        <div className="mt-4 border-2 border-[#C43B45] bg-[#C43B45]/10 text-[#C43B45] p-3 text-sm">
          {state.error}
        </div>
      )}

      <div className="mt-8">
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? 'SAVING...' : 'SAVE CHANGES'}
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
      <h2 className="text-xl font-bold font-['Anton'] tracking-wide text-[#CCFF00] mb-2">SECURITY & ACCESS</h2>
      <p className="text-sm opacity-70 mb-6 max-w-md">
        Due to hashing protocols, current passwords cannot be viewed. However, as a Super Admin, you may forcefully reset this user's password.
      </p>
      
      <input type="hidden" name="id" value={userId} />

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-[10px] tracking-widest font-['Anton'] mb-2 text-[#CCFF00]">NEW PASSWORD</label>
          <input 
            name="newPassword" 
            type="text"
            required
            minLength={6}
            placeholder="Enter new password..."
            className="w-full px-4 py-3 border-2 border-white/20 bg-white/5 outline-none focus:border-[#CCFF00] text-white transition-all"
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
          className="px-6 py-3 border-2 border-[#CCFF00] bg-[#CCFF00] text-[#0F1720] font-['Anton'] tracking-widest text-sm hover:bg-transparent hover:text-[#CCFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'RESETTING...' : 'FORCE PASSWORD RESET'}
        </button>
      </div>
    </form>
  )
}
