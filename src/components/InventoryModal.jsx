import { useRef, useEffect } from 'react'
import './InventoryModal.css'
import { useCurrency } from '../context/CurrencyContext'

function InventoryModal({ isOpen, onClose, inventory = [] }) {
  const { selectedCurrency } = useCurrency()
  
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

  const getItemPriceLabel = (item) => {
    const raw = item?.price ?? item?.cost ?? item?.value ?? item?.amount
    const num = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isFinite(num)) return num.toFixed(2)
    return '0.00'
  }

  const getItemPriceValue = (item) => {
    const raw = item?.price ?? item?.cost ?? item?.value ?? item?.amount
    const num = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isFinite(num)) return num
    return 0
  }

  const getItemImageSrc = (item) =>
    item?.icon || item?.image || item?.url || item?.url_image || '/image/mdi_gift (2).svg'

  const totalPrice = Array.isArray(inventory)
    ? inventory.reduce((sum, item) => sum + getItemPriceValue(item), 0)
    : 0

  if (!isOpen) return null

  return (
    <div 
      className="inventory-modal-overlay" 
      ref={modalRef}
      onClick={handleOverlayClick}
    >
      <div 
        className="inventory-modal-content"
        ref={contentRef}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Ручка для свайпа */}
        <div 
          className="inventory-modal-handle"
          onMouseDown={handleDragStart}
        >
          <div className="inventory-modal-handle-bar"></div>
        </div>

        {/* Заголовок */}
        <h2 className="inventory-modal-title">
          Инвентарь ({inventory.length})
        </h2>

        {/* Сетка подарков */}
        <div className="inventory-modal-grid">
          {inventory.length > 0 ? (
            inventory.map((item, index) => (
              <div key={item?.id || index} className="inventory-modal-item">
                <div className="inventory-modal-item-price">
                  <img 
                    src={selectedCurrency?.icon || '/image/Coin-Icon.svg'} 
                    alt="currency" 
                    className="inventory-modal-coin-icon" 
                  />
                  <span>{getItemPriceLabel(item)}</span>
                </div>
                <img
                  src={getItemImageSrc(item)}
                  alt={item?.name || 'gift'}
                  className="inventory-modal-item-icon"
                />
              </div>
            ))
          ) : (
            <div className="inventory-modal-empty">
              <span>Инвентарь пуст</span>
            </div>
          )}
        </div>

        {inventory.length > 0 && (
          <div className="inventory-modal-summary">
            <span className="inventory-modal-summary-label">Итого</span>
            <span className="inventory-modal-summary-value">
              {totalPrice.toFixed(2)}
              <img
                src={selectedCurrency?.icon || '/image/Coin-Icon.svg'}
                alt={selectedCurrency?.id || 'currency'}
                className="inventory-modal-summary-coin"
              />
            </span>
          </div>
        )}

        {/* Кнопка продать все */}
        {inventory.length > 0 && (
          <button className="inventory-modal-sell-btn">
            Продать Все
          </button>
        )}
      </div>
    </div>
  )
}

export default InventoryModal
