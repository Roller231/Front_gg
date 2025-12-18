import { useState, useRef, useEffect, useMemo } from 'react'
import './BetModal.css'
import { useCurrency } from '../context/CurrencyContext'
import { useLanguage } from '../context/LanguageContext'
import { useCrashSocket } from '../hooks/useCrashSocket'
import { useUser } from '../context/UserContext'
import { getUserById } from '../api/users'
import { getDropById } from '../api/cases'// Примеры подарков (с эмодзи как заглушки)

function BetModal({ isOpen, onClose, mode = 'bet', onSubmit }) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('coins') // 'gifts' | 'coins'
  const [betAmount, setBetAmount] = useState('100')
  const [selectedGift, setSelectedGift] = useState(null)
  const { selectedCurrency } = useCurrency()
  const { user, setUser } = useUser()
  const { send, connected } = useCrashSocket(() => {})

  
  // Для свайпа
  const modalRef = useRef(null)
  const contentRef = useRef(null)
  const dragStartY = useRef(0)
  const currentTranslateY = useRef(0)
  const isDragging = useRef(false)
  const [drops, setDrops] = useState([])
  const [loadingDrops, setLoadingDrops] = useState(false)
  const [dropsMap, setDropsMap] = useState({})
  // Сброс позиции при открытииconst [dropsMap, setDropsMap] = useState({})
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.transform = 'translateY(0)'
      currentTranslateY.current = 0
    }
  }, [isOpen])
  useEffect(() => {
    if (!isOpen || !user?.inventory?.length) return
  
    let cancelled = false
  
    const loadDrops = async () => {
      const result = {}
  
      for (const inv of user.inventory) {
        try {
          const drop = await getDropById(inv.drop_id)
          result[inv.drop_id] = drop
        } catch (e) {
          console.error('Failed to load drop', inv.drop_id, e)
        }
      }
  
      if (!cancelled) {
        setDropsMap(result)
      }
    }
  
    loadDrops()
  
    return () => {
      cancelled = true
    }
  }, [isOpen, user])
  
  
  // Начало свайпа/drag
  const handleDragStart = (e) => {
    isDragging.current = true
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    dragStartY.current = clientY - currentTranslateY.current
    
    if (contentRef.current) {
      contentRef.current.style.transition = 'none'
    }
  }
  const refreshUser = async () => {
    if (!user?.id) return
  
    try {
      const freshUser = await getUserById(user.id)
      setUser(freshUser) // 🔥 обновляет ВЕСЬ APP
    } catch (e) {
      console.error('Failed to refresh user', e)
    }
  }
  
  const inventoryGifts = useMemo(() => {
    if (!user?.inventory?.length) return []
  
    return user.inventory
      .map(inv => {
        const drop = dropsMap[inv.drop_id]
        if (!drop || inv.count <= 0) return null
  
        return {
          ...drop,
          count: inv.count,
        }
      })
      .filter(Boolean)
  }, [user, dropsMap])
  
  
  
  
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

  const currencyIcon = selectedCurrency?.icon || '/image/Coin-Icon.svg'
  const currencyAmountLabel = selectedCurrency?.amount || '0'

  const isWithdrawMode = mode === 'withdraw'
  const titleText = isWithdrawMode ? t('betModal.withdraw') : t('betModal.placeBet')
  const primaryButtonText = isWithdrawMode ? t('betModal.withdraw') : t('betModal.placeBet')

  const handleCoinsSubmit = async () => {
    if (!connected) return
    if (!user?.id) return
    if (!selectedCurrency?.rate) return
  
    const uiAmount = Number(betAmount)
    if (!uiAmount || uiAmount <= 0) return
  
    // 🔥 КОНВЕРТАЦИЯ В TON
    const amountInTon = uiAmount * selectedCurrency.rate
  
    send({
      event: 'bet',
      user_id: user.id,
      amount: amountInTon, // ✅ ТЕПЕРЬ TON
      gift: false,
      gift_id: null,
      auto_cashout_x: null,
    })
  
    await refreshUser()
    onClose()
  }
  
  
  

  const handleGiftsSubmit = async () => {
    if (!connected || !user?.id || !selectedGift) return
  
    send({
      event: 'bet',
      user_id: user.id,
      amount: 0,
      gift: true,
      gift_id: selectedGift,
      auto_cashout_x: null,
    })
  
    await refreshUser()
    onClose()
  }
  
  

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
        <h2 className="bet-modal-title">{titleText}</h2>

        {/* Табы */}
        <div className="bet-modal-tabs">
          <button 
            className={`bet-modal-tab ${activeTab === 'gifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('gifts')}
          >
            {t('betModal.gifts')}
          </button>
          <button 
            className={`bet-modal-tab ${activeTab === 'coins' ? 'active' : ''}`}
            onClick={() => setActiveTab('coins')}
          >
            {t('betModal.coins')}
          </button>
        </div>

        {/* Контент табов */}
        <div className="bet-modal-tabs-content">
          <div className={`bet-tab-panel ${activeTab === 'coins' ? 'active' : ''}`}>
            <div className="bet-modal-coins-content">
              <div className="bet-amount-header">
                <span className="bet-amount-label">{t('betModal.betAmount')}</span>
                <span className="bet-balance">{t('betModal.balance')}: {currencyAmountLabel}</span>
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

              <button className="bet-submit-button" onClick={handleCoinsSubmit}>
                {primaryButtonText}
              </button>
            </div>
          </div>

          <div className={`bet-tab-panel ${activeTab === 'gifts' ? 'active' : ''}`}>
            <div className="bet-modal-gifts-content">
            <div className="gifts-grid">
  {inventoryGifts.map(gift => (
    <div
      key={gift.id}
      className={`gift-card ${selectedGift === gift.id ? 'selected' : ''}`}
      onClick={() => setSelectedGift(gift.id)}
    >
      <div className="gift-count">×{gift.count}</div>

      <div className="gift-image">
        <img src={gift.icon} alt={gift.name} />
      </div>

      <div className="gift-name">{gift.name}</div>

      {selectedGift === gift.id && (
        <div className="gift-check">✔</div>
      )}
    </div>
  ))}
</div>



              <button className="bet-submit-button gifts-submit" onClick={handleGiftsSubmit}>
                {t('betModal.select')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BetModal
