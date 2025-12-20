import { apiFetch } from './client'

export async function roulettePaidSpin({ userId, amount, giftId }) {
    return apiFetch('/roulette/spin/paid', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        amount,
        gift_id: giftId,
      }),
    })
  }
  

  export async function rouletteFreeSpin({ userId }) {
    return apiFetch(`/roulette/spin/free?user_id=${userId}`, {
      method: 'POST',
    })
  }
  