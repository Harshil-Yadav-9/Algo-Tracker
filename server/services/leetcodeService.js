// LeetCode GraphQL API Service
export async function getLeetCodeData(username) {
  if (!username) return null;
  const cleanedUsername = username.trim();

  try {
    const query = `
      query getLeetCodeProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            userAvatar
            realName
            aboutMe
            reputation
            countryName
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          tagProblemCounts {
            advanced {
              tagName
              tagSlug
              problemsSolved
            }
            intermediate {
              tagName
              tagSlug
              problemsSolved
            }
            fundamental {
              tagName
              tagSlug
              problemsSolved
            }
          }
          submissionCalendar
        }
        userContestRanking(username: $username) {
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
        recentAcSubmissionList(username: $username, limit: 50) {
          id
          title
          titleSlug
          timestamp
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({
        query,
        variables: { username: cleanedUsername }
      })
    }).then(r => r.json());

    if (!response.data || !response.data.matchedUser) {
      throw new Error(`LeetCode user not found: ${cleanedUsername}`);
    }

    const matched = response.data.matchedUser;
    const contest = response.data.userContestRanking || {};
    const acStats = matched.submitStatsGlobal?.acSubmissionNum || [];
    const totalStats = matched.submitStatsGlobal?.totalSubmissionNum || [];

    const getDiffCount = (stats, diff) => {
      const item = stats.find(s => s.difficulty.toLowerCase() === diff.toLowerCase());
      return item ? item.count : 0;
    };

    const totalSolved = getDiffCount(acStats, 'all');
    const easyCount = getDiffCount(acStats, 'easy');
    const mediumCount = getDiffCount(acStats, 'medium');
    const hardCount = getDiffCount(acStats, 'hard');

    const totalSubmissions = getDiffCount(totalStats, 'all');

    // Aggregate tags from tagProblemCounts
    const tagCountMap = {};
    const tagCategories = matched.tagProblemCounts || {};
    ['fundamental', 'intermediate', 'advanced'].forEach(cat => {
      if (Array.isArray(tagCategories[cat])) {
        tagCategories[cat].forEach(t => {
          if (t.problemsSolved > 0) {
            tagCountMap[t.tagName] = (tagCountMap[t.tagName] || 0) + t.problemsSolved;
          }
        });
      }
    });

    // Process recent submissions into normalized format
    const recentAc = response.data.recentAcSubmissionList || [];
    const normalizedProblems = recentAc.map(sub => {
      const timestamp = parseInt(sub.timestamp, 10);
      return {
        id: `lc-${sub.id || sub.titleSlug}`,
        platform: 'LeetCode',
        platformKey: 'leetcode',
        problemId: sub.titleSlug,
        title: sub.title,
        url: `https://leetcode.com/problems/${sub.titleSlug}/`,
        submissionUrl: `https://leetcode.com/submissions/detail/${sub.id}/`,
        rating: null,
        difficulty: 'Medium', // Default if not individual metadata
        concepts: ['Algorithms', 'Data Structures'],
        verdict: 'Solved',
        rawVerdict: 'Accepted',
        passedTestCount: 1,
        programmingLanguage: 'Language',
        timeSeconds: timestamp,
        date: new Date(timestamp * 1000).toISOString()
      };
    });

    // Rating tier determination
    const ratingVal = Math.round(contest.rating || 0);
    let badgeTier = 'Participant';
    if (ratingVal >= 2200) badgeTier = 'Guardian';
    else if (ratingVal >= 1900) badgeTier = 'Knight';
    else if (ratingVal >= 1600) badgeTier = 'Specialist';
    else if (ratingVal > 0) badgeTier = 'Contestant';

    return {
      success: true,
      platform: 'LeetCode',
      handle: matched.username,
      name: matched.profile?.realName || matched.username,
      avatar: matched.profile?.userAvatar || 'https://assets.leetcode.com/users/default_avatar.jpg',
      rating: ratingVal,
      maxRating: ratingVal,
      rank: contest.badge?.name || badgeTier,
      globalRank: contest.globalRanking || matched.profile?.ranking || 0,
      totalParticipants: contest.totalParticipants || 0,
      topPercentage: contest.topPercentage || 0,
      submissionCalendar: matched.submissionCalendar || '{}',
      stats: {
        totalSolved,
        totalAttempted: Math.max(0, totalSubmissions - totalSolved),
        totalSubmissions,
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
        tags: tagCountMap
      },
      problems: normalizedProblems
    };
  } catch (err) {
    console.error(`Error fetching LeetCode for ${username}:`, err.message);
    return {
      success: false,
      platform: 'LeetCode',
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
