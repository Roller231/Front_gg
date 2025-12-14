import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import './CrashPage.css'
import Header from './Header'
import Navigation from './Navigation'
import BetModal from './BetModal'

const MemoHeader = memo(Header)
const MemoNavigation = memo(Navigation)
const MemoBetModal = memo(BetModal)

const initialHistoryValues = [1.0, 1.2, 4.96, 5.42, 8.5, 4.95, 4.0]
const initialHistory = initialHistoryValues.map(value => ({ value, isPending: false }))

const players = [
  { id: 1, name: 'Crazy Frog', src: '/image/ava1.png', bet: 5.51, betAmount: '4.38', multiplierValue: 'x1.24', gift: false },
  { id: 2, name: 'MoonSun', src: '/image/ava2.png', bet: 5.51, betAmount: '4.38', multiplierValue: 'x1.24', gift: true },
  { id: 3, name: 'ADA Drop', src: '/image/ava3.png', bet: 5.51, betAmount: '4.38', multiplierValue: 'x1.24', gift: false },
  { id: 4, name: 'Darkkk', src: '/image/ava4.png', bet: 5.51, betAmount: '4.38', multiplierValue: 'x1.24', gift: false },
]

// Компонент линии — волнистая, левая часть внизу, правая поднимается
function CrashLine({ multiplier, maxMultiplier }) {
  // Не ограничиваем progress, чтобы линия могла подниматься до потолка
  const progress = (multiplier - 1) / (maxMultiplier - 1)
  
  // Случайные смещения для волн (генерируются один раз)
  const waveOffsets = useRef(
    Array.from({ length: 6 }, () => (Math.random() - 0.5) * 2)
  ).current

  const wavePhase = useRef(Math.random() * Math.PI * 2).current
  
  // Генерируем путь линии
  const pathData = useMemo(() => {
    const width = 320
    const height = 280
    const startY = height - 10 // Левый край всегда внизу
    const endY = Math.max(5, startY - progress * (height - 15)) // Правый край поднимается до самого верха

    const pointsCount = 24
    const waveCount = 3
    const amplitude = 4.5
    const points = Array.from({ length: pointsCount }, (_, idx) => {
      const t = idx / (pointsCount - 1)
      const x = t * width
      // Базовая линия — как было раньше: M0,startY Q (width*0.5, startY-5) width,endY
      // Для этой кривой x(t) = width * t, так что достаточно посчитать y(t).
      const controlY = startY - 5
      const baseY =
        (1 - t) * (1 - t) * startY +
        2 * (1 - t) * t * controlY +
        t * t * endY

      const offsetBucket = waveOffsets[Math.min(waveOffsets.length - 1, Math.floor(t * waveOffsets.length))]
      // Чтобы не ломать рост и не смещать края — затухаем к 0 на концах
      const envelope = Math.sin(Math.PI * t)
      const irregular = offsetBucket * 0.9 * envelope
      const wave = Math.sin(t * waveCount * Math.PI * 2 + wavePhase) * amplitude * envelope

      return { x, y: baseY + wave + irregular }
    })

    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length - 2; i += 1) {
      const midX = (points[i].x + points[i + 1].x) / 2
      const midY = (points[i].y + points[i + 1].y) / 2
      d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`
    }
    d += ` Q ${points[points.length - 2].x} ${points[points.length - 2].y} ${points[points.length - 1].x} ${points[points.length - 1].y}`

    return d
  }, [progress, waveOffsets])

  return (
    <svg
      className="coeff-path"
      viewBox="0 0 320 280"
      preserveAspectRatio="none"
    >
      <path
        d={pathData}
        className="coeff-path-line-dynamic"
      />
    </svg>
  )
}

function CrashPage() {
  const [gameState, setGameState] = useState('countdown') // 'countdown' | 'preflight' | 'flying' | 'postflight'
  const [countdown, setCountdown] = useState(3)
  const [multiplier, setMultiplier] = useState(1.0)
  const [coefficientHistory, setCoefficientHistory] = useState(initialHistory)
  const coeffHistoryRef = useRef(null)
  const prevGameState = useRef(null)
  const multiplierRafIdRef = useRef(null)
  const lastMultiplierUiUpdateRef = useRef(0)
  const [isBetModalOpen, setIsBetModalOpen] = useState(false)
  const catLottieRef = useRef(null)
  const [giftIconIndex, setGiftIconIndex] = useState(0)

  const giftIcons = useMemo(
    () => [
      '/image/case_card1.png',
      '/image/case_card2.png',
      '/image/case_card3.png',
      '/image/case_card4.png',
    ],
    []
  )

  useEffect(() => {
    if (gameState !== 'flying') {
      setGiftIconIndex(0)
      return
    }

    const intervalId = setInterval(() => {
      setGiftIconIndex(prev => (prev + 1) % giftIcons.length)
    }, 650)

    return () => clearInterval(intervalId)
  }, [gameState, giftIcons.length])

  // Обратный отсчёт
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameState === 'countdown' && countdown === 0) {
      // Сразу переходим к полёту без preflight анимации
      setGameState('flying')
      setMultiplier(1.0)
    }
  }, [gameState, countdown])

  // preflight больше не используется — бесшовный переход

  // Рост множителя во время полёта кота
  useEffect(() => {
    if (gameState !== 'flying') {
      return
    }

    // Снижаем нагрузку: считаем мультипликатор каждый кадр, но обновляем React state реже.
    // Было: +0.02 каждые 50ms => ~ +0.4 в секунду
    const ratePerSecond = 0.4
    const startTs = performance.now()
    lastMultiplierUiUpdateRef.current = 0
    setMultiplier(1.0)

    const tick = (ts) => {
      const elapsedSec = (ts - startTs) / 1000
      const next = Math.min(10, 1 + elapsedSec * ratePerSecond)

      // Обновляем UI примерно 15fps (каждые ~66ms), этого достаточно для цифр и анимаций.
      if (ts - lastMultiplierUiUpdateRef.current >= 66) {
        lastMultiplierUiUpdateRef.current = ts
        setMultiplier(next >= 10 ? 10 : parseFloat(next.toFixed(2)))
      }

      if (next >= 10) {
        setGameState('postflight')
        multiplierRafIdRef.current = null
        return
      }

      multiplierRafIdRef.current = requestAnimationFrame(tick)
    }

    multiplierRafIdRef.current = requestAnimationFrame(tick)

    return () => {
      if (multiplierRafIdRef.current != null) {
        cancelAnimationFrame(multiplierRafIdRef.current)
        multiplierRafIdRef.current = null
      }
    }
  }, [gameState])

  // Перезапуск игры
  const restartGame = useCallback(() => {
    setGameState('countdown')
    setCountdown(3)
    setMultiplier(1.0)
  }, [])

  // Автоматический перезапуск после краша
  useEffect(() => {
    if (gameState === 'postflight') {
      const timer = setTimeout(() => {
        restartGame()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameState, restartGame])

  // Добавляем "Ожидание" при отсчёте, затем живой коэффициент при полёте
  useEffect(() => {
    const previousState = prevGameState.current

    // При старте отсчёта добавляем "Ожидание"
    if (gameState === 'countdown' && previousState !== 'countdown') {
      setCoefficientHistory(prevHistory => {
        if (prevHistory[0]?.isPending || prevHistory[0]?.isLive) {
          return prevHistory
        }
        const updatedHistory = [{ value: null, isPending: true, isLive: false }, ...prevHistory]
        return updatedHistory.slice(0, 14)
      })
    }

    // При старте полёта меняем "Ожидание" на живой коэффициент
    if (gameState === 'flying' && previousState !== 'flying') {
      setCoefficientHistory(prevHistory => {
        const updatedHistory = [...prevHistory]
        if (updatedHistory[0]?.isPending) {
          updatedHistory[0] = { value: 1.0, isPending: false, isLive: true }
        } else if (!updatedHistory[0]?.isLive) {
          updatedHistory.unshift({ value: 1.0, isPending: false, isLive: true })
        }
        return updatedHistory.slice(0, 14)
      })
    }

    prevGameState.current = gameState
  }, [gameState])

  // Фиксируем коэффициент в истории после краша (убираем isLive)
  useEffect(() => {
    if (gameState === 'postflight') {
      setCoefficientHistory(prevHistory => {
        const nextValue = Number(multiplier.toFixed(2))
        const updatedHistory = [...prevHistory]
        if (updatedHistory[0]?.isLive) {
          // Фиксируем живой коэффициент
          updatedHistory[0] = { value: nextValue, isPending: false, isLive: false }
        } else if (updatedHistory[0]?.isPending) {
          updatedHistory[0] = { value: nextValue, isPending: false }
        } else {
          updatedHistory.unshift({ value: nextValue, isPending: false })
        }
        return updatedHistory.slice(0, 14)
      })
    }
  }, [gameState, multiplier])

  useEffect(() => {
    if (coeffHistoryRef.current) {
      const rafId = requestAnimationFrame(() => {
        coeffHistoryRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
      })
      return () => cancelAnimationFrame(rafId)
    }
  }, [gameState])

  return (
    <div className="app crash-page">
      
      <MemoHeader />
      
      <main className="main-content crash-content">
        {/* Зона игры */}
        <div className={`crash-game-area ${gameState === 'countdown' ? 'crash-countdown' : ''} ${gameState === 'postflight' ? 'crash-postflight' : ''} ${gameState !== 'countdown' ? 'crash-no-rays' : ''}`}
             style={gameState === 'flying' ? {
               '--moon-speed': `${Math.max(1.5, 4 - (multiplier - 1) * 0.15)}s`,
               '--star-speed': `${Math.max(2, 8 - (multiplier - 1) * 1.5)}s`
             } : undefined}>
          <div
            className={`cosmic-background ${gameState === 'flying' ? 'cosmic-background-active' : ''}`}
            aria-hidden="true"
          />
          <div className="crash-game-area-fade" />
          {/* Анимации взрывов и полёта кота */}
          <div className="crash-animation-container">
            {gameState === 'countdown' && (
              <div className="countdown-display">
                <span className="countdown-number">{countdown}</span>
              </div>
            )}

            {gameState === 'flying' && (
              <>
                <CrashLine multiplier={multiplier} maxMultiplier={5} />

                <Player
                  autoplay={true}
                  loop={false}
                  keepLastFrame={true}
                  src="/animation/cat fly___.json"
                  className="lottie-cat"
                  style={{
                    transform: `translate(-50%, -50%) scale(${Math.min(0.9 + (multiplier - 1) * 0.075, 1.4)})`,
                  }}
                  lottieRef={(lottie) => {
                    catLottieRef.current = lottie
                  }}
                  onEvent={(event) => {
                    if (event === 'complete') {
                      // Анимация завершилась — включаем loop и циклируем последние 5 кадров
                      const lottie = catLottieRef.current
                      if (lottie) {
                        const totalFrames = lottie.totalFrames
                        const loopStart = totalFrames - 180 // Последние 3 секунды (60fps × 3)
                        lottie.loop = true // Включаем цикл!
                        lottie.playSegments([loopStart, totalFrames], true)
                      }
                    }
                  }}
                />
              </>
            )}

            {gameState === 'postflight' && (
              <>
                <Player
                  autoplay
                  loop={false}
                  keepLastFrame
                  src="/animation/vzryv2__.json"
                  className="lottie-postflight"
                />
              </>
            )}
          </div>

          {gameState !== 'countdown' && (
            <div className="multiplier-display">
              <span className="multiplier-value">x{multiplier.toFixed(2)}</span>
            </div>
          )}

          <div className="coeff-history-overlay">
            <div
              className="coeff-history"
              aria-label="История коэффициентов"
              ref={coeffHistoryRef}
            >
              {coefficientHistory.map((item, index) => {
                const displayValue = item.isPending
                  ? 'Ожидание...'
                  : item.isLive
                    ? multiplier.toFixed(2)
                    : item.value.toFixed(2)
                const key = item.isLive ? `live-${index}` : item.isPending ? `pending-${index}` : `${item.value}-${index}`
                return (
                  <div
                    key={key}
                    className={`coeff-history-item ${index === 0 ? 'active' : ''} ${item.isPending ? 'pending' : ''} ${item.isLive ? 'live' : ''}`}
                  >
                    {displayValue}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Кнопка ставки */}
        <button className="bet-button gg-btn-glow" onClick={() => setIsBetModalOpen(true)}>
          Сделать ставку
        </button>

        {/* Модальное окно ставки */}
        <BetModal 
          isOpen={isBetModalOpen} 
          onClose={() => setIsBetModalOpen(false)} 
        />

        {/* Список игроков */}
        <div className="players-list">
          {(() => {
            const rewardMultiplier = gameState === 'flying' || gameState === 'postflight' ? multiplier : 1

            return players.map(player => {
              const rewardValue = Number((Number(player.bet) * rewardMultiplier).toFixed(2))

              return (
                <div key={player.id} className="player-row">
                  <div className="player-info">
                    <div className="player-avatar">
                      {player.src ? (
                        <img src={player.src} alt={player.name} />
                      ) : (
                        player.avatar
                      )}
                    </div>
                    <div className="player-details">
                      <span className="player-name">{player.name}</span>
                      <div className="player-stats-row">
                        <img src="/image/Coin-Icon.svg" alt="Coin" className="coin-icon-small" />
                        <span className="stat-bet">{player.betAmount}</span>
                        <span className="stat-multiplier">{player.multiplierValue}</span>
                      </div>
                    </div>
                  </div>
                  {player.bet && (
                    <div className="player-reward">
                      <div className="reward-amount-container">
                        <img src="/image/Coin-Icon.svg" alt="Coin" className="coin-icon-large" />
                        <span className={`reward-amount ${player.gift ? 'text-green' : ''}`}>
                          {rewardValue.toFixed(2)}
                        </span>
                      </div>
                      <div className="gift-container">
                        {player.gift && (
                          <img
                            key={giftIconIndex}
                            src={giftIcons[giftIconIndex]}
                            alt="Gift"
                            className="gift-icon"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          })()}
        </div>
      </main>
      
      <MemoNavigation activePage="crash" />
    </div>
  )
}

export default CrashPage
