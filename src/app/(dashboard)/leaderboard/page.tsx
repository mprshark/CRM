import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, Badge } from '@/components/ui'

async function getAmbassadorBoard(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.rpc('get_ambassador_leaderboard')
  return data ?? []
}

async function getStudentBoard(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.rpc('get_student_leaderboard')
  return data ?? []
}

type Board = 'ambassadors' | 'students'

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>
}) {
  const { board = 'ambassadors' } = await searchParams
  const activeBoard = board as Board

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const ambassadors = activeBoard === 'ambassadors' ? await getAmbassadorBoard(supabase) : []
  const students    = activeBoard === 'students'    ? await getStudentBoard(supabase)    : []

  const rows = activeBoard === 'ambassadors' ? ambassadors : students

  return (
    <div>
      <PageHeader
        title="LEADERBOARD"
        subtitle="Live rankings updated on every verified action."
      />

      {/* Tab switcher */}
      <div className="flex border-2 border-[#0F1720] mb-8 w-fit" style={{ boxShadow: '3px 3px 0 #0F1720' }}>
        {(['ambassadors', 'students'] as Board[]).map(b => (
          <a
            key={b}
            href={`?board=${b}`}
            className={`px-6 py-3 text-sm tracking-widest transition-colors
              ${activeBoard === b
                ? 'bg-[#0F1720] text-[#CCFF00]'
                : 'bg-white text-[#0F1720] hover:bg-[#F5F0E8]'}`}
          >
            {b.toUpperCase()}
          </a>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="border-2 border-[#0F1720] bg-white overflow-x-auto" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
        {rows.length === 0 ? (
          <div className="p-16 text-center text-sm text-[#0F1720]/40 tracking-widest">
            NO DATA YET — SCORES APPEAR ONCE WORK IS VERIFIED.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                <th className="text-left px-4 py-3 tracking-widest text-xs w-16">RANK</th>
                <th className="text-left px-4 py-3 tracking-widest text-xs">NAME</th>
                {activeBoard === 'ambassadors' && (
                  <th className="text-left px-4 py-3 tracking-widest text-xs">CAMPUS</th>
                )}
                <th className="text-right px-4 py-3 tracking-widest text-xs">POINTS</th>
                <th className="text-right px-4 py-3 tracking-widest text-xs">STUDENTS</th>
                <th className="text-right px-4 py-3 tracking-widest text-xs">DELTA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: Record<string, unknown>, i: number) => {
                const rank = i + 1
                return (
                  <tr
                    key={String(row.id)}
                    className={`border-b border-[#0F1720]/10 transition-colors
                      ${rank === 1 ? 'bg-[#CCFF00]/20' : 'hover:bg-[#F5F0E8]/40'}`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex w-8 h-8 items-center justify-center border-2 border-[#0F1720] font-mono text-sm
                          ${rank === 1 ? 'bg-[#CCFF00] text-[#0F1720]'
                          : rank === 2 ? 'bg-[#0F1720] text-white'
                          : rank === 3 ? 'bg-[#0F1720]/70 text-white'
                          : 'bg-transparent text-[#0F1720]/50'}`}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{String(row.name ?? '—')}</td>
                    {activeBoard === 'ambassadors' && (
                      <td className="px-4 py-3 text-[#0F1720]/60 text-xs">{String(row.campus ?? '—')}</td>
                    )}
                    <td className="px-4 py-3 text-right font-mono text-lg">{String(row.total_points ?? 0)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#0F1720]/60">{String(row.student_count ?? 0)}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={Number(row.adjustment_delta ?? 0) >= 0 ? 'ok' : 'danger'}>
                        {Number(row.adjustment_delta ?? 0) >= 0 ? '+' : ''}{String(row.adjustment_delta ?? 0)}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-xs text-[#0F1720]/40 tracking-wide">
        Scores = verified outreach points + activity points + manual adjustments. No score is ever typed directly.
      </p>
    </div>
  )
}
