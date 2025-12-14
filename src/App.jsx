import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
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
import WheelPage from './components/WheelPage'
import Top20Page from './components/Top20Page'
import { CurrencyProvider } from './context/CurrencyContext'
import { useUser } from './context/UserContext'

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
  const { initUser, loading } = useUser()

  useEffect(() => {
    // 🧠 Telegram init data
    const tg = window.Telegram?.WebApp

    if (tg?.initDataUnsafe?.user) {
      const tgUser = tg.initDataUnsafe.user

      initUser({
        tg_id: String(tgUser.id),
        username: tgUser.username || `tg_${tgUser.id}`,
        firstname: tgUser.first_name || 'Guest',
        photo_url: tgUser.photo_url,
      })
    } else {
      // fallback для локальной разработки
      initUser({
        tg_id: 'local',
        username: 'localuser',
        firstname: 'Guest',
        photo_url: null,
      })
    }
  }, [])

  if (loading) return <div className="app">Loading...</div>

  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/crash" element={<CrashPage />} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="/wheel" element={<WheelPage />} />
          <Route path="/top-20" element={<Top20Page />} />
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  )
}

export default App
