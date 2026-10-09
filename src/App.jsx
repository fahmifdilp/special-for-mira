import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Check,
  ChevronUp,
  Cookie,
  Gamepad2,
  MessageCircle,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { content } from './data/content'

const personalize = (text) => text
  .replaceAll('[NAME]', content.person.name)
  .replaceAll('[NICKNAME]', content.person.nickname)
  .replaceAll('[MY NAME]', content.creator)

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
}

const viewport = { once: true, amount: 0.2 }

function playOpeningSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  try {
    const context = new AudioContextClass()
    const now = context.currentTime
    const master = context.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.18, now + 0.025)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.72)
    master.connect(context.destination)

    const boing = context.createOscillator()
    boing.type = 'triangle'
    boing.frequency.setValueAtTime(190, now)
    boing.frequency.exponentialRampToValueAtTime(580, now + 0.16)
    boing.frequency.exponentialRampToValueAtTime(260, now + 0.68)
    boing.connect(master)
    boing.start(now)
    boing.stop(now + 0.72)

    const sparkle = context.createOscillator()
    sparkle.type = 'sine'
    sparkle.frequency.setValueAtTime(660, now + 0.12)
    sparkle.frequency.exponentialRampToValueAtTime(1040, now + 0.28)
    sparkle.connect(master)
    sparkle.start(now + 0.12)
    sparkle.stop(now + 0.48)

    void context.resume().catch(() => {})
    window.setTimeout(() => void context.close().catch(() => {}), 1100)
  } catch {
    // Audio is optional; the experience should still open when it is unavailable.
  }
}

function createBackgroundMusic() {
  const audio = new Audio(content.music.source)
  audio.loop = true
  audio.preload = 'auto'
  audio.volume = 0.24
  return audio
}

function App() {
  const [started, setStarted] = useState(false)
  const musicRef = useRef(null)
  const musicStartRef = useRef(null)

  const startExperience = () => {
    const audio = createBackgroundMusic()
    musicRef.current = audio
    musicStartRef.current = audio.play()
    musicStartRef.current.catch(() => {})
    playOpeningSound()
    setStarted(true)
  }

  if (!started) return <OpeningScreen onStart={startExperience} />
  return <DinoExperience
    initialAudio={musicRef.current}
    initialMusicPromise={musicStartRef.current}
    onReplay={() => {
      musicRef.current?.pause()
      musicRef.current = null
      musicStartRef.current = null
      setStarted(false)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }}
  />
}

function OpeningScreen({ onStart }) {
  const reducedMotion = useReducedMotion()
  return (
    <div className="opening-screen dino-opening">
      <SkyDecor />
      <motion.div
        className="opening-sun"
        animate={reducedMotion ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="opening-dino-wrap"
        initial={{ opacity: 0, y: 30, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8 }}
      >
        <div className="speech-bubble opening-bubble">halo. aku dino.</div>
        <DinoSvg mood="idle" celebrate />
      </motion.div>
      <motion.div
        className="opening-copy"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.12 }}
      >
        <div className="eyebrow">{content.opening.kicker}</div>
        <h1>{personalize(content.opening.title)}</h1>
        <p className="opening-subtitle">{content.opening.subtitle}</p>
        <button className="button button-primary" onClick={onStart}>
          <Gamepad2 size={17} /> {content.opening.button}
        </button>
        <p className="opening-note"><Sparkles size={13} /> {content.opening.note}</p>
      </motion.div>
      <div className="opening-footer"><span>NO PRODUCTIVITY ZONE</span><span className="opening-line" /><span>PLAY 01</span></div>
    </div>
  )
}

function DinoExperience({ onReplay, initialAudio, initialMusicPromise }) {
  const [dinoMood, setDinoMood] = useState(0)
  const [tapCount, setTapCount] = useState(0)
  const [speech, setSpeech] = useState(content.hero.lines[0])
  const [dinoJumping, setDinoJumping] = useState(false)
  const [danceMode, setDanceMode] = useState(false)
  const [dashStarted, setDashStarted] = useState(false)
  const [dashScore, setDashScore] = useState(0)
  const [jumping, setJumping] = useState(false)
  const [dashHit, setDashHit] = useState(false)
  const [dashRun, setDashRun] = useState(0)
  const [snackCount, setSnackCount] = useState(0)
  const [snackMessage, setSnackMessage] = useState('Dino sedang menunggu snack dengan sopan.')
  const [moodChoice, setMoodChoice] = useState(null)
  const [factIndex, setFactIndex] = useState(null)
  const [chatMessages, setChatMessages] = useState(() => [{
    id: 'welcome',
    role: 'assistant',
    content: personalize(content.chat.welcome),
  }])
  const [chatInput, setChatInput] = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [musicOn, setMusicOn] = useState(false)
  const [, setLogoClicks] = useState(0)
  const [starFound, setStarFound] = useState(false)
  const [celebrate, setCelebrate] = useState(0)
  const audioRef = useRef(initialAudio)
  const ownsAudioRef = useRef(!initialAudio)
  const toastTimer = useRef(null)
  const chatEndRef = useRef(null)
  const dashActiveRef = useRef(false)
  const dashWinHandledRef = useRef(false)

  const showToast = useCallback((message, tone = 'default') => {
    setToast({ message, tone })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3600)
  }, [])

  useEffect(() => {
    if (!initialAudio || !initialMusicPromise) return undefined

    const handleAudioError = () => {
      setMusicOn(false)
      showToast(content.music.helper, 'info')
    }

    initialAudio.addEventListener('error', handleAudioError, { once: true })
    initialMusicPromise
      .then(() => setMusicOn(true))
      .catch(() => {
        setMusicOn(false)
        showToast(content.music.helper, 'info')
      })

    return () => initialAudio.removeEventListener('error', handleAudioError)
  }, [initialAudio, initialMusicPromise, showToast])

  useEffect(() => {
    const secret = 'dino'
    let progress = 0
    const handleKey = (event) => {
      if (event.key.toLowerCase() === secret[progress]) {
        progress += 1
        if (progress === secret.length) {
          showToast(content.easterEggs.keyboard, 'secret')
          progress = 0
        }
      } else if (event.key.length === 1) progress = 0
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showToast])

  useEffect(() => () => {
    window.clearTimeout(toastTimer.current)
    if (ownsAudioRef.current) audioRef.current?.pause()
  }, [])

  useEffect(() => {
    if (!jumping) return undefined
    const timer = window.setTimeout(() => setJumping(false), 1100)
    return () => window.clearTimeout(timer)
  }, [jumping])

  useEffect(() => {
    if (!dinoJumping) return undefined
    const timer = window.setTimeout(() => setDinoJumping(false), 560)
    return () => window.clearTimeout(timer)
  }, [dinoJumping])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [chatMessages, chatBusy])

  useEffect(() => {
    if (dashScore !== 8 || dashWinHandledRef.current) return
    dashWinHandledRef.current = true
    dashActiveRef.current = false
    setDashStarted(false)
    setJumping(false)
    setCelebrate((value) => value + 1)
    showToast(content.dash.win, 'success')
  }, [dashScore, showToast])

  const dinoStatus = content.hero.statuses[Math.min(dinoMood, content.hero.statuses.length - 1)]

  const tapDino = () => {
    const nextCount = tapCount + 1
    setTapCount(nextCount)
    setDinoJumping(true)
    setDinoMood(Math.min(nextCount, content.hero.statuses.length - 1))
    setSpeech(content.hero.lines[nextCount % content.hero.lines.length])
    if (nextCount % 5 === 0) setCelebrate((value) => value + 1)
  }

  const toggleDance = () => {
    setDanceMode((active) => !active)
    setCelebrate((value) => value + 1)
    showToast(danceMode ? 'Dino selesai joget. Dia minta air putih.' : 'Dino dance mode: ON. Tidak ada yang bisa menghentikannya.', 'success')
  }

  const startDash = () => {
    dashActiveRef.current = true
    dashWinHandledRef.current = false
    setDashRun((run) => run + 1)
    setDashHit(false)
    setDashStarted(true)
    setDashScore(0)
    setJumping(false)
  }

  const jumpDino = () => {
    if (!dashActiveRef.current || dashScore >= 8 || jumping) return
    setJumping(true)
  }

  const clearDashCactus = () => {
    if (!dashActiveRef.current) return
    setDashScore((score) => Math.min(score + 1, 8))
  }

  const hitDashCactus = () => {
    if (!dashActiveRef.current) return
    dashActiveRef.current = false
    setDashStarted(false)
    setDashHit(true)
    setDashScore(0)
    setJumping(false)
  }

  const feedDino = () => {
    if (snackCount >= 5) return
    const nextCount = snackCount + 1
    setSnackCount(nextCount)
    setSnackMessage(content.snacks.reactions[nextCount - 1])
    if (nextCount === 5) {
      setCelebrate((value) => value + 1)
      showToast(content.snacks.done, 'success')
    }
  }

  const chooseMood = (mood) => {
    setMoodChoice(mood)
    setDinoMood(mood.id === 'chaos' ? 4 : mood.id === 'sleepy' ? 1 : mood.id === 'hungry' ? 2 : 3)
  }

  const giveFact = () => {
    let next = Math.floor(Math.random() * content.facts.items.length)
    if (next === factIndex) next = (next + 1) % content.facts.items.length
    setFactIndex(next)
  }

  const sendChatMessage = async (rawMessage) => {
    const message = rawMessage.trim()
    if (!message || chatBusy) return

    const userMessage = { id: makeId(), role: 'user', content: message }
    const nextMessages = [...chatMessages, userMessage]
    const context = nextMessages
      .filter(({ role }) => role === 'user' || role === 'assistant')
      .slice(-12)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }))

    setChatMessages(nextMessages)
    setChatInput('')
    setChatBusy(true)

    try {
      const response = await fetch('/api/dino-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: context }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('chat_failed')
      setChatMessages((current) => [...current, { id: makeId(), role: 'assistant', content: data.reply.trim() }])
    } catch {
      setChatMessages((current) => [...current, { id: makeId(), role: 'assistant', content: content.chat.error }])
    } finally {
      setChatBusy(false)
    }
  }

  const submitChat = (event) => {
    event.preventDefault()
    void sendChatMessage(chatInput)
  }

  const handleChatKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendChatMessage(chatInput)
    }
  }

  const toggleMusic = () => {
    if (!audioRef.current) {
      const audio = createBackgroundMusic()
      ownsAudioRef.current = true
      audio.addEventListener('error', () => {
        setMusicOn(false)
        showToast(content.music.helper, 'info')
      }, { once: true })
      audioRef.current = audio
    }
    if (musicOn) {
      audioRef.current.pause()
      setMusicOn(false)
    } else {
      audioRef.current.play().then(() => setMusicOn(true)).catch(() => showToast(content.music.helper, 'info'))
    }
  }

  const handleLogo = () => {
    setLogoClicks((value) => {
      const next = value + 1
      if (next === 5) {
        showToast(content.easterEggs.logo, 'secret')
        return 0
      }
      return next
    })
  }

  const revealStar = () => {
    setStarFound(true)
    showToast(content.easterEggs.star, 'secret')
  }

  return (
    <div className="dino-app">
      <SkyDecor />
      <TopBar musicOn={musicOn} onToggleMusic={toggleMusic} onLogo={handleLogo} />
      <main>
        <section id="welcome" className="dino-section hero-section">
          <div className="section-inner hero-grid">
            <motion.div className="hero-copy" initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp}>
              <div className="eyebrow">{content.hero.kicker}</div>
              <h2>{personalize(content.hero.title)}</h2>
              <p>{content.hero.intro}</p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={tapDino}><Zap size={16} /> {dinoJumping ? 'Boing!' : content.hero.roarButton}</button>
                <button className="button button-soft" onClick={toggleDance}>{danceMode ? 'Stop joget' : 'Bikin dino joget'} <Sparkles size={15} /></button>
                <button className="button button-outline" onClick={() => document.getElementById('dash')?.scrollIntoView({ behavior: 'smooth' })}>{content.hero.nextButton} <ArrowRight size={16} /></button>
              </div>
              <div className="hero-stats">
                <span>{content.hero.tapCount.replace('{count}', tapCount)}</span>
                <span>{content.hero.status.replace('{status}', dinoStatus)}</span>
              </div>
            </motion.div>
            <motion.div className="hero-dino-card" initial={{ opacity: 0, scale: .92, rotate: 2 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={viewport} transition={{ duration: .7 }}>
              <div className="dino-card-label">DINO CAM / LIVE</div>
              <div className="speech-bubble">{personalize(speech)}</div>
              <AnimatePresence>{dinoJumping && <motion.span className="jump-burst" initial={{ opacity: 0, scale: .5, rotate: -12 }} animate={{ opacity: 1, scale: 1, rotate: 8 }} exit={{ opacity: 0, scale: 1.2 }} transition={{ duration: .2 }}>BOING!</motion.span>}</AnimatePresence>
              <DinoSvg mood={dinoMood} jumping={dinoJumping} dancing={danceMode} celebrate={celebrate > 0} />
              <button className="star-button" onClick={revealStar} aria-label="Bintang kecil rahasia"><Star size={15} fill={starFound ? 'currentColor' : 'none'} /></button>
              <div className="dino-ground" />
            </motion.div>
          </div>
        </section>

        <DashSection started={dashStarted} score={dashScore} jumping={jumping} hit={dashHit} runId={dashRun} onStart={startDash} onJump={jumpDino} onPass={clearDashCactus} onCollision={hitDashCactus} />

        <BubblePopSection />

        <section id="snacks" className="dino-section snack-section">
          <div className="section-inner split-section">
            <SectionIntro eyebrow={content.snacks.kicker} title={content.snacks.title} intro={content.snacks.intro} />
            <motion.div className="snack-card playful-card" initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp}>
              <div className="snack-header"><span>SNACK STATION</span><Cookie size={18} /></div>
              <div className="snack-character"><DinoSvg mood={snackCount >= 5 ? 3 : dinoMood} /></div>
              <p className="snack-message" aria-live="polite">{snackMessage}</p>
              <div className="snack-progress"><span style={{ width: `${snackCount * 20}%` }} /></div>
              <div className="snack-count">{content.snacks.count.replace('{count}', snackCount)}</div>
              <button className="button button-primary" onClick={feedDino} disabled={snackCount >= 5}><Cookie size={16} /> {snackCount >= 5 ? 'Dino kenyang' : content.snacks.button}</button>
            </motion.div>
          </div>
        </section>

        <section id="moods" className="dino-section mood-section">
          <div className="section-inner">
            <SectionIntro eyebrow={content.moods.kicker} title={content.moods.title} intro={content.moods.intro} />
            <div className="mood-grid">
              {content.moods.options.map((mood, index) => (
                <motion.button key={mood.id} className={`mood-card mood-${mood.id} ${moodChoice?.id === mood.id ? 'selected' : ''}`} onClick={() => chooseMood(mood)} initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp} transition={{ delay: index * .06 }} whileHover={{ y: -7, rotate: index % 2 ? 1 : -1 }}>
                  <span className="mood-emoji">{mood.emoji}</span>
                  <strong>{mood.label}</strong>
                  <span className="mood-arrow"><ArrowRight size={15} /></span>
                  <AnimatePresence>
                    {moodChoice?.id === mood.id && <motion.span className="mood-response" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>{mood.response}</motion.span>}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <DinoChatSection
          messages={chatMessages}
          input={chatInput}
          busy={chatBusy}
          endRef={chatEndRef}
          onInput={setChatInput}
          onSubmit={submitChat}
          onKeyDown={handleChatKeyDown}
          onPrompt={sendChatMessage}
        />

        <DiscoSection />

        <section id="facts" className="dino-section fact-section">
          <div className="section-inner fact-layout">
            <div>
              <SectionIntro eyebrow={content.facts.kicker} title={content.facts.title} />
              <button className="button button-dark" onClick={giveFact}><Sparkles size={16} /> {content.facts.button}</button>
            </div>
            <motion.div className="fact-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport}>
              <div className="fact-card-top"><span>FACT MACHINE</span><span>NO. {factIndex === null ? '??' : String(factIndex + 1).padStart(2, '0')}</span></div>
              <AnimatePresence mode="wait">
                {factIndex === null ? <motion.p key="placeholder" className="fact-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{content.facts.placeholder}</motion.p> : <motion.p key={factIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{content.facts.items[factIndex]}</motion.p>}
              </AnimatePresence>
              <div className="fact-dino"><DinoSvg mood={factIndex === null ? 0 : 4} /></div>
            </motion.div>
          </div>
        </section>

        <section className="dino-section finale-section">
          <div className="finale-card">
            <div className="eyebrow">{content.finale.kicker}</div>
            <DinoSvg mood={4} celebrate={celebrate > 0} />
            <h2>{personalize(content.finale.title)}</h2>
            <p>{content.finale.subtitle}</p>
            <button className="button button-primary" onClick={onReplay}><RotateCcw size={16} /> {content.finale.replay}</button>
            <small>{content.finale.note}</small>
          </div>
        </section>
      </main>
      <AnimatePresence>{toast && <Toast toast={toast} onClose={() => setToast(null)} />}</AnimatePresence>
      <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Kembali ke atas"><ChevronUp size={17} /></button>
    </div>
  )
}

function TopBar({ musicOn, onToggleMusic, onLogo }) {
  return (
    <header className="dino-topbar">
      <button className="dino-wordmark" onClick={onLogo} aria-label="Dino Break"><span className="wordmark-dot" />dino break<span className="wordmark-plus">+</span></button>
      <nav className="dino-nav" aria-label="Dino sections">
        <a href="#dash">Dash</a><a href="#bubbles">Pop</a><a href="#snacks">Snack</a><a href="#moods">Mood</a><a href="#curhat">Cerita</a><a href="#disco">Disco</a><a href="#facts">Facts</a>
      </nav>
      <button className="music-toggle" onClick={onToggleMusic} aria-label={musicOn ? content.music.off : content.music.on}>{musicOn ? <Pause size={14} /> : <Music2 size={14} />}<span>{content.music.label}</span></button>
    </header>
  )
}

function SectionIntro({ eyebrow, title, intro }) {
  return <div className="section-intro"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{intro && <p>{intro}</p>}</div>
}

function DashSection({ started, score, jumping, hit, runId, onStart, onJump, onPass, onCollision }) {
  const completed = score >= 8
  const playerRef = useRef(null)
  const cactusRefs = useRef([])
  const onPassRef = useRef(onPass)
  const onCollisionRef = useRef(onCollision)

  useEffect(() => {
    onPassRef.current = onPass
    onCollisionRef.current = onCollision
  }, [onCollision, onPass])

  useEffect(() => {
    if (!started || completed) return undefined

    let frameId
    let collisionLocked = false
    const passedCactus = [false, false]

    const detectCollision = () => {
      const player = playerRef.current
      if (!player || collisionLocked) return

      const playerRect = player.getBoundingClientRect()
      const playerHitbox = {
        left: playerRect.left + playerRect.width * .3,
        right: playerRect.right - playerRect.width * .17,
        top: playerRect.top + playerRect.height * .14,
        bottom: playerRect.bottom - playerRect.height * .12,
      }

      const collided = cactusRefs.current.some((cactus, index) => {
        if (!cactus) return false
        const cactusRect = cactus.getBoundingClientRect()
        const cactusHitbox = {
          left: cactusRect.left + 2,
          right: cactusRect.right - 2,
          top: cactusRect.top + 4,
          bottom: cactusRect.bottom,
        }

        if (passedCactus[index] && cactusRect.left > playerHitbox.right + 80) {
          passedCactus[index] = false
        }

        if (!passedCactus[index] && cactusRect.right < playerHitbox.left) {
          passedCactus[index] = true
          onPassRef.current()
        }

        return playerHitbox.left < cactusHitbox.right
          && playerHitbox.right > cactusHitbox.left
          && playerHitbox.top < cactusHitbox.bottom
          && playerHitbox.bottom > cactusHitbox.top
      })

      if (collided) {
        collisionLocked = true
        onCollisionRef.current()
        return
      }

      frameId = window.requestAnimationFrame(detectCollision)
    }

    frameId = window.requestAnimationFrame(detectCollision)
    return () => window.cancelAnimationFrame(frameId)
  }, [completed, runId, started])

  const actionLabel = completed
    ? content.dash.restart
    : hit
      ? content.dash.retry
      : started
        ? jumping ? content.dash.airborne : content.dash.jump
        : content.dash.start

  return (
    <section id="dash" className="dino-section dash-section">
      <div className="section-inner">
        <SectionIntro eyebrow={content.dash.kicker} title={content.dash.title} intro={content.dash.intro} />
        <div className={`dash-card playful-card ${started ? 'is-running' : ''} ${hit ? 'is-hit' : ''} ${completed ? 'is-complete' : ''}`}>
          <div key={runId} className="dash-arena">
            <div className="dash-cloud cloud-one" /><div className="dash-cloud cloud-two" />
            <div ref={(node) => { cactusRefs.current[0] = node }} className="dash-cactus cactus-one" />
            <div ref={(node) => { cactusRefs.current[1] = node }} className="dash-cactus cactus-two" />
            <motion.div
              ref={playerRef}
              className={`dash-player ${jumping ? 'jumping' : ''}`}
              animate={hit
                ? { x: [0, -8, 8, -5, 0], rotate: [0, -7, 7, -4, 0], y: 0 }
                : jumping
                  ? { y: [0, -72, -72, 0], rotate: [0, -5, 2, 0] }
                  : { x: 0, y: 0, rotate: 0 }}
              transition={hit
                ? { duration: .38, ease: 'easeInOut' }
                : jumping
                  ? { duration: 1.05, times: [0, .18, .8, 1], ease: 'easeInOut' }
                  : { duration: .16, ease: 'easeInOut' }}
            >
              <DinoSvg mood={completed ? 4 : hit ? 2 : 0} />
            </motion.div>
            <div className="dash-ground"><span /></div>
            {!started && !hit && !completed && <div className="dash-overlay"><Gamepad2 size={21} /><span>Tekan mulai lalu bantu dino melompat.</span></div>}
            {hit && <motion.div className="dash-hit" role="status" initial={{ opacity: 0, scale: .8, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 1 }}><X size={19} /> {content.dash.hit}</motion.div>}
            {completed && <motion.div className="dash-win" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }}><Trophy size={20} /> {content.dash.win}</motion.div>}
          </div>
          <div className="dash-controls">
            <div className="dash-score" aria-live="polite">{content.dash.score.replace('{count}', score)}</div>
            <div className="dash-bar"><span style={{ width: `${score * 12.5}%` }} /></div>
            <button className="button button-primary" onClick={completed || hit || !started ? onStart : onJump} disabled={started && jumping}>{actionLabel}<ArrowRight size={16} /></button>
          </div>
          <small className="dash-instruction">{content.dash.instruction}</small>
        </div>
      </div>
    </section>
  )
}

function BubblePopSection() {
  const [popped, setPopped] = useState([])
  const [message, setMessage] = useState(content.bubbles.idle)
  const reducedMotion = useReducedMotion()
  const bubbleRefs = useRef(new Map())
  const replayRef = useRef(null)
  const pendingFocusRef = useRef(null)
  const total = content.bubbles.bubbles.length
  const complete = popped.length === total
  const positions = [
    { left: '6%', top: '10%', size: '118px' },
    { left: '29%', top: '5%', size: '145px' },
    { left: '62%', top: '9%', size: '112px' },
    { left: '79%', top: '30%', size: '135px' },
    { left: '9%', top: '53%', size: '140px' },
    { left: '36%', top: '52%', size: '110px' },
    { left: '57%', top: '58%', size: '148px' },
    { left: '42%', top: '29%', size: '126px' },
  ]

  useEffect(() => {
    const pendingFocus = pendingFocusRef.current
    if (!pendingFocus) return

    const target = pendingFocus === 'replay'
      ? replayRef.current
      : bubbleRefs.current.get(pendingFocus)

    if (target) {
      target.focus()
      pendingFocusRef.current = null
    }
  }, [popped])

  const popBubble = (bubble) => {
    if (popped.includes(bubble.id)) return
    const next = [...popped, bubble.id]
    const nextBubble = content.bubbles.bubbles.find((item) => !next.includes(item.id))
    pendingFocusRef.current = nextBubble?.id ?? 'replay'
    setPopped(next)
    setMessage(next.length === total ? personalize(content.bubbles.complete) : bubble.reaction)
  }

  const reset = () => {
    pendingFocusRef.current = content.bubbles.bubbles[0]?.id
    setPopped([])
    setMessage(content.bubbles.idle)
  }

  return (
    <section id="bubbles" className="dino-section bubble-section">
      <div className="section-inner">
        <SectionIntro eyebrow={content.bubbles.kicker} title={personalize(content.bubbles.title)} intro={content.bubbles.intro} />
        <div className={`bubble-game playful-card ${complete ? 'is-complete' : ''}`}>
          <div className="bubble-game-top">
            <div className="bubble-progress-label">{content.bubbles.progress.replace('{count}', popped.length).replace('{total}', total)}</div>
            <div className="bubble-progress"><span style={{ width: `${(popped.length / total) * 100}%` }} /></div>
          </div>
          <div className="bubble-arena">
            <AnimatePresence>
              {content.bubbles.bubbles.map((bubble, index) => !popped.includes(bubble.id) && (
                <motion.button
                  key={bubble.id}
                  ref={(node) => {
                    if (node) bubbleRefs.current.set(bubble.id, node)
                    else bubbleRefs.current.delete(bubble.id)
                  }}
                  className={`stress-bubble bubble-${bubble.tone}`}
                  style={{ '--bubble-left': positions[index].left, '--bubble-top': positions[index].top, '--bubble-size': positions[index].size, '--bubble-delay': `${index * -.31}s` }}
                  onClick={() => popBubble(bubble)}
                  aria-label={`Pecahkan gelembung: ${bubble.label}`}
                  initial={{ opacity: 0, scale: .65 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.65, rotate: 18, filter: 'blur(5px)' }}
                  whileHover={reducedMotion ? undefined : { scale: 1.08, y: -5 }}
                  whileTap={reducedMotion ? undefined : { scale: .86 }}
                >
                  <span>{bubble.label}</span>
                  <i aria-hidden="true" />
                </motion.button>
              ))}
            </AnimatePresence>
            <div className="bubble-dino"><DinoSvg mood={complete ? 4 : Math.min(popped.length, 3)} celebrate={complete} /></div>
            {complete && (
              <motion.div className="bubble-complete-badge" initial={{ opacity: 0, scale: .7, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 2 }}>
                <Check size={18} /> ringan dikit!
              </motion.div>
            )}
          </div>
          <div className="bubble-result" aria-live="polite">
            <p>{message}</p>
            {complete && <button ref={replayRef} className="button button-primary" onClick={reset}><RotateCcw size={15} /> {content.bubbles.replay}</button>}
          </div>
        </div>
      </div>
    </section>
  )
}

function DinoChatSection({ messages, input, busy, endRef, onInput, onSubmit, onKeyDown, onPrompt }) {
  const reducedMotion = useReducedMotion()

  return (
    <section id="curhat" className="dino-section chat-section">
      <div className="section-inner chat-layout">
        <motion.div className="chat-intro" initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp}>
          <SectionIntro eyebrow={content.chat.kicker} title={content.chat.title} intro={content.chat.intro} />
          <div className="chat-companion-card">
            <div className="chat-companion-top"><span>LIVE LISTENER</span><span className="chat-online"><i /> {content.chat.status}</span></div>
            <div className="chat-companion-dino"><DinoSvg mood={busy ? 2 : 3} celebrate={busy} /></div>
            <div className="chat-companion-bubble">{busy ? content.chat.thinking : 'Dino tidak punya jawaban untuk semua hal. Tapi dia punya waktu.'}</div>
            <div className="chat-tags"><span>no judgment</span><span>jawaban pendek</span><span>snack break</span></div>
          </div>
        </motion.div>

        <motion.div className="chat-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: reducedMotion ? 0 : .65 }}>
          <div className="chat-card-header">
            <div className="chat-card-title"><span className="chat-avatar"><Bot size={17} /></span><div><strong>{content.chat.name}</strong><span><i /> {content.chat.status}</span></div></div>
            <MessageCircle size={20} className="chat-header-icon" />
          </div>
          <div className="chat-transcript" role="log" aria-live="polite" aria-label="Percakapan dengan Dino">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div key={message.id} className={`chat-row chat-row-${message.role}`} initial={{ opacity: 0, y: 9, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reducedMotion ? 0 : .22 }}>
                  <div className="chat-bubble"><span>{message.content}</span></div>
                </motion.div>
              ))}
            </AnimatePresence>
            {busy && (
              <motion.div className="chat-row chat-row-assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="chat-bubble chat-typing" aria-label={content.chat.thinking}><i /><i /><i /></div>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>
          <div className="chat-prompts"><span>COBA MULAI DARI:</span>{content.chat.prompts.map((prompt) => <button key={prompt} type="button" onClick={() => onPrompt(prompt)} disabled={busy}>{prompt}</button>)}</div>
          <form className="chat-composer" onSubmit={onSubmit}>
            <textarea value={input} onChange={(event) => onInput(event.target.value)} onKeyDown={onKeyDown} maxLength={800} rows={2} placeholder={content.chat.placeholder} aria-label={content.chat.placeholder} disabled={busy} />
            <button className="chat-send" type="submit" disabled={busy || !input.trim()} aria-label={content.chat.send}><Send size={17} /></button>
          </form>
          <div className="chat-privacy"><ShieldCheck size={14} /><span>{content.chat.privacy}</span></div>
          <small className="chat-disclaimer">{content.chat.disclaimer}</small>
        </motion.div>
      </div>
    </section>
  )
}

function DiscoSection() {
  const [active, setActive] = useState(false)
  const [move, setMove] = useState('wiggle')
  const reducedMotion = useReducedMotion()

  const animations = {
    wiggle: { y: [0, -10, 0], rotate: [-7, 7, -7] },
    spin: { rotate: [0, 360], scale: [1, .88, 1] },
    zoomies: { x: [0, 58, -58, 0], y: [0, -9, 0, -4] },
  }

  return (
    <section id="disco" className={`dino-section disco-section ${active ? 'disco-active' : ''}`}>
      <div className="section-inner disco-layout">
        <SectionIntro eyebrow={content.disco.kicker} title={content.disco.title} intro={content.disco.intro} />
        <div className="disco-card playful-card">
          <div className="disco-lights" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <div className="disco-stage">
            <div className="disco-ball"><span /></div>
            <motion.div
              className="disco-dino"
              animate={active && !reducedMotion ? animations[move] : { x: 0, y: 0, rotate: 0, scale: 1 }}
              transition={active ? { duration: move === 'spin' ? 1.1 : .7, repeat: Infinity, ease: 'easeInOut' } : { duration: .25 }}
            >
              <DinoSvg mood={4} />
            </motion.div>
            <div className="disco-floor"><span /><span /><span /><span /><span /><span /></div>
          </div>
          <div className="disco-panel">
            <p aria-live="polite">{active ? content.disco.active : content.disco.idle}</p>
            <div className="disco-moves">
              {content.disco.moves.map((item) => (
                <button key={item.id} className={move === item.id ? 'selected' : ''} onClick={() => { setMove(item.id); setActive(true) }}>{item.label}</button>
              ))}
            </div>
            <button className="button button-primary" onClick={() => setActive((value) => !value)}>
              {active ? <Pause size={16} /> : <Play size={16} />}
              {active ? content.disco.stop : content.disco.start}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function DinoSvg({ mood = 0, celebrate = false, jumping = false, dancing = false }) {
  const motionState = jumping
    ? { y: [0, -32, 0], rotate: [0, -5, 4, 0] }
    : dancing
      ? { y: [0, -7, 0], rotate: [-3, 3, -3] }
      : celebrate
        ? { y: [0, -12, 0], rotate: [0, -3, 3, 0] }
        : undefined
  const motionTransition = jumping
    ? { duration: .56, ease: 'easeOut' }
    : dancing
      ? { duration: .55, repeat: Infinity, ease: 'easeInOut' }
      : celebrate
        ? { duration: .65 }
        : undefined
  return (
    <motion.svg className={`dino-svg mood-${mood} ${celebrate ? 'celebrate' : ''} ${jumping ? 'jumping' : ''} ${dancing ? 'dancing' : ''}`} viewBox="0 0 260 190" role="img" aria-label="Dino kecil yang lucu" animate={motionState} transition={motionTransition}>
      <g className="dino-tail"><path d="M92 114 C62 104 43 119 27 139 C48 140 76 136 101 126Z" /></g>
      <path className="dino-spikes" d="M93 78 L104 49 L115 74 L130 41 L139 75 L157 49 L162 87Z" />
      <path className="dino-body" d="M77 83 C77 67 92 58 115 58 H158 C178 58 192 72 192 94 V126 C192 141 180 151 161 151 H106 C87 151 77 139 77 123Z" />
      <path className="dino-head" d="M126 43 C126 25 140 17 160 18 H190 C210 18 225 31 225 49 V70 C225 86 214 96 197 96 H157 C139 96 126 78 126 62Z" />
      <path className="dino-belly" d="M113 87 C113 78 122 72 135 72 H158 C171 72 179 80 179 92 V127 C179 136 171 141 159 141 H134 C122 141 113 134 113 124Z" />
      <path className="dino-leg leg-back" d="M92 127 H117 V157 C117 164 110 168 101 168 H91 C86 168 83 164 86 158Z" />
      <path className="dino-leg" d="M154 130 H178 V157 C178 164 171 168 162 168 H152 C147 168 145 164 148 158Z" />
      <path className="dino-arm" d="M179 100 C198 96 204 107 197 117 C192 124 184 121 180 116Z" />
      <circle className="dino-eye" cx="193" cy="48" r="6" /><circle className="dino-eye-shine" cx="195" cy="46" r="2" />
      <path className="dino-mouth" d="M188 67 C196 73 204 72 210 66" />
      <circle className="dino-cheek" cx="213" cy="59" r="5" />
      <path className="dino-foot" d="M87 168 H119 M148 168 H180" />
    </motion.svg>
  )
}

function SkyDecor() {
  const stars = useMemo(() => Array.from({ length: 12 }, (_, index) => ({ left: `${(index * 29) % 96}%`, top: `${(index * 43) % 88}%`, delay: `${index * .2}s` })), [])
  return <div className="sky-decor" aria-hidden="true"><div className="sky-cloud cloud-a" /><div className="sky-cloud cloud-b" /><div className="sky-cloud cloud-c" /><div className="sky-hill hill-a" /><div className="sky-hill hill-b" /><div className="sky-stars">{stars.map((star, index) => <i key={index} style={star}>+</i>)}</div></div>
}

function Toast({ toast, onClose }) {
  return <motion.div className={`toast toast-${toast.tone}`} role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Sparkles size={15} /><span>{toast.message}</span><button onClick={onClose} aria-label="Tutup"><X size={14} /></button></motion.div>
}

export default App
