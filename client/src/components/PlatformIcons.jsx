import React from 'react';

export function CodeforcesIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="1.5" y="9" width="5" height="12" rx="1" fill="#FFD200" />
      <rect x="9.5" y="3" width="5" height="18" rx="1" fill="#1890FF" />
      <rect x="17.5" y="13" width="5" height="8" rx="1" fill="#F5222D" />
    </svg>
  );
}

export function LeetCodeIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path d="M16.1 13.9a1.5 1.5 0 0 0-2.12.22l-4.14 4.88a2.5 2.5 0 0 1-3.66.16 2.5 2.5 0 0 1 .16-3.66l6.63-5.74a4.5 4.5 0 0 1 6.58.55 1.5 1.5 0 1 0 2.29-1.94 7.5 7.5 0 0 0-10.97-.91l-6.63 5.74a5.5 5.5 0 0 0-.35 8.05 5.5 5.5 0 0 0 8.05.35l4.14-4.88a1.5 1.5 0 0 0-.22-2.12z" fill="#FFA116" />
      <path d="M10.8 17.2h8.7a1.5 1.5 0 0 0 0-3h-8.7a1.5 1.5 0 0 0 0 3z" fill="#B3B3B3" />
    </svg>
  );
}

export function AtCoderIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path d="M12 2L2 20h20L12 2z" fill="#00D2FF" fillOpacity="0.25" stroke="#00D2FF" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="3" fill="#00D2FF" />
    </svg>
  );
}

export function CodeChefIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="16" rx="4" fill="#5B4638" />
      <path d="M8 9c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#FFA726" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9.5" cy="13.5" r="1.5" fill="#FFFFFF" />
      <circle cx="14.5" cy="13.5" r="1.5" fill="#FFFFFF" />
      <path d="M9.5 16.5c1.2.9 3.8.9 5 0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GeeksforGeeksIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="2" y="3" width="20" height="18" rx="4" fill="#2F8D46" />
      <path d="M8 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3h1.5v-3H8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3h1.5v-3H16" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HackerRankIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#00EA64" />
      <path d="M8 6v12M16 6v12M8 12h8" stroke="#060906" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GoogleIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  );
}

export function PlatformIcon({ platformKey, size = 16, className = '' }) {
  const key = (platformKey || '').toLowerCase();
  switch (key) {
    case 'codeforces':
    case 'cf':
      return <CodeforcesIcon size={size} className={className} />;
    case 'leetcode':
    case 'lc':
      return <LeetCodeIcon size={size} className={className} />;
    case 'atcoder':
    case 'ac':
      return <AtCoderIcon size={size} className={className} />;
    case 'codechef':
    case 'cc':
      return <CodeChefIcon size={size} className={className} />;
    case 'gfg':
    case 'geeksforgeeks':
      return <GeeksforGeeksIcon size={size} className={className} />;
    case 'hackerrank':
    case 'hr':
      return <HackerRankIcon size={size} className={className} />;
    case 'google':
      return <GoogleIcon size={size} className={className} />;
    default:
      return null;
  }
}

export default PlatformIcon;
