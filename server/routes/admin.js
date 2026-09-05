import { Router } from 'express';
import { UserStore, ProblemStore, getDbStatus } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes with requireAdmin middleware
router.use(requireAdmin);

// 1. Get system status & overview
router.get('/status', async (req, res) => {
  try {
    const allUsers = await UserStore.find({});
    const dbStatus = getDbStatus();

    res.json({
      success: true,
      dbStatus,
      totalUsers: allUsers.length,
      users: allUsers.map(u => ({
        id: u._id || u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        handles: u.handles,
        lastSyncStats: u.lastSyncStats,
        lastSyncedAt: u.lastSyncedAt,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1b. Check if any handle is registered in DB across any platform
router.get('/lookup-handle', async (req, res) => {
  try {
    const { platform, handle } = req.query;
    if (!handle) {
      return res.status(400).json({ success: false, error: 'Handle query parameter is required' });
    }

    const cleanHandle = handle.trim().toLowerCase();
    const allUsers = await UserStore.find({});
    
    let matchedUser = null;
    let matchedPlatform = null;

    for (const u of allUsers) {
      const handles = u.handles || {};
      if (platform && handles[platform]) {
        if (handles[platform].toLowerCase() === cleanHandle) {
          matchedUser = u;
          matchedPlatform = platform;
          break;
        }
      } else {
        for (const [p, h] of Object.entries(handles)) {
          if (h && h.toLowerCase() === cleanHandle) {
            matchedUser = u;
            matchedPlatform = p;
            break;
          }
        }
      }
      if (matchedUser) break;
    }

    if (matchedUser) {
      res.json({
        success: true,
        inDb: true,
        platform: matchedPlatform,
        handle: cleanHandle,
        owner: {
          id: matchedUser._id || matchedUser.id,
          username: matchedUser.username,
          email: matchedUser.email,
          role: matchedUser.role,
          handles: matchedUser.handles
        }
      });
    } else {
      res.json({
        success: true,
        inDb: false,
        handle: cleanHandle,
        message: 'Handle is not currently registered by any user in MongoDB.'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get specific user details & problems
router.get('/user/:id', async (req, res) => {
  try {
    const user = await UserStore.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const problems = await ProblemStore.getUserProblems(user._id || user.id);
    const { password, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      problems
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Delete user
router.delete('/user/:id', async (req, res) => {
  try {
    const target = await UserStore.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (target.role === 'admin' && target.username === 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot delete the primary root admin account' });
    }

    await UserStore.deleteById(req.params.id);
    res.json({ success: true, message: `User "${target.username}" successfully removed.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
