import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CasesPage.css'
import Header from './Header'
import Navigation from './Navigation'
import CaseModal from './CaseModal'
import { useCurrency } from '../context/CurrencyContext'
import { Player } from '@lottiefiles/react-lottie-player'

// Mock data for cases
const defaultPrices = {
  coins: '0.5',
  gems: '15',
  stars: '25',
  shields: '3',
}

const paidCases = [
  { id: 1, prices: defaultPrices, animation: '/animation/sticker.json', name: 'Case 1' },
  { id: 2, prices: defaultPrices, image: '/image/case_card2.png', name: 'Case 2' },
  { id: 3, prices: defaultPrices, image: '/image/case_card3.png', name: 'Case 3' },
  { id: 4, prices: defaultPrices, image: '/image/case_card4.png', name: 'Case 4' },
  { id: 5, prices: defaultPrices, animation: '/animation/sticker.json', name: 'Case 5' },
  { id: 6, prices: defaultPrices, image: '/image/case_card2.png', name: 'Case 6' },
]

const freeCases = [
  { id: 1, animation: '/animation/sticker.json', name: 'Case 1' },
  { id: 2, image: '/image/case_card2.png', name: 'Case 2' },
  { id: 3, image: '/image/case_card3.png', name: 'Case 3' },
  { id: 4, image: '/image/case_card4.png', name: 'Case 4' },
  { id: 5, animation: '/animation/sticker.json', name: 'Case 5' },
  { id: 6, image: '/image/case_card2.png', name: 'Case 6' },
]

const liveDrops = [
  { id: 'drop-1', image: '/image/case-item-1.svg', name: 'Golden Bag' },
  { id: 'drop-2', image: '/image/case-item-2.svg', name: 'Frog King' },
  { id: 'drop-3', image: '/image/case-item-3.svg', name: 'Crystals' },
  { id: 'drop-4', image: '/image/case-item-4.svg', name: 'Helmet' },
  { id: 'drop-5', image: '/image/case-item-1.svg', name: 'Golden Bag' },
  { id: 'drop-6', image: '/image/case-item-2.svg', name: 'Frog King' },
  { id: 'drop-7', image: '/image/case-item-3.svg', name: 'Crystals' },
  { id: 'drop-8', image: '/image/case-item-4.svg', name: 'Helmet' },
  { id: 'drop-9', image: '/image/case-item-1.svg', name: 'Golden Bag' },
  { id: 'drop-10', image: '/image/case-item-2.svg', name: 'Frog King' },
  { id: 'drop-11', image: '/image/case-item-3.svg', name: 'Crystals' },
  { id: 'drop-12', image: '/image/case-item-4.svg', name: 'Helmet' },
]

function CasesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('paid')
  const [selectedCase, setSelectedCase] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { selectedCurrency } = useCurrency()

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCase(null)
  }

  const cases = activeTab === 'paid' ? paidCases : freeCases
  const selectedCurrencyId = selectedCurrency?.id || 'coins'
  const selectedCurrencyIcon = selectedCurrency?.icon || '/image/Coin Icon.svg'

  const getCasePrice = (caseItem) => {
    if (activeTab !== 'paid') return null
    const prices = caseItem.prices || {}
    return prices[selectedCurrencyId] ?? caseItem.price ?? '0'
  }

  return (
    <div className="cases-page">
      <div className="top-bar">
        <span className="close-text">Close</span>
        <span className="chevron">⌄</span>
      </div>

      <Header />

      <main className="cases-main">
        {/* Live feed bar */}
        <div className="live-feed-bar">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">Live</span>
          </div>
          <div className="live-items" aria-label="История выпадения подарков">
            {liveDrops.map((drop) => (
              <div key={drop.id} className="live-item">
                <img
                  src="/image/Progress Bar.svg"
                  alt="Gift"
                  className="live-item-image"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="cases-tabs">
          <button 
            className={`cases-tab ${activeTab === 'paid' ? 'active' : ''}`}
            onClick={() => setActiveTab('paid')}
          >
            Paid
          </button>
          <button 
            className={`cases-tab ${activeTab === 'free' ? 'active' : ''}`}
            onClick={() => setActiveTab('free')}
          >
            Free
          </button>
        </div>

        {/* Cases Grid */}
        <div className="cases-grid">
          {cases.map((caseItem) => (
            <div key={caseItem.id} className="case-card" onClick={() => handleCaseClick(caseItem)}>
              <div className={`case-price-badge ${activeTab === 'free' ? 'case-price-badge--free' : ''}`}>
                {activeTab === 'paid' ? (
                  <>
                    <img src={selectedCurrencyIcon} alt={selectedCurrencyId} className="price-diamond" />
                    <span className="price-amount">{getCasePrice(caseItem)}</span>
                  </>
                ) : (
                  <span className="free-badge">FREE</span>
                )}
              </div>
              <div className="case-image-container">
                {caseItem.animation ? (
                  <Player
                    autoplay
                    loop
                    src={caseItem.animation}
                    className="case-item-animation"
                  />
                ) : (
                  <img 
                    src={caseItem.image} 
                    alt={caseItem.name}
                    className="case-item-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Navigation activePage="cases" />

      <CaseModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseData={selectedCase}
        isPaid={activeTab === 'paid'}
      />
    </div>
  )
}

export default CasesPage
