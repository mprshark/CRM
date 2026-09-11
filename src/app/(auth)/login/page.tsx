'use client'

import { useActionState, useState } from 'react'
import { loginAction } from '@/app/actions/auth'

const initialState = { error: '' }

const TICKERS = [
  'SCREENS IN ONE PROMPT', '12,400 AMBASSADORS', 'INFINITE CANVAS',
  'NO DESIGN DEGREE REQUIRED', 'BRUTALIST · GLASS · EDITORIAL',
  'SHIP LOGIN SCREENS IN ONE PROMPT',
]

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="login-root">

      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="navbar-logo">
          <div className="logo-grid">
            <div className="logo-dot" /><div className="logo-dot" />
            <div className="logo-dot" /><div className="logo-dot" />
          </div>
          <span className="logo-text">HIGENLABS</span>
        </div>
        <nav className="navbar-links desktop-only"></nav>
        <div className="navbar-right"></div>
      </header>

      {/* ── Ticker ── */}
      <div className="ticker-bar ticker-yellow">
        <div className="ticker-track">
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} className="ticker-item ticker-ink">
              {t} &nbsp;•&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Mobile-only top strip with headline ── */}
      <div className="mobile-hero mobile-only">
        <div className="mobile-eyebrow">
          <div className="eyebrow-dot" />
          <span>THE CAMPUS AMBASSADOR CRM</span>
        </div>
        <h1 className="mobile-headline">
          HIGENLABS<br />CRM<br />
          <span className="hl-yellow">LOGIN.</span>
        </h1>
        <p className="mobile-sub">Upload sheets, track your rank, message leads directly from your phone.</p>
      </div>

      {/* ── Main body ── */}
      <main className="main-body dot-grid">

        {/* Left hero (desktop only) */}
        <div className="hero-col desktop-only">
          <div className="eyebrow">
            <div className="eyebrow-dot" />
            <span>THE CRM FOR CAMPUS AMBASSADORS</span>
          </div>
          <div className="headline">
            <div className="hl-line">HIGENLABS</div>
            <div className="hl-line">CRM</div>
            <div className="hl-line"><span className="hl-yellow-block">LOGIN.</span></div>
          </div>
          <div className="desc-box">
            <p>Upload your outreach sheets, track your performance, and see your rank on the live leaderboard. Sign in to access your ambassador workspace.</p>
          </div>
          <div className="feature-grid">
            {[['⚡','UPLOAD SHEETS'],['∞','LIVE LEADERBOARD'],['✕','SCORE ENGINE'],['↑','EXPORT DATA']].map(([i,l]) => (
              <div key={l} className="feature-pill"><span className="feature-icon">{i}</span>{l}</div>
            ))}
          </div>

          <div style={{ marginTop: 40, fontFamily: 'Anton, system-ui, sans-serif', fontSize: 10, letterSpacing: 2, color: 'rgba(15,23,32,0.4)', textTransform: 'uppercase' }}>
            COPYRIGHT RESERVED FOR HIGENLABS @ 2026
          </div>
        </div>

        {/* Form col */}
        <div className="form-col">
          <div className="form-card">
            <div className="card-corner-tag">/ LOGIN</div>
            <h2 className="card-title">Sign in</h2>
            <p className="card-sub">Welcome back. Punch in to keep building.</p>
            <form action={formAction} className="form-body">
              <div className="field">
                <label htmlFor="username" className="field-label">USERNAME OR EMAIL</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username or email"
                  required
                  autoComplete="username"
                  className="field-input"
                />
              </div>
              <div className="field">
                <label htmlFor="password" className="field-label">PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="field-input"
                    style={{ paddingRight: 52 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 48,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0F1720',
                      opacity: 0.5,
                      fontSize: 18,
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {state?.error && <div className="form-error">{state.error}</div>}

              <button type="submit" disabled={pending} className="btn-primary">
                {pending ? 'SIGNING IN...' : 'SIGN IN →'}
              </button>
            </form>
          </div>
          <div className="below-card"></div>
        </div>
      </main>

      {/* Mobile feature pills (scrollable) */}
      <div className="mobile-features mobile-only">
        <div className="mobile-pills-scroll">
          {[['⚡','UPLOAD SHEETS'],['∞','LEADERBOARD'],['✕','SCORE ENGINE'],['↑','EXPORT DATA']].map(([i,l]) => (
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
        .logo-grid {
          width: 30px; height: 30px;
          background: #CCFF00;
          border: 2px solid #0F1720;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          padding: 4px;
        }
        .logo-dot { background: #0F1720; border-radius: 50%; }
        .logo-text {
          font-family: Anton, system-ui, sans-serif;
          font-size: 15px;
          letter-spacing: 2px;
        }
        .navbar-links { display: flex; gap: 24px; }
        .navbar-right { display: flex; align-items: center; gap: 12px; }

        /* ── Ticker ── */
        .ticker-bar {
          height: 30px;
          border-bottom: 2px solid #0F1720;
          overflow: hidden;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .ticker-yellow { background: #CCFF00; }
        .ticker-track {
          display: flex;
          white-space: nowrap;
          animation: ticker 28s linear infinite;
        }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          font-family: Anton, system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          padding-right: 16px;
        }
        .ticker-ink { color: #0F1720; }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
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
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 2px solid #0F1720;
          background: #fff;
          padding: 4px 12px;
          margin-bottom: 24px;
          width: fit-content;
          box-shadow: 2px 2px 0 #0F1720;
          font-family: Anton, system-ui, sans-serif;
          font-size: 9px;
          letter-spacing: 3px;
        }
        .eyebrow-dot { width: 8px; height: 8px; background: #CCFF00; border: 1px solid #0F1720; flex-shrink: 0; }
        .headline { margin-bottom: 24px; }
        .hl-line {
          font-family: Anton, system-ui, sans-serif;
          font-size: clamp(38px, 5.5vw, 74px);
          line-height: 0.9;
          color: #0F1720;
          letter-spacing: -1px;
        }
        .hl-yellow { background: #CCFF00; color: #0F1720; padding: 0 6px; }
        .hl-yellow-block { background: #CCFF00; color: #0F1720; padding: 0 6px; display: inline-block; }
        .desc-box {
          border: 2px solid #0F1720;
          background: #F5F0E8;
          padding: 18px 22px;
          margin-bottom: 20px;
          max-width: 420px;
          box-shadow: 4px 4px 0 #0F1720;
        }
        .desc-box p { font-size: 14px; line-height: 1.5; color: #0F1720; }
        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          max-width: 420px;
          margin-bottom: 20px;
        }
        .feature-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 2px solid #0F1720;
          background: #fff;
          padding: 10px 12px;
          font-family: Anton, system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          box-shadow: 3px 3px 0 #0F1720;
          cursor: pointer;
        }
        .feature-icon { font-size: 14px; }

        /* ── Form col ── */
        .form-col {
          flex: 1 1 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 48px 48px 24px;
          overflow: auto;
          min-width: 0;
        }
        .form-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border: 3px solid #0F1720;
          padding: 40px;
          box-shadow: 8px 8px 0 #0F1720;
          position: relative;
        }
        .card-corner-tag {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #0F1720;
          color: #CCFF00;
          font-family: Anton, system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          padding: 4px 10px;
          border: 2px solid #0F1720;
        }
        .card-title {
          font-family: Anton, system-ui, sans-serif;
          font-size: 34px;
          color: #0F1720;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .card-sub {
          font-size: 14px;
          color: #0F1720;
          opacity: 0.5;
          margin-bottom: 28px;
          line-height: 1.4;
        }
        .form-body { display: flex; flex-direction: column; gap: 16px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-family: Anton, system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          color: #0F1720;
        }
        .field-input {
          width: 100%;
          padding: 14px 14px;
          border: 2px solid #0F1720;
          background: #F5F0E8;
          font-size: 15px;
          outline: none;
          font-family: system-ui, sans-serif;
          color: #0F1720;
          transition: background 0.15s, box-shadow 0.15s;
          -webkit-appearance: none;
          border-radius: 0;
          min-height: 52px;
        }
        .field-input:focus {
          background: #fff;
          box-shadow: 4px 4px 0 #0F1720;
        }
        .form-error {
          border: 2px solid #C43B45;
          background: rgba(196,59,69,0.1);
          padding: 10px 14px;
          font-size: 13px;
          color: #C43B45;
          line-height: 1.4;
        }
        .btn-primary {
          width: 100%;
          padding: 16px;
          background: #CCFF00;
          border: 2px solid #0F1720;
          font-family: Anton, system-ui, sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: #0F1720;
          cursor: pointer;
          box-shadow: 4px 4px 0 #0F1720;
          transition: transform 0.1s, box-shadow 0.1s;
          min-height: 52px;
          text-transform: uppercase;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #0F1720;
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .below-card {
          margin-top: 16px;
          font-family: Anton, system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(15,23,32,0.5);
          width: 100%;
          max-width: 420px;
          text-align: center;
        }

        /* ── Mobile hero section ── */
        .mobile-hero {
          background: #0F1720;
          padding: 32px 20px 28px;
          border-bottom: 2px solid #0F1720;
        }
        .mobile-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(204,255,0,0.4);
          padding: 4px 10px;
          margin-bottom: 16px;
          font-family: Anton, system-ui, sans-serif;
          font-size: 9px;
          letter-spacing: 3px;
          color: #CCFF00;
        }
        .mobile-headline {
          font-family: Anton, system-ui, sans-serif;
          font-size: clamp(44px, 15vw, 72px);
          color: #fff;
          line-height: 0.88;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }
        .mobile-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
        }

        /* ── Mobile feature pills ── */
        .mobile-features {
          background: #F5F0E8;
          border-bottom: 2px solid #0F1720;
          padding: 12px 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .mobile-pills-scroll {
          display: flex;
          gap: 10px;
          padding: 0 16px;
          width: max-content;
        }
        .mobile-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 2px solid #0F1720;
          background: #fff;
          padding: 8px 12px;
          font-family: Anton, system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          white-space: nowrap;
          box-shadow: 2px 2px 0 #0F1720;
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
          .form-col {
            padding: 24px 16px 32px;
            align-items: stretch;
            justify-content: flex-start;
          }
          .form-card { padding: 28px 20px; max-width: 100%; box-shadow: 5px 5px 0 #0F1720; }
          .card-title { font-size: 28px; }
          .field-input { font-size: 16px; }
          .btn-primary { font-size: 14px; padding: 18px; }
          .below-card { max-width: 100%; }
          .navbar { padding: 0 14px; }
        }

        /* ── Small phones ── */
        @media (max-width: 380px) {
          .mobile-headline { font-size: 42px; }
          .form-card { padding: 24px 16px; }
        }
      `}</style>
    </div>
  )
}
