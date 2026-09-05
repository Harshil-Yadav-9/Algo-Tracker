// Robust Platform Bio / Profile Verification Service
import * as cheerio from 'cheerio';
import crypto from 'crypto';

// In-memory verification token cache with 60-second TTL
const activeTokens = new Map();

/**
 * Generate a unique, strong verification token valid for 60 seconds
 */
export function generateVerificationSession(userId, platform, handle) {
  const cleanPlatform = platform.toLowerCase().trim();
  const cleanHandle = handle.trim();
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  const token = `algo-${cleanPlatform.slice(0, 2)}-${randomSuffix}-${Date.now().toString().slice(-4)}`;
  
  const sessionKey = `${userId}:${cleanPlatform}:${cleanHandle.toLowerCase()}`;
  const expiresAt = Date.now() + 60 * 1000; // 60 seconds from now

  const sessionData = {
    userId,
    platform: cleanPlatform,
    handle: cleanHandle,
    token,
    expiresAt
  };

  activeTokens.set(sessionKey, sessionData);

  // Platform-specific instructions and settings URLs
  const instructions = getPlatformInstructions(cleanPlatform, cleanHandle, token);

  return {
    success: true,
    token,
    expiresAt,
    expiresInSeconds: 60,
    instructions
  };
}

/**
 * Retrieve instructions and direct profile edit URL for each platform
 */
export function getPlatformInstructions(platform, handle, token) {
  switch (platform) {
    case 'codeforces':
      return {
        platformName: 'Codeforces',
        settingsUrl: 'https://codeforces.com/settings/social',
        targetField: 'Organization OR First Name',
        steps: [
          `1. Open Codeforces Settings: https://codeforces.com/settings/social`,
          `2. In the "Organization" (or "First name in English") field, temporarily paste this code: ${token}`,
          `3. Click "Save changes" at the bottom of the page.`,
          `4. Return here and click "VERIFY & LINK HANDLE" within 60 seconds.`,
          `5. Once verified, you can immediately remove the code from your Codeforces profile.`
        ]
      };
    case 'leetcode':
      return {
        platformName: 'LeetCode',
        settingsUrl: 'https://leetcode.com/profile/',
        targetField: 'Summary / About Me OR Name',
        steps: [
          `1. Open LeetCode Profile: https://leetcode.com/profile/`,
          `2. In the "Summary / About Me" (or "Name") field, paste this code: ${token}`,
          `3. Click "Save" at the bottom of the LeetCode edit box.`,
          `4. Return here and click "VERIFY & LINK HANDLE" within 60 seconds.`,
          `5. Once verified, you can immediately remove the code from your LeetCode bio.`
        ]
      };
    case 'codechef':
      return {
        platformName: 'CodeChef',
        settingsUrl: `https://www.codechef.com/users/${encodeURIComponent(handle)}`,
        targetField: 'Occupation / Institution / About Me',
        steps: [
          `1. Open CodeChef Profile: https://www.codechef.com/users/${encodeURIComponent(handle)}`,
          `2. Click "Edit Profile" and in "Occupation", "Institution" or "About Me", paste: ${token}`,
          `3. Click "Save Profile Changes".`,
          `4. Return here and click "VERIFY & LINK HANDLE" within 60 seconds.`,
          `5. Once verified, you can remove the code from your CodeChef profile.`
        ]
      };
    case 'atcoder':
      return {
        platformName: 'AtCoder',
        settingsUrl: 'https://atcoder.jp/settings',
        targetField: 'Affiliation / Country / Occupation',
        steps: [
          `1. Open AtCoder Settings: https://atcoder.jp/settings`,
          `2. In the "Affiliation" field, paste this code: ${token}`,
          `3. Click "Submit" to save.`,
          `4. Return here and click "VERIFY & LINK HANDLE" within 60 seconds.`,
          `5. Once verified, you can remove the code from AtCoder settings.`
        ]
      };
    case 'gfg':
      return {
        platformName: 'GeeksforGeeks',
        settingsUrl: `https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`,
        targetField: 'Institution / Bio',
        steps: [
          `1. Open your GeeksforGeeks profile: https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`,
          `2. Click "Edit Profile" and in "Institution" or "Bio", paste: ${token}`,
          `3. Click "Save".`,
          `4. Return here and click "VERIFY & LINK HANDLE" within 60 seconds.`,
          `5. Once verified, you can remove the code from your GFG bio.`
        ]
      };
    case 'hackerrank':
      return {
        platformName: 'HackerRank',
        settingsUrl: 'https://www.hackerrank.com/settings/profile',
        targetField: 'Bio / Headline / School',
        steps: [
          `1. Open HackerRank Profile Settings: https://www.hackerrank.com/settings/profile`,
          `2. In the "Bio" or "Headline" field, paste this code: ${token}`,
          `3. Click "Save Changes".`,
          `4. Return here and click "VERIFY & LINK HANDLE" within 60 seconds.`,
          `5. Once verified, you can remove the code from your HackerRank bio.`
        ]
      };
    default:
      return {
        platformName: platform,
        settingsUrl: '',
        targetField: 'Bio',
        steps: [`Add verification code ${token} into your profile bio and click Verify.`]
      };
  }
}

/**
 * Verify that the unique token exists on the live platform profile
 */
export async function verifyPlatformBioLive(userId, platform, handle) {
  const cleanPlatform = platform.toLowerCase().trim();
  const cleanHandle = handle.trim();
  const sessionKey = `${userId}:${cleanPlatform}:${cleanHandle.toLowerCase()}`;

  const session = activeTokens.get(sessionKey);
  if (!session) {
    return {
      success: false,
      error: 'No active verification session found. Please click "GENERATE CODE" to start a new 60-second verification.'
    };
  }

  // Check 60s expiration
  if (Date.now() > session.expiresAt) {
    activeTokens.delete(sessionKey);
    return {
      success: false,
      error: 'Verification session expired (1 minute limit exceeded). Please generate a new code and try again.'
    };
  }

  const expectedToken = session.token.toLowerCase();

  try {
    let foundInBio = false;
    let fetchedContentPreview = '';

    // 1. Codeforces live verification
    if (cleanPlatform === 'codeforces') {
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(cleanHandle)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).then(r => r.json());

      if (res.status !== 'OK' || !res.result || res.result.length === 0) {
        return { success: false, error: `Codeforces handle "@${cleanHandle}" not found.` };
      }

      const u = res.result[0];
      const combinedFields = [
        u.organization || '',
        u.firstName || '',
        u.lastName || '',
        u.city || '',
        u.country || ''
      ].join(' ').toLowerCase();

      fetchedContentPreview = combinedFields;
      foundInBio = combinedFields.includes(expectedToken);
    }

    // 2. LeetCode live verification
    else if (cleanPlatform === 'leetcode') {
      const query = `
        query getProfileBio($username: String!) {
          matchedUser(username: $username) {
            profile {
              aboutMe
              realName
            }
          }
        }
      `;

      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({ query, variables: { username: cleanHandle } })
      }).then(r => r.json());

      if (!res.data || !res.data.matchedUser) {
        return { success: false, error: `LeetCode handle "@${cleanHandle}" not found.` };
      }

      const prof = res.data.matchedUser.profile || {};
      const combined = `${prof.aboutMe || ''} ${prof.realName || ''}`.toLowerCase();
      fetchedContentPreview = combined;
      foundInBio = combined.includes(expectedToken);
    }

    // 3. CodeChef live verification
    else if (cleanPlatform === 'codechef') {
      const html = await fetch(`https://www.codechef.com/users/${encodeURIComponent(cleanHandle)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).then(r => r.text());

      const lowerHtml = html.toLowerCase();
      fetchedContentPreview = lowerHtml.slice(0, 500);
      foundInBio = lowerHtml.includes(expectedToken);
    }

    // 4. AtCoder live verification
    else if (cleanPlatform === 'atcoder') {
      const html = await fetch(`https://atcoder.jp/users/${encodeURIComponent(cleanHandle)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).then(r => r.text());

      const lowerHtml = html.toLowerCase();
      fetchedContentPreview = lowerHtml.slice(0, 500);
      foundInBio = lowerHtml.includes(expectedToken);
    }

    // 5. GeeksforGeeks live verification
    else if (cleanPlatform === 'gfg') {
      const html = await fetch(`https://www.geeksforgeeks.org/user/${encodeURIComponent(cleanHandle)}/`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).then(r => r.text());

      const lowerHtml = html.toLowerCase();
      fetchedContentPreview = lowerHtml.slice(0, 500);
      foundInBio = lowerHtml.includes(expectedToken);
    }

    // 6. HackerRank live verification
    else if (cleanPlatform === 'hackerrank') {
      const profileRes = await fetch(`https://www.hackerrank.com/rest/hackers/${encodeURIComponent(cleanHandle)}/profile`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).then(r => r.json()).catch(() => ({ model: {} }));

      const p = profileRes.model || {};
      const combined = `${p.short_bio || ''} ${p.about || ''} ${p.name || ''} ${p.school || ''} ${p.headline || ''}`.toLowerCase();
      fetchedContentPreview = combined;
      foundInBio = combined.includes(expectedToken);
    }

    if (!foundInBio) {
      return {
        success: false,
        error: `Verification failed: Token "${session.token}" was NOT found in @${cleanHandle}'s profile bio on ${cleanPlatform.toUpperCase()}. Please make sure you saved your profile changes and try again within the 60-second window.`
      };
    }

    // Success! Remove session token
    activeTokens.delete(sessionKey);

    return {
      success: true,
      platform: cleanPlatform,
      handle: cleanHandle,
      message: `Ownership verified! Handle "@${cleanHandle}" on ${cleanPlatform.toUpperCase()} has been confirmed and locked.`
    };

  } catch (err) {
    console.error(`Live verification error for ${cleanPlatform}:${cleanHandle}:`, err.message);
    return {
      success: false,
      error: `Could not connect to ${cleanPlatform.toUpperCase()} API to verify profile. Error: ${err.message}`
    };
  }
}
