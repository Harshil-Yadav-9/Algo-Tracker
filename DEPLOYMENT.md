# AlgoTracker Deployment Guide

AlgoTracker is fully configured for deployment with **Render (Backend API)** + **Vercel (Frontend Client)** or full-stack on Render / Railway.

---

## 🔐 1. Google OAuth Setup (1-Time Setup in Google Cloud)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Click **Create Credentials** -> **OAuth 2.0 Client ID**.
3. Select **Web Application**.
4. Add your domains under:
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:5000`
     - `https://your-frontend.vercel.app`
     - `https://your-backend.onrender.com`
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google`
     - `https://your-backend.onrender.com/api/auth/google`
5. Copy your **Client ID** (e.g. `123456789-abcdef.apps.googleusercontent.com`).

---

## ⚡ 2. Deploy Backend on Render

1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/), click **New** -> **Web Service**.
3. Connect your repository.
4. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:
   - `PORT`: `5000`
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/algotracker?retryWrites=true&w=majority&appName=algotracker`
   - `JWT_SECRET`: `your_secure_random_jwt_secret_key`
   - `GOOGLE_CLIENT_ID`: `your_google_client_id.apps.googleusercontent.com`
   - `ADMIN_EMAIL`: `your_email@gmail.com` *(Optional admin email)*
6. Click **Deploy Web Service** and copy your backend URL (e.g. `https://algotracker-api.onrender.com`).

---

## 🌐 3. Deploy Frontend on Vercel

1. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://algotracker-api.onrender.com` *(Your Render backend URL)*
5. Click **Deploy**!

---

## 🔒 4. Security & Privacy Guarantees

- **`.gitignore` Protected**: `.env`, private keys, local databases, build artifacts, and debug logs are blocked from git tracking.
- **Google OAuth Only**: Users authenticate securely with Google single sign-on.
- **Zero LocalStorage User Data**: All user statistics, platform handles, notes, bookmarks, and streaks are persisted securely in MongoDB.
