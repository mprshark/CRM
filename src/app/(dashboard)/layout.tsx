import { redirect } from 'next/navigation'
import { TopNav } from '@/components/TopNav'
import { getEffectiveRole } from '@/utils/getEffectiveRole'
import { createClient } from '@/utils/supabase/server'
import React from 'react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getEffectiveRole()
  if (!result) redirect('/login')

  const { role } = result

  // Get display info
  const { data: profile } = await supabase
    .from('users')
    .select('name, campus_id, campuses(name)')
    .eq('id', user.id)
    .single()

  const name   = profile?.name ?? user.email ?? 'User'
  const campus = (profile?.campuses as { name?: string } | null)?.name

  return (
    <div className="login-root dot-grid min-h-screen flex flex-col">
      <TopNav role={role} name={name} campus={campus} />

      {/* Main body split layout matching Login Page */}
      <main className="main-body dot-grid flex-1">

        {/* Left hero column (Desktop only) */}
        <div className="hero-col desktop-only">
          <div className="eyebrow">
            <div className="eyebrow-dot" />
            <span>THE CRM FOR CAMPUS AMBASSADORS</span>
          </div>
          <div className="headline">
            <div className="hl-line">HIGENLABS</div>
            <div className="hl-line">CRM</div>
            <div className="hl-line"><span className="hl-yellow-block">WORKSPACE.</span></div>
          </div>
          <div className="desc-box">
            <p>
              Upload your outreach sheets, track your performance, and see your rank on the live leaderboard. Logged in as <strong>{name}</strong>.
            </p>
          </div>
          <div className="feature-grid">
            {[['⚡','UPLOAD SHEETS'],['∞','LIVE LEADERBOARD'],['✕','SCORE ENGINE'],['↑','EXPORT DATA']].map(([i,l]) => (
              <div key={l} className="feature-pill"><span className="feature-icon">{i}</span>{l}</div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 40, fontFamily: 'var(--font-anton), Anton, system-ui, sans-serif', fontSize: 10, letterSpacing: 2, color: 'rgba(15,23,32,0.4)', textTransform: 'uppercase' }}>
            COPYRIGHT RESERVED FOR HIGENLABS @ 2026
          </div>
        </div>

        {/* Right main content card */}
        <div className="dashboard-content-col">
          <div className="dashboard-card">
            <div className="card-corner-tag">/ WORKSPACE</div>
            {children}
          </div>
        </div>

      </main>

      {/* Mobile Footer */}
      <div className="mobile-only" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F5F0E8', fontFamily: 'var(--font-anton), Anton, system-ui, sans-serif', fontSize: 9, letterSpacing: 2, color: 'rgba(15,23,32,0.4)', textTransform: 'uppercase' }}>
        COPYRIGHT RESERVED FOR HIGENLABS @ 2026
      </div>
    </div>
  )
}
