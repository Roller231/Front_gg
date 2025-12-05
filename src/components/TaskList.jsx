import './TaskList.css'
import { useState } from 'react'

function TaskList() {
  const [selectedOption, setSelectedOption] = useState(1)
  const [promoCode, setPromoCode] = useState('')

  const handleSelect = (option) => {
    setSelectedOption(option)
  }

  const handleApplyPromo = () => {
    // сюда потом можно добавить реальную обработку промокода
    console.log('Apply promo:', promoCode)
  }

  return (
    <div className="task-list">
      <div className="task-item" onClick={() => handleSelect(1)}>
        <div className="task-left">
          <span className={`task-check ${selectedOption === 1 ? 'completed' : ''}`}>
            {selectedOption === 1 && '✓'}
          </span>
          <span className="task-text">Сыграть 10 раз</span>
        </div>
        <button className={`take-btn ${selectedOption === 1 ? 'active' : 'inactive'}`}>
          Take
        </button>
      </div>
      
      <div className="task-item" onClick={() => handleSelect(2)}>
        <div className="task-left">
          <span className={`task-check ${selectedOption === 2 ? 'completed' : ''}`}>
            {selectedOption === 2 && '✓'}
          </span>
          <span className="task-text">Сыграть 10 раз</span>
        </div>
        <button className={`take-btn ${selectedOption === 2 ? 'active' : 'inactive'}`}>
          Take
        </button>
      </div>
      
      <div className="promo-row">
        <div className="promo-input">
          <input
            type="text"
            placeholder="PROMOCODE"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
        </div>
        <button className="apply-btn" onClick={handleApplyPromo}>
          Apply
        </button>
      </div>
    </div>
  )
}

export default TaskList
