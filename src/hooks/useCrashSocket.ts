import { useEffect, useRef, useState } from "react";

export function useCrashSocket(onMessage: (msg: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(
      "ws://127.0.0.1:8000/ws/crash?token=supersecret"
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 WS connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("WS EVENT:", msg);
        onMessage(msg);
      } catch {
        console.warn("Bad WS message", event.data);
      }
    };

    ws.onclose = () => {
      console.log("🔴 WS disconnected");
      setConnected(false);
    };

    return () => ws.close();
  }, []);

  const send = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { send, connected };
}
