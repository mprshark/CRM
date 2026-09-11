'use client'

import { useState, useRef, useCallback } from 'react'
import { read, utils } from 'xlsx'
import { Button, PageHeader, Badge } from '@/components/ui'
import { commitUploadAction, type StudentRow } from '@/app/actions/uploads'
import Link from 'next/link'

// ── Column auto-detection ────────────────────────────────────────────────────
// Each CRM field maps to a list of header keywords (lowercase, checked by inclusion)
const FIELD_KEYWORDS: Record<keyof StudentRow, string[]> = {
  name:     ['name', 'student', 'full', 'candidate', 'first'],
  email:    ['email', 'mail', 'e-mail', 'id'],
  phone:    ['phone', 'mobile', 'contact', 'number', 'cell', 'whatsapp', 'no'],
  year:     ['year', 'sem', 'semester', 'batch', 'grade', 'class'],
  course:   ['course', 'program', 'programme', 'degree', 'branch', 'dept', 'department', 'stream', 'major'],
  interest: ['interest', 'domain', 'topic', 'field', 'area', 'specializ', 'focus'],
}

function detectMapping(headers: string[]): Record<keyof StudentRow, string | null> {
  const mapping = { name: null, email: null, phone: null, year: null, course: null, interest: null } as Record<keyof StudentRow, string | null>
  const used = new Set<string>()

  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS) as [keyof StudentRow, string[]][]) {
    for (const h of headers) {
      if (used.has(h)) continue
      const hl = h.toLowerCase()
      if (keywords.some(k => hl.includes(k))) {
        mapping[field] = h
        used.add(h)
        break
      }
    }
  }
  return mapping
}

type ColumnMapping = Record<keyof StudentRow, string | null>

interface RawRow {
  _idx: number
  _raw: Record<string, string>
}

interface MappedRow extends StudentRow {
  _idx: number
  _issues: string[]
}

function mapRow(raw: Record<string, string>, mapping: ColumnMapping, idx: number): MappedRow {
  const get = (f: keyof StudentRow) => String(raw[mapping[f] ?? ''] ?? '').trim()
  const issues: string[] = []

  const name     = get('name')
  const email    = get('email')
  const phone    = get('phone')
  const year     = get('year')
  const course   = get('course')
  const interest = get('interest')

  if (!name)  issues.push('No name')
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.push('Bad email')
  if (phone && phone.replace(/\D/g, '').length < 6) issues.push('Short phone')

  return { name, email, phone, year, course, interest, _idx: idx, _issues: issues }
}

export default function UploadsPage() {
  const [stage, setStage]           = useState<'idle' | 'preview' | 'map' | 'done'>('idle')
  const [allHeaders, setAllHeaders] = useState<string[]>([])
  const [rawRows, setRawRows]       = useState<RawRow[]>([])
  const [mapping, setMapping]       = useState<ColumnMapping>({ name: null, email: null, phone: null, year: null, course: null, interest: null })
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<{ error?: string } | null>(null)
  const [dragOver, setDragOver]     = useState(false)
  const [fileName, setFileName]     = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const wb = read(e.target?.result as ArrayBuffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]

      // Get all data as raw rows
      const data = utils.sheet_to_json<Record<string, string>>(ws, { defval: '', raw: false })

      if (data.length === 0) return

      const headers = Object.keys(data[0])
      const detected = detectMapping(headers)

      setAllHeaders(headers)
      setRawRows(data.map((r, i) => ({ _idx: i, _raw: r })))
      setMapping(detected)
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

  const mappedRows = rawRows.map(r => mapRow(r._raw, mapping, r._idx))
  const okRows     = mappedRows.filter(r => r._issues.length === 0)
  const warnRows   = mappedRows.filter(r => r._issues.length > 0)
  const unmappedFields = (Object.keys(mapping) as (keyof StudentRow)[]).filter(f => !mapping[f])

  async function handleCommit() {
    setLoading(true)
    const toCommit: StudentRow[] = mappedRows.map(({ _idx, _issues, ...r }) => r)
    const res = await commitUploadAction(toCommit)
    setResult(res as { error?: string })
    if (!(res as { error?: string }).error) setStage('done')
    setLoading(false)
  }

  function reset() {
    setStage('idle')
    setAllHeaders([])
    setRawRows([])
    setMapping({ name: null, email: null, phone: null, year: null, course: null, interest: null })
    setResult(null)
    setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  // Show up to 100 rows in preview, pagination isn't needed for this MVP
  const previewRows = rawRows.slice(0, 100)

  return (
    <div>
      <PageHeader
        title="UPLOAD SHEET"
        subtitle="Upload any spreadsheet — Excel or CSV. Columns are auto-detected."
      />

      {/* ── IDLE: Drop zone ── */}
      {stage === 'idle' && (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed border-[#0F1720] p-16 text-center cursor-pointer transition-all
            ${dragOver ? 'bg-[#CCFF00]/30 scale-[1.01]' : 'bg-white hover:bg-[#F5F0E8]'}`}
          style={{ boxShadow: '4px 4px 0 #0F1720' }}
        >
          <div className="text-6xl mb-4">📄</div>
          <p className="text-2xl tracking-widest text-[#0F1720] mb-2" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
            DROP ANY SPREADSHEET
          </p>
          <p className="text-sm text-[#0F1720]/50 mt-2">Supports .xlsx · .xls · .csv — any columns, any format</p>
          <p className="text-xs text-[#0F1720]/30 mt-1">Or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.ods,.tsv"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      )}

      {/* ── PREVIEW: Smart mapping + raw data ── */}
      {stage === 'preview' && (
        <div>
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 border-2 border-[#0F1720] bg-white" style={{ boxShadow: '3px 3px 0 #0F1720' }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#0F1720]/50 tracking-widest">FILE</p>
              <p className="text-sm font-mono truncate">{fileName}</p>
            </div>
            <Badge variant="neutral">{rawRows.length} ROWS</Badge>
            <Badge variant="ok">{allHeaders.length} COLS DETECTED</Badge>
            {warnRows.length > 0 && <Badge variant="warn">{warnRows.length} WARNINGS</Badge>}
            {unmappedFields.length > 0 && <Badge variant="danger">{unmappedFields.length} UNMAPPED</Badge>}
            <Button variant="secondary" onClick={reset} className="px-3 py-1 text-xs !min-h-0 !w-auto">✕ RESET</Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={handleCommit}
              className="px-4 py-1 text-xs !min-h-0 !w-auto"
            >
              COMMIT {rawRows.length} ROWS →
            </Button>
          </div>

          {result?.error && (
            <div className="mb-4 border-2 border-[#C43B45] bg-[#C43B45]/10 p-3 text-sm text-[#C43B45]">
              {result.error}
            </div>
          )}

          {/* Column Mapping Panel */}
          <div className="mb-6 border-2 border-[#0F1720] bg-white p-5" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
            <h2 className="text-sm tracking-widest mb-4 border-b-2 border-[#0F1720] pb-2" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
              COLUMN MAPPING — CRM FIELD → YOUR COLUMN
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(mapping) as (keyof StudentRow)[]).map(field => (
                <div key={field}>
                  <label className="text-[10px] tracking-widest uppercase text-[#0F1720]/60 block mb-1"
                    style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
                    {field} {field === 'name' || field === 'email' ? '(required)' : '(optional)'}
                  </label>
                  <select
                    value={mapping[field] ?? ''}
                    onChange={e => setMapping(prev => ({ ...prev, [field]: e.target.value || null }))}
                    className={`w-full px-2 py-2 border-2 text-xs outline-none ${mapping[field] ? 'border-[#0E8F63] bg-[#0E8F63]/5' : 'border-[#B26A00] bg-[#B26A00]/5'}`}
                  >
                    <option value="">— not mapped —</option>
                    {allHeaders.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#0F1720]/40 tracking-wide">
              Columns were auto-detected. Adjust any mapping above before committing.
            </p>
          </div>

          {/* Raw data preview */}
          <div className="border-2 border-[#0F1720] bg-white overflow-x-auto" style={{ boxShadow: '4px 4px 0 #0F1720' }}>
            <div className="p-3 border-b-2 border-[#0F1720] bg-[#0F1720] text-[#CCFF00]">
              <span className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
                RAW DATA PREVIEW — SHOWING {Math.min(100, rawRows.length)} OF {rawRows.length} ROWS
              </span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-[#0F1720] bg-[#F5F0E8]">
                  <th className="px-3 py-2 text-left tracking-widest whitespace-nowrap">#</th>
                  {allHeaders.map(h => {
                    const mappedTo = (Object.keys(mapping) as (keyof StudentRow)[]).find(f => mapping[f] === h)
                    return (
                      <th key={h} className={`px-3 py-2 text-left tracking-widest whitespace-nowrap ${mappedTo ? 'text-[#0E8F63]' : 'text-[#0F1720]/40'}`}>
                        {h.toUpperCase()}
                        {mappedTo && (
                          <span className="ml-1 text-[8px] bg-[#CCFF00] text-[#0F1720] px-1 py-0.5 border border-[#0F1720]">
                            ={mappedTo}
                          </span>
                        )}
                      </th>
                    )
                  })}
                  <th className="px-3 py-2 text-left tracking-widest whitespace-nowrap">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map(({ _idx, _raw }) => {
                  const mapped = mapRow(_raw, mapping, _idx)
                  return (
                    <tr
                      key={_idx}
                      className={`border-b border-[#0F1720]/10 ${mapped._issues.length ? 'bg-[#B26A00]/5' : ''}`}
                    >
                      <td className="px-3 py-2 font-mono text-[#0F1720]/40">{_idx + 1}</td>
                      {allHeaders.map(h => (
                        <td key={h} className="px-3 py-2 max-w-[180px] truncate" title={_raw[h]}>
                          {_raw[h] || <span className="text-[#0F1720]/20">—</span>}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        {mapped._issues.length === 0
                          ? <Badge variant="ok">OK</Badge>
                          : <Badge variant="warn">{mapped._issues.join(', ')}</Badge>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {rawRows.length > 100 && (
              <div className="p-3 border-t-2 border-[#0F1720] bg-[#F5F0E8] text-xs text-[#0F1720]/50 tracking-wide text-center">
                Showing first 100 rows. All {rawRows.length} rows will be committed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {stage === 'done' && (
        <div className="border-2 border-[#0E8F63] bg-[#0E8F63]/10 p-10 text-center" style={{ boxShadow: '4px 4px 0 #0E8F63' }}>
          <p className="text-5xl mb-4">✓</p>
          <p className="text-2xl text-[#0E8F63] mb-2 tracking-widest" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
            UPLOAD COMMITTED
          </p>
          <p className="text-sm text-[#0F1720]/60 mb-8">
            {rawRows.length} records submitted for verification.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="secondary" onClick={reset} className="!w-auto px-6">
              UPLOAD ANOTHER
            </Button>
            <Link href="/dashboard">
              <Button variant="primary" className="!w-auto px-6">VIEW UPLOADS →</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
