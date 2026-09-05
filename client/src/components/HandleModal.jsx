import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Terminal,
  ExternalLink,
  Clock,
  Trash2,
  RefreshCw,
  Check,
  Zap,
  Lock
} from 'lucide-react';
import { apiUrl } from '../services/api';

const PLATFORMS_CONFIG = [
  { key: 'codeforces', name: 'Codeforces', tag: 'CF', placeholder: 'e.g. tourist' },
  { key: 'leetcode', name: 'LeetCode', tag: 'LC', placeholder: 'e.g. neal_wu' },
  { key: 'codechef', name: 'CodeChef', tag: 'CC', placeholder: 'e.g. chef_handle' },
  { key: 'atcoder', name: 'AtCoder', tag: 'AC', placeholder: 'e.g. tourist' },
  { key: 'gfg', name: 'GeeksforGeeks', tag: 'GFG', placeholder: 'e.g. gfg_user' },
  { key: 'hackerrank', name: 'HackerRank', tag: 'HR', placeholder: 'e.g. hr_user' }
];

export default function HandleModal({ isOpen, onClose, currentHandles, onSaveHandles, currentUser }) {
  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';
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
          setErrorMsg('[EXPIRED] 60-second verification session expired. Please generate a new code.');
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
      setErrorMsg(`[ERROR] Please enter your ${platform.toUpperCase()} handle first.`);
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
        setErrorMsg(res.error || '[ERROR] Failed to start verification session.');
      }
    } catch (err) {
      setErrorMsg('[ERROR] Could not connect to verification server.');
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
          handle: activeSession.handle
        })
      }).then(r => r.json());

      if (res.success) {
        setSuccessMsg(res.message || `[SUCCESS] Verified & linked @${activeSession.handle} on ${activeSession.platform.toUpperCase()}!`);
        setHandles(res.handles);
        setVerifiedHandles(res.verifiedHandles);
        setActiveSession(null);
        if (onSaveHandles) onSaveHandles(res.handles);
      } else {
        setErrorMsg(res.error || '[VERIFICATION_FAILED] Code not found in bio.');
      }
    } catch (err) {
      setErrorMsg('[ERROR] Network error during live verification check.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Unlink handle
  const handleUnlink = async (platform) => {
    if (!window.confirm(`[CONFIRM_UNLINK] Remove verified ${platform.toUpperCase()} handle "${handles[platform]}"?`)) return;

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
        setHandles(res.handles);
        setVerifiedHandles(res.verifiedHandles);
        setSuccessMsg(`[UNLINKED] Removed ${platform.toUpperCase()} handle.`);
        if (onSaveHandles) onSaveHandles(res.handles);
      } else {
        setErrorMsg(res.error || 'Failed to unlink handle.');
      }
    } catch (err) {
      setErrorMsg('[ERROR] Network error unlinking handle.');
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="modal-backdrop">
      <div 
        className="glass-card modal-content" 
        style={{ padding: '1.25rem 1.5rem', maxWidth: '580px', width: '95%' }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: 'var(--accent-green-dark)',
              border: '1px solid var(--accent-green)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-green)'
            }}>
              <Terminal size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                $ /usr/bin/verify-handle --bio-check --60s
              </h3>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Guaranteed ownership verification: temporary 60-second profile bio token check
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-dark)',
            border: '1px solid var(--verdict-wrong)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--verdict-wrong)',
            fontSize: '0.72rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.4rem',
            lineHeight: 1.4
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
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
            fontSize: '0.72rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. ACTIVE 60-SECOND VERIFICATION SCREEN */}
        {activeSession ? (
          <div style={{
            background: 'var(--bg-dark)',
            border: '1px solid var(--accent-green)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            {/* Header & Timer Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="badge tag-terminal" style={{ fontSize: '0.7rem' }}>
                  {activeSession.platform.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  @{activeSession.handle}
                </span>
              </div>

              {/* Countdown Ticker */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: secondsRemaining > 15 ? 'var(--accent-green-dark)' : 'rgba(239, 68, 68, 0.2)',
                border: secondsRemaining > 15 ? '1px solid var(--accent-green)' : '1px solid var(--verdict-wrong)',
                color: secondsRemaining > 15 ? 'var(--accent-green-bright)' : 'var(--verdict-wrong)',
                fontWeight: 800,
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <Clock size={12} className={secondsRemaining > 0 ? 'spin-animation' : ''} />
                <span>{secondsRemaining}s REMAINING</span>
              </div>
            </div>

            {/* Token Copy Box */}
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
                1. COPY THIS UNIQUE VERIFICATION CODE:
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-card)',
                border: '1px solid var(--accent-green-bright)',
                padding: '0.4rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: 'var(--accent-green-bright)',
                fontWeight: 700
              }}>
                <span>{activeSession.token}</span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleCopyCode(activeSession.token)}
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                >
                  <Copy size={11} />
                  <span>{copiedToken ? 'COPIED!' : 'COPY CODE'}</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '0.65rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.72rem',
              lineHeight: 1.45,
              color: 'var(--text-muted)'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-green)', marginBottom: '0.3rem' }}>
                2. INSTRUCTIONS FOR {activeSession.platform.toUpperCase()}:
              </div>
              {activeSession.instructions?.steps?.map((step, idx) => (
                <div key={idx} style={{ marginBottom: '0.2rem' }}>
                  {step}
                </div>
              ))}
            </div>

            {/* Direct Link to Profile Settings */}
            {activeSession.instructions?.settingsUrl && (
              <a
                href={activeSession.instructions.settingsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center', fontSize: '0.75rem', textDecoration: 'none' }}
              >
                <span>OPEN {activeSession.platform.toUpperCase()} PROFILE SETTINGS</span>
                <ExternalLink size={12} />
              </a>
            )}

            {/* Verify Now & Cancel Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveSession(null)}
                style={{ fontSize: '0.72rem' }}
              >
                CANCEL
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirmLiveVerification}
                disabled={isVerifying || secondsRemaining <= 0}
                style={{ flexGrow: 1, justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}
              >
                <Zap size={13} />
                <span>{isVerifying ? 'SCANNING PROFILE BIO LIVE...' : 'VERIFY & LOCK HANDLE IN DATABASE'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 2. PLATFORMS LIST & VERIFICATION GENERATOR */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Select a platform to link your handle. Each handle must be verified via your profile bio before being saved to MongoDB:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PLATFORMS_CONFIG.map(p => {
                const currentVal = handles[p.key] || '';
                const isVerified = Boolean(verifiedHandles[p.key] && currentVal);

                return (
                  <div 
                    key={p.key}
                    style={{
                      background: 'var(--bg-dark)',
                      border: isVerified ? '1px solid var(--accent-green-bright)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.55rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    {/* Platform name & current handle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px' }}>
                      <span className="badge tag-terminal" style={{ fontSize: '0.68rem' }}>
                        {p.tag}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: isVerified ? 'var(--accent-green-bright)' : 'var(--text-dim)' }}>
                          {isVerified ? `● VERIFIED: @${currentVal}` : (currentVal ? `○ PENDING VERIFICATION: @${currentVal}` : '○ NOT CONNECTED')}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons / input */}
                    {isVerified ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className="badge" style={{ background: 'var(--accent-green-dark)', color: 'var(--accent-green-bright)', border: '1px solid var(--accent-green)', fontSize: '0.65rem' }}>
                          <Lock size={10} style={{ marginRight: '0.2rem' }} />
                          LOCKED IN DB
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleUnlink(p.key)}
                          disabled={isUnlinking}
                          style={{ fontSize: '0.65rem', padding: '0.2rem 0.45rem', borderColor: 'var(--verdict-wrong)', color: 'var(--verdict-wrong)' }}
                        >
                          <Trash2 size={11} />
                          <span>UNLINK</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexGrow: 1, maxWidth: '280px' }}>
                        <input 
                          type="text"
                          placeholder={p.placeholder}
                          value={handles[p.key] || ''}
                          onChange={(e) => setHandles({ ...handles, [p.key]: e.target.value })}
                          className="input-field"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStartVerification(p.key, handles[p.key])}
                          disabled={isGenerating || !handles[p.key]}
                          style={{ fontSize: '0.68rem', padding: '0.3rem 0.55rem', whiteSpace: 'nowrap' }}
                        >
                          <span>VERIFY BIO</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Info Note */}
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
              💡 Handles cannot be bound without completing the 1-minute profile bio verification. Random unverified handles are prevented from being saved to the database.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
