import { useState, useEffect, useCallback, useRef, memo } from 'react'
import './UpgradePage.css'
import './WheelPage.css'
import Header from './Header'
import Navigation from './Navigation'
import { useUser } from '../context/UserContext'
import { useCurrency } from '../context/CurrencyContext'
import { useLanguage } from '../context/LanguageContext'

const MemoHeader = memo(Header)
const MemoNavigation = memo(Navigation)

const gifts = [
  { id: 1, name: 'Сумка', image: '/image/case_card1.png', price: 0.5 },
  { id: 2, name: 'Pepe', image: '/image/case_card2.png', price: 1.0 },
  { id: 3, name: 'Кристаллы', image: '/image/case_card3.png', price: 2.5 },
  { id: 4, name: 'Шлем', image: '/image/case_card4.png', price: 5.0 },
  { id: 5, name: 'Редкий', image: '/image/case_card1.png', price: 10.0 },
  { id: 6, name: 'Эпик', image: '/image/case_card2.png', price: 25.0 },
]

const targetGifts = [
  { id: 101, name: 'Золотой Шлем', image: '/image/case_card4.png', price: 1.0, multiplier: 2 },
  { id: 102, name: 'Платиновый Pepe', image: '/image/case_card2.png', price: 2.5, multiplier: 2.5 },
  { id: 103, name: 'Алмазная Сумка', image: '/image/case_card1.png', price: 5.0, multiplier: 5 },
  { id: 104, name: 'Легендарные Кристаллы', image: '/image/case_card3.png', price: 12.5, multiplier: 10 },
  { id: 105, name: 'Мифический Предмет', image: '/image/case_card4.png', price: 50.0, multiplier: 25 },
]

function UpgradePage() {
  const { user } = useUser()
  const { selectedCurrency } = useCurrency()
  const { t } = useLanguage()
  
  const [sourceItem, setSourceItem] = useState(null)
  const [targetItem, setTargetItem] = useState(null)
  const [gameState, setGameState] = useState('idle') // 'idle' | 'spinning' | 'win' | 'lose'
  const [chance, setChance] = useState(50)
  const [resultText, setResultText] = useState(null)
  
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const currentAngleRef = useRef(Math.PI / 2)
  const isSpinningRef = useRef(false)
  const lastIsWinRef = useRef(null)

  // Рассчёт шанса на основе цен
  useEffect(() => {
    if (sourceItem && targetItem) {
      const calculatedChance = Math.min(95, Math.max(5, (sourceItem.price / targetItem.price) * 100))
      setChance(Math.round(calculatedChance * 100) / 100)
    } else {
      setChance(50)
    }
  }, [sourceItem, targetItem])

  // Canvas drawing
  const drawWheel = useCallback((rotationAngle) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 70
    // Угол на каждую сторону от нижней точки (PI/2).
    // При 50% halfAngle = PI/2 (до боковых меток 50%), при 100% halfAngle = PI (до верхней метки 100%).
    const halfAngle = (chance / 100) * Math.PI
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 1. Фоновый круг (серый трек)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = '#2c2c2e'
    ctx.lineWidth = 12
    ctx.stroke()
    
    // 2. Засечки
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 1
    for (let i = 0; i < 60; i++) {
      ctx.rotate((Math.PI * 2) / 60)
      ctx.beginPath()
      ctx.moveTo(radius + 12, 0)
      ctx.lineTo(radius + 20, 0)
      ctx.stroke()
    }
    ctx.restore()
    
    // 3. Зона победы (желто-оранжевая дуга)
    const gradient = ctx.createLinearGradient(0, centerY + radius, 0, centerY - radius)
    gradient.addColorStop(0, '#ff6600')
    gradient.addColorStop(0.5, '#ffcc00')
    gradient.addColorStop(1, '#BBFD44')
    
    // Левая дуга (от низа влево вверх)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI / 2, Math.PI / 2 + halfAngle, false)
    ctx.strokeStyle = gradient
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.stroke()
    
    // Правая дуга (от низа вправо вверх)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI / 2, Math.PI / 2 - halfAngle, true)
    ctx.strokeStyle = gradient
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.stroke()
    
    // 4. Внутренний тёмный круг
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 15, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(20, 20, 30, 0.95)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // 5. Стрелка (курсор) - вращается вокруг колеса
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationAngle)
    
    const pointerGradient = ctx.createLinearGradient(radius - 12, 0, radius + 12, 0)
    pointerGradient.addColorStop(0, '#FFAF4D')
    pointerGradient.addColorStop(0.5, '#FFF7A7')
    pointerGradient.addColorStop(1, '#FFAF4D')

    ctx.beginPath()
    ctx.fillStyle = pointerGradient
    ctx.shadowBlur = 12
    ctx.shadowColor = '#FFAF4D'
    ctx.moveTo(radius - 8, 0)
    ctx.lineTo(radius + 8, -6)
    ctx.lineTo(radius + 8, 6)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    
    // 6. Метка 100% сверху (боковые 50% вынесены в HTML)
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.shadowBlur = 8
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
    ctx.fillText('100%', centerX, 12)
    ctx.restore()
  }, [chance])

  // Инициализация canvas
  useEffect(() => {
    drawWheel(Math.PI / 2)
  }, [drawWheel, chance])

  const handleSourceSelect = useCallback((gift) => {
    if (gameState !== 'idle') return
    setSourceItem(gift)
  }, [gameState])

  const handleTargetSelect = useCallback((gift) => {
    if (gameState !== 'idle') return
    setTargetItem(gift)
  }, [gameState])

  const handleUpgrade = useCallback(() => {
    if (!sourceItem || !targetItem || gameState !== 'idle' || isSpinningRef.current) return

    isSpinningRef.current = true
    setGameState('spinning')
    setResultText(null)
    
    // Определяем результат
    const randomValue = Math.random() * 100
    const isWin = randomValue <= chance
    
    // Вычисляем угол остановки (углы canvas: 0 = вправо, PI/2 = вниз)
    const TWO_PI = Math.PI * 2
    const halfAngle = (chance / 100) * Math.PI
    const buffer = 0.08
    const winHalf = Math.max(0, halfAngle - buffer)

    const normalize = (a) => {
      const m = a % TWO_PI
      return m < 0 ? m + TWO_PI : m
    }

    let targetAngle
    if (isWin) {
      // Победа: внутри окрашенной зоны вокруг низа (PI/2 ± halfAngle), но с небольшим отступом от краёв
      const t = (Math.random() * 2 - 1) * winHalf
      targetAngle = normalize(Math.PI / 2 + t)
    } else {
      // Проигрыш: строго ВНЕ окрашенной зоны (PI/2 ± halfAngle), тоже с небольшим отступом
      // Чтобы стрелка никогда не попадала на окрашенную дугу при результате LOSE.
      const loseHalf = Math.max(0, halfAngle + buffer)
      const loseStart = Math.PI / 2 + loseHalf
      const loseLen = Math.max(0, TWO_PI - 2 * loseHalf)
      targetAngle = normalize(loseStart + Math.random() * loseLen)
    }
    
    // Добавляем 5 полных оборотов
    const totalRotation = targetAngle + (Math.PI * 2 * 5)
    
    let startAngle = normalize(currentAngleRef.current)
    let startTime = null
    const duration = 4000
    
    // Ease Out Cubic
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = (timestamp - startTime) / duration
      
      if (progress < 1) {
        const ease = easeOutCubic(progress)
        currentAngleRef.current = startAngle + (totalRotation - startAngle) * ease
        drawWheel(currentAngleRef.current)
        animationRef.current = requestAnimationFrame(animate)
      } else {
        currentAngleRef.current = targetAngle
        drawWheel(currentAngleRef.current)
        isSpinningRef.current = false
        lastIsWinRef.current = isWin
        
        if (isWin) {
          setGameState('win')
          setResultText('SUCCESS')
        } else {
          setGameState('lose')
          setResultText('FAILED')
        }
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [sourceItem, targetItem, chance, gameState, drawWheel])

  // Cleanup animation on unmount
  useEffect(() => {
    const interval = setInterval(() => {
      setLightPhase(prev => (prev + 1) % 4)
    }, isSpinning ? 80 : 400)
    return () => clearInterval(interval)
  }, [])

  const closeResultModal = useCallback(() => {
    const isWin = !!lastIsWinRef.current
    setGameState('idle')
    setResultText(null)
    if (!isWin) {
      setSourceItem(null)
    } else {
      setSourceItem(null)
      setTargetItem(null)
    }
  }, [])

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

  const currencyIcon = selectedCurrency?.icon || '/image/Coin-Icon.svg'

  return (
    <div className="app upgrade-page">
      <MemoHeader />
      
      <main className="main-content upgrade-content">
        {/* Основная зона апгрейда */}
        <div className={`upgrade-game-area ${gameState}`}>
          <div className="upgrade-background" aria-hidden="true" />
          <div className="upgrade-game-area-fade" />
          
          <div className="upgrade-main-container">
            {/* Левая коробка - исходный предмет */}
            <div className={`upgrade-box upgrade-box-source ${sourceItem ? 'has-item' : ''} ${gameState === 'lose' ? 'losing' : ''}`}>
              <div className="upgrade-box-label">{t('upgrade.yourItem')}</div>
              <div className="upgrade-box-content">
                {sourceItem ? (
                  <>
                    <img src={sourceItem.image} alt={sourceItem.name} className="upgrade-item-image" />
                    <div className="upgrade-item-price">
                      <img src={currencyIcon} alt="currency" className="upgrade-currency-icon" />
                      <span>{sourceItem.price}</span>
                    </div>
                  </>
                ) : (
                  <div className="upgrade-box-empty">
                    <div className="upgrade-box-arrow">
                      <img src="/image/mdi_gift.svg" alt="gift" className="upgrade-box-gift-icon" />
                    </div>
                    <span>{t('upgrade.selectItem')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Центр - Колесо шанса */}
            <div className="upgrade-wheel-container">
              <div className="upgrade-wheel">
                <canvas 
                  ref={canvasRef} 
                  width="180" 
                  height="180" 
                  className="upgrade-wheel-canvas"
                />
                
                {/* Боковые проценты */}
                <span className="upgrade-percent-label upgrade-percent-left">50%</span>
                <span className="upgrade-percent-label upgrade-percent-right">50%</span>
                
                {/* Центр с процентом */}
                <div className={`upgrade-wheel-center ${gameState}`}>
                  <span className={`upgrade-chance-value ${resultText ? (gameState === 'win' ? 'win' : 'lose') : ''}`}>
                    {resultText || `${chance.toFixed(2)}%`}
                  </span>
                  <span className="upgrade-chance-label">
                    {chance >= 75 ? t('upgrade.highChance') : chance >= 40 ? t('upgrade.mediumChance') : t('upgrade.lowChance')}
                  </span>
                </div>
              </div>
            </div>

            {/* Правая коробка - целевой предмет */}
            <div className={`upgrade-box upgrade-box-target ${targetItem ? 'has-item' : ''} ${gameState === 'win' ? 'winning' : ''}`}>
              <div className="upgrade-box-label">{t('upgrade.upgradeTarget')}</div>
              <div className="upgrade-box-content">
                {targetItem ? (
                  <>
                    <img src={targetItem.image} alt={targetItem.name} className="upgrade-item-image" />
                    <div className="upgrade-item-price">
                      <img src={currencyIcon} alt="currency" className="upgrade-currency-icon" />
                      <span>{targetItem.price}</span>
                    </div>
                  </>
                ) : (
                  <div className="upgrade-box-empty">
                    <div className="upgrade-box-arrow">
                      <img src="/image/mdi_gift.svg" alt="gift" className="upgrade-box-gift-icon" />
                    </div>
                    <span>{t('upgrade.selectTarget')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Кнопка апгрейда - на всю ширину */}
          <button 
            className={`bet-button gg-btn-glow upgrade-full-btn ${gameState !== 'idle' ? 'disabled' : ''} ${(!sourceItem || !targetItem) ? 'inactive' : ''}`}
            onClick={handleUpgrade}
            disabled={gameState !== 'idle' || !sourceItem || !targetItem}
          >
            {t('upgrade.upgrade')}
          </button>
          
          {(gameState === 'win' || gameState === 'lose') && (
            <div className={`wheel-result-overlay ${gameState === 'lose' ? 'wheel-result-overlay--lose' : ''}`} onClick={closeResultModal}>
              <div className={`wheel-result-modal ${gameState === 'lose' ? 'wheel-result-modal--lose' : ''}`} onClick={(e) => e.stopPropagation()}>
                {gameState === 'win' ? renderConfetti() : null}
                <div className="wheel-result-glow"></div>
                <h2 className="wheel-result-title">{gameState === 'win' ? t('upgrade.success') : t('upgrade.failed')}</h2>
                <div className="wheel-result-subtitle">
                  {gameState === 'win'
                    ? t('upgrade.congratulations')
                    : t('upgrade.tryAgain')}
                </div>
                {gameState === 'win' && (
                  <div className="wheel-result-prize">
                    <div className="wheel-result-card">
                      <span className="wheel-result-price">
                        <img src={currencyIcon} alt="currency" className="wheel-result-coin" />
                        {targetItem?.price ?? 0}
                      </span>
                      <div className="wheel-result-prize-content">
                        <img
                          src={targetItem?.image || '/image/case_card1.png'}
                          alt="prize"
                          className="wheel-result-image"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <button className="wheel-result-close gg-btn-glow" onClick={closeResultModal}>
                  {t('upgrade.ok')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Выбор предметов - Ваши предметы */}
        <div className="upgrade-selection-section">
          <h3 className="upgrade-section-title">{t('upgrade.yourItems')}</h3>
          <div className="upgrade-gifts-grid">
            {gifts.map((gift) => (
              <div 
                key={gift.id}
                className={`upgrade-gift-card ${sourceItem?.id === gift.id ? 'selected' : ''}`}
                onClick={() => handleSourceSelect(gift)}
              >
                <div className="upgrade-gift-price">
                  <img src={currencyIcon} alt="currency" className="upgrade-gift-currency" />
                  <span>{gift.price}</span>
                </div>
                <img src={gift.image} alt={gift.name} className="upgrade-gift-image" />
              </div>
            ))}
          </div>
        </div>

        {/* Выбор целевых предметов */}
        <div className="upgrade-selection-section">
          <h3 className="upgrade-section-title">{t('upgrade.upgradeTargets')}</h3>
          <div className="upgrade-gifts-grid">
            {targetGifts.map((gift) => (
              <div 
                key={gift.id}
                className={`upgrade-gift-card target ${targetItem?.id === gift.id ? 'selected' : ''}`}
                onClick={() => handleTargetSelect(gift)}
              >
                <div className="upgrade-gift-price">
                  <img src={currencyIcon} alt="currency" className="upgrade-gift-currency" />
                  <span>{gift.price}</span>
                </div>
                <div className="upgrade-gift-multiplier">x{gift.multiplier}</div>
                <img src={gift.image} alt={gift.name} className="upgrade-gift-image" />
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <MemoNavigation activePage="upgrade" />
    </div>
  )
}

export default UpgradePage
