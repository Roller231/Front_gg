import './ProfilePage.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from './Navigation'
import BetModal from './BetModal'
import InventoryModal from './InventoryModal'
import Header from './Header'
import { useCurrency } from '../context/CurrencyContext'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getDropById } from '../api/cases'
import * as usersApi from '../api/users'
import { Player } from '@lottiefiles/react-lottie-player'




function ProfilePage() {
  const navigate = useNavigate()
  const { 
    currencyOptions,
    selectedCurrency,
    setSelectedCurrency,
    hasFreeSpins,
    setHasFreeSpins,
    formatAmount, // 👈 ДОБАВЬ
  } = useCurrency()
  
  const [top1Balance, setTop1Balance] = useState(0)
  
  const { user, settings, updateSettings } = useUser()
  const { t, language, changeLanguage, languages, currentLanguage } = useLanguage()

  const [isBetModalOpen, setIsBetModalOpen] = useState(false)
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

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
    let mounted = true
  
    async function loadTop1Balance() {
      try {
        const res = await usersApi.getUsers()
        const users = Array.isArray(res) ? res : (res?.users ?? [])
  
        if (!users.length) return
  
        const maxBalance = Math.max(
          ...users.map(u => Number(u.balance) || 0)
        )
  
        if (mounted) setTop1Balance(maxBalance)
      } catch (e) {
        console.error('Failed to load top1 balance', e)
      }
    }
  
    loadTop1Balance()
    return () => (mounted = false)
  }, [])
  

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

  const displayName = firstname || username || t('common.guest')
  const avatar =
    url_image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || id}`

  /* ===== INVENTORY VIEW ===== */
  const INVENTORY_SLOTS = 3
  const inventoryList = Array.isArray(inventory) ? inventory.slice().reverse() : []
  const inventoryView = Array.from({ length: INVENTORY_SLOTS }).map(
    (_, i) => inventoryList[i] || null
  )

  const totalInventoryCount = inventory?.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  ) || 0

  const getItemPriceLabel = (item) => {
    const raw = item?.price ?? item?.cost ?? item?.value ?? item?.amount
    const num = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isFinite(num)) return num.toFixed(2)
    return '0.00'
  }

  const getItemImageSrc = (item) =>
    item?.icon || item?.image || item?.url || item?.url_image || '/image/mdi_gift (2).svg'

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
            <span className="rating-value">
  {formatAmount(top1Balance)}
</span>
          </div>

          <div 
            className="info-badge country-badge language-selector"
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            <img
              src={currentLanguage.flag}
              alt={currentLanguage.name}
              className="profile-country-flag"
            />
            {showLanguageDropdown && (
              <div className="language-dropdown">
                {languages.map((lang) => (
                  <div
                    key={lang.id}
                    className={`language-option ${language === lang.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      changeLanguage(lang.id)
                      setShowLanguageDropdown(false)
                    }}
                  >
                    <img src={lang.flag} alt={lang.name} className="language-flag" />
                    <span>{lang.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== LEVEL PROGRESS BAR ===== */}
      <div className="level-progress-section">
        <div className="level-progress-container">
          <div className="level-badge level-current">
            <span className="level-number">{user.level || 1}</span>
          </div>
          <div className="level-progress-bar">
            <div 
              className="level-progress-fill" 
              style={{ width: `${user.levelProgress || 35}%` }}
            />
          </div>
          <div className="level-badge level-next">
            <span className="level-number">{(user.level || 1) + 1}</span>
          </div>
        </div>
        <div className="level-progress-info">
          <span className="level-xp-text">
            {user.currentXP || 350} / {user.nextLevelXP || 1000} XP
          </span>
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
            {t('profile.inventory')} ({totalInventoryCount})
          </span>
          <button
  className="sell-all-btn"
  onClick={() => setIsInventoryModalOpen(true)}
>
  {t('profile.sellAll')}
</button>
        </div>

        <div className="inventory-items">
          <div className="inventory-gifts">
            {loadingInventory ? (
              <span>{t('common.loading')}</span>
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

          <button className="inventory-arrow" onClick={() => setIsInventoryModalOpen(true)}>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* ===== SETTINGS ===== */}
      <div className="settings-section">
        <h3 className="settings-title">{t('profile.settings')}</h3>
        
        <div className="settings-list">
          {/* Скрывать логин */}
          <div className="settings-item">
            <span className="settings-label">{t('profile.hideLogin')}</span>
            <label className="settings-switch">
              <input 
                type="checkbox" 
                checked={!settings?.hideLogin}
                onChange={(e) => updateSettings({ hideLogin: !e.target.checked })}
              />
              <span className="settings-slider"></span>
            </label>
          </div>

          {/* Вибрация */}
          <div className="settings-item">
            <span className="settings-label">{t('profile.vibration')}</span>
            <label className="settings-switch">
              <input 
                type="checkbox" 
                checked={settings?.vibrationEnabled}
                onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
              />
              <span className="settings-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* ===== WITHDRAW BUTTON ===== */}
      <button
  className="withdraw-btn gg-btn-glow"
  onClick={() => setIsBetModalOpen(true)}
>
{t('profile.withdraw')} {selectedCurrency.amount}
  <img
    src={selectedCurrency.icon}
    alt={selectedCurrency.id}
    className="diamond-icon"
  />
</button>


      {/* ===== OPERATIONS (заглушка) ===== */}
      {/* <div className="operations-section">
        <h3 className="operations-title">{t('profile.operationsHistory')}</h3>
        <div className="operations-list">
          <div className="operation-item">
            <span className="operation-date">—</span>
            <span className="operation-name">
              {t('profile.deposits')}: {user.totalDEP}
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
      </div> */}

      <BetModal
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        mode="withdraw"
      />

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        items={inventoryDrops}
        loading={loadingInventory}
        onSellItem={(item) => {
          console.log('Sell item:', item)
        }}
        onSellAll={() => {
          console.log('Sell all items')
        }}
      />

      <Navigation />
    </div>
  )
}

export default ProfilePage
