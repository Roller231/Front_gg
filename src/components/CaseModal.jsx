import { useState, useRef, useEffect } from 'react'
import './CaseModal.css'
import { useCurrency } from '../context/CurrencyContext'
import DepositModal from './DepositModal'

// Предметы внутри кейса (моковые данные)
const caseItems = [
  { id: 1, price: 0.1, image: '/image/case_card1.png' },
  { id: 2, price: 0.1, image: '/image/case_card2.png' },
  { id: 3, price: 0.1, image: '/image/case_card3.png' },
  { id: 4, price: 0.1, image: '/image/case_card4.png' },
  { id: 5, price: 0.1, image: '/image/case_card1.png' },
  { id: 6, price: 0.1, image: '/image/case_card2.png' },
  { id: 7, price: 0.1, image: '/image/case_card3.png' },
  { id: 8, price: 0.1, image: '/image/case_card4.png' },
  { id: 9, price: 0.1, image: '/image/case_card1.png' },
]

function CaseModal({ isOpen, onClose, caseData, isPaid = true }) {
  const [view, setView] = useState('main') // 'main' | 'spin' | 'result'
  const [wonAmount, setWonAmount] = useState(0)
  const [spinItems, setSpinItems] = useState([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const { selectedCurrency } = useCurrency()
  
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

  // Открытие кейса
  const handleOpenCase = () => {
    if (isSpinning) return

    // Подготовим длинную ленту предметов с параллаксом
    const baseItems = [...caseItems, ...caseItems, ...caseItems]
    const shuffled = baseItems
      .map((item, idx) => ({ ...item, uid: `${item.id}-${idx}-${Math.random().toString(36).slice(2)}` }))
      .sort(() => Math.random() - 0.5)

    setSpinItems(shuffled)
    setView('spin')
    setIsSpinning(true)

    // Имитация выигрыша и остановки
    const randomWin = (Math.random() * 0.5).toFixed(2)
    setWonAmount(parseFloat(randomWin))

    // Длительность спина и затем показать результат
    setTimeout(() => {
      setIsSpinning(false)
      setView('result')
    }, 4800)
  }

  const handleResultOk = () => {
    onClose()
  }

  const currencyIcon = selectedCurrency?.icon || '/image/Coin Icon.svg'
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
                {[...Array(16)].map((_, i) => (
                  <div key={`preview-${i}`} className="case-preview-item">
                    {isPaid ? (
                      <span className="case-preview-price">
                        <img src={currencyIcon} alt="currency" className="case-preview-coin" />
                        {caseItems[i % caseItems.length]?.price || '0.1'}
                      </span>
                    ) : (
                      <span className="case-preview-badge">FREE</span>
                    )}
                    <div className="case-preview-gift">🎁</div>
                  </div>
                ))}
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
                        <div className="case-item-gift">🎁</div>
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
                  <div className="case-info-icon">ℹ️</div>
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
                        <div className="case-item-gift">🎁</div>
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
            <div className="case-spin-track">
              <div className="case-spin-track-inner">
                {spinItems.map((item, index) => (
                  <div 
                    key={item.uid}
                    className={`case-spin-item ${index % 3 === 0 ? 'case-spin-item--back' : index % 2 === 0 ? 'case-spin-item--mid' : ''}`}
                  >
                    <span className="case-spin-gift">🎁</span>
                    <span className="case-spin-price">
                      <img src={selectedCurrency?.icon || '/image/Coin Icon.svg'} alt="currency" />
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
              <div className="case-result-gift">🎁</div>
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
