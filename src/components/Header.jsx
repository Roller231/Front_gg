import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'
import { useCurrency } from '../context/CurrencyContext'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'
import DepositModal from './DepositModal'

const accountTypes = [
  { id: 'usdt', name: 'USDT TON', icon: '💎', amount: '1.22' },
  { id: 'btc', name: 'BTC', icon: '₿', amount: '0.0012' },
  { id: 'eth', name: 'ETH', icon: 'Ξ', amount: '0.15' },
  { id: 'ton', name: 'TON', icon: '💠', amount: '25.00' },
]

const gameCurrencies = [
  { id: 'coins', name: 'Монеты', icon: '🪙', amount: '1.22' },
  { id: 'gems', name: 'Кристаллы', icon: '💎', amount: '500' },
  { id: 'stars', name: 'Звезды', icon: '⭐', amount: '120' },
]

function Header() {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user } = useUser()
  const { t } = useLanguage()

const {
  currencyOptions,
  selectedCurrency,
  setSelectedCurrency,
  hasFreeSpins,
  setHasFreeSpins,
} = useCurrency()

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  const visibleCurrencies = currencyOptions.filter((currency) => currency.id !== selectedCurrency.id)

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency)
    setIsDropdownOpen(false)
  }

  return (
    <header className="header">
      <Link className="logo" to="/" aria-label="На главную">
        <img src="/image/Logo.svg" alt="GG Cat logo" />
      </Link>
      
      <div className="header-right">
        <div className="balance-container">
          <div className={`balance-box ${isDropdownOpen ? 'open' : ''}`}>
            <div className="balance-info-wrapper">
              <div 
                className="balance-info" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="currency-icon">
                  <img src={selectedCurrency.icon} alt={selectedCurrency.id} />
                </span>
                <span className="balance-amount">{selectedCurrency.amount}</span>
                <span className={`balance-arrow ${isDropdownOpen ? 'open' : ''}`}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
            <button className="plus-btn" onClick={() => setIsDepositModalOpen(true)}>
              <img src="/image/plus icon.svg" alt="plus" />
            </button>

            {isDropdownOpen && (
              <div className="currency-dropdown">
                {visibleCurrencies.map((currency) => (
                  <div 
                    key={currency.id}
                    className={`currency-option ${selectedCurrency.id === currency.id ? 'selected' : ''}`}
                    onClick={() => handleCurrencySelect(currency)}
                  >
                    <span className="currency-icon">
                      <img src={currency.icon} alt={currency.id} />
                    </span>
                    <span className="currency-amount">{currency.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        
        <div className="avatar" onClick={() => navigate('/profile')}>
        <img
  src={
    user?.url_image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
  }
  alt="avatar"
/>

        </div>
      </div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </header>
  )
}

export default Header
