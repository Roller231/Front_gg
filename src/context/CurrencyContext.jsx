import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from './UserContext'

const CurrencyContext = createContext(null)
export const useCurrency = () => useContext(CurrencyContext)

export function CurrencyProvider({ children }) {
  const { user } = useUser()
  const [rates, setRates] = useState({})
  const [selectedCurrency, setSelectedCurrency] = useState({
    id: 'USDT',
    icon: '/image/usdt.svg',
  })
  const [hasFreeSpins, setHasFreeSpins] = useState(false)

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/rates')
      .then(res => res.json())
      .then(setRates)
      .catch(console.error)
  }, [])

  const getConvertedBalance = () => {
    if (!user) return '0.00'

    if (selectedCurrency.id === 'USDT') {
      return user.balance.toFixed(2)
    }

    if (!rates[selectedCurrency.id]) return '0.00'

    return (user.balance / rates[selectedCurrency.id]).toFixed(6)
  }

  const balance = getConvertedBalance()

  const safeBalance = user?.balance ?? 0

  const currencyOptions = [
    {
      id: 'USDT',
      icon: '/image/usdt.svg',
      amount: safeBalance.toFixed(2),
    },
    {
      id: 'TON',
      icon: '/image/ton.svg',
      amount: rates.TON ? (safeBalance / rates.TON).toFixed(2) : '0.00',
    },
    {
      id: 'BTC',
      icon: '/image/btc.svg',
      amount: rates.BTC ? (safeBalance / rates.BTC).toFixed(6) : '0.000000',
    },
  ]

  return (
    <CurrencyContext.Provider
      value={{
        currencyOptions,
        selectedCurrency: { ...selectedCurrency, amount: balance },
        setSelectedCurrency,
        hasFreeSpins,
        setHasFreeSpins,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}
