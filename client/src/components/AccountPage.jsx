import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  User, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Key,
  Layers,
  ArrowRight,
  Sparkles,
  Trophy,
  Calendar,
  Flame,
  Check
} from 'lucide-react';
import { apiUrl } from '../services/api';
import PlatformIcon, { GoogleIcon } from './PlatformIcons';

export default function AccountPage({ 
  currentUser, 
  onLogout, 
  onAuthSuccess, 
  onNavigateToTab,
  handles = {},
  summary
}) {
  const [googleClientId, setGoogleClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devEmail, setDevEmail] = useState('');

  const googleBtnRef = useRef(null);

  // Fetch Google client ID configuration
  useEffect(() => {
    fetch(apiUrl('/api/auth/config'))
      .then(r => r.json())
      .then(data => {
        if (data.googleClientId) {
          setGoogleClientId(data.googleClientId);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    if (currentUser) return;

    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 280,
          text: 'continue_with',
          shape: 'rectangular'
        });
      }
    }
  }, [currentUser, googleClientId]);

  // Handle Google Token
  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(apiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      }).then(r => r.json());

      if (res.success) {
        setSuccessMsg(`Welcome, ${res.user.name || res.user.email}!`);
        sessionStorage.setItem('algopulse_token', res.token);
        localStorage.setItem('algopulse_token', res.token);
        setTimeout(() => {
          onAuthSuccess(res.user, res.token, res.savedProblems);
        }, 300);
      } else {
        setErrorMsg(res.error || 'Google authentication failed.');
      }
    } catch (err) {
      setErrorMsg('Could not connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Direct login
  const handleDirectLogin = async (customEmail = null) => {
    setIsLoading(true);
    setErrorMsg('');

    const email = (customEmail || devEmail || 'developer@gmail.com').trim().toLowerCase();
    const name = email.split('@')[0];

    try {
      const res = await fetch(apiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            email,
            name,
            sub: `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
          }
        })
      }).then(r => r.json());

      if (res.success) {
        setSuccessMsg(`Authenticated as ${res.user.name || res.user.email}`);
        sessionStorage.setItem('algopulse_token', res.token);
        localStorage.setItem('algopulse_token', res.token);
        setTimeout(() => {
          onAuthSuccess(res.user, res.token, res.savedProblems);
        }, 300);
      } else {
        setErrorMsg(res.error || 'Authentication failed.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is LOGGED IN, show their profile overview
  if (currentUser) {
    const isAdmin = currentUser.role === 'admin';
    const connectedPlatforms = Object.entries(handles).filter(([_, h]) => Boolean(h));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                style={{ width: '56px', height: '56px', borderRadius: '8px', border: '1px solid var(--border-card)' }}
              />
            ) : (
              <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                <User size={28} />
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {currentUser.name || currentUser.username}
                </h2>
                {isAdmin && (
                  <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid #ca8a04' }}>
                    <Shield size={11} />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentUser.email}
              </p>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="btn btn-secondary"
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', fontSize: '0.82rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem'
        }}>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Solved</span>
              <Trophy size={15} color="var(--accent-green)" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {summary?.totalSolved || 0}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Across connected platforms</span>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Linked Handles</span>
              <Key size={15} color="var(--accent-green)" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {connectedPlatforms.length} / 6
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Platforms active</span>
          </div>
        </div>

        {/* Connected Handles Section */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Connected Platform Handles
            </h3>
            <button 
              onClick={() => onNavigateToTab('verify')}
              className="btn btn-primary btn-sm"
            >
              <Key size={12} />
              <span>Manage & Verify Handles</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.65rem'
          }}>
            {['codeforces', 'leetcode', 'atcoder', 'codechef', 'gfg', 'hackerrank'].map(plat => {
              const handle = handles[plat];
              const isVerified = currentUser?.verifiedHandles?.[plat];

              return (
                <div 
                  key={plat}
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlatformIcon platformKey={plat} size={18} />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                        {plat}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: handle ? 'var(--accent-green-bright)' : 'var(--text-dim)' }}>
                        {handle ? `@${handle}` : 'Not linked'}
                      </div>
                    </div>
                  </div>

                  {handle && isVerified && (
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid #10b981', fontSize: '0.65rem' }}>
                      Verified
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // If user is NOT logged in, show dedicated Sign In page
  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <GoogleIcon size={24} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Sign In to AlgoTracker
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track, aggregate, and analyze your competitive programming progress across all platforms in one dashboard.
          </p>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div style={{ marginBottom: '1rem', padding: '0.6rem 0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ marginBottom: '1rem', padding: '0.6rem 0.85rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button Container */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div ref={googleBtnRef}></div>

          {/* Quick Sign In button */}
          <button 
            onClick={() => handleDirectLogin()}
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <GoogleIcon size={16} />
            <span>{isLoading ? 'Signing In...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Platform Supported Icons */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Supported Platforms
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <PlatformIcon platformKey="codeforces" size={20} />
            <PlatformIcon platformKey="leetcode" size={20} />
            <PlatformIcon platformKey="atcoder" size={20} />
            <PlatformIcon platformKey="codechef" size={20} />
            <PlatformIcon platformKey="gfg" size={20} />
            <PlatformIcon platformKey="hackerrank" size={20} />
          </div>
        </div>

      </div>

    </div>
  );
}
