import './ProfilePage.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from './Navigation'
import BetModal from './BetModal'
import Header from './Header'
import { useCurrency } from '../context/CurrencyContext'
import { useUser } from '../context/UserContext'
import { getDropById } from '../api/cases'
import { useEffect } from 'react'




function ProfilePage() {
  const navigate = useNavigate()
  const {
    currencyOptions,
    selectedCurrency,
    setSelectedCurrency,
    hasFreeSpins,
    setHasFreeSpins,
  } = useCurrency()
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


  const [inventoryDrops, setInventoryDrops] = useState([])
  const [loadingInventory, setLoadingInventory] = useState(true)
  
  useEffect(() => {
    if (!inventory?.length) {
      setInventoryDrops([])
      setLoadingInventory(false)
      return
    }
  
    async function loadInventory() {
      setLoadingInventory(true)
  
      try {
        // 1. получаем уникальные drop_id
        const uniqueIds = [...new Set(inventory.map(i => i.drop_id))]
  
        // 2. загружаем дропы
        const drops = await Promise.all(
          uniqueIds.map(id => getDropById(id))
        )
  
        // 3. мапа id → drop
        const dropMap = Object.fromEntries(
          drops.map(d => [d.id, d])
        )
  
        // 4. разворачиваем inventory по count
        const expanded = inventory.flatMap(item =>
          Array.from({ length: item.count }).map(() => dropMap[item.drop_id])
        )
  
        setInventoryDrops(expanded)
      } catch (e) {
        console.error('Failed to load inventory', e)
        setInventoryDrops([])
      } finally {
        setLoadingInventory(false)
      }
    }
  
    loadInventory()
  }, [inventory])
  
// 👉 только первые 4 подарка для превью
const inventoryPreview = inventoryDrops.slice(0, 4)

  const displayName = firstname || username || 'Guest'
  const avatar =
    url_image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || id}`



  /* ===== INVENTORY VIEW (как раньше) ===== */


  const totalInventoryCount = inventory?.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  ) || 0
  

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
            Инвентарь ({totalInventoryCount})
          </span>
          <button className="sell-all-btn">Продать Все</button>
        </div>

        <div className="inventory-items">
          <div className="inventory-gifts">
  {loadingInventory ? (
    <span>Загрузка…</span>
  ) : inventoryPreview.length === 0 ? (
    <img
      src="/image/mdi_gift (2).svg"
      alt="empty"
      className="inventory-item-icon"
    />
  ) : (
    inventoryPreview.map((item, index) => (
      <div key={`${item.id}-${index}`} className="inventory-item">
        {item.icon?.endsWith('.json') ? (
          <Player
            autoplay
            loop
            src={item.icon}
            className="inventory-item-lottie"
          />
        ) : (
          <img
            src={item.icon}
            alt={item.name}
            className="inventory-item-icon"
          />
        )}
      </div>
    ))
  )}
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
Вывести {selectedCurrency.amount}
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
            {selectedCurrency.amount}
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
