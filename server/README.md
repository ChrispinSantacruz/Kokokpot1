Kokok-Pot Backend (Express + MongoDB)

Environment variables
- MONGO_URI: MongoDB connection string (e.g., from MongoDB Atlas)
- PORT: optional port (default 8080)

Endpoints
- POST /api/auth/login { username }
  - creates user if not exists, returns { username, locked, bestScore }
- POST /api/score { username, score, spins }
  - saves a score; if spins >= 50, user is locked to avoid replay
- GET /api/leaderboard
  - returns top 100 scores

Run locally
1) cd server
2) npm i
3) set MONGO_URI=your-connection (Windows) or export MONGO_URI=...
4) npm run dev

Deploy to Render
1) Push the repo to GitHub
2) In Render, create a new Web Service from the repo subdirectory `server/`
3) Build command: `npm i`
4) Start command: `npm start`
5) Add environment variable `MONGO_URI` with your Atlas URI

MongoDB Atlas setup
1) Create a free cluster in MongoDB Atlas
2) Create a database user and allow access from 0.0.0.0/0 (or your IP)
3) Copy the connection string and set it as `MONGO_URI`

Frontend integration (Vercel)
- Set an env var in your frontend (e.g., `API_BASE=https://your-render-service.onrender.com`) and call
  - POST `${API_BASE}/api/auth/login`
  - POST `${API_BASE}/api/score`
  - GET `${API_BASE}/api/leaderboard`



