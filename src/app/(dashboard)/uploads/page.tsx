'use client'

import { useState, useRef, useCallback } from 'react'
import { read, utils, writeFile } from 'xlsx'
import { Button, PageHeader, Badge, EmptyState } from '@/components/ui'
import { commitUploadAction, type StudentRow } from '@/app/actions/uploads'
import Link from 'next/link'

const REQUIRED_HEADERS = ['Name', 'Email', 'Phone', 'Year', 'Course', 'Interest']

interface ParsedRow extends StudentRow {
  _errors: string[]
  _idx: number
}

function validateRow(raw: Record<string, string>, idx: number): ParsedRow {
  const errors: string[] = []
  const name     = String(raw['Name']     ?? '').trim()
  const email    = String(raw['Email']    ?? '').trim()
  const phone    = String(raw['Phone']    ?? '').trim()
  const year     = String(raw['Year']     ?? '').trim()
  const course   = String(raw['Course']   ?? '').trim()
  const interest = String(raw['Interest'] ?? '').trim()

  if (!name)  errors.push('Name required')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email required')
  if (!phone || phone.replace(/\D/g, '').length < 10) errors.push('Valid phone required')
  if (!year)  errors.push('Year required')

  return { name, email, phone, year, course, interest, _errors: errors, _idx: idx }
}

function downloadTemplate() {
  const ws = utils.aoa_to_sheet([
    REQUIRED_HEADERS,
    ['Jane Doe', 'jane@college.edu', '9876543210', '2nd Year', 'B.Tech CSE', 'AI / ML'],
  ])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Students')
  writeFile(wb, 'HigenLabs_Upload_Template.xlsx')
}

export default function UploadsPage() {
  const [rows, setRows]       = useState<ParsedRow[]>([])
  const [stage, setStage]     = useState<'idle' | 'preview' | 'done'>('idle')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<{ error?: string; uploadId?: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const wb   = read(e.target?.result as ArrayBuffer, { type: 'array' })
      const ws   = wb.Sheets[wb.SheetNames[0]]
      const data  = utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
      const parsed = data.map((r, i) => validateRow(r, i))
      setRows(parsed)
      setStage('preview')
      setResult(null)
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const errorRows  = rows.filter(r => r._errors.length > 0)
  const validRows  = rows.filter(r => r._errors.length === 0)
  const hasErrors  = errorRows.length > 0

  async function handleCommit() {
    if (hasErrors) return
    setLoading(true)
    const res = await commitUploadAction(validRows.map(({ _errors, _idx, ...r }) => r))
    setResult(res as { error?: string; uploadId?: string })
    if (!res?.error) setStage('done')
    setLoading(false)
  }

  return (
    <div>
      <PageHeader
        title="UPLOAD OUTREACH SHEET"
        subtitle="Upload your student data using the fixed template. Max 2,000 rows."
        action={
          <Button variant="ghost" onClick={downloadTemplate}>
            ↓ DOWNLOAD TEMPLATE
          </Button>
        }
      />

      {stage === 'idle' && (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed border-[#0F1720] p-16 text-center cursor-pointer transition-colors
            ${dragOver ? 'bg-[#CCFF00]/20' : 'bg-white hover:bg-[#F5F0E8]'}`}
          style={{ boxShadow: '4px 4px 0 #0F1720' }}
        >
          <div className="text-4xl mb-4">↑</div>
          <p className="text-xl tracking-wide text-[#0F1720]">DROP YOUR .XLSX HERE</p>
          <p className="text-sm text-[#0F1720]/50 mt-2">or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      )}

      {stage === 'preview' && (
        <div>
          {/* Summary bar */}
          <div className="flex items-center gap-4 mb-6 p-4 border-2 border-[#0F1720] bg-white" style={{ boxShadow: '3px 3px 0 #0F1720' }}>
            <div className="flex-1 text-sm tracking-wide">
              <span className="font-mono text-2xl mr-2">{rows.length}</span> total rows
            </div>
            <Badge variant="ok">{validRows.length} VALID</Badge>
            {hasErrors && <Badge variant="danger">{errorRows.length} ERRORS</Badge>}
            <Button variant="ghost" onClick={() => { setStage('idle'); setRows([]) }}>
              ✕ RESET
            </Button>
            <Button
              variant="primary"
              disabled={hasErrors}
              loading={loading}
              onClick={handleCommit}
            >
              COMMIT {validRows.length} ROWS →
            </Button>
          </div>

          {result?.error && (
            <div className="mb-4 border-2 border-[#C43B45] bg-[#C43B45]/10 p-3 text-sm text-[#C43B45]">
              {result.error}
            </div>
          )}

          {/* Preview table */}
          <div className="border-2 border-[#0F1720] bg-white overflow-x-auto" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                  <th className="px-3 py-3 text-left tracking-widest">#</th>
                  {REQUIRED_HEADERS.map(h => (
                    <th key={h} className="px-3 py-3 text-left tracking-widest">{h.toUpperCase()}</th>
                  ))}
                  <th className="px-3 py-3 text-left tracking-widest">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr
                    key={row._idx}
                    className={`border-b border-[#0F1720]/10 ${row._errors.length ? 'bg-[#C43B45]/5' : ''}`}
                  >
                    <td className="px-3 py-2 font-mono text-[#0F1720]/40">{row._idx + 1}</td>
                    <td className="px-3 py-2">{row.name  || <span className="text-[#C43B45]">—</span>}</td>
                    <td className="px-3 py-2">{row.email || <span className="text-[#C43B45]">—</span>}</td>
                    <td className="px-3 py-2">{row.phone || <span className="text-[#C43B45]">—</span>}</td>
                    <td className="px-3 py-2">{row.year}</td>
                    <td className="px-3 py-2">{row.course}</td>
                    <td className="px-3 py-2">{row.interest}</td>
                    <td className="px-3 py-2">
                      {row._errors.length === 0
                        ? <Badge variant="ok">OK</Badge>
                        : <Badge variant="danger">{row._errors.join(', ')}</Badge>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div className="border-2 border-[#0E8F63] bg-[#0E8F63]/10 p-10 text-center" style={{ boxShadow: '4px 4px 0 #0E8F63' }}>
          <p className="text-3xl text-[#0E8F63] mb-2">✓ UPLOAD COMMITTED</p>
          <p className="text-sm text-[#0F1720]/60 mb-6">
            {validRows.length} student records submitted. A manager will verify them shortly.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" onClick={() => { setStage('idle'); setRows([]) }}>
              UPLOAD ANOTHER
            </Button>
            <Link href="/uploads/history">
              <Button variant="primary">VIEW MY UPLOADS →</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
