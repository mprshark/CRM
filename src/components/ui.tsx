import React from 'react'

/* ─── Button ─────────────────────────────────────────────── */
type BtnVariant = 'primary' | 'ghost' | 'danger'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  loading?: boolean
}

export function Button({ variant = 'primary', loading, children, className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm tracking-widest border-2 border-[#0F1720] transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed select-none uppercase'

  const variants: Record<BtnVariant, string> = {
    primary: 'bg-[#CCFF00] text-[#0F1720] shadow-[3px_3px_0_#0F1720] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]',
    ghost:   'bg-transparent text-[#0F1720] shadow-[3px_3px_0_#0F1720] hover:bg-[#0F1720] hover:text-[#CCFF00] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]',
    danger:  'bg-[#C43B45] text-white shadow-[3px_3px_0_#0F1720] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
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
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-[11px] tracking-widest uppercase text-[#0F1720]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-2.5 bg-[#F0EBE0] border-2 border-[#0F1720] text-[#0F1720] text-sm placeholder:text-[#0F1720]/30 outline-none focus:bg-white focus:shadow-[3px_3px_0_#0F1720] transition-all ${error ? 'border-[#C43B45]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#C43B45]" style={{ fontFamily: 'system-ui, sans-serif' }}>{error}</p>}
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
      className={`bg-white border-2 border-[#0F1720] p-5 ${accent ? 'border-l-[6px] border-l-[#CCFF00]' : ''} ${className}`}
      style={{ boxShadow: '4px 4px 0 #0F1720' }}
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
    <span className={`inline-block px-2 py-0.5 text-[11px] tracking-widest border border-[#0F1720] whitespace-nowrap ${colors[variant]}`}>
      {children}
    </span>
  )
}

/* ─── Stat Card ──────────────────────────────────────────── */
interface StatCardProps { label: string; value: string | number; delta?: string; accent?: boolean }

export function StatCard({ label, value, delta, accent }: StatCardProps) {
  return (
    <div
      className={`bg-white border-2 border-[#0F1720] p-4 sm:p-5 flex flex-col gap-1 ${accent ? 'bg-[#CCFF00]' : ''}`}
      style={{ boxShadow: '4px 4px 0 #0F1720' }}
    >
      <p className="text-[10px] tracking-widest uppercase text-[#0F1720]/60">{label}</p>
      <p className="text-3xl sm:text-4xl text-[#0F1720] leading-none">{value}</p>
      {delta && <p className="text-xs text-[#0E8F63] tracking-wide">{delta}</p>}
    </div>
  )
}

/* ─── Page Header ────────────────────────────────────────── */
interface PageHeaderProps { title: string; subtitle?: string; action?: React.ReactNode }

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-4 border-b-2 border-[#0F1720]">
      <div>
        <h1 className="text-2xl sm:text-3xl text-[#0F1720] tracking-tight leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[#0F1720]/50 mt-1" style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

/* ─── Empty State ────────────────────────────────────────── */
interface EmptyStateProps { title: string; description?: string; action?: React.ReactNode }

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#0F1720]/30 bg-white/40">
      <div className="w-12 h-12 border-2 border-[#0F1720] bg-[#F0EBE0] flex items-center justify-center mb-4">
        <span className="text-xl">○</span>
      </div>
      <p className="text-lg tracking-widest text-[#0F1720] mb-1">{title}</p>
      {description && (
        <p className="text-sm text-[#0F1720]/50 mt-1 max-w-xs" style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: 0 }}>
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
