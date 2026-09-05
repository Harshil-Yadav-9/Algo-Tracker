// Contests Aggregator Service (Codeforces, LeetCode, AtCoder, CodeChef, HackerRank)

let contestsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 mins cache

export async function getUpcomingContests() {
  const now = Date.now();
  if (contestsCache && now - lastFetchTime < CACHE_DURATION_MS) {
    return contestsCache;
  }

  const allContests = [];

  // 1. Fetch Codeforces Contests
  try {
    const cfRes = await fetch('https://codeforces.com/api/contest.list?gym=false', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).then(r => r.json());

    if (cfRes.status === 'OK' && Array.isArray(cfRes.result)) {
      cfRes.result
        .filter(c => c.phase === 'BEFORE' || c.phase === 'CODING')
        .forEach(c => {
          const startTimeMs = c.startTimeSeconds * 1000;
          const durationSeconds = c.durationSeconds || 7200;
          const endTimeMs = startTimeMs + durationSeconds * 1000;
          const isOngoing = now >= startTimeMs && now < endTimeMs;

          allContests.push({
            id: `cf-${c.id}`,
            platform: 'Codeforces',
            platformKey: 'codeforces',
            name: c.name,
            url: `https://codeforces.com/contest/${c.id}`,
            registerUrl: `https://codeforces.com/contestRegistration/${c.id}`,
            startTime: new Date(startTimeMs).toISOString(),
            startTimeMs,
            endTimeMs,
            durationSeconds,
            durationFormatted: formatDuration(durationSeconds),
            status: isOngoing ? 'ONGOING' : 'UPCOMING',
            type: c.type || 'CF',
            in24Hours: startTimeMs - now <= 24 * 3600 * 1000 && startTimeMs >= now
          });
        });
    }
  } catch (err) {
    console.warn('Error fetching Codeforces contests:', err.message);
  }

  // 2. Fetch LeetCode Contests via GraphQL
  try {
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({
        query: `
          query {
            allContests {
              title
              titleSlug
              startTime
              duration
              originStartTime
              isVirtual
            }
          }
        `
      })
    }).then(r => r.json()).catch(() => null);

    if (lcRes?.data?.allContests && Array.isArray(lcRes.data.allContests)) {
      lcRes.data.allContests
        .filter(c => !c.isVirtual)
        .forEach(c => {
          const startTimeMs = (c.startTime || c.originStartTime) * 1000;
          const durationSeconds = c.duration || 5400; // 90 mins
          const endTimeMs = startTimeMs + durationSeconds * 1000;

          if (endTimeMs > now) {
            const isOngoing = now >= startTimeMs && now < endTimeMs;
            allContests.push({
              id: `lc-${c.titleSlug}`,
              platform: 'LeetCode',
              platformKey: 'leetcode',
              name: c.title,
              url: `https://leetcode.com/contest/${c.titleSlug}/`,
              registerUrl: `https://leetcode.com/contest/${c.titleSlug}/`,
              startTime: new Date(startTimeMs).toISOString(),
              startTimeMs,
              endTimeMs,
              durationSeconds,
              durationFormatted: formatDuration(durationSeconds),
              status: isOngoing ? 'ONGOING' : 'UPCOMING',
              type: 'LeetCode Weekly/Biweekly',
              in24Hours: startTimeMs - now <= 24 * 3600 * 1000 && startTimeMs >= now
            });
          }
        });
    }
  } catch (err) {
    console.warn('Error fetching LeetCode contests:', err.message);
  }

  // 3. Kontests API / AtCoder & CodeChef fallback
  try {
    const kontests = await fetch('https://kontests.net/api/v1/all', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).then(r => r.json()).catch(() => null);

    if (Array.isArray(kontests)) {
      kontests.forEach((k, idx) => {
        const startTimeMs = new Date(k.start_time).getTime();
        const endTimeMs = new Date(k.end_time).getTime();
        const durationSeconds = parseInt(k.duration, 10) || Math.round((endTimeMs - startTimeMs) / 1000);

        if (endTimeMs > now) {
          const site = k.site || 'Other';
          let platform = site;
          let platformKey = site.toLowerCase().replace(/\s+/g, '');

          if (/codeforces/i.test(site)) return; // Already fetched directly
          if (/leetcode/i.test(site)) return; // Already fetched directly
          if (/atcoder/i.test(site)) { platform = 'AtCoder'; platformKey = 'atcoder'; }
          if (/codechef/i.test(site)) { platform = 'CodeChef'; platformKey = 'codechef'; }
          if (/hackerrank/i.test(site)) { platform = 'HackerRank'; platformKey = 'hackerrank'; }

          const isOngoing = now >= startTimeMs && now < endTimeMs;

          allContests.push({
            id: `k-${platformKey}-${idx}`,
            platform,
            platformKey,
            name: k.name,
            url: k.url,
            registerUrl: k.url,
            startTime: new Date(startTimeMs).toISOString(),
            startTimeMs,
            endTimeMs,
            durationSeconds,
            durationFormatted: formatDuration(durationSeconds),
            status: isOngoing ? 'ONGOING' : 'UPCOMING',
            type: platform,
            in24Hours: startTimeMs - now <= 24 * 3600 * 1000 && startTimeMs >= now
          });
        }
      });
    }
  } catch (err) {
    console.warn('Kontests API fetch error:', err.message);
  }

  // Sort contests by start time ascending
  allContests.sort((a, b) => a.startTimeMs - b.startTimeMs);

  contestsCache = allContests;
  lastFetchTime = now;

  return allContests;
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '2 hours';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours} hours`;
  return `${minutes} mins`;
}
