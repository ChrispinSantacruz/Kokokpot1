import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()

// CORS para permitir requests desde cualquier origen
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Headers para permitir scripts inline
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline' 'unsafe-eval'")
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use(express.json())

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kokokpot'
await mongoose.connect(mongoUri)

const ScoreSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  score: { type: Number, required: true },
  spins: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  locked: { type: Boolean, default: false },
  bestScore: { type: Number, default: 0 },
  spinsLeft: { type: Number, default: 30 },
  currentScore: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
})

const Score = mongoose.model('Score', ScoreSchema)
const User = mongoose.model('User', UserSchema)

// API ROUTES - DEBEN IR ANTES del static file serving
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login request received:', req.body)
  try {
    const { username } = req.body
    if (!username) return res.status(400).json({ error: 'username is required' })
    const clean = String(username).trim().slice(0, 40)
    console.log('🧹 Cleaned username:', clean)
    
    let user = await User.findOne({ username: clean })
    if (!user) {
      console.log('🆕 Creating new user:', clean)
      user = await User.create({ username: clean })
      console.log('✅ New user created:', { username: user.username, spinsLeft: user.spinsLeft, currentScore: user.currentScore })
    } else {
      console.log('👤 Existing user found:', { username: user.username, spinsLeft: user.spinsLeft, currentScore: user.currentScore, locked: user.locked })
    }
    
    res.json({
      username: user.username,
      locked: user.locked,
      bestScore: user.bestScore,
      spinsLeft: user.spinsLeft,
      currentScore: user.currentScore,
    })
  } catch (e) {
    console.error('❌ Login error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/score', async (req, res) => {
  console.log('🏆 Score request received:', req.body)
  try {
    const { username, score, spins } = req.body
    if (!username || typeof score !== 'number' || typeof spins !== 'number') {
      return res.status(400).json({ error: 'invalid_payload' })
    }
    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ error: 'user_not_found' })
    if (user.locked) return res.status(403).json({ error: 'user_locked' })

    await Score.create({ username, score, spins })
    if (score > user.bestScore) user.bestScore = score
    if (spins >= 30) user.locked = true
    user.spinsLeft = Math.max(0, 30 - spins)
    user.currentScore = score
    user.updatedAt = new Date()
    await user.save()
    res.json({ ok: true, locked: user.locked, bestScore: user.bestScore })
  } catch (e) {
    console.error('❌ Score error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/progress', async (req, res) => {
  console.log('💾 Progress request received:', req.body)
  try {
    const { username, spinsLeft, currentScore } = req.body
    console.log('📝 Parsed data:', { username, spinsLeft, currentScore, types: { username: typeof username, spinsLeft: typeof spinsLeft, currentScore: typeof currentScore } })
    
    if (!username || typeof spinsLeft !== 'number' || typeof currentScore !== 'number') {
      console.log('❌ Validation failed:', { username: !!username, spinsLeftType: typeof spinsLeft, currentScoreType: typeof currentScore })
      return res.status(400).json({ error: 'invalid_payload' })
    }
    
    console.log('🔍 Looking for user:', username)
    const user = await User.findOne({ username })
    if (!user) {
      console.log('❌ User not found:', username)
      return res.status(404).json({ error: 'user_not_found' })
    }
    
    console.log('✅ User found:', { username: user.username, currentSpinsLeft: user.spinsLeft, currentScore: user.currentScore })
    
    if (user.locked) {
      console.log('🔒 User is locked:', username)
      return res.status(403).json({ error: 'user_locked' })
    }

    const oldSpinsLeft = user.spinsLeft
    const oldCurrentScore = user.currentScore
    
    user.spinsLeft = Math.max(0, Math.min(30, spinsLeft))
    user.currentScore = Math.max(0, currentScore)
    user.updatedAt = new Date()
    
    console.log('💾 Saving user with new values:', { 
      oldSpinsLeft, 
      newSpinsLeft: user.spinsLeft, 
      oldCurrentScore, 
      newCurrentScore: user.currentScore 
    })
    
    await user.save()
    console.log('✅ User saved successfully to MongoDB')
    
    res.json({ ok: true })
  } catch (e) {
    console.error('❌ Progress error:', e)
    console.error('❌ Error stack:', e.stack)
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/leaderboard', async (_req, res) => {
  console.log('📊 Leaderboard request received')
  try {
    // Obtener scores finales (juegos completados)
    const finalScores = await Score.aggregate([
      { $sort: { score: -1, createdAt: -1 } },
      { $limit: 100 },
      { $project: { _id: 0, username: 1, score: 1, createdAt: 1, type: { $literal: 'final' } } },
    ])
    
    // Obtener scores actuales de usuarios activos
    const activeUsers = await User.find({ 
      locked: false, 
      currentScore: { $gt: 0 } 
    }).select('username currentScore updatedAt')
    
    const activeScores = activeUsers.map(user => ({
      username: user.username,
      score: user.currentScore,
      createdAt: user.updatedAt,
      type: 'active'
    }))
    
    // Combinar y ordenar todos los scores
    const allScores = [...finalScores, ...activeScores]
    allScores.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    
    // Tomar solo los top 100
    const topScores = allScores.slice(0, 100)
    
    console.log(`📊 Leaderboard: ${finalScores.length} final scores, ${activeScores.length} active scores, total: ${topScores.length}`)
    
    res.json(topScores)
  } catch (e) {
    console.error('❌ Leaderboard error:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// Debug endpoint to check users in database
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('username spinsLeft currentScore locked bestScore updatedAt')
    const scores = await Score.find({}).select('username score spins createdAt')
    res.json({ 
      users: users, 
      scores: scores,
      totalUsers: users.length,
      totalScores: scores.length
    })
  } catch (e) {
    console.error('❌ Debug error:', e)
    res.status(500).json({ error: 'debug_error' })
  }
})

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  console.log('🧪 Test route hit')
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() })
})

// DESPUÉS de las APIs, servir archivos estáticos
app.use(express.static(path.join(__dirname, '..', '..')))

// FRONTEND ROUTES
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'index.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'login.html'))
})

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'menu.html'))
})

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'game.html'))
})

app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'leaderboard.html'))
})

// Catch-all
app.get('*', (req, res) => {
  console.log(`Frontend route requested: ${req.path}`)
  res.sendFile(path.join(__dirname, '..', '..', 'index.html'))
})

const port = process.env.PORT || 8081
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
  console.log(`📁 Static files served from: ${path.join(__dirname, '..', '..')}`)
  console.log(`🎮 Frontend available at: http://localhost:${port}`)
})


