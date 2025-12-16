import { useMemo } from 'react'
import './Top20Page.css'
import Header from './Header'
import Navigation from './Navigation'
import { useCurrency } from '../context/CurrencyContext'
import { useLanguage } from '../context/LanguageContext'

const currentUser = {
  id: 'me',
  name: 'Иван Иванов',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
}

function formatNumber(value) {
  return new Intl.NumberFormat('ru-RU').format(value).replaceAll('\u00A0', ' ')
}

function Top20Page() {
  const { selectedCurrency } = useCurrency()
  const { t } = useLanguage()

  const players = useMemo(() => {
    const result = Array.from({ length: 20 }, (_, i) => {
      const rank = i + 1
      return {
        id: rank,
        rank,
        name: 'UserName',
        avatar: `/image/ava${(i % 4) + 1}.png`,
        score: 12000 - i * 1000,
      }
    })

    const youRank = 9
    result[youRank - 1] = {
      id: currentUser.id,
      rank: youRank,
      name: currentUser.name,
      avatar: currentUser.avatar,
      score: 5000,
      isYou: true,
    }

    return result
  }, [])

  return (
    <div className="app top20-page">
      <Header />

      <main className="main-content top20-content">
        <div className="top20-card">
          <div className="top20-title">{t('top20.title')}</div>

          <div className="top20-list">
            {players.map((player) => {
              const placeClass =
                player.rank === 1
                  ? 'top20-row--gold'
                  : player.rank === 2
                    ? 'top20-row--silver'
                    : player.rank === 3
                      ? 'top20-row--bronze'
                      : ''

              return (
                <div key={player.id} className={`top20-row ${placeClass} ${player.isYou ? 'top20-row--you' : ''}`.trim()}>
                  <div className="top20-left">
                    <div className="top20-rank">{player.rank}</div>
                    <div className="top20-avatar">
                      <img src={player.avatar} alt={player.name} />
                    </div>
                    <div className="top20-name">{player.name}</div>
                  </div>

                  <div className="top20-right">
                    {player.isYou && <span className="top20-you">{t('common.you')}</span>}
                    <div className="top20-score">{formatNumber(player.score)}</div>
                    <img
                      className="top20-currency"
                      src={selectedCurrency.icon}
                      alt={selectedCurrency.id}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  )
}

export default Top20Page
