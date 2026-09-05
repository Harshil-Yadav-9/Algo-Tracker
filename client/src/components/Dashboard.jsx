import React from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  ExternalLink, 
  Layers, 
  Calendar, 
  ArrowUpRight,
  BookOpen,
  Cpu,
  Terminal
} from 'lucide-react';

export default function Dashboard({ 
  syncData, 
  potdList, 
  contests, 
  onNavigateToTab, 
  onSelectConcept, 
  onOpenHandleModal 
}) {
  const summary = syncData?.summary || {
    totalSolved: 0,
    totalAttempted: 0,
    totalSubmissions: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    connectedPlatformsCount: 0
  };

  const platformBreakdown = syncData?.platformBreakdown || [];
  const concepts = syncData?.concepts || [];
  const recentProblems = (syncData?.problems || []).slice(0, 10);

  const totalAttemptedAndSolved = summary.totalSolved + summary.totalAttempted;
  const solveRate = totalAttemptedAndSolved > 0 
    ? Math.round((summary.totalSolved / totalAttemptedAndSolved) * 100) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* 1. Global Metrics Row (Compact 4-Column Terminal Stats) */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Metric 1: Total Solved */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 600 }}>[SOLVED_TOTAL]</span>
            <CheckCircle2 size={14} color="#22c55e" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>
              {summary.totalSolved.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>
              {solveRate}% rate
            </span>
          </div>
          {/* Easy / Med / Hard mini bar */}
          <div className="progress-bar-bg" style={{ height: '4px', marginBottom: '0.35rem' }}>
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${summary.totalSolved ? (summary.easy / summary.totalSolved) * 100 : 33}%`, 
                background: '#22c55e' 
              }} 
            />
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${summary.totalSolved ? (summary.medium / summary.totalSolved) * 100 : 33}%`, 
                background: '#84cc16' 
              }} 
            />
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${summary.totalSolved ? (summary.hard / summary.totalSolved) * 100 : 34}%`, 
                background: '#eab308' 
              }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#4ade80aa' }}>
            <span>E:{summary.easy}</span>
            <span>M:{summary.medium}</span>
            <span>H:{summary.hard}</span>
          </div>
        </div>

        {/* Metric 2: Total Attempted */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 600 }}>[SUBMISSIONS]</span>
            <XCircle size={14} color="#f87171" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>
              {summary.totalSubmissions.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#f87171' }}>
              ({summary.totalAttempted} unaccepted)
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#4ade80aa' }}>
            live diff engine active
          </span>
        </div>

        {/* Metric 3: Connected Hubs */}
        <div className="glass-card" style={{ padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 600 }}>[PLATFORMS]</span>
            <Layers size={14} color="#4ade80" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>
              {platformBreakdown.length}/6
            </span>
            <span style={{ fontSize: '0.72rem', color: '#22c55e' }}>connected</span>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {['CF', 'LC', 'AC', 'CC', 'GFG', 'HR'].map(p => {
              const isConn = platformBreakdown.some(pb => pb.key.toLowerCase().includes(p.toLowerCase()) || pb.name.toLowerCase().includes(p.toLowerCase()));
              return (
                <span 
                  key={p} 
                  style={{ 
                    fontSize: '0.6rem', 
                    padding: '0.05rem 0.3rem', 
                    borderRadius: '2px',
                    background: isConn ? '#14532d' : '#080d08',
                    color: isConn ? '#4ade80' : '#274227',
                    border: isConn ? '1px solid #22c55e' : '1px solid #142214'
                  }}
                >
                  {p}
                </span>
              );
            })}
          </div>
        </div>

        {/* Metric 4: Scheduled Contests */}
        <div 
          className="glass-card glass-card-interactive" 
          style={{ padding: '0.85rem 1rem', cursor: 'pointer' }}
          onClick={() => onNavigateToTab('contests')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 600 }}>[CONTESTS]</span>
            <Calendar size={14} color="#22c55e" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>
              {contests?.length || 0}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#4ade80' }}>upcoming</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>view_schedule()</span>
            <ArrowUpRight size={11} />
          </div>
        </div>
      </section>

      {/* 2. Main 2-Column Responsive Layout (Utilizes both Left & Right screen area) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '0.85rem'
      }}>
        
        {/* LEFT COLUMN: Platform Profiles & Mastered Concepts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Section: Platform Profiles */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={14} color="#22c55e" />
                <h2 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f0fdf4' }}>
                  CONNECTED_PROFILES
                </h2>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onOpenHandleModal}>
                edit_handles()
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.6rem'
            }}>
              {platformBreakdown.map(p => (
                <PlatformCard key={p.key} platform={p} />
              ))}

              {platformBreakdown.length === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center', gridColumn: '1 / -1', color: '#4ade80aa' }}>
                  <p style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>No handles linked yet.</p>
                  <button className="btn btn-primary btn-sm" onClick={onOpenHandleModal}>
                    link_handles()
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Mastered Concepts */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={14} color="#22c55e" />
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f0fdf4' }}>
                  TOP_CONCEPTS_MATRIX
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToTab('analytics')}>
                analytics()
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {concepts.slice(0, 20).map(c => (
                <button
                  key={c.name}
                  className="concept-pill"
                  onClick={() => onSelectConcept(c.name)}
                >
                  <span>{c.name}</span>
                  <span style={{
                    background: '#166534',
                    color: '#f0fdf4',
                    padding: '0.05rem 0.3rem',
                    borderRadius: '2px',
                    fontSize: '0.65rem',
                    fontWeight: 700
                  }}>
                    {c.count}
                  </span>
                </button>
              ))}

              {concepts.length === 0 && (
                <span style={{ color: '#4ade80aa', fontSize: '0.75rem' }}>
                  Sync platform accounts to populate concept matrix.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Recent Solved Stream & Problem of the Day */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Section: Recent Submissions Stream */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={14} color="#22c55e" />
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f0fdf4' }}>
                  RECENT_SUBMISSIONS_LOG
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToTab('problems')}>
                all_problems({summary.totalSolved + summary.totalAttempted})
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {recentProblems.map(p => (
                <div 
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    background: '#080d08',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #142214'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span className={`badge tag-${p.platformKey}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                      {p.platformKey?.toUpperCase()}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <a 
                        href={p.url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ 
                          color: '#f0fdf4', 
                          textDecoration: 'none', 
                          fontSize: '0.78rem', 
                          fontWeight: 600,
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={p.title}
                      >
                        {p.title}
                      </a>
                      <span style={{ fontSize: '0.65rem', color: '#4ade80aa' }}>
                        {p.concepts?.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    {p.rating && (
                      <span className="badge badge-rating" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                        {p.rating}
                      </span>
                    )}
                    <span className={`badge badge-${p.verdict.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                      {p.verdict}
                    </span>
                  </div>
                </div>
              ))}

              {recentProblems.length === 0 && (
                <p style={{ color: '#4ade80aa', fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>
                  No submissions yet. Trigger sync to fetch live problems.
                </p>
              )}
            </div>
          </div>

          {/* Section: POTD Daily Challenges */}
          {potdList && potdList.length > 0 && (
            <div className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Flame size={14} color="#22c55e" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f0fdf4' }}>
                    POTD_DAILY_FEED
                  </h3>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToTab('potd')}>
                  potd_hub()
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem'
              }}>
                {potdList.slice(0, 4).map(item => (
                  <div 
                    key={item.id} 
                    className="glass-card"
                    style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#080d08' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span className={`badge tag-${item.platformKey}`} style={{ fontSize: '0.62rem', padding: '0.05rem 0.3rem' }}>
                          {item.platform}
                        </span>
                        <span className={`badge badge-${item.difficulty.toLowerCase()}`} style={{ fontSize: '0.62rem', padding: '0.05rem 0.3rem' }}>
                          {item.difficulty}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f0fdf4', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                        {item.title}
                      </h4>
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
                    >
                      <span>solve()</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

function PlatformCard({ platform }) {
  const { name, handle, rating, maxRating, rank, solved, easy, medium, hard, key } = platform;

  return (
    <div className="glass-card" style={{ padding: '0.75rem', background: '#080d08' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0fdf4' }}>{name}</h4>
          <span style={{ fontSize: '0.72rem', color: '#22c55e' }}>
            @{handle}
          </span>
        </div>
        <span className={`badge tag-${key}`} style={{ fontSize: '0.62rem' }}>
          {rank || 'ACTIVE'}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        padding: '0.45rem 0.6rem',
        background: '#0d160d',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '0.5rem',
        border: '1px solid #142214'
      }}>
        <div>
          <span style={{ fontSize: '0.65rem', color: '#86efac' }}>rating</span>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f0fdf4' }}>
            {rating > 0 ? rating.toLocaleString() : '---'}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.65rem', color: '#86efac' }}>solved</span>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#22c55e' }}>
            {solved.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '0.2rem', color: '#4ade80aa' }}>
          <span>E:{easy}</span>
          <span>M:{medium}</span>
          <span>H:{hard}</span>
        </div>
        <div className="progress-bar-bg" style={{ height: '3px' }}>
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${solved ? (easy / solved) * 100 : 33}%`, 
              background: '#22c55e' 
            }} 
          />
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${solved ? (medium / solved) * 100 : 33}%`, 
              background: '#84cc16' 
            }} 
          />
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${solved ? (hard / solved) * 100 : 34}%`, 
              background: '#eab308' 
            }} 
          />
        </div>
      </div>
    </div>
  );
}

