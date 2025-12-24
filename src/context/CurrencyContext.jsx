import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useUser } from './UserContext'

const CurrencyContext = createContext(null)

/* ===== STATIC CURRENCIES (UI only) ===== */
const STATIC_CURRENCIES = [
  { id: 'coins', icon: '/image/ton_symbol.svg' },
  { id: 'gems', icon: '/image/Coin-Icon-one.svg' },
  { id: 'stars', icon: '/image/Coin-Icon-two.svg' },
  { id: 'shields', icon: '/image/Coin-Icon-three.svg' },
]

export function CurrencyProvider({ children }) {  
  const { user } = useUser()

  // 🔹 базовый баланс ВСЕГДА в TON
  const BASE_BALANCE = Number(user?.balance) || 0

  const [rates, setRates] = useState({})
  const [selectedCurrency, setSelectedCurrency] = useState(STATIC_CURRENCIES[0])
  const [hasFreeSpins, setHasFreeSpins] = useState(true)

  /* ===== LOAD RATES FROM BACKEND ===== */
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/rates')
      .then((res) => res.json())
      .then(setRates)
      .catch(() => setRates({}))
  }, [])

  /* ===== CURRENCY OPTIONS (FOR HEADER DROPDOWN) ===== */
  const currencyOptions = useMemo(() => {
    return STATIC_CURRENCIES.map((c) => ({
      ...c,
      rate: rates[c.id] ?? null,
      amount:
        rates[c.id] != null
          ? (BASE_BALANCE / rates[c.id]).toFixed(2)
          : '—',
    }))
  }, [rates, BASE_BALANCE])

  /* ===== KEEP SELECTED CURRENCY IN SYNC ===== */
  const resolvedSelectedCurrency = useMemo(() => {
    return (
      currencyOptions.find((c) => c.id === selectedCurrency.id) ||
      currencyOptions[0]
    )
  }, [currencyOptions, selectedCurrency.id])

  /* ===== FORMAT ANY AMOUNT (TON → SELECTED CURRENCY) ===== */
  const formatAmount = (amount) => {
    if (!resolvedSelectedCurrency?.rate) return '—'
    return (Number(amount) / resolvedSelectedCurrency.rate).toFixed(2)
  }

  const value = useMemo(
    () => ({
      currencyOptions,
      selectedCurrency: resolvedSelectedCurrency,
      setSelectedCurrency,
      hasFreeSpins,
      setHasFreeSpins,
      formatAmount, // 👈 ВАЖНО
    }),
    [currencyOptions, resolvedSelectedCurrency, hasFreeSpins]
  )

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
