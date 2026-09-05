// Contests Aggregator Service (Codeforces, LeetCode, AtCoder, CodeChef, HackerRank)
import * as cheerio from 'cheerio';

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
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000)
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
            type: c.type || 'Codeforces Round',
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
      }),
      signal: AbortSignal.timeout(6000)
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
              type: 'Weekly / Biweekly Contest',
              in24Hours: startTimeMs - now <= 24 * 3600 * 1000 && startTimeMs >= now
            });
          }
        });
    }
  } catch (err) {
    console.warn('Error fetching LeetCode contests:', err.message);
  }

  // 3. Fetch AtCoder Contests (Scraped from official upcoming schedule)
  try {
    const acHtml = await fetch('https://atcoder.jp/contests/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000)
    }).then(r => r.text());

    const $ = cheerio.load(acHtml);
    $('#contest-table-upcoming tbody tr').each((_, el) => {
      const timeStr = $(el).find('time.fixtime-full, time').first().text().trim();
      const a = $(el).find('a[href^="/contests/"]').last();
      const name = a.text().trim();
      const href = a.attr('href');
      const durationStr = $(el).find('td').eq(2).text().trim();

      if (name && href && timeStr) {
        const startTimeMs = new Date(timeStr).getTime();
        let durationSeconds = 7200;
        if (durationStr.includes(':')) {
          const [h, m] = durationStr.split(':').map(Number);
          durationSeconds = (h * 3600) + (m * 60);
        }
        const endTimeMs = startTimeMs + durationSeconds * 1000;
        const isOngoing = now >= startTimeMs && now < endTimeMs;

        allContests.push({
          id: `ac-${href.replace('/contests/', '')}`,
          platform: 'AtCoder',
          platformKey: 'atcoder',
          name,
          url: `https://atcoder.jp${href}`,
          registerUrl: `https://atcoder.jp${href}`,
          startTime: new Date(startTimeMs).toISOString(),
          startTimeMs,
          endTimeMs,
          durationSeconds,
          durationFormatted: formatDuration(durationSeconds),
          status: isOngoing ? 'ONGOING' : 'UPCOMING',
          type: 'AtCoder Rated Contest',
          in24Hours: startTimeMs - now <= 24 * 3600 * 1000 && startTimeMs >= now
        });
      }
    });
  } catch (err) {
    console.warn('Error fetching AtCoder contests:', err.message);
  }

  // 4. CodeChef Starters (Every Wednesday 20:00 IST / 14:30 UTC)
  try {
    for (let i = 0; i < 4; i++) {
      const target = new Date();
      target.setUTCDate(target.getUTCDate() + ((3 - target.getUTCDay() + 7) % 7) + (i * 7));
      target.setUTCHours(14, 30, 0, 0); // 20:00 IST = 14:30 UTC
      const startTimeMs = target.getTime();
      const durationSeconds = 7200; // 2 hours
      const endTimeMs = startTimeMs + durationSeconds * 1000;

      if (endTimeMs > now) {
        const isOngoing = now >= startTimeMs && now < endTimeMs;
        allContests.push({
          id: `cc-starters-w${i}`,
          platform: 'CodeChef',
          platformKey: 'codechef',
          name: i === 0 ? 'CodeChef Starters (Upcoming Wednesday)' : `CodeChef Starters Round (+${i} wk)`,
          url: 'https://www.codechef.com/contests',
          registerUrl: 'https://www.codechef.com/contests',
          startTime: new Date(startTimeMs).toISOString(),
          startTimeMs,
          endTimeMs,
          durationSeconds,
          durationFormatted: '2 hours',
          status: isOngoing ? 'ONGOING' : 'UPCOMING',
          type: 'Rated for All Divisions',
          in24Hours: startTimeMs - now <= 24 * 3600 * 1000 && startTimeMs >= now
        });
      }
    }
  } catch (err) {
    console.warn('Error generating CodeChef contests:', err.message);
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
