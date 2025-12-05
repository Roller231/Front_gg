import { useState, useRef, useEffect } from 'react'
import './BetModal.css'
import { useCurrency } from '../context/CurrencyContext'

// Примеры подарков (с эмодзи как заглушки)
const gifts = [
  { id: 1, name: 'Сумка', emoji: '👜', price: 0.5 },
  { id: 2, name: 'Pepe', emoji: '🐸', price: 0.5 },
  { id: 3, name: 'Кристаллы', emoji: '💎', price: 0.5 },
  { id: 4, name: 'Шлем', emoji: '⚔️', price: 0.5 },
]

function BetModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('coins') // 'gifts' | 'coins'
  const [betAmount, setBetAmount] = useState('100')
  const [selectedGift, setSelectedGift] = useState(null)
  const { selectedCurrency } = useCurrency()
  
  // Для свайпа
  const modalRef = useRef(null)
  const contentRef = useRef(null)
  const dragStartY = useRef(0)
  const currentTranslateY = useRef(0)
  const isDragging = useRef(false)

  // Сброс позиции при открытии
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.transform = 'translateY(0)'
      currentTranslateY.current = 0
    }
  }, [isOpen])

  // Начало свайпа/drag
  const handleDragStart = (e) => {
    isDragging.current = true
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    dragStartY.current = clientY - currentTranslateY.current
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'none'
    }
  }

  // Движение свайпа/drag
  const handleDragMove = (e) => {
    if (!isDragging.current) return
    
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
    let newTranslateY = clientY - dragStartY.current
    
    // Ограничиваем движение только вниз
    if (newTranslateY < 0) newTranslateY = 0
    
    currentTranslateY.current = newTranslateY
    
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(${newTranslateY}px)`
    }
  }

  // Конец свайпа/drag
  const handleDragEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.3s ease-out'
      
      // Если свайпнули больше чем на 100px - закрываем
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

  // Обработчики для mouse events на document
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

  // Клик по оверлею закрывает модал
  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  const handleMaxClick = () => {
    if (!selectedCurrency?.amount) return
    const numeric = selectedCurrency.amount.replace(/[^0-9.]/g, '')
    setBetAmount(numeric || '0')
  }

  const currencyIcon = selectedCurrency?.icon || '/image/Coin Icon.svg'
  const currencyAmountLabel = selectedCurrency?.amount || '0'

  if (!isOpen) return null

  return (
    <div 
      className="bet-modal-overlay" 
      ref={modalRef}
      onClick={handleOverlayClick}
    >
      <div 
        className="bet-modal-content"
        ref={contentRef}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Ручка для свайпа */}
        <div 
          className="bet-modal-handle"
          onMouseDown={handleDragStart}
        >
          <div className="bet-modal-handle-bar"></div>
        </div>

        {/* Заголовок */}
        <h2 className="bet-modal-title">Сделать Ставку</h2>

        {/* Табы */}
        <div className="bet-modal-tabs">
          <button 
            className={`bet-modal-tab ${activeTab === 'gifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('gifts')}
          >
            Подарки
          </button>
          <button 
            className={`bet-modal-tab ${activeTab === 'coins' ? 'active' : ''}`}
            onClick={() => setActiveTab('coins')}
          >
            Монеты
          </button>
        </div>

        {/* Контент табов */}
        {activeTab === 'coins' && (
          <div className="bet-modal-coins-content">
            <div className="bet-amount-header">
              <span className="bet-amount-label">Сумма ставки</span>
              <span className="bet-balance">Баланс: {currencyAmountLabel}</span>
            </div>
            
            <div className="bet-amount-input-wrapper">
              <input
                type="text"
                className="bet-amount-input"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0"
              />
              <div className="bet-amount-actions">
                <img src={currencyIcon} alt="currency" className="bet-coin-icon" />
                <button className="bet-max-button" onClick={handleMaxClick}>
                  MAX
                </button>
              </div>
            </div>

            <button className="bet-submit-button">
              <span className="bet-submit-plus">+</span>
              Пополнить баланс
            </button>
          </div>
        )}

        {activeTab === 'gifts' && (
          <div className="bet-modal-gifts-content">
            <div className="gifts-grid">
              {gifts.map((gift) => (
                <div 
                  key={gift.id} 
                  className={`gift-card ${selectedGift === gift.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGift(gift.id)}
                >
                  <div className="gift-price">
                    <img src={currencyIcon} alt="currency" className="gift-coin-icon" />
                    <span className="gift-price-value">{gift.price}</span>
                  </div>
                  {selectedGift === gift.id && (
                    <div className="gift-check">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="#00C853"/>
                        <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <div className="gift-image">
                    <span className="gift-emoji">{gift.emoji}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="bet-submit-button gifts-submit">
              Выбрать
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BetModal
