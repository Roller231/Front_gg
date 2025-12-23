import { useState, useRef, useEffect } from 'react'
import './DepositModal.css'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'

function DepositModal({ isOpen, onClose }) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('gifts')
  const [selectedCurrency, setSelectedCurrency] = useState(null)
  const [amount, setAmount] = useState('')
  
  // Для свайпа
  const modalRef = useRef(null)
  const contentRef = useRef(null)
  const dragStartY = useRef(0)
  const currentTranslateY = useRef(0)
  const isDragging = useRef(false)

  const API_URL = import.meta.env.VITE_API_URL

  const { user, loading } = useUser()
  
  // Сброс позиции при открытии
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.transform = 'translateY(0)'
      currentTranslateY.current = 0
      setActiveTab('gifts')
      setSelectedCurrency(null)
      setAmount('')
    }
  }, [isOpen])
if (loading || !user) {
  return null // или disabled кнопки
}


  const handleStarsPay = async () => {
    if (!amount || Number(amount) <= 0) return
  
    try {
      const res = await fetch(`${API_URL}/api/stars/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          user_id: user.id
        })
      })
  
      if (!res.ok) {
        throw new Error('Create invoice failed')
      }
  
      const data = await res.json()
  
      window.Telegram.WebApp.openInvoice(data.invoice_link)
  
    } catch (e) {
      console.error('Stars pay error', e)
    }
  }
  
  useEffect(() => {
    const handler = (event) => {
      if (event.status === 'paid') {
        fetch(`${API_URL}/api/stars/success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoice_id: event.slug,   // ✅ ВОТ ОН
            payload: event.payload
          })
        })
        console.log('invoiceClosed event:', event)
        onClose()
      }
    }
  
    window.Telegram.WebApp.onEvent('invoiceClosed', handler)
    return () => window.Telegram.WebApp.offEvent('invoiceClosed', handler)
  }, [onClose])
  
  
  
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
            className={`deposit-modal-tab ${activeTab === 'gifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('gifts')}
          >
            {t('deposit.gifts')}
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

        {/* Контент табов */}
        <div className="deposit-modal-tabs-content">
          {/* Вкладка Подарки */}
          <div className={`deposit-tab-panel ${activeTab === 'gifts' ? 'active' : ''}`}>
          <div className="deposit-stars-content">
  <div className="deposit-amount-wrapper">
    <input
      type="text"
      inputMode="numeric"
      className="deposit-amount-input"
      placeholder={t('deposit.amount')}
      value={amount}
      onChange={(e) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        setAmount(value)
      }}
    />
  </div>

  <button
    className="deposit-wallet-button"
    onClick={handleStarsPay}
    disabled={!amount}
  >
    {t('deposit.payStars')}
  </button>
</div>

          </div>

          {/* Вкладка Кошелёк */}
          <div className={`deposit-tab-panel ${activeTab === 'wallet' ? 'active' : ''}`}>
            <div className="deposit-wallet-content">
              <div className="deposit-wallet-message">
                {t('deposit.walletNotConnected')}
              </div>
              <button className="deposit-wallet-button">
                {t('deposit.connectWallet')}
              </button>
            </div>
          </div>

          {/* Вкладка Crypto Bot */}
          <div className={`deposit-tab-panel ${activeTab === 'crypto' ? 'active' : ''}`}>
            <div className="deposit-crypto-content">
              <div className="deposit-amount-wrapper">
                <input
                  type="text"
                  inputMode="decimal"
                  className="deposit-amount-input"
                  placeholder={t('deposit.amount')}
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '')
                    setAmount(value)
                  }}
                />
              </div>
              <div className="deposit-currency-grid">
                <button 
                  className={`deposit-currency-button ${selectedCurrency === 'TON' ? 'active' : ''}`}
                  onClick={() => setSelectedCurrency('TON')}
                >
                  TON
                </button>
                <button 
                  className={`deposit-currency-button ${selectedCurrency === 'USDT' ? 'active' : ''}`}
                  onClick={() => setSelectedCurrency('USDT')}
                >
                  USDT
                </button>
                <button 
                  className={`deposit-currency-button ${selectedCurrency === 'TRX' ? 'active' : ''}`}
                  onClick={() => setSelectedCurrency('TRX')}
                >
                  TRX
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepositModal
