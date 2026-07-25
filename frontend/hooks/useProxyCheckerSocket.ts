import { useEffect, useState, useRef } from "react";
import { DashboardFrame, SessionSummary } from "../lib/types";
import { API_BASE } from "../lib/api";

export function useProxyCheckerSocket(sessionId: string | null) {
  const [frame, setFrame] = useState<DashboardFrame | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Convert http/https API_BASE to ws/wss
    const wsBase = API_BASE.replace(/^http/, "ws");
    const wsUrl = `${wsBase}/ws/sessions/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "dashboard_frame") {
          setFrame(data);
        } else if (data.type === "session_complete") {
          setSummary(data.summary);
        }
      } catch (err) {
        console.error("Failed to parse WS payload", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  return { frame, summary, isConnected };
}
