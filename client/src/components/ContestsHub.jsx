import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Timer, 
  Radio, 
  Terminal
} from 'lucide-react';

export default function ContestsHub({ contests = [] }) {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [now, setNow] = useState(Date.now());

  // Real-time ticker every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredContests = contests.filter(c => {
    if (selectedPlatform !== 'all' && c.platformKey !== selectedPlatform) return false;
    return true;
  });

  const ongoingContests = filteredContests.filter(c => now >= c.startTimeMs && now < c.endTimeMs);
  const upcomingContests = filteredContests.filter(c => now < c.startTimeMs);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} color="#22c55e" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>
            CONTESTS_SCHEDULE_HUB
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#4ade80aa' }}>
            [{filteredContests.length} events]
          </span>
        </div>

        {/* Platform filter tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'ALL' },
            { key: 'codeforces', label: 'CF' },
            { key: 'leetcode', label: 'LC' },
            { key: 'atcoder', label: 'AC' },
            { key: 'codechef', label: 'CC' },
            { key: 'hackerrank', label: 'HR' }
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setSelectedPlatform(p.key)}
              className={`btn btn-sm ${selectedPlatform === p.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Ongoing Contests (if any) */}
      {ongoingContests.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Radio size={14} color="#f87171" className="animate-spin" />
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f87171' }}>
              LIVE_CONTESTS_RUNNING ({ongoingContests.length})
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.65rem'
          }}>
            {ongoingContests.map(c => (
              <ContestCard key={c.id} contest={c} now={now} isOngoing={true} />
            ))}
          </div>
        </section>
      )}

      {/* 2. Upcoming Contests Grid */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <Calendar size={14} color="#22c55e" />
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0fdf4' }}>
            UPCOMING_SCHEDULE ({upcomingContests.length})
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.65rem'
        }}>
          {upcomingContests.map(c => (
            <ContestCard key={c.id} contest={c} now={now} isOngoing={false} />
          ))}

          {upcomingContests.length === 0 && (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', background: '#080d08' }}>
              <p style={{ color: '#4ade80aa', fontSize: '0.8rem' }}>No upcoming contests match platform filter.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

function ContestCard({ contest, now, isOngoing }) {
  const { name, platform, platformKey, url, registerUrl, startTime, startTimeMs, endTimeMs, durationFormatted, in24Hours } = contest;

  // Countdown calculations
  const diffMs = isOngoing ? endTimeMs - now : startTimeMs - now;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const formatGCalDate = (ms) => new Date(ms).toISOString().replace(/-|:|\.\d+/g, '');
    const startStr = formatGCalDate(startTimeMs);
    const endStr = formatGCalDate(endTimeMs);
    const title = encodeURIComponent(`[${platform}] ${name}`);
    const details = encodeURIComponent(`Contest URL: ${url}\nPlatform: ${platform}\nDuration: ${durationFormatted}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${encodeURIComponent(url)}`;
  };

  return (
    <div 
      className="glass-card"
      style={{
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#090e09',
        borderColor: isOngoing ? '#dc2626' : in24Hours ? '#65a30d' : '#1a2e1a'
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className={`badge tag-${platformKey}`} style={{ fontSize: '0.65rem' }}>
            {platform}
          </span>

          {isOngoing ? (
            <span className="badge" style={{ background: '#450a0a', color: '#f87171', border: '1px solid #dc2626', fontSize: '0.62rem' }}>
              🔴 LIVE
            </span>
          ) : in24Hours ? (
            <span className="badge" style={{ background: '#1c1708', color: '#fde047', border: '1px solid #854d0e', fontSize: '0.62rem' }}>
              ⚡ TODAY
            </span>
          ) : (
            <span style={{ fontSize: '0.68rem', color: '#4ade80aa' }}>
              {new Date(startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Contest Name */}
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
          <a href={url} target="_blank" rel="noreferrer" style={{ color: '#f0fdf4', textDecoration: 'none' }}>
            {name}
          </a>
        </h3>

        {/* Start Time & Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: '#86efac', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} color="#22c55e" />
            <span>{new Date(startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Timer size={12} color="#4ade80" />
            <span>{durationFormatted}</span>
          </div>
        </div>

        {/* Countdown Box */}
        <div style={{
          background: '#0d160d',
          border: '1px solid #142214',
          borderRadius: 'var(--radius-sm)',
          padding: '0.45rem',
          marginBottom: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.62rem', color: '#86efac', textTransform: 'uppercase', marginBottom: '0.1rem' }}>
            {isOngoing ? 'time_remaining' : 'starts_in'}
          </div>
          <div style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: isOngoing ? '#f87171' : in24Hours ? '#a3e635' : '#4ade80',
            letterSpacing: '0.04em'
          }}>
            {days > 0 ? `${days}d ` : ''}
            {String(hours).padStart(2, '0')}h:{String(minutes).padStart(2, '0')}m:{String(seconds).padStart(2, '0')}s
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
        <a 
          href={getGoogleCalendarUrl()} 
          target="_blank" 
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.68rem', padding: '0.2rem 0.4rem' }}
          title="Add to Google Calendar"
        >
          <Calendar size={11} />
          <span>cal_add</span>
        </a>

        <a 
          href={registerUrl || url} 
          target="_blank" 
          rel="noreferrer"
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.68rem', padding: '0.2rem 0.4rem' }}
        >
          <span>register</span>
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

