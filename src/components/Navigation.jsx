import { useNavigate } from 'react-router-dom'
import './Navigation.css'
import { useCurrency } from '../context/CurrencyContext'

function Navigation({ activePage = 'home' }) {
  const navigate = useNavigate()
  const { hasFreeSpins } = useCurrency()

  return (
    <nav className={`navigation ${hasFreeSpins ? '' : 'navigation--flat'}`}>
      <div 
        className={`nav-item ${activePage === 'cases' ? 'active' : ''}`}
        onClick={() => navigate('/cases')}
      >
        {activePage === 'cases' ? (
          <div className="nav-icon-wrapper icon-active">
            <img src="/image/mdi_gift (1).svg" alt="Cases" className="nav-icon" />
          </div>
        ) : (
          <div className="nav-icon-wrapper">
            <img src="/image/mdi_gift.svg" alt="Cases" className="nav-icon" />
          </div>
        )}
        <span className="nav-label">Cases</span>
      </div>
      <div 
        className={`nav-item ${activePage === 'crash' ? 'active' : ''}`}
        onClick={() => navigate('/crash')}
      >
        {activePage === 'crash' ? (
          <div className="nav-icon-wrapper icon-active">
            <img src="/image/ion_rocket (1).svg" alt="Crash" className="nav-icon" />
          </div>
        ) : (
          <div className="nav-icon-wrapper">
            <img src="/image/ion_rocket.svg" alt="Crash" className="nav-icon" />
          </div>
        )}
        <span className="nav-label">Crash</span>
      </div>
      <div 
        className={`nav-item center-item ${activePage === 'home' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        {hasFreeSpins ? (
          <div className="baraban-container">
            <img src="/image/Union.svg" alt="Free" className="union-icon" />
            <img src="/image/Baraban.png" alt="Baraban" className="baraban-icon" />
          </div>
        ) : activePage === 'home' ? (
          <div className="roulette-icon-active">
            <img src="/image/Baraban_Off.svg" alt="Рулетка" className="nav-icon roulette-glow" />
          </div>
        ) : (
          <div className="nav-icon-wrapper">
            <img src="/image/Baraban_Off.svg" alt="Рулетка" className="nav-icon" />
          </div>
        )}
        {!hasFreeSpins && <span className="nav-label">Рулетка</span>}
      </div>
      <div 
        className={`nav-item ${activePage === 'pvp' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <div className={`nav-icon-wrapper ${activePage === 'pvp' ? 'icon-active' : ''}`}>
          <img src="/image/material-symbols_swords-rounded.svg" alt="PvP" className="nav-icon" />
        </div>
        <span className="nav-label">PvP</span>
      </div>
      <div 
        className={`nav-item ${activePage === 'upgrade' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <div className={`nav-icon-wrapper ${activePage === 'upgrade' ? 'icon-active' : ''}`}>
          <img src="/image/pajamas_upgrade.svg" alt="Upgrade" className="nav-icon" />
        </div>
        <span className="nav-label">Upgrade</span>
      </div>
    </nav>
  )
}

export default Navigation
