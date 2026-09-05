import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Timer, 
  Radio, 
  Plus
} from 'lucide-react';
import PlatformIcon from './PlatformIcons';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="var(--accent-green)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            Contests Schedule
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            ({filteredContests.length} events)
          </span>
        </div>

        {/* Platform filter tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Platforms' },
            { key: 'codeforces', label: 'Codeforces' },
            { key: 'leetcode', label: 'LeetCode' },
            { key: 'atcoder', label: 'AtCoder' },
            { key: 'codechef', label: 'CodeChef' },
            { key: 'hackerrank', label: 'HackerRank' }
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setSelectedPlatform(p.key)}
              className={`btn btn-sm ${selectedPlatform === p.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {p.key !== 'all' && <PlatformIcon platformKey={p.key} size={14} />}
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. Ongoing Contests (if any) */}
      {ongoingContests.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
            <Radio size={16} color="#f87171" className="animate-spin" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f87171' }}>
              Live Contests Running ({ongoingContests.length})
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '0.85rem'
          }}>
            {ongoingContests.map(c => (
              <ContestCard key={c.id} contest={c} now={now} isOngoing={true} />
            ))}
          </div>
        </section>
      )}

      {/* 2. Upcoming Contests Grid */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
          <Calendar size={16} color="var(--accent-green)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Upcoming Rounds ({upcomingContests.length})
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '0.85rem'
        }}>
          {upcomingContests.map(c => (
            <ContestCard key={c.id} contest={c} now={now} isOngoing={false} />
          ))}

          {upcomingContests.length === 0 && (
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming contests match the selected platform.</p>
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
        padding: '1.1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        borderColor: isOngoing ? '#ef4444' : in24Hours ? '#f59e0b' : 'var(--border-card)'
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlatformIcon platformKey={platformKey} size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {platform}
            </span>
          </div>

          {isOngoing ? (
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #ef4444', fontSize: '0.65rem' }}>
              🔴 LIVE
            </span>
          ) : in24Hours ? (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid #f59e0b', fontSize: '0.65rem' }}>
              ⚡ TODAY
            </span>
          ) : (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {new Date(startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
            </span>
          )}
        </div>

        {/* Contest Name */}
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.65rem', lineHeight: 1.35 }}>
          <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
            {name}
          </a>
        </h3>

        {/* Start Time & Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={13} color="var(--accent-green)" />
            <span>{new Date(startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Timer size={13} color="#38bdf8" />
            <span>{durationFormatted}</span>
          </div>
        </div>

        {/* Countdown Box */}
        <div style={{
          background: 'var(--bg-main)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem',
          marginBottom: '0.85rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
            {isOngoing ? 'Time Remaining' : 'Starts In'}
          </div>
          <div style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: isOngoing ? '#f87171' : in24Hours ? '#fbbf24' : 'var(--accent-green-bright)',
            letterSpacing: '0.02em'
          }}>
            {days > 0 ? `${days}d ` : ''}
            {String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <a 
          href={getGoogleCalendarUrl()} 
          target="_blank" 
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem' }}
          title="Add to Google Calendar"
        >
          <Calendar size={13} />
          <span>Calendar</span>
        </a>

        <a 
          href={registerUrl || url} 
          target="_blank" 
          rel="noreferrer"
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.75rem' }}
        >
          <span>Register</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
