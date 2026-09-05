// Codeforces API Service
const CF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9'
};

async function fetchCfJson(url) {
  const res = await fetch(url, { headers: CF_HEADERS });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Codeforces API HTTP ${res.status}: ${text.slice(0, 100)}`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON response from Codeforces: ${text.slice(0, 100)}`);
  }
}

export async function getCodeforcesData(handle) {
  if (!handle) return null;
  const cleanedHandle = handle.trim();
  
  try {
    // 1. Fetch User Info
    const userRes = await fetchCfJson(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(cleanedHandle)}`);

    if (userRes.status !== 'OK' || !userRes.result || userRes.result.length === 0) {
      throw new Error(`Codeforces user not found: ${cleanedHandle}`);
    }

    const u = userRes.result[0];

    // 2. Fetch ALL User Submissions (omit from & count to fetch complete submission history)
    let submissions = [];
    try {
      const subsRes = await fetchCfJson(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(cleanedHandle)}`);

      if (subsRes.status === 'OK' && Array.isArray(subsRes.result)) {
        submissions = subsRes.result;
      }
    } catch (err) {
      console.warn('CF submissions fetch error:', err.message);
    }

    // Process problems: aggregate solved and attempted
    const solvedMap = new Map();
    const attemptedMap = new Map();
    const uniqueProblemsMap = new Map();
    const tagCountMap = {};
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    // Submissions from Codeforces API are ordered from newest to oldest
    for (const sub of submissions) {
      if (!sub.problem || !sub.problem.name) continue;

      const problemKey = `${sub.problem.contestId || 'C'}-${sub.problem.index || 'X'}-${sub.problem.name}`;
      const isAccepted = sub.verdict === 'OK';
      const rating = sub.problem.rating || 0;
      
      // Determine difficulty level based on CF rating
      let difficulty = 'Medium';
      if (rating > 0) {
        if (rating < 1400) {
          difficulty = 'Easy';
        } else if (rating <= 1900) {
          difficulty = 'Medium';
        } else {
          difficulty = 'Hard';
        }
      } else {
        // Fallback for unrated problems by index
        const idx = (sub.problem.index || 'A').toUpperCase();
        if (idx === 'A' || idx === 'B') difficulty = 'Easy';
        else if (idx === 'C' || idx === 'D') difficulty = 'Medium';
        else difficulty = 'Hard';
      }

      const tags = sub.problem.tags && sub.problem.tags.length > 0 
        ? sub.problem.tags 
        : ['Competitive Programming'];

      if (isAccepted) {
        if (!solvedMap.has(problemKey)) {
          solvedMap.set(problemKey, sub);
          
          if (difficulty === 'Easy') easyCount++;
          else if (difficulty === 'Medium') mediumCount++;
          else hardCount++;

          tags.forEach(tag => {
            tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
          });
        }
      } else {
        if (!attemptedMap.has(problemKey) && !solvedMap.has(problemKey)) {
          attemptedMap.set(problemKey, sub);
        }
      }

      // Deduplicate for problem explorer: keep the most relevant/latest submission per unique problem
      if (!uniqueProblemsMap.has(problemKey)) {
        uniqueProblemsMap.set(problemKey, {
          id: `cf-${sub.problem.contestId || 'C'}-${sub.problem.index || 'X'}`,
          platform: 'Codeforces',
          platformKey: 'codeforces',
          problemId: `${sub.problem.contestId || ''}${sub.problem.index || ''}`,
          title: sub.problem.name,
          url: sub.problem.contestId 
            ? `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`
            : `https://codeforces.com/problemset/problem/${sub.problem.contestId}/${sub.problem.index}`,
          submissionUrl: `https://codeforces.com/contest/${sub.problem.contestId}/submission/${sub.id}`,
          rating: rating || null,
          difficulty: difficulty,
          concepts: tags,
          verdict: isAccepted ? 'Solved' : 'Attempted',
          rawVerdict: sub.verdict || 'UNKNOWN',
          passedTestCount: sub.passedTestCount || (isAccepted ? 1 : 0),
          programmingLanguage: sub.programmingLanguage || 'C++',
          timeSeconds: sub.creationTimeSeconds || Math.floor(Date.now() / 1000),
          date: new Date((sub.creationTimeSeconds || Date.now() / 1000) * 1000).toISOString()
        });
      } else {
        // If we previously recorded an Attempted entry but this submission is Accepted, update to Solved
        const existing = uniqueProblemsMap.get(problemKey);
        if (isAccepted && existing.verdict !== 'Solved') {
          existing.verdict = 'Solved';
          existing.rawVerdict = 'OK';
          existing.submissionUrl = `https://codeforces.com/contest/${sub.problem.contestId}/submission/${sub.id}`;
          existing.passedTestCount = sub.passedTestCount || 1;
          existing.programmingLanguage = sub.programmingLanguage || existing.programmingLanguage;
        }
      }
    }

    // Clean up attemptedMap in case a problem was solved in an earlier submission
    for (const k of solvedMap.keys()) {
      attemptedMap.delete(k);
    }

    const normalizedProblems = Array.from(uniqueProblemsMap.values());

    return {
      success: true,
      platform: 'Codeforces',
      handle: u.handle,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.handle,
      avatar: u.titlePhoto || u.avatar || 'https://userpic.codeforces.org/no-avatar.jpg',
      rating: u.rating || 0,
      maxRating: u.maxRating || 0,
      rank: u.rank || 'unrated',
      maxRank: u.maxRank || 'unrated',
      contribution: u.contribution || 0,
      friendOfCount: u.friendOfCount || 0,
      organization: u.organization || '',
      country: u.country || '',
      stats: {
        totalSolved: solvedMap.size,
        totalAttempted: attemptedMap.size,
        totalSubmissions: submissions.length,
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
        tags: tagCountMap
      },
      problems: normalizedProblems
    };
  } catch (err) {
    console.error(`Error fetching Codeforces for ${handle}:`, err.message);
    return {
      success: false,
      platform: 'Codeforces',
      handle,
      error: err.message,
      rating: 0,
      maxRating: 0,
      rank: 'unrated',
      stats: { totalSolved: 0, totalAttempted: 0, totalSubmissions: 0, easy: 0, medium: 0, hard: 0, tags: {} },
      problems: []
    };
  }
}
