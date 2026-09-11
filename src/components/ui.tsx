import React from 'react'

/* ─── Button ─────────────────────────────────────────────── */
type BtnVariant = 'primary' | 'secondary' | 'danger'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  loading?: boolean
}

export function Button({ variant = 'primary', loading, children, className = '', ...props }: ButtonProps) {
  let baseClass = 'btn-primary'
  if (variant === 'secondary') baseClass = 'btn-secondary'
  if (variant === 'danger') {
    baseClass = 'btn-primary' // We can just override colors via style or custom class if needed
    className += ' bg-[#C43B45] text-white hover:bg-[#C43B45]'
  }

  return (
    <button className={`${baseClass} ${className} flex items-center justify-center gap-2`} disabled={loading || props.disabled} {...props}>
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  )
}

/* ─── Input ──────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] tracking-[3px] uppercase text-[#0F1720]" style={{ fontFamily: 'var(--font-anton), Anton, system-ui, sans-serif' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`field-input ${error ? 'border-[#C43B45] bg-[rgba(196,59,69,0.05)] focus:bg-white' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[13px] text-[#C43B45] border-2 border-[#C43B45] bg-[rgba(196,59,69,0.1)] p-2">{error}</p>}
    </div>
  )
}

/* ─── Card ───────────────────────────────────────────────── */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean
}

export function Card({ children, className = '', accent, ...props }: CardProps) {
  return (
    <div
      className={`form-card ${accent ? 'border-l-[6px] border-l-[#CCFF00]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/* ─── Badge ──────────────────────────────────────────────── */
type BadgeVariant = 'ok' | 'warn' | 'danger' | 'neutral' | 'accent'
interface BadgeProps { variant?: BadgeVariant; children: React.ReactNode }

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  const colors: Record<BadgeVariant, string> = {
    ok:      'bg-[#0E8F63] text-white',
    warn:    'bg-[#B26A00] text-white',
    danger:  'bg-[#C43B45] text-white',
    neutral: 'bg-[#0F1720] text-white',
    accent:  'bg-[#CCFF00] text-[#0F1720]',
  }
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 text-[10px] tracking-[2px] border-2 border-[#0F1720] whitespace-nowrap brut-shadow-sm uppercase font-[Anton] ${colors[variant]}`} style={{ fontFamily: 'var(--font-anton)' }}>
      {children}
    </span>
  )
}

/* ─── Stat Card ──────────────────────────────────────────── */
interface StatCardProps { label: string; value: string | number; delta?: string; accent?: boolean }

export function StatCard({ label, value, delta, accent }: StatCardProps) {
  return (
    <div className={`border-[3px] border-[#0F1720] shadow-[8px_8px_0_#0F1720] relative flex flex-col justify-center ${accent ? 'bg-[#CCFF00]' : 'bg-[#0F1720] text-white'}`} style={{ padding: '24px 28px', minWidth: 120 }}>
      <p className={`text-[9px] tracking-[3px] uppercase opacity-60 mb-2 ${accent ? 'text-[#0F1720]' : 'text-white'}`} style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>{label}</p>
      <p className={`text-4xl sm:text-5xl leading-none tracking-[-0.5px] ${accent ? 'text-[#0F1720]' : 'text-[#CCFF00]'}`} style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
        {value}
      </p>
      {delta && <p className="text-[11px] tracking-[2px] opacity-80 mt-2 uppercase font-[Anton]" style={{ fontFamily: 'var(--font-anton)' }}>{delta}</p>}
    </div>
  )
}

/* ─── Page Header ────────────────────────────────────────── */
interface PageHeaderProps { title: string; subtitle?: string; action?: React.ReactNode }

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div className="flex flex-col">
        <div className="inline-flex items-center gap-2 border-2 border-[#0F1720] bg-white px-3 py-1 mb-4 shadow-[2px_2px_0_#0F1720] w-max">
          <div className="w-2 h-2 bg-[#CCFF00] border border-[#0F1720]" />
          <span className="text-[9px] tracking-[3px] font-[Anton] uppercase text-[#0F1720]" style={{ fontFamily: 'var(--font-anton)' }}>WORKSPACE</span>
        </div>
        <h1 className="text-4xl sm:text-[56px] text-[#0F1720] leading-none tracking-[-1px] uppercase mb-4" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
          {title}
        </h1>
        {subtitle && (
          <div className="border-[3px] border-[#0F1720] bg-white px-5 py-4 max-w-[500px] shadow-[4px_4px_0_#0F1720]">
            <p className="text-[15px] text-[#0F1720] leading-snug" style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: 0 }}>
              {subtitle}
            </p>
          </div>
        )}
      </div>
      {action && <div className="flex-shrink-0 mt-4 md:mt-0">{action}</div>}
    </div>
  )
}

/* ─── Empty State ────────────────────────────────────────── */
interface EmptyStateProps { title: string; description?: string; action?: React.ReactNode }

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-[3px] border-[#0F1720] bg-white shadow-[8px_8px_0_#0F1720] w-full my-6">
      <div className="w-14 h-14 bg-[#CCFF00] border-[3px] border-[#0F1720] flex items-center justify-center mb-6 shadow-[4px_4px_0_#0F1720]">
        <span className="text-2xl font-[Anton]" style={{ fontFamily: 'var(--font-anton)' }}>!</span>
      </div>
      <h2 className="text-2xl sm:text-3xl text-[#0F1720] tracking-[-0.5px] uppercase mb-2" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}>
        {title}
      </h2>
      {description && (
        <p className="text-[15px] text-[#0F1720]/60 max-w-md leading-relaxed" style={{ fontFamily: 'system-ui, sans-serif' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-8 w-full max-w-xs">{action}</div>}
    </div>
  )
}
