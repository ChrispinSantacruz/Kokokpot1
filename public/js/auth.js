// Authentication and sessions management
class AuthManager {
  constructor() {
    this.currentUser = localStorage.getItem("currentUser")
    this.initializeAuth()
  }

  initializeAuth() {
    // If we are on the login page, set up the form
    if (window.location.pathname.includes("login.html")) {
      this.setupLoginForm()
    }
  }

  setupLoginForm() {
    const loginBtn = document.getElementById("loginBtn")
    const playerNameInput = document.getElementById("playerName")
    const errorDiv = document.getElementById("loginError")

    if (loginBtn && playerNameInput) {
      loginBtn.addEventListener("click", () => {
        this.handleLogin()
      })

      playerNameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleLogin()
        }
      })

      // Limpiar error al escribir
      playerNameInput.addEventListener("input", () => {
        errorDiv.textContent = ""
        playerNameInput.style.borderColor = "#ddd"
      })
    }
  }

  handleLogin() {
    const playerNameInput = document.getElementById("playerName")
    const errorDiv = document.getElementById("loginError")
    const playerName = playerNameInput.value.trim()

    // Validation
    if (!playerName) {
      this.showError("Please enter your name", errorDiv, playerNameInput)
      return
    }

    if (playerName.length < 2) {
      this.showError("Name must have at least 2 characters", errorDiv, playerNameInput)
      return
    }

    if (playerName.length > 20) {
      this.showError("Name cannot exceed 20 characters", errorDiv, playerNameInput)
      return
    }

    // Validate allowed characters
    const validNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/
    if (!validNameRegex.test(playerName)) {
      this.showError("Name can only contain letters, numbers and spaces", errorDiv, playerNameInput)
      return
    }

    // Successful login
    this.login(playerName)
  }

  showError(message, errorDiv, inputElement) {
    // Do not print error messages to the UI
    if (errorDiv) errorDiv.textContent = ""

    // Shake the login button
    const loginBtn = document.getElementById("loginBtn")
    if (loginBtn) {
      loginBtn.style.animation = "shake 0.5s ease-in-out"
      setTimeout(() => {
        loginBtn.style.animation = ""
      }, 500)
    }
  }

  login(playerName) {
    const proceedLocal = () => {
      localStorage.setItem("currentUser", playerName)
      this.currentUser = playerName
      this.registerPlayer(playerName)
      window.location.href = "menu.html"
    }

    // Try backend login if configured
    const base = window.API_BASE
    if (base) {
      fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: playerName }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.username) {
            if (data.locked) {
              alert('This player has already completed the game. Choose another name.')
              return
            }
            // Persist local session and progress
            localStorage.setItem("currentUser", data.username)
            if (typeof data.spinsLeft === 'number') localStorage.setItem('spinsLeft', String(data.spinsLeft))
            if (typeof data.currentScore === 'number') localStorage.setItem('currentScore', String(data.currentScore))
            proceedLocal()
          } else {
            proceedLocal()
          }
        })
        .catch(() => proceedLocal())
    } else {
      proceedLocal()
    }
  }

  logout() {
    localStorage.removeItem("currentUser")
    this.currentUser = null
    window.location.href = "index.html"
  }

  registerPlayer(playerName) {
    const players = JSON.parse(localStorage.getItem("registeredPlayers") || "[]")

    if (!players.includes(playerName)) {
      players.push(playerName)
      localStorage.setItem("registeredPlayers", JSON.stringify(players))
    }
  }

  isAuthenticated() {
    return !!this.currentUser
  }

  getCurrentUser() {
    return this.currentUser
  }
}

// Función global para logout
function logout() {
  const auth = new AuthManager()
  auth.logout()
}

// CSS para animación de shake
const shakeCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`

// Agregar CSS al documento
if (!document.getElementById("shake-animation")) {
  const style = document.createElement("style")
  style.id = "shake-animation"
  style.textContent = shakeCSS
  document.head.appendChild(style)
}

// Inicializar el gestor de autenticación
const authManager = new AuthManager()
