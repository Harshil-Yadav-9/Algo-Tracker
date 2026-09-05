// Problem of the Day (POTD) Aggregator Service
import * as cheerio from 'cheerio';

let potdCache = null;
let lastPOTDFetch = 0;
const POTD_CACHE_MS = 15 * 60 * 1000; // 15 mins cache

export async function getPOTDData(userRating = 1200) {
  const now = Date.now();
  if (potdCache && now - lastPOTDFetch < POTD_CACHE_MS) {
    return potdCache;
  }

  const potdList = [];

  // 1. LeetCode POTD
  try {
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        query: `
          query questionOfToday {
            activeDailyCodingChallengeQuestion {
              date
              link
              question {
                questionFrontendId
                title
                titleSlug
                difficulty
                topicTags {
                  name
                  slug
                }
              }
            }
          }
        `
      })
    }).then(r => r.json());

    const lcQ = lcRes.data?.activeDailyCodingChallengeQuestion;
    if (lcQ && lcQ.question) {
      potdList.push({
        id: 'potd-leetcode',
        platform: 'LeetCode',
        platformKey: 'leetcode',
        title: `#${lcQ.question.questionFrontendId} - ${lcQ.question.title}`,
        titleSlug: lcQ.question.titleSlug,
        url: `https://leetcode.com${lcQ.link}`,
        difficulty: lcQ.question.difficulty || 'Medium',
        rating: null,
        concepts: lcQ.question.topicTags?.map(t => t.name) || ['Algorithms'],
        date: lcQ.date,
        badgeColor: lcQ.question.difficulty === 'Easy' ? '#10b981' : lcQ.question.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'
      });
    }
  } catch (err) {
    console.warn('Error fetching LeetCode POTD:', err.message);
  }

  // 2. GeeksforGeeks POTD
  try {
    const gfgHtml = await fetch('https://www.geeksforgeeks.org/problem-of-the-day', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).then(r => r.text()).catch(() => '');

    let gfgTitle = 'GeeksforGeeks Daily Challenge';
    let gfgUrl = 'https://www.geeksforgeeks.org/problem-of-the-day';
    let gfgDiff = 'Medium';
    let gfgTags = ['Data Structures', 'GFG POTD'];

    if (gfgHtml) {
      const $ = cheerio.load(gfgHtml);
      const titleEl = $('h3, .problem-title, .potd-title, a[href*="/problems/"]').first();
      if (titleEl.text().trim()) {
        gfgTitle = titleEl.text().trim();
      }
      const href = $('a[href*="/problems/"]').first().attr('href');
      if (href) {
        gfgUrl = href.startsWith('http') ? href : `https://www.geeksforgeeks.org${href}`;
      }
    }

    potdList.push({
      id: 'potd-gfg',
      platform: 'GeeksforGeeks',
      platformKey: 'gfg',
      title: gfgTitle,
      url: gfgUrl,
      difficulty: gfgDiff,
      rating: null,
      concepts: gfgTags,
      date: new Date().toISOString().split('T')[0],
      badgeColor: '#22c55e'
    });
  } catch (err) {
    console.warn('Error fetching GFG POTD:', err.message);
  }

  // 3. Codeforces Daily Challenge (Curated smart recommendation based on CP rating)
  const targetRating = Math.max(800, Math.min(2400, Math.round((userRating + 100) / 100) * 100));
  
  // Rotating problem pool by day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  const cfChallengePool = [
    { title: 'Equal Candies', id: '1676B', rating: 800, diff: 'Easy', tags: ['greedy', 'math', 'implementation'], contest: '1676', index: 'B' },
    { title: 'Two Arrays and Swaps', id: '1353B', rating: 800, diff: 'Easy', tags: ['greedy', 'sortings'], contest: '1353', index: 'B' },
    { title: 'Divisibility Problem', id: '1328A', rating: 900, diff: 'Easy', tags: ['math'], contest: '1328', index: 'A' },
    { title: 'BerSU Ball', id: '489B', rating: 1200, diff: 'Medium', tags: ['dp', 'greedy', 'two pointers'], contest: '489', index: 'B' },
    { title: 'Registration System', id: '4C', rating: 1300, diff: 'Medium', tags: ['data structures', 'hashing'], contest: '4', index: 'C' },
    { title: 'K-th Not Divisible by n', id: '1352C', rating: 1200, diff: 'Medium', tags: ['binary search', 'math'], contest: '1352', index: 'C' },
    { title: 'Cut Ribbon', id: '189A', rating: 1300, diff: 'Medium', tags: ['dp'], contest: '189', index: 'A' },
    { title: 'Woodcutters', id: '545C', rating: 1500, diff: 'Medium', tags: ['dp', 'greedy'], contest: '545', index: 'C' },
    { title: 'T-primes', id: '230B', rating: 1300, diff: 'Medium', tags: ['math', 'number theory'], contest: '230', index: 'B' },
    { title: 'Party', id: '115A', rating: 900, diff: 'Easy', tags: ['dfs and similar', 'trees', 'graphs'], contest: '115', index: 'A' },
    { title: 'Learning Languages', id: '277A', rating: 1400, diff: 'Medium', tags: ['dsu', 'dfs and similar', 'graphs'], contest: '277', index: 'A' },
    { title: 'Vacations', id: '698A', rating: 1400, diff: 'Medium', tags: ['dp'], contest: '698', index: 'A' },
    { title: 'Maximum Substring', id: '1750B', rating: 900, diff: 'Easy', tags: ['greedy', 'strings'], contest: '1750', index: 'B' },
    { title: 'Valid BFS?', id: '1037D', rating: 1600, diff: 'Hard', tags: ['trees', 'graphs', 'shortest paths'], contest: '1037', index: 'D' },
    { title: 'Fox and Names', id: '510C', rating: 1600, diff: 'Hard', tags: ['topological sort', 'graphs'], contest: '510', index: 'C' },
    { title: 'Good Subarrays', id: '1398C', rating: 1600, diff: 'Hard', tags: ['data structures', 'math', 'prefix sums'], contest: '1398', index: 'C' }
  ];

  const matchedCf = cfChallengePool[dayOfYear % cfChallengePool.length];

  potdList.push({
    id: 'potd-codeforces',
    platform: 'Codeforces',
    platformKey: 'codeforces',
    title: `${matchedCf.id} - ${matchedCf.title}`,
    url: `https://codeforces.com/contest/${matchedCf.contest}/problem/${matchedCf.index}`,
    difficulty: matchedCf.diff,
    rating: matchedCf.rating,
    concepts: matchedCf.tags,
    date: new Date().toISOString().split('T')[0],
    badgeColor: '#3b82f6'
  });

  // 4. AtCoder Daily ABC Challenge
  potdList.push({
    id: 'potd-atcoder',
    platform: 'AtCoder',
    platformKey: 'atcoder',
    title: 'ABC Daily Practice: C - Problem Solving',
    url: 'https://atcoder.jp/contests/archive',
    difficulty: 'Medium',
    rating: 800,
    concepts: ['Implementation', 'Algorithms', 'AtCoder ABC'],
    date: new Date().toISOString().split('T')[0],
    badgeColor: '#8b5cf6'
  });

  potdCache = potdList;
  lastPOTDFetch = now;

  return potdList;
}
