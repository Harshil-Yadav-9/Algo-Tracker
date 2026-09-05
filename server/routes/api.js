// Main API Router with Database Persistence & Real-time Live Diff Support
import { Router } from 'express';
import { getCodeforcesData } from '../services/codeforcesService.js';
import { getLeetCodeData } from '../services/leetcodeService.js';
import { getAtCoderData } from '../services/atcoderService.js';
import { getCodeChefData } from '../services/codechefService.js';
import { getGFGData } from '../services/gfgService.js';
import { getHackerRankData } from '../services/hackerrankService.js';
import { getUpcomingContests } from '../services/contestService.js';
import { getPOTDData } from '../services/potdService.js';
import { authenticateUser, optionalAuth, JWT_SECRET } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { UserStore, ProblemStore } from '../config/db.js';

const router = Router();

// 1. Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Multi-Platform Live Sync (Clean per-user isolation in MongoDB & Universal Admin Explorer)
router.post('/sync', optionalAuth, async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const isExplorerMode = Boolean(isAdmin && req.body.isExplorer);

    let handlesToSync = {};

    if (req.user) {
      if (isAdmin) {
        // Superuser admin can sync any custom handle passed in request or their own
        handlesToSync = req.body.handles || req.user.handles || {};
      } else {
        // Regular user: strictly enforce their own bound handles in MongoDB
        if (req.body.handles && typeof req.body.handles === 'object') {
          const cleanIncoming = {
            codeforces: (req.body.handles.codeforces || '').trim(),
            leetcode: (req.body.handles.leetcode || '').trim(),
            atcoder: (req.body.handles.atcoder || '').trim(),
            codechef: (req.body.handles.codechef || '').trim(),
            gfg: (req.body.handles.gfg || '').trim(),
            hackerrank: (req.body.handles.hackerrank || '').trim()
          };
          // Update user's bound handles in DB
          await UserStore.updateById(req.user._id || req.user.id, { handles: cleanIncoming });
          handlesToSync = cleanIncoming;
        } else {
          handlesToSync = req.user.handles || {};
        }
      }
    } else {
      // Guest mode (unauthenticated): sync whatever handles were sent
      handlesToSync = req.body.handles || {};
    }

    const { codeforces, leetcode, atcoder, codechef, gfg, hackerrank } = handlesToSync;

    console.log(`Syncing for ${req.user?.email || 'Guest'} (Admin: ${isAdmin}, Explorer: ${isExplorerMode}):`, {
      codeforces, leetcode, atcoder, codechef, gfg, hackerrank
    });

    // Execute platform sync in parallel
    const [cfRes, lcRes, acRes, ccRes, gfgRes, hrRes] = await Promise.allSettled([
      codeforces ? getCodeforcesData(codeforces) : null,
      leetcode ? getLeetCodeData(leetcode) : null,
      atcoder ? getAtCoderData(atcoder) : null,
      codechef ? getCodeChefData(codechef) : null,
      gfg ? getGFGData(gfg) : null,
      hackerrank ? getHackerRankData(hackerrank) : null
    ]);

    const platformResults = {
      codeforces: cfRes.status === 'fulfilled' ? cfRes.value : null,
      leetcode: lcRes.status === 'fulfilled' ? lcRes.value : null,
      atcoder: acRes.status === 'fulfilled' ? acRes.value : null,
      codechef: ccRes.status === 'fulfilled' ? ccRes.value : null,
      gfg: gfgRes.status === 'fulfilled' ? gfgRes.value : null,
      hackerrank: hrRes.status === 'fulfilled' ? hrRes.value : null
    };

    // Aggregate stats across platforms
    let totalSolved = 0;
    let totalAttempted = 0;
    let totalSubmissions = 0;
    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    const allProblems = [];
    const aggregatedTags = {};
    const platformBreakdown = [];

    Object.entries(platformResults).forEach(([key, data]) => {
      if (data && data.success) {
        totalSolved += (data.stats?.totalSolved || 0);
        totalAttempted += (data.stats?.totalAttempted || 0);
        totalSubmissions += (data.stats?.totalSubmissions || 0);
        totalEasy += (data.stats?.easy || 0);
        totalMedium += (data.stats?.medium || 0);
        totalHard += (data.stats?.hard || 0);

        if (Array.isArray(data.problems)) {
          allProblems.push(...data.problems);
        }

        if (data.stats?.tags) {
          Object.entries(data.stats.tags).forEach(([tag, count]) => {
            const normalizedTag = normalizeTagName(tag);
            aggregatedTags[normalizedTag] = (aggregatedTags[normalizedTag] || 0) + count;
          });
        }

        platformBreakdown.push({
          key,
          name: data.platform,
          handle: data.handle,
          rating: data.rating || 0,
          maxRating: data.maxRating || 0,
          rank: data.rank || 'N/A',
          avatar: data.avatar || '',
          solved: data.stats?.totalSolved || 0,
          easy: data.stats?.easy || 0,
          medium: data.stats?.medium || 0,
          hard: data.stats?.hard || 0
        });
      }
    });

    // Sort all problems by timestamp descending
    allProblems.sort((a, b) => (b.timeSeconds || 0) - (a.timeSeconds || 0));

    // Sort aggregated concepts/tags by frequency
    const sortedConcepts = Object.entries(aggregatedTags)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Real-time diff calculation
    const newlySolved = [];

    if (req.user && !isExplorerMode) {
      const userId = req.user._id || req.user.id;
      const prevProblems = await ProblemStore.getUserProblems(userId);
      const prevSolvedSet = new Set(
        prevProblems.filter(p => p.verdict === 'Solved').map(p => `${p.platformKey}-${p.problemId}`)
      );

      // Check which incoming problems are newly solved
      if (prevSolvedSet.size > 0) {
        for (const p of allProblems) {
          const key = `${p.platformKey}-${p.problemId}`;
          if (p.verdict === 'Solved' && !prevSolvedSet.has(key)) {
            newlySolved.push(p);
          }
        }
      }

      // Clean Atomic Save: Replaces previous user problem records with fresh current submissions in MongoDB
      await ProblemStore.saveUserProblems(userId, allProblems);

      // Update user summary stats in MongoDB
      await UserStore.updateById(userId, {
        lastSyncStats: {
          totalSolved,
          totalAttempted,
          totalSubmissions,
          easy: totalEasy,
          medium: totalMedium,
          hard: totalHard
        },
        lastSyncedAt: new Date().toISOString()
      });
    }

    let refreshedToken = null;
    let userInfo = null;

    if (req.user) {
      const currentUserId = req.user._id || req.user.id;
      refreshedToken = jwt.sign(
        {
          id: currentUserId,
          email: req.user.email,
          role: req.user.role,
          lastHandles: handlesToSync
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      userInfo = {
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
        lastHandles: handlesToSync
      };
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      token: refreshedToken,
      lastHandles: handlesToSync,
      user: userInfo,
      summary: {
        totalSolved,
        totalAttempted,
        totalSubmissions,
        easy: totalEasy,
        medium: totalMedium,
        hard: totalHard,
        connectedPlatformsCount: platformBreakdown.length
      },
      platforms: platformResults,
      platformBreakdown,
      concepts: sortedConcepts,
      problems: allProblems,
      newlySolved
    });
  } catch (err) {
    console.error('Error in /api/sync:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Upcoming Contests
router.get('/contests', async (req, res) => {
  try {
    const contests = await getUpcomingContests();
    res.json({ success: true, count: contests.length, contests });
  } catch (err) {
    console.error('Error fetching contests:', err);
    res.status(500).json({ success: false, error: err.message, contests: [] });
  }
});

// 4. Problem of the Day (POTD)
router.get('/potd', async (req, res) => {
  try {
    const rating = parseInt(req.query.rating, 10) || 1200;
    const potdList = await getPOTDData(rating);
    res.json({ success: true, date: new Date().toISOString().split('T')[0], potd: potdList, potdList });
  } catch (err) {
    console.error('Error fetching POTD:', err);
    res.status(500).json({ success: false, error: err.message, potd: [], potdList: [] });
  }
});

// Helper: Normalize concept tag names across platforms
function normalizeTagName(tag) {
  const t = tag.trim();
  const lower = t.toLowerCase();

  if (lower.includes('dynamic programming') || lower === 'dp') return 'Dynamic Programming';
  if (lower.includes('graph') || lower.includes('dfs') || lower.includes('bfs') || lower.includes('shortest paths')) return 'Graphs & Trees';
  if (lower.includes('binary search')) return 'Binary Search';
  if (lower.includes('greedy')) return 'Greedy';
  if (lower.includes('math') || lower.includes('number theory') || lower.includes('combinatorics')) return 'Math & Number Theory';
  if (lower.includes('data structures') || lower.includes('dsu') || lower.includes('segment tree')) return 'Data Structures';
  if (lower.includes('string') || lower.includes('hashing')) return 'Strings & Hashing';
  if (lower.includes('bit') || lower.includes('bit manipulation')) return 'Bit Manipulation';
  if (lower.includes('two pointers') || lower.includes('sliding window')) return 'Two Pointers';
  if (lower.includes('sort') || lower.includes('sortings')) return 'Sorting & Searching';
  if (lower.includes('recursion') || lower.includes('backtracking')) return 'Recursion & Backtracking';

  // Capitalize title
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default router;
