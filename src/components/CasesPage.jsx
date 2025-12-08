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
  { id: 'drop-1', type: 'image', image: '/image/case_card1.png', name: 'Gift 1' },
  { id: 'drop-2', type: 'image', image: '/image/case_card2.png', name: 'Gift 2' },
  { id: 'drop-3', type: 'image', image: '/image/case_card3.png', name: 'Gift 3' },
  { id: 'drop-4', type: 'image', image: '/image/case_card4.png', name: 'Gift 4' },
  { id: 'drop-5', type: 'image', image: '/image/case_card1.png', name: 'Gift 1' },
  { id: 'drop-6', type: 'image', image: '/image/case_card2.png', name: 'Gift 2' },
  { id: 'drop-7', type: 'image', image: '/image/case_card3.png', name: 'Gift 3' },
  { id: 'drop-8', type: 'image', image: '/image/case_card4.png', name: 'Gift 4' },
  { id: 'drop-9', type: 'animation', animation: '/animation/sticker.json', name: 'Sticker' },
  { id: 'drop-10', type: 'image', image: '/image/case_card2.png', name: 'Gift 2' },
  { id: 'drop-11', type: 'image', image: '/image/case_card3.png', name: 'Gift 3' },
  { id: 'drop-12', type: 'image', image: '/image/case_card4.png', name: 'Gift 4' },
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
          <div className="live-items-wrapper">
            <div className="live-items-track">
              {/* Дублируем для бесконечной прокрутки */}
              {[...liveDrops, ...liveDrops].map((drop, idx) => (
                <div key={`${drop.id}-${idx}`} className="live-item">
                  {drop.type === 'animation' && drop.animation ? (
                    <Player
                      autoplay
                      loop
                      src={drop.animation}
                      className="live-item-animation"
                    />
                  ) : (
                    <img
                      src={drop.image}
                      alt={drop.name}
                      className="live-item-image"
                    />
                  )}
                </div>
              ))}
            </div>
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
