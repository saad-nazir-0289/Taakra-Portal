

<h1 align="center">Taakra</h1>
<h3 align="center">Compete. Win. Shine.</h3>

<p align="center">
  <strong>A modern competition platform where creators compete, hit deadlines, and climb the leaderboard.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js" alt="Node" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47a248?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io" alt="Socket.io" />
</p>

---

## ✨ Overview

**Taakra** is a full-stack competition platform built for creators who want to participate in design, tech, and creative challenges. Browse competitions by category, register with one click, track deadlines on your calendar, and message support in real-time—all in a sleek dark-themed interface with sky-blue accents.

> **Zero to run:** One command gets you from clone to fully working app. No manual config, no env copy-paste—just `npm run dev`.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **Docker** (optional, for persistent MongoDB—otherwise in-memory DB is used)

### One Command

```bash
git clone https://github.com/saad-nazir-0289/taakra.git
cd taakra
npm run dev
```

That's it. The bootstrap script will:

1. Create `server/.env` and `client/.env` with safe defaults
2. Download a hero video sample if missing
3. Install server and client dependencies
4. Start MongoDB via Docker (or fallback to in-memory)
5. Seed the database on first run
6. Start the app

### URLs

| Service | URL |
|---------|-----|
| **Client (UI)** | http://localhost:5173 |
| **API** | http://localhost:4000 |

---

## 📸 Screenshots

| Landing | Competitions | Dashboard |
|---------|--------------|-----------|
| <img width="1920" height="878" alt="hero section" src="https://github.com/user-attachments/assets/32a3d091-e16c-416b-883e-6c25428a7684" />| <img width="1920" height="878" alt="competitions" src="https://github.com/user-attachments/assets/233b47eb-ad5d-4153-8f08-0328de7564a7" />| <img width="1920" height="878" alt="registerations user" src="https://github.com/user-attachments/assets/1a9cc665-58ba-4f97-82e0-b3cd8ee34f44" />|

| Admin Overview | Support Chat |
|----------------|--------------|
| <img width="1897" height="960" alt="admin overview" src="https://github.com/user-attachments/assets/71868bd3-a17f-432b-b6a2-2750d61d4a67" />| <img width="1920" height="878" alt="support chat" src="https://github.com/user-attachments/assets/40b62279-05cd-4b6b-8c4c-7b5edd47cbf1" />|



---

## 🎫 Demo Credentials

Use the **"Use demo credentials"** link on the login page to auto-fill the form.

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@taakra.dev | Admin@12345 |
| **Support** | support@taakra.dev | Support@12345 |
| **User** | user@taakra.dev | User@12345 |

---

## 🛠 Features

### Public

- **Landing page** — Hero video, trending preview, categories, "How it works"
- **Competitions list** — Sort by Most Registrations, Trending, New; filter by category and date; search
- **Competition detail** — Rules, prizes, deadlines, registration count, one-click register

### Authentication & Roles

- **Local signup/login** — bcrypt-hashed passwords, validation
- **JWT** — Access + refresh token rotation, logout invalidates refresh
- **Roles** — USER, SUPPORT, ADMIN with server-side RBAC
- **Blocked users** — Cannot login or refresh
- **OAuth** — Google & GitHub (optional; app runs without keys—buttons hidden if unconfigured)

### User

- **Dashboard** — Registered competitions with status (pending/approved/rejected)
- **Calendar** — Monthly view + agenda of upcoming deadlines
- **Profile** — Edit name, avatar URL, change password
- **Support chat** — Real-time messaging with support, unread badge
- **AI Chatbot** — Ask about deadlines, registration, trending (OpenAI if key set, else rules engine)

### Support / Admin

- **Inbox** — All chat threads, respond to users
- **Registrations** — Approve or reject
- **CRUD** — Competitions and categories (Admin)
- **Users** — List, block/unblock, change roles (Admin)
- **Support management** — Promote/demote SUPPORT role (Admin)
- **Analytics** — Counts, top 5 by registrations (Admin)

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Mongoose), Docker or mongodb-memory-server |
| **Realtime** | Socket.io |
| **Auth** | JWT (access + refresh), Passport (Google/GitHub OAuth) |
| **Validation** | Zod |

---

## 📁 Project Structure

```
taakra/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Home, Competitions, Dashboard, Admin, etc.
│   │   ├── layouts/        # Public, Dashboard
│   │   ├── context/        # Auth, Socket
│   │   └── lib/            # API client
│   └── public/
├── server/                 # Express backend
│   ├── src/
│   │   ├── models/         # User, Category, Competition, Registration, Chat
│   │   ├── routes/         # auth, competitions, users, chat, admin
│   │   ├── middleware/     # auth, rbac, validate, errorHandler
│   │   └── lib/            # tokens, passport
│   └── scripts/
│       └── seed.mjs
├── scripts/
│   └── bootstrap.mjs       # Zero-to-run orchestration
├── docker-compose.yml      # MongoDB
└── package.json
```

---

## ⚙️ Configuration

### Environment

The app **creates `.env` files automatically** on first run. No manual copy from `.env.example`.

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | mongodb://localhost:27017/taakra | MongoDB connection |
| `USE_MEMORY_DB` | 0 | Set to 1 if no Docker |
| `JWT_ACCESS_SECRET` | (dev default) | Change in production |
| `JWT_REFRESH_SECRET` | (dev default) | Change in production |

### OAuth (Optional)

- **Google:** Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `server/.env`
- **GitHub:** Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `server/.env`
- Callback URLs: `http://localhost:4000/api/auth/{google|github}/callback`

If keys are missing, OAuth buttons are hidden and a tooltip shows "OAuth not configured."

### OpenAI (Optional)

Set `OPENAI_API_KEY` in `server/.env` for the AI chatbot. Without it, a rules-based fallback answers: upcoming deadlines, how to register, trending competitions.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Bootstrap + run server & client (recommended) |
| `npm run build` | Build server and client |
| `npm run start` | Run production server |
| `npm run lint` | Lint server and client |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available for use under the MIT License.

---

<p align="center">
  <strong>Taakra</strong> — Compete. Win. Shine. ✨
</p>
