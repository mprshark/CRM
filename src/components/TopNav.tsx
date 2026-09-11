'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { Menu, X } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  roles: string[]
}

const NAV: NavItem[] = [
  { label: 'DASHBOARD',     href: '/dashboard',              roles: ['ambassador'] },
  { label: 'MY LEADS',      href: '/students',               roles: ['ambassador'] },
  { label: 'MY UPLOADS',    href: '/uploads',                roles: ['ambassador'] },
  { label: 'MY ACTIVITIES', href: '/activities',             roles: ['ambassador'] },
  { label: 'LEADERBOARD',   href: '/leaderboard',            roles: ['ambassador', 'manager', 'admin', 'super_admin'] },
  { label: 'MY PROGRESS',   href: '/progress',               roles: ['ambassador'] },
  { label: 'OVERVIEW',      href: '/manager',                roles: ['manager'] },
  { label: 'VERIFY WORK',   href: '/manager/verification',   roles: ['manager'] },
  { label: 'STUDENTS',      href: '/students',               roles: ['manager', 'admin', 'super_admin'] },
  { label: 'DASHBOARD',     href: '/admin/dashboard',        roles: ['admin', 'super_admin'] },
  { label: 'USERS',         href: '/admin/users',            roles: ['admin', 'super_admin'] },
  { label: 'CAMPUSES',      href: '/admin/campuses',         roles: ['admin', 'super_admin'] },
  { label: 'SCORING',       href: '/admin/config',           roles: ['super_admin'] },
  { label: 'AUDIT LOG',     href: '/admin/audit',            roles: ['super_admin'] },
]

interface TopNavProps {
  role: string
  name: string
  campus?: string
}

export function TopNav({ role, name, campus }: TopNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const items = NAV.filter(n => n.roles.includes(role))

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* ── Desktop & Mobile Navbar ── */}
      <header className="navbar" style={{ height: 60, background: '#fff', borderBottom: '2px solid #0F1720', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 20, position: 'sticky', top: 0 }}>
        
        {/* Logo */}
        <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-grid" style={{ width: 30, height: 30, background: '#CCFF00', border: '2px solid #0F1720', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 4 }}>
            <div style={{ background: '#0F1720', borderRadius: '50%' }} /><div style={{ background: '#0F1720', borderRadius: '50%' }} />
            <div style={{ background: '#0F1720', borderRadius: '50%' }} /><div style={{ background: '#0F1720', borderRadius: '50%' }} />
          </div>
          <span className="logo-text" style={{ fontFamily: 'var(--font-anton), Anton, sans-serif', fontSize: 16, letterSpacing: 2 }}>
            HIGENLABS
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-3">
          {items.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] tracking-[2px] transition-all uppercase font-[Anton] ${
                  active 
                    ? 'bg-[#CCFF00] text-[#0F1720] px-3 py-1.5 border-2 border-[#0F1720] shadow-[2px_2px_0_#0F1720]' 
                    : 'text-[#0F1720] hover:bg-[#F5F0E8] px-3 py-1.5 border-2 border-transparent'
                }`}
                style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Right (User Info + Logout) */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] tracking-[2px] text-[#0F1720]/60 uppercase font-[Anton]" style={{ fontFamily: 'var(--font-anton)' }}>
              {role.replace('_', ' ')}
            </div>
            <div className="text-xs font-semibold">{name}</div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#0F1720] text-white text-[10px] tracking-[2px] uppercase border-2 border-[#0F1720] transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#CCFF00]"
              style={{ fontFamily: 'var(--font-anton), Anton, sans-serif', cursor: 'pointer' }}
            >
              SIGN OUT
            </button>
          </form>
        </div>

        {/* Mobile Hamburger Button */}
        <button className="lg:hidden text-[#0F1720]" onClick={toggleMenu} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* ── Mobile Menu Dropdown ── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-[#F5F0E8] z-50 flex flex-col border-b-2 border-[#0F1720]">
          <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
            {items.map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`text-base tracking-[2px] transition-colors uppercase font-[Anton] ${
                    active 
                      ? 'bg-[#CCFF00] text-[#0F1720] px-4 py-2 border-2 border-[#0F1720] shadow-[2px_2px_0_#0F1720] inline-block w-max' 
                      : 'text-[#0F1720]'
                  }`}
                  style={{ fontFamily: 'var(--font-anton), Anton, sans-serif' }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          <div className="p-6 border-t-2 border-[#0F1720] bg-white">
            <div className="mb-4">
              <div className="text-[10px] tracking-[2px] text-[#0F1720]/60 uppercase font-[Anton]" style={{ fontFamily: 'var(--font-anton)' }}>
                {role.replace('_', ' ')}
              </div>
              <div className="text-sm font-semibold">{name}</div>
              {campus && <div className="text-xs text-[#0F1720]/60">{campus}</div>}
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                onClick={closeMenu}
                className="w-full text-center px-4 py-3 bg-[#0F1720] text-[#CCFF00] text-sm tracking-[3px] uppercase border-2 border-[#0F1720] shadow-[4px_4px_0_#CCFF00]"
                style={{ fontFamily: 'var(--font-anton), Anton, sans-serif', cursor: 'pointer' }}
              >
                SIGN OUT
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
