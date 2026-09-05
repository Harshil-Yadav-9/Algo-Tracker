import React from 'react';
import { 
  Shield, 
  Zap, 
  CheckCircle2, 
  Code2, 
  RefreshCw,
  Trophy,
  Calendar,
  Flame,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import PlatformIcon, { GoogleIcon } from './PlatformIcons';

export default function WelcomeLanding({ onOpenAuthModal, onNavigateToTab }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '1rem 0'
    }}>
      {/* Hero Frame */}
      <div className="glass-card" style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-secondary) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)'
          }}>
            <Code2 size={22} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              Master Your Competitive Programming Journey
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              All your solved problems, ratings, contests, and daily challenges synchronized in one unified dashboard.
            </p>
          </div>
        </div>

        {/* Supported Platforms Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          flexWrap: 'wrap',
          padding: '0.65rem 1rem',
          background: 'var(--bg-main)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            Supported Platforms:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <PlatformIcon platformKey="codeforces" size={16} /> Codeforces
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <PlatformIcon platformKey="leetcode" size={16} /> LeetCode
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <PlatformIcon platformKey="atcoder" size={16} /> AtCoder
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <PlatformIcon platformKey="codechef" size={16} /> CodeChef
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <PlatformIcon platformKey="gfg" size={16} /> GeeksforGeeks
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <PlatformIcon platformKey="hackerrank" size={16} /> HackerRank
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onOpenAuthModal('user')}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              gap: '0.6rem'
            }}
          >
            <GoogleIcon size={18} />
            <span>Sign In with Google</span>
          </button>

          <button 
            onClick={() => onNavigateToTab && onNavigateToTab('contests')}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            <Calendar size={16} />
            <span>Browse Upcoming Contests</span>
          </button>

          <button 
            onClick={() => onNavigateToTab && onNavigateToTab('potd')}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            <Flame size={16} />
            <span>Today's Coding Challenges</span>
          </button>
        </div>
      </div>

      {/* 3 Feature Highlights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '0.85rem',
        width: '100%'
      }}>
        {/* Feature 1 */}
        <div className="glass-card" style={{ padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)' }}>
              <RefreshCw size={18} />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Live Stats Synchronization
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Solve questions on Codeforces or LeetCode and your solve count, rating graphs, and topic breakdowns update seamlessly.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-card" style={{ padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: '#38bdf8' }}>
              <Calendar size={18} />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Contest Calendar & Alerts
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Track live and upcoming rounds across 6 major platforms with countdown timers and direct registration links.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass-card" style={{ padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: '#fbbf24' }}>
              <BookOpen size={18} />
            </div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Personal Revision Notebook
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Bookmark tricky questions, write markdown notes and key insights, and revise with instant topic filtering.
          </p>
        </div>
      </div>

    </div>
  );
}
