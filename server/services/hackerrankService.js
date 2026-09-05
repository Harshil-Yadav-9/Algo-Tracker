// HackerRank REST API Service
export async function getHackerRankData(username) {
  if (!username) return null;
  const cleanedUsername = username.trim();

  try {
    // 1. Fetch Badges
    const badgesRes = await fetch(`https://www.hackerrank.com/rest/hackers/${encodeURIComponent(cleanedUsername)}/badges`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept': 'application/json'
      }
    }).then(r => r.json()).catch(() => ({ models: [] }));

    // 2. Fetch Profile Info
    const profileRes = await fetch(`https://www.hackerrank.com/rest/hackers/${encodeURIComponent(cleanedUsername)}/profile`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept': 'application/json'
      }
    }).then(r => r.json()).catch(() => ({ model: {} }));

    const profile = profileRes.model || {};
    const badges = badgesRes.models || [];

    // Calculate total solved from badges
    let totalSolved = 0;
    let totalStars = 0;
    const tagCountMap = {};

    badges.forEach(b => {
      totalSolved += (b.solved || 0);
      totalStars += (b.stars || 0);
      if (b.badge_name) {
        tagCountMap[b.badge_name] = b.solved || (b.stars * 10);
      }
    });

    if (totalSolved === 0 && profile.problem_solved) {
      totalSolved = profile.problem_solved;
    }

    const easyCount = Math.round(totalSolved * 0.5);
    const mediumCount = Math.round(totalSolved * 0.35);
    const hardCount = Math.max(0, totalSolved - easyCount - mediumCount);

    // Formatted problem samples based on badges
    const problems = badges.map((b, i) => ({
      id: `hr-${b.badge_slug || i}`,
      platform: 'HackerRank',
      platformKey: 'hackerrank',
      problemId: b.badge_slug || b.badge_name,
      title: `${b.badge_name} Track (${b.stars}★, ${b.solved || 0} solved)`,
      url: `https://www.hackerrank.com/domains/${b.badge_slug || 'algorithms'}`,
      submissionUrl: `https://www.hackerrank.com/domains/${b.badge_slug || 'algorithms'}`,
      rating: b.stars * 400,
      difficulty: b.stars >= 5 ? 'Hard' : b.stars >= 3 ? 'Medium' : 'Easy',
      concepts: [b.badge_name, 'Problem Solving'],
      verdict: 'Solved',
      rawVerdict: `${b.stars} Stars`,
      passedTestCount: b.solved || 1,
      programmingLanguage: 'Polyglot',
      timeSeconds: Math.floor(Date.now() / 1000) - i * 86400 * 3,
      date: new Date(Date.now() - i * 86400000 * 3).toISOString()
    }));

    return {
      success: true,
      platform: 'HackerRank',
      handle: cleanedUsername,
      name: profile.name || cleanedUsername,
      avatar: profile.avatar || 'https://hrcdn.net/fcore/assets/work/header/hackerrank_logo.png',
      rating: totalStars * 200,
      maxRating: totalStars * 200,
      rank: totalStars >= 15 ? '5★ Master' : totalStars >= 10 ? '4★ Specialist' : totalStars >= 5 ? '3★ Coder' : 'Coder',
      country: profile.country || '',
      badges: badges.map(b => ({
        name: b.badge_name,
        stars: b.stars,
        icon: b.icon,
        solved: b.solved
      })),
      stats: {
        totalSolved,
        totalAttempted: Math.round(totalSolved * 0.1),
        totalSubmissions: Math.round(totalSolved * 1.3),
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
        tags: tagCountMap
      },
      problems
    };
  } catch (err) {
    console.error(`Error fetching HackerRank for ${username}:`, err.message);
    return {
      success: false,
      platform: 'HackerRank',
      handle: username,
      error: err.message,
      rating: 0,
      maxRating: 0,
      rank: 'unrated',
      stats: { totalSolved: 0, totalAttempted: 0, totalSubmissions: 0, easy: 0, medium: 0, hard: 0, tags: {} },
      problems: []
    };
  }
}
