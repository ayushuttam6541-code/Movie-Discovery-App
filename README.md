# 🎬 Movie Discovery App — Full-Stack Production System

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TMDB API](https://img.shields.io/badge/TMDB-API_v3-01D277?style=flat-square&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

A production-grade, full-stack movie discovery web application built with **React 19, Vite, Tailwind CSS v4, Node.js, Express, MongoDB, and the TMDB API**.

---

## 👔 Executive Summary (For Recruiters & Technical HR)

> **Quick 30-Second Pitch**:  
> This project is a complete full-stack web application designed to demonstrate clean architecture, production-style security, and resilient UI design. Instead of making raw, insecure API calls from the browser, it implements a **Node.js backend gateway** that shields external API keys, normalizes responses, and manages a **persistent MongoDB wishlist** with session continuity without forcing the user through a login wall.

### 🌟 Why This Project Stands Out (Evaluation Checklist)

| Evaluation Criteria | Implementation in this Project | Engineering Benefit |
| :--- | :--- | :--- |
| **API Security & Privacy** | Backend proxy layer (`/api/movies`) hides TMDB credentials | TMDB API keys are **never** bundled or exposed to the client browser. |
| **User Experience (UX)** | Persistent Wishlist via anonymous client UUID (`x-client-id`) | Zero friction: users don't need to register an account to save movies across refreshes. |
| **Async Resilience** | `AbortController` cancellation + debounced queries | Eliminates search race conditions and cancels stale network requests. |
| **Monorepo Architecture** | Unified root build orchestrating frontend and backend | Solves deployment mismatches; deploys cleanly on Render as a single unified service. |
| **Defensive Engineering** | Graceful degradation for MongoDB & TMDB outages | App continues to discover movies even if MongoDB is temporarily down. |
| **Modern Styling** | Tailwind CSS v4 with custom dark mode & skeleton loaders | Responsive, polished visual presentation without external bloated component kits. |

---

## 📑 Table of Contents

1. [Executive Summary (For Recruiters)](#-executive-summary-for-recruiters--technical-hr)
2. [Quick Start Guide (Run in 2 Minutes)](#-quick-start-guide-run-in-2-minutes)
3. [Environment Configuration](#-environment-configuration)
4. [Deployment Guide & Render Troubleshooting](#-deployment-guide--render-troubleshooting)
   - [Why `npm error Missing script: "build"` Happened](#why-npm-error-missing-script-build-happened)
   - [How It Was Fixed](#how-it-was-fixed)
   - [Step-by-Step Render Deployment](#step-by-step-render-deployment)
5. [System Architecture](#-system-architecture)
6. [Design & Technical Decisions](#-design--technical-decisions)
7. [Assumptions](#-assumptions)
8. [Limitations](#-limitations)
9. [AI Usage Honest Documentation](#-ai-usage-honest-documentation)
10. [REST API Reference](#-rest-api-reference)
11. [Author & Contact](#-author--contact)

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
| `MONGODB_URI`  | MongoDB connection string (local or Atlas) | `mongodb://127.0.0.1:27017/movie-discovery` |
| `PORT`         | Server port | `5000` |

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
2. **`server/package.json`** now contains a fallback `"build": "echo \"Server ready\""` so it never errors even if deployed standalone.
3. **`server/server.js`** serves static production assets from `client/dist` and handles client-side SPA routing (`index.html` fallback).
4. **`client/src/services/api.js`** dynamically switches between `/api` (production) and `VITE_API_URL` / `localhost:5000` (development).

---

### Step-by-Step Render Deployment

#### Option A: Unified Single Web Service (Recommended — Free Tier Friendly)
Hosts frontend and backend together on 1 free Render service, avoiding CORS:
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

#### Option B: Split Services (Frontend Static Site + Backend Web Service)
- **Backend (Render Web Service)**:
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `npm start`
- **Frontend (Render Static Site)**:
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Publish Directory: `dist`
  - Environment Variable: `VITE_API_URL=https://<your-backend>.onrender.com/api`

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

### Architectural Highlights

1. **Backend as a Security Gateway**:
   The frontend never makes calls to `api.themoviedb.org`. This ensures TMDB API credentials cannot be extracted from browser network tabs or decompiled JavaScript bundles.
2. **Payload Normalization & Sanitization**:
   The backend transforms TMDB's verbose JSON structure into a clean, predictable schema:
   - Converts raw image filenames (`/abc.jpg`) into full CDN URLs (`https://image.tmdb.org/t/p/w500/...`).
   - Normalizes missing ratings, dates, and overviews with safe defaults.
3. **Session-Persistent Anonymous Wishlist**:
   Instead of requiring a signup or relying solely on fragile `localStorage`:
   - `client/src/services/api.js` creates an anonymous UUID (`movie_discovery_client_id`).
   - All wishlist requests attach this ID via the `x-client-id` header.
   - MongoDB indexes wishlists by `{ clientId, movieId }`, providing isolated, cross-tab, refresh-safe wishlists for every visitor.

---

## 🎯 Design & Technical Decisions

| Choice | Alternatives Considered | Rationale |
| :--- | :--- | :--- |
| **React 19 + Vite** | Next.js / Create React App | Vite offers sub-second HMR and lightweight bundle sizes. React 19 gives modern concurrent rendering without Next.js server complexity. |
| **Tailwind CSS v4** | CSS Modules / Styled Components | Zero-runtime CSS performance, lightning-fast utility styling, and clean responsive breakpoint design. |
| **Node.js + Express** | Direct frontend TMDB calls | Critical for API key security, centralized rate-limiting, and single-port production serving. |
| **MongoDB + Mongoose** | PostgreSQL / Browser LocalStorage | Flexible JSON document model matches movie objects without migration boilerplate. LocalStorage alone is device-bound and easily lost. |
| **Axios with Interceptors** | Native Fetch API | Simplifies automatic header injection (`x-client-id`), response error handling, and `AbortController` cancellation. |
| **Unified Full-Stack Deployment**| Separate S3 + EC2 / Vercel + Heroku | Simplest operations for evaluators: 1 command builds both, 1 server serves both, 0 CORS configuration issues. |

---

## 📌 Assumptions

1. **Guest First UX**: Assumed that users want to browse and build a wishlist immediately without a mandatory signup form.
2. **Single-Device Anonymous Continuity**: The client UUID is stored in `localStorage`, meaning wishlist items persist on that browser across refreshes.
3. **External TMDB Availability**: Assumed TMDB v3 endpoints remain online; implemented 10-second server request timeouts to avoid hung connections.
4. **Resilient Local Database**: Assumed that during evaluation, a local MongoDB instance might not be running; the backend catches connection errors and allows movie browsing to continue uninterrupted.

---

## ⚠️ Limitations

1. **No Cross-Device Sync**: Because anonymous client IDs are stored in browser `localStorage`, wishlists do not sync across different devices or incognito sessions.
2. **No User Authentication**: Password/JWT authentication was omitted to prioritize clean API design and rapid evaluation.
3. **TMDB Rate Limiting**: Free-tier TMDB API keys are subject to rate limits (~40 requests/10 seconds). Rapid spamming may return 429 status codes.
4. **Cloud Container Cold Starts**: On free-tier cloud platforms (like Render), inactive containers spin down after 15 minutes of inactivity; the initial request may take ~30–45 seconds to wake up.

---

## 🤖 AI Usage Honest Documentation

In compliance with academic and professional integrity standards, AI tools (Google DeepMind Antigravity) were utilized as an engineering assistant during development:

### Where AI Was Used:
- **Deployment Diagnosis**: Investigated and diagnosed the Render build error (`npm error Missing script: "build"`), discovering the root cause in the monorepo's `package.json` layout.
- **Monorepo Build Scripting**: Formulated the unified root `build` script (`npm install --prefix client && npm run build --prefix client && npm install --prefix server`) and Express static serving setup.
- **Client Configuration**: Set up Vite environment variable (`VITE_API_URL`) fallbacks and dynamic base URL detection.
- **Documentation Structuring**: Refined the README structure to be easily digestible for technical HR recruiters and code reviewers.

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

<<<<<<< HEAD
Wishlist data is stored in MongoDB rather than only in browser local storage.

This means wishlist data can remain available after closing and reopening the application.

Authentication is intentionally not included because it is not required by the assignment.

## Assumptions

* Users do not need to create an account.
* TMDB is used as the external movie data provider.
* MongoDB is used only for persistent wishlist data.
* TMDB API availability and rate limits are external dependencies.
* Movie information displayed in the application comes from TMDB.

## Limitations

* The application depends on the availability of the TMDB API.
* TMDB API rate limits may affect requests.
* No user authentication is implemented.
* The wishlist is designed for the assignment's anonymous-user use case.

## AI Usage

AI tools were used during development for:

* Understanding implementation approaches
* Debugging development issues
* Reviewing code structure
* Generating and refining UI ideas
* Improving error handling and edge-case coverage
* Assisting with documentation

All generated code was reviewed, tested, and adapted to the requirements of the application.

## Future Improvements

Possible future improvements include:

* User authentication and individual wishlists
* Advanced genre and rating filters
* Infinite scrolling
* Movie recommendations
* Caching frequently requested movie data
* Improved API rate-limit handling
* Automated testing
* Production deployment with CI/CD
* More detailed movie recommendations based on user preferences

## License

This project was created as a full-stack internship assignment and is intended for educational and demonstration purposes.

Movie data and images are provided by TMDB.

## Author
Ayush Raj
=======
- **Developer**: Ayush Raj
- **Project**: Movie Discovery & Persistent Wishlist System
- **License**: [ISC](https://opensource.org/licenses/ISC)
>>>>>>> a9af2a5 (vite)
