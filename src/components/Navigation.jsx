import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-item">
        <img src="/image/Cases.svg" alt="Cases" className="nav-icon" />
      </div>
      <div className="nav-item">
        <img src="/image/Crash.svg" alt="Crash" className="nav-icon" />
      </div>
      <div className="nav-item center-item">
        <div className="baraban-container">
          <div className="baraban-glow"></div>
          <div className="baraban-pulse"></div>
          <img src="/image/Baraban.png" alt="Baraban" className="baraban-icon" />
        </div>
      </div>
      <div className="nav-item">
        <img src="/image/PvP.svg" alt="PvP" className="nav-icon" />
      </div>
      <div className="nav-item">
        <img src="/image/Upgrade.svg" alt="Upgrade" className="nav-icon" />
      </div>
    </nav>
  )
}

export default Navigation
