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

interface SidebarProps {
  role: string
  name: string
  campus?: string
}

export function Sidebar({ role, name, campus }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const items = NAV.filter(n => n.roles.includes(role))

  const roleLabel: Record<string, string> = {
    ambassador: 'AMBASSADOR',
    manager:    'MANAGER',
    admin:      'ADMIN',
    super_admin: 'SUPER ADMIN',
  }

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b-2 border-white/10 flex justify-between items-center">
        <div>
          <div className="text-lg tracking-widest text-[#CCFF00]">HIGENLABS</div>
          <div className="text-xs text-white/40 tracking-widest">· CRM</div>
        </div>
        <button className="md:hidden text-white" onClick={closeSidebar}>
          <X size={24} />
        </button>
      </div>

      {/* User badge */}
      <div className="px-5 py-4 border-b-2 border-white/10">
        <div className="text-xs tracking-widest text-white/40 mb-1">{roleLabel[role] ?? role.toUpperCase()}</div>
        <div className="text-sm text-white truncate">{name}</div>
        {campus && <div className="text-xs text-white/40 truncate">{campus}</div>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-2 px-5 py-3 text-sm tracking-widest transition-colors
                ${active
                  ? 'bg-[#CCFF00] text-[#0F1720] border-l-4 border-[#CCFF00]'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                }`}
            >
              {active && <span className="w-1.5 h-1.5 bg-[#0F1720] rounded-none" />}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-5 py-4 border-t-2 border-white/10">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left text-xs tracking-widest text-white/40 hover:text-[#CCFF00] transition-colors uppercase"
          >
            ← Sign out
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Topbar / Hamburger */}
      <div className="md:hidden flex items-center justify-between bg-[#0F1720] px-4 py-3 text-white border-b-2 border-black sticky top-0 z-20">
        <div>
          <span className="text-[#CCFF00] tracking-widest font-bold">HIGENLABS</span>
        </div>
        <button onClick={toggleSidebar}>
          <Menu size={28} />
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col h-full border-r-2 border-[#0F1720] w-64 bg-[#0F1720] flex-shrink-0`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
