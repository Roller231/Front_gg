import { useState, useEffect, useRef } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import './WheelPage.css'
import Header from './Header'
import Navigation from './Navigation'
import { Player } from '@lottiefiles/react-lottie-player'
import BetModal from './BetModal'
import { liveDrops } from '../data/liveDrops'


// Wheel prizes - 10 segments with case card images and one Lottie animation
const wheelPrizes = [
  { id: 1, type: 'purple', contentType: 'image', image: '/image/case_card1.png', price: 0.1 },
  { id: 2, type: 'blue', contentType: 'image', image: '/image/case_card2.png', price: 0.2 },
  { id: 3, type: 'purple', contentType: 'image', image: '/image/case_card3.png', price: 0.5 },
  { id: 4, type: 'blue', contentType: 'image', image: '/image/case_card4.png', price: 0.3 },
  { id: 5, type: 'purple', contentType: 'animation', animation: '/animation/sticker.json', price: 1.0 },
  { id: 6, type: 'blue', contentType: 'image', image: '/image/case_card2.png', price: 0.2 },
  { id: 7, type: 'purple', contentType: 'image', image: '/image/case_card3.png', price: 0.5 },
  { id: 8, type: 'blue', contentType: 'image', image: '/image/case_card4.png', price: 0.3 },
  { id: 9, type: 'purple', contentType: 'image', image: '/image/case_card1.png', price: 0.1 },
  { id: 10, type: 'blue', contentType: 'image', image: '/image/case_card2.png', price: 0.2 },
]

const NUM_LIGHTS = 32 // Number of lights around the wheel

function WheelPage() {
  const { selectedCurrency, hasFreeSpins } = useCurrency()
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [wonPrize, setWonPrize] = useState(null)
  const [lightPhase, setLightPhase] = useState(0)
  const [showCrashModal, setShowCrashModal] = useState(false)
  const [showPrizesModal, setShowPrizesModal] = useState(false)
  const wheelRef = useRef(null)
  
  // Для свайпа prizes modal
  const prizesModalRef = useRef(null)
  const prizesContentRef = useRef(null)
  const prizesDragStartY = useRef(0)
  const prizesCurrentTranslateY = useRef(0)
  const prizesIsDragging = useRef(false)

  const currencyIcon = selectedCurrency?.icon || '/image/Coin-Icon.svg'

  // Animate lights
  useEffect(() => {
    const interval = setInterval(() => {
      setLightPhase(prev => (prev + 1) % 4)
    }, isSpinning ? 80 : 400)
    return () => clearInterval(interval)
  }, [isSpinning])

  const handleSpin = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setShowResult(false)
    
    const segmentAngle = 360 / wheelPrizes.length // 36 degrees per segment
    const fullRotations = (5 + Math.floor(Math.random() * 3)) * 360 // 5-7 full rotations
    const targetSegment = Math.floor(Math.random() * wheelPrizes.length)
    
    console.log('🎯 Target Segment:', targetSegment, 'Prize:', wheelPrizes[targetSegment])
    
    // Pointer is at top (0 degrees position)
    // Segment content is positioned at: index * segmentAngle + (segmentAngle / 2)
    // For segment 0: 0 + 18 = 18 degrees
    // For segment 1: 36 + 18 = 54 degrees, etc.
    
    // Keep gift/card visual positions intact and adjust only the rotation formula.
    // Segment drawing starts at top due to -90deg offset used in generateSegmentPath().
    // We want the chosen segment center to end up under the top pointer.
    const desiredFinalPosition = (360 - (targetSegment * segmentAngle + segmentAngle / 2)) % 360
    
    // Current wheel position (normalize to 0-360)
    const currentPosition = ((rotation % 360) + 360) % 360
    
    // Calculate how much more we need to rotate
    let rotationNeeded = desiredFinalPosition - currentPosition
    rotationNeeded = ((rotationNeeded % 360) + 360) % 360
    
    const newRotation = rotation + fullRotations + rotationNeeded
    
    console.log('📊 Current:', currentPosition.toFixed(1), 'Desired Final:', desiredFinalPosition.toFixed(1), 'Rotation Needed:', rotationNeeded.toFixed(1), 'New Total:', newRotation.toFixed(1))
    
    setRotation(newRotation)
    setWonPrize(wheelPrizes[targetSegment])
    
    setTimeout(() => {
      setIsSpinning(false)
      setShowResult(true)
      const finalPos = newRotation % 360
      console.log('✅ Final rotation:', finalPos.toFixed(1), 'Should be:', desiredFinalPosition.toFixed(1), 'Match:', Math.abs(finalPos - desiredFinalPosition) < 1)
    }, 6000)
  }

  const closeResult = () => {
    setShowResult(false)
  }

  const handleOpenDeposit = () => {
    setShowCrashModal(true)
  }

  const closeDepositModal = () => {
    setShowCrashModal(false)
  }

  const handleOpenPrizes = () => {
    setShowPrizesModal(true)
  }

  const closePrizesModal = () => {
    setShowPrizesModal(false)
  }

  // Сброс позиции prizes modal при открытии
  useEffect(() => {
    if (showPrizesModal && prizesContentRef.current) {
      prizesContentRef.current.style.transform = 'translateY(0)'
      prizesCurrentTranslateY.current = 0
    }
  }, [showPrizesModal])

  // Обработчики для свайпа prizes modal
  const handlePrizesDragStart = (e) => {
    prizesIsDragging.current = true
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    prizesDragStartY.current = clientY
    
    if (prizesContentRef.current) {
      prizesContentRef.current.style.transition = 'none'
    }
  }

  const handlePrizesDragMove = (e) => {
    if (!prizesIsDragging.current) return
    
    e.preventDefault()
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
    let newTranslateY = clientY - prizesDragStartY.current
    
    // Ограничиваем движение только вниз
    if (newTranslateY < 0) newTranslateY = 0
    
    prizesCurrentTranslateY.current = newTranslateY
    
    if (prizesContentRef.current) {
      prizesContentRef.current.style.transform = `translateY(${newTranslateY}px)`
    }
  }

  const handlePrizesDragEnd = () => {
    if (!prizesIsDragging.current) return
    prizesIsDragging.current = false
    
    if (prizesContentRef.current) {
      prizesContentRef.current.style.transition = 'transform 0.3s ease-out'
      
      // Если свайпнули больше чем на 100px - закрываем
      if (prizesCurrentTranslateY.current > 100) {
        prizesContentRef.current.style.transform = 'translateY(100%)'
        setTimeout(() => {
          closePrizesModal()
          prizesCurrentTranslateY.current = 0
        }, 300)
      } else {
        prizesContentRef.current.style.transform = 'translateY(0)'
        prizesCurrentTranslateY.current = 0
      }
    }
  }

  // Обработчики для mouse events на document для prizes modal
  useEffect(() => {
    const handleMouseMove = (e) => handlePrizesDragMove(e)
    const handleMouseUp = () => handlePrizesDragEnd()

    if (showPrizesModal) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [showPrizesModal])

  // Generate segment path for SVG
  const generateSegmentPath = (index, total, innerRadius, outerRadius) => {
    const angle = 360 / total
    const startAngle = (index * angle - 90) * (Math.PI / 180)
    const endAngle = ((index + 1) * angle - 90) * (Math.PI / 180)
    
    const x1 = 150 + outerRadius * Math.cos(startAngle)
    const y1 = 150 + outerRadius * Math.sin(startAngle)
    const x2 = 150 + outerRadius * Math.cos(endAngle)
    const y2 = 150 + outerRadius * Math.sin(endAngle)
    const x3 = 150 + innerRadius * Math.cos(endAngle)
    const y3 = 150 + innerRadius * Math.sin(endAngle)
    const x4 = 150 + innerRadius * Math.cos(startAngle)
    const y4 = 150 + innerRadius * Math.sin(startAngle)
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`
  }

  return (
    <div className="wheel-page">
      <Header />

      <main className="wheel-main">
        {/* Live feed bar - same as CasesPage */}
        <div className="live-feed-bar">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">Live</span>
          </div>
          <div className="live-items-wrapper">
            <div className="live-items-track">
              {[...liveDrops, ...liveDrops].map((drop, idx) => (
                <div key={`${drop.id}-${idx}`} className="live-item">
                  {drop.type === 'animation' && drop.animation ? (
                    <Player
                      autoplay
                      loop
                      src={drop.animation}
                      className="live-item-animation"
                    />
                  ) : (
                    <img
                      src={drop.image}
                      alt={drop.name}
                      className="live-item-image"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fortune Wheel Section */}
        <div className="wheel-section">
          {/* Background glow effect */}
          <div className="wheel-bg-glow"></div>
          
          <div className="wheel-container">
            {/* Outer glow ring */}
            <div className="wheel-outer-glow"></div>
            
            {/* Lights ring */}
            <div className="wheel-lights-ring">
              {[...Array(NUM_LIGHTS)].map((_, i) => {
                const angle = (i * 360) / NUM_LIGHTS
                const isLit = (i + lightPhase) % 2 === 0
                return (
                  <div
                    key={i}
                    className={`wheel-light ${isLit ? 'wheel-light--lit' : ''}`}
                    style={{
                      '--light-angle': `${angle}deg`,
                    }}
                  />
                )
              })}
            </div>
            
            {/* Main wheel */}
            <div 
              className={`wheel-fortune ${isSpinning ? 'wheel-fortune--spinning' : ''}`}
              style={{ transform: `rotate(${rotation}deg) scale(var(--wheel-scale))` }}
              ref={wheelRef}
            >
              <svg viewBox="0 0 300 300" className="wheel-svg">
                <defs>
                  {/* Gradient for purple segments */}
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#6D28D9" />
                    <stop offset="100%" stopColor="#4C1D95" />
                  </linearGradient>
                  {/* Gradient for blue segments */}
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </linearGradient>
                  {/* Shadow filter */}
                  <filter id="segmentShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
                  </filter>
                </defs>
                
                {/* Wheel segments */}
                {wheelPrizes.map((prize, index) => (
                  <path
                    key={prize.id}
                    d={generateSegmentPath(index, wheelPrizes.length, 30, 130)}
                    fill={`url(#${prize.type === 'purple' ? 'purpleGradient' : 'blueGradient'})`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                    filter="url(#segmentShadow)"
                  />
                ))}
                
                {/* Segment dividers */}
                {wheelPrizes.map((_, index) => {
                  const angle = (index * 360 / wheelPrizes.length - 90) * (Math.PI / 180)
                  const x1 = 150 + 30 * Math.cos(angle)
                  const y1 = 150 + 30 * Math.sin(angle)
                  const x2 = 150 + 130 * Math.cos(angle)
                  const y2 = 150 + 130 * Math.sin(angle)
                  return (
                    <line
                      key={`divider-${index}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                    />
                  )
                })}
              </svg>
              
              {/* Prize images/animations on segments */}
              {wheelPrizes.map((prize, index) => {
                const angle = (index * 360 / wheelPrizes.length) + (180 / wheelPrizes.length)
                return (
                  <div
                    key={`content-${prize.id}`}
                    className="wheel-segment-content"
                    style={{ '--segment-angle': `${angle}deg` }}
                  >
                    <span className="wheel-segment-price">
                      <img src={currencyIcon} alt="currency" className="wheel-segment-coin" />
                      {prize.price}
                    </span>
                    {prize.contentType === 'animation' ? (
                      <Player
                        autoplay
                        loop
                        src={prize.animation}
                        className="wheel-segment-animation"
                      />
                    ) : (
                      <img src={prize.image} alt="prize" className="wheel-segment-image" />
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Center hub */}
            <div className="wheel-center-hub">
              <div className="wheel-center-inner">
                <div className="wheel-center-shine"></div>
              </div>
            </div>
            
            {/* Pointer/Arrow - Teardrop shape */}
            <div className="wheel-pointer-arrow">
              <svg viewBox="0 0 60 80" className="wheel-arrow-svg">
                <defs>
                  <radialGradient id="teardropGradient" cx="50%" cy="40%">
                    <stop offset="0%" stopColor="#FFE680" />
                    <stop offset="40%" stopColor="#FFD700" />
                    <stop offset="70%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </radialGradient>
                  <filter id="teardropGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Teardrop/droplet shape */}
                <path 
                  d="M30 10 C30 10, 10 30, 10 50 C10 65, 18 75, 30 75 C42 75, 50 65, 50 50 C50 30, 30 10, 30 10 Z" 
                  fill="url(#teardropGradient)"
                  filter="url(#teardropGlow)"
                  stroke="#FFD700"
                  strokeWidth="2"
                />
                {/* White highlight for 3D effect */}
                <ellipse 
                  cx="25" 
                  cy="35" 
                  rx="8" 
                  ry="12" 
                  fill="rgba(255, 255, 255, 0.4)"
                  filter="blur(2px)"
                />
              </svg>
            </div>
          </div>

          {/* Buttons */}
          <div className="wheel-buttons-container">
            <div className="wheel-bet-hint">Выше ставка - больше ценность лута</div>
            <button 
              className={`wheel-spin-btn gg-btn-glow ${isSpinning ? 'wheel-spin-btn--disabled' : ''}`}
              onClick={hasFreeSpins ? handleSpin : handleOpenDeposit}
              disabled={isSpinning}
            >
              <span className="wheel-spin-btn-text">
                {hasFreeSpins ? 'Крутить' : 'Пополнить баланс'}
              </span>
            </button>
            <button className="wheel-prizes-btn" onClick={handleOpenPrizes}>
              Список призов
            </button>
          </div>
        </div>

        {/* Result Modal */}
        {showResult && wonPrize && (
          <div className="wheel-result-overlay" onClick={closeResult}>
            <div className="wheel-result-modal" onClick={e => e.stopPropagation()}>
              <div className="wheel-result-glow"></div>
              <h2 className="wheel-result-title">Поздравляем!</h2>
              <div className="wheel-result-prize">
                <div className="wheel-result-card">
                  <span className="wheel-result-price">
                    <img src={currencyIcon} alt="currency" className="wheel-result-coin" />
                    {wonPrize.price}
                  </span>
                  <div className="wheel-result-prize-content">
                    {wonPrize.contentType === 'animation' ? (
                      <Player
                        autoplay
                        loop
                        src={wonPrize.animation}
                        className="wheel-result-animation"
                      />
                    ) : (
                      <img src={wonPrize.image} alt="prize" className="wheel-result-image" />
                    )}
                  </div>
                </div>
              </div>
              <button className="wheel-result-close gg-btn-glow" onClick={closeResult}>
                Забрать
              </button>
            </div>
          </div>
        )}

        {/* Bet Modal */}
        <BetModal isOpen={showCrashModal} onClose={closeDepositModal} mode="deposit" />

        {/* Prizes Modal */}
        {showPrizesModal && (
          <div className="prizes-modal-overlay" onClick={closePrizesModal}>
            <div 
              className="prizes-modal-content" 
              onClick={e => e.stopPropagation()}
              ref={prizesContentRef}
              onMouseDown={handlePrizesDragStart}
              onTouchStart={handlePrizesDragStart}
              onTouchMove={handlePrizesDragMove}
              onTouchEnd={handlePrizesDragEnd}
            >
              <div className="prizes-modal-header">
                <div className="prizes-modal-handle">
                  <div className="prizes-modal-handle-bar"></div>
                </div>
                <h2 className="prizes-modal-title">Список призов</h2>
              </div>
              <div className="prizes-modal-body">
                <div className="prizes-grid">
                  {wheelPrizes.map((prize) => (
                    <div key={prize.id} className="prize-card">
                      <span className="prize-price-badge">
                        <img src={currencyIcon} alt="currency" className="prize-price-coin" />
                        {prize.price}
                      </span>
                      <div className="prize-image">
                        {prize.contentType === 'animation' ? (
                          <Player
                            autoplay
                            loop
                            src={prize.animation}
                            className="prize-animation"
                          />
                        ) : (
                          <img src={prize.image} alt="prize" className="prize-img" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Navigation activePage="wheel" />
    </div>
  )
}

export default WheelPage
