// Leaderboard and scores manager
class LeaderboardManager {
  constructor() {
    this.scores = this.loadScores()
    this.init()
  }

  init() {
    if (window.location.pathname.includes("leaderboard.html")) {
      this.setupLeaderboardPage()
    }
  }

  setupLeaderboardPage() {
    // Check authentication
    if (!localStorage.getItem("currentUser")) {
      window.location.href = "login.html"
      return
    }

    this.renderLeaderboard()
    this.setupEventListeners()
    this.startAutoRefresh()
  }

  setupEventListeners() {
    const backBtn = document.getElementById("backBtn")
    const clearBtn = document.getElementById("clearBtn")

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = "menu.html"
      })
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearLeaderboard()
      })
    }
  }

  loadScores() {
    const local = JSON.parse(localStorage.getItem("leaderboard") || "[]")
    const base = window.API_BASE
    if (base) {
      // Fetch from backend and merge (prefer backend)
      fetch(`${base}/api/leaderboard`)
        .then((r) => r.json())
        .then((remote) => {
          if (Array.isArray(remote)) {
            const normalized = remote.map((r) => ({
              player: r.username,
              score: r.score,
              date: new Date(r.createdAt).toLocaleDateString('en-US'),
              timestamp: new Date(r.createdAt).getTime(),
            }))
            this.scores = normalized
            this.renderLeaderboard()
          }
        })
        .catch(() => {})
    }
    return local
  }

  saveScores() {
    localStorage.setItem("leaderboard", JSON.stringify(this.scores))
  }

  addScore(playerName, score) {
    const newScore = {
      player: playerName,
      score: score,
      date: new Date().toLocaleDateString("es-ES"),
      timestamp: Date.now(),
    }

    this.scores.push(newScore)
    this.sortScores()
    this.saveScores()
  }

  sortScores() {
    this.scores.sort((a, b) => {
      // Sort by score desc, then by most recent date
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return b.timestamp - a.timestamp
    })
  }

  getTopScores(limit = 10) {
    return this.scores.slice(0, limit)
  }

  startAutoRefresh() {
    const base = window.API_BASE
    if (!base) return
    
    // Refrescar cada 3 segundos para actualizaciones más frecuentes
    setInterval(() => {
      this.refreshFromBackend()
    }, 3000)
    
    // También refrescar inmediatamente
    this.refreshFromBackend()
    
    // Agregar botón de refresh manual
    this.addManualRefreshButton()
  }

  async refreshFromBackend() {
    try {
      const base = window.API_BASE
      if (!base) return
      
      const response = await fetch(`${base}/api/leaderboard`)
      if (response.ok) {
        const remote = await response.json()
        if (Array.isArray(remote)) {
          const normalized = remote.map((r) => ({
            player: r.username,
            score: r.score,
            date: new Date(r.createdAt).toLocaleDateString('en-US'),
            timestamp: new Date(r.createdAt).getTime(),
          }))
          this.scores = normalized
          this.renderLeaderboard()
          console.log('🔄 Leaderboard refreshed from backend')
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to refresh leaderboard:', error)
    }
  }

  getPlayerBestScore(playerName) {
    const playerScores = this.scores.filter((score) => score.player === playerName)
    return playerScores.length > 0 ? Math.max(...playerScores.map((s) => s.score)) : 0
  }

  getPlayerRank(playerName) {
    const bestScore = this.getPlayerBestScore(playerName)
    if (bestScore === 0) return null

    const uniqueScores = [...new Set(this.scores.map((s) => s.score))].sort((a, b) => b - a)
    return uniqueScores.indexOf(bestScore) + 1
  }

  renderLeaderboard() {
    const tableBody = document.getElementById("leaderboardBody")
    if (!tableBody) return

    const topScores = this.getTopScores(20) // Mostrar top 20 en lugar de 10
    
    if (topScores.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="no-scores">
            <div>No scores yet</div>
            <div class="subtitle">Be the first to play!</div>
          </td>
        </tr>
      `
      return
    }

    tableBody.innerHTML = topScores.map((score, index) => {
      const isCurrentUser = score.player === localStorage.getItem("currentUser")
      const rowClass = isCurrentUser ? "current-user" : ""
      const position = index + 1
      const positionClass = position <= 3 ? `position-${position}` : ""
      
      return `
        <tr class="${rowClass} ${positionClass}">
          <td class="position">${position}</td>
          <td class="player">${score.player}${isCurrentUser ? ' (You)' : ''}</td>
          <td class="score">${score.score}</td>
          <td class="date">${score.date}</td>
        </tr>
      `
    }).join("")

    // Mostrar estadísticas del usuario actual
    this.showCurrentUserStats()
  }

  showCurrentUserStats() {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) return

    const userScore = this.scores.find(s => s.player === currentUser)
    if (userScore) {
      const rank = this.getPlayerRank(currentUser)
      const statsDiv = document.getElementById("currentUserStats")
      if (statsDiv) {
        statsDiv.innerHTML = `
          <div class="user-stats">
            <h3>Your Stats</h3>
            <p><strong>Current Score:</strong> ${userScore.score}</p>
            <p><strong>Rank:</strong> #${rank}</p>
            <p><strong>Best Score:</strong> ${this.getPlayerBestScore(currentUser)}</p>
          </div>
        `
        statsDiv.style.display = "block"
      }
    }
  }

  clearLeaderboard() {
    if (confirm("Are you sure you want to clear all the scores?")) {
      this.scores = []
      this.saveScores()
      this.renderLeaderboard()

      if (window.uiManager) {
        window.uiManager.showNotification("Scores cleared successfully", "success")
      }
    }
  }

  getStats() {
    if (this.scores.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        highestScore: 0,
        totalPlayers: 0,
      }
    }

    const totalGames = this.scores.length
    const totalScore = this.scores.reduce((sum, score) => sum + score.score, 0)
    const averageScore = Math.round(totalScore / totalGames)
    const highestScore = Math.max(...this.scores.map((s) => s.score))
    const uniquePlayers = new Set(this.scores.map((s) => s.player)).size

    return {
      totalGames,
      averageScore,
      highestScore,
      totalPlayers: uniquePlayers,
    }
  }
}

// CSS adicional para el leaderboard
const leaderboardCSS = `
.current-user {
    background: linear-gradient(45deg, #74b9ff, #0984e3) !important;
    color: white !important;
    font-weight: bold;
}

.current-user .score {
    color: white !important;
}

.current-user .date {
    color: rgba(255, 255, 255, 0.8) !important;
}

.leaderboard-row {
    transition: all 0.3s ease;
}

.leaderboard-row:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-leaderboard {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.empty-leaderboard p:first-child {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

@media (max-width: 480px) {
    .leaderboard-row:hover {
        transform: none;
    }
}
`

// Agregar CSS del leaderboard
if (!document.getElementById("leaderboard-styles")) {
  const style = document.createElement("style")
  style.id = "leaderboard-styles"
  style.textContent = leaderboardCSS
  document.head.appendChild(style)
}

// Inicializar el gestor de leaderboard
const leaderboardManager = new LeaderboardManager()

// Exportar para uso global
window.LeaderboardManager = LeaderboardManager
window.leaderboardManager = leaderboardManager
