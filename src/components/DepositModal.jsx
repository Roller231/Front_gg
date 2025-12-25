import { useState, useRef, useEffect } from 'react'
import './DepositModal.css'
import { useLanguage } from '../context/LanguageContext'

function DepositModal({ isOpen, onClose }) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('stars')
  const [amount, setAmount] = useState('')
  
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
      setActiveTab('stars')
      setAmount('')
    }
  }, [isOpen])

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return
    console.log('Deposit:', { amount, method: activeTab })
    onClose()
  }

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

  if (!isOpen) return null

  return (
    <div 
      className="deposit-modal-overlay" 
      ref={modalRef}
      onClick={handleOverlayClick}
    >
      <div 
        className="deposit-modal-content"
        ref={contentRef}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Ручка для свайпа */}
        <div 
          className="deposit-modal-handle"
          onMouseDown={handleDragStart}
        >
          <div className="deposit-modal-handle-bar"></div>
        </div>

        {/* Заголовок */}
        <h2 className="deposit-modal-title">{t('deposit.title')}</h2>

        {/* Табы */}
        <div className="deposit-modal-tabs">
          <button 
            className={`deposit-modal-tab ${activeTab === 'stars' ? 'active' : ''}`}
            onClick={() => setActiveTab('stars')}
          >
            {t('deposit.stars')}
          </button>
          <button 
            className={`deposit-modal-tab ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            {t('deposit.wallet')}
          </button>
          <button 
            className={`deposit-modal-tab ${activeTab === 'crypto' ? 'active' : ''}`}
            onClick={() => setActiveTab('crypto')}
          >
            {t('deposit.cryptoBot')}
          </button>
        </div>

        {/* Поле суммы */}
        <div className="deposit-amount-section">
          <input
            type="text"
            inputMode="decimal"
            className="deposit-amount-input"
            placeholder={t('deposit.amountPlaceholder')}
            value={amount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '')
              setAmount(value)
            }}
          />
        </div>

        {/* Кнопка пополнения */}
        <button 
          className="deposit-submit-button"
          onClick={handleDeposit}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          {t('deposit.depositButton')}
        </button>
      </div>
    </div>
  )
}

export default DepositModal
