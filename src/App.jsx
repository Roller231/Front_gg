import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Banner from './components/Banner'
import TaskList from './components/TaskList'
import GameCard from './components/GameCard'
import Navigation from './components/Navigation'
import ProfilePage from './components/ProfilePage'
import CrashPage from './components/CrashPage'

function HomePage() {
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
      
      <Navigation activePage="cases" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/crash" element={<CrashPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
