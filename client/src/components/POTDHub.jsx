import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Zap, 
  Award, 
  Calendar,
  Code2,
  Flame,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PlatformIcon from './PlatformIcons';

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
        colors: ['#10b981', '#34d399', '#059669', '#38bdf8', '#fbbf24'],
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. POTD Header Banner */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(249, 115, 22, 0.15)',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fb923c'
          }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Daily Coding Challenges (POTD)
              </h2>
              <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                {todayStr}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Problem of the Day aggregated across LeetCode, Codeforces, and GeeksforGeeks. Solve daily to build streaks.
            </p>
          </div>
        </div>

        {/* Progress Metric */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--bg-secondary)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Daily Progress</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: allCompletedToday ? 'var(--accent-green-bright)' : 'var(--text-main)' }}>
              {completedTodayCount} / {potdList.length} Solved
            </div>
          </div>
          {allCompletedToday ? (
            <Award size={22} color="var(--accent-green-bright)" />
          ) : (
            <Zap size={22} color="#fbbf24" />
          )}
        </div>
      </div>

      {/* 2. POTD Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '0.85rem'
      }}>
        {potdList.map(item => {
          const isDone = !!potdCompletions[`${todayStr}-${item.id}`];

          return (
            <div 
              key={item.id} 
              className="glass-card"
              style={{
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: isDone ? '3px solid var(--accent-green-bright)' : '3px solid var(--border-card)',
                background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)'
              }}
            >
              <div>
                {/* Platform & Difficulty */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <PlatformIcon platformKey={item.platformKey} size={16} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.platform}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className={`badge badge-${(item.difficulty || 'Medium').toLowerCase()}`}>
                      {item.difficulty || 'Medium'}
                    </span>
                    {item.rating && (
                      <span className="badge badge-rating">
                        Rating: {item.rating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Title */}
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>
                  <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                    {item.title}
                  </a>
                </h3>

                {/* Concept tags */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                  {item.concepts?.map((c, idx) => (
                    <span key={idx} className="concept-pill" style={{ fontSize: '0.72rem' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action and Checkbox Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.65rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <button
                  onClick={() => handleToggle(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDone ? 'var(--accent-green-bright)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 size={17} color="var(--accent-green-bright)" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle size={17} color="var(--text-dim)" />
                      <span>Mark Solved</span>
                    </>
                  )}
                </button>

                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                >
                  <span>Solve Problem</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          );
        })}
        {potdList.length === 0 && (
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading today's challenges across platforms...</p>
          </div>
        )}
      </div>

      {/* 3. Daily Concept Booster Tip */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.5rem',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--accent-green)',
          flexShrink: 0
        }}>
          <Lightbulb size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-green-bright)', fontWeight: 700 }}>
            Algorithm Strategy Tip // Monotonicity & Binary Search on Answer
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '0.25rem' }}>
            Whenever an optimization question asks for the "minimum maximum" or "maximum minimum", check if a verification function <code>canAchieve(mid)</code> is monotonic. If valid for X, is it also valid for X+1? If so, binary search on the answer space in O(log(range) * N) instead of brute force.
          </p>
        </div>
      </div>

    </div>
  );
}
