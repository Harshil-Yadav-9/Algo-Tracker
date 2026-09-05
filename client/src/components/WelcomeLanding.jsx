import React from 'react';
import { 
  Terminal, 
  Shield, 
  Zap, 
  CheckCircle2, 
  Code2, 
  RefreshCw,
  Lock,
  UserCheck,
  Cpu
} from 'lucide-react';

export default function WelcomeLanding({ onOpenAuthModal }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1rem 0'
    }}>
      {/* Terminal Hero Frame */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.5rem',
        borderLeft: '4px solid var(--accent-green)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-green-dark)',
            border: '1px solid var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)'
          }}>
            <Terminal size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SYSTEM_BOOT // READY
            </span>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '0.02em',
              lineHeight: 1.2
            }}>
              algo::tracker - Competitive Programming Live Aggregator
            </h1>
          </div>
        </div>

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.4,
          maxWidth: '850px'
        }}>
          Multi-platform CP performance engine for Codeforces, LeetCode, AtCoder, CodeChef, GFG, and HackerRank. Authenticate with Google to bind and isolate your single true account with zero data leakage.
        </p>

        {/* Action CTA with Google OAuth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
          <button 
            onClick={() => onOpenAuthModal('user')}
            className="btn btn-primary"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              gap: '0.6rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4ade80" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#22c55e" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#86efac" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#15803d" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>AUTHENTICATE_WITH_GOOGLE</span>
          </button>
        </div>
      </div>

      {/* 3 Feature Highlights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '0.75rem',
        width: '100%'
      }}>
        {/* Feature 1 */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <div style={{ background: 'var(--accent-green-dark)', padding: '0.35rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)' }}>
              <UserCheck size={16} />
            </div>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
              [ACCOUNT_ISOLATION]
            </h3>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Competitive programming handles are bound to your verified Google identity in MongoDB. Cross-user handle hijacking is prevented.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <div style={{ background: 'var(--accent-green-dark)', padding: '0.35rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)' }}>
              <RefreshCw size={16} />
            </div>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
              [AUTO_SYNC_DAEMON]
            </h3>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Solve a question in another browser tab on Codeforces or LeetCode, switch back to AlgoTracker, and it triggers live sync.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <div style={{ background: 'var(--accent-green-dark)', padding: '0.35rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)' }}>
              <Shield size={16} />
            </div>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
              [SUPERUSER_EXPLORER]
            </h3>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Superuser Admin Google accounts can inspect any arbitrary handle across platforms to verify ranking and submissions.
          </p>
        </div>
      </div>

    </div>
  );
}
