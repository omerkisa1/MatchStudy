#!/bin/bash

# PORT 8000 zaten kullanılıyorsa kapat (macOS uyumlu)
PID=$(lsof -ti tcp:8000)
if [ -n "$PID" ]; then
  echo "⚠️ Port 8000 in use. Killing PID $PID..."
  kill -9 $PID
fi

# BACKEND başlat
echo "Starting FastAPI backend..."
cd backend
source ../venv/bin/activate
python -m uvicorn main:app --reload &
BACKEND_PID=$!

# FRONTEND başlat
echo "Starting Vue frontend..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

# Her iki PID'i dinle, biri kapanırsa diğerini de durdur
trap "echo ' Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID" SIGINT

wait
