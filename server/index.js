import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, getDbStatus } from './config/db.js';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', apiRouter);

// API Status & Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'AlgoTracker CP & Problem Tracker API',
    version: '2.1.0',
    authProvider: 'Google OAuth SSO',
    database: getDbStatus(),
    platformsSupported: ['Codeforces', 'LeetCode', 'AtCoder', 'CodeChef', 'GeeksforGeeks', 'HackerRank'],
    endpoints: [
      'POST /api/auth/google - Google OAuth Sign-In & Verification',
      'GET /api/auth/me - Get current user profile & stored problems',
      'POST /api/auth/update-handles - Update bound CP handles with collision check',
      'POST /api/auth/verify-handle - Verify handle ownership via profile bio token',
      'POST /api/sync - Live Sync bound platform handles',
      'GET /api/admin/status - Admin User Directory (Superuser only)',
      'GET /api/contests - Upcoming contest schedule',
      'GET /api/potd - Daily coding challenges across platforms'
    ]
  });
});

// Production Static Serving for Single-Deployment (Render, Railway, Heroku, etc.)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving compiled client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Catch-all SPA handler (except /api routes)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // If not built yet, return informative API root
  app.get('/', (req, res) => {
    res.json({
      name: 'AlgoTracker Backend Server',
      status: 'Online',
      database: getDbStatus(),
      auth: 'Google OAuth Only',
      notice: 'Frontend dist not built. Run "npm run build" in client folder or visit the dev frontend on http://localhost:3000'
    });
  });
}

// Start Server & Connect DB
async function startServer() {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
  if (adminEmail) {
    console.log(`🛡️ Superuser Admin configured via Google Email: "${adminEmail}"`);
  } else {
    console.log(`ℹ️ Tip: Set ADMIN_EMAIL in server/.env to enable Superuser Admin console for your Google account.`);
  }

  app.listen(PORT, () => {
    console.log(`🚀 AlgoTracker Server running at http://localhost:${PORT}`);
  });
}

startServer();
