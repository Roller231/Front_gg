import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import './PartnerPage.css'

// Моковые данные для приглашенных друзей
const mockFriends = [
  { id: 1, name: 'UserName', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', earnings: 9000 },
  { id: 2, name: 'UserName', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', earnings: 8000 },
  { id: 3, name: 'UserName', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', earnings: 7000 },
  { id: 4, name: 'UserName', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4', earnings: 6000 },
  { id: 5, name: 'UserName', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5', earnings: 12000 },
]

function PartnerPage() {
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [isCreatingPromo, setIsCreatingPromo] = useState(false)
  const [friends] = useState(mockFriends)
  const [copied, setCopied] = useState(false)

  const inviteLink = 'https://t.me/ggcat_bot?start=ref123456'

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleInvite = () => {
    // Открыть Telegram для отправки приглашения
    const shareText = 'Присоединяйся к GGCat и зарабатывай TON!'
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
    window.open(shareUrl, '_blank')
  }

  const handleCreatePromo = () => {
    if (!isCreatingPromo) {
      setIsCreatingPromo(true)
    } else if (promoCode.trim()) {
      // TODO: отправить промокод на сервер
      console.log('Creating promo code:', promoCode)
      setIsCreatingPromo(false)
      setPromoCode('')
    }
  }

  const handleCancelPromo = () => {
    setIsCreatingPromo(false)
    setPromoCode('')
  }

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  return (
    <div className="partner-page">
      <Header />
      
      <main className="partner-content">
        <h1 className="partner-title">Партнерская программа</h1>

        {/* Invite Section */}
        <div className="invite-section">
          <button className="invite-btn" onClick={handleInvite}>
            Пригласить
          </button>
          <button 
            className={`copy-btn ${copied ? 'copied' : ''}`} 
            onClick={handleCopyLink}
            title="Скопировать ссылку"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <p className="partner-description">
          Если вы хотите стать партнером и зарабатывать TON, ознакомьтесь с условиями
        </p>

        {/* Create Promo Code Section */}
        <div className="promo-section">
          <h2 className="promo-title">Создать промокод</h2>
          
          {!isCreatingPromo ? (
            <button className="create-promo-btn" onClick={handleCreatePromo}>
              Создать промокод
            </button>
          ) : (
            <div className="promo-input-wrapper">
              <label className="promo-label">Промокод:</label>
              <div className="promo-input-container">
                <input
                  type="text"
                  className="promo-input"
                  placeholder="Введите свой промокод"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  autoFocus
                />
                <button 
                  className="promo-confirm-btn"
                  onClick={handleCreatePromo}
                  disabled={!promoCode.trim()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="promo-cancel-btn" onClick={handleCancelPromo}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Invited Friends Section */}
        <div className="friends-section">
          <h2 className="friends-title">
            Приглашенные друзья
            <span className="friends-count">({friends.length})</span>
          </h2>

          {friends.length === 0 ? (
            <div className="friends-empty">
              <p className="friends-hint">
                Друг должен войти в приложение по вашей ссылке, чтобы получить билет
              </p>
              <p className="friends-empty-text">Пока нет приглашенных друзей</p>
            </div>
          ) : (
            <div className="friends-list">
              {friends.map((friend, index) => (
                <div key={friend.id} className="friend-item">
                  <span className="friend-rank">{index + 1}</span>
                  <img src={friend.avatar} alt={friend.name} className="friend-avatar" />
                  <span className="friend-name">{friend.name}</span>
                  <span className="friend-earnings">
                    {formatNumber(friend.earnings)}
                    <img src="/image/Coin Icon.svg" alt="TON" className="ton-icon" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Navigation />
    </div>
  )
}

export default PartnerPage
