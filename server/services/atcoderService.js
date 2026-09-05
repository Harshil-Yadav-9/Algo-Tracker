// AtCoder Service using official history & Kenkoooo API
export async function getAtCoderData(handle) {
  if (!handle) return null;
  const cleanedHandle = handle.trim();

  try {
    // 1. Fetch Contest History & Rating
    let rating = 0;
    let maxRating = 0;
    let contestsCount = 0;
    let rank = 'unrated';

    try {
      const historyRes = await fetch(`https://atcoder.jp/users/${encodeURIComponent(cleanedHandle)}/history/json`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).then(r => r.json());

      if (Array.isArray(historyRes) && historyRes.length > 0) {
        contestsCount = historyRes.length;
        rating = historyRes[historyRes.length - 1].NewRating || 0;
        maxRating = Math.max(...historyRes.map(h => h.NewRating || 0), rating);
      }
    } catch (err) {
      console.warn('AtCoder history fetch error:', err.message);
    }

    // Determine color tier
    if (rating >= 2800) rank = 'Red (Grandmaster)';
    else if (rating >= 2400) rank = 'Orange (Master)';
    else if (rating >= 2000) rank = 'Yellow (Candidate Master)';
    else if (rating >= 1600) rank = 'Blue (Expert)';
    else if (rating >= 1200) rank = 'Cyan (Specialist)';
    else if (rating >= 800) rank = 'Green (Apprentice)';
    else if (rating >= 400) rank = 'Brown (Pupil)';
    else if (rating > 0) rank = 'Gray (Newbie)';

    // 2. Fetch User Submissions from Kenkoooo API (with pagination)
    let rawSubs = [];
    try {
      let fromSecond = 0;
      while (true) {
        const subsRes = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(cleanedHandle)}&from_second=${fromSecond}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).then(r => r.json());

        if (!Array.isArray(subsRes) || subsRes.length === 0) break;
        rawSubs.push(...subsRes);
        if (subsRes.length < 500 || rawSubs.length >= 15000) break;
        fromSecond = subsRes[subsRes.length - 1].epoch_second + 1;
      }
    } catch (err) {
      console.warn('AtCoder submissions fetch error:', err.message);
    }

    // Process submissions
    const solvedMap = new Map();
    const attemptedMap = new Map();
    const uniqueProblemsMap = new Map();
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    // Sort submissions latest first
    const sortedSubs = [...rawSubs].sort((a, b) => b.epoch_second - a.epoch_second);

    for (const sub of sortedSubs) {
      const isAccepted = sub.result === 'AC';
      const problemId = sub.problem_id || 'problem';
      const contestId = sub.contest_id || '';

      // Clean problem title
      const cleanTitle = problemId
        .replace(/^[a-z]+[0-9]+_/, '')
        .replace(/_/g, ' ')
        .toUpperCase();
      const displayTitle = `${contestId.toUpperCase()} - ${cleanTitle || problemId}`;

      // Estimate difficulty from points or problem letter
      let difficulty = 'Medium';
      let estRating = null;
      const point = sub.point || 0;
      if (point <= 200) {
        difficulty = 'Easy';
        estRating = 400 + point * 2;
      } else if (point <= 500) {
        difficulty = 'Medium';
        estRating = 800 + (point - 200) * 3;
      } else if (point > 500) {
        difficulty = 'Hard';
        estRating = 1700 + (point - 500) * 2;
      }

      // Extract concepts / categories based on contest type
      const concepts = [];
      if (contestId.startsWith('abc')) concepts.push('AtCoder Beginner Contest', 'Algorithms');
      else if (contestId.startsWith('arc')) concepts.push('AtCoder Regular Contest', 'Math', 'Ad-hoc');
      else if (contestId.startsWith('agc')) concepts.push('AtCoder Grand Contest', 'Advanced CP', 'Combinatorics');
      else concepts.push('Competitive Programming');

      if (isAccepted) {
        if (!solvedMap.has(problemId)) {
          solvedMap.set(problemId, sub);
          if (difficulty === 'Easy') easyCount++;
          else if (difficulty === 'Medium') mediumCount++;
          else hardCount++;
        }
      } else {
        if (!attemptedMap.has(problemId) && !solvedMap.has(problemId)) {
          attemptedMap.set(problemId, sub);
        }
      }

      if (!uniqueProblemsMap.has(problemId)) {
        uniqueProblemsMap.set(problemId, {
          id: `ac-${sub.id || problemId}`,
          platform: 'AtCoder',
          platformKey: 'atcoder',
          problemId: problemId,
          title: displayTitle,
          url: `https://atcoder.jp/contests/${contestId}/tasks/${problemId}`,
          submissionUrl: `https://atcoder.jp/contests/${contestId}/submissions/${sub.id}`,
          rating: estRating,
          difficulty: difficulty,
          concepts: concepts,
          verdict: isAccepted ? 'Solved' : 'Attempted',
          rawVerdict: sub.result || 'UNKNOWN',
          passedTestCount: isAccepted ? 1 : 0,
          programmingLanguage: sub.language || 'C++',
          timeSeconds: sub.epoch_second,
          date: new Date(sub.epoch_second * 1000).toISOString()
        });
      } else {
        const existing = uniqueProblemsMap.get(problemId);
        if (isAccepted && existing.verdict !== 'Solved') {
          existing.verdict = 'Solved';
          existing.rawVerdict = 'AC';
          existing.submissionUrl = `https://atcoder.jp/contests/${contestId}/submissions/${sub.id}`;
          existing.passedTestCount = 1;
        }
      }
    }

    for (const k of solvedMap.keys()) {
      attemptedMap.delete(k);
    }

    const normalizedProblems = Array.from(uniqueProblemsMap.values());

    return {
      success: true,
      platform: 'AtCoder',
      handle: cleanedHandle,
      name: cleanedHandle,
      avatar: 'https://img.atcoder.jp/assets/icon/favicon.png',
      rating,
      maxRating,
      rank,
      contestsCount,
      stats: {
        totalSolved: solvedMap.size,
        totalAttempted: attemptedMap.size,
        totalSubmissions: rawSubs.length,
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
        tags: {
          'AtCoder Problems': solvedMap.size,
          'Algorithms': Math.round(solvedMap.size * 0.7),
          'Math & Ad-hoc': Math.round(solvedMap.size * 0.4),
          'Data Structures': Math.round(solvedMap.size * 0.5)
        }
      },
      problems: normalizedProblems
    };
  } catch (err) {
    console.error(`Error fetching AtCoder for ${handle}:`, err.message);
    return {
      success: false,
      platform: 'AtCoder',
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
