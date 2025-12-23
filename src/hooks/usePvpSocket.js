// hooks/usePvpSocket.js
import { useEffect, useRef, useState } from "react"
import { connectPvpWs, sendPvpBet } from "../api/pvpWs"

export function usePvpSocket({ onBots, onResult }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socketRef.current = connectPvpWs({
      onBotsUpdate: onBots,
      onResult: onResult,
      onError: () => setConnected(false),
    })

    socketRef.current.onopen = () => setConnected(true)
    socketRef.current.onclose = () => setConnected(false)

    return () => {
      socketRef.current?.close()
    }
  }, [])

  return {
    connected,
    sendBet: sendPvpBet,
  }
}
