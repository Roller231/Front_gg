import { useState, useRef, useEffect } from 'react'
import './WithdrawModal.css'
import { useCurrency } from '../context/CurrencyContext'
import { useLanguage } from '../context/LanguageContext'

function WithdrawModal({ isOpen, onClose }) {
  const { t } = useLanguage()
  const { selectedCurrency, currencyOptions } = useCurrency()
  
  const [activeTab, setActiveTab] = useState('stars')
  const [amount, setAmount] = useState('')

  const modalRef = useRef(null)
  const contentRef = useRef(null)
  const dragStartY = useRef(0)
  const currentTranslateY = useRef(0)
  const isDragging = useRef(false)

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.transform = 'translateY(0)'
      currentTranslateY.current = 0
      setActiveTab('stars')
      setAmount('')
    }
  }, [isOpen])

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) return
    console.log('Withdraw:', { amount, method: activeTab })
    onClose()
  }

  const handleDragStart = (e) => {
    isDragging.current = true
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    dragStartY.current = clientY - currentTranslateY.current

    if (contentRef.current) {
      contentRef.current.style.transition = 'none'
    }
  }

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

  if (!isOpen) return null

  return (
    <div
      className="withdraw-modal-overlay"
      ref={modalRef}
      onClick={handleOverlayClick}
    >
      <div
        className="withdraw-modal-content"
        ref={contentRef}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          className="withdraw-modal-handle"
          onMouseDown={handleDragStart}
        >
          <div className="withdraw-modal-handle-bar"></div>
        </div>

        <h2 className="withdraw-modal-title">{t('withdraw.title')}</h2>

        <div className="withdraw-modal-tabs">
          <button
            className={`withdraw-modal-tab ${activeTab === 'stars' ? 'active' : ''}`}
            onClick={() => setActiveTab('stars')}
          >
            {t('withdraw.stars')}
          </button>
          <button
            className={`withdraw-modal-tab ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            {t('withdraw.wallet')}
          </button>
          <button
            className={`withdraw-modal-tab ${activeTab === 'crypto' ? 'active' : ''}`}
            onClick={() => setActiveTab('crypto')}
          >
            {t('withdraw.cryptoBot')}
          </button>
        </div>

        {/* Поле суммы */}
        <div className="withdraw-amount-section">
          <input
            type="text"
            inputMode="decimal"
            className="withdraw-amount-input"
            placeholder={t('withdraw.amount')}
            value={amount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '')
              setAmount(value)
            }}
          />
        </div>

        {/* Кнопка вывода */}
        <button 
          className="withdraw-submit-button"
          onClick={handleWithdraw}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          {t('withdraw.withdrawButton')}
        </button>
      </div>
    </div>
  )
}

export default WithdrawModal
