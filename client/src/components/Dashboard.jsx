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
  Code2
} from 'lucide-react';
import PlatformIcon from './PlatformIcons';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Global Metrics Row (4 Columns) */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* Metric 1: Total Solved */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Solved</span>
            <CheckCircle2 size={16} color="var(--accent-green)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {summary.totalSolved.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-green-bright)', fontWeight: 600 }}>
              {solveRate}% accuracy
            </span>
          </div>
          {/* Easy / Med / Hard mini bar */}
          <div className="progress-bar-bg" style={{ height: '4px', marginBottom: '0.35rem' }}>
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${summary.totalSolved ? (summary.easy / summary.totalSolved) * 100 : 33}%`, 
                background: '#10b981' 
              }} 
            />
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${summary.totalSolved ? (summary.medium / summary.totalSolved) * 100 : 33}%`, 
                background: '#f59e0b' 
              }} 
            />
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${summary.totalSolved ? (summary.hard / summary.totalSolved) * 100 : 34}%`, 
                background: '#ef4444' 
              }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            <span>Easy: {summary.easy}</span>
            <span>Med: {summary.medium}</span>
            <span>Hard: {summary.hard}</span>
          </div>
        </div>

        {/* Metric 2: Total Submissions */}
        <div className="glass-card" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Submissions Tracked</span>
            <Layers size={16} color="#38bdf8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {summary.totalSubmissions.toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Attempted: <strong style={{ color: 'var(--text-main)' }}>{summary.totalAttempted}</strong> problems
          </div>
        </div>

        {/* Metric 3: Connected Platforms */}
        <div 
          className="glass-card glass-card-interactive" 
          style={{ padding: '1rem 1.15rem', cursor: 'pointer' }}
          onClick={() => onNavigateToTab('verify')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Platforms Linked</span>
            <Code2 size={16} color="#fbbf24" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {platformBreakdown.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>/ 6 active</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-green-bright)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Manage handles</span>
            <ArrowUpRight size={13} />
          </div>
        </div>

        {/* Metric 4: Scheduled Contests */}
        <div 
          className="glass-card glass-card-interactive" 
          style={{ padding: '1rem 1.15rem', cursor: 'pointer' }}
          onClick={() => onNavigateToTab('contests')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upcoming Contests</span>
            <Calendar size={16} color="var(--accent-green)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {contests?.length || 0}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>scheduled</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-green-bright)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>View calendar</span>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </section>

      {/* 2. Main 2-Column Responsive Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '1rem'
      }}>
        
        {/* LEFT COLUMN: Platform Profiles & Mastered Concepts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Section: Platform Profiles */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={16} color="var(--accent-green)" />
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Connected Profiles
                </h2>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToTab('verify')}>
                Edit Handles
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem'
            }}>
              {platformBreakdown.map(p => (
                <PlatformCard key={p.key} platform={p} />
              ))}

              {platformBreakdown.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>No handles linked yet.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => onNavigateToTab('verify')}>
                    Link Platform Handles
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Mastered Concepts */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} color="var(--accent-green)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Topic & Tag Breakdown
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToTab('analytics')}>
                Analytics View
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {concepts.slice(0, 24).map(c => (
                <button
                  key={c.name}
                  className="concept-pill"
                  onClick={() => onSelectConcept(c.name)}
                >
                  <span>{c.name}</span>
                  <span style={{
                    background: 'var(--bg-main)',
                    color: 'var(--accent-green-bright)',
                    padding: '0.05rem 0.35rem',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {c.count}
                  </span>
                </button>
              ))}

              {concepts.length === 0 && (
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  Sync your platform accounts to populate topic tags.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Recent Solves & Daily Challenges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Section: Recent Submissions */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={16} color="var(--accent-green)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Recent Solves
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToTab('problems')}>
                View All Problems
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentProblems.map(prob => (
                <div 
                  key={prob.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <PlatformIcon platformKey={prob.platformKey} size={16} />
                    <a 
                      href={prob.url} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ 
                        color: 'var(--text-main)', 
                        textDecoration: 'none', 
                        fontSize: '0.82rem', 
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={prob.title}
                    >
                      {prob.title}
                    </a>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <span className={`badge badge-${prob.difficulty.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                      {prob.difficulty}
                    </span>
                    <span className={`badge ${prob.verdict === 'Solved' ? 'badge-solved' : 'badge-attempted'}`} style={{ fontSize: '0.65rem' }}>
                      {prob.verdict}
                    </span>
                  </div>
                </div>
              ))}

              {recentProblems.length === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.8rem' }}>No problems tracked yet. Hit "Sync Solves" to fetch your history.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Today's Daily Challenges Preview */}
          {potdList.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flame size={16} color="#fb923c" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Daily Coding Challenges (POTD)
                  </h3>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToTab('potd')}>
                  POTD Hub
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.65rem'
              }}>
                {potdList.slice(0, 4).map(item => (
                  <div 
                    key={item.id} 
                    className="glass-card"
                    style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 600 }}>
                          <PlatformIcon platformKey={item.platformKey} size={14} />
                          <span>{item.platform}</span>
                        </span>
                        <span className={`badge badge-${item.difficulty.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                          {item.difficulty}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                        {item.title}
                      </h4>
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.72rem' }}
                    >
                      <span>Solve Problem</span>
                      <ExternalLink size={12} />
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
    <div className="glass-card" style={{ padding: '0.85rem', background: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <PlatformIcon platformKey={key} size={18} />
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{name}</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              @{handle}
            </span>
          </div>
        </div>
        <span className={`badge tag-${key}`} style={{ fontSize: '0.65rem' }}>
          {rank || 'ACTIVE'}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        padding: '0.5rem 0.65rem',
        background: 'var(--bg-main)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '0.5rem',
        border: '1px solid var(--border-subtle)'
      }}>
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Rating</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {rating > 0 ? rating.toLocaleString() : '---'}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Solved</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-green-bright)' }}>
            {solved.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '0.2rem', color: 'var(--text-dim)' }}>
          <span>E: {easy}</span>
          <span>M: {medium}</span>
          <span>H: {hard}</span>
        </div>
        <div className="progress-bar-bg" style={{ height: '3px' }}>
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${solved ? (easy / solved) * 100 : 33}%`, 
              background: '#10b981' 
            }} 
          />
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${solved ? (medium / solved) * 100 : 33}%`, 
              background: '#f59e0b' 
            }} 
          />
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${solved ? (hard / solved) * 100 : 34}%`, 
              background: '#ef4444' 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
