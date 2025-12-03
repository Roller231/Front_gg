import { useState, useEffect, useCallback } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import './CrashPage.css'
import Header from './Header'
import Navigation from './Navigation'

function CrashPage() {
  const [gameState, setGameState] = useState('countdown') // 'countdown' | 'preflight' | 'flying' | 'postflight'
  const [countdown, setCountdown] = useState(3)
  const [multiplier, setMultiplier] = useState(1.0)
  const [selectedMultiplier, setSelectedMultiplier] = useState(1.0)

  const multiplierOptions = [1.0, 1.20, 5.42, 8.50, 4.95, 4]

  // Список игроков для отображения
  const players = [
    { id: 1, name: 'Crazy Frog', avatar: '🐸', bet: 5.51, multiplier: '4.38 x1.24' },
    { id: 2, name: 'MoonSun', avatar: '🌙', bet: 5.51, multiplier: '4.38 x1.24' },
    { id: 3, name: 'ADA Drop', avatar: '💎', bet: 5.51, multiplier: '4.38 x1.24' },
    { id: 4, name: 'Darkkk', avatar: '🎭', bet: null, multiplier: '4.38 x1.24' },
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
          const newValue = prev + 0.01
          // Симуляция краша на случайном значении
          if (newValue >= 1.6) {
            setGameState('postflight')
            return 1.6
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

          {/* Слайдер множителей */}
          <div className="multiplier-slider">
            {multiplierOptions.map((mult, index) => (
              <button
                key={index}
                className={`multiplier-option ${selectedMultiplier === mult ? 'selected' : ''}`}
                onClick={() => setSelectedMultiplier(mult)}
              >
                {mult.toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка ставки */}
        <button className="bet-button">
          Сделать ставку
        </button>

        {/* Список игроков */}
        <div className="players-list">
          {players.map(player => (
            <div key={player.id} className="player-row">
              <div className="player-info">
                <div className="player-avatar">{player.avatar}</div>
                <div className="player-details">
                  <span className="player-name">{player.name}</span>
                  <span className="player-multiplier">{player.multiplier}</span>
                </div>
              </div>
              {player.bet && (
                <div className="player-bet">
                  <img src="/image/Coin Icon.svg" alt="Coin" className="coin-icon" />
                  <span className="bet-amount">{player.bet}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      
      <Navigation activePage="crash" />
    </div>
  )
}

export default CrashPage
