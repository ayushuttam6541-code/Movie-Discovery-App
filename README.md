# 🎬 Movie Discovery App 

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TMDB API](https://img.shields.io/badge/TMDB-API_v3-01D277?style=flat-square&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

A production-grade, full-stack movie discovery web application built with **React 19, Vite, Tailwind CSS v4, Node.js, Express, MongoDB, and the TMDB API**.

---

## 👔 Executive Summary (For Recruiters & Evaluators)

> **Quick 30-Second Pitch**:  
> This application is a complete, resilient full-stack movie discovery platform. Rather than building a simple API wrapper or insecure client-side app, it features a **Node.js API Gateway** that secures third-party credentials, normalizes TMDB data, prevents search race conditions with request cancellation, and delivers a **persistent MongoDB-backed wishlist** without requiring users to navigate a login wall.

### 🌟 Evaluation Checklist & Architectural Highlights

| Evaluation Criteria | Implementation in this Project | Engineering Benefit |
| :--- | :--- | :--- |
| **API Security & Privacy** | Backend proxy layer (`/api/movies`) isolates TMDB key | TMDB API keys are **never** bundled or leaked to the client browser. |
| **User Experience (UX)** | Persistent Wishlist via anonymous client UUID (`x-client-id`) | Zero friction: users don't need to register an account to save movies across sessions. |
| **Async Resilience** | `AbortController` cancellation + debounced search | Eliminates search race conditions and cancels stale network requests. |
| **Monorepo Architecture** | Unified root build orchestrating frontend and backend | Deploys seamlessly on Render as a single unified service without CORS issues. |
| **Defensive Engineering** | Graceful degradation for MongoDB & TMDB outages | App continues to discover movies even if MongoDB is temporarily offline. |
| **Modern Styling** | Tailwind CSS v4 with custom dark mode & skeleton loaders | Responsive, polished visual presentation without heavy third-party UI kits. |

---

## 📑 Table of Contents

1. [Executive Summary (For Recruiters)](#-executive-summary-for-recruiters--evaluators)
2. [Quick Start Guide (Run in 2 Minutes)](#-quick-start-guide-run-in-2-minutes)
3. [Environment Configuration](#-environment-configuration)
4. [Approach Taken](#-approach-taken)
5. [System Architecture](#-system-architecture)
6. [Important Technical Decisions](#-important-technical-decisions)
7. [Deployment Guide & Render Troubleshooting](#-deployment-guide--render-troubleshooting)
8. [Assumptions Made](#-assumptions-made)
9. [Known Limitations](#-known-limitations)
10. [What I Would Improve With Additional Time](#-what-i-would-improve-with-additional-time)
11. [AI Usage Honest Documentation](#-ai-usage-honest-documentation)
12. [REST API Reference](#-rest-api-reference)
13. [Author & Contact](#-author--contact)

---

## ⚡ Quick Start Guide (Run in 2 Minutes)

### 1. Clone & Install All Dependencies
Run from the root directory to install dependencies across both `client/` and `server/`:
```bash
git clone <your-repository-url>
cd movie-discovery-app
npm run install:all
```

### 2. Configure Environment Variables
Copy the example file to `server/.env`:
```bash
cp server/.env.example server/.env
```
*(Add your free TMDB API key to `server/.env`)*

> **Frontend requires 0 configuration**: In development, it automatically connects to `http://localhost:5000/api`. In production, it connects to `/api`. No frontend `.env` file is required!

### 3. Run Development Servers
Open two terminal windows:

```bash
# Terminal 1 (Backend API on http://localhost:5000)
npm run dev:server

# Terminal 2 (Frontend UI on http://localhost:5173)
npm run dev:client
```

### 4. Test Production Build Locally
Verify the full unified production build (single port `5000`):
```bash
npm run build
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 🔑 Environment Configuration

Only **one** `.env` file is needed for the backend (`server/.env`):

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `TMDB_API_KEY` | TMDB API v3 Key ([Get here](https://www.themoviedb.org/settings/api)) | `your_tmdb_key` |
| `TMDB_BASE_URL`| Base URL for TMDB API | `https://api.tmdb.org/3` |
| `MONGODB_URI`  | MongoDB connection string (local or Atlas)
| `PORT`         | Server port | `5000` |

---

## 🧭 Approach Taken

The project was approached through an end-to-end software engineering lifecycle designed to mirror production standards:

1. **User Experience First**:
   - Designed the browsing experience so users immediately see trending movies upon loading without needing to search.
   - Built a comprehensive discovery feed with category pills (*Popular, Top Rated, Now Playing, Upcoming*) and sorting options (*Popularity, Rating, Release Date*).
   - Created rich detail views (`/movie/:id`) showing genres, runtime, budget, revenue, and artwork.

2. **Backend Gateway & Data Abstraction**:
   - Shielded third-party API credentials entirely on the backend (`process.env.TMDB_API_KEY`).
   - Implemented a data normalizer (`movieService.js`) to transform raw TMDB responses into a uniform schema (resolving full CDN image URLs and providing fallbacks for missing overviews/posters).

3. **Persistent Data Modeling**:
   - Stored only essential movie metadata in MongoDB (`movieId, title, posterPath, releaseDate, rating`) to keep database overhead minimal while fetching rich runtime data on-demand.
   - Designed an anonymous multi-tenant architecture using persistent UUIDs passed in the `x-client-id` header.

4. **Async Resiliency & Edge-Case Handling**:
   - Solved search race conditions by aborting in-flight HTTP requests using `AbortController` and tracking monotonic request IDs (`currentRequestIdRef`).
   - Configured 10-second server request timeouts against TMDB to prevent hanging connections.
   - Implemented graceful degradation: if MongoDB is disconnected, the server logs a clear warning and continues serving movie discovery endpoints.

5. **Responsive & Defensive UI**:
   - Handled loading states using animated shimmer skeletons (`LoadingSkeleton.jsx`).
   - Provided friendly error screens with "Try Again" retry actions.
   - Handled edge cases: missing poster placeholders, multi-line title clamping, and empty search results.

6. **Unified Monorepo Deployment**:
   - Configured the root `package.json` to orchestrate building the Vite frontend and launching the Node.js server, allowing 1-click cloud deployment on platforms like Render.

---

## 🏛 System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            User Browser (Client)                            │
│   React 19 SPA (Vite) + Tailwind CSS v4 + React Router v7                   │
│   - Persistent Client UUID (localStorage) injected into x-client-id header  │
│   - Cancelable requests via Axios + AbortController                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         HTTP REST API Requests (/api)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Node.js + Express API Gateway                        │
│   - Static Asset Hosting (client/dist in production)                        │
│   - Movie Controller & Request Normalizer                                   │
│   - Wishlist Controller & Schema Validator                                  │
│   - Resilient Error Handling & MongoDB Connection Heartbeat                 │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
       Private TMDB Key│                               │ Mongoose ODM
                       ▼                               ▼
       ┌──────────────────────────────┐ ┌──────────────────────────────┐
       │           TMDB API           │ │        MongoDB Atlas         │
       │ - /discover/movie            │ │ - Wishlist Collection        │
       │ - /search/movie              │ │ - Indexed { clientId, movieId│
       │ - /movie/:id                 │ │ - Lightweight document model │
       └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 🎯 Important Technical Decisions

| Choice | Alternatives Considered | Rationale |
| :--- | :--- | :--- |
| **React 19 + Vite** | Next.js / CRA | Vite provides instant HMR and tiny production bundles. React 19 gives concurrent rendering without SSR operational overhead. |
| **Tailwind CSS v4** | CSS Modules / Component Kits | High-performance CSS-first syntax, rapid prototyping, and fine-grained responsive breakpoint control without UI kit bloat. |
| **Node.js + Express** | Calling TMDB from React | Critical for API key security, centralized rate-limiting, and single-port production serving. |
| **MongoDB + Mongoose** | PostgreSQL / Browser LocalStorage | Flexible document model fits movie items naturally. LocalStorage alone is device-bound and lost if browser cache is cleared. |
| **Axios with Interceptors** | Native Fetch API | Simplifies automatic header injection (`x-client-id`), response error handling, and `AbortController` cancellation. |
| **Unified Full-Stack Deployment**| Separate S3 + EC2 / Vercel + Heroku | Simplest operations for evaluators: 1 command builds both, 1 server serves both, 0 CORS configuration issues. |

---

## 🚀 Deployment Guide & Render Troubleshooting

### Understanding the 3 `package.json` Files

The project is structured as a workspace monorepo:
1. **Root `package.json`**: Orchestrates global commands (`build`, `start`, `dev`) for cloud hosting.
2. **`server/package.json`**: Manages backend server dependencies (`express`, `mongoose`, `axios`, `cors`).
3. **`client/package.json`**: Manages frontend Vite & React dependencies (`react`, `vite`, `tailwindcss`).

### Why `npm error Missing script: "build"` Happened

When deploying this repository to **Render**:
1. Render automatically inspects the **root directory**.
2. By default, Render executes `npm run build`.
3. Because root `package.json` previously only had `"build:client"` (and no `"build"` script), Render threw:
   ```text
   npm error Missing script: "build"
   ==> Build failed 😞
   ```

### How It Was Fixed

1. **Root `package.json`** now has a unified `build` and `start` pipeline:
   ```json
   "scripts": {
     "build": "npm install --prefix client && npm run build --prefix client && npm install --prefix server",
     "start": "node server/server.js"
   }
   ```
2. **`server/package.json`** contains a fallback `"build": "echo \"Server ready\""` so it never errors even if deployed standalone.
3. **`server/server.js`** serves static production assets from `client/dist` and handles client-side SPA routing (`index.html` fallback).
4. **`client/src/services/api.js`** dynamically switches between `/api` (production) and `http://localhost:5000/api` (development).

---

### Step-by-Step Render Deployment (Recommended)

1. Log in to [Render](https://render.com) and click **New +** > **Web Service**.
2. Select your repository: `movie-discovery-app`.
3. Configure the build parameters:
   - **Name**: `movie-discovery-app`
   - **Environment / Runtime**: `Node`
   - **Root Directory**: *(Leave empty/blank — it will use repository root)*
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add **Environment Variables** in Render:
   - `TMDB_API_KEY` = `your_tmdb_api_key`
   - `TMDB_BASE_URL` = `https://api.tmdb.org/3`
   - `MONGODB_URI` = `mongodb+srv://<user>:<password>@cluster.mongodb.net/movie-discovery`
   - `NODE_ENV` = `production`
5. Click **Deploy Web Service**.

---

## 📌 Assumptions Made

1. **Guest-First UX**: Assumed that users want to browse movies and build a wishlist immediately without a mandatory signup form.
2. **Single-Device Anonymous Continuity**: The client UUID is stored in `localStorage`, meaning wishlist items persist on that browser across tab closures and refreshes.
3. **External TMDB Availability**: Assumed TMDB v3 endpoints remain online; implemented 10-second server request timeouts to avoid hung connections.
4. **Resilient Local Database**: Assumed that during evaluation, a local MongoDB instance might not be running; the backend catches connection errors and allows movie browsing to continue uninterrupted.

---

## ⚠️ Known Limitations

1. **No Cross-Device Sync**: Because anonymous client IDs are stored in browser `localStorage`, wishlists do not sync across different physical devices or incognito sessions.
2. **No User Authentication**: Password/JWT authentication was intentionally omitted to prioritize clean API design and rapid evaluation.
3. **TMDB Rate Limiting**: Free-tier TMDB API keys are subject to rate limits (~40 requests/10 seconds). Rapid spamming may return 429 status codes.
4. **Cloud Container Cold Starts**: On free-tier cloud platforms (like Render), inactive containers spin down after 15 minutes of inactivity; the initial request may take ~30–45 seconds to wake up.

---

## 🔮 What I Would Improve With Additional Time

With additional development time, the following enhancements would be prioritized:

1. **Server-Side Caching (Redis / In-Memory TTL Cache)**:
   - Cache popular movie queries and search results on the backend with a 10-minute Time-To-Live (TTL).
   - This would reduce redundant requests to TMDB by up to 80% and drop response latency to under 15ms.

2. **User Authentication & Cross-Device Sync**:
   - Implement JWT / OAuth2 authentication (Google/GitHub login) to allow users to access their wishlist seamlessly across mobile and desktop.

3. **Advanced Filtering Matrix**:
   - Multi-genre combination filtering, release year range sliders, and minimum rating thresholds utilizing TMDB's advanced `/discover/movie` parameters.

4. **Embedded Trailers & Streaming Availability**:
   - Integrate TMDB's `/movie/:id/videos` and `/movie/:id/watch/providers` endpoints to show YouTube trailers and streaming services (Netflix, Prime, Disney+).

5. **Automated Test Suite**:
   - Unit tests for backend controllers and normalizer functions using **Jest** and **Supertest**.
   - Component and integration tests for frontend using **React Testing Library**.
   - End-to-end user journey tests using **Playwright**.

6. **Virtualization for Massive Lists**:
   - Implement **TanStack Virtual** (virtualized scrolling) to keep DOM node counts minimal when browsing hundreds of movie titles.

---

## 🤖 AI Usage Honest Documentation

In compliance with academic and professional integrity standards, AI tools (Google DeepMind Antigravity) were utilized as an engineering assistant during development:

### Where AI Was Used:
- **Deployment Diagnosis**: Investigated and diagnosed the Render build error (`npm error Missing script: "build"`), discovering the root cause in the monorepo's `package.json` layout.
- **Monorepo Build Scripting**: Formulated the unified root `build` script (`npm install --prefix client && npm run build --prefix client && npm install --prefix server`) and Express static serving setup.
- **Client Configuration**: Set up dynamic base URL detection between development and production.
- **Documentation Structuring**: Refined the README structure to strictly map to the assignment evaluation rubric.

### What Was Handled & Verified Manually:
- API endpoint design and TMDB data normalization logic.
- MongoDB schema design with compound indexes for anonymous client wishlists.
- Responsive UI layouts, dark mode aesthetic choices, and skeleton loading states.
- End-to-end verification of search debouncing and cancellation behavior.

---

## 📡 REST API Reference

### Base URL
- **Local**: `http://localhost:5000/api`
- **Production (Unified)**: `/api`

### Endpoints

| Method | Endpoint | Description | Headers / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service & database status | None |
| `GET` | `/api/movies` | Discover popular movies | `?page=1&category=popular&sortBy=popularity.desc` |
| `GET` | `/api/movies/search` | Search movie database | `?query=batman&page=1` |
| `GET` | `/api/movies/:id` | Full details for a single movie | Param: `:id` |
| `GET` | `/api/wishlist` | Fetch client's saved wishlist | Header: `x-client-id: <uuid>` |
| `POST` | `/api/wishlist` | Add movie to wishlist | Header: `x-client-id: <uuid>`, Body: `{ movieId, title, ... }` |
| `DELETE`| `/api/wishlist/:movieId` | Remove movie from wishlist | Header: `x-client-id: <uuid>`, Param: `:movieId` |

---

## 👤 Author & Contact

Developed as a full-stack internship demonstration project showcasing modern React, Node.js, and API architecture best practices.

- **Developer**: Ayush Raj
- **Project**: Movie Discovery & Persistent Wishlist System
- **License**: [ISC](https://opensource.org/licenses/ISC)
