import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// ✅ Telegram WebApp init
const tg = window.Telegram?.WebApp

if (tg) {
  tg.ready()          // сообщаем Telegram, что приложение готово
  tg.expand()         // разворачиваем на весь экран
  tg.disableClosingConfirmation()
  tg.setHeaderColor('#0f172a') // опционально
  tg.setBackgroundColor('#0f172a') // опционально
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
