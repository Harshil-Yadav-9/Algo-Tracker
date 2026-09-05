import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Zap, ExternalLink, X, Terminal } from 'lucide-react';

export default function LiveNotificationToast({ newProblems = [], onClose }) {
  useEffect(() => {
    if (newProblems && newProblems.length > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          colors: ['#22c55e', '#4ade80', '#15803d', '#86efac'],
          origin: { y: 0.2, x: 0.85 }
        });
      } catch (err) {}
    }
  }, [newProblems]);

  if (!newProblems || newProblems.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '4rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      maxWidth: '360px',
      width: '100%',
      pointerEvents: 'auto'
    }}>
      {newProblems.slice(0, 3).map((prob, idx) => (
        <div 
          key={prob.id || idx}
          className="glass-card"
          style={{
            padding: '0.65rem 0.85rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-green-bright)',
            borderLeft: '4px solid var(--accent-green-bright)',
            borderRadius: 'var(--radius-sm)',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Zap size={14} color="var(--accent-green-bright)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-green-bright)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                [ACCEPTED_SUBMISSION_DETECTED]
              </span>
            </div>

            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Problem Title & Platform */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginTop: '0.15rem' }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-main)' }}>
                {prob.title || 'Coding Problem'}
              </span>
              {prob.problemId && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '0.3rem' }}>
                  ({prob.problemId})
                </span>
              )}
            </div>

            <span className="badge tag-terminal" style={{ fontSize: '0.65rem', flexShrink: 0 }}>
              {prob.platform || 'CF'}
            </span>
          </div>

          {/* Subtext */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={12} color="var(--accent-green-bright)" />
              <span>Auto-synced via tab switch</span>
            </span>

            {prob.url && (
              <a 
                href={prob.url} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: 'var(--accent-green-bright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontWeight: 600 }}
              >
                <span>EXECUTE</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
