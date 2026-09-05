import React from 'react';

// Official Codeforces 3-bar podium vector logo
export function CodeforcesIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="1.5" y="9" width="4.5" height="12" rx="1.5" fill="#FFC107" />
      <rect x="9.75" y="3" width="4.5" height="18" rx="1.5" fill="#2196F3" />
      <rect x="18" y="13.5" width="4.5" height="7.5" rx="1.5" fill="#F44336" />
    </svg>
  );
}

// Official LeetCode emblem vector logo
export function LeetCodeIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path 
        d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .666-1.607 2.6 2.6 0 0 1 .564-.47l3.857-4.128 5.407-5.787c.56-.599.472-1.557-.144-2.095A1.37 1.37 0 0 0 13.483 0z" 
        fill="#FFA116" 
      />
      <path 
        d="M16.14 9.932a1.377 1.377 0 0 0-.005-1.952l-5.32-5.042a1.378 1.378 0 0 0-1.951.005 1.378 1.378 0 0 0 .005 1.952l4.33 4.103-4.33 4.103a1.378 1.378 0 0 0-.005 1.952 1.378 1.378 0 0 0 1.951.005l5.32-5.042a1.378 1.378 0 0 0 .005-.084z" 
        fill="#8C8C8C" 
      />
      <path 
        d="M9.5 12h11a1.2 1.2 0 0 1 0 2.4h-11a1.2 1.2 0 0 1 0-2.4z" 
        fill="#FFFFFF" 
      />
    </svg>
  );
}

// Official AtCoder geometric delta vector logo
export function AtCoderIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path
        d="M19.123 19.349a1.002 1.002 0 0 1-.873.513H5.75a1.002 1.002 0 0 1-.873-.513 1 1 0 0 1 .006-1.018l5.874-9.873a1.001 1.001 0 0 1 1.734 0l1.83 3.076-1.576.94-1.12-1.882-4.14 6.957h8.538l-1.92-3.226 1.576-.94 2.442 4.103a1 1 0 0 1 .006 1.023v-.002z"
        fill="#00D2FF"
      />
      <circle cx="12" cy="5.2" r="2.2" fill="#00D2FF" />
    </svg>
  );
}

// Official CodeChef chef emblem vector logo
export function CodeChefIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path 
        d="M12 2C7.5 2 4 5.5 4 10c0 2.3.9 4.4 2.4 6 .2.2.4.4.6.5V19c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-2.5c.2-.2.4-.3.6-.5 1.5-1.6 2.4-3.7 2.4-6 0-4.5-3.5-8-8-8z" 
        fill="#5B4638" 
      />
      <circle cx="8.5" cy="8.5" r="2.5" fill="#E6A15C" />
      <circle cx="15.5" cy="8.5" r="2.5" fill="#E6A15C" />
      <circle cx="12" cy="6.5" r="3" fill="#F5B97A" />
      <circle cx="9" cy="13" r="1.2" fill="#FFFFFF" />
      <circle cx="15" cy="13" r="1.2" fill="#FFFFFF" />
      <path d="M10 16c.8.8 3.2.8 4 0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Official GeeksforGeeks green vector logo
export function GeeksforGeeksIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path
        d="M21.05 10.98c-.28-.31-.69-.48-1.11-.48-.68 0-1.26.47-1.41 1.13-.23.98-.94 1.76-1.88 2.05-.33.1-.68.16-1.04.16-1.3 0-2.45-.73-3.03-1.81l1.83-1.06c.4-.23.54-.74.31-1.14-.23-.4-.74-.54-1.14-.31l-3.32 1.92c-.22.13-.37.35-.41.6-.04.25.03.51.2.7 1.12 1.29 2.76 2.1 4.56 2.1.86 0 1.69-.19 2.45-.55.43-.2.83-.46 1.19-.77.16 1.39 1.35 2.47 2.79 2.47.78 0 1.5-.32 2.03-.85.53-.53.85-1.25.85-2.03 0-.96-.48-1.8-1.21-2.31zM2.95 13.02c.28.31.69.48 1.11.48.68 0 1.26-.47 1.41-1.13.23-.98.94-1.76 1.88-2.05.33-.1.68-.16 1.04-.16 1.3 0 2.45.73 3.03 1.81l-1.83 1.06c-.4.23-.54.74-.31 1.14.15.26.42.4.69.4.15 0 .31-.04.45-.12l3.32-1.92c.22-.13.37-.35.41-.6.04-.25-.03-.51-.2-.7-1.12-1.29-2.76-2.1-4.56-2.1-.86 0-1.69.19-2.45.55-.43.2-.83.46-1.19.77-.16-1.39-1.35-2.47-2.79-2.47-.78 0-1.5.32-2.03.85-.53.53-.85 1.25-.85 2.03 0 .96.48 1.8 1.21 2.31z"
        fill="#0F9D58"
      />
    </svg>
  );
}

// Official HackerRank emblem vector logo
export function HackerRankIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect width="24" height="24" rx="4.5" fill="#00EA64" />
      <path
        d="M13.758 5.765c.348 0 .633.284.633.633v4.444h2.532V7.935a.633.633 0 0 1 1.266 0v8.13a.633.633 0 0 1-1.266 0v-2.909h-2.532v4.444a.633.633 0 0 1-.633.633.633.633 0 0 1-.633-.633v-4.444H9.075v2.909a.633.633 0 0 1-1.266 0v-8.13a.633.633 0 0 1 1.266 0v2.909h4.048V6.398c0-.349.285-.633.633-.633z"
        fill="#060906"
      />
    </svg>
  );
}

// Official Google 4-Color 'G' Vector Logo
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

// Unified Platform Icon Switcher
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
