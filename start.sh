#!/bin/bash
echo "[*] Starting ZeroDayCops ProxyChecker Server Suite..."

# Start Backend API in background
echo "[*] Starting FastAPI Backend on http://127.0.0.1:8000..."
python3 -m uvicorn backend_api.main:app --port 8000 --host 0.0.0.0 &
BACKEND_PID=$!

# Start Frontend Next.js app
echo "[*] Starting Next.js Frontend Web Dashboard..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "[+] Backend API: http://127.0.0.1:8000"
echo "[+] Frontend Dashboard: http://localhost:3000"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
