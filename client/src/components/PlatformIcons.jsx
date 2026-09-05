import React from 'react';

// Fallback vector for AtCoder in case SimpleIcons returns 404
const ATCODER_FALLBACK_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300D2FF'%3E%3Cpath d='M19.123 19.349a1.002 1.002 0 0 1-.873.513H5.75a1.002 1.002 0 0 1-.873-.513 1 1 0 0 1 .006-1.018l5.874-9.873a1.001 1.001 0 0 1 1.734 0l1.83 3.076-1.576.94-1.12-1.882-4.14 6.957h8.538l-1.92-3.226 1.576-.94 2.442 4.103a1 1 0 0 1 .006 1.023z'/%3E%3Ccircle cx='12' cy='5.2' r='2.2'/%3E%3C/svg%3E";

// 1. LeetCode (SimpleIcons CDN)
export function LeetCodeIcon({ size = 16, className = '' }) {
  return (
    <img
      src="https://cdn.simpleicons.org/leetcode/FFA116"
      alt="LeetCode"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

// 2. CodeChef (SimpleIcons CDN)
export function CodeChefIcon({ size = 16, className = '' }) {
  return (
    <img
      src="https://cdn.simpleicons.org/codechef/5B4638"
      alt="CodeChef"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

// 3. GeeksforGeeks (SimpleIcons CDN)
export function GeeksforGeeksIcon({ size = 16, className = '' }) {
  return (
    <img
      src="https://cdn.simpleicons.org/geeksforgeeks/2F8D46"
      alt="GeeksforGeeks"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

// 4. HackerRank (SimpleIcons CDN)
export function HackerRankIcon({ size = 16, className = '' }) {
  return (
    <img
      src="https://cdn.simpleicons.org/hackerrank/2EC866"
      alt="HackerRank"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

// 5. AtCoder (SimpleIcons CDN with graceful fallback if 404)
export function AtCoderIcon({ size = 16, className = '' }) {
  return (
    <img
      src="https://cdn.simpleicons.org/atcoder/222222"
      alt="AtCoder"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, objectFit: 'contain' }}
      loading="lazy"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = ATCODER_FALLBACK_SVG;
      }}
    />
  );
}

// 6. Codeforces (Authentic 3-Color Podium Vector)
export function CodeforcesIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="1.5" y="9" width="4.5" height="12" rx="1.5" fill="#FFC107" />
      <rect x="9.75" y="3" width="4.5" height="18" rx="1.5" fill="#2196F3" />
      <rect x="18" y="13.5" width="4.5" height="7.5" rx="1.5" fill="#F44336" />
    </svg>
  );
}

// 7. Google (Official 4-Color 'G' Vector)
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

// Unified Platform Icon Switcher with full alias coverage
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
