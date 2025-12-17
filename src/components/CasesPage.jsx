import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './CasesPage.css'

import Header from './Header'
import Navigation from './Navigation'
import CaseModal from './CaseModal'

import { useCurrency } from '../context/CurrencyContext'
import { useLanguage } from '../context/LanguageContext'
import { getCases } from '../api/cases'
import { Player } from '@lottiefiles/react-lottie-player'

import { WS_BASE_URL } from '../config/ws'
import { useWebSocket } from '../hooks/useWebSocket'


/* ===== LIVE DROPS (пока мок, можно позже заменить WS) ===== */



function CasesPage() {
  const navigate = useNavigate()
  const { selectedCurrency, formatAmount } = useCurrency()
  const { t } = useLanguage()

  /* ===== STATE ===== */
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('paid')
  const [selectedCase, setSelectedCase] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [liveDrops, setLiveDrops] = useState([])

  // Убрали offsetX - используем CSS анимацию для плавности

  /* ===== LOAD CASES ===== */
  useEffect(() => {
    getCases()
      .then(setCases)
      .catch((err) => {
        console.error('Failed to load cases', err)
      })
      .finally(() => setLoading(false))
  }, [])


  useWebSocket(`${WS_BASE_URL}/ws/drops/global`, {
    onMessage: (msg) => {
      if (msg.event !== 'drop') return
  
      // Добавляем новый элемент в начало массива (появляется справа)
      setLiveDrops(prev => [
        {
          id: `${msg.data.id}-${Date.now()}`,
          name: msg.data.name,
          type: msg.data.icon?.endsWith('.json') ? 'animation' : 'image',
          image: msg.data.icon,
          animation: msg.data.icon,
        },
        ...prev,
      ].slice(0, 50)) // Ограничиваем количество элементов
      
    },
  })
  
  

  /* ===== SPLIT PAID / FREE ===== */
  const paidCases = cases.filter((c) => Number(c.price) > 0)
  const freeCases = cases.filter((c) => Number(c.price) === 0)

  const visibleCases = activeTab === 'paid' ? paidCases : freeCases

  /* ===== HANDLERS ===== */
  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCase(null)
  }

  if (loading) {
    return <div className="cases-page">{t('cases.loadingCases')}</div>
  }

  return (
    <div className="cases-page">
      <Header />

      <main className="cases-main">
        {/* ===== LIVE FEED ===== */}
        <div className="live-feed-bar">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">{t('cases.live')}</span>
          </div>
          <div className="live-items-wrapper">
            <div className="live-items-track">
              {/* Элементы появляются справа и движутся влево */}
              {liveDrops.map((drop, idx) => (
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

        {/* ===== TABS ===== */}
        <div className="cases-tabs">
          <button
            className={`cases-tab ${activeTab === 'paid' ? 'active' : ''}`}
            onClick={() => setActiveTab('paid')}
          >
            {t('cases.paid')}
          </button>
          <button
            className={`cases-tab ${activeTab === 'free' ? 'active' : ''}`}
            onClick={() => setActiveTab('free')}
          >
            {t('cases.free')}
          </button>
        </div>

        {/* ===== CASES GRID ===== */}
        <div className="cases-grid">
          {visibleCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="case-card"
              onClick={() => handleCaseClick(caseItem)}
            >
              {/* PRICE / FREE BADGE */}
              {Number(caseItem.price) > 0 ? (
                <div className="case-price-badge">
                  <img
                    src={selectedCurrency.icon}
                    alt={selectedCurrency.id}
                    className="price-diamond"
                  />
                  <span>{formatAmount(caseItem.price)}</span>
                </div>
              ) : (
                <div className="case-price-badge case-price-badge--free">
                  {t('common.free')}
                </div>
              )}

              {/* IMAGE */}
              <img
                src={caseItem.main_image}
                alt={caseItem.name}
                className="case-item-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          ))}
        </div>
      </main>

      <Navigation activePage="cases" />

      <CaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseData={selectedCase}
        isPaid={Number(selectedCase?.price) > 0}
      />
    </div>
  )
}

export default CasesPage
