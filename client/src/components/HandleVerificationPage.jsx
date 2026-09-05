import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Trash2, 
  RefreshCw, 
  ArrowRight,
  Lock,
  UserCheck,
  Key
} from 'lucide-react';
import { apiUrl } from '../services/api';
import PlatformIcon from './PlatformIcons';

const PLATFORMS_CONFIG = [
  { key: 'codeforces', name: 'Codeforces', tag: 'CF', placeholder: 'e.g. tourist', profileUrl: (h) => `https://codeforces.com/profile/${h}`, settingsUrl: 'https://codeforces.com/settings/social' },
  { key: 'leetcode', name: 'LeetCode', tag: 'LC', placeholder: 'e.g. neal_wu', profileUrl: (h) => `https://leetcode.com/${h}`, settingsUrl: 'https://leetcode.com/profile/' },
  { key: 'codechef', name: 'CodeChef', tag: 'CC', placeholder: 'e.g. chef_handle', profileUrl: (h) => `https://www.codechef.com/users/${h}`, settingsUrl: 'https://www.codechef.com/' },
  { key: 'atcoder', name: 'AtCoder', tag: 'AC', placeholder: 'e.g. tourist', profileUrl: (h) => `https://atcoder.jp/users/${h}`, settingsUrl: 'https://atcoder.jp/settings' },
  { key: 'gfg', name: 'GeeksforGeeks', tag: 'GFG', placeholder: 'e.g. gfg_user', profileUrl: (h) => `https://auth.geeksforgeeks.org/user/${h}`, settingsUrl: 'https://auth.geeksforgeeks.org/' },
  { key: 'hackerrank', name: 'HackerRank', tag: 'HR', placeholder: 'e.g. hr_user', profileUrl: (h) => `https://www.hackerrank.com/${h}`, settingsUrl: 'https://www.hackerrank.com/settings' }
];

export default function HandleVerificationPage({ 
  currentHandles = {}, 
  currentUser, 
  onSaveHandles,
  onOpenAuthModal 
}) {
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
  const [inputHandles, setInputHandles] = useState({});

  // Active verification session
  const [activeSession, setActiveSession] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
  }, [currentHandles, currentUser]);

  // Handle countdown timer for 60s active verification
  useEffect(() => {
    if (activeSession && activeSession.expiresAt) {
      if (timerRef.current) clearInterval(timerRef.current);

      const updateTimer = () => {
        const remaining = Math.max(0, Math.round((activeSession.expiresAt - Date.now()) / 1000));
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setErrorMsg('Verification session expired (60s limit). Please generate a new code.');
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
  const handleStartVerification = async (platform) => {
    const handle = (inputHandles[platform] || handles[platform] || '').trim();
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
      setErrorMsg('Could not connect to backend verification server.');
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
        setSuccessMsg(`Successfully verified and bound @${activeSession.handle} on ${activeSession.platform.toUpperCase()}!`);
        
        const updatedHandles = { ...handles, [activeSession.platform]: activeSession.handle };
        const updatedVerified = { ...verifiedHandles, [activeSession.platform]: true };
        
        setHandles(updatedHandles);
        setVerifiedHandles(updatedVerified);
        setActiveSession(null);

        if (onSaveHandles) {
          onSaveHandles(updatedHandles);
        }
      } else {
        setErrorMsg(res.error || 'Verification token not found on profile. Make sure you saved your bio/status and try again.');
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
        setInputHandles(prev => ({ ...prev, [platform]: '' }));
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

  // Quick save handles without live bio token
  const handleDirectSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const merged = { ...handles };
    Object.entries(inputHandles).forEach(([plat, val]) => {
      if (val !== undefined) merged[plat] = val.trim();
    });

    try {
      if (onSaveHandles) {
        await onSaveHandles(merged);
        setSuccessMsg('Handles updated successfully!');
      }
    } catch (err) {
      setErrorMsg('Failed to update handles.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  if (!currentUser) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#10b981' }}>
          <Shield size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Sign In to Verify Handles
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          To verify and securely link your competitive programming accounts, please sign in with your Google account.
        </p>
        <button 
          onClick={onOpenAuthModal}
          className="btn btn-primary"
          style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
        >
          <PlatformIcon platformKey="google" size={16} />
          <span>Sign In with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Shield size={18} color="var(--accent-green)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Handle Verification & Linking
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '700px' }}>
              Bind your competitive programming accounts to track live solves, rating histories, and contest statistics. Verify ownership via a 60-second profile token.
            </p>
          </div>

          <button 
            onClick={handleDirectSave}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
          >
            <Check size={14} />
            <span>{isSaving ? 'Saving...' : 'Save All Handles'}</span>
          </button>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div style={{ marginTop: '0.85rem', padding: '0.6rem 0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ marginTop: '0.85rem', padding: '0.6rem 0.85rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Active Verification Session Drawer (When user clicked "Verify via Bio") */}
      {activeSession && (
        <div className="glass-card" style={{
          padding: '1.25rem 1.5rem',
          border: '1px solid var(--accent-green)',
          background: 'var(--bg-secondary)',
          boxShadow: '0 8px 24px var(--accent-green-glow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlatformIcon platformKey={activeSession.platform} size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Verify {activeSession.platform.toUpperCase()} Handle: @{activeSession.handle}
              </h3>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              background: secondsRemaining <= 10 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${secondsRemaining <= 10 ? '#ef4444' : '#10b981'}`,
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: secondsRemaining <= 10 ? '#f87171' : '#34d399'
            }}>
              <Clock size={13} />
              <span>{secondsRemaining}s remaining</span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            alignItems: 'center'
          }}>
            {/* Step 1 & 2 instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <strong>Step 1:</strong> Copy this verification code:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  flexGrow: 1,
                  padding: '0.5rem 0.85rem',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--accent-green-bright)',
                  letterSpacing: '0.05em'
                }}>
                  {activeSession.token}
                </div>
                <button 
                  onClick={() => copyToClipboard(activeSession.token)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem' }}
                >
                  {copiedToken ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                <strong>Step 2:</strong> Paste the code into your <strong>Bio / Status / Organization</strong> field on your {activeSession.platform.toUpperCase()} profile and save it.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', justifyContent: 'center' }}>
              <button 
                onClick={handleConfirmLiveVerification}
                disabled={isVerifying || secondsRemaining <= 0}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <RefreshCw size={14} className={isVerifying ? 'spin-animation' : ''} />
                <span>{isVerifying ? 'Verifying Live Profile...' : 'Confirm Verification'}</span>
              </button>

              <button 
                onClick={() => setActiveSession(null)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6 Platform Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '0.85rem'
      }}>
        {PLATFORMS_CONFIG.map(p => {
          const currentHandle = handles[p.key] || '';
          const inputValue = inputHandles[p.key] !== undefined ? inputHandles[p.key] : currentHandle;
          const isVerified = Boolean(verifiedHandles[p.key] && currentHandle);
          const isBound = Boolean(currentHandle);

          return (
            <div 
              key={p.key} 
              className="glass-card" 
              style={{
                padding: '1rem 1.2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.85rem',
                borderTop: isVerified ? '2px solid var(--accent-green)' : '1px solid var(--border-card)'
              }}
            >
              {/* Platform title and status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PlatformIcon platformKey={p.key} size={20} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {p.name}
                  </span>
                </div>

                <div>
                  {isVerified ? (
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid #10b981' }}>
                      <CheckCircle2 size={11} />
                      <span>Verified</span>
                    </span>
                  ) : isBound ? (
                    <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                      <UserCheck size={11} />
                      <span>Linked</span>
                    </span>
                  ) : (
                    <span className="badge" style={{ color: 'var(--text-dim)' }}>
                      Not Linked
                    </span>
                  )}
                </div>
              </div>

              {/* Input field */}
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  Handle / Username:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input 
                    type="text"
                    className="input-field"
                    placeholder={p.placeholder}
                    value={inputValue}
                    onChange={(e) => setInputHandles(prev => ({ ...prev, [p.key]: e.target.value }))}
                    style={{ fontSize: '0.8rem' }}
                  />
                  {currentHandle && (
                    <a 
                      href={p.profileUrl(currentHandle)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem', color: 'var(--text-muted)' }}
                      title="Open platform profile"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                <button 
                  onClick={() => handleStartVerification(p.key)}
                  disabled={isGenerating || !inputValue.trim()}
                  className="btn btn-secondary btn-sm"
                  style={{
                    flexGrow: 1,
                    fontSize: '0.75rem',
                    color: isVerified ? 'var(--text-muted)' : 'var(--accent-green-bright)',
                    borderColor: isVerified ? 'var(--border-subtle)' : 'var(--accent-green-dark)'
                  }}
                >
                  <Key size={12} />
                  <span>{isVerified ? 'Re-verify Code' : 'Verify via Bio'}</span>
                </button>

                {currentHandle && (
                  <button 
                    onClick={() => handleUnlink(p.key)}
                    disabled={isUnlinking}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#f87171', padding: '0.25rem 0.5rem' }}
                    title="Unlink handle"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
