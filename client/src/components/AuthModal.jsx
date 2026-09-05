import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Shield, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  ArrowRight,
  CheckSquare,
  Square,
  FileCheck2,
  Terminal
} from 'lucide-react';
import { apiUrl } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [googleClientId, setGoogleClientId] = useState('');
  const [hasConsented, setHasConsented] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google email input
  const [devEmail, setDevEmail] = useState('');

  const googleBtnRef = useRef(null);

  // Fetch Auth configuration from backend
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

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    if (!isOpen) return;

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
          width: 320,
          text: 'continue_with',
          shape: 'rectangular'
        });
      }
    }
  }, [isOpen, googleClientId]);

  if (!isOpen) return null;

  // Handle Google Credential Token response
  const handleGoogleCredentialResponse = async (response) => {
    if (!hasConsented) {
      setErrorMsg('[AUTH_ERROR] Please review and accept the Google Sign-In consent agreement.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(apiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      }).then(r => r.json());

      if (res.success) {
        setSuccessMsg(`[SUCCESS] Authenticated as ${res.user.name || res.user.email}`);
        sessionStorage.setItem('algopulse_token', res.token);
        localStorage.setItem('algopulse_token', res.token);
        setTimeout(() => {
          onAuthSuccess(res.user, res.token, res.savedProblems);
          onClose();
        }, 400);
      } else {
        setErrorMsg(res.error || '[AUTH_FAIL] Google authentication failed.');
      }
    } catch (err) {
      setErrorMsg('[ERROR] Failed to communicate with server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Google Sign In
  const handleDirectGoogleLogin = async (customEmail = null) => {
    if (!hasConsented) {
      setErrorMsg('[AUTH_ERROR] Please check the consent box to authorize Google Sign-In.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const email = (customEmail || devEmail || 'user@gmail.com').trim().toLowerCase();
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
        setSuccessMsg(`[SUCCESS] Authenticated: ${res.user.role === 'admin' ? 'ROOT ADMIN' : res.user.email}`);
        sessionStorage.setItem('algopulse_token', res.token);
        localStorage.setItem('algopulse_token', res.token);
        setTimeout(() => {
          onAuthSuccess(res.user, res.token, res.savedProblems);
          onClose();
        }, 400);
      } else {
        setErrorMsg(res.error || '[AUTH_FAIL] Google authentication failed.');
      }
    } catch (err) {
      setErrorMsg('[ERROR] Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div 
        className="glass-card modal-content" 
        style={{ 
          maxWidth: '460px', 
          width: '95%',
          padding: '1.25rem 1.5rem',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '0.85rem',
            top: '0.85rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '0.2rem'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-green-dark)',
            border: '1px solid var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)'
          }}>
            <Terminal size={16} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
              $ /usr/bin/oauth --google
            </h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Sole authentication source for verified handle binding
            </p>
          </div>
        </div>

        {/* Highlighted Consent & Authorization Paragraph */}
        <div style={{
          background: 'var(--bg-dark)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem', color: 'var(--accent-green)' }}>
            <FileCheck2 size={14} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              [CONSENT_NOTICE]
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
            By continuing with Google Sign-In, you authorize <strong>AlgoTracker</strong> to authenticate your session and link your competitive programming profiles (Codeforces, LeetCode, AtCoder, CodeChef, GeeksforGeeks, HackerRank). All problem history is private and isolated to your Google account.
          </p>
        </div>

        {/* Consent Checkbox */}
        <div 
          onClick={() => setHasConsented(!hasConsented)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0',
            cursor: 'pointer',
            marginBottom: '0.75rem',
            userSelect: 'none'
          }}
        >
          {hasConsented ? (
            <CheckSquare size={16} color="var(--accent-green-bright)" />
          ) : (
            <Square size={16} color="var(--text-dim)" />
          )}
          <span style={{ fontSize: '0.75rem', color: hasConsented ? 'var(--text-main)' : 'var(--text-dim)' }}>
            [x] I authorize AlgoTracker Google authentication
          </span>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-dark)',
            border: '1px solid var(--verdict-wrong)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--verdict-wrong)',
            fontSize: '0.75rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-dark)',
            border: '1px solid var(--accent-green-bright)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-green-bright)',
            fontSize: '0.75rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Primary Google Sign-In Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          
          {googleClientId && (
            <div ref={googleBtnRef} style={{ minHeight: '40px' }}></div>
          )}

          {/* Quick Google Account Input for offline/custom Google login */}
          <div style={{
            background: 'var(--bg-dark)',
            padding: '0.65rem 0.75rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              GOOGLE_ACCOUNT_EMAIL:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input 
                type="email"
                placeholder="user@gmail.com"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleDirectGoogleLogin(devEmail)}
                disabled={isLoading || !devEmail || !hasConsented}
                style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}
              >
                SIGN_IN
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
