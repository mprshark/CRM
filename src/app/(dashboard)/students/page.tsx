import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader, Badge, EmptyState } from '@/components/ui'
import { MessageCircle } from 'lucide-react'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; campus?: string; page?: string }>
}) {
  const { q = '', page = '1' } = await searchParams
  const pageNum  = Math.max(1, parseInt(page, 10))
  const pageSize = 30
  const from     = (pageNum - 1) * pageSize
  const to       = from + pageSize - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('student_records')
    .select('id, name, email, phone, year, course, interest, ca_id, dedupe_hash, uploads(status)', { count: 'exact' })
    .order('id', { ascending: false })
    .range(from, to)

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: students, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div>
      <PageHeader
        title="STUDENT RECORDS"
        subtitle={`${count ?? 0} total records`}
      />

      {/* Search bar */}
      <form className="mb-6 flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="flex-1 px-4 py-2.5 border-2 border-[#0F1720] bg-white text-sm outline-none focus:shadow-[3px_3px_0_#0F1720] transition-shadow"
        />
        <button
          type="submit"
          className="px-5 py-2.5 border-2 border-[#0F1720] bg-[#CCFF00] text-sm tracking-widest hover:shadow-[3px_3px_0_#0F1720] transition-shadow"
        >
          SEARCH
        </button>
      </form>

      {students?.length === 0 ? (
        <EmptyState title="NO RECORDS FOUND" description={q ? `No matches for "${q}".` : 'No student records yet.'} />
      ) : (
        <>
          <div className="border-2 border-[#0F1720] bg-white overflow-x-auto" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                  {['#', 'NAME', 'EMAIL', 'PHONE', 'YEAR', 'COURSE', 'INTEREST', 'STATUS'].map(h => (
                    <th key={h} className="text-left px-4 py-3 tracking-widest text-xs whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students?.map((s, i) => {
                  const uploadStatus = (s.uploads as { status?: string } | null)?.status
                  return (
                    <tr key={s.id} className="border-b border-[#0F1720]/10 hover:bg-[#F5F0E8]/40">
                      <td className="px-4 py-3 font-mono text-[#0F1720]/40 text-xs">{from + i + 1}</td>
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3 text-xs text-[#0F1720]/70">{s.email}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span>{s.phone}</span>
                          {s.phone && (
                            <a 
                              href={`https://wa.me/${s.phone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#0E8F63] hover:text-[#CCFF00] hover:bg-[#0F1720] p-1 border border-transparent hover:border-[#0F1720] transition-colors rounded-full"
                              title="Message on WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{s.year}</td>
                      <td className="px-4 py-3 text-xs">{s.course}</td>
                      <td className="px-4 py-3 text-xs">{s.interest}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            uploadStatus === 'verified' ? 'ok'
                            : uploadStatus === 'rejected' ? 'danger'
                            : 'warn'
                          }
                        >
                          {(uploadStatus ?? 'pending').toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`?q=${q}&page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center border-2 border-[#0F1720] text-sm font-mono
                    ${p === pageNum ? 'bg-[#0F1720] text-[#CCFF00]' : 'bg-white hover:bg-[#F5F0E8]'}`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
