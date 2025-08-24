// Simple global audio manager for background music and SFX
;(function () {
  const AudioManager = {
    bgm: null,
    sfx: {
      click: null,
      spin: null,
      win: null,
      skull: null,
    },
    state: {
      bgmEnabled: true,
      sfxEnabled: true,
      muted: false,
    },

    init() {
      // Preload sounds
      this.sfx.click = this._createAudio('soundtrack/victoria.mp3', 0.35) // placeholder click
      this.sfx.spin = this._createAudio('soundtrack/jackpot.mp3', 0.5)
      this.sfx.win = this._createAudio('soundtrack/victoria.mp3', 0.7)
      this.sfx.skull = this._createAudio('soundtrack/calavera.mp3', 0.7)

      // Autoplay background music with user gesture fallback
      const isGame = location.pathname.includes('game.html')
      const isMenu = /menu|login|leaderboard|index/i.test(location.pathname)
      if (isGame || isMenu) {
        this.playBgm('soundtrack/menu.mp3', 0.5)
      }

      // Attach click SFX to buttons
      document.addEventListener('click', (e) => {
        const target = e.target
        if (target.closest('button') || target.closest('.btn')) {
          this.play('click')
        }
      })

      // Create mute button if it doesn't exist
      this.createMuteButton()
    },

    createMuteButton() {
      // Check if mute button already exists
      if (document.getElementById('muteBtn')) return

      const muteBtn = document.createElement('button')
      muteBtn.id = 'muteBtn'
      muteBtn.className = 'mute-button'
      muteBtn.innerHTML = '🔊'
      muteBtn.title = 'Silenciar música'
      
      // Position the button
      muteBtn.style.cssText = `
        position: fixed;
        top: 2vh;
        right: 2vw;
        width: 4vw;
        height: 4vw;
        min-width: 40px;
        min-height: 40px;
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        color: white;
        font-size: 1.5vw;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      muteBtn.addEventListener('click', () => {
        this.toggleMute()
      })

      muteBtn.addEventListener('mouseenter', () => {
        muteBtn.style.transform = 'scale(1.1)'
        muteBtn.style.background = 'rgba(0, 0, 0, 0.8)'
      })

      muteBtn.addEventListener('mouseleave', () => {
        muteBtn.style.transform = 'scale(1)'
        muteBtn.style.background = 'rgba(0, 0, 0, 0.7)'
      })

      document.body.appendChild(muteBtn)
      this.updateMuteButton()
    },

    toggleMute() {
      this.state.muted = !this.state.muted
      
      if (this.state.muted) {
        this.state.bgmEnabled = false
        this.state.sfxEnabled = false
        this.stopBgm()
      } else {
        this.state.bgmEnabled = true
        this.state.sfxEnabled = true
        // Resume BGM if we're on a page that should have it
        const isGame = location.pathname.includes('game.html')
        const isMenu = /menu|login|leaderboard|index/i.test(location.pathname)
        if (isGame || isMenu) {
          this.playBgm('soundtrack/menu.mp3', 0.5)
        }
      }
      
      this.updateMuteButton()
      
      // Save preference
      localStorage.setItem('audioMuted', this.state.muted.toString())
    },

    updateMuteButton() {
      const muteBtn = document.getElementById('muteBtn')
      if (muteBtn) {
        muteBtn.innerHTML = this.state.muted ? '🔇' : '🔊'
        muteBtn.title = this.state.muted ? 'Activar música' : 'Silenciar música'
      }
    },

    _createAudio(src, volume = 1) {
      const a = new Audio(src)
      a.volume = Math.max(0, Math.min(volume, 1))
      a.preload = 'auto'
      return a
    },

    playBgm(src, volume = 0.5) {
      if (!this.state.bgmEnabled) return
      
      try {
        if (this.bgm) {
          if (this.bgm.src.includes(src)) return
          this.bgm.pause()
        }
        this.bgm = new Audio(src)
        this.bgm.loop = true
        this.bgm.volume = Math.max(0, Math.min(volume, 1))
        const play = this.bgm.play()
        if (play && play.catch) {
          play.catch(() => {
            // Wait for first user interaction
            const resume = () => {
              if (this.state.bgmEnabled && this.bgm) {
                this.bgm.play().catch(() => {})
              }
              document.removeEventListener('pointerdown', resume)
            }
            document.addEventListener('pointerdown', resume, { once: true })
          })
        }
      } catch (_) {}
    },

    stopBgm() {
      if (this.bgm) this.bgm.pause()
    },

    play(key) {
      if (!this.state.sfxEnabled) return
      
      const a = this.sfx[key]
      if (!a) return
      try {
        a.currentTime = 0
        a.play().catch(() => {})
      } catch (_) {}
    },

    stop(key) {
      const a = this.sfx[key]
      if (a) a.pause()
    },

    // Load saved mute state
    loadMuteState() {
      const savedMuted = localStorage.getItem('audioMuted')
      if (savedMuted !== null) {
        this.state.muted = savedMuted === 'true'
        if (this.state.muted) {
          this.state.bgmEnabled = false
          this.state.sfxEnabled = false
        }
      }
    },
  }

  // Load saved mute state before init
  AudioManager.loadMuteState()

  // expose
  window.AudioManager = AudioManager
  document.addEventListener('DOMContentLoaded', () => AudioManager.init())
})()



