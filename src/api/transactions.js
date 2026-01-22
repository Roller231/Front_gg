export async function getUserTransactions(userId) {
  const res = await fetch(`https://ggcat.org/transactions/user/${userId}`)
  if (!res.ok) throw new Error('Failed to load transactions')
  return res.json()
}

export async function createTransaction(data) {
  const res = await fetch('https://ggcat.org/transactions/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error('Failed to create transaction')
  }

  return res.json()
}
