import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import './GameCard.css'
import { useLanguage } from '../context/LanguageContext'

const caseItems = [
  { id: 1, image: '/image/case_card1.png', name: 'Gift 1' },
  { id: 2, image: '/image/case_card2.png', name: 'Gift 2' },
  { id: 3, image: '/image/case_card3.png', name: 'Gift 3' },
  { id: 4, image: '/image/case_card4.png', name: 'Gift 4' },
  { id: 5, animation: '/animation/sticker.json', name: 'Sticker' },
]

function GameCard({ title, online, type = 'default' }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [rouletteItems, setRouletteItems] = useState([])
  
  useEffect(() => {
    if (title.toLowerCase() === 'кейсы' || title === t('home.roulette')) {
      const items = []
      for (let i = 0; i < 20; i++) {
        const randomItem = caseItems[Math.floor(Math.random() * caseItems.length)]
        items.push({ ...randomItem, uid: `${randomItem.id}-${i}-${Math.random().toString(36).slice(2)}` })
      }
      setRouletteItems(items)
    }
  }, [title, t])

  const handleClick = () => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle === 'кейсы' || title === t('home.roulette')) {
      navigate('/cases')
    } else if (lowerTitle === 'рулетка' || lowerTitle === 'ракетка') {
      navigate('/wheel')
    } else if (lowerTitle === 'pvp' || title === t('home.pvp')) {
      navigate('/pvp')
    } else if (lowerTitle === 'upgrade' || title === t('home.upgrade')) {
      navigate('/upgrade')
    }
  }

  const renderCasesContent = () => (
    <div className="game-card-cases-layout">
      {/* Маленькая рулетка слева */}
      <div className="game-card-mini-roulette">
        <div className="game-card-mini-roulette-track">
          {[...rouletteItems, ...rouletteItems].map((item, idx) => (
            <div key={`${item.uid}-${idx}`} className="game-card-mini-roulette-item">
              {item.animation ? (
                <Player
                  autoplay
                  loop
                  src={item.animation}
                  className="game-card-mini-roulette-animation"
                />
              ) : (
                <img src={item.image} alt={item.name} className="game-card-mini-roulette-image" />
              )}
            </div>
          ))}
        </div>
        <div className="game-card-mini-roulette-fade game-card-mini-roulette-fade--left" />
        <div className="game-card-mini-roulette-fade game-card-mini-roulette-fade--right" />
      </div>
      
      {/* Картинка кейса справа */}
      <div className="game-card-case-image">
        <img src="/image/case_card1.png" alt="case" />
      </div>
    </div>
  )

  const renderRouletteContent = () => (
    <div className="game-card-crash">
      {/* Луна слева сверху */}
      <img src="/image/Venus.png" alt="moon" className="game-card-moon" />
      
      {/* Плавно растущая кривая линия */}
      <svg className="game-card-wave-line" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path 
          d="M0,95 C50,90 100,70 150,40 Q175,25 200,10" 
          className="game-card-wave-path"
        />
      </svg>
      
      {/* Летящий кот */}
      <Player
        autoplay
        loop
        src="/animation/cat fly___.json"
        className="game-card-flying-cat"
      />
      
      {/* Множитель */}
      <div className="game-card-crash-multiplier">
        <span className="crash-multiplier-x">x</span>
        <span className="crash-multiplier-value">1.60</span>
      </div>
    </div>
  )

  const renderPvPContent = () => (
    <div className="game-card-pvp">
      <div className="pvp-cat pvp-cat--left">
        <img src="/image/cat1.svg" alt="cat1" />
      </div>
      <div className="game-card-vs">
        <span className="game-card-vs-v">V</span>
        <span className="game-card-vs-s">S</span>
      </div>
      <div className="pvp-cat pvp-cat--right">
        <img src="/image/cat2.svg" alt="cat2" />
      </div>
    </div>
  )

  const renderUpgradeContent = () => (
    <div className="game-card-upgrade">
      {/* Левая коробка - исходный предмет */}
      <div className="game-card-upgrade-box">
        <img src="/image/case_card1.png" alt="source" className="game-card-upgrade-item" />
      </div>

      {/* Колесо шанса */}
      <div className="game-card-upgrade-wheel">
        <svg viewBox="0 0 100 100" className="game-card-upgrade-svg">
          {/* Фоновый круг */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="#2c2c2e" strokeWidth="8" />
          {/* Нижняя половина круга (от левого бока через низ до правого бока) */}
          <circle 
            cx="50" cy="50" r="40" 
            fill="none" 
            stroke="url(#upgradeGradient)" 
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="125.6 251.2"
            transform="rotate(0 50 50)"
          />
          <defs>
            <linearGradient id="upgradeGradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#BBFD44" />
              <stop offset="50%" stopColor="#ff6600" />
              <stop offset="100%" stopColor="#BBFD44" />
            </linearGradient>
          </defs>
        </svg>
        <div className="game-card-upgrade-arrow"></div>
        <div className="game-card-upgrade-center">
          <span className="game-card-upgrade-percent">50%</span>
        </div>
      </div>

      {/* Правая коробка - целевой предмет */}
      <div className="game-card-upgrade-box game-card-upgrade-box--target">
        <img src="/image/case_card4.png" alt="target" className="game-card-upgrade-item" />
      </div>
    </div>
  )

  const renderContent = () => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle === 'кейсы' || title === t('home.roulette')) {
      return renderCasesContent()
    } else if (lowerTitle === 'рулетка' || lowerTitle === 'ракетка') {
      return renderRouletteContent()
    } else if (lowerTitle === 'pvp' || title === t('home.pvp')) {
      return renderPvPContent()
    } else if (lowerTitle === 'upgrade' || title === t('home.upgrade')) {
      return renderUpgradeContent()
    }
    return null
  }

  const getCardClass = () => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle === 'кейсы' || title === t('home.roulette')) {
      return 'game-card--cases'
    } else if (lowerTitle === 'рулетка' || lowerTitle === 'ракетка') {
      return 'game-card--roulette'
    } else if (lowerTitle === 'pvp' || title === t('home.pvp')) {
      return 'game-card--pvp'
    } else if (lowerTitle === 'upgrade' || title === t('home.upgrade')) {
      return 'game-card--upgrade'
    }
    return ''
  }

  return (
    <div className={`game-card ${getCardClass()}`} onClick={handleClick}>
      <div className="game-header">
        <span className="online-dot"></span>
        <span className="online-count">{online} {t('home.online')}</span>
      </div>
      
      <div className="game-card-visual">
        {renderContent()}
      </div>
      
      <div className="game-content">
        <h3 className="game-title">{title}</h3>
      </div>
    </div>
  )
}

export default GameCard
