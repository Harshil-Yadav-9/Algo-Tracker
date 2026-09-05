import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserStore, ProblemStore } from '../config/db.js';
import { authenticateUser, JWT_SECRET } from '../middleware/auth.js';
import { generateVerificationSession, verifyPlatformBioLive } from '../services/verificationService.js';

const router = Router();

// Helper to sanitize user object
function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// 1. Get Auth Configuration (Returns Google Client ID if configured)
router.get('/config', (req, res) => {
  res.json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    adminEmailConfigured: Boolean(process.env.ADMIN_EMAIL)
  });
});

// 2. Google OAuth Authentication (Sole SSO Provider)
router.post('/google', async (req, res) => {
  try {
    const { credential, profile } = req.body;
    let googlePayload = null;

    // Option A: Verify Google JWT ID Token via Google's tokeninfo API
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          googlePayload = await verifyRes.json();
        } else {
          console.warn('Google token verification API returned error, checking decoded payload');
        }
      } catch (verr) {
        console.warn('Google verify network error:', verr.message);
      }

      if (!googlePayload) {
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            googlePayload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          }
        } catch (decErr) {
          console.error('Failed to decode credential:', decErr);
        }
      }
    } else if (profile && profile.email) {
      googlePayload = profile;
    }

    if (!googlePayload || !googlePayload.email) {
      return res.status(400).json({ success: false, error: 'Invalid Google authentication payload. Email is required.' });
    }

    const email = googlePayload.email.trim().toLowerCase();
    const googleId = googlePayload.sub || googlePayload.id || `g_${Date.now()}`;
    const name = googlePayload.name || googlePayload.given_name || email.split('@')[0];
    const avatar = googlePayload.picture || 'https://lh3.googleusercontent.com/a/default-user=s96-c';

    // Determine Admin Role exclusively by checking against ADMIN_EMAIL in .env
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const isAdmin = Boolean(adminEmail && email === adminEmail);
    const role = isAdmin ? 'admin' : 'user';

    // Check if user already exists in DB
    let user = await UserStore.findOne({ email });
    let isNewUser = false;

    if (user) {
      const updates = {
        name,
        avatar,
        googleId,
        username: user.username || email.split('@')[0],
        role: (user.role === 'admin' || isAdmin) ? 'admin' : 'user'
      };
      user = await UserStore.updateById(user._id || user.id, updates);
    } else {
      isNewUser = true;
      user = await UserStore.create({
        googleId,
        email,
        name,
        username: email.split('@')[0],
        avatar,
        role,
        handles: {
          codeforces: '',
          leetcode: '',
          atcoder: '',
          codechef: '',
          gfg: '',
          hackerrank: ''
        },
        verifiedHandles: {
          codeforces: false,
          leetcode: false,
          atcoder: false,
          codechef: false,
          gfg: false,
          hackerrank: false
        }
      });
    }

    // Generate JWT session token
    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Fetch user's saved problems from DB
    const savedProblems = await ProblemStore.getUserProblems(user._id || user.id);

    console.log(`🔐 Google OAuth successful: ${user.email} (Role: ${user.role})`);

    res.json({
      success: true,
      message: `Welcome, ${user.name || user.email}!`,
      token,
      user: sanitizeUser(user),
      isNewUser,
      savedProblems,
      savedProblemsCount: savedProblems.length
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ success: false, error: err.message || 'Google OAuth failed' });
  }
});

// 3. Get Current Authenticated User & Hydrate Saved Problems
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const savedProblems = await ProblemStore.getUserProblems(req.user._id || req.user.id);
    res.json({
      success: true,
      user: sanitizeUser(req.user),
      savedProblems,
      savedProblemsCount: savedProblems.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Start 60-Second Handle Verification Session (Generates unique code + exact profile instructions)
router.post('/verify-session', authenticateUser, async (req, res) => {
  try {
    const { platform, handle } = req.body;
    if (!platform || !handle || !handle.trim()) {
      return res.status(400).json({ success: false, error: 'Platform and handle are required.' });
    }

    const cleanPlatform = platform.toLowerCase().trim();
    const cleanHandle = handle.trim();
    const currentUserId = req.user._id || req.user.id;

    // Check if handle is already verified by another user in DB
    const existing = await UserStore.findOne({
      [`handles.${cleanPlatform}`]: cleanHandle,
      _id: { $ne: currentUserId }
    });

    if (existing && existing.email !== req.user.email) {
      return res.status(400).json({
        success: false,
        error: `The ${cleanPlatform.toUpperCase()} handle "${cleanHandle}" is already verified and bound to another account (${existing.email || existing.username}). Each handle can only belong to one user.`
      });
    }

    // Generate unique session with 60-second timer
    const session = generateVerificationSession(currentUserId, cleanPlatform, cleanHandle);

    res.json({
      success: true,
      platform: cleanPlatform,
      handle: cleanHandle,
      token: session.token,
      expiresAt: session.expiresAt,
      expiresInSeconds: session.expiresInSeconds,
      instructions: session.instructions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Confirm Live Bio Verification (Fetches platform profile in real-time within 60 seconds)
router.post('/verify-confirm', authenticateUser, async (req, res) => {
  try {
    const { platform, handle } = req.body;
    if (!platform || !handle || !handle.trim()) {
      return res.status(400).json({ success: false, error: 'Platform and handle are required.' });
    }

    const cleanPlatform = platform.toLowerCase().trim();
    const cleanHandle = handle.trim();
    const currentUserId = req.user._id || req.user.id;

    // Run live verification against the platform profile
    const result = await verifyPlatformBioLive(currentUserId, cleanPlatform, cleanHandle);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Double check handle collision
    const existing = await UserStore.findOne({
      [`handles.${cleanPlatform}`]: cleanHandle,
      _id: { $ne: currentUserId }
    });

    if (existing && existing.email !== req.user.email) {
      return res.status(400).json({
        success: false,
        error: `The ${cleanPlatform.toUpperCase()} handle "${cleanHandle}" is already registered by another account.`
      });
    }

    // SUCCESS: Save handle and mark verified in User document
    const userHandles = { ...(req.user.handles || {}) };
    userHandles[cleanPlatform] = cleanHandle;

    const userVerified = { ...(req.user.verifiedHandles || {}) };
    userVerified[cleanPlatform] = true;

    const updatedUser = await UserStore.updateById(currentUserId, {
      handles: userHandles,
      verifiedHandles: userVerified
    });

    console.log(`✅ [HANDLE_VERIFIED] ${req.user.email} -> ${cleanPlatform}: ${cleanHandle}`);

    res.json({
      success: true,
      message: result.message,
      platform: cleanPlatform,
      handle: cleanHandle,
      handles: updatedUser.handles,
      verifiedHandles: updatedUser.verifiedHandles
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Unlink/Remove a verified handle
router.post('/unlink-handle', authenticateUser, async (req, res) => {
  try {
    const { platform } = req.body;
    if (!platform) {
      return res.status(400).json({ success: false, error: 'Platform is required.' });
    }

    const cleanPlatform = platform.toLowerCase().trim();
    const currentUserId = req.user._id || req.user.id;

    const userHandles = { ...(req.user.handles || {}) };
    userHandles[cleanPlatform] = '';

    const userVerified = { ...(req.user.verifiedHandles || {}) };
    userVerified[cleanPlatform] = false;

    const updatedUser = await UserStore.updateById(currentUserId, {
      handles: userHandles,
      verifiedHandles: userVerified
    });

    res.json({
      success: true,
      message: `Unlinked ${cleanPlatform.toUpperCase()} handle.`,
      handles: updatedUser.handles,
      verifiedHandles: updatedUser.verifiedHandles
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Update User State (Bookmarks, Notes, POTD)
router.post('/sync-user-state', authenticateUser, async (req, res) => {
  try {
    const { bookmarks, notes, potdCompletions } = req.body;
    const updates = {};
    if (bookmarks !== undefined) updates.bookmarks = bookmarks;
    if (notes !== undefined) updates.notes = notes;
    if (potdCompletions !== undefined) updates.potdCompletions = potdCompletions;

    const updated = await UserStore.updateById(req.user._id || req.user.id, updates);

    res.json({
      success: true,
      user: sanitizeUser(updated)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
