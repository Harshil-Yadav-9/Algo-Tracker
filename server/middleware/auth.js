import jwt from 'jsonwebtoken';
import { UserStore } from '../config/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'algotracker_super_secret_jwt_key_2026';

// Middleware to authenticate any logged in user
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserStore.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User session expired or user no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
  }
}

// Middleware for Admin-only routes
export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Admin authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserStore.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Administrator privilege required.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired admin session token.' });
  }
}

// Optional Auth (for sync routes that support both guest / locked user / admin)
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await UserStore.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
}
