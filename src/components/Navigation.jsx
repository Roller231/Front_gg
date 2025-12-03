import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navigation.css'

function Navigation({ activePage = 'home' }) {
  const navigate = useNavigate()
  const [hasFreeSpins, setHasFreeSpins] = useState(true)

  // HTTP-запрос для бэкенда:
  // Ожидается GET /api/free-spins/status -> { hasFreeSpins: boolean }
  // Здесь фронт просто дергает эндпоинт и кладёт флаг в состояние.
  async function fetchFreeSpinsStatus() {
    try {
      const response = await fetch('/api/free-spins/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // при необходимости можно включить куки/сессии
        // credentials: 'include',
      })

      if (!response.ok) {
        // TODO: при желании можно обработать ошибку (лог/тост)
        return
      }

      const data = await response.json()

      // backend: ожидается поле hasFreeSpins:boolean
      if (typeof data.hasFreeSpins === 'boolean') {
        setHasFreeSpins(data.hasFreeSpins)
      }
    } catch (error) {
      // TODO: опционально логировать ошибку
    }
  }

  useEffect(() => {
    // при монтировании навигации один раз запрашиваем статус барабана
    fetchFreeSpinsStatus()
  }, [])

  return (
    <nav className="navigation">
      <div 
        className={`nav-item ${activePage === 'cases' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <img src="/image/Cases.svg" alt="Cases" className="nav-icon" />
        <span className="nav-label"></span>
      </div>
      <div 
        className={`nav-item ${activePage === 'crash' ? 'active' : ''}`}
        onClick={() => navigate('/crash')}
      >
        {activePage === 'crash' ? (
          <div className="crash-icon-active">
            <img src="/image/Crash_activ.svg" alt="Crash" className="nav-icon crash-glow" />
          </div>
        ) : (
          <img src="/image/Crash.svg" alt="Crash" className="nav-icon" />
        )}
        <span className="nav-label"></span>
      </div>
      <div className="nav-item center-item" onClick={() => navigate('/')}>
        {hasFreeSpins ? (
          <div className="baraban-container">
            <div className="baraban-glow"></div>
            <div className="baraban-pulse"></div>
            <img src="/image/Union.svg" alt="Free" className="union-icon" />
            <img src="/image/Baraban.png" alt="Baraban" className="baraban-icon" />
          </div>
        ) : (
          <div className="baraban-container baraban-off">
            <img
              src="/image/Baraban_Off.svg"
              alt="Baraban off"
              className="baraban-off-icon"
            />
          </div>
        )}
      </div>
      <div 
        className={`nav-item ${activePage === 'pvp' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <img src="/image/PvP.svg" alt="PvP" className="nav-icon" />
        <span className="nav-label"></span>
      </div>
      <div 
        className={`nav-item ${activePage === 'upgrade' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <img src="/image/Upgrade.svg" alt="Upgrade" className="nav-icon" />
        <span className="nav-label"></span>
      </div>
    </nav>
  )
}

export default Navigation
