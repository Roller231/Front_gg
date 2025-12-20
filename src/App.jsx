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
import PvPPage from './components/PvPPage'
import UpgradePage from './components/UpgradePage'
import Preloader from './components/Preloader'

import { CurrencyProvider } from './context/CurrencyContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { useUser } from './context/UserContext'
import { AppDataProvider, useAppData } from './context/AppDataContext'
import { LiveFeedProvider } from './context/LiveFeedContext'

/* ================= HOME ================= */

function HomePage() {
  const { t } = useLanguage()
  
  return (
    <div className="app home-page">
      <Header />

      <main className="main-content">
        <Banner />
        <TaskList />

        <div className="games-section">
          <GameCard title={t('home.roulette')} online={55} />
          <GameCard title={t('home.crash')} online={55} />
          <GameCard title={t('home.pvp')} online={597} />
          <GameCard title={t('home.upgrade')} online={597} />
          <GameCard title={t('home.wheel')} online={312} />
        </div>
      </main>

      <Navigation />
    </div>
  )
}

/* ================= APP ================= */

function AppContent() {
  const { loading: appDataLoading, progress, loadAllData } = useAppData()

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  if (appDataLoading) {
    return <Preloader progress={progress} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/crash" element={<CrashPage />} />
        <Route path="/partner" element={<PartnerPage />} />
        <Route path="/wheel" element={<WheelPage />} />
        <Route path="/top-20" element={<Top20Page />} />
        <Route path="/pvp" element={<PvPPage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  const { initUser, loading } = useUser()

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    // 👉 если открыто внутри Telegram
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      const tgUser = tg.initDataUnsafe.user

      console.log('Telegram user:', tgUser)

      // можно сразу подготовить UI
      tg.ready()
      
      tg.expand()

      initUser({
        tg_id: String(tgUser.id),
        username: tgUser.username || `tg_${tgUser.id}`,
        firstname: tgUser.first_name || 'Guest',
        photo_url: tgUser.photo_url || null,
      })
    } else {
      // 👉 fallback (браузер / dev)
      console.warn('Telegram WebApp not detected, using local user')

      initUser({
        tg_id: 'local',
        username: 'localuser',
        firstname: 'Guest',
        photo_url: null,
      })
    }
  }, [])

  // 🔄 пока идёт инициализация пользователя
  if (loading) {
    return <Preloader progress={0} />
  }

  return (
    <LanguageProvider>
      <CurrencyProvider>
        <AppDataProvider>
          <LiveFeedProvider>
            <AppContent />
          </LiveFeedProvider>
        </AppDataProvider>
      </CurrencyProvider>
    </LanguageProvider>
  )
}

export default App
