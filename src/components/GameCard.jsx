import './GameCard.css'
import { useLanguage } from '../context/LanguageContext'

function GameCard({ title, online }) {
  const { t } = useLanguage()
  return (
    <div className="game-card">
      <div className="game-header">
        <span className="online-dot"></span>
        <span className="online-count">{online} {t('home.online')}</span>
      </div>
      <div className="game-content">
        <h3 className="game-title">{title}</h3>
      </div>
    </div>
  )
}

export default GameCard
