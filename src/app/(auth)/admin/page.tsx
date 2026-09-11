'use client'

import { useActionState } from 'react'
import { adminLoginAction } from '@/app/actions/auth'
import Link from 'next/link'

const initialState = { error: '' }

const TICKERS = [
  'ADMIN ACCESS ONLY', 'MANAGE ALL CAMPUSES', 'CONFIGURE SCORING ENGINE',
  'FULL AUDIT TRAIL', 'EXPORT DATA', 'SUPER ADMIN CONTROLS',
  'RESTRICTED ZONE'
]

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState)

  return (
    <div className="login-root">

      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="navbar-logo">
          <div className="logo-grid-admin">
            <div className="logo-dot-admin" /><div className="logo-dot-admin" />
            <div className="logo-dot-admin" /><div className="logo-dot-admin" />
          </div>
          <span className="logo-text">HIGENLABS · ADMIN</span>
        </div>
        <nav className="navbar-links desktop-only">
          {['SECURITY','AUDIT','POLICIES','HELP'].map(n => <span key={n} className="nav-item">{n}</span>)}
        </nav>
        <div className="navbar-right">
          <Link href="/login" className="navbar-sub-link desktop-only">← AMBASSADOR LOGIN</Link>
          <button className="navbar-cta-admin">SYSTEM STATUS</button>
        </div>
      </header>

      {/* ── Ticker ── */}
      <div className="ticker-bar ticker-dark">
        <div className="ticker-track track-reverse">
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} className="ticker-item ticker-yellow">
              {t} &nbsp;•&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Mobile-only top strip with headline ── */}
      <div className="mobile-hero mobile-only" style={{ background: '#CCFF00', borderBottom: '2px solid #0F1720' }}>
        <div className="mobile-eyebrow" style={{ color: '#0F1720', borderColor: 'rgba(15,23,32,0.4)' }}>
          <div className="eyebrow-dot" style={{ background: '#0F1720' }} />
          <span>RESTRICTED ACCESS AREA</span>
        </div>
        <h1 className="mobile-headline" style={{ color: '#0F1720' }}>
          CONTROL<br />THE<br />
          <span className="hl-dark">SYSTEM.</span>
        </h1>
        <p className="mobile-sub" style={{ color: 'rgba(15,23,32,0.7)' }}>
          Manage all campuses, configure the scoring engine, and review the full immutable audit trail.
        </p>
      </div>

      {/* ── Main body ── */}
      <main className="main-body dot-grid">

        {/* Left hero (desktop only) */}
        <div className="hero-col desktop-only">
          <div className="eyebrow eyebrow-admin">
            <div className="eyebrow-dot-admin" />
            <span>RESTRICTED ACCESS AREA</span>
          </div>
          <div className="headline">
            <div className="hl-line">CONTROL</div>
            <div className="hl-line">THE</div>
            <div className="hl-line"><span className="hl-dark-block">SYSTEM.</span></div>
          </div>
          <div className="desc-box">
            <p>Manage all campuses, configure the scoring engine, and review the full immutable audit trail. Authorised personnel only.</p>
          </div>
          <div className="feature-grid">
            {[['⚡','MANAGE USERS'],['∞','ALL CAMPUSES'],['✕','AUDIT TRAIL'],['↑','SCORING CONFIG']].map(([i,l]) => (
              <div key={l} className="feature-pill"><span className="feature-icon">{i}</span>{l}</div>
            ))}
          </div>

          <div style={{ marginTop: 40, fontFamily: 'Anton, system-ui, sans-serif', fontSize: 10, letterSpacing: 2, color: 'rgba(15,23,32,0.4)', textTransform: 'uppercase' }}>
            COPYRIGHT RESERVED FOR HIGENLABS @ 2026
          </div>
        </div>

        {/* Form col */}
        <div className="form-col">
          <div className="form-card-admin">
            <div className="card-corner-tag-admin">/ ADMIN</div>
            <h2 className="card-title-admin">Admin Sign in</h2>
            <p className="card-sub-admin">Authorised personnel only.</p>
            <form action={formAction} className="form-body">
              <div className="field">
                <label htmlFor="email" className="field-label-admin">EMAIL</label>
                <input id="email" name="email" type="email" placeholder="admin@higenlabs.com"
                  defaultValue="admin@higenlabs.com" required autoComplete="email" className="field-input-admin" />
              </div>
              <div className="field">
                <div className="field-header">
                  <label htmlFor="password" className="field-label-admin">PASSWORD</label>
                </div>
                <input id="password" name="password" type="password" placeholder="••••••••"
                  defaultValue="admin123" required autoComplete="current-password" className="field-input-admin" />
              </div>
              <div className="checkbox-row">
                <div className="checkbox-box-admin"></div>
                <span className="checkbox-label-admin">Trust this device</span>
              </div>
              {state?.error && <div className="form-error-admin">{state.error}</div>}
              <button type="submit" disabled={pending} className="btn-primary-admin">
                {pending ? 'AUTHENTICATING...' : 'ACCESS CONTROL ROOM →'}
              </button>
            </form>
          </div>
          <div className="below-card">
            <Link href="/login" className="below-link">← Ambassador Portal</Link>
          </div>
        </div>
      </main>

      {/* Mobile feature pills (scrollable) */}
      <div className="mobile-features mobile-only">
        <div className="mobile-pills-scroll">
          {[['⚡','MANAGE USERS'],['∞','ALL CAMPUSES'],['✕','AUDIT TRAIL'],['↑','SCORING CONFIG']].map(([i,l]) => (
            <div key={l} className="mobile-pill"><span>{i}</span>{l}</div>
          ))}
        </div>
      </div>
      
      <div className="mobile-only" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F5F0E8', fontFamily: 'Anton, system-ui, sans-serif', fontSize: 9, letterSpacing: 2, color: 'rgba(15,23,32,0.4)', textTransform: 'uppercase' }}>
        COPYRIGHT RESERVED FOR HIGENLABS @ 2026
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #F5F0E8;
          color: #0F1720;
          font-family: system-ui, -apple-system, sans-serif;
          overflow-x: hidden;
        }

        /* ── Navbar ── */
        .navbar {
          height: 60px;
          background: #fff;
          border-bottom: 2px solid #0F1720;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          flex-shrink: 0;
          z-index: 20;
          position: sticky;
          top: 0;
        }
        .navbar-logo { display: flex; align-items: center; gap: 10px; }
        .logo-grid-admin {
          width: 30px; height: 30px;
          background: #0F1720;
          border: 2px solid #0F1720;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          padding: 4px;
        }
        .logo-dot-admin { background: #CCFF00; border-radius: 50%; }
        .logo-text { font-family: Anton, system-ui, sans-serif; font-size: 15px; letter-spacing: 2px; }
        .navbar-links { display: flex; gap: 24px; }
        .nav-item { font-family: Anton, system-ui, sans-serif; font-size: 11px; letter-spacing: 2px; cursor: pointer; }
        .navbar-right { display: flex; align-items: center; gap: 12px; }
        .navbar-sub-link { font-family: Anton, system-ui, sans-serif; font-size: 11px; letter-spacing: 2px; text-decoration: none; color: #0F1720; opacity: 0.6; }
        .navbar-cta-admin {
          background: #CCFF00;
          color: #0F1720;
          padding: 8px 14px;
          font-family: Anton, system-ui, sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          border: 2px solid #0F1720;
          cursor: pointer;
          white-space: nowrap;
        }

        /* ── Ticker ── */
        .ticker-bar {
          height: 30px;
          border-bottom: 2px solid #0F1720;
          overflow: hidden;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .ticker-dark { background: #0F1720; }
        .ticker-track {
          display: flex;
          white-space: nowrap;
          animation: ticker 28s linear infinite;
        }
        .track-reverse { animation-direction: reverse; }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          font-family: Anton, system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          padding-right: 16px;
        }
        .ticker-yellow { color: #CCFF00; }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ── Main body ── */
        .main-body {
          flex: 1;
          display: flex;
          min-height: 0;
        }
        .dot-grid {
          background-color: #F5F0E8;
          background-image: radial-gradient(circle, rgba(15,23,32,0.18) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* ── Hero col ── */
        .hero-col {
          flex: 1 1 50%;
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          min-width: 0;
        }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          border: 2px solid #0F1720; padding: 4px 12px; margin-bottom: 24px;
          width: fit-content; box-shadow: 2px 2px 0 #0F1720;
          font-family: Anton, system-ui, sans-serif; font-size: 9px; letter-spacing: 3px;
        }
        .eyebrow-admin {
          background: #0F1720; color: #CCFF00;
          box-shadow: 2px 2px 0 #CCFF00;
        }
        .eyebrow-dot-admin { width: 8px; height: 8px; background: #CCFF00; flex-shrink: 0; }
        .headline { margin-bottom: 24px; }
        .hl-line {
          font-family: Anton, system-ui, sans-serif;
          font-size: clamp(38px, 5.5vw, 74px);
          line-height: 0.9; color: #0F1720; letter-spacing: -1px;
        }
        .hl-dark { background: #0F1720; color: #CCFF00; padding: 0 6px; }
        .hl-dark-block { background: #0F1720; color: #CCFF00; padding: 0 6px; display: inline-block; }
        .desc-box {
          border: 2px solid #0F1720; background: #F5F0E8; padding: 18px 22px; margin-bottom: 20px;
          max-width: 420px; box-shadow: 4px 4px 0 #0F1720;
        }
        .desc-box p { font-size: 14px; line-height: 1.5; color: #0F1720; }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 420px; margin-bottom: 20px; }
        .feature-pill {
          display: flex; align-items: center; gap: 8px; border: 2px solid #0F1720; background: #fff; padding: 10px 12px;
          font-family: Anton, system-ui, sans-serif; font-size: 10px; letter-spacing: 2px;
          box-shadow: 3px 3px 0 #0F1720; cursor: pointer;
        }
        .feature-icon { font-size: 14px; }
        .stats-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .stat-box-admin { background: #CCFF00; border: 2px solid #0F1720; padding: 12px 18px; min-width: 90px; }
        .stat-val-admin { font-family: Anton, system-ui, sans-serif; font-size: 20px; color: #0F1720; letter-spacing: -0.5px; }
        .stat-label-admin { font-family: Anton, system-ui, sans-serif; font-size: 8px; letter-spacing: 2px; color: #0F1720; opacity: 0.8; margin-top: 4px; }

        /* ── Form col ── */
        .form-col {
          flex: 1 1 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 48px 48px 48px 24px; overflow: auto; min-width: 0;
        }
        .form-card-admin {
          width: 100%; max-width: 420px; background: #0F1720; border: 3px solid #0F1720; padding: 40px;
          box-shadow: 8px 8px 0 #CCFF00; position: relative; color: #fff;
        }
        .card-corner-tag-admin {
          position: absolute; top: -3px; right: -3px; background: #CCFF00; color: #0F1720;
          font-family: Anton, system-ui, sans-serif; font-size: 10px; letter-spacing: 2px; padding: 4px 10px; border: 2px solid #0F1720;
        }
        .card-title-admin { font-family: Anton, system-ui, sans-serif; font-size: 34px; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
        .card-sub-admin { font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 28px; line-height: 1.4; }
        .form-body { display: flex; flex-direction: column; gap: 16px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-header { display: flex; justify-content: space-between; align-items: center; }
        .field-label-admin { font-family: Anton, system-ui, sans-serif; font-size: 10px; letter-spacing: 3px; color: #CCFF00; }
        .field-input-admin {
          width: 100%; padding: 14px 14px; border: 2px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05);
          font-size: 15px; outline: none; font-family: system-ui, sans-serif; color: #fff; transition: border-color 0.15s;
          -webkit-appearance: none; border-radius: 0; min-height: 52px;
        }
        .field-input-admin:focus { border-color: #CCFF00; }
        .checkbox-row { display: flex; align-items: center; gap: 10px; }
        .checkbox-box-admin { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); flex-shrink: 0; }
        .checkbox-label-admin { font-size: 14px; color: rgba(255,255,255,0.8); }
        .form-error-admin { border: 2px solid #C43B45; background: rgba(196,59,69,0.2); padding: 10px 14px; font-size: 13px; color: #fff; line-height: 1.4; }
        .btn-primary-admin {
          width: 100%; padding: 16px; background: #CCFF00; border: 2px solid #CCFF00;
          font-family: Anton, system-ui, sans-serif; font-size: 13px; letter-spacing: 3px; color: #0F1720;
          cursor: pointer; transition: background 0.1s; min-height: 52px;
        }
        .btn-primary-admin:hover:not(:disabled) { background: transparent; color: #CCFF00; }
        .btn-primary-admin:disabled { opacity: 0.6; cursor: not-allowed; }
        .below-card {
          margin-top: 16px; font-family: Anton, system-ui, sans-serif; font-size: 10px; letter-spacing: 2px;
          color: rgba(15,23,32,0.5); width: 100%; max-width: 420px; text-align: center;
        }
        .below-link { color: #0F1720; text-decoration: underline; }

        /* ── Mobile hero section ── */
        .mobile-hero { background: #0F1720; padding: 32px 20px 28px; border-bottom: 2px solid #0F1720; }
        .mobile-eyebrow {
          display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(204,255,0,0.4);
          padding: 4px 10px; margin-bottom: 16px; font-family: Anton, system-ui, sans-serif; font-size: 9px; letter-spacing: 3px; color: #CCFF00;
        }
        .mobile-headline { font-family: Anton, system-ui, sans-serif; font-size: clamp(44px, 15vw, 72px); color: #fff; line-height: 0.88; letter-spacing: -1px; margin-bottom: 16px; }
        .mobile-sub { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.5; }
        .hl-dark { background: #0F1720; color: #CCFF00; padding: 0 4px; }

        /* ── Mobile feature pills ── */
        .mobile-features { background: #F5F0E8; border-bottom: 2px solid #0F1720; padding: 12px 0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .mobile-pills-scroll { display: flex; gap: 10px; padding: 0 16px; width: max-content; }
        .mobile-pill {
          display: flex; align-items: center; gap: 8px; border: 2px solid #0F1720; background: #fff; padding: 8px 12px;
          font-family: Anton, system-ui, sans-serif; font-size: 10px; letter-spacing: 2px; white-space: nowrap; box-shadow: 2px 2px 0 #0F1720;
        }

        /* ── Visibility helpers ── */
        .desktop-only { display: none !important; }
        .mobile-only  { display: block; }

        /* ── Desktop: 992px+ ── */
        @media (min-width: 992px) {
          .desktop-only { display: flex !important; }
          .mobile-only  { display: none !important; }
          .main-body    { flex-direction: row; }
          .form-col { padding: 48px 48px 48px 24px; align-items: flex-start; justify-content: center; }
        }

        /* ── Mobile form adjustments ── */
        @media (max-width: 991px) {
          .main-body { flex-direction: column; }
          .form-col { padding: 24px 16px 32px; align-items: stretch; justify-content: flex-start; }
          .form-card-admin { padding: 28px 20px; max-width: 100%; box-shadow: 5px 5px 0 #CCFF00; }
          .card-title-admin { font-size: 28px; }
          .field-input-admin { font-size: 16px; } /* prevent iOS zoom */
          .btn-primary-admin { font-size: 14px; padding: 18px; }
          .below-card { max-width: 100%; }
          .navbar { padding: 0 14px; }
          .navbar-cta-admin { padding: 7px 12px; font-size: 10px; }
        }

        /* ── Small phones ── */
        @media (max-width: 380px) {
          .mobile-headline { font-size: 42px; }
          .form-card-admin { padding: 24px 16px; }
        }
      `}</style>
    </div>
  )
}
