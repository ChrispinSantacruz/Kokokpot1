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
    },

    _createAudio(src, volume = 1) {
      const a = new Audio(src)
      a.volume = Math.max(0, Math.min(volume, 1))
      a.preload = 'auto'
      return a
    },

    playBgm(src, volume = 0.5) {
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
              this.bgm && this.bgm.play().catch(() => {})
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
  }

  // expose
  window.AudioManager = AudioManager
  document.addEventListener('DOMContentLoaded', () => AudioManager.init())
})()



