# Taakra MVP

**One command to run:** `npm run dev`

## Prerequisites

- **Node.js >= 18**
- Optional: **Docker** (for persistent MongoDB). Without Docker, the app uses an in-memory database for the session.

## Quick start

From the repo root:

```bash
npm run dev
```

This will:

1. Create `server/.env` and `client/.env` with safe defaults if missing
2. Download a hero video sample to `client/src/assets/hero.mp4` if missing
3. Install server and client dependencies if needed
4. Start MongoDB via Docker Compose if Docker is installed; otherwise use in-memory MongoDB
5. Start the server and client concurrently
6. Seed the database on first run (idempotent)

## Where to access

- **Client (UI):** http://localhost:5173  
- **API:** http://localhost:4000  

## Demo credentials (printed on first seed)

| Role    | Email              | Password   |
|---------|--------------------|------------|
| Admin   | admin@taakra.dev   | Admin@12345  |
| Support | support@taakra.dev | Support@12345 |
| User    | user@taakra.dev    | User@12345   |

Use **Demo credentials** on the login page to fill the form quickly.

## OAuth (optional)

The app runs without OAuth. If Google/GitHub keys are not set, OAuth buttons are hidden and a tooltip shows "OAuth not configured".

To enable OAuth:

1. **Google:** Create a project in Google Cloud Console, add OAuth 2.0 credentials, set redirect URI to `http://localhost:4000/api/auth/google/callback`. Put `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `server/.env`. Put `VITE_GOOGLE_CLIENT_ID` in `client/.env` if you need it in the client.
2. **GitHub:** Create an OAuth App, set callback URL to `http://localhost:4000/api/auth/github/callback`. Put `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `server/.env`.

No need to copy `.env.example` — the app creates `.env` with defaults on first run.

## Stack

- **Client:** React + Vite, Tailwind, React Router  
- **Server:** Node.js + Express  
- **DB:** MongoDB (Mongoose), with Docker or mongodb-memory-server  
- **Realtime:** Socket.io  
- **Auth:** JWT access + refresh, optional Google/GitHub OAuth  

## Scripts

- `npm run dev` — Bootstrap, then run server + client (recommended)
- `npm run build` — Build server and client
- `npm run start` — Run server only (after build)
