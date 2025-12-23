import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import './CrashPage.css'
import Header from './Header'
import Navigation from './Navigation'
import BetModal from './BetModal'
import { useLanguage } from '../context/LanguageContext'
import { useCrashSocket } from "../hooks/useCrashSocket";
import { getCrashBetsByRound, getCrashBotById } from '../api/crash'
import { getUserById } from '../api/users'
import { getDropById } from '../api/cases'
import { useUser } from '../context/UserContext'
import { maskUsername } from '../utils/maskUsername'
import { vibrate, VIBRATION_PATTERNS } from '../utils/vibration'


const MemoHeader = memo(Header)
const MemoNavigation = memo(Navigation)
const MemoBetModal = memo(BetModal)

const initialHistoryValues = [1.0, 1.2, 4.96, 5.42, 8.5, 4.95, 4.0]
const initialHistory = initialHistoryValues.map(value => ({ value, isPending: false }))



// Компонент линии — волнистая, левая часть внизу, правая поднимается
const CrashLine = memo(function CrashLine({ multiplier, maxMultiplier }) {
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
    const startY = height - 10
    const endY = Math.max(5, startY - progress * (height - 15))

    const pointsCount = 24
    const waveCount = 3
    const amplitude = 4.5
    const points = Array.from({ length: pointsCount }, (_, idx) => {
      const t = idx / (pointsCount - 1)
      const x = t * width
      const controlY = startY - 5
      const baseY =
        (1 - t) * (1 - t) * startY +
        2 * (1 - t) * t * controlY +
        t * t * endY

      const offsetBucket = waveOffsets[Math.min(waveOffsets.length - 1, Math.floor(t * waveOffsets.length))]
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
  }, [progress, waveOffsets, wavePhase])

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
})

function CrashPage() {
  const { t } = useLanguage()
  const [gameState, setGameState] = useState('countdown') // 'countdown' | 'preflight' | 'flying' | 'postflight'
  const [countdown, setCountdown] = useState(null)
  const [multiplier, setMultiplier] = useState(1.0)
  const [coefficientHistory, setCoefficientHistory] = useState(initialHistory)
  const coeffHistoryRef = useRef(null)
  const prevGameState = useRef(null)
  const multiplierRafIdRef = useRef(null)
  const lastMultiplierUiUpdateRef = useRef(0)
  const [isBetModalOpen, setIsBetModalOpen] = useState(false)
  const catLottieRef = useRef(null)
  const [giftIconIndex, setGiftIconIndex] = useState(0)
  const [winModalOpen, setWinModalOpen] = useState(false)
  const [winData, setWinData] = useState(null) // { giftIcon, wonAmount, multiplier }
  const [bets, setBets] = useState({});
  const { user, setUser, settings } = useUser();
    const roundIdRef = useRef(null);

  

  const [players, setPlayers] = useState([])

  const myActiveBet = useMemo(() => {
    if (!user?.id) return null
  
    return players.find(
      p => p.userId === user.id && p.cashoutX === null
    )
  }, [players, user])
  
  const canCashout = gameState === 'flying' && Boolean(myActiveBet)

  const usersCacheRef = useRef(new Map())
  const botsCacheRef = useRef(new Map())
  const betsReqIdRef = useRef(0)
  const canPlaceBet = gameState === 'countdown' && countdown > 0

const dropsCacheRef = useRef(new Map())
const myBetInRound = useMemo(() => {
  if (!user?.id) return null

  return players.find(p => p.userId === user.id)
}, [players, user])
const canBet =
gameState === 'countdown' &&
countdown > 0 &&
!myBetInRound

const handleCashout = () => {
  if (!canCashout || !myActiveBet || !user?.id) return

  send({
    event: 'cashout',
    user_id: user.id, // 🔥 ВАЖНО
  })
}



const loadBets = useCallback(async (roundId) => {
  if (!roundId) return // ⬅️ защита от undefined
  const reqId = ++betsReqIdRef.current

  try {
    const bets = await getCrashBetsByRound(roundId)

    // если уже ушёл новый запрос — этот игнорируем
    if (reqId !== betsReqIdRef.current) return

    const usersCache = usersCacheRef.current
    const botsCache = botsCacheRef.current

    const mapped = await Promise.all(
      bets.map(async (bet) => {
        let name = 'Unknown'
        let avatar = '/image/default-avatar.png'

        if (bet.user_id < 0) {
          const botId = Math.abs(bet.user_id)
          if (!botsCache.has(botId)) {
            botsCache.set(botId, await getCrashBotById(botId))
          }
          const bot = botsCache.get(botId)
          name = bot?.nickname ?? 'Bot'
          avatar = bot?.avatar_url ?? avatar
        }

        if (bet.user_id > 0) {
          if (!usersCache.has(bet.user_id)) {
            usersCache.set(bet.user_id, await getUserById(bet.user_id))
          }
          const user = usersCache.get(bet.user_id)
          name = user?.username || user?.firstname || 'User'
          avatar = user?.url_image ?? avatar
        }

        let giftIcon = null

        if (bet.gift && bet.gift_id) {
          const dropsCache = dropsCacheRef.current
        
          if (!dropsCache.has(bet.gift_id)) {
            const drop = await getDropById(bet.gift_id)
            dropsCache.set(bet.gift_id, drop)
        
            // 🔥 DEBUG ДЛЯ БОТА
            if (bet.user_id < 0) {
              console.log('[BOT GIFT ICON]', {
                giftId: bet.gift_id,
                icon: drop?.icon_url || drop?.image,
                drop,
              })
            }
          }
        
          const drop = dropsCache.get(bet.gift_id)
          giftIcon = drop?.icon ?? null        }
        


        const betX =
          bet.cashout_multiplier ??
          bet.auto_cashout_x ??
          1

          return {
            id: bet.id,
            userId: bet.user_id, // 🔥 ВАЖНО
            name,
            avatar,
            betAmount: Number(bet.amount),
            autoCashoutX: bet.auto_cashout_x,
            cashoutX: bet.cashout_multiplier,
            gift: !!bet.gift,
            giftId: bet.gift_id ?? null,
            giftIcon,
          }
          
          
          
          
          
      })
    )

    // ещё раз защита от гонки
    if (reqId !== betsReqIdRef.current) return

    setPlayers(mapped)
  } catch (err) {
    console.error('Failed to load bets', err)
  }
}, [])

useEffect(() => {
  if (!roundIdRef.current) return

  // чаще всего ставки меняются в countdown
  const intervalMs = gameState === 'countdown' ? 700 : 2000

  const id = setInterval(() => {
    if (!roundIdRef.current) return
    loadBets(roundIdRef.current)
  }, intervalMs)

  return () => clearInterval(id)
}, [gameState, loadBets])


  const { send, connected } = useCrashSocket((msg) => {
    switch (msg.event) {
      case "new_round": {
        roundIdRef.current = msg.round_id
        setGameState("countdown")
      
        if (msg.betting_ends_at) {
          const now = Date.now() / 1000
          const left = Math.max(
            0,
            Math.ceil(msg.betting_ends_at - now)
          )
          setCountdown(left)
        }
      
        loadBets(msg.round_id)
        break
      }
      case "cashout": {
        // обновляем игроков (UI)
        setPlayers(prev =>
          prev.map(p =>
            p.userId === msg.user_id
              ? { ...p, cashoutX: msg.multiplier }
              : p
          )
        )
      
        // ✅ ЕСЛИ ЭТО НАШ ЮЗЕР — ВСЕГДА ОБНОВЛЯЕМ БАЛАНС
        if (msg.user_id === user?.id) {
          getUserById(user.id)
            .then(freshUser => {
              setUser(freshUser)
            })
            .catch(err => {
              console.error('Failed to refresh user after cashout', err)
            })
      
          // win modal
          const myBet = players.find(p => p.userId === user.id)
      
          if (myBet) {
            setWinData({
              giftIcon: myBet.gift ? myBet.giftIcon : null,
              wonAmount: myBet.betAmount * msg.multiplier,
              multiplier: msg.multiplier,
              isGift: myBet.gift,
            })
            setWinModalOpen(true)
          }
        }
      
        break
      }
      
      case "bet_placed": {
        // сразу перезагружаем ставки текущего раунда
        if (roundIdRef.current) {
          loadBets(roundIdRef.current)
        }
        break
      }
      
      
      case "state": {
        if (msg.round_id) {
          roundIdRef.current = msg.round_id
          loadBets(msg.round_id)
        }
      
        if (msg.phase === "betting") {
          setGameState("countdown")
      
          if (msg.betting_ends_at) {
            const now = Date.now() / 1000
            const left = Math.max(
              0,
              Math.ceil(msg.betting_ends_at - now)
            )
            setCountdown(left)
          }
        }
      
        if (msg.phase === "running") {
          setGameState("flying")
          setMultiplier(msg.multiplier ?? 1)
        }
      
        if (msg.phase === "crashed") {
          setGameState("postflight")
        }
      
        break
      }
      
  
        case "round_start": {
          setGameState("flying")
          // Вибрация при старте полёта
          if (settings?.vibrationEnabled) {
            vibrate(VIBRATION_PATTERNS.action)
          }
        
          if (msg.round_id) {
            roundIdRef.current = msg.round_id
            loadBets(msg.round_id)
          }
        
          break
        }
        
        
  
        case "tick": {
          // ⬅️ если зашли в середине раунда
          if (!roundIdRef.current && msg.round_id) {
            roundIdRef.current = msg.round_id
            loadBets(msg.round_id)
          }
        
          if (gameState !== "flying") {
            setGameState("flying")
          }
        
          setMultiplier(msg.multiplier)
          break
        }
        
      case "crash":
        loadBets(msg.round_id)   // ✅ сразу загрузили
        setMultiplier(msg.multiplier); // ✅ финальное значение
        setGameState("postflight");
        // Вибрация при краше
        if (settings?.vibrationEnabled) {
          vibrate(VIBRATION_PATTERNS.crash)
        }
        break;
    }
  });
  
  

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
    if (gameState !== 'countdown') return
    if (countdown === null) return // ⬅️ ВАЖНО
  
    const timer = setInterval(() => {
      setCountdown(c => (c !== null ? Math.max(0, c - 1) : null))
    }, 1000)
  
    return () => clearInterval(timer)
  }, [gameState, countdown])
  
  
  // Обратный отсчёт


  // preflight больше не используется — бесшовный переход

  // Рост множителя во время полёта кота


  // Перезапуск игры


  // Автоматический перезапуск после краша


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


  const getPlayerResultClass = (player) => {
    // проиграл
    if (gameState === 'postflight' && player.cashoutX === null) {
      return 'text-red'
    }
  
    // выиграл
    if (player.cashoutX !== null) {
      return 'text-green'
    }
  
    return ''
  }
  
  
  

  const getPlayerReward = (player) => {
    if (gameState === 'countdown') {
      return player.betAmount
    }
  
    // если был вывод — фикс
    if (player.cashoutX !== null) {
      return player.betAmount * player.cashoutX
    }
  
    if (gameState === 'flying') {
      return player.betAmount * multiplier
    }
  
    // postflight + cashoutX === null
    return 0
  }
  
  
  
  const getPlayerMultiplierLabel = (player) => {
    if (player.cashoutX) {
      return `x${player.cashoutX.toFixed(2)}`
    }
  
    if (gameState === 'flying') {
      return `x${multiplier.toFixed(2)}`
    }
  
    if (player.autoCashoutX) {
      return `auto x${player.autoCashoutX}`
    }
  
    return '—'
  }
  
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
  const getPlayerRewardLabel = (player) => {
    // проиграл
    if (gameState === 'postflight' && !player.cashoutX) {
      return '0.00'
      // или 'LOST' если хочешь
    }
  
    return getPlayerReward(player).toFixed(2)
  }
  
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
        <div className={`crash-game-area ${gameState === 'countdown' ? 'crash-countdown' : ''} ${gameState === 'postflight' ? 'crash-postflight' : ''} ${gameState !== 'countdown' ? 'crash-no-rays' : ''}`}>
          <div
            className={`cosmic-background ${gameState === 'flying' ? 'cosmic-background-active' : ''}`}
            aria-hidden="true"
          />
          <div className="crash-game-area-fade" />
          {/* Анимации взрывов и полёта кота */}
          <div className="crash-animation-container">
          {gameState === 'countdown' && (
  <div className="countdown-display">
    <span className="countdown-number">
      {countdown === null ? '...' : countdown}
    </span>
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
                      const lottie = catLottieRef.current
                      if (lottie) {
                        const totalFrames = lottie.totalFrames
                        const loopStart = totalFrames - 180
                        lottie.loop = true
                        lottie.playSegments([loopStart, totalFrames], true)
                      }
                    }
                  }}
                />
              </>
            )}

{gameState === 'postflight' && (
  <Player
    autoplay
    loop={false}
    keepLastFrame
    src="/animation/vzryv2__.json"
    className="lottie-postflight"
    onEvent={(event) => {
      if (event === 'complete') {
        // 👇 просто убираем анимацию после окончания
        setGameState('postflight-done')
      }
    }}
  />
)}

          </div>

          {gameState !== 'countdown' && (
            <div className={`multiplier-display ${gameState === 'postflight' ? 'centered sparkle' : ''}`}>
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
                  ? t('crash.waiting')
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
        <button
  className={`bet-button gg-btn-glow ${
    canCashout
      ? 'cashout'
      : !canBet
        ? 'disabled'
        : ''
  }`}
  onClick={() => {
    if (canCashout) {
      handleCashout()
    } else if (canBet) {
      setIsBetModalOpen(true)
    }
  }}
  disabled={!canBet && !canCashout}
>
  {canCashout
    ? `${t('crash.cashout')} x${multiplier.toFixed(2)}`
    : myBetInRound
      ? t('crash.betPlaced')       // 👈 НОВОЕ
      : canBet
        ? t('crash.placeBet')
        : t('crash.betsClosed')}
</button>





        {/* Модальное окно ставки */}
        <BetModal
  isOpen={isBetModalOpen}
  onClose={() => setIsBetModalOpen(false)}
  game="crash"
  mode="bet"
  canBet={canBet}
/>



        {/* Список игроков */}
        <div className="players-list">
  {players.map(player => (
    <div key={player.id} className="player-row">
      <div className="player-info">
        <div className="player-avatar">
          <img src={player.avatar} alt={player.name} />
        </div>

        <div className="player-details">
          <span className="player-name">
                            {settings?.hideLogin ? maskUsername(player.name) : player.name}
                          </span>

          <div className="player-stats-row">
            <img
              src="/image/Coin-Icon.svg"
              className="coin-icon-small"
              alt=""
            />
            <span className="stat-bet">
              {player.betAmount.toFixed(2)}
            </span>
            <span className="stat-multiplier">
  {getPlayerMultiplierLabel(player)}
</span>
          </div>
        </div>
      </div>

      <div className="player-reward">
        {!player.gift && (
          <div className="reward-amount-container">
            <img
              src="/image/Coin-Icon.svg"
              className="coin-icon-large"
              alt=""
            />
            <span className={`reward-amount ${getPlayerResultClass(player)}`}>
              {getPlayerRewardLabel(player)}
            </span>
          </div>
        )}

        {player.gift && player.giftIcon && (
          <img
            src={player.giftIcon}
            className="gift-icon"
            alt="Gift"
          />
        )}
      </div>
    </div>
  ))}
</div>

      </main>
      
      <MemoNavigation activePage="crash" />

      {/* Модальное окно выигрыша */}
      {winModalOpen && winData && (
        <div className="wheel-result-overlay" onClick={() => setWinModalOpen(false)}>
          <div className="wheel-result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wheel-result-glow"></div>
            <div className="gg-confetti" aria-hidden="true">
              {Array.from({ length: 28 }).map((_, i) => {
                const x = (i * 37) % 100
                const hue = (i * 47) % 360
                const delay = i % 12
                const rot = (i * 29) % 360
                const d = i % 8
                return (
                  <span
                    key={i}
                    className="gg-confetti-piece"
                    style={{
                      '--x': x,
                      '--hue': hue,
                      '--delay': delay,
                      '--rot': rot,
                      '--d': d,
                    }}
                  />
                )
              })}
            </div>
            <h2 className="wheel-result-title">{t('caseModal.congratulations')}</h2>
            <p className="crash-win-multiplier">x{winData.multiplier.toFixed(2)}</p>
            <div className="wheel-result-prize">
              <div className="wheel-result-card">
                <div className="wheel-result-prize-content">
                  {winData.isGift && winData.giftIcon ? (
                    <img src={winData.giftIcon} alt="Gift" className="wheel-result-image" />
                  ) : (
                    <img src="/image/Coin-Icon.svg" alt="Coins" className="crash-win-coin-icon" />
                  )}
                </div>
              </div>
              <span className="case-result-price-below">
                <img src="/image/Coin-Icon.svg" alt="currency" className="wheel-result-coin" />
                {winData.wonAmount.toFixed(2)}
              </span>
            </div>
            <button className="wheel-result-close gg-btn-glow" onClick={() => setWinModalOpen(false)}>
              {t('caseModal.claim')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CrashPage
