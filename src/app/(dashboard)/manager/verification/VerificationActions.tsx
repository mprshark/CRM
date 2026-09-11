'use client'

import { useTransition } from 'react'
import { verifyUploadAction, rejectUploadAction, verifyActivityAction, rejectActivityAction } from '@/app/actions/verification'
import { Button } from '@/components/ui'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  type: 'upload' | 'activity'
}

export default function VerificationActions({ id, type }: Props) {
  const [verifying, startVerify] = useTransition()
  const [rejecting, startReject] = useTransition()
  const router = useRouter()

  function handleVerify() {
    startVerify(async () => {
      if (type === 'upload') await verifyUploadAction(id)
      else await verifyActivityAction(id)
      router.refresh()
    })
  }

  function handleReject() {
    startReject(async () => {
      if (type === 'upload') await rejectUploadAction(id)
      else await rejectActivityAction(id)
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="primary"
        className="py-1 px-3 text-xs"
        onClick={handleVerify}
        loading={verifying}
      >
        ✓ VERIFY
      </Button>
      <Button
        variant="danger"
        className="py-1 px-3 text-xs"
        onClick={handleReject}
        loading={rejecting}
      >
        ✕ REJECT
      </Button>
    </div>
  )
}
