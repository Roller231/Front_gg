import './TaskList.css'
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'
import { activatePromo } from '../api/promo'
import { getUserById } from '../api/users'


function TaskList() {
  const { t } = useLanguage()
  const { user, setUser } = useUser()

  const [selectedOption, setSelectedOption] = useState(1)
  const [promoCode, setPromoCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelect = (option) => {
    setSelectedOption(option)
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    if (!user) {
      alert('User not authorized')
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
  
      // 4️⃣ UI feedback
      if (res.type === 'referral') {
        alert(`Referral bonus: +${res.reward}`)
      } else {
        alert('Promo activated successfully')
      }
  
      setPromoCode('')
    } catch (e) {
      alert(e.message || 'Promo error')
    } finally {
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
    </div>
  )
}

export default TaskList
