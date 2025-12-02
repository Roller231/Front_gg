import './App.css'
import Header from './components/Header'
import Banner from './components/Banner'
import TaskList from './components/TaskList'
import GameCard from './components/GameCard'
import Navigation from './components/Navigation'

function App() {
  return (
    <div className="app">
      <div className="top-bar">
        <span className="close-text">Close</span>
        <span className="chevron">⌄</span>
      </div>
      
      <Header />
      
      <main className="main-content">
        <Banner />
        <TaskList />
        <div className="games-section">
          <GameCard />
          <GameCard />
        </div>
      </main>
      
      <Navigation />
    </div>
  )
}

export default App
