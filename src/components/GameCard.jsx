import './GameCard.css'

function GameCard({ title, online }) {
  return (
    <div className="game-card">
      <div className="game-header">
        <span className="online-dot"></span>
        <span className="online-count">{online} ОНЛАЙН</span>
      </div>
      <div className="game-content">
        <h3 className="game-title">{title}</h3>
      </div>
    </div>
  )
}

export default GameCard
