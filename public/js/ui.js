// Gestión de la interfaz de usuario y efectos visuales
class UIManager {
  constructor() {
    this.init()
  }

  init() {
    this.setupAnimations()
    this.setupResponsiveHandling()
  }

  setupAnimations() {
    // Animaciones de entrada para elementos
    this.animateOnLoad()

    // Efectos de hover mejorados
    this.enhanceButtonEffects()
  }

  animateOnLoad() {
    const elements = document.querySelectorAll(".game-title, .btn, .info-item")
    elements.forEach((element, index) => {
      element.style.opacity = "0"
      element.style.transform = "translateY(20px)"

      setTimeout(() => {
        element.style.transition = "all 0.6s ease"
        element.style.opacity = "1"
        element.style.transform = "translateY(0)"
      }, index * 100)
    })
  }

  enhanceButtonEffects() {
    const buttons = document.querySelectorAll(".btn")
    buttons.forEach((button) => {
      // Evitar efectos en el botón back fijo para no provocar "saltos"
      if (button.classList.contains('btn-back')) return
      button.addEventListener("mouseenter", (e) => {
        this.createRippleEffect(e)
      })
    })
  }

  createRippleEffect(e) {
    const button = e.currentTarget
    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `

    button.style.position = "relative"
    button.style.overflow = "hidden"
    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  setupResponsiveHandling() {
    // Ajustar UI según el tamaño de pantalla
    this.handleResize()
    window.addEventListener("resize", () => this.handleResize())
  }

  handleResize() {
    const isMobile = window.innerWidth <= 768
    const gameInfo = document.querySelector(".game-info")

    if (gameInfo) {
      if (isMobile) {
        gameInfo.style.gridTemplateColumns = "1fr"
      } else {
        gameInfo.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))"
      }
    }
  }

  // Efectos especiales para el juego
  createJackpotEffect() {
    const container = document.createElement("div")
    container.className = "jackpot-animation"
    document.body.appendChild(container)

    // Crear confetti
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        this.createConfetti(container)
      }, i * 50)
    }

    // Remover después de la animación
    setTimeout(() => {
      container.remove()
    }, 4000)
  }

  createConfetti(container) {
    const confetti = document.createElement("div")
    confetti.className = "confetti"

    const colors = ["#f39c12", "#e74c3c", "#9b59b6", "#3498db", "#2ecc71"]
    const color = colors[Math.floor(Math.random() * colors.length)]

    confetti.style.cssText = `
            left: ${Math.random() * 100}%;
            background: ${color};
            animation-delay: ${Math.random() * 2}s;
            animation-duration: ${2 + Math.random() * 2}s;
        `

    container.appendChild(confetti)

    setTimeout(() => {
      confetti.remove()
    }, 4000)
  }

  showNotification(message, type = "info", duration = 3000) {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.textContent = message

    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `

    // Colores según el tipo
    const colors = {
      info: "linear-gradient(45deg, #74b9ff, #0984e3)",
      success: "linear-gradient(45deg, #00b894, #00a085)",
      warning: "linear-gradient(45deg, #fdcb6e, #e17055)",
      error: "linear-gradient(45deg, #fd79a8, #e84393)",
    }

    notification.style.background = colors[type] || colors.info

    document.body.appendChild(notification)

    // Animación de entrada
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Animación de salida
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, duration)
  }

  // Efectos de sonido simulados con vibraciones (móvil)
  vibrate(pattern = [100]) {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // Feedback táctil para acciones importantes
  provideFeedback(type) {
    switch (type) {
      case "spin":
        this.vibrate([50, 50, 50])
        break
      case "win":
        this.vibrate([100, 50, 100, 50, 200])
        break
      case "jackpot":
        this.vibrate([200, 100, 200, 100, 200, 100, 400])
        this.createJackpotEffect()
        break
      case "freespin":
        this.vibrate([150, 75, 150])
        break
    }
  }

  // Animación de contador de puntuación
  animateScore(element, startValue, endValue, duration = 1000) {
    const startTime = performance.now()
    const difference = endValue - startValue

    const updateScore = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Función de easing
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + difference * easeOutQuart)

      element.textContent = currentValue

      if (progress < 1) {
        requestAnimationFrame(updateScore)
      } else {
        element.textContent = endValue
      }
    }

    requestAnimationFrame(updateScore)
  }

  // Mostrar tooltip
  showTooltip(element, message, position = "top") {
    const tooltip = document.createElement("div")
    tooltip.className = "tooltip"
    tooltip.textContent = message

    tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.9rem;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `

    document.body.appendChild(tooltip)

    const rect = element.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()

    let left, top

    switch (position) {
      case "top":
        left = rect.left + (rect.width - tooltipRect.width) / 2
        top = rect.top - tooltipRect.height - 8
        break
      case "bottom":
        left = rect.left + (rect.width - tooltipRect.width) / 2
        top = rect.bottom + 8
        break
      case "left":
        left = rect.left - tooltipRect.width - 8
        top = rect.top + (rect.height - tooltipRect.height) / 2
        break
      case "right":
        left = rect.right + 8
        top = rect.top + (rect.height - tooltipRect.height) / 2
        break
    }

    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`
    tooltip.style.opacity = "1"

    return tooltip
  }
}

// CSS adicional para efectos
const additionalCSS = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.notification {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tooltip {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tooltip::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}
`

// Agregar CSS adicional
if (!document.getElementById("ui-effects")) {
  const style = document.createElement("style")
  style.id = "ui-effects"
  style.textContent = additionalCSS
  document.head.appendChild(style)
}

// Inicializar UI Manager
const uiManager = new UIManager()

// Exportar para uso global
window.UIManager = UIManager
window.uiManager = uiManager
