# 🎬 VideoInsight

### AI-Powered YouTube Learning Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

**VideoInsight turns any YouTube video or playlist into an interactive learning experience** — instant transcripts, AI-generated summaries, auto-graded quizzes, flashcards, and a full learning dashboard. No distractions, no recommendations, just focused study.

🔗 **Live App:** [video-insight-five.vercel.app](https://video-insight-five.vercel.app)

---

## 📋 Table of Contents

1. [Why VideoInsight](#-why-videoinsight)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture](#-architecture)
5. [Getting Started](#-getting-started)
6. [Environment Variables](#-environment-variables)
7. [Project Structure](#-project-structure)
8. [API Overview](#-api-overview)
9. [Roadmap](#-roadmap)
10. [Contributing](#-contributing)
11. [License](#-license)
12. [Contact](#-contact)

---

## 💡 Why VideoInsight

In an age of endless video content, **retention** — not access — is the real bottleneck. People watch hours of tutorials but struggle to recall the key ideas or test whether they actually understood anything.

VideoInsight fixes this by:

- **Removing distractions** — a clean player with no sidebar recommendations or ads
- **Forcing active recall** — AI-generated quizzes and flashcards test your understanding immediately
- **Enabling fast review** — summaries and timestamp-linked transcripts let you revisit key points without rewatching the whole video

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| **AI Transcripts** | Reliable transcript fetching with a dual-provider fallback pipeline |
| **Smart Summaries** | Gemini-generated summaries rendered as clean markdown, in a "teacher mode" tone |
| **Interactive Quizzes** | Auto-generated 5-question multiple-choice quizzes with difficulty levels |
| **Flashcards** | Active-recall flashcards with flip animations |
| **Playlist Import** | Import entire YouTube playlists, not just single videos |
| **Progress Dashboard** | Watch time, quiz history, daily streaks, and topic mastery, visualized with charts |
| **Community Feed** | Discover public playlists shared by other learners |
| **Secure Auth** | Google OAuth via Passport.js, with session-based authentication |
| **Rate Limiting** | Per-IP and per-user limits protect the backend from abuse |
| **Responsive Design** | Works cleanly across desktop and mobile |

---

## 🧪 Tech Stack

### Frontend
- **React 19** + **Vite** — fast dev server and builds
- **React Router v7** — client-side routing
- **Tailwind CSS v4** — utility-first styling
- **Framer Motion** — page transitions and animations
- **Recharts** — dashboard analytics charts
- **Lucide React** — icon set
- **Axios** — HTTP client
- **React Helmet Async** — per-page SEO meta tags

### Backend
- **Node.js + Express** — REST API server
- **MongoDB + Mongoose** — primary data store
- **Passport.js (Google OAuth2)** — authentication
- **express-session + connect-mongo** — persistent, MongoDB-backed sessions
- **Google Generative AI SDK (Gemini)** — summaries, quizzes, flashcards, translation
- **youtube-transcript-api (Python)** — transcript extraction, with an Invidious-based fallback

### External Services
- YouTube Data API v3 (metadata, playlists, durations)
- Google Gemini AI (multi-model cascade with automatic fallback)
- Google OAuth 2.0 (authentication)

### Infrastructure
- **MongoDB Atlas** — hosted database
- **Vercel** — frontend hosting
- **Render** (Docker) — backend hosting, running Node.js + Python together

---

## 🏗️ Architecture

```
┌────────────────────────────┐
│   Frontend (Vercel)        │
│   React 19 + Vite + Tailwind│
└──────────────┬─────────────┘
               │ HTTPS (credentials: include)
┌──────────────▼─────────────────────────────┐
│   Backend (Render, Docker)                  │
│   Express + Passport.js + Sessions          │
│                                              │
│   /auth/*        Google OAuth               │
│   /api/playlists CRUD for imported content  │
│   /api/videos    Transcript fetching        │
│   /api/ai        Gemini-powered features    │
│   /api/user      Tracking + dashboard data  │
│   /api/feed      Community feed             │
│                                              │
│   Transcript layer: LRU cache + in-flight   │
│   dedup + request queue + semaphore         │
└──────────┬───────────────────┬──────────────┘
           │                   │
   ┌───────▼──────┐   ┌────────▼─────────────┐
   │ MongoDB Atlas │   │ YouTube Data API v3  │
   │ Users/Playlists│   │ Google Gemini AI     │
   │ Sessions       │   │ (multi-model fallback)│
   └───────────────┘   └───────────────────────┘
```

**A few notable design choices:**
- **Session-based auth over JWT** — fits the OAuth redirect flow naturally and allows server-side logout/invalidation.
- **Dual transcript provider** — `youtube-transcript-api` in production, with a fallback path (Invidious) for resilience when YouTube blocks scraping from cloud IPs.
- **Multi-model Gemini fallback chain** — if one model is rate-limited or overloaded (429/503), the request cascades to the next model, keeping AI features highly available.
- **In-flight request deduplication + LRU cache** — concurrent requests for the same video's transcript share a single in-flight promise, and results are cached in memory to avoid redundant calls.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+ with `youtube-transcript-api` installed
- MongoDB (local or Atlas)
- Google Gemini API key
- Google OAuth 2.0 credentials

### 1. Clone the repository
```bash
git clone https://github.com/itsshivamnith/videoInsight.git
cd videoInsight
```

### 2. Install dependencies
```bash
# Python dependency (transcript fetching)
pip install youtube-transcript-api

# Backend
cd server && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment variables
Create `server/.env` (see [Environment Variables](#-environment-variables) below), and `frontend/.env` with:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Run locally
```bash
# Terminal 1 — Backend
cd server
npm start        # runs on http://localhost:8000

# Terminal 2 — Frontend
cd frontend
npm run dev       # runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔐 Environment Variables

### `server/.env`
```env
PORT=8000
NODE_ENV=development

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/videoinsight
SESSION_SECRET=your-super-secret-key

SERVER_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

YOUTUBE_API_KEY=your_youtube_data_api_key

GEMINI_API_KEY_SUMMARY=your_gemini_api_key
GEMINI_API_KEY_QUIZ=your_gemini_api_key

# Optional tuning — safe defaults apply if omitted
TRANSCRIPT_CONCURRENCY=3
TRANSCRIPT_QUEUE_DEPTH=20
TRANSCRIPT_TIMEOUT_MS=30000
TRANSCRIPT_LANGS=en,en-US,en-GB,en-IN,hi
PYTHON_BIN=python3
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:8000
```

> ⚠️ Never commit `.env` files. Use `.env.example` templates for sharing structure without secrets.

---

## 📂 Project Structure

```
videoInsight/
├── frontend/          # React 19 + Vite SPA
│   ├── src/
│   │   ├── pages/     # Home, Feed, Playlist, Player, Dashboard, Profile...
│   │   ├── components/
│   │   └── context/   # Auth context, etc.
│   └── assets/        # Screenshots, icons
├── server/             # Express API
│   ├── src/
│   │   ├── config/    # Passport strategy, DB connection
│   │   ├── routes/    # auth, playlists, videos, ai, user, feed
│   │   ├── services/  # Transcript service (cache, dedup, providers)
│   │   └── models/    # Mongoose schemas (User, Playlist)
│   └── Dockerfile      # Multi-runtime: Node.js + Python
├── render.yaml
├── DEPLOY.md
└── README.md
```

---

## 🔌 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/auth/google` | – | Start Google OAuth flow |
| GET | `/auth/google/callback` | – | OAuth callback, creates session |
| GET | `/auth/login/success` | – | Check current auth status |
| GET | `/auth/logout` | ✅ | Destroy session |
| POST | `/api/playlists` | ✅ | Import a YouTube playlist/video |
| GET | `/api/playlists` | ✅ | List the user's imported playlists |
| GET | `/api/videos/:videoId/transcript` | – | Fetch (cached) transcript |
| POST | `/api/ai/summarize` | – | Generate an AI summary |
| POST | `/api/ai/quiz` | – | Generate a 5-question quiz |
| POST | `/api/ai/flashcards` | – | Generate flashcards |
| GET | `/api/user/dashboard` | ✅ | Stats, streaks, quiz history |
| POST | `/api/user/track` | ✅ | Log watch time / app-open time |
| GET | `/api/feed` | – | Community feed of public playlists |

---

## 🗺️ Roadmap

- [ ] Redis-backed transcript cache (survives restarts, shared across instances)
- [ ] Background job queue (BullMQ) for transcript + AI generation
- [ ] Rate limiting refinements on AI endpoints
- [ ] Vector search across transcript content (semantic search)
- [ ] WebSocket support for real-time quiz collaboration
- [ ] Migrate tracking writes to atomic MongoDB operators

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request describing what you changed and why

Please open an issue first for larger changes, so the approach can be discussed before implementation.

---

## 📝 License

Licensed under the **MIT License** — free to use for personal and educational purposes. See [`LICENSE`](./LICENSE) for full details.

---

## 📬 Contact

- **Live App:** [video-insight-five.vercel.app](https://video-insight-five.vercel.app)
- **GitHub:** [github.com/itsshivamnith/videoInsight](https://github.com/itsshivamnith/videoInsight)

---

<p align="center">Built with ❤️ as a learning project — powered by Google Gemini AI and the YouTube Data API</p>
