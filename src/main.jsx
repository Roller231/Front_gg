import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { LiveFeedProvider } from './context/LiveFeedContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'


createRoot(document.getElementById('root')).render(
<LiveFeedProvider>
  <UserProvider>
    <CurrencyProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </CurrencyProvider>
  </UserProvider>
</LiveFeedProvider>
)
