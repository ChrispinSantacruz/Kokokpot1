// API base URL configuration
// By default uses localhost in dev; override by setting window.API_BASE
// or by saving localStorage.setItem('API_BASE', 'https://your-api.onrender.com')
;(function () {
  if (!window.API_BASE) {
    const saved = localStorage.getItem('API_BASE')
    if (saved) {
      window.API_BASE = saved
    } else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      window.API_BASE = 'http://localhost:8081'
    } else {
      window.API_BASE = '' // not configured
    }
  }
})()


