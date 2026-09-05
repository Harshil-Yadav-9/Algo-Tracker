import React from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Zap, 
  Award, 
  Calendar,
  Code2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function POTDHub({ potdList = [], potdCompletions = {}, onTogglePOTDComplete }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const completedTodayCount = potdList.filter(p => potdCompletions[`${todayStr}-${p.id}`]).length;
  const allCompletedToday = potdList.length > 0 && completedTodayCount === potdList.length;

  const handleToggle = (potdId) => {
    const key = `${todayStr}-${potdId}`;
    const willBeCompleted = !potdCompletions[key];
    onTogglePOTDComplete(key);

    if (willBeCompleted) {
      confetti({
        particleCount: 40,
        spread: 50,
        colors: ['#22c55e', '#4ade80', '#15803d', '#86efac'],
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* 1. POTD Header Banner */}
      <div className="glass-card" style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-green-dark)',
            border: '1px solid var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)'
          }}>
            <Terminal size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                $ /usr/bin/potd --daily
              </h2>
              <span className="badge" style={{ background: 'var(--bg-tag)', color: 'var(--accent-green)', border: '1px solid var(--border-color)' }}>
                {todayStr}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Daily cross-platform challenge tracking engine. Solve daily to maintain algorithm consistency.
            </p>
          </div>
        </div>

        {/* Progress Metric */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--bg-dark)',
          padding: '0.45rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Daily Quota</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: allCompletedToday ? 'var(--accent-green-bright)' : 'var(--accent-green)' }}>
              {completedTodayCount} / {potdList.length} SOLVED
            </div>
          </div>
          {allCompletedToday ? (
            <Award size={20} color="var(--accent-green-bright)" />
          ) : (
            <Zap size={20} color="var(--accent-green)" />
          )}
        </div>
      </div>

      {/* 2. POTD Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '0.75rem'
      }}>
        {potdList.map(item => {
          const isDone = !!potdCompletions[`${todayStr}-${item.id}`];

          return (
            <div 
              key={item.id}
              className="glass-card"
              style={{
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: isDone ? '3px solid var(--accent-green-bright)' : '3px solid var(--accent-green-dark)',
                background: isDone ? 'rgba(34, 197, 94, 0.04)' : 'var(--bg-card)'
              }}
            >
              <div>
                {/* Platform & Difficulty */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge tag-terminal" style={{ fontSize: '0.7rem' }}>
                    {item.platform.toUpperCase()}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className={`badge badge-${item.difficulty.toLowerCase()}`}>
                      {item.difficulty}
                    </span>
                    {item.rating && (
                      <span className="badge badge-rating">
                        R:{item.rating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Title */}
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.45rem', lineHeight: 1.3 }}>
                  <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                    {item.title}
                  </a>
                </h3>

                {/* Concept tags */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {item.concepts?.map((c, idx) => (
                    <span key={idx} className="concept-pill" style={{ fontSize: '0.68rem' }}>
                      #{c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action and Checkbox Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-color)'
              }}>
                <button
                  onClick={() => handleToggle(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDone ? 'var(--accent-green-bright)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 size={16} color="var(--accent-green-bright)" />
                      <span>SOLVED</span>
                    </>
                  ) : (
                    <>
                      <Circle size={16} color="var(--text-dim)" />
                      <span>MARK SOLVED</span>
                    </>
                  )}
                </button>

                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                >
                  <span>EXECUTE</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Daily Concept Booster Tip */}
      <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
          background: 'var(--accent-green-dark)',
          border: '1px solid var(--border-color)',
          padding: '0.4rem',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--accent-green)',
          flexShrink: 0
        }}>
          <Cpu size={18} />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            [ALGO_TIPS] // Two Pointers & Binary Search on Answer
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '0.2rem' }}>
            Whenever you encounter monotonic properties in optimization problems (e.g. "Find minimum maximum X" or "Can we achieve score K?"), verify if a predicate function <code>check(mid)</code> runs in O(N). Binary searching over the answer space reduces O(N^2) brute-forces down to O(N log M).
          </p>
        </div>
      </div>

    </div>
  );
}
