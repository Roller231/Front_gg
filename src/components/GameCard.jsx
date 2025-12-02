import './GameCard.css'

function GameCard() {
  return (
    <div className="game-card">
      <div className="game-header">
        <span className="online-dot"></span>
        <span className="online-count">55 ОНЛАЙН</span>
      </div>
      <div className="game-content">
        <h3 className="game-title">РУЛЕТКА</h3>
      </div>
    </div>
  )
}

export default GameCard
