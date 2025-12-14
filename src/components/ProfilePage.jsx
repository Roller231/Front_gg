import './ProfilePage.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from './Navigation'
import BetModal from './BetModal'
import Header from './Header'
import { useCurrency } from '../context/CurrencyContext'
import { useUser } from '../context/UserContext'

function ProfilePage() {
  const navigate = useNavigate()
  const { selectedCurrency } = useCurrency()
  const { user } = useUser()

  const [isBetModalOpen, setIsBetModalOpen] = useState(false)

  if (!user) {
    return <div className="profile-page">Loading...</div>
  }

  const {
    id,
    username,
    firstname,
    balance,
    inventory,
    url_image,
    refcount,
  } = user

  const displayName = firstname || username || 'Guest'
  const avatar =
    url_image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || id}`

  /* ===== INVENTORY VIEW (как раньше) ===== */
  const INVENTORY_SLOTS = 4
  const inventoryView = Array.from({ length: INVENTORY_SLOTS }).map(
    (_, i) => inventory?.[i] || null
  )

  return (
    <div className="profile-page">
      <Header />

      {/* ===== USER CARD ===== */}
      <div className="profile-user-card">
        <div className="profile-avatar-container">
          <img src={avatar} alt="avatar" className="profile-avatar" />
        </div>

        <div className="profile-user-info">
          <h2 className="profile-username">{displayName}</h2>
          <p className="profile-user-id">User ID {id}</p>
        </div>

        <div className="profile-user-right">
          <div
            className="info-badge rating-badge"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/top-20')}
          >
            <span className="rating-icon">👑</span>
            <span className="rating-value">{refcount}</span>
          </div>

          <div className="info-badge country-badge">
            <img
              src="/image/twemoji_flag-russia.png"
              alt="country"
              className="profile-country-flag"
            />
          </div>
        </div>
      </div>

      {/* ===== BONUS BANNER ===== */}
      <img
        src="/image/19.png"
        alt="Bonus Banner"
        className="bonus-banner-img"
      />

      {/* ===== PARTNER PROGRAM ===== */}
      <img
        src="/image/18.png"
        alt="Partner Program"
        className="partner-program-img"
        onClick={() => navigate('/partner')}
      />

      {/* ===== INVENTORY ===== */}
      <div className="inventory-section">
        <div className="inventory-header">
          <span className="inventory-title">
            Инвентарь ({inventory?.length || 0})
          </span>
          <button className="sell-all-btn">Продать Все</button>
        </div>

        <div className="inventory-items">
          <div className="inventory-gifts">
            {inventoryView.map((item, index) => (
              <div key={index} className="inventory-item">
                <img
                  src={
                    item?.icon
                      ? item.icon
                      : '/image/mdi_gift (2).svg'
                  }
                  alt="gift"
                  className="inventory-item-icon"
                />
              </div>
            ))}
          </div>

          <button className="inventory-arrow">
            <span>→</span>
          </button>
        </div>
      </div>

      {/* ===== WITHDRAW BUTTON ===== */}
      <button
        className="withdraw-btn gg-btn-glow"
        onClick={() => setIsBetModalOpen(true)}
      >
        Вывести {balance?.toFixed(2)}{' '}
        <img
          src={selectedCurrency.icon}
          alt={selectedCurrency.id}
          className="diamond-icon"
        />
      </button>

      {/* ===== OPERATIONS (заглушка) ===== */}
      <div className="operations-section">
        <h3 className="operations-title">История Операций</h3>
        <div className="operations-list">
          <div className="operation-item">
            <span className="operation-date">—</span>
            <span className="operation-name">
              Пополнений: {user.totalDEP}
            </span>
            <span className="operation-amount">
              {balance?.toFixed(2)}
              <img
                src={selectedCurrency.icon}
                alt={selectedCurrency.id}
                className="diamond-icon"
              />
            </span>
          </div>
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
