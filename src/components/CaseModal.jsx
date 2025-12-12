import { useState, useRef, useEffect } from 'react'
import './CaseModal.css'
import { useCurrency } from '../context/CurrencyContext'
import DepositModal from './DepositModal'
import { Player } from '@lottiefiles/react-lottie-player'

// Предметы внутри кейса (моковые данные)
const caseItems = [
  { id: 1, price: 0.1, type: 'image', image: '/image/case_card1.png', name: 'Gift 1' },
  { id: 2, price: 0.1, type: 'image', image: '/image/case_card2.png', name: 'Gift 2' },
  { id: 3, price: 0.1, type: 'image', image: '/image/case_card3.png', name: 'Gift 3' },
  { id: 4, price: 0.1, type: 'image', image: '/image/case_card4.png', name: 'Gift 4' },
  { id: 5, price: 0.1, type: 'animation', animation: '/animation/sticker.json', name: 'Sticker' },
]

function CaseModal({ isOpen, onClose, caseData, isPaid = true }) {
  const [view, setView] = useState('main') // 'main' | 'spin' | 'result'
  const [wonAmount, setWonAmount] = useState(0)
  const [wonItem, setWonItem] = useState(null)
  const [spinItems, setSpinItems] = useState([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const { selectedCurrency } = useCurrency()
  const [spinOffset, setSpinOffset] = useState(50)
  const [spinPhase, setSpinPhase] = useState('idle') // 'idle' | 'main' | 'settle'
  const spinTrackRef = useRef(null)
  const spinTrackInnerRef = useRef(null)
  const spinAnimationStartedRef = useRef(false)
  
  // Для свайпа
  const modalRef = useRef(null)
  const contentRef = useRef(null)
  const dragStartY = useRef(0)
  const currentTranslateY = useRef(0)
  const isDragging = useRef(false)

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      setView('main')
      setWonAmount(0)
      setWonItem(null)
      setSpinItems([])
      setIsSpinning(false)
      if (contentRef.current) {
        contentRef.current.style.transform = 'translateY(0)'
        currentTranslateY.current = 0
      }
    }
  }, [isOpen])

  // Начало свайпа
  const handleDragStart = (e) => {
    isDragging.current = true
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    dragStartY.current = clientY - currentTranslateY.current
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'none'
    }
  }

  // Движение свайпа
  const handleDragMove = (e) => {
    if (!isDragging.current) return
    
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
    let newTranslateY = clientY - dragStartY.current
    
    if (newTranslateY < 0) newTranslateY = 0
    
    currentTranslateY.current = newTranslateY
    
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(${newTranslateY}px)`
    }
  }

  // Конец свайпа
  const handleDragEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.3s ease-out'
      
      if (currentTranslateY.current > 100) {
        contentRef.current.style.transform = 'translateY(100%)'
        setTimeout(() => {
          onClose()
          currentTranslateY.current = 0
        }, 300)
      } else {
        contentRef.current.style.transform = 'translateY(0)'
        currentTranslateY.current = 0
      }
    }
  }

  // Mouse events
  useEffect(() => {
    const handleMouseMove = (e) => handleDragMove(e)
    const handleMouseUp = () => handleDragEnd()

    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isOpen])

  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  useEffect(() => {
    if (view !== 'spin' || !isSpinning || !spinItems.length) return
    if (spinAnimationStartedRef.current) return

    spinAnimationStartedRef.current = true

    const startOffset = 50
    setSpinOffset(startOffset)

    const rafId = requestAnimationFrame(() => {
      const trackEl = spinTrackInnerRef.current
      const containerEl = spinTrackRef.current
      if (!trackEl || !containerEl) return

      const items = trackEl.querySelectorAll('.case-spin-item')
      const winnerEl =
        trackEl.querySelector('.case-spin-item--winning') ||
        items[Math.floor(items.length / 2)]
      if (!winnerEl) return

      const containerRect = containerEl.getBoundingClientRect()
      const winnerRect = winnerEl.getBoundingClientRect()

      const containerCenter = containerRect.left + containerRect.width / 2
      const winnerCenter = winnerRect.left + winnerRect.width / 2

      const delta = winnerCenter - containerCenter
      const finalOffset = startOffset - delta
      const overshootOffset = finalOffset - 15

      // Основная фаза движения
      setSpinPhase('main')
      setSpinOffset(overshootOffset)

      // Лёгкий откат к финальной позиции
      setTimeout(() => {
        setSpinPhase('settle')
        setSpinOffset(finalOffset)
      }, 4600)
    })

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [view, isSpinning, spinItems])

  // Открытие кейса
  const handleOpenCase = () => {
    if (isSpinning) return

    // Выбираем выигрышный предмет заранее
    const winningIndex = Math.floor(Math.random() * caseItems.length)
    const winning = caseItems[winningIndex]
    setWonItem(winning)
    const winningAmount =
      typeof winning.price === 'number'
        ? winning.price
        : parseFloat(winning.price || '0')
    setWonAmount(winningAmount)

    spinAnimationStartedRef.current = false
    setSpinPhase('idle')
    setSpinOffset(50)

    // Создаём длинную ленту предметов
    // Выигрышный предмет будет на позиции, которая окажется под маркером после анимации
    const totalItems = 30
    const winningPosition = 22 // Позиция под маркером после остановки
    
    const items = []
    for (let i = 0; i < totalItems; i++) {
      if (i === winningPosition) {
        // Вставляем выигрышный предмет
        items.push({ ...winning, uid: `win-${Math.random().toString(36).slice(2)}`, isWinning: true })
      } else {
        // Случайный предмет из списка
        const randomItem = caseItems[Math.floor(Math.random() * caseItems.length)]
        items.push({ ...randomItem, uid: `${randomItem.id}-${i}-${Math.random().toString(36).slice(2)}`, isWinning: false })
      }
    }

    setSpinItems(items)
    setView('spin')
    setIsSpinning(true)

    // Длительность спина и затем показать результат
    setTimeout(() => {
      setIsSpinning(false)
      setView('result')
    }, 5200)
  }

  const handleResultOk = () => {
    onClose()
  }

  const currencyIcon = selectedCurrency?.icon || '/image/Coin-Icon.svg'
  const caseName = caseData?.name || (isPaid ? 'БЕСПЛАТНО 2.0' : 'FREE 2.0')

  if (!isOpen) return null

  return (
    <div 
      className="case-modal-overlay" 
      ref={modalRef}
      onClick={handleOverlayClick}
    >
      <div 
        className={`case-modal-content ${view === 'result' ? 'case-modal-result' : ''}`}
        ref={contentRef}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Ручка для свайпа */}
        <div 
          className="case-modal-handle"
          onMouseDown={handleDragStart}
        >
          <div className="case-modal-handle-bar"></div>
        </div>

        {view === 'main' ? (
          <>
            {/* Заголовок кейса */}
            <h2 className="case-modal-title">{caseName}</h2>

            {/* Превью кейсов — бесконечная лента */}
            <div className="case-preview-row">
              <div className="case-preview-track">
                {[...Array(16)].map((_, i) => {
                  const previewItem = caseItems[i % caseItems.length]
                  return (
                    <div key={`preview-${i}`} className="case-preview-item">
                      {isPaid ? (
                        <span className="case-preview-price">
                          <img src={currencyIcon} alt="currency" className="case-preview-coin" />
                          {previewItem?.price || '0.1'}
                        </span>
                      ) : (
                        <span className="case-preview-badge">FREE</span>
                      )}
                      <div className="case-preview-gift">
                        {previewItem?.type === 'animation' && previewItem.animation ? (
                          <Player
                            autoplay
                            loop
                            src={previewItem.animation}
                            className="case-preview-animation"
                          />
                        ) : (
                          <img
                            src={previewItem?.image}
                            alt={previewItem?.name || 'Gift'}
                            className="case-preview-image"
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="case-preview-fade case-preview-fade--left" />
              <div className="case-preview-fade case-preview-fade--right" />
            </div>

            {isPaid ? (
              /* Платный кейс */
              <>
                <div className="case-section-title">ЧТО ВНУТРИ?</div>
                <div className="case-items-grid">
                  {caseItems.map((item) => (
                    <div key={item.id} className="case-item-card">
                      <div className="case-item-price">
                        <img src={currencyIcon} alt="currency" className="case-item-coin" />
                        <span>{item.price}</span>
                      </div>
                      <div className="case-item-image">
                        {item.type === 'animation' && item.animation ? (
                          <Player
                            autoplay
                            loop
                            src={item.animation}
                            className="case-item-animation"
                          />
                        ) : (
                          <img
                            src={item.image}
                            alt={item.name || 'Gift'}
                            className="case-item-img"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="case-open-button" onClick={handleOpenCase}>
                  Открыть
                </button>
              </>
            ) : (
              /* Бесплатный кейс */
              <>
                <div className="case-info-box">
                  <div className="case-info-icon">
                    <img src="/image/Vector.png" alt="warning" className="case-info-icon-image" />
                  </div>
                  <p className="case-info-text">
                    To open this case, you must deposit 3 TON within the last 24 hours
                  </p>
                </div>

                <button className="case-deposit-button" onClick={() => setIsDepositModalOpen(true)}>
                  Deposit funds
                </button>

                <div className="case-section-title">WHAT'S INSIDE?</div>
                <div className="case-items-grid">
                  {caseItems.map((item) => (
                    <div key={item.id} className="case-item-card">
                      <div className="case-item-price">
                        <img src={currencyIcon} alt="currency" className="case-item-coin" />
                        <span>{item.price}</span>
                      </div>
                      <div className="case-item-image">
                        {item.type === 'animation' && item.animation ? (
                          <Player
                            autoplay
                            loop
                            src={item.animation}
                            className="case-item-animation"
                          />
                        ) : (
                          <img
                            src={item.image}
                            alt={item.name || 'Gift'}
                            className="case-item-img"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="case-promo-button">
                  Activate promo code
                </button>
              </>
            )}
          </>
        ) : view === 'spin' ? (
          <div className="case-spin-view">
            <div className="case-spin-track" ref={spinTrackRef}>
              <div
                className="case-spin-track-inner"
                ref={spinTrackInnerRef}
                style={{
                  transform: `translateX(${spinOffset}px)`,
                  transition: isSpinning
                    ? `transform ${
                        spinPhase === 'main' ? 4.6 : spinPhase === 'settle' ? 0.4 : 0
                      }s cubic-bezier(0.18, 0.89, 0.32, 1)`
                    : 'none',
                }}
              >
                {spinItems.map((item, index) => (
                  <div 
                    key={item.uid}
                    className={`case-spin-item ${
                      index % 3 === 0
                        ? 'case-spin-item--back'
                        : index % 2 === 0
                        ? 'case-spin-item--mid'
                        : ''
                    } ${item.isWinning ? 'case-spin-item--winning' : ''}`}
                  >
                    <div className="case-spin-gift">
                      {item.type === 'animation' && item.animation ? (
                        <Player
                          autoplay
                          loop
                          src={item.animation}
                          className="case-spin-animation"
                        />
                      ) : (
                        <img
                          src={item.image}
                          alt={item.name || 'Gift'}
                          className="case-spin-image"
                        />
                      )}
                    </div>
                    <span className="case-spin-price">
                      <img src={selectedCurrency?.icon || '/image/Coin-Icon.svg'} alt="currency" />
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="case-spin-marker">
                <div className="case-spin-marker-line"></div>
                <div className="case-spin-marker-glow"></div>
              </div>
              <div className="case-spin-fog case-spin-fog--left"></div>
              <div className="case-spin-fog case-spin-fog--right"></div>
            </div>
            <div className="case-spin-caption">Ожидаем выпадение...</div>
          </div>
        ) : (
          /* Экран результата */
          <div className="case-result-view">
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i} 
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 7)]
                  }}
                />
              ))}
            </div>
            
            <h2 className="case-result-title">Congratulations!</h2>
            
            <div className="case-result-prize">
              {wonItem ? (
                wonItem.type === 'animation' && wonItem.animation ? (
                  <Player
                    autoplay
                    loop
                    src={wonItem.animation}
                    style={{ width: 80, height: 80 }}
                  />
                ) : (
                  <img
                    src={wonItem.image}
                    alt={wonItem.name || 'Gift'}
                    style={{ width: 80, height: 80, objectFit: 'contain' }}
                  />
                )
              ) : (
                <img
                  src="/image/case_card1.png"
                  alt="Gift"
                  style={{ width: 80, height: 80, objectFit: 'contain' }}
                />
              )}
            </div>
            
            <div className="case-result-amount">
              <span className="case-result-plus">+{wonAmount.toFixed(2)}</span>
              <img src={currencyIcon} alt="currency" className="case-result-currency" />
            </div>

            <button className="case-ok-button" onClick={handleResultOk}>
              Ok
            </button>
          </div>
        )}
      </div>

      <DepositModal 
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  )
}

export default CaseModal
