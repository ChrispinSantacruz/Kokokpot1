// Lógica principal del juego de tragamonedas
class SlotMachine {
  constructor() {
    // Nuevo set de símbolos basados en imágenes
    this.symbols = ["cereza", "campana", "diamante", "siete", "estrella", "negativo1", "negativo2"]

    // Mapeo de símbolos a assets
    this.symbolAssets = {
      cereza: "images/ruleta/ruleta/cereza.png",
      campana: "images/ruleta/ruleta/campana.png",
      diamante: "images/ruleta/ruleta/diamante.png",
      siete: "images/ruleta/ruleta/siete.png",
      estrella: "images/ruleta/ruleta/estrella.png",
      negativo1: "images/ruleta/ruleta/negativo1.png",
      negativo2: "images/ruleta/ruleta/negativo2.png",
    }

    this.currentUser = localStorage.getItem("currentUser")
    // 30 giros base y restauración desde progreso local
    this.spinsLeft = parseInt(localStorage.getItem('spinsLeft') || '30', 10)
    if (Number.isNaN(this.spinsLeft) || this.spinsLeft < 0 || this.spinsLeft > 30) this.spinsLeft = 30
    this.freeSpins = 0
    this.currentScore = parseInt(localStorage.getItem('currentScore') || '0', 10)
    if (Number.isNaN(this.currentScore) || this.currentScore < 0) this.currentScore = 0
    this.isSpinning = false
    this.maxFreeSpinsPerGame = 10
    this.freeSpinsUsed = 0

    // Score table simplificado - solo combinaciones de 3 símbolos iguales
    this.scoreTable = {
      sietesietesiete: 300,      // Jackpot
      estrellaestrellaestrella: 270,  // Wild x3
      diamantediamantediamante: 150,  // Diamante x3
      campanacampanacampana: 100,     // Campana x3
      cerezacerezacereza: 40,         // Cereza x3
      negativo1negativo1negativo1: -25, // Negativo1 x3
      negativo2negativo2negativo2: -10, // Negativo2 x3
    }

    // Weights per reel (sum 100) - ajustados para mayor balance
    this.symbolWeights = {
      siete: 8,       // Reducido a 8% como solicitado
      diamante: 12,   // Mantenido
      campana: 15,    // Mantenido
      cereza: 35,     // Mantenido
      estrella: 15,   // Aumentado a 15% como solicitado
      negativo1: 10,  // Aumentado a 10% como solicitado
      negativo2: 10,  // Aumentado a 10% como solicitado
    }

    this.init()
  }

  init() {
    // Check authentication
    if (!this.currentUser) {
      window.location.href = "login.html"
      return
    }

    this.setupUI()
    this.setupEventListeners()
    this.updateDisplay()
  }

  setupUI() {
    document.getElementById("currentPlayer").textContent = this.currentUser
    this.updateDisplay()
  }

  setupEventListeners() {
    const spinBtn = document.getElementById("spinBtn")
    const backBtn = document.getElementById("backBtn")
    const playAgainBtn = document.getElementById("playAgainBtn")
    const menuBtn = document.getElementById("menuBtn")
    const restartBtn = document.getElementById("restartBtn")
    const palanca = document.getElementById("palanca")

    spinBtn.addEventListener("click", () => this.spin())
    backBtn.addEventListener("click", () => (window.location.href = "menu.html"))

    if (palanca) {
      palanca.addEventListener("click", () => this.spin())
      palanca.addEventListener("mouseenter", () => {
        palanca.style.backgroundImage = "url('images/palanca2.png')"
      })
      palanca.addEventListener("mouseleave", () => {
        palanca.style.backgroundImage = "url('images/palanca1.png')"
      })
    }

    if (playAgainBtn) {
      playAgainBtn.addEventListener("click", () => this.resetGame())
    }

    if (menuBtn) {
      menuBtn.addEventListener("click", () => (window.location.href = "menu.html"))
    }

    if (restartBtn) {
      restartBtn.addEventListener("click", () => this.restartGame())
    }
  }

  updateDisplay() {
    document.getElementById("spinsLeft").textContent = this.spinsLeft
    document.getElementById("freeSpins").textContent = this.freeSpins
    document.getElementById("currentScore").textContent = this.currentScore

    const spinBtn = document.getElementById("spinBtn")
    const restartBtn = document.getElementById("restartBtn")

    if (this.isSpinning) {
      spinBtn.disabled = true
      spinBtn.textContent = "🎰 SPINNING..."
      if (restartBtn) restartBtn.style.display = "none"
    } else if (this.spinsLeft <= 0 && this.freeSpins <= 0) {
      spinBtn.disabled = true
      spinBtn.textContent = "🎰 GAME OVER"
      if (restartBtn) restartBtn.style.display = "block"
      this.endGame()
    } else {
      spinBtn.disabled = false
      if (restartBtn) restartBtn.style.display = "none"
      if (this.freeSpins > 0) {
        spinBtn.textContent = "🎰 FREE SPIN"
      } else {
        spinBtn.textContent = "🎰 SPIN"
      }
    }
  }

  async spin() {
    if (this.isSpinning || (this.spinsLeft <= 0 && this.freeSpins <= 0)) {
      return
    }

    this.isSpinning = true
    this.updateDisplay()

    // Start spin SFX
    if (window.AudioManager) {
      AudioManager.play('spin')
    }

    const isFreeSpin = this.freeSpins > 0
    if (isFreeSpin) {
      this.freeSpins--
    } else {
      this.spinsLeft--
    }

    this.clearMessages()

    try {
      await this.animateReels()
      const result = this.generateResult()
      this.displayResult(result)

      const points = this.calculateScore(result)
      if (points !== 0) {
        this.currentScore += points
        if (this.currentScore < 0) this.currentScore = 0
        if (points > 0) {
          this.showMessage(`🎉 +${points} points!`, "win")
          if (window.AudioManager) {
            AudioManager.stop('spin')
            AudioManager.play('win')
          }
        } else {
          this.showMessage(`💀 ${points} points!`, "lose")
          if (window.AudioManager) {
            AudioManager.stop('spin')
            AudioManager.play('skull')
          }
        }
      }
      // Ya no necesitamos el else porque siempre habrá un resultado

      if (!isFreeSpin) {
        this.checkForFreeSpins(result)
      }
      // Guardar progreso parcial (spinsLeft y currentScore)
      localStorage.setItem('spinsLeft', String(this.spinsLeft))
      localStorage.setItem('currentScore', String(this.currentScore))
      const base = window.API_BASE
      if (base) {
        fetch(`${base}/api/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.currentUser, spinsLeft: this.spinsLeft, currentScore: this.currentScore }),
        }).catch(() => { })
      }
    } catch (error) {
      console.error("Error durante el giro:", error)
    } finally {
      this.isSpinning = false
      this.updateDisplay()
      // Stop spinning SFX if still playing and no win/lose was triggered
      if (window.AudioManager) {
        AudioManager.stop('spin')
      }
    }
  }

  async animateReels() {
    const slots = Array.from(document.querySelectorAll('.reel .symbol'))
    const images = Object.values(this.symbolAssets)

    const start = performance.now()
    const total = 1700 + Math.random() * 900 // 1.7s - 2.6s

    // Curvas de easing para efecto aceleración/desaceleración
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
    const easeInCubic = (t) => t * t * t

    return new Promise((resolve) => {
      const tick = (now) => {
        const elapsed = now - start
        const p = Math.min(elapsed / total, 1)

        // Fase 1: acelera rápido (0 -> 0.35)
        // Fase 2: velocidad constante (0.35 -> 0.75)
        // Fase 3: desacelera (0.75 -> 1)
        let speedFactor
        if (p < 0.35) speedFactor = easeInCubic(p / 0.35) * 1.0 + 0.2
        else if (p < 0.75) speedFactor = 1.2
        else speedFactor = 1.2 - easeOutCubic((p - 0.75) / 0.25) * 1.0

        // Determina cada cuánto cambiar una imagen según la fase
        const interval = 60 / Math.max(0.25, speedFactor) // ms entre cambios

        if (!tick.lastSwap || now - tick.lastSwap > interval) {
          slots.forEach((el, idx) => {
            const img = document.createElement('img')
            img.src = images[Math.floor(Math.random() * images.length)]
            img.className = 'slot-icon'
            el.innerHTML = ''
            el.appendChild(img)
          })
          tick.lastSwap = now
        }

        if (p < 1) requestAnimationFrame(tick)
        else resolve()
      }
      requestAnimationFrame(tick)
    })
  }

  generateResult() {
    // Siempre generar 3 símbolos iguales para que siempre haya un resultado
    const random = Math.random() * 100
    let cumulativeWeight = 0
    let selectedSymbol = "cereza"

    // Seleccionar un símbolo basado en los pesos
    for (const [symbol, weight] of Object.entries(this.symbolWeights)) {
      cumulativeWeight += weight
      if (random < cumulativeWeight) {
        selectedSymbol = symbol
        break
      }
    }

    // Retornar 3 símbolos idénticos
    return [selectedSymbol, selectedSymbol, selectedSymbol]
  }

  displayResult(result) {
    const reels = document.querySelectorAll(".reel .symbol")
    result.forEach((symbol, index) => {
      if (reels[index]) {
        const imgSrc = this.symbolAssets[symbol] || ""
        if (imgSrc) {
          reels[index].innerHTML = `<img src="${imgSrc}" alt="${symbol}" class="slot-icon" />`
          reels[index].classList.remove('settle-bounce')
          // Rebote sutil al asentarse
          setTimeout(() => reels[index].classList.add('settle-bounce'), 0)
        } else {
          reels[index].textContent = symbol
        }
      }
    })

    if (this.isWinningCombination(result)) {
      document.querySelectorAll(".reel").forEach((reel) => {
        reel.classList.add("winning")
      })

      setTimeout(() => {
        document.querySelectorAll(".reel").forEach((reel) => {
          reel.classList.remove("winning")
        })
      }, 1000)
    }
  }

  calculateScore(result) {
    const combination = result.join("")

    // Solo verificar combinaciones exactas de 3 símbolos iguales
    if (this.scoreTable[combination] !== undefined) {
      return this.scoreTable[combination]
    }

    // Si no hay combinación de 3 iguales, no hay puntos
    return 0
  }

  isWinningCombination(result) {
    return this.calculateScore(result) > 0
  }

  checkForFreeSpins(result) {
    if (this.freeSpinsUsed >= this.maxFreeSpinsPerGame) return

    let freeSpinsWon = 0
    let message = ""

    // Solo diamante x3 = +1 giro (más difícil)
    const diamondCount = result.filter((symbol) => symbol === "diamante").length
    if (diamondCount === 3) {
      freeSpinsWon++
      message = "💎 Triple diamond! You win an extra spin."
    }

    // Solo estrella x3 = +2 giros (más difícil)
    const starCount = result.filter((symbol) => symbol === "estrella").length
    if (starCount === 3) {
      freeSpinsWon += 2
      message = message ? `${message} ⭐ Triple wild! +2 extra spins.` : "⭐ Triple wild! You win 2 extra spins."
    }

    if (freeSpinsWon > 0) {
      const actualFreeSpins = Math.min(
        freeSpinsWon,
        this.maxFreeSpinsPerGame - this.freeSpinsUsed,
      )
      this.freeSpins += actualFreeSpins
      this.freeSpinsUsed += actualFreeSpins
      this.showMessage(message, "bonus")
      this.createFreeSpinEffect()
    }
  }

  createFreeSpinEffect() {
    const effect = document.createElement("div")
    effect.className = "free-spin-effect"
    effect.textContent = "🌟 FREE SPIN 🌟"

    const slotMachine = document.querySelector(".slot-machine")
    slotMachine.appendChild(effect)

    setTimeout(() => {
      effect.remove()
    }, 2000)
  }

  showMessage(text, type = "info") {
    const messageArea = document.getElementById("messageArea")
    messageArea.innerHTML = `<div class="message ${type}">${text}</div>`

    setTimeout(() => {
      messageArea.innerHTML = ""
    }, 3000)
  }

  clearMessages() {
    const messageArea = document.getElementById("messageArea")
    messageArea.innerHTML = ""
  }

  endGame() {
    this.saveScore()

    setTimeout(() => {
      document.getElementById("finalScore").textContent = this.currentScore
      document.getElementById("gameOverModal").style.display = "block"
    }, 1000)
  }

  saveScore() {
    // Save locally
    const scores = JSON.parse(localStorage.getItem("leaderboard") || "[]")
    const newScore = {
      player: this.currentUser,
      score: this.currentScore,
      date: new Date().toLocaleDateString("en-US"),
      timestamp: Date.now(),
    }
    scores.push(newScore)
    scores.sort((a, b) => b.score - a.score)
    localStorage.setItem("leaderboard", JSON.stringify(scores.slice(0, 50)))

    // Save to backend if configured
    const base = window.API_BASE
    if (base) {
      fetch(`${base}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.currentUser, score: this.currentScore, spins: 30 }),
      }).catch(() => { })
    }
  }

  async saveProgress() {
    try {
      const base = window.API_BASE
      if (base) {
        const response = await fetch(`${base}/api/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.currentUser,
            spinsLeft: this.spinsLeft,
            currentScore: this.currentScore
          })
        })

        if (response.ok) {
          console.log('✅ Progress saved successfully')
          // También actualizar el leaderboard local para mostrar el score actual
          this.updateLocalLeaderboard()
        } else {
          console.error('❌ Failed to save progress:', response.status)
        }
      }
    } catch (error) {
      console.error('❌ Error saving progress:', error)
    }
  }

  updateLocalLeaderboard() {
    // Actualizar el leaderboard local con el score actual
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]')

    // Buscar si ya existe un score para este usuario
    const existingIndex = leaderboard.findIndex(score => score.player === this.currentUser)

    if (existingIndex >= 0) {
      // Actualizar score existente si es mejor
      if (this.currentScore > leaderboard[existingIndex].score) {
        leaderboard[existingIndex].score = this.currentScore
        leaderboard[existingIndex].date = new Date().toLocaleDateString('en-US')
        leaderboard[existingIndex].timestamp = Date.now()
      }
    } else {
      // Agregar nuevo score
      leaderboard.push({
        player: this.currentUser,
        score: this.currentScore,
        date: new Date().toLocaleDateString('en-US'),
        timestamp: Date.now()
      })
    }

    // Ordenar por score descendente
    leaderboard.sort((a, b) => b.score - a.score)

    // Guardar en localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard))

    // Si estamos en la página del leaderboard, actualizarla
    if (window.location.pathname.includes('leaderboard.html') && window.leaderboardManager) {
      window.leaderboardManager.renderLeaderboard()
    }
  }

  resetGame() {
    this.spinsLeft = 30
    this.freeSpins = 0
    this.currentScore = 0
    this.isSpinning = false
    this.freeSpinsUsed = 0

    this.updateDisplay()
    this.clearMessages()

    const modal = document.getElementById("gameOverModal")
    if (modal) modal.style.display = "none"

    // Mantener los símbolos iniciales definidos en el HTML (3 sietes)
    // No vaciar los reels aquí

    document.querySelectorAll(".reel").forEach((reel) => {
      reel.classList.remove("spinning", "winning")
    })

    this.showMessage("🎮 Game reset to 30 spins! Good luck!", "info")
  }

  restartGame() {
    if (this.isSpinning) return
    this.resetGame()
  }

  debugProbabilities(spins = 1000) {
    const results = {}
    const symbolCounts = {}

    this.symbols.forEach((symbol) => {
      symbolCounts[symbol] = 0
    })

    for (let i = 0; i < spins; i++) {
      const result = this.generateResult()
      result.forEach((symbol) => {
        symbolCounts[symbol]++
      })

      const score = this.calculateScore(result)
      if (score !== 0) {
        const key = score > 0 ? `win_${score}` : `lose_${Math.abs(score)}`
        results[key] = (results[key] || 0) + 1
      }
    }

    console.log(`=== PROBABILIDADES SIMULADAS (${spins} giros) ===`)
    console.log("Símbolos por carrete:")
    this.symbols.forEach((symbol) => {
      const percentage = ((symbolCounts[symbol] / (spins * 3)) * 100).toFixed(2)
      console.log(`${symbol}: ${percentage}% (esperado: ${this.symbolWeights[symbol]}%)`)
    })

    console.log("\nCombinaciones ganadoras:")
    Object.entries(results).forEach(([key, count]) => {
      const percentage = ((count / spins) * 100).toFixed(2)
      console.log(`${key}: ${percentage}% (${count}/${spins})`)
    })

    const jackpotProb = results["win_300"] || 0
    const jackpotPercentage = ((jackpotProb / spins) * 100).toFixed(2)
    const jackpotIn50Spins = ((1 - Math.pow(1 - jackpotProb / spins, 30)) * 100).toFixed(2)

    console.log(`\n🎰 JACKPOT (siete x3):`)
    console.log(`- Por giro: ${jackpotPercentage}%`)
    console.log(`- En 30 giros: ${jackpotIn50Spins}%`)
    console.log(`- Frecuencia esperada: 1 en ~${(100 / parseFloat(jackpotPercentage)).toFixed(1)} giros`)

    return { symbolCounts, results }
  }
}

// Inicializar el juego cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("game.html")) {
    new SlotMachine()
  }
})
