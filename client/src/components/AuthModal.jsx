import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Code2
} from 'lucide-react';
import { apiUrl } from '../services/api';
import PlatformIcon, { GoogleIcon } from './PlatformIcons';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [googleClientId, setGoogleClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

    let intervalId = null;

    const setupGoogleBtn = () => {
      if (googleClientId && window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false
          });

          googleBtnRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });

          if (intervalId) clearInterval(intervalId);
        } catch (e) {
          console.warn('Google GSI modal render error:', e);
        }
      }
    };

    setupGoogleBtn();

    if (googleClientId && !window.google?.accounts?.id) {
      let attempts = 0;
      intervalId = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          setupGoogleBtn();
        }
        if (attempts > 12) clearInterval(intervalId);
      }, 250);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, googleClientId]);

  if (!isOpen) return null;

  // Handle Google Credential Token response
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
          onClose();
        }, 300);
      } else {
        setErrorMsg(res.error || 'Google authentication failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to communicate with authentication server.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '440px', 
          padding: '1.75rem',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <GoogleIcon size={22} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Sign In to AlgoTracker
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Single sign-on to isolate and protect your competitive programming profile.
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

        {/* Google OAuth Button — rendered by official Google Identity Services SDK */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1.25rem', minHeight: '44px' }}>
          <div ref={googleBtnRef}></div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Your data is stored securely and never shared.
          </span>
        </div>
      </div>
    </div>
  );
}
