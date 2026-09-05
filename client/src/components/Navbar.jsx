import React from 'react';
import { 
  Terminal, 
  Code2, 
  Trophy, 
  Calendar, 
  Flame, 
  BarChart3, 
  RefreshCw, 
  UserCheck,
  Shield,
  LogOut,
  User
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  handles = {}, 
  onOpenHandleModal, 
  onSync, 
  isSyncing, 
  summary,
  contestsCount,
  currentUser,
  onOpenAuthModal,
  onLogout,
  lastSyncedTime
}) {
  const connectedCount = Object.values(handles).filter(Boolean).length;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: '#070b07',
      borderBottom: '1px solid #192a19',
      marginBottom: '1rem'
    }}>
      <div className="app-container" style={{ paddingBottom: 0, paddingTop: '0.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.5rem'
        }}>
          {/* Brand Logo - Matrix Terminal Style */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('dashboard')}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: '#0d1c0d',
              border: '1px solid #22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e'
            }}>
              <Terminal size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>
                  algo<span style={{ color: '#22c55e' }}>::tracker</span>
                </h1>
                <span className="pulse-dot" title="Live Auto-Sync Active"></span>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#4ade80aa' }}>
                multi-platform cp intelligence
              </p>
            </div>
          </div>

          {/* Right Section: User Status & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            
            {/* Live Sync Status Indicator */}
            {currentUser && (
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.68rem',
                  color: '#4ade80',
                  background: '#0d1a0d',
                  border: '1px solid #193819',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)'
                }}
                title="Auto-syncs on window focus / tab switch"
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }}></span>
                <span>auto_sync: on</span>
              </div>
            )}

            {/* Handle Status Button (When logged in) */}
            {currentUser && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={onOpenHandleModal}
                title={isAdmin ? "Universal Handle Explorer" : "View Bound Platform Handles"}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem' }}
              >
                <UserCheck size={13} color={connectedCount > 0 ? '#4ade80' : '#4b5563'} />
                <span>{isAdmin ? 'explorer_handles' : `[${connectedCount}] handles`}</span>
              </button>
            )}

            {/* Sync Now Button (When logged in) */}
            {currentUser && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={onSync}
                disabled={isSyncing}
                style={{ 
                  opacity: isSyncing ? 0.7 : 1,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  fontSize: '0.72rem'
                }}
              >
                <RefreshCw size={12} className={isSyncing ? 'spin-animation' : ''} />
                <span>{isSyncing ? 'syncing...' : 'sync()'}</span>
              </button>
            )}

            {/* Auth Button / Profile Pill */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div 
                  className="badge"
                  style={{
                    background: isAdmin ? '#1c1708' : '#0d1a0d',
                    color: isAdmin ? '#fde047' : '#86efac',
                    border: isAdmin ? '1px solid #713f12' : '1px solid #166534',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt="Google User" 
                      style={{ width: '15px', height: '15px', borderRadius: '2px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    isAdmin ? <Shield size={12} /> : <User size={12} />
                  )}
                  <span>{currentUser.username || currentUser.name || currentUser.email}</span>
                </div>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={onLogout}
                  title="Sign out"
                  style={{ padding: '0.25rem 0.45rem', color: '#f87171' }}
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onOpenAuthModal('user')}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>sign_in_google</span>
              </button>
            )}

          </div>
        </div>

        {/* Navigation Tabs (Only when authenticated) */}
        {currentUser && (
          <nav style={{
            display: 'flex',
            gap: '0.35rem',
            overflowX: 'auto',
            paddingBottom: '0.4rem',
            borderTop: '1px solid #142214',
            paddingTop: '0.4rem'
          }}>
            <TabButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={<Trophy size={14} />}
              label="dashboard"
            />
            <TabButton 
              active={activeTab === 'problems'} 
              onClick={() => setActiveTab('problems')}
              icon={<Code2 size={14} />}
              label="problems"
              badge={summary?.totalSolved > 0 ? summary.totalSolved : null}
            />
            <TabButton 
              active={activeTab === 'contests'} 
              onClick={() => setActiveTab('contests')}
              icon={<Calendar size={14} />}
              label="contests"
              badge={contestsCount > 0 ? contestsCount : null}
              badgeColor="#166534"
            />
            <TabButton 
              active={activeTab === 'potd'} 
              onClick={() => setActiveTab('potd')}
              icon={<Flame size={14} />}
              label="potd_hub"
              badge="daily"
              badgeColor="#166534"
            />
            <TabButton 
              active={activeTab === 'analytics'} 
              onClick={() => setActiveTab('analytics')}
              icon={<BarChart3 size={14} />}
              label="analytics"
            />

            {/* Admin Tab (Visible only for Admin Google Account) */}
            {isAdmin && (
              <TabButton 
                active={activeTab === 'admin'} 
                onClick={() => setActiveTab('admin')}
                icon={<Shield size={14} color="#fde047" />}
                label="admin_console"
                badge="ROOT"
                badgeColor="#854d0e"
              />
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

function TabButton({ active, onClick, icon, label, badge, badgeColor = '#16a34a' }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.35rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        background: active ? '#14532d' : 'transparent',
        border: active ? '1px solid #22c55e' : '1px solid transparent',
        color: active ? '#f0fdf4' : '#86efac99',
        fontWeight: active ? 700 : 500,
        fontSize: '0.78rem',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-mono)'
      }}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span style={{
          background: active ? badgeColor : '#101e10',
          color: active ? '#f0fdf4' : '#4ade80',
          fontSize: '0.65rem',
          padding: '0.05rem 0.35rem',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
          border: '1px solid #1b3a1b'
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

