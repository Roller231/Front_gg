import './Preloader.css'

function Preloader({ progress = 0 }) {
  return (
    <div className="preloader">
      <div className="preloader-content">
        <h1 className="preloader-title">
          <span className="preloader-gg">gg</span>
          <span className="preloader-cat">CAT</span>
        </h1>

        <div className="preloader-progress-container">
          <div
            className="preloader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="preloader-text">Loading...</p>
      </div>
    </div>
  )
}

export default Preloader
