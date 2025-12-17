import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useUser } from './UserContext'

const CurrencyContext = createContext(null)

/**
 * ⬇️ ВРЕМЕННЫЙ БАЗОВЫЙ БАЛАНС
 * позже заменишь на user.balance,
 * но ТОЛЬКО внутри компонента
 */


const STATIC_CURRENCIES = [
  { id: 'coins', icon: '/image/ton_symbol.svg' },
  { id: 'gems', icon: '/image/Coin-Icon-one.svg' },
  { id: 'stars', icon: '/image/Coin-Icon-two.svg' },
  { id: 'shields', icon: '/image/Coin-Icon-three.svg' },
]

export function CurrencyProvider({ children }) {


  const { user } = useUser()
  const BASE_BALANCE = user?.balance ?? 0

  const [rates, setRates] = useState({})
  const [selectedCurrency, setSelectedCurrency] = useState(STATIC_CURRENCIES[0])
  const [hasFreeSpins, setHasFreeSpins] = useState(true)

  // 🔹 получаем курсы с бэка
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/rates')
      .then(res => res.json())
      .then(setRates)
      .catch(() => setRates({}))
  }, [])

  // 🔹 формируем currencyOptions (ТОЧНО КАК У ТЕБЯ БЫЛО)
  const currencyOptions = useMemo(() => {
    return STATIC_CURRENCIES.map((c) => ({
      ...c,
      amount: rates[c.id]
        ? (BASE_BALANCE / rates[c.id]).toFixed(2)
        : '0.00',
    }))
  }, [rates])

  // 🔹 поддерживаем selectedCurrency актуальным
  const resolvedSelectedCurrency = useMemo(() => {
    return (
      currencyOptions.find(c => c.id === selectedCurrency.id) ||
      currencyOptions[0]
    )
  }, [currencyOptions, selectedCurrency.id])

  const value = useMemo(
    () => ({
      currencyOptions,
      selectedCurrency: resolvedSelectedCurrency,
      setSelectedCurrency,
      hasFreeSpins,
      setHasFreeSpins,
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
