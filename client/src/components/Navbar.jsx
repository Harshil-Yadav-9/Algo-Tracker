import React from 'react';
import { 
  Trophy, 
  Code2, 
  Calendar, 
  Flame, 
  BarChart3, 
  RefreshCw, 
  Shield, 
  LogOut, 
  User, 
  Key,
  Layers
} from 'lucide-react';
import PlatformIcon, { GoogleIcon } from './PlatformIcons';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  handles = {}, 
  onSync, 
  isSyncing, 
  summary,
  contestsCount,
  currentUser,
  onOpenAuthModal,
  onLogout
}) {
  const connectedCount = Object.values(handles).filter(Boolean).length;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(9, 10, 15, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      marginBottom: '1.25rem'
    }}>
      <div className="app-container" style={{ paddingBottom: 0, paddingTop: '0.65rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.65rem'
        }}>
          {/* Brand Logo */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('dashboard')}
          >
            {/* AT Monogram Logo Mark */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'radial-gradient(circle at 40% 40%, #0f1f0f, #030703)',
              border: '1px solid rgba(34, 197, 94, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.18), inset 0 0 6px rgba(34, 197, 94, 0.06)',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="atGrad" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4ade80"/>
                    <stop offset="100%" stopColor="#22c55e"/>
                  </linearGradient>
                </defs>
                {/* A */}
                <path d="M2 17L7 5L12 17M4 13H10" stroke="url(#atGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {/* T */}
                <path d="M13 5H21M17 5V17" stroke="url(#atGrad)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>
                  algo<span style={{ color: '#22c55e' }}>::tracker</span>
                </h1>
                <span className="pulse-dot" title="Live Auto-Sync Active"></span>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#4ade80aa' }}>
                multi-platform cp tracker
              </p>
            </div>
          </div>


          {/* Right Section: User Status & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            
            {/* Sync Now Button (When logged in) */}
            {currentUser && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={onSync}
                disabled={isSyncing}
                title="Sync latest solves and ratings from all connected platforms"
                style={{ 
                  opacity: isSyncing ? 0.7 : 1,
                  cursor: isSyncing ? 'not-allowed' : 'pointer'
                }}
              >
                <RefreshCw size={13} className={isSyncing ? 'spin-animation' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Solves'}</span>
              </button>
            )}

            {/* Auth Button / Profile Pill */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('account')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: activeTab === 'account' ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    borderColor: activeTab === 'account' ? 'var(--accent-green)' : 'var(--border-card)'
                  }}
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt="User" 
                      style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <User size={13} />
                  )}
                  <span>{currentUser.name || currentUser.username || currentUser.email}</span>
                  {isAdmin && (
                    <span style={{ color: '#fde047', fontSize: '0.65rem', fontWeight: 800 }}>[ADMIN]</span>
                  )}
                </button>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={onLogout}
                  title="Sign out"
                  style={{ padding: '0.35rem 0.55rem', color: '#f87171' }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button 
                  onClick={() => setActiveTab('signin')}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontWeight: 700
                  }}
                >
                  <GoogleIcon size={14} />
                  <span>Sign In</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          paddingBottom: '0.45rem',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.45rem'
        }}>
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<Trophy size={14} />}
            label="Dashboard"
          />
          <TabButton 
            active={activeTab === 'problems'} 
            onClick={() => setActiveTab('problems')}
            icon={<Code2 size={14} />}
            label="Problems"
            badge={summary?.totalSolved > 0 ? summary.totalSolved : null}
          />
          <TabButton 
            active={activeTab === 'contests'} 
            onClick={() => setActiveTab('contests')}
            icon={<Calendar size={14} />}
            label="Contests"
            badge={contestsCount > 0 ? contestsCount : null}
            badgeColor="#065f46"
          />
          <TabButton 
            active={activeTab === 'potd'} 
            onClick={() => setActiveTab('potd')}
            icon={<Flame size={14} />}
            label="Daily POTD"
          />
          <TabButton 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
            icon={<BarChart3 size={14} />}
            label="Analytics"
          />
          <TabButton 
            active={activeTab === 'verify'} 
            onClick={() => setActiveTab('verify')}
            icon={<Key size={14} />}
            label="Verify Handles"
            badge={connectedCount > 0 ? `${connectedCount} linked` : null}
            badgeColor="rgba(56, 189, 248, 0.2)"
          />
          
          {currentUser && (
            <TabButton 
              active={activeTab === 'account'} 
              onClick={() => setActiveTab('account')}
              icon={<User size={14} />}
              label="Account"
            />
          )}

          {/* Admin Tab (Visible only for Admin Google Account) */}
          {isAdmin && (
            <TabButton 
              active={activeTab === 'admin'} 
              onClick={() => setActiveTab('admin')}
              icon={<Shield size={14} color="#fde047" />}
              label="Admin Console"
              badge="ROOT"
              badgeColor="#854d0e"
            />
          )}
        </nav>
      </div>
    </header>
  );
}

function TabButton({ active, onClick, icon, label, badge, badgeColor = '#059669' }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
        border: active ? '1px solid var(--accent-green)' : '1px solid transparent',
        color: active ? '#ffffff' : 'var(--text-muted)',
        fontWeight: active ? 700 : 500,
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span style={{
          background: badgeColor,
          color: '#ffffff',
          fontSize: '0.68rem',
          padding: '0.05rem 0.4rem',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
