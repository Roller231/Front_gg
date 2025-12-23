import { useState, useEffect, useCallback, memo } from 'react'
import './PvPPage.css'
import './WheelPage.css'
import Header from './Header'
import Navigation from './Navigation'
import BetModal from './BetModal'
import { useUser } from '../context/UserContext'
import { maskUsername } from '../utils/maskUsername'
import { vibrate, VIBRATION_PATTERNS } from '../utils/vibration'
import { useCurrency } from '../context/CurrencyContext'
import { useLanguage } from '../context/LanguageContext'

const MemoHeader = memo(Header)
const MemoNavigation = memo(Navigation)
const MemoBetModal = memo(BetModal)

const players = [
  { id: 1, name: 'Crazy Frog', src: '/image/ava1.png', bet: 5.51, betAmount: '4.38', multiplierValue: 'x1.24', gift: false },
  { id: 2, name: 'MoonSun', src: '/image/ava2.png', bet: 5.51, betAmount: '4.38', multiplierValue: 'x1.24', gift: true },
  { id: 3, name: 'ADA Drop', src: '/image/ava3.png', bet: 5.51, betAmount: '4.38', multiplierValue: 'x1.24', gift: false },
  { id: 4, name: 'Darkkk', src: '/image/ava4.png', bet: 5.51, betAmount: '4.38', multiplierValue: 'x1.24', gift: false },
]

const getBodyParts = (t) => [
  { id: 'head', label: t('pvp.head'), icon: '🎯' },
  { id: 'body', label: t('pvp.body'), icon: '🛡️' },
  { id: 'legs', label: t('pvp.legs'), icon: '🦵' },
]

function PvPPage() {
  const { user, settings } = useUser()
  const { selectedCurrency } = useCurrency()
  const { t } = useLanguage()
  
  const bodyParts = getBodyParts(t)
  
  const [gameState, setGameState] = useState('waiting') // 'waiting' | 'countdown' | 'fighting' | 'result'
  const [countdown, setCountdown] = useState(3)
  const [isBetModalOpen, setIsBetModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false)
  const [myBet, setMyBet] = useState(null)
  const [opponentBet, setOpponentBet] = useState(null)
  const [autoPickCountdown, setAutoPickCountdown] = useState(null)
  const [opponent, setOpponent] = useState({
    username: '@Username',
    url_image: '/image/ava2.png',
  })
  
  // Выбор атаки и защиты
  const [attackPart, setAttackPart] = useState(null)
  const [defendPart, setDefendPart] = useState(null)
  
  // Результат боя
  const [battleResult, setBattleResult] = useState(null) // 'win' | 'lose' | 'draw'
  
  // Точки ожидания
  const [waitingDots, setWaitingDots] = useState('')

  const pickRandomPartId = useCallback(() => {
    const idx = Math.floor(Math.random() * bodyParts.length)
    return bodyParts[idx].id
  }, [bodyParts])

  // Анимация точек ожидания
  useEffect(() => {
    if (!isWaitingForOpponent) return
    
    const interval = setInterval(() => {
      setWaitingDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [isWaitingForOpponent])

  // Обратный отсчёт
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('fighting')
      // Вибрация при начале боя
      if (settings?.vibrationEnabled) {
        vibrate(VIBRATION_PATTERNS.action)
      }
      // Симулируем бой
      setTimeout(() => {
        const results = ['win', 'lose', 'draw']
        const result = results[Math.floor(Math.random() * results.length)]
        setBattleResult(result)
        setGameState('result')
        // Вибрация при результате
        if (settings?.vibrationEnabled) {
          vibrate(result === 'win' ? VIBRATION_PATTERNS.win : VIBRATION_PATTERNS.lose)
        }
      }, 2000)
    }
  }, [gameState, countdown])

  useEffect(() => {
    if (gameState !== 'result') return
    if (battleResult !== 'win' && battleResult !== 'lose') return
    setIsResultModalOpen(true)
  }, [gameState, battleResult])

  const restartGame = useCallback(() => {
    setGameState('waiting')
    setCountdown(3)
    setAttackPart(null)
    setDefendPart(null)
    setBattleResult(null)
    setIsResultModalOpen(false)
    setIsWaitingForOpponent(false)
    setMyBet(null)
    setOpponentBet(null)
    setOpponent({
      username: '@Username',
      url_image: '/image/ava2.png',
    })
  }, [])

  const closeResultModal = useCallback(() => {
    restartGame()
  }, [restartGame])

  const renderConfetti = () => (
    <div className="gg-confetti" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, i) => {
        const x = (i * 37) % 100
        const hue = (i * 47) % 360
        const rot = (i * 61) % 360
        const d = (i * 13) % 30
        const delay = (i * 7) % 20

        return (
          <span
            key={i}
            className="gg-confetti-piece"
            style={{
              '--x': x,
              '--hue': hue,
              '--rot': rot,
              '--d': d,
              '--delay': delay,
            }}
          />
        )
      })}
    </div>
  )

  const handleBetSubmit = useCallback((payload) => {
    if (!payload) return
    if (payload.type === 'coins') {
      const numeric = Number(String(payload.amount ?? '').replace(/[^0-9.]/g, ''))
      if (!Number.isFinite(numeric) || numeric <= 0) return
      const nextBet = {
        type: 'coins',
        amount: numeric,
        currencyIcon: payload.currency?.icon || selectedCurrency?.icon || '/image/Coin-Icon.svg',
      }
      setMyBet(nextBet)
      setOpponentBet(nextBet)
      return
    }

    if (payload.type === 'gift') {
      const nextBet = {
        type: 'gift',
        gift: payload.gift || null,
        currencyIcon: payload.currency?.icon || selectedCurrency?.icon || '/image/Coin-Icon.svg',
      }
      setMyBet(nextBet)
      setOpponentBet(nextBet)
    }
  }, [selectedCurrency?.icon])

  useEffect(() => {
    const shouldAutoPick =
      gameState === 'waiting' &&
      !isWaitingForOpponent &&
      myBet &&
      (!attackPart || !defendPart)

    if (!shouldAutoPick) {
      setAutoPickCountdown(null)
      return
    }

    setAutoPickCountdown(prev => (prev == null ? 5 : prev))
  }, [gameState, isWaitingForOpponent, myBet, attackPart, defendPart])

  useEffect(() => {
    if (autoPickCountdown == null) return

    if (autoPickCountdown <= 0) {
      setAttackPart(prev => prev || pickRandomPartId())
      setDefendPart(prev => prev || pickRandomPartId())
      setAutoPickCountdown(null)
      return
    }

    const timer = setTimeout(() => {
      setAutoPickCountdown(prev => (prev == null ? null : prev - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [autoPickCountdown, pickRandomPartId])

  const handleBetClick = () => {
    if (isWaitingForOpponent) return
    setIsBetModalOpen(true)
  }

  const handleStartGame = useCallback(() => {
    if (!attackPart || !defendPart || !myBet) return
    setIsWaitingForOpponent(true)

    setOpponent({
      username: '@Username',
      url_image: '/image/ava2.png',
    })

    // Симулируем ожидание противника
    setTimeout(() => {
      setIsWaitingForOpponent(false)
      setGameState('countdown')
    }, 2000)
  }, [attackPart, defendPart, myBet])

  const canStartGame = Boolean(attackPart && defendPart && myBet && gameState === 'waiting' && !isWaitingForOpponent)
  const showMatchPanel = Boolean(isWaitingForOpponent || gameState !== 'waiting')
  const rawUsername = user?.username || user?.firstname || 'Username'
  const displayUsername = settings?.hideLogin ? maskUsername(rawUsername) : `@${rawUsername}`
  const displayAvatar = user?.url_image || user?.photo_url || '/image/ava1.png'
  const currencyIcon = selectedCurrency?.icon || '/image/Coin-Icon.svg'

  const isGameInProgress = Boolean(isWaitingForOpponent || gameState === 'countdown' || gameState === 'fighting')

  useEffect(() => {
    if (!canStartGame) return
    handleStartGame()
  }, [canStartGame, handleStartGame])

  return (
    <div className="app pvp-page">
      <MemoHeader />
      
      <main className="main-content pvp-content">
        {/* Зона игры */}
        <div className={`pvp-game-area ${gameState === 'countdown' ? 'pvp-countdown' : ''} ${gameState === 'result' ? 'pvp-result' : ''}`}>
          <div className="pvp-background" aria-hidden="true" />
          <div className="pvp-game-area-fade" />
          
          {/* Анимация боя */}
          <div className="pvp-battle-container">
            {/* Левый кот */}
            <div className={`pvp-cat pvp-cat-left ${gameState === 'fighting' ? 'fighting' : ''} ${battleResult === 'win' ? 'winner' : ''} ${battleResult === 'lose' ? 'loser' : ''}`}>
              <img src="/image/cat1.svg" alt="Cat 1" className="pvp-cat-image" />
              {attackPart && gameState === 'waiting' && (
                <div className="pvp-cat-action attack">
                  <span className="action-icon">⚔️</span>
                  <span className="action-label">{bodyParts.find(p => p.id === attackPart)?.label}</span>
                </div>
              )}
            </div>

            {/* Центральная область */}
            <div className="pvp-center">
              {gameState === 'waiting' && !isWaitingForOpponent && (
                <div className="pvp-vs">{t('pvp.vs')}</div>
              )}
              
              {gameState === 'countdown' && (
                <div className="pvp-countdown-display">
                  <span className="countdown-number">{countdown}</span>
                </div>
              )}
              
              {gameState === 'fighting' && (
                <div className="pvp-fighting-display">
                  <img src="/image/material-symbols_swords-rounded-active.svg" alt="Fight" className="fighting-icon" />
                </div>
              )}
              
              {gameState === 'result' && (
                <div className={`pvp-result-display ${battleResult}`}>
                  <span className="result-text">
                    {battleResult === 'win' && t('pvp.victory')}
                    {battleResult === 'lose' && t('pvp.defeat')}
                    {battleResult === 'draw' && t('pvp.draw')}
                  </span>
                </div>
              )}
            </div>

            {/* Правый кот */}
            <div className={`pvp-cat pvp-cat-right ${gameState === 'fighting' ? 'fighting' : ''} ${battleResult === 'lose' ? 'winner' : ''} ${battleResult === 'win' ? 'loser' : ''}`}>
              <img src="/image/cat2.svg" alt="Cat 2" className="pvp-cat-image" />
              {defendPart && gameState === 'waiting' && (
                <div className="pvp-cat-action defend">
                  <span className="action-icon">🛡️</span>
                  <span className="action-label">{bodyParts.find(p => p.id === defendPart)?.label}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {showMatchPanel && (
          <div className="pvp-match-panel">
            <div className="pvp-match-top">
              <div className="pvp-player-chip">
                <img className="pvp-player-avatar" src={displayAvatar} alt="You" />
                <span className="pvp-player-name">{displayUsername}</span>
              </div>
              <div className="pvp-player-chip pvp-player-chip--right">
                <img className="pvp-player-avatar" src={opponent.url_image} alt="Opponent" />
                <span className="pvp-player-name">
                  {settings?.hideLogin ? maskUsername(opponent.username?.replace('@', '') || 'Opponent') : opponent.username}
                </span>
              </div>
            </div>

            <div className="pvp-bets-row">
              <div className="pvp-bet-card">
                <div className="pvp-bet-title">{t('pvp.opponentBet')}</div>
                {opponentBet?.type === 'gift' ? (
                  <div className="pvp-gift-bet">
                    <div className="pvp-gift-bet-price">
                      <img
                        src={opponentBet?.currencyIcon || selectedCurrency?.icon || '/image/Coin-Icon.svg'}
                        alt="currency"
                        className="pvp-gift-bet-currency-icon"
                      />
                      <span className="pvp-gift-bet-price-value">{opponentBet?.gift?.price ?? ''}</span>
                    </div>
                    <img
                      className="pvp-gift-bet-image"
                      src={opponentBet?.gift?.image || '/image/case_card1.png'}
                      alt="gift"
                    />
                  </div>
                ) : (
                  <div className="pvp-bet-value">
                    <span>{opponentBet?.amount ?? 0}</span>
                    <img
                      src={opponentBet?.currencyIcon || selectedCurrency?.icon || '/image/Coin-Icon.svg'}
                      alt="currency"
                      className="pvp-bet-currency-icon"
                    />
                  </div>
                )}
              </div>

              <div className="pvp-bet-card">
                <div className="pvp-bet-title">{t('pvp.yourBet')}</div>
                {myBet?.type === 'gift' ? (
                  <div className="pvp-gift-bet">
                    <div className="pvp-gift-bet-price">
                      <img
                        src={myBet?.currencyIcon || selectedCurrency?.icon || '/image/Coin-Icon.svg'}
                        alt="currency"
                        className="pvp-gift-bet-currency-icon"
                      />
                      <span className="pvp-gift-bet-price-value">{myBet?.gift?.price ?? ''}</span>
                    </div>
                    <img
                      className="pvp-gift-bet-image"
                      src={myBet?.gift?.image || '/image/case_card1.png'}
                      alt="gift"
                    />
                  </div>
                ) : (
                  <div className="pvp-bet-value">
                    <span>{myBet?.amount ?? 0}</span>
                    <img
                      src={myBet?.currencyIcon || selectedCurrency?.icon || '/image/Coin-Icon.svg'}
                      alt="currency"
                      className="pvp-bet-currency-icon"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Кнопка ставки */}
        <button 
          className={`bet-button gg-btn-glow ${isWaitingForOpponent ? 'waiting' : ''}`} 
          onClick={handleBetClick}
          disabled={isGameInProgress}
        >
          {isGameInProgress ? (
            <span className="waiting-text">
              <span className="pvp-waiting-spinner" aria-hidden="true" />
              {t('pvp.waiting')}{waitingDots}
            </span>
          ) : (
            t('pvp.placeBet')
          )}
        </button>

        {/* Модальное окно ставки */}
        <MemoBetModal 
          isOpen={isBetModalOpen} 
          onClose={() => setIsBetModalOpen(false)} 
          onSubmit={(payload) => {
            handleBetSubmit(payload)
            setIsBetModalOpen(false)
          }}
        />

        {/* Выбор атаки и защиты */}
        {gameState === 'waiting' && !isWaitingForOpponent && (
          <div className="pvp-selection-area">
            <div className="pvp-selection-block">
              <h3 className="selection-title">
                <span className="selection-icon">⚔️</span>
                {t('pvp.attack')}
              </h3>
              <div className="selection-options">
                {bodyParts.map(part => (
                  <button
                    key={`attack-${part.id}`}
                    className={`selection-button ${attackPart === part.id ? 'selected attack-selected' : ''}`}
                    onClick={() => setAttackPart(part.id)}
                  >
                    <span className="part-icon">{part.icon}</span>
                    <span className="part-label">{part.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pvp-selection-block">
              <h3 className="selection-title">
                <span className="selection-icon">🛡️</span>
                {t('pvp.defend')}
              </h3>
              <div className="selection-options">
                {bodyParts.map(part => (
                  <button
                    key={`defend-${part.id}`}
                    className={`selection-button ${defendPart === part.id ? 'selected defend-selected' : ''}`}
                    onClick={() => setDefendPart(part.id)}
                  >
                    <span className="part-icon">{part.icon}</span>
                    <span className="part-label">{part.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isGameInProgress && autoPickCountdown != null && (
          <div className="pvp-autopick-hint">{t('pvp.autoPickIn')} {autoPickCountdown} {t('pvp.sec')}</div>
        )}

        {isResultModalOpen && (battleResult === 'win' || battleResult === 'lose') && (
          <div className="wheel-result-overlay" onClick={closeResultModal}>
            <div className={`wheel-result-modal ${battleResult === 'lose' ? 'wheel-result-modal--lose' : ''}`} onClick={(e) => e.stopPropagation()}>
              {battleResult === 'win' ? renderConfetti() : null}
              <div className="wheel-result-glow"></div>
              <h2 className="wheel-result-title">{battleResult === 'win' ? t('pvp.victory') : t('pvp.defeat')}</h2>
              <div className="wheel-result-subtitle">
                {battleResult === 'win'
                  ? t('pvp.congratulations')
                  : t('pvp.tryAgain')}
              </div>

              {battleResult === 'win' && opponentBet && (
                <div className="wheel-result-prize">
                  <div className="wheel-result-card">
                    <span className="wheel-result-price">
                      <img src={currencyIcon} alt="currency" className="wheel-result-coin" />
                      {opponentBet?.type === 'gift' ? (opponentBet?.gift?.price ?? 0) : (opponentBet?.amount ?? 0)}
                    </span>
                    <div className="wheel-result-prize-content">
                      {opponentBet?.type === 'gift' ? (
                        <img
                          src={opponentBet?.gift?.image || '/image/case_card1.png'}
                          alt="prize"
                          className="wheel-result-image"
                        />
                      ) : (
                        <img
                          src={currencyIcon}
                          alt="currency"
                          className="wheel-result-image"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button className="wheel-result-close gg-btn-glow" onClick={closeResultModal}>
                {t('pvp.ok')}
              </button>
            </div>
          </div>
        )}

        {/* Список игроков */}
        <div className="players-list">
          {players.map(player => (
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
                      {player.bet.toFixed(2)}
                    </span>
                  </div>
                  <div className="pvp-status">
                    <span className="status-badge fighting">{t('pvp.inBattle')}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      
      <MemoNavigation activePage="pvp" />
    </div>
  )
}

export default PvPPage
