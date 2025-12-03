import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProfilePage.css'

const userData = {
  name: 'Alexander',
  email: 'alex@example.com',
  phone: '+7 (999) 123-45-67',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  balance: {
    main: '1,250.00',
    bonus: '150.00',
    currency: 'USDT'
  },
  stats: {
    totalGames: 248,
    wins: 156,
    losses: 92,
    winRate: '62.9%'
  }
}

const recentGames = [
  { id: 1, game: 'Crash', result: 'win', amount: '+125.00', time: '2 мин назад' },
  { id: 2, game: 'Cases', result: 'loss', amount: '-50.00', time: '15 мин назад' },
  { id: 3, game: 'PvP', result: 'win', amount: '+200.00', time: '1 час назад' },
  { id: 4, game: 'Upgrade', result: 'loss', amount: '-75.00', time: '2 часа назад' },
  { id: 5, game: 'Crash', result: 'win', amount: '+310.00', time: '3 часа назад' },
]

const friends = [
  { id: 1, name: 'MaxGamer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max', status: 'online' },
  { id: 2, name: 'ProPlayer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro', status: 'online' },
  { id: 3, name: 'CryptoKing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Crypto', status: 'offline' },
  { id: 4, name: 'LuckyOne', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky', status: 'ingame' },
  { id: 5, name: 'WinMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Win', status: 'offline' },
]

function ProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)

  const handleInvite = (friend) => {
    setSelectedFriend(friend)
    setShowInviteModal(true)
  }

  const confirmInvite = () => {
    setShowInviteModal(false)
    setSelectedFriend(null)
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span>←</span>
        </button>
        <h1 className="profile-title">Профиль</h1>
        <button className="settings-btn">
          <span>⚙️</span>
        </button>
      </div>

      <div className="profile-user-card">
        <div className="profile-avatar-container">
          <img src={userData.avatar} alt="avatar" className="profile-avatar" />
          <span className="online-status"></span>
        </div>
        <div className="profile-user-info">
          <h2 className="profile-username">{userData.name}</h2>
          <p className="profile-contact">{userData.email}</p>
          <p className="profile-contact">{userData.phone}</p>
        </div>
      </div>

      <div className="profile-balance-card">
        <div className="balance-item">
          <span className="balance-label">Основной баланс</span>
          <div className="balance-value">
            <span className="balance-icon">💎</span>
            <span>{userData.balance.main} {userData.balance.currency}</span>
          </div>
        </div>
        <div className="balance-divider"></div>
        <div className="balance-item">
          <span className="balance-label">Бонусный баланс</span>
          <div className="balance-value bonus">
            <span className="balance-icon">🎁</span>
            <span>{userData.balance.bonus} {userData.balance.currency}</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Статистика
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          История
        </button>
        <button 
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Друзья
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'stats' && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🎮</span>
                <span className="stat-value">{userData.stats.totalGames}</span>
                <span className="stat-label">Всего игр</span>
              </div>
              <div className="stat-card win">
                <span className="stat-icon">🏆</span>
                <span className="stat-value">{userData.stats.wins}</span>
                <span className="stat-label">Победы</span>
              </div>
              <div className="stat-card loss">
                <span className="stat-icon">💔</span>
                <span className="stat-value">{userData.stats.losses}</span>
                <span className="stat-label">Поражения</span>
              </div>
              <div className="stat-card rate">
                <span className="stat-icon">📊</span>
                <span className="stat-value">{userData.stats.winRate}</span>
                <span className="stat-label">Винрейт</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            {recentGames.map((game) => (
              <div key={game.id} className={`history-item ${game.result}`}>
                <div className="history-game-info">
                  <span className="history-game-name">{game.game}</span>
                  <span className="history-time">{game.time}</span>
                </div>
                <span className={`history-amount ${game.result}`}>
                  {game.amount}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="friends-section">
            {friends.map((friend) => (
              <div key={friend.id} className="friend-item">
                <div className="friend-info">
                  <div className="friend-avatar-container">
                    <img src={friend.avatar} alt={friend.name} className="friend-avatar" />
                    <span className={`friend-status ${friend.status}`}></span>
                  </div>
                  <div className="friend-details">
                    <span className="friend-name">{friend.name}</span>
                    <span className={`friend-status-text ${friend.status}`}>
                      {friend.status === 'online' && 'В сети'}
                      {friend.status === 'offline' && 'Не в сети'}
                      {friend.status === 'ingame' && 'В игре'}
                    </span>
                  </div>
                </div>
                <button 
                  className="invite-btn"
                  onClick={() => handleInvite(friend)}
                  disabled={friend.status === 'offline'}
                >
                  Пригласить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showInviteModal && selectedFriend && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="invite-modal-title">Пригласить в игру</h3>
            <div className="invite-friend-info">
              <img src={selectedFriend.avatar} alt={selectedFriend.name} className="invite-avatar" />
              <span className="invite-name">{selectedFriend.name}</span>
            </div>
            <p className="invite-text">Выберите игру для приглашения</p>
            <div className="invite-games">
              <button className="invite-game-btn" onClick={confirmInvite}>🎰 Crash</button>
              <button className="invite-game-btn" onClick={confirmInvite}>📦 Cases</button>
              <button className="invite-game-btn" onClick={confirmInvite}>⚔️ PvP</button>
              <button className="invite-game-btn" onClick={confirmInvite}>⬆️ Upgrade</button>
            </div>
            <button className="cancel-btn" onClick={() => setShowInviteModal(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
