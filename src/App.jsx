import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Banner from './components/Banner'
import TaskList from './components/TaskList'
import GameCard from './components/GameCard'
import Navigation from './components/Navigation'
import ProfilePage from './components/ProfilePage'
import CrashPage from './components/CrashPage'
import CasesPage from './components/CasesPage'
import PartnerPage from './components/PartnerPage'
import { CurrencyProvider } from './context/CurrencyContext'

function HomePage() {
  return (
    <div className="app home-page">
      
      <Header />
      
      <main className="main-content">
        <Banner />
        <TaskList />
        <div className="games-section">
          <GameCard title="РУЛЕТКА" online={55} />
          <GameCard title="РУЛЕТКА" online={55} />
          <GameCard title="PvP" online={597} />
          <GameCard title="Upgrade" online={597} />
        </div>
      </main>
      
      <Navigation />
    </div>
  )
}

function App() {
  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/crash" element={<CrashPage />} />
          <Route path="/partner" element={<PartnerPage />} />
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  )
}

export default App
