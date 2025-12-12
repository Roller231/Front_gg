import { createContext, useContext, useMemo, useState } from 'react'

export const currencyOptions = [
  { id: 'coins', icon: '/image/Coin-Icon.svg', amount: '1.22' },
  { id: 'gems', icon: '/image/Coin-Icon-one.svg', amount: '800.000' },
  { id: 'stars', icon: '/image/Coin-Icon-two.svg', amount: '800.000' },
  { id: 'shields', icon: '/image/Coin-Icon-three.svg', amount: '90.00' },
]

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0])
  const [hasFreeSpins, setHasFreeSpins] = useState(true)

  const value = useMemo(
    () => ({
      currencyOptions,
      selectedCurrency,
      setSelectedCurrency,
      hasFreeSpins,
      setHasFreeSpins,
    }),
    [selectedCurrency, hasFreeSpins]
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
