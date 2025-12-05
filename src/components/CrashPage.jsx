import { useState, useEffect, useCallback, useRef } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import './CrashPage.css'
import Header from './Header'
import Navigation from './Navigation'
import BetModal from './BetModal'

const initialHistoryValues = [1.0, 1.2, 4.96, 5.42, 8.5, 4.95, 4.0]
const initialHistory = initialHistoryValues.map(value => ({ value, isPending: false }))

function CrashPage() {
  const [gameState, setGameState] = useState('countdown') // 'countdown' | 'preflight' | 'flying' | 'postflight'
  const [countdown, setCountdown] = useState(3)
  const [multiplier, setMultiplier] = useState(1.0)
  const [coefficientHistory, setCoefficientHistory] = useState(initialHistory)
  const coeffHistoryRef = useRef(null)
  const prevGameState = useRef(null)
  const [isBetModalOpen, setIsBetModalOpen] = useState(false)

  // Список игроков для отображения
  const players = [
    { id: 1, name: 'Crazy Frog', src: '/image/ava1.png', bet: 5.51, multiplier: '4.38 x1.24', gift: false },
    { id: 2, name: 'MoonSun', src: '/image/ava2.png', bet: 5.51, multiplier: '4.38 x1.24', gift: true },
    { id: 3, name: 'ADA Drop', src: '/image/ava3.png', bet: 5.51, multiplier: '4.38 x1.24', gift: false },
    { id: 4, name: 'Darkkk', src: '/image/ava4.png', bet: 5.51, multiplier: '4.38 x1.24', gift: false },
  ]

  // Обратный отсчёт
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('preflight')
      setMultiplier(1.0)
    }
  }, [gameState, countdown])

  // Короткая анимация перед появлением кота
  useEffect(() => {
    if (gameState === 'preflight') {
      const timer = setTimeout(() => {
        setGameState('flying')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState])

  // Рост множителя во время полёта кота
  useEffect(() => {
    if (gameState === 'flying') {
      const interval = setInterval(() => {
        setMultiplier(prev => {
          const newValue = prev + 0.02
          if (newValue >= 5) {
            setGameState('postflight')
            return 5
          }
          return parseFloat(newValue.toFixed(2))
        })
      }, 50)
      return () => clearInterval(interval)
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

  // Добавляем блок «Ожидание» при старте отчёта
  useEffect(() => {
    const previousState = prevGameState.current
    if (gameState === 'countdown' && previousState !== 'countdown') {
      setCoefficientHistory(prevHistory => {
        if (prevHistory[0]?.isPending) {
          return prevHistory
        }
        const updatedHistory = [{ value: null, isPending: true }, ...prevHistory]
        return updatedHistory.slice(0, 14)
      })
    }
    prevGameState.current = gameState
  }, [gameState])

  // Обновляем историю коэффициентов после каждого раунда
  useEffect(() => {
    if (gameState === 'postflight') {
      setCoefficientHistory(prevHistory => {
        const nextValue = Number(multiplier.toFixed(2))
        const updatedHistory = [...prevHistory]
        if (updatedHistory[0]?.isPending) {
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
      coeffHistoryRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [coefficientHistory])

  return (
    <div className="app crash-page">
      <div className="top-bar">
        <span className="close-text">Close</span>
        <span className="chevron">⌄</span>
      </div>
      
      <Header />
      
      <main className="main-content crash-content">
        {/* Зона игры */}
        <div className={`crash-game-area ${gameState !== 'countdown' ? 'crash-no-rays' : ''}`}>
          <div
            className={`cosmic-background ${gameState === 'flying' ? 'cosmic-background-active' : ''}`}
            aria-hidden="true"
          />
          {/* Анимации взрывов и полёта кота */}
          <div className="crash-animation-container">
            {gameState === 'countdown' && (
              <div className="countdown-display">
                <span className="countdown-number">{countdown}</span>
              </div>
            )}

            {gameState === 'preflight' && (
              <Player
                autoplay
                loop={false}
                keepLastFrame
                src="/animation/vzryv__.json"
                className="lottie-preflight"
              />
            )}

            {gameState === 'flying' && (
              <>
                <svg
                  className="coeff-path"
                  viewBox="0 0 320 160"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 8 150 C 70 145 160 115 312 40"
                    className="coeff-path-line"
                  />
                </svg>

                <Player
                  autoplay
                  loop
                  src="/animation/cat fly___.json"
                  className="lottie-cat"
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
                const displayValue = item.isPending ? 'Ожидание...' : item.value.toFixed(2)
                const key = item.isPending ? `pending-${index}` : `${item.value}-${index}`
                return (
                  <div
                    key={key}
                    className={`coeff-history-item ${index === 0 ? 'active' : ''} ${item.isPending ? 'pending' : ''}`}
                  >
                    {displayValue}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Кнопка ставки */}
        <button className="bet-button" onClick={() => setIsBetModalOpen(true)}>
          Сделать ставку
        </button>

        {/* Модальное окно ставки */}
        <BetModal 
          isOpen={isBetModalOpen} 
          onClose={() => setIsBetModalOpen(false)} 
        />

        {/* Список игроков */}
        <div className="players-list">
          {players.map(player => {
            const [betAmount, multiplierValue] = player.multiplier.split(' ')
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
                      <img src="/image/Coin Icon.svg" alt="Coin" className="coin-icon-small" />
                      <span className="stat-bet">{betAmount}</span>
                      <span className="stat-multiplier">{multiplierValue}</span>
                    </div>
                  </div>
                </div>
                {player.bet && (
                  <div className="player-reward">
                    <div className="reward-amount-container">
                      <img src="/image/Coin Icon.svg" alt="Coin" className="coin-icon-large" />
                      <span className={`reward-amount ${player.gift ? 'text-green' : ''}`}>
                        {player.bet.toFixed ? player.bet.toFixed(2) : player.bet}
                      </span>
                    </div>
                    <div className="gift-container">
                      {player.gift && (
                        <img
                          src="/image/Progress Bar.svg"
                          alt="Gift"
                          className="gift-icon"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
      
      <Navigation activePage="crash" />
    </div>
  )
}

export default CrashPage
