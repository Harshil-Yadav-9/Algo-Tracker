import React from 'react';

// Official Codeforces logo — three colored bars
export function CodeforcesIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="1" y="9.5" width="4.5" height="12" rx="1.5" fill="#1194F0" />
      <rect x="9.75" y="2.5" width="4.5" height="19" rx="1.5" fill="#F0511C" />
      <rect x="18.5" y="13.5" width="4.5" height="8" rx="1.5" fill="#F0511C" />
    </svg>
  );
}

// Official LeetCode logo — exact brand path from SimpleIcons
export function LeetCodeIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path
        d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .666-1.607 2.6 2.6 0 0 1 .564-.47l3.857-4.128 5.407-5.787c.56-.599.472-1.557-.144-2.095A1.37 1.37 0 0 0 13.483 0z"
        fill="#FFA116"
      />
      <path
        d="M6.888 8.125a3.464 3.464 0 0 0-1.47 2.24 3.5 3.5 0 0 0 .895 3.072l4.304 4.153c.726.694 1.915.672 2.614-.049l2.396-2.392a.22.22 0 0 1 .31.004.22.22 0 0 1 0 .31l-2.396 2.392c-.99.987-2.605 1.008-3.62.049L5.617 13.75a4.857 4.857 0 0 1-1.248-4.28 4.82 4.82 0 0 1 2.047-3.118l.472.773z"
        fill="#B3B3B3"
      />
      <path
        d="M16.42 12.502h-8.08a1.173 1.173 0 0 0 0 2.346h8.08a1.173 1.173 0 0 0 0-2.346z"
        fill="#FFA116"
      />
    </svg>
  );
}

// Official AtCoder logo — exact brand path from SimpleIcons
export function AtCoderIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path
        d="M21.2 18.3H2.8L12 5.7l9.2 12.6zm-16.3-1.6h14.2L12 7.7 4.9 16.7z"
        fill="#222222"
      />
      <path
        d="M21.2 18.3H2.8L12 5.7l9.2 12.6zm-16.3-1.6h14.2L12 7.7 4.9 16.7z"
        fill="#00D2FF"
      />
      <path
        d="M12 5.7l9.2 12.6H2.8L12 5.7zm0 2-7.1 9h14.2L12 7.7z"
        fill="#00D2FF"
      />
    </svg>
  );
}

// Official CodeChef logo — exact brand path from SimpleIcons
export function CodeChefIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path
        d="M11.257.004C5.657.088 1.1 4.801 1.1 10.403c0 2.868 1.14 5.467 2.988 7.372L2.57 19.7c-.406.602-.144 1.417.537 1.71l5.24 2.24c.573.244 1.24.013 1.54-.529l.94-1.693c.388.066.785.1 1.19.1h.001c5.6 0 10.138-4.538 10.138-10.137 0-5.6-4.537-10.137-10.137-10.137l-.762.75zM12 2.254c4.496 0 8.137 3.642 8.137 8.138 0 4.495-3.641 8.136-8.137 8.136a8.11 8.11 0 0 1-3.047-.593l-1.073 1.934-3.668-1.567 1.513-2.246A8.076 8.076 0 0 1 3.863 10.39C3.863 5.895 7.504 2.254 12 2.254zm-.002 1.89c-3.453 0-6.253 2.8-6.253 6.253 0 3.452 2.8 6.252 6.253 6.252 3.452 0 6.252-2.8 6.252-6.252 0-3.453-2.8-6.253-6.252-6.253zm0 1.34a4.91 4.91 0 0 1 4.912 4.913 4.91 4.91 0 0 1-4.912 4.912A4.91 4.91 0 0 1 7.086 10.4 4.91 4.91 0 0 1 11.998 5.484zm0 1.34A3.57 3.57 0 0 0 8.427 10.4a3.57 3.57 0 0 0 3.571 3.572A3.57 3.57 0 0 0 15.57 10.4 3.57 3.57 0 0 0 11.998 6.824z"
        fill="#5B4638"
      />
    </svg>
  );
}

// Official GeeksforGeeks logo — exact brand path from SimpleIcons
export function GeeksforGeeksIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path
        d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-1.42.26 4.43 4.43 0 0 1-.77-.066 4.015 4.015 0 0 1-1.659-.755 3.87 3.87 0 0 1-.66-.65 4.14 4.14 0 0 1-.38-.601h-.25a4.14 4.14 0 0 1-.38.601 3.87 3.87 0 0 1-.66.65 4.015 4.015 0 0 1-1.659.755 4.43 4.43 0 0 1-.77.066 4.51 4.51 0 0 1-1.42-.26 3.691 3.691 0 0 1-1.104-.695 2.943 2.943 0 0 1-.565-.745A2.106 2.106 0 0 1 8 13.455V11.5h.05a3.51 3.51 0 0 1-.05-.5 3.576 3.576 0 0 1 .17-1.08A3.574 3.574 0 0 1 9.5 8.27 4.025 4.025 0 0 1 12 7.5a4.025 4.025 0 0 1 2.5.77 3.574 3.574 0 0 1 1.28 1.65 3.576 3.576 0 0 1 .17 1.08c0 .17-.017.336-.05.5H16v1.955c0 .31-.059.62-.165.915a2.97 2.97 0 0 1-.065.145zm-5.43-2.39a1.32 1.32 0 0 0 .255-.695 1.185 1.185 0 0 0-.17-.625 1.1 1.1 0 0 0-.48-.41 1.345 1.345 0 0 0-.62-.15 1.345 1.345 0 0 0-.62.15 1.1 1.1 0 0 0-.48.41 1.185 1.185 0 0 0-.17.625 1.32 1.32 0 0 0 .255.695l.745.86h.54l.745-.86z"
        fill="#2F8D46"
      />
      <path
        d="M21.45 14.315a2.97 2.97 0 0 1-.065-.145A2.106 2.106 0 0 1 21.2 13.455v-1.37h.05c-.033-.164-.05-.33-.05-.5a3.576 3.576 0 0 1 .17-1.08A3.574 3.574 0 0 1 22.65 8.76c.1-.106.204-.206.314-.3A3.98 3.98 0 0 0 21.45 14.315zM2.55 14.315c.143.28.334.532.565.745A3.691 3.691 0 0 0 4.22 15.755a4.51 4.51 0 0 0 1.42.26c.26 0 .516-.022.77-.066a4.015 4.015 0 0 0 1.659-.755 3.87 3.87 0 0 0 .66-.65c.143-.188.27-.39.38-.601h.25c.11.21.237.413.38.601a3.87 3.87 0 0 0 .66.65 4.015 4.015 0 0 0 1.659.755c.254.044.51.066.77.066a4.51 4.51 0 0 0 1.42-.26 3.691 3.691 0 0 0 1.104-.695c.231-.213.422-.465.565-.745A2.97 2.97 0 0 0 14.023 14H9.977a2.97 2.97 0 0 0-.065-.145.27.27 0 0 1-.012-.065V12.13H2.8v1.325c0 .31.059.62.165.915a.27.27 0 0 1-.012.065 2.97 2.97 0 0 0-.065.145zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.5C6.753 21.5 2.5 17.247 2.5 12S6.753 2.5 12 2.5 21.5 6.753 21.5 12 17.247 21.5 12 21.5z"
        fill="#2F8D46"
      />
    </svg>
  );
}

// Official HackerRank logo — exact brand path from SimpleIcons
export function HackerRankIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <path
        d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 10.885 0 12S13.287 24 12 24C10.715 24 2.25 19.114 1.608 18 .963 16.886.963 7.116 1.608 6 2.25 4.886 10.715 0 12 0zm-2.692 6.357c-.72 0-1.08.366-1.08 1.098v1.055c-.637.029-1.155.042-1.553.042s-.71-.013-1.036-.042v-.897c0-.82-.37-1.23-1.11-1.23-.74 0-1.11.41-1.11 1.23V15.39c0 .733.369 1.1 1.107 1.1.738 0 1.108-.367 1.108-1.1V13.33c.294-.026.648-.04 1.062-.04.413 0 .927.014 1.54.04v2.058c0 .733.37 1.1 1.11 1.1.74 0 1.11-.367 1.11-1.1V7.455c0-.732-.37-1.098-1.11-1.098h.002zm5.424 0c-.836 0-1.72.37-2.65 1.108a1.06 1.06 0 0 0-.415.85c0 .626.278.938.833.938.25 0 .465-.064.647-.192.643-.453 1.202-.68 1.676-.68.473 0 .81.135 1.01.405.128.18.192.428.192.745v.362a4.83 4.83 0 0 0-.83-.07c-.766 0-1.387.188-1.866.566-.605.48-.908 1.147-.908 2.002 0 .812.244 1.465.73 1.963.487.497 1.116.746 1.888.746.724 0 1.283-.24 1.677-.72.026.347.098.587.215.72.117.133.315.2.594.2.645 0 .968-.362.968-1.085V9.433c0-.835-.247-1.49-.74-1.963-.493-.473-1.178-.71-2.054-.713h.033zm-.088 4.273c.42 0 .752.064.998.192v1.34c0 .388-.112.694-.337.918-.224.223-.514.335-.87.335a.993.993 0 0 1-.741-.31 1.11 1.11 0 0 1-.302-.789c0-.37.107-.659.32-.865.214-.207.53-.31.948-.32h-.016z"
        fill="#00EA64"
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
