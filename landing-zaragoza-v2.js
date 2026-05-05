// ── SOLD OUT CONFIG ──
// Cambia a true para marcar una entrada como agotada
const SOLD_OUT = {
  silver: false,
  gold: false,
  platinum: false,
  diamond: false,
  "silver-online": false,
  "gold-online": false,
}

function applySoldOut() {
  const soldOutHTML =
    '<div class="pricing-soldout-label">' +
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">' +
    '<circle cx="6" cy="6" r="5.5" stroke="#999" stroke-width="1.2"/>' +
    '<path d="M4 4l4 4M8 4l-4 4" stroke="#999" stroke-width="1.2" stroke-linecap="round"/>' +
    "</svg>" +
    "AGOTADO · SOLD OUT" +
    "</div>"

  const diamondSoldOutHTML =
    '<div class="pricing-diamond-soldout-label">' +
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">' +
    '<circle cx="6" cy="6" r="5.5" stroke="#666" stroke-width="1.2"/>' +
    '<path d="M4 4l4 4M8 4l-4 4" stroke="#666" stroke-width="1.2" stroke-linecap="round"/>' +
    "</svg>" +
    "AGOTADO · SOLD OUT" +
    "</div>"

  Object.entries(SOLD_OUT).forEach(([ticket, isSoldOut]) => {
    if (!isSoldOut) return

    if (ticket === "diamond") {
      const el = document.querySelector('[data-ticket="diamond"]')
      if (!el) return
      el.classList.add("pricing-diamond-featured--soldout")
      const btn = el.querySelector(".btn")
      if (btn) {
        btn.textContent = "Agotado"
        btn.removeAttribute("href")
        btn.insertAdjacentHTML("afterend", diamondSoldOutHTML)
      }
    } else {
      const el = document.querySelector('[data-ticket="' + ticket + '"]')
      if (!el) return
      el.classList.add("pricing-card--soldout")
      const btn = el.querySelector(".btn")
      if (btn) {
        btn.textContent = "Agotado"
        btn.removeAttribute("href")
        btn.insertAdjacentHTML("afterend", soldOutHTML)
      }
      const scarcity = el.querySelector(".pricing-card__scarcity")
      if (scarcity) scarcity.style.display = "none"
    }
  })
}

// ── COUNTDOWN TIMER ──
function updateCountdown() {
  const eventDate = new Date("2026-06-20T09:00:00")
  const now = new Date()
  const diff = eventDate - now

  if (diff <= 0) {
    ;[
      "cd-days",
      "cd-hours",
      "cd-mins",
      "cd-secs",
      "cd2-days",
      "cd2-hours",
      "cd2-mins",
      "cd2-secs",
    ].forEach((id) => {
      const el = document.getElementById(id)
      if (el) el.textContent = "00"
    })
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)

  const pad = (n) => String(n).padStart(2, "0")

  const set = (id, val) => {
    const el = document.getElementById(id)
    if (el) el.textContent = pad(val)
  }

  set("cd-days", days)
  set("cd2-days", days)
  set("cd-hours", hours)
  set("cd2-hours", hours)
  set("cd-mins", mins)
  set("cd2-mins", mins)
  set("cd-secs", secs)
  set("cd2-secs", secs)
}

updateCountdown()
setInterval(updateCountdown, 1000)
applySoldOut()

// ── PRICING TABS ──
function switchPricingTab(tab, btn) {
  document.querySelectorAll(".pricing-tab").forEach((t) => {
    t.classList.remove("pricing-tab--active")
    t.setAttribute("aria-selected", "false")
  })
  document
    .querySelectorAll(".pricing-panel")
    .forEach((p) => p.classList.add("pricing-panel--hidden"))
  btn.classList.add("pricing-tab--active")
  btn.setAttribute("aria-selected", "true")
  document
    .getElementById("panel-" + tab)
    .classList.remove("pricing-panel--hidden")
}

// ── FAQ ACCORDION ──
function toggleFaq(btn) {
  const item = btn.parentElement
  const answer = item.querySelector(".faq-answer")
  const isOpen = btn.classList.contains("open")

  // Close all
  document.querySelectorAll(".faq-question.open").forEach((q) => {
    q.classList.remove("open")
    q.parentElement.querySelector(".faq-answer").classList.remove("open")
  })

  // Open clicked (if it was closed)
  if (!isOpen) {
    btn.classList.add("open")
    answer.classList.add("open")
  }
}

// ── VIMEO CUSTOM CONTROLS ──
;(function () {
  const iframe = document.getElementById("heroVimeoIframe")
  const wrap = document.getElementById("heroVideoWrap")
  const overlay = document.getElementById("vpOverlay")
  const controls = document.getElementById("vpControls")
  const btnPlayPause = document.getElementById("vpPlayPause")
  const btnPlayBig = document.getElementById("vpPlayBig")
  const btnMute = document.getElementById("vpMute")
  const btnFs = document.getElementById("vpFullscreen")
  const progress = document.getElementById("vpProgress")
  const fill = document.getElementById("vpFill")
  const thumb = document.getElementById("vpThumb")

  if (!iframe || typeof Vimeo === "undefined") return

  const player = new Vimeo.Player(iframe)
  let duration = 0
  let scrubbing = false

  player.getDuration().then(function (d) { duration = d })

  // ── Play / Pause ──
  function setPlaying(playing) {
    controls.classList.toggle("is-paused", !playing)
    wrap.classList.toggle("vp-active", playing)
    if (playing) overlay.classList.add("vp-hidden")
  }

  player.on("play", function () { setPlaying(true) })
  player.on("pause", function () { setPlaying(false) })
  player.on("ended", function () {
    setPlaying(false)
    overlay.classList.remove("vp-hidden")
    fill.style.width = "0%"
    thumb.style.left = "0%"
  })

  btnPlayBig.addEventListener("click", function () { player.play() })
  btnPlayPause.addEventListener("click", function () {
    player.getPaused().then(function (paused) {
      paused ? player.play() : player.pause()
    })
  })

  // ── Progreso ──
  player.on("timeupdate", function (data) {
    if (scrubbing || !duration) return
    const pct = (data.seconds / duration) * 100
    fill.style.width = pct + "%"
    thumb.style.left = pct + "%"
  })

  function seekTo(e) {
    const rect = progress.getBoundingClientRect()
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    player.setCurrentTime(pct * duration)
    fill.style.width = pct * 100 + "%"
    thumb.style.left = pct * 100 + "%"
  }

  progress.addEventListener("mousedown", function (e) {
    scrubbing = true
    seekTo(e)
  })
  document.addEventListener("mousemove", function (e) {
    if (scrubbing) seekTo(e)
  })
  document.addEventListener("mouseup", function () { scrubbing = false })

  // Touch scrubbing
  progress.addEventListener("touchstart", function (e) {
    scrubbing = true
    seekTo(e.touches[0])
  }, { passive: true })
  document.addEventListener("touchmove", function (e) {
    if (scrubbing) seekTo(e.touches[0])
  }, { passive: true })
  document.addEventListener("touchend", function () { scrubbing = false })

  // ── Mute / Unmute ──
  player.getVolume().then(function (v) {
    controls.classList.toggle("is-muted", v === 0)
  })

  btnMute.addEventListener("click", function () {
    player.getVolume().then(function (v) {
      if (v > 0) {
        player.setVolume(0)
        controls.classList.add("is-muted")
      } else {
        player.setVolume(1)
        controls.classList.remove("is-muted")
      }
    })
  })

  // ── Fullscreen ──
  btnFs.addEventListener("click", function () {
    if (!document.fullscreenElement) {
      wrap.requestFullscreen().catch(function () {})
    } else {
      document.exitFullscreen()
    }
  })
  document.addEventListener("fullscreenchange", function () {
    controls.classList.toggle("is-fs", !!document.fullscreenElement)
  })

  // Estado inicial: paused
  controls.classList.add("is-paused")
})()

