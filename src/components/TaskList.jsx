import './TaskList.css'
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'
import { activatePromo } from '../api/promo'
import { getUserById } from '../api/users'
import { useFreeSpin } from '../context/FreeSpinContext'


function TaskList() {
  const { t } = useLanguage()
  const { user, setUser } = useUser()

  const [selectedOption, setSelectedOption] = useState(1)
  const [promoCode, setPromoCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshFreeSpin } = useFreeSpin()
    const handleSelect = (option) => {
    setSelectedOption(option)
  }
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
  })

  const showNotification = (message) => {
    setNotification({ visible: true, message })
  
    setTimeout(() => {
      setNotification({ visible: false, message: '' })
    }, 3000)
  }
  
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    if (!user) {
      showNotification(t('errors.notAuthorized'))

      return
    }
  
    try {
      setLoading(true)
  
      // 1️⃣ активируем промокод
      const res = await activatePromo(user.id, promoCode.trim())
  
      // 2️⃣ получаем обновлённого юзера
      const freshUser = await getUserById(user.id)
  
      // 3️⃣ обновляем UserContext
      setUser(freshUser)
      await refreshFreeSpin(user.id)
      // 4️⃣ UI feedback
      if (res.type === 'referral') {
        showNotification(
          t('promo.referralBonus', { amount: res.reward })
        )
      } else {
        showNotification(t('promo.activated'))
      }
      
  
      setPromoCode('')
    } catch (e) {
      showNotification(t('promo.error'))
    }
     finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="task-list">
      <div className="task-item" onClick={() => handleSelect(1)}>
        <div className="task-left">
          <span className={`task-check ${selectedOption === 1 ? 'completed' : ''}`}>
            {selectedOption === 1 && '✓'}
          </span>
          <span className="task-text">{t('tasks.play10Times')}</span>
        </div>
        <button className={`take-btn ${selectedOption === 1 ? 'active' : 'inactive'}`}>
          {t('tasks.take')}
        </button>
      </div>

      <div className="task-item" onClick={() => handleSelect(2)}>
        <div className="task-left">
          <span className={`task-check ${selectedOption === 2 ? 'completed' : ''}`}>
            {selectedOption === 2 && '✓'}
          </span>
          <span className="task-text">{t('tasks.play10Times')}</span>
        </div>
        <button className={`take-btn ${selectedOption === 2 ? 'active' : 'inactive'}`}>
          {t('tasks.take')}
        </button>
      </div>

      {/* PROMO */}
      <div className="promo-row">
        <div className="promo-input">
          <input
            type="text"
            placeholder={t('tasks.promoPlaceholder')}
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          className="apply-btn"
          onClick={handleApplyPromo}
          disabled={loading || !promoCode.trim()}
        >
          {loading ? '...' : t('tasks.apply')}
        </button>
      </div>
      {notification.visible && (
  <div className="notification">
    {notification.message}
  </div>
)}

    </div>
  )
}

export default TaskList
