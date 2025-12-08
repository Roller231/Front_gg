import './ProfilePage.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from './Navigation'
import BetModal from './BetModal'

const userData = {
  name: 'Иван Иванов',
  oderId: 'User ID 1234556',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  rating: 1234,
  country: '🇷🇺'
}

const inventoryItems = [
  { id: 1, icon: '🎁', empty: true },
  { id: 2, icon: '🎁', empty: true },
  { id: 3, icon: '🎁', empty: true },
  { id: 4, icon: '🎁', empty: true },
]

const operationsHistory = [
  { id: 1, date: '12.12.2025', name: 'Название события', amount: '+12 000' },
  { id: 2, date: '12.12.2025', name: 'Название события', amount: '+12 000' },
]

function ProfilePage() {
  const navigate = useNavigate()
  const [activeTopup, setActiveTopup] = useState('gifts')
  const [isBetModalOpen, setIsBetModalOpen] = useState(false)

  return (
    <div className="profile-page">
      {/* User Card */}
      <div className="profile-user-card">
        <div className="profile-avatar-container">
          <img src={userData.avatar} alt="avatar" className="profile-avatar" />
        </div>
        <div className="profile-user-info">
          <h2 className="profile-username">{userData.name}</h2>
          <p className="profile-user-id">{userData.oderId}</p>
        </div>
        <div className="profile-user-right">
          <div className="info-badge rating-badge">
            <span className="rating-icon">👑</span>
            <span className="rating-value">{userData.rating}</span>
          </div>
          <div className="info-badge country-badge">
            <span className="profile-country">
              <img src="/image/twemoji_flag-russia.png" alt="Russia" className="profile-country-flag" />
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="profile-action-buttons">
        <button
          className={`action-btn action-btn-primary ${activeTopup === 'gifts' ? 'active' : ''}`}
          onClick={() => setActiveTopup('gifts')}
        >
          Пополнить подарками
        </button>
        <button
          className={`action-btn action-btn-secondary ${activeTopup === 'money' ? 'active' : ''}`}
          onClick={() => setActiveTopup('money')}
        >
          Пополнить Деньгами
        </button>
      </div>

      {/* Bonus Banner */}
      <img 
        src="/image/19.png" 
        alt="Bonus Banner" 
        className="bonus-banner-img" 
      />

      {/* Partner Program */}
      <img 
        src="/image/18.png" 
        alt="Partner Program" 
        className="partner-program-img" 
        onClick={() => navigate('/partner')}
      />

      {/* Inventory */}
      <div className="inventory-section">
        <div className="inventory-header">
          <span className="inventory-title">Инвентарь (0)</span>
          <button className="sell-all-btn">Продать Все</button>
        </div>
        <div className="inventory-items">
          {inventoryItems.map((item) => (
            <div key={item.id} className="inventory-item">
              <span className="inventory-item-icon">{item.icon}</span>
            </div>
          ))}
          <button className="inventory-arrow">
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Withdraw Button */}
      <button className="withdraw-btn" onClick={() => setIsBetModalOpen(true)}>
        Вывести деньги
      </button>

      {/* Operations History */}
      <div className="operations-section">
        <h3 className="operations-title">История Операций</h3>
        <div className="operations-list">
          {operationsHistory.map((op) => (
            <div key={op.id} className="operation-item">
              <span className="operation-date">{op.date}</span>
              <span className="operation-name">{op.name}</span>
              <span className="operation-amount">
                {op.amount}
                <span className="diamond-icon">💎</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <BetModal
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        mode="withdraw"
      />

      <Navigation />
    </div>
  )
}

export default ProfilePage
