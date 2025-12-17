import { createContext, useContext, useState } from 'react'
import * as usersApi from '../api/users'

const UserContext = createContext(null)

export const useUser = () => useContext(UserContext)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const initUser = async ({ tg_id, username, firstname, photo_url }) => {
    try {
      const existingUser = await usersApi.getUserByTgId(tg_id)
      setUser(existingUser)
    } catch (err) {
      if (err.message === 'User not found') {
        const newUser = await usersApi.createUser({
          tg_id,
          username,
          firstname,
          url_image: photo_url || null,
        })
        setUser(newUser)
      } else {
        console.error('User init error:', err)
      }
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        initUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
