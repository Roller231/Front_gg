import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'
import { useCurrency } from '../context/CurrencyContext'

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
  const { currencyOptions, selectedCurrency, setSelectedCurrency, hasFreeSpins, setHasFreeSpins } = useCurrency()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeAccountType, setActiveAccountType] = useState('usdt')
  const [showNotification, setShowNotification] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [showGameDropdown, setShowGameDropdown] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(accountTypes[0])
  const [selectedGameCurrency, setSelectedGameCurrency] = useState(gameCurrencies[0])

  const visibleCurrencies = currencyOptions.filter((currency) => currency.id !== selectedCurrency.id)

  const handleWalletClick = () => {
    setShowNotification(true)
    setIsModalOpen(false)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency)
    setIsDropdownOpen(false)
  }

  return (
    <header className="header">
      <div className="logo">
        <img src="/image/Logo.svg" alt="GG Cat logo" />
      </div>
      
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
            <button className="plus-btn" onClick={() => setIsModalOpen(true)}>
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

        {/* Drum Toggle */}
        <div style={{ marginRight: '12px' }}>
          <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
            <input 
              type="checkbox" 
              checked={hasFreeSpins}
              onChange={(e) => setHasFreeSpins(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: hasFreeSpins ? '#2196F3' : '#ccc',
              borderRadius: '24px',
              transition: '.4s'
            }}></span>
            <span style={{
              position: 'absolute',
              content: '""',
              height: '16px',
              width: '16px',
              left: '4px',
              bottom: '4px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: '.4s',
              transform: hasFreeSpins ? 'translateX(16px)' : 'translateX(0)'
            }}></span>
          </label>
        </div>

        <div className="avatar" onClick={() => navigate('/profile')}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
        </div>
      </div>

      {/* Balance Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="balance-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Баланс</h2>
            
            <div className="account-cards">
              {/* Account Type Card */}
              <div 
                className={`account-card ${activeAccountType === 'usdt' ? 'active' : ''}`}
                onClick={() => {
                  setActiveAccountType('usdt')
                  setShowGameDropdown(false)
                  setShowAccountDropdown(!showAccountDropdown)
                }}
              >
                <div className="account-label">
                  Счет • {selectedAccount.name}
                  <span className={`account-arrow ${showAccountDropdown ? 'open' : ''}`}>⌄</span>
                </div>
                <div className="account-balance">
                  <span className="account-icon">{selectedAccount.icon}</span>
                  <span>{selectedAccount.amount}</span>
                </div>
                
                {showAccountDropdown && (
                  <div className="modal-dropdown">
                    {accountTypes.map((acc) => (
                      <div 
                        key={acc.id}
                        className={`modal-dropdown-item ${selectedAccount.id === acc.id ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAccount(acc)
                          setShowAccountDropdown(false)
                        }}
                      >
                        <span className="dropdown-icon">{acc.icon}</span>
                        <span>{acc.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Game Currency Card */}
              <div 
                className={`account-card ${activeAccountType === 'game' ? 'active' : ''}`}
                onClick={() => {
                  setActiveAccountType('game')
                  setShowAccountDropdown(false)
                  setShowGameDropdown(!showGameDropdown)
                }}
              >
                <div className="account-label">
                  {selectedGameCurrency.name}
                  <span className={`account-arrow ${showGameDropdown ? 'open' : ''}`}>⌄</span>
                </div>
                <div className="account-balance">
                  <span className="account-icon">{selectedGameCurrency.icon}</span>
                  <span>{selectedGameCurrency.amount}</span>
                </div>
                
                {showGameDropdown && (
                  <div className="modal-dropdown">
                    {gameCurrencies.map((curr) => (
                      <div 
                        key={curr.id}
                        className={`modal-dropdown-item ${selectedGameCurrency.id === curr.id ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedGameCurrency(curr)
                          setShowGameDropdown(false)
                        }}
                      >
                        <span className="dropdown-icon">{curr.icon}</span>
                        <span>{curr.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bonus-card">
              <div className="bonus-info">
                <div className="bonus-label">Бонусный счет</div>
                <div className="bonus-balance">
                  <span className="account-icon">💎</span>
                  <span>1.22</span>
                </div>
              </div>
              <span className="bonus-arrow">›</span>
            </div>
            
            <button className="wallet-btn" onClick={handleWalletClick}>Wallet</button>
          </div>
        </div>
      )}
    {/* Notification */}
      {showNotification && (
        <div className="notification">
          Бонус активирован!
        </div>
      )}
    </header>
  )
}

export default Header
