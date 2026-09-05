import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Clock, 
  Trash2, 
  RefreshCw, 
  Check, 
  Key,
  UserCheck
} from 'lucide-react';
import { apiUrl } from '../services/api';
import PlatformIcon from './PlatformIcons';

const PLATFORMS_CONFIG = [
  { key: 'codeforces', name: 'Codeforces', placeholder: 'e.g. tourist' },
  { key: 'leetcode', name: 'LeetCode', placeholder: 'e.g. neal_wu' },
  { key: 'codechef', name: 'CodeChef', placeholder: 'e.g. chef_handle' },
  { key: 'atcoder', name: 'AtCoder', placeholder: 'e.g. tourist' },
  { key: 'gfg', name: 'GeeksforGeeks', placeholder: 'e.g. gfg_user' },
  { key: 'hackerrank', name: 'HackerRank', placeholder: 'e.g. hr_user' }
];

export default function HandleModal({ isOpen, onClose, currentHandles, onSaveHandles, currentUser }) {
  if (!isOpen) return null;

  const token = localStorage.getItem('algopulse_token') || sessionStorage.getItem('algopulse_token') || '';

  const [handles, setHandles] = useState({
    codeforces: currentHandles.codeforces || '',
    leetcode: currentHandles.leetcode || '',
    atcoder: currentHandles.atcoder || '',
    codechef: currentHandles.codechef || '',
    gfg: currentHandles.gfg || '',
    hackerrank: currentHandles.hackerrank || ''
  });

  const [verifiedHandles, setVerifiedHandles] = useState(currentUser?.verifiedHandles || {});
  const [selectedPlatform, setSelectedPlatform] = useState('codeforces');
  const [inputHandle, setInputHandle] = useState('');
  
  // Verification session state
  const [activeSession, setActiveSession] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    setHandles({
      codeforces: currentHandles.codeforces || '',
      leetcode: currentHandles.leetcode || '',
      atcoder: currentHandles.atcoder || '',
      codechef: currentHandles.codechef || '',
      gfg: currentHandles.gfg || '',
      hackerrank: currentHandles.hackerrank || ''
    });
    setVerifiedHandles(currentUser?.verifiedHandles || {});
    setErrorMsg('');
    setSuccessMsg('');
    setActiveSession(null);
  }, [currentHandles, currentUser, isOpen]);

  // Handle countdown timer
  useEffect(() => {
    if (activeSession && activeSession.expiresAt) {
      if (timerRef.current) clearInterval(timerRef.current);

      const updateTimer = () => {
        const remaining = Math.max(0, Math.round((activeSession.expiresAt - Date.now()) / 1000));
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setErrorMsg('60-second verification session expired. Please generate a new code.');
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [activeSession]);

  // Start 60-second verification session
  const handleStartVerification = async (platform, handleToVerify) => {
    const handle = (handleToVerify || inputHandle || handles[platform] || '').trim();
    if (!handle) {
      setErrorMsg(`Please enter your ${platform.toUpperCase()} handle first.`);
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    setSuccessMsg('');
    setCopiedToken(false);

    try {
      const res = await fetch(apiUrl('/api/auth/verify-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ platform, handle })
      }).then(r => r.json());

      if (res.success) {
        setActiveSession({
          platform: res.platform,
          handle: res.handle,
          token: res.token,
          expiresAt: res.expiresAt,
          instructions: res.instructions
        });
        setSelectedPlatform(res.platform);
        setSecondsRemaining(60);
      } else {
        setErrorMsg(res.error || 'Failed to start verification session.');
      }
    } catch (err) {
      setErrorMsg('Could not connect to verification server.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Confirm live bio verification
  const handleConfirmLiveVerification = async () => {
    if (!activeSession) return;

    setIsVerifying(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(apiUrl('/api/auth/verify-confirm'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          platform: activeSession.platform,
          handle: activeSession.handle,
          token: activeSession.token
        })
      }).then(r => r.json());

      if (res.success) {
        setSuccessMsg(`Successfully verified @${activeSession.handle} on ${activeSession.platform.toUpperCase()}!`);
        
        const updatedHandles = { ...handles, [activeSession.platform]: activeSession.handle };
        const updatedVerified = { ...verifiedHandles, [activeSession.platform]: true };
        
        setHandles(updatedHandles);
        setVerifiedHandles(updatedVerified);
        setActiveSession(null);

        if (onSaveHandles) {
          onSaveHandles(updatedHandles);
        }
      } else {
        setErrorMsg(res.error || 'Verification code not found in bio. Please make sure you saved it and retry.');
      }
    } catch (err) {
      setErrorMsg('Network error during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Unlink handle
  const handleUnlink = async (platform) => {
    if (!window.confirm(`Are you sure you want to unlink your ${platform.toUpperCase()} handle?`)) return;

    setIsUnlinking(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(apiUrl('/api/auth/unlink-handle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ platform })
      }).then(r => r.json());

      if (res.success) {
        setSuccessMsg(`Unlinked ${platform.toUpperCase()} handle.`);
        const updatedHandles = { ...handles, [platform]: '' };
        const updatedVerified = { ...verifiedHandles, [platform]: false };
        setHandles(updatedHandles);
        setVerifiedHandles(updatedVerified);
        if (onSaveHandles) onSaveHandles(updatedHandles);
      } else {
        setErrorMsg(res.error || 'Failed to unlink handle.');
      }
    } catch (err) {
      setErrorMsg('Error connecting to backend.');
    } finally {
      setIsUnlinking(false);
    }
  };

  // Quick save handles
  const handleSubmitAll = (e) => {
    e.preventDefault();
    if (onSaveHandles) {
      onSaveHandles(handles);
    }
    onClose();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '560px', 
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)'
          }}>
            <Shield size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Connected Platform Handles
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Enter your competitive programming handles to sync solves and stats.
            </p>
          </div>
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

        {/* Verification Active Session Box */}
        {activeSession && (
          <div style={{
            padding: '1rem',
            background: 'var(--bg-main)',
            border: '1px solid var(--accent-green)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Verify {activeSession.platform.toUpperCase()}: @{activeSession.handle}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
                {secondsRemaining}s left
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{
                flexGrow: 1,
                padding: '0.45rem 0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--accent-green-bright)'
              }}>
                {activeSession.token}
              </div>
              <button 
                onClick={() => copyToClipboard(activeSession.token)}
                className="btn btn-secondary btn-sm"
              >
                {copiedToken ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                <span>{copiedToken ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Paste code in your bio/status and save, then confirm:
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleConfirmLiveVerification}
                disabled={isVerifying}
                className="btn btn-primary btn-sm"
                style={{ flexGrow: 1 }}
              >
                <RefreshCw size={12} className={isVerifying ? 'spin-animation' : ''} />
                <span>{isVerifying ? 'Verifying...' : 'Confirm Verification'}</span>
              </button>
              <button onClick={() => setActiveSession(null)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Handles Form */}
        <form onSubmit={handleSubmitAll} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {PLATFORMS_CONFIG.map(p => {
            const currentVal = handles[p.key] || '';
            const isVerified = Boolean(verifiedHandles[p.key] && currentVal);

            return (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '130px', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <PlatformIcon platformKey={p.key} size={18} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {p.name}
                  </span>
                </div>

                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <input 
                    type="text"
                    className="input-field"
                    placeholder={p.placeholder}
                    value={currentVal}
                    onChange={(e) => setHandles(prev => ({ ...prev, [p.key]: e.target.value }))}
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.65rem' }}
                  />
                </div>

                {currentVal && (
                  <button 
                    type="button"
                    onClick={() => handleStartVerification(p.key, currentVal)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.35rem 0.55rem' }}
                    title="Verify Ownership"
                  >
                    <Key size={12} />
                    <span>{isVerified ? 'Verified' : 'Verify'}</span>
                  </button>
                )}
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save & Close
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
